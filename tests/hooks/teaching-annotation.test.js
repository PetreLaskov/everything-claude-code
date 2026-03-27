'use strict';

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const HOOK_SCRIPT = path.resolve(__dirname, '../../scripts/hooks/teaching-annotation.js');

// --- Helpers ---

let tmpDir;

function setupTmpDir() {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mdh-annotation-test-'));
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

  // Apply overrides via deep merge
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
    input: JSON.stringify(stdinData),
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

function makeWriteEvent(filePath, content) {
  return {
    tool_name: 'Write',
    tool_input: { file_path: filePath || '/project/src/app.js', content: content || 'const x = 1;' },
    tool_output: null,
    session_id: 'test-session-001',
  };
}

function makeEditEvent(filePath, oldStr, newStr) {
  return {
    tool_name: 'Edit',
    tool_input: {
      file_path: filePath || '/project/src/app.js',
      old_string: oldStr || 'const x = 1;',
      new_string: newStr || 'const x = 2;',
    },
    tool_output: null,
    session_id: 'test-session-001',
  };
}

function parseStdout(result) {
  if (!result.stdout.trim()) return null;
  return JSON.parse(result.stdout.trim());
}

// --- Tests ---

describe('teaching-annotation hook script', () => {
  beforeEach(setupTmpDir);
  afterEach(teardownTmpDir);

  describe('basic behavior', () => {
    it('script file exists', () => {
      assert.ok(fs.existsSync(HOOK_SCRIPT), `Hook script not found at ${HOOK_SCRIPT}`);
    });

    it('exits 0 for Write events', () => {
      createProfile();
      const result = runHook(makeWriteEvent());
      assert.equal(result.exitCode, 0, `Expected exit 0, got ${result.exitCode}. stderr: ${result.stderr}`);
    });

    it('exits 0 for Edit events', () => {
      createProfile();
      const result = runHook(makeEditEvent());
      assert.equal(result.exitCode, 0, `Expected exit 0, got ${result.exitCode}. stderr: ${result.stderr}`);
    });

    it('outputs annotation guidance on stdout', () => {
      createProfile();
      const result = runHook(makeWriteEvent());
      assert.ok(result.stdout.trim().length > 0, 'Hook should produce stdout output');
    });

    it('stdout is valid JSON', () => {
      createProfile();
      const result = runHook(makeWriteEvent());
      assert.doesNotThrow(() => JSON.parse(result.stdout.trim()), 'stdout should be valid JSON');
    });

    it('output contains annotation_depth field', () => {
      createProfile();
      const result = runHook(makeWriteEvent());
      const output = parseStdout(result);
      assert.ok('annotation_depth' in output, 'Output must include annotation_depth');
    });
  });

  describe('annotation depth formula', () => {
    // Formula: annotation_depth = max(0, verbosity - (dimension_level - 1))
    // Clamped to 0-5

    it('new learner: verbosity 3, level 0 → depth 4', () => {
      // max(0, 3 - (0 - 1)) = max(0, 4) = 4
      createProfile({ settings: { verbosity: 3 } });
      const result = runHook(makeWriteEvent());
      const output = parseStdout(result);
      assert.equal(output.annotation_depth, 4);
    });

    it('mid learner: verbosity 3, level 2 → depth 2', () => {
      // max(0, 3 - (2 - 1)) = max(0, 2) = 2
      createProfile({
        settings: { verbosity: 3 },
        dimensions: { implementation: { level: 2, fractional_level: 2.0 } },
      });
      const result = runHook(makeWriteEvent());
      const output = parseStdout(result);
      assert.equal(output.annotation_depth, 2);
    });

    it('advanced learner: verbosity 3, level 5 → depth 0', () => {
      // max(0, 3 - (5 - 1)) = max(0, -1) = 0
      createProfile({
        settings: { verbosity: 3 },
        dimensions: { implementation: { level: 5, fractional_level: 5.0 } },
      });
      const result = runHook(makeWriteEvent());
      const output = parseStdout(result);
      assert.equal(output.annotation_depth, 0);
    });

    it('max verbosity, new learner: verbosity 5, level 0 → depth 5 (clamped)', () => {
      // max(0, 5 - (0 - 1)) = max(0, 6) → clamped to 5
      createProfile({ settings: { verbosity: 5 } });
      const result = runHook(makeWriteEvent());
      const output = parseStdout(result);
      assert.ok(output.annotation_depth <= 5, `Depth should be clamped to 5, got ${output.annotation_depth}`);
    });

    it('min verbosity, mid learner: verbosity 1, level 3 → depth 0', () => {
      // max(0, 1 - (3 - 1)) = max(0, -1) = 0
      createProfile({
        settings: { verbosity: 1 },
        dimensions: { implementation: { level: 3, fractional_level: 3.0 } },
      });
      const result = runHook(makeWriteEvent());
      const output = parseStdout(result);
      assert.equal(output.annotation_depth, 0);
    });
  });

  describe('novel concept override', () => {
    it('forces annotation when sub-concept confidence < 0.4', () => {
      // Even with high level and low verbosity, novel concepts get annotated
      createProfile({
        settings: { verbosity: 1 },
        dimensions: {
          implementation: {
            level: 4,
            fractional_level: 4.0,
            sub_concepts: {
              tdd_red_green_refactor: { level: 0, confidence: 0.3 },
            },
          },
        },
      });
      const result = runHook(makeWriteEvent('/project/src/app.test.js', 'it("should test", () => {});'));
      const output = parseStdout(result);
      // When novel concept detected, annotation_depth should be > 0
      assert.ok(output.annotation_depth > 0 || output.novel_concept === true,
        'Novel concept (confidence < 0.4) should trigger annotation');
    });

    it('does not force annotation when sub-concept confidence >= 0.4', () => {
      createProfile({
        settings: { verbosity: 1 },
        dimensions: {
          implementation: {
            level: 4,
            fractional_level: 4.0,
            sub_concepts: {
              tdd_red_green_refactor: { level: 3, confidence: 0.7 },
            },
          },
        },
      });
      const result = runHook(makeWriteEvent());
      const output = parseStdout(result);
      // Normal formula applies: max(0, 1 - (4 - 1)) = 0
      assert.equal(output.annotation_depth, 0);
    });
  });

  describe('phase-specific behavior', () => {
    it('Phase 0: suggests full annotation regardless of level', () => {
      createProfile({
        settings: { phase: 0, verbosity: 3 },
        dimensions: { implementation: { level: 3, fractional_level: 3.0 } },
      });
      const result = runHook(makeWriteEvent());
      const output = parseStdout(result);
      // Phase 0 = Discovery, should annotate fully
      assert.ok(output.annotation_depth >= 3 || output.phase_override === true,
        'Phase 0 should suggest full annotation');
    });

    it('Phase 1: suggests full annotation', () => {
      createProfile({
        settings: { phase: 1, verbosity: 3 },
        dimensions: { implementation: { level: 3, fractional_level: 3.0 } },
      });
      const result = runHook(makeWriteEvent());
      const output = parseStdout(result);
      assert.ok(output.annotation_depth >= 3 || output.phase_override === true,
        'Phase 1 should suggest full annotation');
    });

    it('Phase 5: suggests no annotation for high-level dimensions', () => {
      createProfile({
        settings: { phase: 5, verbosity: 3 },
        dimensions: { implementation: { level: 5, fractional_level: 5.0 } },
      });
      const result = runHook(makeWriteEvent());
      const output = parseStdout(result);
      assert.equal(output.annotation_depth, 0, 'Phase 5 with high level should have zero annotation');
    });
  });

  describe('teaching mode output', () => {
    it('includes teaching_mode in output', () => {
      createProfile();
      const result = runHook(makeWriteEvent());
      const output = parseStdout(result);
      assert.ok('teaching_mode' in output, 'Output should include teaching_mode');
    });

    it('directive mode for levels 0-1', () => {
      createProfile({
        settings: { teaching_mode: 'directive' },
        dimensions: { implementation: { level: 1 } },
      });
      const result = runHook(makeWriteEvent());
      const output = parseStdout(result);
      assert.equal(output.teaching_mode, 'directive');
    });

    it('socratic mode for levels 2+', () => {
      createProfile({
        settings: { teaching_mode: 'socratic' },
        dimensions: { implementation: { level: 3, fractional_level: 3.0 } },
      });
      const result = runHook(makeWriteEvent());
      const output = parseStdout(result);
      assert.equal(output.teaching_mode, 'socratic');
    });
  });

  describe('error handling', () => {
    it('exits 0 when no profile exists (creates default)', () => {
      // Do NOT create a profile — hook should handle gracefully
      const result = runHook(makeWriteEvent());
      assert.equal(result.exitCode, 0, `Should exit 0 even without profile. stderr: ${result.stderr}`);
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

    it('exits 0 on malformed JSON stdin', () => {
      createProfile();
      const result = spawnSync('node', [HOOK_SCRIPT], {
        input: '{not valid json',
        env: { ...process.env, MDH_STATE_DIR: tmpDir },
        timeout: 10000,
        encoding: 'utf-8',
      });
      assert.equal(result.status, 0, 'Should exit 0 on malformed stdin (never block)');
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
