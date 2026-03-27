'use strict';

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const HOOK_SCRIPT = path.resolve(__dirname, '../../scripts/hooks/session-start-loader.js');

// --- Helpers ---

let tmpDir;

function setupTmpDir() {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mdh-session-start-test-'));
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

describe('session-start-loader hook script', () => {
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

    it('exits 0 without profile (creates default)', () => {
      const result = runHook();
      assert.equal(result.exitCode, 0, `Expected exit 0, got ${result.exitCode}. stderr: ${result.stderr}`);
    });

    it('outputs valid JSON', () => {
      createProfile();
      const result = runHook();
      assert.ok(result.stdout.trim().length > 0, 'Hook should produce stdout output');
      assert.doesNotThrow(() => JSON.parse(result.stdout.trim()), 'stdout should be valid JSON');
    });

    it('output has type mdh_session_context', () => {
      createProfile();
      const output = parseStdout(runHook());
      assert.equal(output.type, 'mdh_session_context');
    });
  });

  describe('context fields', () => {
    it('includes phase and phase_label', () => {
      createProfile({ settings: { phase: 2 } });
      const output = parseStdout(runHook());
      assert.equal(output.phase, 2);
      assert.equal(output.phase_label, 'Co-Pilot');
    });

    it('includes verbosity', () => {
      createProfile({ settings: { verbosity: 4 } });
      const output = parseStdout(runHook());
      assert.equal(output.verbosity, 4);
    });

    it('includes teaching_mode', () => {
      createProfile({ settings: { teaching_mode: 'socratic' } });
      const output = parseStdout(runHook());
      assert.equal(output.teaching_mode, 'socratic');
    });

    it('includes dimension summary with level, label, fractional', () => {
      createProfile({
        dimensions: {
          implementation: { level: 3, fractional_level: 3.4 },
        },
      });
      const output = parseStdout(runHook());
      assert.ok(output.dimensions, 'Output must include dimensions');
      assert.ok(output.dimensions.implementation, 'Must include implementation dimension');
      assert.equal(output.dimensions.implementation.level, 3);
      assert.equal(output.dimensions.implementation.label, 'Competent');
      assert.equal(output.dimensions.implementation.fractional, 3.4);
    });

    it('includes all 9 dimensions', () => {
      createProfile();
      const output = parseStdout(runHook());
      const expectedDims = [
        'research', 'planning', 'implementation', 'review',
        'security', 'verification', 'git_workflow', 'architecture', 'orchestration',
      ];
      for (const dim of expectedDims) {
        assert.ok(output.dimensions[dim], `Missing dimension: ${dim}`);
      }
    });

    it('includes user info', () => {
      createProfile({
        user: { name: 'TestUser', domain: 'marketing' },
      });
      const output = parseStdout(runHook());
      assert.ok(output.user, 'Output must include user');
      assert.equal(output.user.name, 'TestUser');
      assert.equal(output.user.domain, 'marketing');
    });
  });

  describe('active project', () => {
    it('null when no projects', () => {
      createProfile();
      const output = parseStdout(runHook());
      assert.equal(output.active_project, null);
    });

    it('includes active project details', () => {
      createProfile({
        projects: [
          { name: 'MyApp', type: 'web_app', status: 'active' },
        ],
      });
      const output = parseStdout(runHook());
      assert.ok(output.active_project, 'Should include active project');
      assert.equal(output.active_project.name, 'MyApp');
      assert.equal(output.active_project.type, 'web_app');
      assert.equal(output.active_project.status, 'active');
    });

    it('null when all projects completed', () => {
      createProfile({
        projects: [
          { name: 'OldApp', type: 'api', status: 'completed' },
        ],
      });
      const output = parseStdout(runHook());
      assert.equal(output.active_project, null);
    });
  });

  describe('last session', () => {
    it('null when no session history', () => {
      createProfile();
      const output = parseStdout(runHook());
      assert.equal(output.last_session, null);
    });

    it('includes last session date and duration', () => {
      const sessionDate = '2026-03-20T10:00:00.000Z';
      createProfile({
        session_history: [
          { date: sessionDate, duration_minutes: 45 },
        ],
      });
      const output = parseStdout(runHook());
      assert.ok(output.last_session, 'Should include last session');
      assert.equal(output.last_session.date, sessionDate);
      assert.equal(output.last_session.duration_minutes, 45);
    });
  });

  describe('default values', () => {
    it('defaults to phase 0 Discovery when no profile', () => {
      const output = parseStdout(runHook());
      assert.equal(output.phase, 0);
      assert.equal(output.phase_label, 'Discovery');
    });

    it('defaults to verbosity 3', () => {
      const output = parseStdout(runHook());
      assert.equal(output.verbosity, 3);
    });

    it('defaults to directive teaching mode', () => {
      const output = parseStdout(runHook());
      assert.equal(output.teaching_mode, 'directive');
    });
  });

  describe('error handling', () => {
    it('recovers from corrupted profile by creating fresh default', () => {
      // Write invalid JSON to profile path
      fs.writeFileSync(
        path.join(tmpDir, 'learner-profile.json'),
        '{not valid json',
        'utf-8'
      );
      const result = runHook();
      assert.equal(result.exitCode, 0, 'Must exit 0 even on error');
      const output = parseStdout(result);
      assert.equal(output.type, 'mdh_session_context');
      assert.equal(output.phase, 0, 'Should default to phase 0');
      assert.equal(output.teaching_mode, 'directive', 'Should use default teaching mode');
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
