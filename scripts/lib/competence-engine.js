'use strict';

const { DIMENSION_NAMES } = require('./learner-profile');

// --- Helpers ---

function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// --- Core Algorithm ---

function updateLevel(profile, signal) {
  const updated = deepCopy(profile);
  const dimension = signal.dimension;

  // Validate dimension
  if (!DIMENSION_NAMES.includes(dimension)) {
    return {
      profile: updated,
      levelChanged: false,
      direction: null,
      newLevel: 0,
      dimension,
      dampedDelta: 0,
      rawDelta: signal.weight,
    };
  }

  const current = updated.dimensions[dimension];

  // Flag signals: evidence only, no accumulator change
  if (signal.type === 'flag') {
    current.evidence_count += 1;
    current.last_assessed = new Date().toISOString();
    return {
      profile: updated,
      levelChanged: false,
      direction: null,
      newLevel: current.level,
      dimension,
      dampedDelta: 0,
      rawDelta: signal.weight,
    };
  }

  // Step 1: Raw delta
  const rawDelta = signal.weight;

  // Step 2: Dampen by confidence
  const dampedDelta = rawDelta * (1.0 - current.confidence * 0.5);

  // Step 3: Apply to fractional level and signal accumulator
  updated.signal_accumulator[dimension] += dampedDelta;
  current.fractional_level += dampedDelta;

  // Floor fractional_level at 0
  if (current.fractional_level < 0) {
    current.fractional_level = 0.0;
  }

  // Step 4: Check for integer boundary crossing
  let levelChanged = false;
  let direction = null;

  if (current.fractional_level >= current.level + 1.0) {
    // Level up
    current.level = Math.min(current.level + 1, 5);
    current.fractional_level = current.level;
    updated.signal_accumulator[dimension] = 0.0;
    levelChanged = true;
    direction = 'up';
  } else if (current.level > 0 && current.fractional_level <= current.level - 1.0) {
    // Level down
    current.level = Math.max(current.level - 1, 0);
    current.fractional_level = current.level;
    updated.signal_accumulator[dimension] = 0.0;
    levelChanged = true;
    direction = 'down';
  }

  // Step 5: Update confidence
  current.evidence_count += 1;
  current.confidence = Math.min(0.95, 0.3 + current.evidence_count * 0.05);

  // Step 6: Update timestamp
  current.last_assessed = new Date().toISOString();

  // Step 7: Update sub-concept if specified
  if (signal.sub_concept && current.sub_concepts && signal.sub_concept in current.sub_concepts) {
    const sub = current.sub_concepts[signal.sub_concept];
    if (signal.weight > 0 && sub.level < current.level) {
      sub.level = Math.min(sub.level + 1, 5);
    } else if (signal.weight < 0 && sub.level > current.level) {
      sub.level = Math.max(sub.level - 1, 0);
    }
    sub.confidence = Math.min(0.95, sub.confidence + 0.05);
  }

  return {
    profile: updated,
    levelChanged,
    direction,
    newLevel: current.level,
    dimension,
    dampedDelta,
    rawDelta,
  };
}

// --- Annotation Depth ---

function calculateAnnotationDepth(verbosity, dimensionLevel) {
  return Math.min(5, Math.max(0, verbosity - (dimensionLevel - 1)));
}

// --- Manual Override ---

function manualOverride(profile, dimension, level, subConcept) {
  const updated = deepCopy(profile);

  if (subConcept) {
    updated.dimensions[dimension].sub_concepts[subConcept].level = level;
    updated.dimensions[dimension].sub_concepts[subConcept].confidence = 0.5;
  } else {
    updated.dimensions[dimension].level = level;
    updated.dimensions[dimension].fractional_level = level;
    updated.dimensions[dimension].confidence = 0.5;
    updated.signal_accumulator[dimension] = 0.0;
  }

  return updated;
}

// --- Reset ---

function resetLevels(profile) {
  const updated = deepCopy(profile);

  for (const dim of DIMENSION_NAMES) {
    updated.dimensions[dim].level = 0;
    updated.dimensions[dim].fractional_level = 0.0;
    updated.dimensions[dim].confidence = 0.3;
    updated.dimensions[dim].evidence_count = 0;
    updated.dimensions[dim].last_assessed = null;
    // Reset sub-concepts too
    for (const sc of Object.keys(updated.dimensions[dim].sub_concepts)) {
      updated.dimensions[dim].sub_concepts[sc].level = 0;
      updated.dimensions[dim].sub_concepts[sc].confidence = 0.3;
    }
    updated.signal_accumulator[dim] = 0.0;
  }

  return updated;
}

// --- Average Level ---

function getAverageLevel(profile) {
  const dims = Object.values(profile.dimensions);
  if (dims.length === 0) return 0.0;
  const sum = dims.reduce((acc, d) => acc + d.level, 0);
  return Math.round((sum / dims.length) * 10) / 10;
}

// --- Phase Transition ---

