'use strict';

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const os = require('os');

const {
  updateLevel,
  manualOverride,
  resetLevels,
  calculateAnnotationDepth,
  getAverageLevel,
  evaluatePhaseTransition,
  detectMismatch,
  identifyStretchOpportunity,
} = require('../../scripts/lib/competence-engine');

const { createDefaultProfile } = require('../../scripts/lib/learner-profile');

// --- Helpers ---

let tmpDir;

function setupTmpDir() {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mdh-ce-'));
  process.env.MDH_STATE_DIR = tmpDir;
}

function teardownTmpDir() {
  delete process.env.MDH_STATE_DIR;
  if (tmpDir && fs.existsSync(tmpDir)) {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
  tmpDir = null;
}

function makeSignal(overrides = {}) {
  return {
    dimension: 'implementation',
    weight: 0.15,
    reason: 'test signal',
    type: 'positive',
    sub_concept: null,
    ...overrides,
  };
}

// --- updateLevel Tests ---

describe('updateLevel', () => {
  beforeEach(setupTmpDir);
  afterEach(teardownTmpDir);

  it('applies positive signal with dampened weight (confidence 0.3)', () => {
    const profile = createDefaultProfile();
    const signal = makeSignal({ weight: 0.15 });
    const result = updateLevel(profile, signal);
    // dampened = 0.15 * (1.0 - 0.3 * 0.5) = 0.15 * 0.85 = 0.1275
    const expected = 0.15 * (1.0 - 0.3 * 0.5);
    assert.ok(Math.abs(result.dampedDelta - expected) < 0.0001,
      `Expected dampedDelta ~${expected}, got ${result.dampedDelta}`);
    assert.ok(Math.abs(result.profile.dimensions.implementation.fractional_level - expected) < 0.0001);
  });

  it('applies positive signal with high confidence (0.9)', () => {
    const profile = createDefaultProfile();
    profile.dimensions.implementation.confidence = 0.9;
    const signal = makeSignal({ weight: 0.15 });
    const result = updateLevel(profile, signal);
    // dampened = 0.15 * (1.0 - 0.9 * 0.5) = 0.15 * 0.55 = 0.0825
    const expected = 0.15 * (1.0 - 0.9 * 0.5);
    assert.ok(Math.abs(result.dampedDelta - expected) < 0.0001);
  });

  it('triggers level-up on boundary crossing', () => {
    const profile = createDefaultProfile();
    // Apply enough signals to cross from level 0 to 1
    let current = profile;
    let levelUp = false;
    for (let i = 0; i < 20; i++) {
      const result = updateLevel(current, makeSignal({ weight: 0.15 }));
      current = result.profile;
      if (result.levelChanged && result.direction === 'up') {
        levelUp = true;
        assert.equal(result.newLevel, 1);
        assert.equal(result.profile.dimensions.implementation.level, 1);
        assert.equal(result.profile.dimensions.implementation.fractional_level, 1.0);
        assert.equal(result.profile.signal_accumulator.implementation, 0.0);
        break;
      }
    }
    assert.ok(levelUp, `Should have triggered a level-up within 20 signals. Final fractional: ${current.dimensions.implementation.fractional_level}`);
  });

  it('triggers level-down on boundary crossing', () => {
    const profile = createDefaultProfile();
    profile.dimensions.implementation.level = 3;
    profile.dimensions.implementation.fractional_level = 3.0;

    let current = profile;
    let levelDown = false;
    for (let i = 0; i < 30; i++) {
      const result = updateLevel(current, makeSignal({ weight: -0.15 }));
      current = result.profile;
      if (result.levelChanged && result.direction === 'down') {
        levelDown = true;
        assert.equal(result.newLevel, 2);
        assert.equal(result.profile.dimensions.implementation.level, 2);
        assert.equal(result.profile.dimensions.implementation.fractional_level, 2.0);
        assert.equal(result.profile.signal_accumulator.implementation, 0.0);
        break;
      }
    }
    assert.ok(levelDown, `Should have triggered a level-down within 30 signals. Final fractional: ${current.dimensions.implementation.fractional_level}`);
  });

  it('does not change level with only 2 small signals', () => {
    const profile = createDefaultProfile();
    let current = profile;
    for (let i = 0; i < 2; i++) {
      const result = updateLevel(current, makeSignal({ weight: 0.15 }));
      current = result.profile;
      assert.equal(result.levelChanged, false);
      assert.equal(result.newLevel, 0);
    }
  });

  it('caps level at 5', () => {
    const profile = createDefaultProfile();
    profile.dimensions.implementation.level = 5;
    profile.dimensions.implementation.fractional_level = 5.0;
    const result = updateLevel(profile, makeSignal({ weight: 0.15 }));
    assert.equal(result.profile.dimensions.implementation.level, 5);
  });

  it('floors level at 0 and fractional_level at 0.0', () => {
    const profile = createDefaultProfile();
    const result = updateLevel(profile, makeSignal({ weight: -0.15 }));
    assert.ok(result.profile.dimensions.implementation.fractional_level >= 0.0);
    assert.equal(result.profile.dimensions.implementation.level, 0);
  });

  it('grows confidence after each signal', () => {
    const profile = createDefaultProfile();
    // default confidence 0.3, evidence_count 0
    let current = profile;
    const result1 = updateLevel(current, makeSignal());
    // After 1 signal: confidence = min(0.95, 0.3 + 1*0.05) = 0.35
    assert.ok(Math.abs(result1.profile.dimensions.implementation.confidence - 0.35) < 0.001);
    assert.equal(result1.profile.dimensions.implementation.evidence_count, 1);

    current = result1.profile;
    // Apply 4 more signals (total 5)
    for (let i = 0; i < 4; i++) {
      const r = updateLevel(current, makeSignal());
      current = r.profile;
    }
    // After 5 signals: confidence = min(0.95, 0.3 + 5*0.05) = 0.55
    assert.ok(Math.abs(current.dimensions.implementation.confidence - 0.55) < 0.001);
    assert.equal(current.dimensions.implementation.evidence_count, 5);
  });

  it('caps confidence at 0.95 after 13 signals', () => {
    const profile = createDefaultProfile();
    let current = profile;
    for (let i = 0; i < 13; i++) {
      const r = updateLevel(current, makeSignal());
      current = r.profile;
    }
    assert.ok(Math.abs(current.dimensions.implementation.confidence - 0.95) < 0.001);
  });

  it('increments evidence_count on each signal', () => {
    const profile = createDefaultProfile();
    const r = updateLevel(profile, makeSignal());
    assert.equal(r.profile.dimensions.implementation.evidence_count, 1);
  });

  it('sets last_assessed to ISO8601 timestamp', () => {
    const profile = createDefaultProfile();
    const r = updateLevel(profile, makeSignal());
    const ts = r.profile.dimensions.implementation.last_assessed;
    assert.ok(ts !== null);
    assert.ok(!isNaN(Date.parse(ts)));
  });

  it('flag signal does not change accumulator', () => {
    const profile = createDefaultProfile();
    const signal = makeSignal({ type: 'flag', weight: 0 });
    const result = updateLevel(profile, signal);
    assert.equal(result.levelChanged, false);
    assert.equal(result.profile.dimensions.implementation.fractional_level, 0.0);
    assert.equal(result.profile.signal_accumulator.implementation, 0.0);
    // But evidence_count should increase
    assert.equal(result.profile.dimensions.implementation.evidence_count, 1);
  });

  it('invalid dimension returns unchanged profile', () => {
    const profile = createDefaultProfile();
    const signal = makeSignal({ dimension: 'nonexistent' });
    const result = updateLevel(profile, signal);
    assert.equal(result.levelChanged, false);
  });

  it('does not mutate the original profile', () => {
    const profile = createDefaultProfile();
    const frozen = JSON.parse(JSON.stringify(profile));
    updateLevel(profile, makeSignal());
    assert.deepStrictEqual(profile, frozen);
  });

  it('resets signal_accumulator on level-up', () => {
    const profile = createDefaultProfile();
    let current = profile;
    for (let i = 0; i < 20; i++) {
      const result = updateLevel(current, makeSignal({ weight: 0.15 }));
      current = result.profile;
      if (result.levelChanged) {
        assert.equal(current.signal_accumulator.implementation, 0.0);
        break;
      }
    }
  });

  it('updates sub-concept when specified', () => {
    const profile = createDefaultProfile();
    // Set dimension to level 2 so sub-concept can converge
    profile.dimensions.implementation.level = 2;
    profile.dimensions.implementation.fractional_level = 2.0;
    const signal = makeSignal({
      weight: 0.15,
      sub_concept: 'tdd_red_green_refactor',
    });
    const result = updateLevel(profile, signal);
    const sub = result.profile.dimensions.implementation.sub_concepts.tdd_red_green_refactor;
    // Sub-concept was at level 0, dimension at level 2, positive signal → sub moves up by 1
    assert.equal(sub.level, 1);
    assert.ok(sub.confidence > 0.3); // Should have increased
  });

  it('sub-concept converges toward dimension level', () => {
    const profile = createDefaultProfile();
    profile.dimensions.implementation.level = 3;
    profile.dimensions.implementation.fractional_level = 3.0;
    // Sub-concept at level 0, dimension at level 3 — positive signal should move sub up
    const signal = makeSignal({ weight: 0.15, sub_concept: 'tdd_red_green_refactor' });
    const result = updateLevel(profile, signal);
    assert.equal(result.profile.dimensions.implementation.sub_concepts.tdd_red_green_refactor.level, 1);
  });

  it('handles multiple successive signals and produces level-up', () => {
    const profile = createDefaultProfile();
    let current = profile;
    let levelUpHappened = false;
    // With confidence dampening (0.3 → 0.95), each signal is progressively smaller.
    // Calculation shows ~9 signals needed due to dampening growth.
    for (let i = 0; i < 12; i++) {
      const result = updateLevel(current, makeSignal({ weight: 0.15 }));
      current = result.profile;
      if (result.levelChanged && result.direction === 'up') {
        levelUpHappened = true;
        // Verify consistent state
        assert.equal(current.dimensions.implementation.level, 1);
        assert.equal(current.dimensions.implementation.fractional_level, 1.0);
        break;
      }
    }
    assert.ok(levelUpHappened, `Should level up within 12 signals of +0.15. Final fractional: ${current.dimensions.implementation.fractional_level}`);
  });
});

// --- calculateAnnotationDepth Tests ---

describe('calculateAnnotationDepth', () => {
  it('V3 L0 = depth 4', () => {
    assert.equal(calculateAnnotationDepth(3, 0), 4);
  });

  it('V3 L3 = depth 1', () => {
    assert.equal(calculateAnnotationDepth(3, 3), 1);
  });

  it('V3 L5 = depth 0', () => {
    assert.equal(calculateAnnotationDepth(3, 5), 0);
  });

  it('V5 L3 = depth 3', () => {
    assert.equal(calculateAnnotationDepth(5, 3), 3);
  });

  it('V1 L1 = depth 1', () => {
    assert.equal(calculateAnnotationDepth(1, 1), 1);
  });

  it('V1 L2 = depth 0', () => {
    assert.equal(calculateAnnotationDepth(1, 2), 0);
  });

  it('V5 L0 = depth 5 (clamped)', () => {
    // max(0, 5 - (0-1)) = 6, but should be clamped to 5
    assert.equal(calculateAnnotationDepth(5, 0), 5);
  });
});

// --- manualOverride Tests ---

describe('manualOverride', () => {
  beforeEach(setupTmpDir);
  afterEach(teardownTmpDir);

  it('overrides dimension level, fractional_level, confidence, and accumulator', () => {
    const profile = createDefaultProfile();
    profile.dimensions.planning.level = 1;
    profile.dimensions.planning.fractional_level = 1.3;
    const updated = manualOverride(profile, 'planning', 4);
    assert.equal(updated.dimensions.planning.level, 4);
    assert.equal(updated.dimensions.planning.fractional_level, 4.0);
    assert.equal(updated.dimensions.planning.confidence, 0.5);
    assert.equal(updated.signal_accumulator.planning, 0.0);
  });

  it('overrides sub-concept level and confidence', () => {
    const profile = createDefaultProfile();
    const updated = manualOverride(profile, 'planning', 2, 'risk_identification');
    assert.equal(updated.dimensions.planning.sub_concepts.risk_identification.level, 2);
    assert.equal(updated.dimensions.planning.sub_concepts.risk_identification.confidence, 0.5);
  });

  it('does not mutate original profile', () => {
    const profile = createDefaultProfile();
    const frozen = JSON.parse(JSON.stringify(profile));
    manualOverride(profile, 'planning', 4);
    assert.deepStrictEqual(profile, frozen);
  });
});

// --- resetLevels Tests ---

describe('resetLevels', () => {
  beforeEach(setupTmpDir);
  afterEach(teardownTmpDir);

  it('resets all dimensions to level 0', () => {
    const profile = createDefaultProfile();
    profile.dimensions.planning.level = 3;
    profile.dimensions.planning.fractional_level = 3.5;
    profile.dimensions.planning.confidence = 0.8;
    profile.dimensions.planning.evidence_count = 10;
    const reset = resetLevels(profile);
    for (const dim of Object.values(reset.dimensions)) {
      assert.equal(dim.level, 0);
      assert.equal(dim.fractional_level, 0.0);
      assert.equal(dim.confidence, 0.3);
      assert.equal(dim.evidence_count, 0);
    }
  });

  it('preserves user info', () => {
    const profile = createDefaultProfile();
    profile.user.name = 'Test User';
    profile.user.domain = 'cooking';
    const reset = resetLevels(profile);
    assert.equal(reset.user.name, 'Test User');
    assert.equal(reset.user.domain, 'cooking');
  });

  it('preserves projects', () => {
    const profile = createDefaultProfile();
    profile.projects = [{ id: 'proj-001', name: 'Test', status: 'active' }];
    const reset = resetLevels(profile);
    assert.equal(reset.projects.length, 1);
    assert.equal(reset.projects[0].id, 'proj-001');
  });

  it('zeroes signal_accumulator', () => {
    const profile = createDefaultProfile();
    profile.signal_accumulator.planning = 0.45;
    const reset = resetLevels(profile);
    for (const val of Object.values(reset.signal_accumulator)) {
      assert.equal(val, 0.0);
    }
  });

  it('does not mutate original profile', () => {
    const profile = createDefaultProfile();
    profile.dimensions.planning.level = 3;
    const frozen = JSON.parse(JSON.stringify(profile));
    resetLevels(profile);
    assert.deepStrictEqual(profile, frozen);
  });
});

// --- evaluatePhaseTransition Tests ---

describe('evaluatePhaseTransition', () => {
  beforeEach(setupTmpDir);
  afterEach(teardownTmpDir);

  it('Phase 0→1: eligible with active project', () => {
    const profile = createDefaultProfile();
    profile.projects = [{ id: 'proj-001', status: 'active' }];
    const result = evaluatePhaseTransition(profile);
    assert.equal(result.eligible, true);
    assert.equal(result.nextPhase, 1);
    assert.ok(result.metCriteria.length > 0);
  });

  it('Phase 0→1: not eligible without project', () => {
    const profile = createDefaultProfile();
    const result = evaluatePhaseTransition(profile);
    assert.equal(result.eligible, false);
    assert.ok(result.unmetCriteria.length > 0);
  });

  it('Phase 1→2: eligible when planning and implementation at 2+', () => {
    const profile = createDefaultProfile();
    profile.settings.phase = 1;
    profile.dimensions.planning.level = 2;
    profile.dimensions.implementation.level = 2;
    const result = evaluatePhaseTransition(profile);
    assert.equal(result.eligible, true);
    assert.equal(result.nextPhase, 2);
  });

  it('Phase 1→2: not eligible when planning at 1', () => {
    const profile = createDefaultProfile();
    profile.settings.phase = 1;
    profile.dimensions.planning.level = 1;
    profile.dimensions.implementation.level = 2;
    const result = evaluatePhaseTransition(profile);
    assert.equal(result.eligible, false);
    assert.ok(result.unmetCriteria.some(c => c.includes('planning')));
  });

  it('Phase 2→3: 3 dims at 3+', () => {
    const profile = createDefaultProfile();
    profile.settings.phase = 2;
    profile.dimensions.planning.level = 3;
    profile.dimensions.implementation.level = 3;
    profile.dimensions.review.level = 3;
    const result = evaluatePhaseTransition(profile);
    assert.equal(result.eligible, true);
    assert.equal(result.nextPhase, 3);
  });

  it('Phase 3→4: 5 dims at 4+', () => {
    const profile = createDefaultProfile();
    profile.settings.phase = 3;
    profile.dimensions.planning.level = 4;
    profile.dimensions.implementation.level = 4;
    profile.dimensions.review.level = 4;
    profile.dimensions.security.level = 4;
    profile.dimensions.verification.level = 4;
    const result = evaluatePhaseTransition(profile);
    assert.equal(result.eligible, true);
    assert.equal(result.nextPhase, 4);
  });

  it('Phase 4→5: 7 dims at 4+', () => {
    const profile = createDefaultProfile();
    profile.settings.phase = 4;
    for (const dim of ['planning', 'implementation', 'review', 'security', 'verification', 'git_workflow', 'architecture']) {
      profile.dimensions[dim].level = 4;
    }
    const result = evaluatePhaseTransition(profile);
    assert.equal(result.eligible, true);
    assert.equal(result.nextPhase, 5);
  });

  it('Phase 5: already at max', () => {
    const profile = createDefaultProfile();
    profile.settings.phase = 5;
    const result = evaluatePhaseTransition(profile);
    assert.equal(result.eligible, false);
    assert.ok(result.unmetCriteria.some(c => c.includes('max')));
  });

  it('struggling dimension blocks transition', () => {
    const profile = createDefaultProfile();
    profile.settings.phase = 1;
    profile.dimensions.planning.level = 2;
    profile.dimensions.implementation.level = 2;
    // Simulate struggling: 3 recent sessions with negative signals for planning
    profile.session_history = [
      { session_id: 's1', date: '2026-03-20', level_changes: [], dimension_signals: { planning: { negative: 3 } } },
      { session_id: 's2', date: '2026-03-21', level_changes: [], dimension_signals: { planning: { negative: 2 } } },
      { session_id: 's3', date: '2026-03-22', level_changes: [], dimension_signals: { planning: { negative: 4 } } },
    ];
    // And negative accumulator
    profile.signal_accumulator.planning = -0.5;
    const result = evaluatePhaseTransition(profile);
    assert.equal(result.hasStrugglingDimensions, true);
    assert.equal(result.eligible, false);
  });
});

// --- detectMismatch Tests ---

describe('detectMismatch', () => {
  beforeEach(setupTmpDir);
  afterEach(teardownTmpDir);

  it('returns "normal" for profile with mixed signals', () => {
    const profile = createDefaultProfile();
    profile.session_history = [
      { session_id: 's1', dimension_signals: { implementation: { positive: 2, negative: 1 } } },
      { session_id: 's2', dimension_signals: { implementation: { positive: 1, negative: 1 } } },
      { session_id: 's3', dimension_signals: { implementation: { positive: 2, negative: 0 } } },
    ];
    const result = detectMismatch(profile, 'implementation');
    assert.equal(result.status, 'normal');
  });

  it('returns "struggling" with 3+ negative signals in recent sessions', () => {
    const profile = createDefaultProfile();
    profile.session_history = [
      { session_id: 's1', dimension_signals: { implementation: { positive: 0, negative: 2 } } },
      { session_id: 's2', dimension_signals: { implementation: { positive: 0, negative: 1 } } },
      { session_id: 's3', dimension_signals: { implementation: { positive: 0, negative: 2 } } },
    ];
    const result = detectMismatch(profile, 'implementation');
    assert.equal(result.status, 'struggling');
    assert.ok(result.signals.length > 0);
  });

  it('returns "bored" with many positive signals and no level change', () => {
    const profile = createDefaultProfile();
    profile.dimensions.implementation.level = 2;
    profile.session_history = [
      { session_id: 's1', dimension_signals: { implementation: { positive: 3, negative: 0 } }, level_changes: [] },
      { session_id: 's2', dimension_signals: { implementation: { positive: 2, negative: 0 } }, level_changes: [] },
      { session_id: 's3', dimension_signals: { implementation: { positive: 3, negative: 0 } }, level_changes: [] },
      { session_id: 's4', dimension_signals: { implementation: { positive: 2, negative: 0 } }, level_changes: [] },
      { session_id: 's5', dimension_signals: { implementation: { positive: 2, negative: 0 } }, level_changes: [] },
    ];
    const result = detectMismatch(profile, 'implementation');
    assert.equal(result.status, 'bored');
  });
});

// --- identifyStretchOpportunity Tests ---

describe('identifyStretchOpportunity', () => {
  beforeEach(setupTmpDir);
  afterEach(teardownTmpDir);

  it('ready when in top 30% of band at Phase 2', () => {
    const profile = createDefaultProfile();
    profile.settings.phase = 2;
    profile.dimensions.implementation.level = 1;
    profile.dimensions.implementation.fractional_level = 1.75;
    const result = identifyStretchOpportunity(profile, 'implementation');
    assert.equal(result.ready, true);
  });

  it('not ready when below threshold', () => {
    const profile = createDefaultProfile();
    profile.settings.phase = 2;
    profile.dimensions.implementation.level = 1;
    profile.dimensions.implementation.fractional_level = 1.5;
    const result = identifyStretchOpportunity(profile, 'implementation');
    assert.equal(result.ready, false);
  });

  it('not ready at wrong phase (Phase 1)', () => {
    const profile = createDefaultProfile();
    profile.settings.phase = 1;
    profile.dimensions.implementation.level = 1;
    profile.dimensions.implementation.fractional_level = 1.8;
    const result = identifyStretchOpportunity(profile, 'implementation');
    assert.equal(result.ready, false);
  });

  it('not ready at Phase 4+', () => {
    const profile = createDefaultProfile();
    profile.settings.phase = 4;
    profile.dimensions.implementation.level = 3;
    profile.dimensions.implementation.fractional_level = 3.9;
    const result = identifyStretchOpportunity(profile, 'implementation');
    assert.equal(result.ready, false);
  });

  it('ready at exactly threshold (level + 0.7)', () => {
    const profile = createDefaultProfile();
    profile.settings.phase = 3;
    profile.dimensions.implementation.level = 2;
    profile.dimensions.implementation.fractional_level = 2.7;
    const result = identifyStretchOpportunity(profile, 'implementation');
    assert.equal(result.ready, true);
  });

  it('returns currentFractional and threshold in result', () => {
    const profile = createDefaultProfile();
    profile.settings.phase = 2;
    profile.dimensions.implementation.level = 1;
    profile.dimensions.implementation.fractional_level = 1.75;
    const result = identifyStretchOpportunity(profile, 'implementation');
    assert.equal(result.currentFractional, 1.75);
    assert.equal(result.threshold, 1.7);
  });
});

// --- getAverageLevel Tests ---

describe('getAverageLevel', () => {
  beforeEach(setupTmpDir);
  afterEach(teardownTmpDir);

  it('returns 0.0 when all dimensions at 0', () => {
    const profile = createDefaultProfile();
    assert.equal(getAverageLevel(profile), 0.0);
  });

  it('returns correct average for mixed levels', () => {
    const profile = createDefaultProfile();
    const levels = [0, 1, 2, 3, 4, 5, 2, 1, 0]; // sum=18, avg=2.0
    const dims = Object.keys(profile.dimensions);
    for (let i = 0; i < dims.length; i++) {
      profile.dimensions[dims[i]].level = levels[i];
    }
    assert.equal(getAverageLevel(profile), 2.0);
  });

  it('returns 5.0 when all at 5', () => {
    const profile = createDefaultProfile();
    for (const dim of Object.values(profile.dimensions)) {
      dim.level = 5;
    }
    assert.equal(getAverageLevel(profile), 5.0);
  });
});
