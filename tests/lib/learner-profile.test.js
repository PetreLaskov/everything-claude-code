'use strict';

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Will be implemented in scripts/lib/learner-profile.js
const {
  getProfilePath,
  createDefaultProfile,
  loadProfile,
  saveProfile,
  validateProfile,
  getActiveProject,
  getPhaseLabel,
  getLevelLabel,
  getDimensionNames,
  addSessionEntry,
  getLastSession,
} = require('../../scripts/lib/learner-profile');

const DIMENSION_NAMES = [
  'research', 'planning', 'implementation', 'review',
  'security', 'verification', 'git_workflow', 'architecture', 'orchestration',
];

// --- Helpers ---

let tmpDir;

function setupTmpDir() {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mdh-test-'));
  process.env.MDH_STATE_DIR = tmpDir;
}

function teardownTmpDir() {
  delete process.env.MDH_STATE_DIR;
  if (tmpDir && fs.existsSync(tmpDir)) {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
  tmpDir = null;
}

// --- Tests ---

describe('getProfilePath', () => {
  afterEach(teardownTmpDir);

  it('uses MDH_STATE_DIR when set', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mdh-path-'));
    process.env.MDH_STATE_DIR = dir;
    const result = getProfilePath();
    assert.equal(result, path.join(dir, 'learner-profile.json'));
    fs.rmSync(dir, { recursive: true, force: true });
    delete process.env.MDH_STATE_DIR;
  });

  it('uses CLAUDE_PLUGIN_ROOT when MDH_STATE_DIR is not set', () => {
    delete process.env.MDH_STATE_DIR;
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mdh-plugin-'));
    process.env.CLAUDE_PLUGIN_ROOT = dir;
    const result = getProfilePath();
    assert.equal(result, path.join(dir, 'state', 'learner-profile.json'));
    delete process.env.CLAUDE_PLUGIN_ROOT;
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it('falls back to relative state/ directory', () => {
    delete process.env.MDH_STATE_DIR;
    delete process.env.CLAUDE_PLUGIN_ROOT;
    const result = getProfilePath();
    // Should resolve to <project-root>/state/learner-profile.json
    assert.ok(result.endsWith(path.join('state', 'learner-profile.json')));
  });
});

describe('createDefaultProfile', () => {
  beforeEach(setupTmpDir);
  afterEach(teardownTmpDir);

  it('returns a profile that passes validation', () => {
    const profile = createDefaultProfile();
    const result = validateProfile(profile);
    assert.equal(result.valid, true, `Validation errors: ${result.errors.join(', ')}`);
  });

  it('has 9 dimensions all at level 0', () => {
    const profile = createDefaultProfile();
    assert.equal(Object.keys(profile.dimensions).length, 9);
    for (const dim of DIMENSION_NAMES) {
      assert.equal(profile.dimensions[dim].level, 0);
      assert.equal(profile.dimensions[dim].fractional_level, 0.0);
    }
  });

  it('has confidence 0.3 for all dimensions', () => {
    const profile = createDefaultProfile();
    for (const dim of DIMENSION_NAMES) {
      assert.equal(profile.dimensions[dim].confidence, 0.3);
    }
  });

  it('has correct sub-concepts for each dimension', () => {
    const profile = createDefaultProfile();
    // Spot-check a few dimensions
    assert.ok('github_search' in profile.dimensions.research.sub_concepts);
    assert.ok('tdd_red_green_refactor' in profile.dimensions.implementation.sub_concepts);
    assert.ok('staging_and_committing' in profile.dimensions.git_workflow.sub_concepts);
    assert.ok('agent_roles' in profile.dimensions.orchestration.sub_concepts);
  });

  it('has correct default settings', () => {
    const profile = createDefaultProfile();
    assert.equal(profile.settings.verbosity, 3);
    assert.equal(profile.settings.phase, 0);
    assert.equal(profile.settings.phase_proposed, null);
    assert.equal(profile.settings.teaching_mode, 'directive');
  });

  it('has schema_version 1.0.0', () => {
    const profile = createDefaultProfile();
    assert.equal(profile.schema_version, '1.0.0');
  });

  it('has ISO8601 timestamps', () => {
    const profile = createDefaultProfile();
    // Should parse as valid dates
    assert.ok(!isNaN(Date.parse(profile.created_at)));
    assert.ok(!isNaN(Date.parse(profile.updated_at)));
  });

  it('writes the profile to disk', () => {
    createDefaultProfile();
    const filePath = getProfilePath();
    assert.ok(fs.existsSync(filePath), 'Profile file should exist on disk');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    assert.equal(data.schema_version, '1.0.0');
  });

  it('has zeroed signal_accumulator', () => {
    const profile = createDefaultProfile();
    for (const dim of DIMENSION_NAMES) {
      assert.equal(profile.signal_accumulator[dim], 0.0);
    }
  });
});

describe('loadProfile', () => {
  beforeEach(setupTmpDir);
  afterEach(teardownTmpDir);

  it('returns null when no file exists', () => {
    const result = loadProfile();
    assert.equal(result, null);
  });

  it('loads a valid profile from disk', () => {
    const original = createDefaultProfile();
    const loaded = loadProfile();
    assert.deepStrictEqual(loaded, original);
  });

  it('throws on invalid JSON', () => {
    fs.writeFileSync(path.join(tmpDir, 'learner-profile.json'), '{not valid json!!!');
    assert.throws(() => loadProfile());
  });
});

describe('saveProfile', () => {
  beforeEach(setupTmpDir);
  afterEach(teardownTmpDir);

  it('writes profile to disk with updated timestamp', () => {
    const profile = createDefaultProfile();
    const oldTimestamp = profile.updated_at;

    // Small delay to ensure different timestamp
    const modified = { ...profile, settings: { ...profile.settings, verbosity: 5 } };
    saveProfile(modified);

    const loaded = loadProfile();
    assert.equal(loaded.settings.verbosity, 5);
    assert.ok(loaded.updated_at >= oldTimestamp);
  });

  it('does not mutate the input object', () => {
    const profile = createDefaultProfile();
    const originalTimestamp = profile.updated_at;
    const frozen = JSON.parse(JSON.stringify(profile));
    saveProfile(profile);
    // The input object should not have been modified
    assert.equal(profile.updated_at, originalTimestamp);
    assert.deepStrictEqual(profile, frozen);
  });

  it('creates directory if it does not exist', () => {
    const nestedDir = path.join(tmpDir, 'nested');
    process.env.MDH_STATE_DIR = nestedDir;
    const profile = createDefaultProfile();
    assert.ok(fs.existsSync(nestedDir));
  });
});

describe('validateProfile', () => {
  beforeEach(setupTmpDir);
  afterEach(teardownTmpDir);

  it('validates a default profile with no errors', () => {
    const profile = createDefaultProfile();
    const result = validateProfile(profile);
    assert.equal(result.valid, true);
    assert.deepStrictEqual(result.errors, []);
  });

  it('rejects missing dimension', () => {
    const profile = createDefaultProfile();
    delete profile.dimensions.research;
    const result = validateProfile(profile);
    assert.equal(result.valid, false);
    assert.ok(result.errors.length > 0);
    assert.ok(result.errors.some(e => e.includes('research')));
  });

  it('rejects verbosity out of range (7)', () => {
    const profile = createDefaultProfile();
    profile.settings.verbosity = 7;
    const result = validateProfile(profile);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some(e => e.includes('verbosity')));
  });

  it('rejects level out of range (6)', () => {
    const profile = createDefaultProfile();
    profile.dimensions.planning.level = 6;
    const result = validateProfile(profile);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some(e => e.includes('level')));
  });

  it('rejects confidence out of range (1.5)', () => {
    const profile = createDefaultProfile();
    profile.dimensions.security.confidence = 1.5;
    const result = validateProfile(profile);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some(e => e.includes('confidence')));
  });

  it('rejects invalid teaching_mode', () => {
    const profile = createDefaultProfile();
    profile.settings.teaching_mode = 'hybrid';
    const result = validateProfile(profile);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some(e => e.includes('teaching_mode')));
  });

  it('rejects non-array projects', () => {
    const profile = createDefaultProfile();
    profile.projects = 'not-an-array';
    const result = validateProfile(profile);
    assert.equal(result.valid, false);
  });

  it('rejects non-array session_history', () => {
    const profile = createDefaultProfile();
    profile.session_history = {};
    const result = validateProfile(profile);
    assert.equal(result.valid, false);
  });

  it('rejects missing signal_accumulator keys', () => {
    const profile = createDefaultProfile();
    delete profile.signal_accumulator.orchestration;
    const result = validateProfile(profile);
    assert.equal(result.valid, false);
  });
});

