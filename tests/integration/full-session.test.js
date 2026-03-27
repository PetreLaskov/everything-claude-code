'use strict';

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Core libraries (already implemented)
const {
  createDefaultProfile,
  loadProfile,
  saveProfile,
  getProfilePath,
  addSessionEntry,
  getLastSession,
  getDimensionNames,
} = require('../../scripts/lib/learner-profile');

const {
  updateLevel,
  calculateAnnotationDepth,
  evaluatePhaseTransition,
  getAverageLevel,
  manualOverride,
} = require('../../scripts/lib/competence-engine');

const {
  extractSignals,
  isFalsePositive,
} = require('../../scripts/lib/signal-parser');

// --- Helpers ---

let tmpDir;

function setupTmpDir() {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mdh-integration-'));
  process.env.MDH_STATE_DIR = tmpDir;
}

function teardownTmpDir() {
  delete process.env.MDH_STATE_DIR;
  if (tmpDir && fs.existsSync(tmpDir)) {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
  tmpDir = null;
}

function makeDefaultProfile() {
  return createDefaultProfile();
}

// --- Session Lifecycle Tests ---

describe('session lifecycle', () => {
  beforeEach(setupTmpDir);
  afterEach(teardownTmpDir);

  it('creates fresh profile with all dimensions at level 0', () => {
    const profile = makeDefaultProfile();
    for (const dim of getDimensionNames()) {
      assert.equal(profile.dimensions[dim].level, 0);
      assert.equal(profile.dimensions[dim].fractional_level, 0.0);
      assert.equal(profile.dimensions[dim].confidence, 0.3);
    }
  });

  it('persists profile and reloads with identical state', () => {
    const original = makeDefaultProfile();
    const loaded = loadProfile();
    assert.deepStrictEqual(loaded, original);
  });

  it('saves modified profile and reloads with changes preserved', () => {
    const profile = makeDefaultProfile();
    const modified = {
      ...profile,
      settings: { ...profile.settings, verbosity: 5 },
    };
    saveProfile(modified);
    const reloaded = loadProfile();
    assert.equal(reloaded.settings.verbosity, 5);
  });
});

// --- Signal Capture → Level Update Flow ---

describe('signal capture and level update flow', () => {
  beforeEach(setupTmpDir);
  afterEach(teardownTmpDir);

  it('conventional commit produces git_workflow signal', () => {
    const profile = makeDefaultProfile();
    const signals = extractSignals(
      'Bash',
      { command: 'git commit -m "feat: add login page"' },
      null,
      profile,
      {}
    );
    assert.equal(signals.length, 1);
    assert.equal(signals[0].dimension, 'git_workflow');
    assert.equal(signals[0].type, 'positive');
  });

  it('signal updates fractional level via competence engine', () => {
    const profile = makeDefaultProfile();
    const signal = {
      dimension: 'git_workflow',
      weight: 0.15,
      type: 'positive',
      sub_concept: 'commit_messages',
    };
    const result = updateLevel(profile, signal);
    assert.ok(result.profile.dimensions.git_workflow.fractional_level > 0);
    assert.equal(result.levelChanged, false, 'Single signal should not trigger level-up');
  });

  it('multiple signals accumulate fractional levels', () => {
    let profile = makeDefaultProfile();
    const signal = {
      dimension: 'git_workflow',
      weight: 0.15,
      type: 'positive',
      sub_concept: 'commit_messages',
    };

    // Apply 5 signals
    for (let i = 0; i < 5; i++) {
      const result = updateLevel(profile, signal);
      profile = result.profile;
    }

    assert.ok(profile.dimensions.git_workflow.fractional_level > 0.5,
      `Expected fractional_level > 0.5 after 5 signals, got ${profile.dimensions.git_workflow.fractional_level}`);
  });

  it('enough signals trigger level-up', () => {
    let profile = makeDefaultProfile();
    const signal = {
      dimension: 'implementation',
      weight: 0.20,
      type: 'positive',
      sub_concept: 'tdd_red_green_refactor',
    };

    let leveledUp = false;
    // Apply many signals until level-up (dampening means we need more than 5)
    for (let i = 0; i < 20; i++) {
      const result = updateLevel(profile, signal);
      profile = result.profile;
      if (result.levelChanged && result.direction === 'up') {
        leveledUp = true;
        break;
      }
    }

    assert.ok(leveledUp, 'Should eventually level up after sufficient positive signals');
    assert.equal(profile.dimensions.implementation.level, 1);
  });

  it('confidence increases with evidence count', () => {
    let profile = makeDefaultProfile();
    const initialConfidence = profile.dimensions.git_workflow.confidence;
    const signal = {
      dimension: 'git_workflow',
      weight: 0.15,
      type: 'positive',
      sub_concept: 'commit_messages',
    };

    const result = updateLevel(profile, signal);
    assert.ok(
      result.profile.dimensions.git_workflow.confidence > initialConfidence,
      'Confidence should increase after signal'
    );
  });

  it('annotation depth decreases as level increases', () => {
    const verbosity = 3;

    // Level 0: depth = max(0, 3 - (0-1)) = 4
    const depth0 = calculateAnnotationDepth(verbosity, 0);
    // Level 2: depth = max(0, 3 - (2-1)) = 2
    const depth2 = calculateAnnotationDepth(verbosity, 2);
    // Level 5: depth = max(0, 3 - (5-1)) = 0
    const depth5 = calculateAnnotationDepth(verbosity, 5);

    assert.ok(depth0 > depth2, `Level 0 depth (${depth0}) should > Level 2 depth (${depth2})`);
    assert.ok(depth2 > depth5, `Level 2 depth (${depth2}) should > Level 5 depth (${depth5})`);
    assert.equal(depth5, 0, 'Level 5 with verbosity 3 should have zero annotation');
  });

  it('false positive filter suppresses duplicate signals', () => {
    const profile = makeDefaultProfile();
    const signal = {
      dimension: 'git_workflow',
      weight: 0.15,
      type: 'positive',
    };
    const context = {
      recentSignals: [{ dimension: 'git_workflow', type: 'positive' }],
    };
    assert.ok(isFalsePositive(signal, profile, context), 'Duplicate recent signal should be filtered');
  });

  it('false positive filter suppresses signals in test fixtures', () => {
    const profile = makeDefaultProfile();
    const signal = { dimension: 'security', weight: 0.20, type: 'positive' };
    const context = { filePath: '/project/__mocks__/auth.js' };
    assert.ok(isFalsePositive(signal, profile, context), 'Test fixture signals should be filtered');
  });
});

// --- Phase Transition Flow ---

describe('phase transition flow', () => {
  beforeEach(setupTmpDir);
  afterEach(teardownTmpDir);

  it('Phase 0→1 requires active project', () => {
    const profile = makeDefaultProfile();
    // No project → not eligible
    const result = evaluatePhaseTransition(profile);
    assert.equal(result.eligible, false);
    assert.ok(result.unmetCriteria.some(c => c.includes('active project')));
  });

  it('Phase 0→1 eligible with active project', () => {
    const profile = makeDefaultProfile();
    profile.projects = [{ id: 'proj-1', name: 'My App', status: 'active', archetype: 'web-app' }];
    const result = evaluatePhaseTransition(profile);
    assert.equal(result.eligible, true);
    assert.equal(result.nextPhase, 1);
  });

  it('Phase 1→2 requires planning and implementation at Level 2', () => {
    const profile = makeDefaultProfile();
    profile.settings.phase = 1;
    profile.projects = [{ id: 'proj-1', name: 'App', status: 'active' }];

    const result = evaluatePhaseTransition(profile);
    assert.equal(result.eligible, false);
    assert.ok(result.unmetCriteria.some(c => c.includes('planning')));
    assert.ok(result.unmetCriteria.some(c => c.includes('implementation')));
  });

  it('Phase 1→2 eligible when criteria met', () => {
    let profile = makeDefaultProfile();
    profile.settings.phase = 1;

    // Boost planning and implementation to level 2
    profile = manualOverride(profile, 'planning', 2);
    profile = manualOverride(profile, 'implementation', 2);

    const result = evaluatePhaseTransition(profile);
    assert.equal(result.eligible, true);
    assert.equal(result.nextPhase, 2);
  });

  it('Phase 2→3 requires 3 dimensions at Level 3+', () => {
    let profile = makeDefaultProfile();
    profile.settings.phase = 2;

    // Only 2 dimensions at level 3
    profile = manualOverride(profile, 'planning', 3);
    profile = manualOverride(profile, 'implementation', 3);

    const result = evaluatePhaseTransition(profile);
    assert.equal(result.eligible, false);
    assert.ok(result.unmetCriteria.some(c => c.includes('3 dimensions')));
  });

  it('Phase 2→3 eligible with 3 dimensions at Level 3', () => {
    let profile = makeDefaultProfile();
    profile.settings.phase = 2;

    profile = manualOverride(profile, 'planning', 3);
    profile = manualOverride(profile, 'implementation', 3);
    profile = manualOverride(profile, 'review', 3);

    const result = evaluatePhaseTransition(profile);
    assert.equal(result.eligible, true);
    assert.equal(result.nextPhase, 3);
  });

  it('Phase 5 is max — not eligible for further transition', () => {
    const profile = makeDefaultProfile();
    profile.settings.phase = 5;
    const result = evaluatePhaseTransition(profile);
    assert.equal(result.eligible, false);
    assert.ok(result.unmetCriteria.some(c => c.includes('max phase')));
  });
});

// --- Multi-Session Accumulation ---

describe('multi-session accumulation', () => {
  beforeEach(setupTmpDir);
  afterEach(teardownTmpDir);

  it('signals accumulate across sessions via save/load', () => {
    // Session 1: capture signals, save profile
    let profile = makeDefaultProfile();
    const signal = {
      dimension: 'git_workflow',
      weight: 0.15,
      type: 'positive',
      sub_concept: 'commit_messages',
    };
    let result = updateLevel(profile, signal);
    profile = result.profile;
    const session1Fractional = profile.dimensions.git_workflow.fractional_level;
    saveProfile(profile);

    // Session 2: reload, capture more signals
    let reloaded = loadProfile();
    assert.equal(
      reloaded.dimensions.git_workflow.fractional_level,
      session1Fractional,
      'Fractional level should persist across sessions'
    );

    result = updateLevel(reloaded, signal);
    reloaded = result.profile;
    assert.ok(
      reloaded.dimensions.git_workflow.fractional_level > session1Fractional,
      'Fractional level should continue accumulating in session 2'
    );
  });

  it('session history appends correctly across sessions', () => {
    let profile = makeDefaultProfile();

    // Session 1
    profile = addSessionEntry(profile, {
      session_id: 'session-1',
      date: '2026-03-24',
      signals_captured: 3,
    });
    saveProfile(profile);

    // Session 2
    let reloaded = loadProfile();
    reloaded = addSessionEntry(reloaded, {
      session_id: 'session-2',
      date: '2026-03-25',
      signals_captured: 5,
    });
    saveProfile(reloaded);

    // Verify
    const final = loadProfile();
    assert.equal(final.session_history.length, 2);
    assert.equal(final.session_history[0].session_id, 'session-1');
    assert.equal(final.session_history[1].session_id, 'session-2');
  });

  it('50-session trim preserves most recent entries', () => {
    let profile = makeDefaultProfile();

    // Add 55 sessions
    for (let i = 0; i < 55; i++) {
      profile = addSessionEntry(profile, {
        session_id: `session-${i}`,
        date: '2026-01-01',
      });
    }
    saveProfile(profile);

    const loaded = loadProfile();
    assert.equal(loaded.session_history.length, 50);
    assert.equal(loaded.session_history[0].session_id, 'session-5');
    assert.equal(loaded.session_history[49].session_id, 'session-54');
  });

  it('getLastSession returns the most recent entry after reload', () => {
    let profile = makeDefaultProfile();
    profile = addSessionEntry(profile, { session_id: 'first', date: '2026-03-20' });
    profile = addSessionEntry(profile, { session_id: 'last', date: '2026-03-24' });
    saveProfile(profile);

    const loaded = loadProfile();
    const last = getLastSession(loaded);
    assert.equal(last.session_id, 'last');
  });
});

// --- End-to-End: Signal → Level → Annotation ---

describe('end-to-end: signal to annotation', () => {
  beforeEach(setupTmpDir);
  afterEach(teardownTmpDir);

  it('full flow: extract signal → update level → check annotation depth', () => {
    let profile = makeDefaultProfile();

    // Step 1: Extract signal from a conventional commit
    const signals = extractSignals(
      'Bash',
      { command: 'git commit -m "feat: add user auth"' },
      null,
      profile,
      {}
    );
    assert.equal(signals.length, 1, 'Should extract one signal');

    // Step 2: Update level
    const result = updateLevel(profile, signals[0]);
    profile = result.profile;
    assert.ok(profile.dimensions.git_workflow.fractional_level > 0);

    // Step 3: Check annotation depth (should still be high for level 0)
    const depth = calculateAnnotationDepth(
      profile.settings.verbosity,
      profile.dimensions.git_workflow.level
    );
    assert.ok(depth > 0, 'Annotation depth should be > 0 for new learner');
  });

  it('full flow: accumulated signals → level-up → reduced annotation', () => {
    let profile = makeDefaultProfile();
    const verbosity = profile.settings.verbosity; // 3

    // Initial depth at level 0
    const initialDepth = calculateAnnotationDepth(verbosity, 0);

    // Pump signals until level-up
    const signal = {
      dimension: 'implementation',
      weight: 0.20,
      type: 'positive',
      sub_concept: 'tdd_red_green_refactor',
    };

    for (let i = 0; i < 20; i++) {
      const result = updateLevel(profile, signal);
      profile = result.profile;
      if (result.levelChanged) break;
    }

    assert.equal(profile.dimensions.implementation.level, 1, 'Should have leveled up to 1');

    // Depth at level 1 should be less than at level 0
    const newDepth = calculateAnnotationDepth(verbosity, profile.dimensions.implementation.level);
    assert.ok(newDepth < initialDepth,
      `Depth after level-up (${newDepth}) should be less than initial (${initialDepth})`);
  });

  it('full flow: level-up → persist → reload → annotation uses new level', () => {
    let profile = makeDefaultProfile();

    // Level up implementation via manual override (simulates accumulated signals)
    profile = manualOverride(profile, 'implementation', 3);
    saveProfile(profile);

    // Reload in "new session"
    const loaded = loadProfile();
    const depth = calculateAnnotationDepth(
      loaded.settings.verbosity, // 3
      loaded.dimensions.implementation.level // 3
    );
    // max(0, 3 - (3-1)) = 1
    assert.equal(depth, 1, 'Annotation depth should reflect persisted level');
  });

  it('average level tracks overall progression', () => {
    let profile = makeDefaultProfile();
    assert.equal(getAverageLevel(profile), 0.0);

    // Level up a few dimensions
    profile = manualOverride(profile, 'planning', 2);
    profile = manualOverride(profile, 'implementation', 3);
    profile = manualOverride(profile, 'git_workflow', 1);

    // Average = (2+3+1) / 9 = 0.67 → rounded to 0.7
    const avg = getAverageLevel(profile);
    assert.ok(avg > 0.5 && avg < 1.0, `Expected average ~0.7, got ${avg}`);
  });
});