function checkStrugglingDimensions(profile) {
  // A dimension is struggling if its signal_accumulator is negative
  // and the last 3 sessions show negative signals for it
  const history = profile.session_history || [];
  const recentSessions = history.slice(-3);
  if (recentSessions.length < 3) return false;

  for (const dim of DIMENSION_NAMES) {
    if (profile.signal_accumulator[dim] >= 0) continue;

    // Check if all 3 recent sessions had negative signals for this dimension
    const allNegative = recentSessions.every(s => {
      const signals = s.dimension_signals && s.dimension_signals[dim];
      return signals && signals.negative > 0;
    });

    if (allNegative) return true;
  }

  return false;
}

function evaluatePhaseTransition(profile) {
  const currentPhase = profile.settings.phase;
  const nextPhase = currentPhase + 1;

  if (nextPhase > 5) {
    return {
      eligible: false,
      currentPhase,
      nextPhase: 5,
      metCriteria: [],
      unmetCriteria: ['Already at max phase'],
      hasStrugglingDimensions: false,
    };
  }

  const dimensions = profile.dimensions;
  const metCriteria = [];
  const unmetCriteria = [];

  switch (nextPhase) {
    case 1: {
      const hasProject = (profile.projects || []).some(p => p.status === 'active');
      if (hasProject) metCriteria.push('Has active project');
      else unmetCriteria.push('Needs an active project with MVP defined');
      break;
    }
    case 2: {
      const planOk = dimensions.planning.level >= 2;
      const implOk = dimensions.implementation.level >= 2;
      if (planOk) metCriteria.push('planning at Level 2+');
      else unmetCriteria.push('planning needs Level 2+');
      if (implOk) metCriteria.push('implementation at Level 2+');
      else unmetCriteria.push('implementation needs Level 2+');
      break;
    }
    case 3: {
      const dimsAt3 = Object.entries(dimensions).filter(([, v]) => v.level >= 3);
      if (dimsAt3.length >= 3) metCriteria.push(`${dimsAt3.length} dimensions at Level 3+`);
      else unmetCriteria.push(`Need 3 dimensions at Level 3+ (have ${dimsAt3.length})`);
      break;
    }
    case 4: {
      const dimsAt4 = Object.entries(dimensions).filter(([, v]) => v.level >= 4);
      if (dimsAt4.length >= 5) metCriteria.push(`${dimsAt4.length} dimensions at Level 4+`);
      else unmetCriteria.push(`Need 5 dimensions at Level 4+ (have ${dimsAt4.length})`);
      break;
    }
    case 5: {
      const dimsAt4 = Object.entries(dimensions).filter(([, v]) => v.level >= 4);
      if (dimsAt4.length >= 7) metCriteria.push(`${dimsAt4.length} dimensions at Level 4+`);
      else unmetCriteria.push(`Need 7 dimensions at Level 4+ (have ${dimsAt4.length})`);
      break;
    }
  }

  const hasStrugglingDimensions = checkStrugglingDimensions(profile);
  if (hasStrugglingDimensions) {
    unmetCriteria.push('Has struggling dimensions (negative signal accumulator for 3+ sessions)');
  }

  const eligible = unmetCriteria.length === 0;

  return { eligible, currentPhase, nextPhase, metCriteria, unmetCriteria, hasStrugglingDimensions };
}

// --- Mismatch Detection ---

function countRecentSignals(history, dimension, sessionCount, type) {
  const recent = history.slice(-sessionCount);
  let total = 0;
  for (const session of recent) {
    const signals = session.dimension_signals && session.dimension_signals[dimension];
    if (signals && signals[type]) {
      total += signals[type];
    }
  }
  return total;
}

function detectMismatch(profile, dimension) {
  const history = profile.session_history || [];
  const recentNeg = countRecentSignals(history, dimension, 3, 'negative');
  const recentPos = countRecentSignals(history, dimension, 3, 'positive');

  // Struggling: 3+ negative signals in last 3 sessions
  if (recentNeg >= 3) {
    return {
      status: 'struggling',
      signals: [`${recentNeg} negative signals in last 3 sessions`],
    };
  }

  // Bored: 6+ positive signals across recent sessions with no level change in 5+ sessions
  if (recentPos >= 6) {
    const recentSessions = history.slice(-5);
    const hadLevelChange = recentSessions.some(s => {
      const changes = s.level_changes || [];
      return changes.some(c => c.dimension === dimension);
    });
    if (!hadLevelChange && recentSessions.length >= 5) {
      return {
        status: 'bored',
        signals: ['Consistently positive signals with no level advancement — may be too easy'],
      };
    }
  }

  return { status: 'normal', signals: [] };
}

// --- Stretch Opportunity ---

function identifyStretchOpportunity(profile, dimension) {
  const phase = profile.settings.phase;
  const dim = profile.dimensions[dimension];
  const threshold = dim.level + 0.7;

  // Phase must be 2-3
  if (phase < 2 || phase > 3) {
    return { ready: false, currentFractional: dim.fractional_level, threshold };
  }

  const ready = dim.fractional_level >= threshold;
  return { ready, currentFractional: dim.fractional_level, threshold };
}

// --- Exports ---

module.exports = {
  updateLevel,
  manualOverride,
  resetLevels,
  calculateAnnotationDepth,
  getAverageLevel,
  evaluatePhaseTransition,
  detectMismatch,
  identifyStretchOpportunity,
};