describe('getActiveProject', () => {
  beforeEach(setupTmpDir);
  afterEach(teardownTmpDir);

  it('returns null when no projects exist', () => {
    const profile = createDefaultProfile();
    assert.equal(getActiveProject(profile), null);
  });

  it('returns the active project', () => {
    const profile = createDefaultProfile();
    profile.projects = [
      { id: 'proj-001', name: 'Test', status: 'active', archetype: 'web-dashboard' },
    ];
    const result = getActiveProject(profile);
    assert.equal(result.id, 'proj-001');
  });

  it('returns active project when mixed with completed', () => {
    const profile = createDefaultProfile();
    profile.projects = [
      { id: 'proj-001', name: 'Old', status: 'completed' },
      { id: 'proj-002', name: 'Current', status: 'active' },
    ];
    const result = getActiveProject(profile);
    assert.equal(result.id, 'proj-002');
  });

  it('returns null when all projects are completed', () => {
    const profile = createDefaultProfile();
    profile.projects = [
      { id: 'proj-001', name: 'Done', status: 'completed' },
    ];
    assert.equal(getActiveProject(profile), null);
  });
});

describe('getPhaseLabel', () => {
  it('returns correct labels for all 6 phases', () => {
    const expected = ['Discovery', 'Observer', 'Co-Pilot', 'Navigator', 'Driver', 'Graduate'];
    for (let i = 0; i <= 5; i++) {
      assert.equal(getPhaseLabel(i), expected[i]);
    }
  });
});

