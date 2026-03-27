'use strict';

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const HOOK_SCRIPT = path.resolve(__dirname, '../../scripts/hooks/guardrail-advisor.js');

// --- Helpers ---

let tmpDir;

function setupTmpDir() {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mdh-guardrail-test-'));
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

function makeWriteEvent(filePath, content) {
  return {
    tool_name: 'Write',
    tool_input: {
      file_path: filePath || '/project/src/app.js',
      content: content || 'const x = 1;\nconst y = 2;',
    },
  };
}

function makeEditEvent(filePath, newStr) {
  return {
    tool_name: 'Edit',
    tool_input: {
      file_path: filePath || '/project/src/app.js',
      old_string: 'placeholder',
      new_string: newStr || 'const x = 1;',
    },
  };
}

// --- Tests ---

describe('guardrail-advisor hook script', () => {
  beforeEach(setupTmpDir);
  afterEach(teardownTmpDir);

  describe('basic behavior', () => {
    it('script file exists', () => {
      assert.ok(fs.existsSync(HOOK_SCRIPT), `Hook script not found at ${HOOK_SCRIPT}`);
    });

    it('exits 0 always (warn-only policy)', () => {
      createProfile();
      const result = runHook(makeWriteEvent());
      assert.equal(result.exitCode, 0);
    });

    it('exits 0 on empty stdin', () => {
      createProfile();
      const result = spawnSync('node', [HOOK_SCRIPT], {
        input: '',
        env: { ...process.env, MDH_STATE_DIR: tmpDir },
        timeout: 10000,
        encoding: 'utf-8',
      });
      assert.equal(result.status, 0);
    });

    it('exits 0 on malformed JSON', () => {
      createProfile();
      const result = spawnSync('node', [HOOK_SCRIPT], {
        input: '{not json',
        env: { ...process.env, MDH_STATE_DIR: tmpDir },
        timeout: 10000,
        encoding: 'utf-8',
      });
      assert.equal(result.status, 0);
    });

    it('no output for clean content', () => {
      createProfile();
      const result = runHook(makeWriteEvent('/project/src/utils.js', 'function add(a, b) { return a + b; }'));
      const output = parseStdout(result);
      assert.equal(output, null, 'Clean content should produce no warnings');
    });
  });

  describe('secret detection', () => {
    it('detects api_key pattern', () => {
      createProfile();
      const content = 'const config = { api_key: "sk-abc123def456ghi789" };';
      const result = runHook(makeWriteEvent(null, content));
      const output = parseStdout(result);
      assert.ok(output, 'Should produce warning for API key');
      assert.equal(output.type, 'mdh_guardrail_advice');
      assert.ok(output.warnings.length > 0, 'Should have at least one warning');
      assert.ok(output.warnings.some(w => w.severity === 'high'), 'Secret warning should be high severity');
    });

    it('detects AWS access key pattern (AKIA...)', () => {
      createProfile();
      const content = 'const awsKey = "AKIAIOSFODNN7EXAMPLE";';
      const result = runHook(makeWriteEvent(null, content));
      const output = parseStdout(result);
      assert.ok(output, 'Should detect AWS key pattern');
      assert.ok(output.warnings.some(w => w.severity === 'high'));
    });

    it('detects GitHub personal access token (ghp_)', () => {
      createProfile();
      const content = 'const token = "ghp_1234567890abcdefghijklmnopqrstuvwxyz";';
      const result = runHook(makeWriteEvent(null, content));
      const output = parseStdout(result);
      assert.ok(output, 'Should detect GitHub PAT');
      assert.ok(output.warnings.some(w => w.severity === 'high'));
    });

    it('detects Slack token pattern (xoxb-)', () => {
      createProfile();
      const content = 'const slack = "xoxb-123456789012-1234567890123-abcdefghijklm";';
      const result = runHook(makeWriteEvent(null, content));
      const output = parseStdout(result);
      assert.ok(output, 'Should detect Slack token');
      assert.ok(output.warnings.some(w => w.severity === 'high'));
    });

    it('detects private key block', () => {
      createProfile();
      const content = '-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEA...\n-----END RSA PRIVATE KEY-----';
      const result = runHook(makeWriteEvent(null, content));
      const output = parseStdout(result);
      assert.ok(output, 'Should detect private key');
      assert.ok(output.warnings.some(w => w.severity === 'high'));
    });

    it('detects secret in Edit new_string', () => {
      createProfile();
      const result = runHook(makeEditEvent(null, 'const secret: "sk-proj-abcdefghij1234567890"'));
      const output = parseStdout(result);
      assert.ok(output, 'Should detect secret in edit content');
    });

    it('does not flag short values (< 8 chars)', () => {
      createProfile();
      const content = 'const key = "short";';
      const result = runHook(makeWriteEvent(null, content));
      const output = parseStdout(result);
      // Short values should not trigger the api_key pattern (requires 8+ chars)
      // This tests the {8,} quantifier in the regex
      assert.equal(output, null, 'Short values should not trigger secret detection');
    });
  });

  describe('large file detection', () => {
    it('warns on file with >800 lines', () => {
      createProfile();
      const lines = Array(850).fill('const x = 1;').join('\n');
      const result = runHook(makeWriteEvent(null, lines));
      const output = parseStdout(result);
      assert.ok(output, 'Should warn on large file');
      assert.ok(output.warnings.some(w =>
        w.severity === 'medium' && w.message.includes('Large file')
      ), 'Should have medium severity large file warning');
    });

    it('no warning for file with <=800 lines', () => {
      createProfile();
      const lines = Array(800).fill('const x = 1;').join('\n');
      const result = runHook(makeWriteEvent(null, lines));
      const output = parseStdout(result);
      // Should be null (no warnings) — 800 lines is not > 800
      assert.equal(output, null, 'Exactly 800 lines should not trigger warning');
    });

    it('includes line count in warning message', () => {
      createProfile();
      const lines = Array(900).fill('line').join('\n');
      const result = runHook(makeWriteEvent(null, lines));
      const output = parseStdout(result);
      const warning = output.warnings.find(w => w.message.includes('Large file'));
      assert.ok(warning.message.includes('900'), 'Warning should include actual line count');
    });
  });

  describe('sensitive file path detection', () => {
    it('warns on .env file', () => {
      createProfile();
      const result = runHook(makeWriteEvent('/project/.env', 'DB_HOST=localhost'));
      const output = parseStdout(result);
      assert.ok(output, 'Should warn on .env file');
      assert.ok(output.warnings.some(w => w.severity === 'high'));
    });

    it('warns on .env.local file', () => {
      createProfile();
      const result = runHook(makeWriteEvent('/project/.env.local', 'API_KEY=test'));
      const output = parseStdout(result);
      assert.ok(output, 'Should warn on .env.local');
    });

    it('warns on secrets.json file', () => {
      createProfile();
      const result = runHook(makeWriteEvent('/project/config/secrets.json', '{}'));
      const output = parseStdout(result);
      assert.ok(output, 'Should warn on secrets.json');
    });

    it('warns on secret.yaml file', () => {
      createProfile();
      const result = runHook(makeWriteEvent('/project/secret.yaml', 'key: value'));
      const output = parseStdout(result);
      assert.ok(output, 'Should warn on secret.yaml');
    });

    it('does not warn on normal file paths', () => {
      createProfile();
      const result = runHook(makeWriteEvent('/project/src/config.js', 'module.exports = {};'));
      const output = parseStdout(result);
      assert.equal(output, null, 'Normal paths should not trigger warning');
    });
  });

  describe('multiple warnings', () => {
    it('reports multiple warnings in single event', () => {
      createProfile();
      // Large file + secret
      const lines = Array(850).fill('const x = 1;');
      lines[0] = 'const api_key = "sk-proj-abcdefghijklmnop1234";';
      const result = runHook(makeWriteEvent('/project/.env', lines.join('\n')));
      const output = parseStdout(result);
      assert.ok(output, 'Should produce output');
      // Should have at least 2 warnings: secret + large file + sensitive path
      assert.ok(output.warnings.length >= 2,
        `Expected >= 2 warnings, got ${output.warnings.length}`);
    });
  });

  describe('phase-appropriate messaging', () => {
    it('learning moment note for phase 0', () => {
      createProfile({ settings: { phase: 0 } });
      const content = 'const token = "ghp_abcdefghijklmnopqrstuvwxyz1234567";';
      const result = runHook(makeWriteEvent(null, content));
      const output = parseStdout(result);
      assert.equal(output.phase, 0);
      assert.ok(output.note.includes('learning moments'), 'Phase 0 should get learning note');
    });

    it('learning moment note for phase 2', () => {
      createProfile({ settings: { phase: 2 } });
      const content = 'const secret: "AKIAIOSFODNN7EXAMPLE";';
      const result = runHook(makeWriteEvent(null, content));
      const output = parseStdout(result);
      assert.ok(output.note.includes('learning moments'), 'Phase 2 should get learning note');
    });

    it('quick check note for phase 3+', () => {
      createProfile({ settings: { phase: 3 } });
      const content = 'const secret: "AKIAIOSFODNN7EXAMPLE";';
      const result = runHook(makeWriteEvent(null, content));
      const output = parseStdout(result);
      assert.equal(output.note, 'Quick check:');
    });

    it('quick check note for phase 5', () => {
      createProfile({ settings: { phase: 5 } });
      const content = '-----BEGIN PRIVATE KEY-----\nMIIE...';
      const result = runHook(makeWriteEvent(null, content));
      const output = parseStdout(result);
      assert.equal(output.note, 'Quick check:');
    });
  });

  describe('error handling', () => {
    it('exits 0 when profile load fails', () => {
      // No profile — guardrail should still work with defaults
      const content = 'const token = "ghp_abcdefghijklmnopqrstuvwxyz1234567";';
      const result = runHook(makeWriteEvent(null, content));
      assert.equal(result.exitCode, 0);
      const output = parseStdout(result);
      // Should still detect the secret
      assert.ok(output, 'Should still produce warnings without profile');
      assert.equal(output.phase, 0, 'Should default to phase 0');
    });

    it('exits 0 on corrupted profile', () => {
      fs.writeFileSync(
        path.join(tmpDir, 'learner-profile.json'),
        '{{bad}}',
        'utf-8'
      );
      const content = 'const api_key = "sk-abcdefghij123456789";';
      const result = runHook(makeWriteEvent(null, content));
      assert.equal(result.exitCode, 0, 'Must exit 0 (warn-only)');
    });
  });

  describe('performance', () => {
    it('completes within 5 seconds', () => {
      createProfile();
      const start = Date.now();
      const result = runHook(makeWriteEvent());
      const elapsed = Date.now() - start;
      assert.ok(elapsed < 5000, `Hook took ${elapsed}ms, must complete within 5000ms`);
      assert.equal(result.exitCode, 0);
    });
  });
});
