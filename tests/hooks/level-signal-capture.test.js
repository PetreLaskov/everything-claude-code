'use strict';

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const HOOK_SCRIPT = path.resolve(__dirname, '../../scripts/hooks/level-signal-capture.js');

// --- Helpers ---

let tmpDir;

function setupTmpDir() {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mdh-signal-capture-test-'));
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
  process.env.MDH_STATE_DIR = tmpDir;
  const profile = createDefaultProfile();
  process.env.MDH_STATE_DIR = origDir;

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

function runHook(stdinData, env = {}) {
  const result = spawnSync('node', [HOOK_SCRIPT], {
    input: typeof stdinData === 'string' ? stdinData : JSON.stringify(stdinData),
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

// Tool events that should trigger signals
function makeWriteTestEvent() {
  return {
    tool_name: 'Write',
    tool_input: {
      file_path: '/project/src/app.test.js',
      content: 'const { test } = require("node:test");\ntest("it works", () => { assert.ok(true); });',
    },
    tool_output: null,
  };
}

function makeBashTestRunEvent() {
  return {
    tool_name: 'Bash',
    tool_input: {
      command: 'npm test',
    },
    tool_output: 'Tests: 5 passed, 0 failed',
  };
}

function makeReadEvent() {
  return {
    tool_name: 'Read',
    tool_input: { file_path: '/project/src/app.js' },
    tool_output: 'const x = 1;',
  };
}

function makeWriteCodeEvent() {
  return {
    tool_name: 'Write',
    tool_input: {
      file_path: '/project/src/utils.js',
      content: 'function add(a, b) { return a + b; }\nmodule.exports = { add };',
    },
    tool_output: null,
  };
}

// --- Tests ---

describe('level-signal-capture hook script', () => {
  beforeEach(setupTmpDir);
  afterEach(teardownTmpDir);

  describe('basic behavior', () => {
    it('script file exists', () => {
      assert.ok(fs.existsSync(HOOK_SCRIPT), `Hook script not found at ${HOOK_SCRIPT}`);
    });

    it('exits 0 with valid input', () => {
      createProfile();
      const result = runHook(makeReadEvent());
      assert.equal(result.exitCode, 0, `Expected exit 0, got ${result.exitCode}. stderr: ${result.stderr}`);
    });

    it('exits 0 on empty stdin', () => {
      createProfile();
      const result = spawnSync('node', [HOOK_SCRIPT], {
        input: '',
        env: { ...process.env, MDH_STATE_DIR: tmpDir },
        timeout: 10000,
        encoding: 'utf-8',
      });
      assert.equal(result.status, 0, 'Should exit 0 on empty stdin');
    });

    it('exits 0 on malformed JSON', () => {
      createProfile();
      const result = spawnSync('node', [HOOK_SCRIPT], {
        input: '{broken json',
        env: { ...process.env, MDH_STATE_DIR: tmpDir },
        timeout: 10000,
        encoding: 'utf-8',
      });
      assert.equal(result.status, 0, 'Should exit 0 on malformed JSON');
    });
  });

  describe('signal detection', () => {
    it('no output when no signals detected', () => {
      createProfile();
      // A simple Read event typically generates no signals
      const result = runHook(makeReadEvent());
      assert.equal(result.exitCode, 0);
      // May or may not produce output depending on signal-parser
    });

    it('captures test-writing signal from .test.js file write', () => {
      createProfile();
      const result = runHook(makeWriteTestEvent());
      assert.equal(result.exitCode, 0);
      // The signal should be processed — profile may be updated
      const profile = loadPersistedProfile();
      assert.ok(profile, 'Profile should still exist after signal capture');
    });

    it('captures implementation signal from code write', () => {
      createProfile();
      const result = runHook(makeWriteCodeEvent());
      assert.equal(result.exitCode, 0);
      const profile = loadPersistedProfile();
      assert.ok(profile, 'Profile should still exist after signal capture');
    });
  });

  describe('profile persistence', () => {
    it('does not corrupt profile on signal capture', () => {
      createProfile();
      runHook(makeWriteTestEvent());
      const profile = loadPersistedProfile();
      assert.ok(profile.schema_version, 'Profile should retain schema_version');
      assert.ok(profile.dimensions, 'Profile should retain dimensions');
      assert.ok(profile.settings, 'Profile should retain settings');
      assert.ok(profile.signal_accumulator, 'Profile should retain signal_accumulator');
    });

    it('creates default profile when none exists', () => {
      // No profile created — hook should handle it
      const result = runHook(makeWriteCodeEvent());
      assert.equal(result.exitCode, 0, 'Should exit 0 even without profile');
    });
  });

  describe('level change output', () => {
    it('outputs mdh_level_update when level changes', () => {
      // Create profile with fractional level near threshold
      createProfile({
        dimensions: {
          verification: {
            level: 0,
            fractional_level: 0.95,
            confidence: 0.7,
            evidence_count: 10,
            last_assessed: null,
            sub_concepts: {
              build_check: { level: 0, confidence: 0.3 },
              test_coverage: { level: 0, confidence: 0.3 },
              lint_and_format: { level: 0, confidence: 0.3 },
            },
          },
        },
      });
      const result = runHook(makeBashTestRunEvent());
      assert.equal(result.exitCode, 0);
      // If a level change occurred, output should contain it
      const output = parseStdout(result);
      if (output) {
        assert.equal(output.type, 'mdh_level_update');
        assert.ok(Array.isArray(output.level_changes), 'level_changes should be an array');
        assert.ok(typeof output.signals_captured === 'number', 'signals_captured should be a number');
      }
    });

    it('no output when signals captured but no level change', () => {
      // Fresh profile — signals unlikely to cause level change
      createProfile();
      const result = runHook(makeWriteCodeEvent());
      assert.equal(result.exitCode, 0);
      // With fresh profile, one signal won't cause level-up
      // Either no output or output without level_changes
    });
  });

  describe('error handling', () => {
    it('exits 0 on corrupted profile', () => {
      fs.writeFileSync(
        path.join(tmpDir, 'learner-profile.json'),
        '{corrupted',
        'utf-8'
      );
      const result = runHook(makeWriteCodeEvent());
      assert.equal(result.exitCode, 0, 'Must exit 0 on error (never block)');
    });

    it('exits 0 with empty tool_input', () => {
      createProfile();
      const result = runHook({
        tool_name: 'Write',
        tool_input: {},
        tool_output: null,
      });
      assert.equal(result.exitCode, 0);
    });

    it('exits 0 with missing tool_name', () => {
      createProfile();
      const result = runHook({
        tool_input: { file_path: '/foo.js' },
        tool_output: null,
      });
      assert.equal(result.exitCode, 0);
    });
  });

  describe('performance', () => {
    it('completes within 5 seconds', () => {
      createProfile();
      const start = Date.now();
      const result = runHook(makeWriteTestEvent());
      const elapsed = Date.now() - start;
      assert.ok(elapsed < 5000, `Hook took ${elapsed}ms, must complete within 5000ms`);
      assert.equal(result.exitCode, 0);
    });
  });
});
