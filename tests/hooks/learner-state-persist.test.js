'use strict';

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const HOOK_SCRIPT = path.resolve(__dirname, '../../scripts/hooks/learner-state-persist.js');

// --- Helpers ---

let tmpDir;

function setupTmpDir() {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mdh-state-persist-test-'));
}

function teardownTmpDir() {
  if (tmpDir && fs.existsSync(tmpDir)) {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
  tmpDir = null;
}

function createProfile(overrides = {}) {
  const { createDefaultProfile } = require('../../scripts/lib/learner-profile');
  const origDir = process.env.MDH_STATE_DIR;
  let profile;
  try {
    process.env.MDH_STATE_DIR = tmpDir;
    profile = createDefaultProfile();
  } finally {
    process.env.MDH_STATE_DIR = origDir;
  }

  const merged = applyOverrides(profile, overrides);
  fs.writeFileSync(
    path.join(tmpDir, 'learner-profile.json'),
    JSON.stringify(merged, null, 2),
    'utf-8'
  );
  return merged;
}

function applyOverrides(base, overrides) {
  const result = JSON.parse(JSON.stringify(base));
  for (const [key, value] of Object.entries(overrides)) {
    if (value && typeof value === 'object' && !Array.isArray(value) && result[key]) {
      result[key] = applyOverrides(result[key], value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

function loadPersistedProfile() {
  const profilePath = path.join(tmpDir, 'learner-profile.json');
  if (!fs.existsSync(profilePath)) return null;
  return JSON.parse(fs.readFileSync(profilePath, 'utf-8'));
}

function runHook(env = {}) {
  const result = spawnSync('node', [HOOK_SCRIPT], {
    env: {
      ...process.env,
      MDH_STATE_DIR: tmpDir,
      ...env,
    },
    timeout: 10000,
    encoding: 'utf-8',
  });
  return {
    stdout: result.stdout || '',
    stderr: result.stderr || '',
    exitCode: result.status,
    error: result.error,
  };
}

function parseStdout(result) {
  if (!result.stdout.trim()) return null;
  return JSON.parse(result.stdout.trim());
}

// --- Tests ---

describe('learner-state-persist hook script', () => {
  beforeEach(setupTmpDir);
  afterEach(teardownTmpDir);

  describe('basic behavior', () => {
    it('script file exists', () => {
      assert.ok(fs.existsSync(HOOK_SCRIPT), `Hook script not found at ${HOOK_SCRIPT}`);
    });

    it('exits 0 with profile', () => {
      createProfile();
      const result = runHook();
      assert.equal(result.exitCode, 0, `Expected exit 0, got ${result.exitCode}. stderr: ${result.stderr}`);
    });

    it('exits 0 without profile', () => {
      // No profile — nothing to persist
      const result = runHook();
      assert.equal(result.exitCode, 0, 'Should exit 0 when no profile exists');
    });

    it('outputs valid JSON when profile exists', () => {
      createProfile();
      const result = runHook();
      assert.ok(result.stdout.trim().length > 0, 'Hook should produce stdout output');
      assert.doesNotThrow(() => JSON.parse(result.stdout.trim()), 'stdout should be valid JSON');
    });

    it('output has type mdh_session_saved', () => {
      createProfile();
      const output = parseStdout(runHook());
      assert.equal(output.type, 'mdh_session_saved');
    });
  });

  describe('session entry creation', () => {
    it('adds a session entry to profile', () => {
      createProfile();
      runHook();
      const profile = loadPersistedProfile();
      assert.ok(profile.session_history.length > 0, 'Should add session entry');
    });

    it('session entry has date as ISO string', () => {
      createProfile();
      runHook();
      const profile = loadPersistedProfile();
      const entry = profile.session_history[profile.session_history.length - 1];
      assert.ok(entry.date, 'Session entry must have date');
      assert.doesNotThrow(() => new Date(entry.date), 'Date should be parseable');
    });

    it('session entry has phase', () => {
      createProfile({ settings: { phase: 2 } });
      runHook();
      const profile = loadPersistedProfile();
      const entry = profile.session_history[profile.session_history.length - 1];
      assert.equal(entry.phase, 2);
    });

    it('session entry has duration_minutes', () => {
      createProfile();
      runHook();
      const profile = loadPersistedProfile();
      const entry = profile.session_history[profile.session_history.length - 1];
      assert.ok('duration_minutes' in entry, 'Session entry must have duration_minutes');
      assert.ok(typeof entry.duration_minutes === 'number', 'duration_minutes must be a number');
    });

    it('session entry has dimension_signals', () => {
      createProfile();
      runHook();
      const profile = loadPersistedProfile();
      const entry = profile.session_history[profile.session_history.length - 1];
      assert.ok(entry.dimension_signals, 'Session entry must have dimension_signals');
    });
  });

  describe('duration calculation', () => {
    it('calculates duration from last session date', () => {
      // Set last session to 30 minutes ago
      const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
      createProfile({
        session_history: [
          { date: thirtyMinAgo, duration_minutes: 20 },
        ],
      });
      runHook();
      const profile = loadPersistedProfile();
      const lastEntry = profile.session_history[profile.session_history.length - 1];
      // Duration should be approximately 30 minutes (±5 for CI/slow hosts)
      assert.ok(lastEntry.duration_minutes >= 25 && lastEntry.duration_minutes <= 35,
        `Duration should be ~30min, got ${lastEntry.duration_minutes}`);
    });

    it('duration is 0 when no previous session', () => {
      createProfile(); // No session history
      runHook();
      const profile = loadPersistedProfile();
      const entry = profile.session_history[profile.session_history.length - 1];
      assert.equal(entry.duration_minutes, 0, 'Duration should be 0 with no previous session');
    });

    it('duration is 0 when last session is >24 hours ago (sanity check)', () => {
      const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
      createProfile({
        session_history: [
          { date: twoDaysAgo, duration_minutes: 60 },
        ],
      });
      runHook();
      const profile = loadPersistedProfile();
      const lastEntry = profile.session_history[profile.session_history.length - 1];
      assert.equal(lastEntry.duration_minutes, 0,
        'Duration should be 0 when last session >24h ago');
    });
  });

  describe('signal accumulator mapping', () => {
    it('maps positive accumulator values to positive signals', () => {
      createProfile({
        signal_accumulator: {
          research: 0.5,
          planning: 0.0,
          implementation: 1.2,
          review: 0.0,
          security: 0.0,
          verification: 0.0,
          git_workflow: 0.0,
          architecture: 0.0,
          orchestration: 0.0,
        },
      });
      runHook();
      const profile = loadPersistedProfile();
      const entry = profile.session_history[profile.session_history.length - 1];
      assert.equal(entry.dimension_signals.research.positive, 0.5);
      assert.equal(entry.dimension_signals.implementation.positive, 1.2);
    });

    it('maps negative accumulator values to negative signals', () => {
      createProfile({
        signal_accumulator: {
          research: -0.3,
          planning: 0.0,
          implementation: 0.0,
          review: 0.0,
          security: 0.0,
          verification: 0.0,
          git_workflow: 0.0,
          architecture: 0.0,
          orchestration: 0.0,
        },
      });
      runHook();
      const profile = loadPersistedProfile();
      const entry = profile.session_history[profile.session_history.length - 1];
      assert.equal(entry.dimension_signals.research.negative, 0.3);
      assert.equal(entry.dimension_signals.research.positive, 0);
    });
  });

  describe('output fields', () => {
    it('output includes date', () => {
      createProfile();
      const output = parseStdout(runHook());
      assert.ok(output.date, 'Output should include date');
      assert.doesNotThrow(() => new Date(output.date), 'Date should be parseable');
    });

    it('output includes duration_minutes', () => {
      createProfile();
      const output = parseStdout(runHook());
      assert.ok('duration_minutes' in output, 'Output should include duration_minutes');
    });
  });

  describe('no output without profile', () => {
    it('produces no stdout when no profile', () => {
      const result = runHook();
      assert.equal(result.stdout.trim(), '', 'Should produce no output without profile');
    });
  });

  describe('error handling', () => {
    it('exits 0 on corrupted profile', () => {
      fs.writeFileSync(
        path.join(tmpDir, 'learner-profile.json'),
        '{broken json}}}',
        'utf-8'
      );
      const result = runHook();
      assert.equal(result.exitCode, 0, 'Must exit 0 on error (best-effort)');
    });
  });

  describe('performance', () => {
    it('completes within 5 seconds', () => {
      createProfile();
      const start = Date.now();
      const result = runHook();
      const elapsed = Date.now() - start;
      assert.ok(elapsed < 5000, `Hook took ${elapsed}ms, must complete within 5000ms`);
      assert.equal(result.exitCode, 0);
    });
  });
});