describe('getLevelLabel', () => {
  it('returns correct labels for all 6 levels', () => {
    const expected = ['Unaware', 'Aware', 'Familiar', 'Competent', 'Proficient', 'Expert'];
    for (let i = 0; i <= 5; i++) {
      assert.equal(getLevelLabel(i), expected[i]);
    }
  });
});

describe('getDimensionNames', () => {
  it('returns exactly 9 dimension names', () => {
    const names = getDimensionNames();
    assert.equal(names.length, 9);
  });

  it('returns the correct names in order', () => {
    assert.deepStrictEqual(getDimensionNames(), DIMENSION_NAMES);
  });
});

describe('addSessionEntry', () => {
  beforeEach(setupTmpDir);
  afterEach(teardownTmpDir);

  it('appends entry to session_history', () => {
    const profile = createDefaultProfile();
    const entry = { session_id: '2026-03-23-abc', date: '2026-03-23', signals_captured: 5 };
    const updated = addSessionEntry(profile, entry);
    assert.equal(updated.session_history.length, 1);
    assert.deepStrictEqual(updated.session_history[0], entry);
  });

  it('does not mutate the original profile', () => {
    const profile = createDefaultProfile();
    const entry = { session_id: '2026-03-23-abc', date: '2026-03-23' };
    const updated = addSessionEntry(profile, entry);
    assert.equal(profile.session_history.length, 0);
    assert.equal(updated.session_history.length, 1);
  });

  it('trims history to last 50 entries', () => {
    let profile = createDefaultProfile();
    // Manually set 55 entries
    profile.session_history = Array.from({ length: 55 }, (_, i) => ({
      session_id: `session-${i}`,
      date: '2026-01-01',
    }));
    const entry = { session_id: 'new-entry', date: '2026-03-23' };
    const updated = addSessionEntry(profile, entry);
    assert.equal(updated.session_history.length, 50);
    // Most recent should be last
    assert.equal(updated.session_history[49].session_id, 'new-entry');
    // Oldest entries should have been trimmed
    assert.equal(updated.session_history[0].session_id, 'session-6');
  });
});

describe('getLastSession', () => {
  beforeEach(setupTmpDir);
  afterEach(teardownTmpDir);

  it('returns null for empty history', () => {
    const profile = createDefaultProfile();
    assert.equal(getLastSession(profile), null);
  });

  it('returns the last entry', () => {
    const profile = createDefaultProfile();
    profile.session_history = [
      { session_id: 'first', date: '2026-03-20' },
      { session_id: 'last', date: '2026-03-23' },
    ];
    const result = getLastSession(profile);
    assert.equal(result.session_id, 'last');
  });
});
