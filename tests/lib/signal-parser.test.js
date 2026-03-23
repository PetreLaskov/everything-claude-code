'use strict';

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const os = require('os');

const {
  extractSignals,
  getSignalRules,
  isFalsePositive,
} = require('../../scripts/lib/signal-parser');

const { createDefaultProfile } = require('../../scripts/lib/learner-profile');

// --- Helpers ---

let tmpDir;

function setupTmpDir() {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mdh-sp-'));
  process.env.MDH_STATE_DIR = tmpDir;
}

function teardownTmpDir() {
  delete process.env.MDH_STATE_DIR;
  if (tmpDir && fs.existsSync(tmpDir)) {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
  tmpDir = null;
}

// --- extractSignals Tests ---

describe('extractSignals — conventional commit', () => {
  beforeEach(setupTmpDir);
  afterEach(teardownTmpDir);

  it('detects conventional commit message', () => {
    const profile = createDefaultProfile();
    const signals = extractSignals(
      'Bash',
      { command: 'git commit -m "feat: add user login"' },
      'master abc1234] feat: add user login',
      profile
    );
    const gitSignal = signals.find(s => s.dimension === 'git_workflow');
    assert.ok(gitSignal, 'Should produce git_workflow signal');
    assert.equal(gitSignal.weight, 0.15);
    assert.equal(gitSignal.type, 'positive');
    assert.equal(gitSignal.sub_concept, 'commit_messages');
  });

  it('does not signal for non-conventional commit', () => {
    const profile = createDefaultProfile();
    const signals = extractSignals(
      'Bash',
      { command: 'git commit -m "fixed stuff"' },
      'master abc1234] fixed stuff',
      profile
    );
    const gitSignal = signals.find(s => s.dimension === 'git_workflow' && s.sub_concept === 'commit_messages');
    assert.equal(gitSignal, undefined);
  });
});

describe('extractSignals — manual verification', () => {
  beforeEach(setupTmpDir);
  afterEach(teardownTmpDir);

  it('detects npm test as verification signal', () => {
    const profile = createDefaultProfile();
    const signals = extractSignals(
      'Bash',
      { command: 'npm test' },
      'Tests: 10 passed',
      profile
    );
    const verifySignal = signals.find(s => s.dimension === 'verification');
    assert.ok(verifySignal, 'Should produce verification signal');
    assert.equal(verifySignal.weight, 0.15);
    assert.equal(verifySignal.sub_concept, 'build_check');
  });

  it('detects npx jest as verification signal', () => {
    const profile = createDefaultProfile();
    const signals = extractSignals(
      'Bash',
      { command: 'npx jest' },
      'Tests: 5 passed',
      profile
    );
    const verifySignal = signals.find(s => s.dimension === 'verification');
    assert.ok(verifySignal);
  });

  it('detects npx vitest as verification signal', () => {
    const profile = createDefaultProfile();
    const signals = extractSignals(
      'Bash',
      { command: 'npx vitest run' },
      'Tests passed',
      profile
    );
    const verifySignal = signals.find(s => s.dimension === 'verification');
    assert.ok(verifySignal);
  });
});

describe('extractSignals — build failure', () => {
  beforeEach(setupTmpDir);
  afterEach(teardownTmpDir);

  it('detects build failure after user edit (Phase 3+)', () => {
    const profile = createDefaultProfile();
    profile.settings.phase = 3;
    const signals = extractSignals(
      'Bash',
      { command: 'npm run build' },
      'Error: Build failed\nmodule not found',
      profile,
      { lastToolWasUserEdit: true }
    );
    const failSignal = signals.find(s => s.dimension === 'implementation' && s.type === 'negative');
    assert.ok(failSignal, 'Should produce negative implementation signal');
    assert.equal(failSignal.weight, -0.05);
  });

  it('does not signal build failure at Phase 0-2 (learning phase)', () => {
    const profile = createDefaultProfile();
    profile.settings.phase = 1;
    const signals = extractSignals(
      'Bash',
      { command: 'npm run build' },
      'Error: Build failed',
      profile,
      { lastToolWasUserEdit: true }
    );
    const failSignal = signals.find(s => s.dimension === 'implementation' && s.type === 'negative');
    assert.equal(failSignal, undefined);
  });

  it('does not signal build failure without prior user edit', () => {
    const profile = createDefaultProfile();
    profile.settings.phase = 3;
    const signals = extractSignals(
      'Bash',
      { command: 'npm run build' },
      'Error: Build failed',
      profile,
      { lastToolWasUserEdit: false }
    );
    const failSignal = signals.find(s => s.dimension === 'implementation' && s.type === 'negative');
    assert.equal(failSignal, undefined);
  });
});

describe('extractSignals — security-conscious write', () => {
  beforeEach(setupTmpDir);
  afterEach(teardownTmpDir);

  it('detects process.env usage when security level < 3', () => {
    const profile = createDefaultProfile();
    const signals = extractSignals(
      'Edit',
      {
        file_path: '/app/config.js',
        new_string: 'const apiKey = process.env.API_KEY;',
      },
      null,
      profile
    );
    const secSignal = signals.find(s => s.dimension === 'security');
    assert.ok(secSignal, 'Should produce security signal');
    assert.equal(secSignal.weight, 0.20);
    assert.equal(secSignal.type, 'positive');
  });

  it('does not signal when security level >= 3 (expected behavior)', () => {
    const profile = createDefaultProfile();
    profile.dimensions.security.level = 4;
    const signals = extractSignals(
      'Edit',
      {
        file_path: '/app/config.js',
        new_string: 'const apiKey = process.env.API_KEY;',
      },
      null,
      profile
    );
    const secSignal = signals.find(s => s.dimension === 'security');
    assert.equal(secSignal, undefined);
  });
});

describe('extractSignals — edge case test write', () => {
  beforeEach(setupTmpDir);
  afterEach(teardownTmpDir);

  it('detects error case tests in test file', () => {
    const profile = createDefaultProfile();
    const signals = extractSignals(
      'Write',
      {
        file_path: '/app/auth.test.js',
        content: `
describe('auth', () => {
  it('handles invalid credentials', () => {});
  it('handles null input', () => {});
  it('handles expired token', () => {});
  it('handles rate limiting', () => {});
});`,
      },
      null,
      profile
    );
    const testSignal = signals.find(s => s.dimension === 'implementation' && s.sub_concept === 'tdd_red_green_refactor');
    assert.ok(testSignal, 'Should produce implementation/tdd signal');
    assert.equal(testSignal.weight, 0.20);
  });
});

describe('extractSignals — large file write', () => {
  beforeEach(setupTmpDir);
  afterEach(teardownTmpDir);

  it('detects write with 900+ lines', () => {
    const profile = createDefaultProfile();
    const content = Array(901).fill('const x = 1;').join('\n');
    const signals = extractSignals(
      'Write',
      { file_path: '/app/big-file.js', content },
      null,
      profile,
      { isUserDirected: true }
    );
    const archSignal = signals.find(s => s.dimension === 'architecture' && s.type === 'negative');
    assert.ok(archSignal, 'Should produce negative architecture signal');
    assert.equal(archSignal.weight, -0.05);
    assert.equal(archSignal.sub_concept, 'file_structure');
  });
});

describe('extractSignals — plan modification', () => {
  beforeEach(setupTmpDir);
  afterEach(teardownTmpDir);

  it('detects edit to plan file', () => {
    const profile = createDefaultProfile();
    const signals = extractSignals(
      'Edit',
      {
        file_path: '/app/project.plan.md',
        new_string: '## Phase 2: Add authentication\n\nWe need OAuth2 for the API.',
      },
      null,
      profile
    );
    const planSignal = signals.find(s => s.dimension === 'planning');
    assert.ok(planSignal, 'Should produce planning signal');
    assert.equal(planSignal.weight, 0.15);
    assert.equal(planSignal.sub_concept, 'requirements_analysis');
  });

  it('detects edit to PLAN.md', () => {
    const profile = createDefaultProfile();
    const signals = extractSignals(
      'Edit',
      { file_path: '/app/PLAN.md', new_string: 'Updated scope to include caching layer' },
      null,
      profile
    );
    const planSignal = signals.find(s => s.dimension === 'planning');
    assert.ok(planSignal);
  });
});

describe('extractSignals — no signals from passive tools', () => {
  beforeEach(setupTmpDir);
  afterEach(teardownTmpDir);

  it('returns empty array for Read tool', () => {
    const profile = createDefaultProfile();
    const signals = extractSignals('Read', { file_path: '/app/index.js' }, 'file contents', profile);
    assert.deepStrictEqual(signals, []);
  });

  it('returns empty array for Glob tool', () => {
    const profile = createDefaultProfile();
    const signals = extractSignals('Glob', { pattern: '**/*.js' }, 'file1.js\nfile2.js', profile);
    assert.deepStrictEqual(signals, []);
  });

  it('returns empty array for Grep tool', () => {
    const profile = createDefaultProfile();
    const signals = extractSignals('Grep', { pattern: 'TODO' }, 'file1.js:3:TODO', profile);
    assert.deepStrictEqual(signals, []);
  });
});

describe('extractSignals — pure function', () => {
  beforeEach(setupTmpDir);
  afterEach(teardownTmpDir);

  it('does not modify the profile parameter', () => {
    const profile = createDefaultProfile();
    const frozen = JSON.parse(JSON.stringify(profile));
    extractSignals('Bash', { command: 'npm test' }, 'Tests passed', profile);
    assert.deepStrictEqual(profile, frozen);
  });

  it('can return multiple signals from one event', () => {
    const profile = createDefaultProfile();
    // A security-conscious edit to a test file could produce both signals
    const signals = extractSignals(
      'Edit',
      {
        file_path: '/app/auth.test.js',
        new_string: `
it('handles invalid input', () => {
  const key = process.env.TEST_KEY;
});
it('handles null', () => {});
it('handles error', () => {});
it('handles boundary', () => {});`,
      },
      null,
      profile
    );
    // Could have both security and test signals
    assert.ok(signals.length >= 1, 'Should produce at least one signal');
  });
});

// --- isFalsePositive Tests ---

describe('isFalsePositive', () => {
  beforeEach(setupTmpDir);
  afterEach(teardownTmpDir);

  it('filters weak signal when confidence > 0.85', () => {
    const profile = createDefaultProfile();
    profile.dimensions.security.confidence = 0.90;
    const signal = { dimension: 'security', weight: 0.05, type: 'positive', reason: 'test' };
    const result = isFalsePositive(signal, profile, { recentSignals: [] });
    assert.equal(result, true);
  });

  it('does not filter strong signal even with high confidence', () => {
    const profile = createDefaultProfile();
    profile.dimensions.security.confidence = 0.90;
    const signal = { dimension: 'security', weight: 0.15, type: 'positive', reason: 'test' };
    const result = isFalsePositive(signal, profile, { recentSignals: [] });
    assert.equal(result, false);
  });

  it('filters repeated signal within last 3 events', () => {
    const profile = createDefaultProfile();
    const signal = { dimension: 'security', weight: 0.20, type: 'positive', reason: 'test' };
    const context = {
      recentSignals: [
        { dimension: 'security', type: 'positive' },
      ],
    };
    const result = isFalsePositive(signal, profile, context);
    assert.equal(result, true);
  });

  it('does not filter signal of different type', () => {
    const profile = createDefaultProfile();
    const signal = { dimension: 'security', weight: 0.20, type: 'positive', reason: 'test' };
    const context = {
      recentSignals: [
        { dimension: 'security', type: 'negative' },
      ],
    };
    const result = isFalsePositive(signal, profile, context);
    assert.equal(result, false);
  });

  it('filters signals from test fixtures', () => {
    const profile = createDefaultProfile();
    const signal = { dimension: 'security', weight: 0.20, type: 'positive', reason: 'test' };
    const context = { recentSignals: [], filePath: '/app/__mocks__/db.js' };
    const result = isFalsePositive(signal, profile, context);
    assert.equal(result, true);
  });

  it('filters signals from fixtures directory', () => {
    const profile = createDefaultProfile();
    const signal = { dimension: 'implementation', weight: 0.20, type: 'positive', reason: 'test' };
    const context = { recentSignals: [], filePath: '/app/fixtures/sample-data.js' };
    const result = isFalsePositive(signal, profile, context);
    assert.equal(result, true);
  });
});

// --- getSignalRules Tests ---

describe('getSignalRules', () => {
  it('returns complete rule set', () => {
    const rules = getSignalRules();
    assert.ok(rules.positive, 'Should have positive rules');
    assert.ok(rules.negative, 'Should have negative rules');
    assert.ok(Array.isArray(rules.positive));
    assert.ok(Array.isArray(rules.negative));
  });

  it('positive rules have required fields', () => {
    const rules = getSignalRules();
    for (const rule of rules.positive) {
      assert.equal(typeof rule.id, 'string');
      assert.equal(typeof rule.dimension, 'string');
      assert.equal(typeof rule.weight, 'number');
      assert.ok(rule.weight > 0);
      assert.equal(typeof rule.detector, 'string');
    }
  });

  it('negative rules have required fields', () => {
    const rules = getSignalRules();
    for (const rule of rules.negative) {
      assert.equal(typeof rule.id, 'string');
      assert.equal(typeof rule.dimension, 'string');
      assert.equal(typeof rule.weight, 'number');
      assert.ok(rule.weight < 0);
      assert.equal(typeof rule.detector, 'string');
    }
  });
});
