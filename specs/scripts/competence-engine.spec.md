# Component: competence-engine.js
## Type: script (library)
## Status: pending
## Dependencies: scripts/lib/learner-profile.js (for profile shape, level labels, dimension names)
## Session Target: 6

## What This Is

The competence-engine is the core innovation of the Master Dev Harness. It is the algorithm that translates behavioral signals into learner competence levels across 9 dimensions. It implements fractional accumulation with confidence dampening, asymmetric boundary crossing notifications, sub-concept tracking, and manual override handling. This is the engine that makes MDH feel like a perceptive teacher rather than a quiz-based assessment system. Every design decision in this engine prioritizes stability (no jitter), fairness (high confidence resists change), and respect (level-downs are silent).

## Public API

```javascript
/**
 * Apply a behavioral signal to update a dimension's level.
 * This is THE core algorithm of the product.
 *
 * @param {object} profile - The learner profile (will be deep-copied, not mutated)
 * @param {Signal} signal - The signal to apply
 * @returns {UpdateResult}
 */
function updateLevel(profile, signal)

/**
 * @typedef {object} Signal
 * @property {string} dimension - Dimension name (one of 9)
 * @property {number} weight - Signal weight (-0.20 to +0.20)
 * @property {string} reason - Human-readable reason
 * @property {string} type - "positive", "negative", "flag"
 * @property {string|null} sub_concept - Sub-concept to update (optional)
 */

/**
 * @typedef {object} UpdateResult
 * @property {object} profile - The updated profile (new object)
 * @property {boolean} levelChanged - Whether an integer level boundary was crossed
 * @property {string|null} direction - "up", "down", or null
 * @property {number} newLevel - The current integer level after update
 * @property {string} dimension - Which dimension was updated
 * @property {number} dampedDelta - The actual delta applied after dampening
 * @property {number} rawDelta - The original signal weight
 */

/**
 * Apply a manual level override from the user.
 * Sets the level directly, resets confidence to 0.5, preserves evidence.
 *
 * @param {object} profile - The learner profile (will be deep-copied)
 * @param {string} dimension - Dimension to override
 * @param {number} level - New level (0-5)
 * @param {string|null} [subConcept] - Optional sub-concept to override
 * @returns {object} Updated profile (new object)
 */
function manualOverride(profile, dimension, level, subConcept)

/**
 * Reset all levels to 0 (fresh start).
 * Preserves user info and projects but resets all competence data.
 *
 * @param {object} profile - The learner profile (will be deep-copied)
 * @returns {object} Reset profile (new object)
 */
function resetLevels(profile)

/**
 * Calculate the annotation depth for a given dimension.
 * Formula: max(0, verbosity - (dimension_level - 1))
 *
 * @param {number} verbosity - User's verbosity setting (1-5)
 * @param {number} dimensionLevel - Dimension level (0-5)
 * @returns {number} Annotation depth (0-5)
 */
function calculateAnnotationDepth(verbosity, dimensionLevel)

/**
 * Compute the average level across all dimensions.
 * Used for milestone scaling and difficulty recommendations.
 *
 * @param {object} profile - The learner profile
 * @returns {number} Average level (0.0-5.0), rounded to 1 decimal
 */
function getAverageLevel(profile)

/**
 * Check if phase transition criteria are met for the next phase.
 * Does NOT trigger the transition — only evaluates criteria.
 *
 * @param {object} profile - The learner profile
 * @returns {TransitionEvaluation}
 */
function evaluatePhaseTransition(profile)

/**
 * @typedef {object} TransitionEvaluation
 * @property {boolean} eligible - Whether criteria for next phase are met
 * @property {number} currentPhase - Current phase
 * @property {number} nextPhase - The phase being evaluated for
 * @property {string[]} metCriteria - Criteria that are satisfied
 * @property {string[]} unmetCriteria - Criteria that are NOT satisfied
 * @property {boolean} hasStrugglingDimensions - True if any dimension has negative accumulator for 3+ sessions
 */

/**
 * Detect if the learner is struggling or bored in a dimension.
 * Returns actionable context for the teaching agents.
 *
 * @param {object} profile - The learner profile
 * @param {string} dimension - Dimension to check
 * @returns {{ status: "normal"|"struggling"|"bored", signals: string[] }}
 */
function detectMismatch(profile, dimension)

/**
 * Check if a stretch invitation is appropriate for a dimension.
 * A stretch is appropriate when the learner is in the top 30% of their
 * current level band (fractional_level >= level + 0.7), the phase is 2-3,
 * and no stretch has been offered for this dimension this session.
 *
 * @param {object} profile - The learner profile
 * @param {string} dimension - Dimension to check
 * @returns {{ ready: boolean, currentFractional: number, threshold: number }}
 */
function identifyStretchOpportunity(profile, dimension)
```

## Implementation Specification

### The Calibration Algorithm (Full — from plan section 2.3)

This is the most important function in the entire MDH codebase. Every line matters.

```
function updateLevel(profile, signal):
    # Deep copy to preserve immutability
    updatedProfile = deepCopy(profile)
    dimension = signal.dimension
    current = updatedProfile.dimensions[dimension]

    # Validate dimension exists
    if dimension not in DIMENSION_NAMES:
        return { profile: updatedProfile, levelChanged: false, direction: null, newLevel: current.level, ... }

    # Flag-type signals do not change levels — they are recorded but do not move the needle
    if signal.type === "flag":
        current.evidence_count += 1
        current.last_assessed = now()
        return { profile: updatedProfile, levelChanged: false, direction: null, newLevel: current.level, ... }

    # Step 1: Apply signal weight
    raw_delta = signal.weight

    # Step 2: Dampen by confidence
    # High confidence = resistant to change. This prevents jitter in well-established assessments.
    # A dimension with confidence 0.3 (new) passes through ~85% of the signal.
    # A dimension with confidence 0.95 (well-established) passes through ~52% of the signal.
    dampened_delta = raw_delta * (1.0 - current.confidence * 0.5)

    # Step 3: Apply to fractional level accumulator
    # The signal_accumulator is the dimension-specific running total.
    # It accumulates fractional progress toward the next integer boundary.
    updatedProfile.signal_accumulator[dimension] += dampened_delta
    current.fractional_level += dampened_delta

    # Step 4: Check for integer boundary crossing
    levelChanged = false
    direction = null

    if current.fractional_level >= current.level + 1.0:
        # LEVEL UP
        current.level = min(current.level + 1, 5)
        current.fractional_level = float(current.level)  # Reset fractional to integer
        updatedProfile.signal_accumulator[dimension] = 0.0  # Reset accumulator
        levelChanged = true
        direction = "up"

    elif current.fractional_level <= current.level - 1.0:
        # LEVEL DOWN
        current.level = max(current.level - 1, 0)
        current.fractional_level = float(current.level)  # Reset fractional to integer
        updatedProfile.signal_accumulator[dimension] = 0.0  # Reset accumulator
        levelChanged = true
        direction = "down"

    # Step 5: Update confidence based on evidence count
    # Confidence grows logarithmically with evidence. It starts at 0.3 (new assessment)
    # and approaches 0.95 (well-established) asymptotically.
    # Formula: min(0.95, 0.3 + evidence_count * 0.05)
    # At 1 signal: 0.35. At 5 signals: 0.55. At 10 signals: 0.80. At 13 signals: 0.95 (cap).
    current.evidence_count += 1
    current.confidence = min(0.95, 0.3 + (current.evidence_count * 0.05))

    # Step 6: Update timestamp
    current.last_assessed = now()

    # Step 7: Update sub-concept if specified
    if signal.sub_concept and signal.sub_concept in current.sub_concepts:
        sub = current.sub_concepts[signal.sub_concept]
        # Sub-concepts track level independently but with simpler logic:
        # They move toward the dimension level with each signal.
        if signal.weight > 0 and sub.level < current.level:
            sub.level = min(sub.level + 1, 5)
        elif signal.weight < 0 and sub.level > current.level:
            sub.level = max(sub.level - 1, 0)
        sub.confidence = min(0.95, sub.confidence + 0.05)

    return {
        profile: updatedProfile,
        levelChanged: levelChanged,
        direction: direction,
        newLevel: current.level,
        dimension: dimension,
        dampedDelta: dampened_delta,
        rawDelta: raw_delta
    }
```

### Key Algorithm Properties

1. **Fractional accumulation** — Many small signals accumulate toward an integer boundary. A single +0.15 signal does not cause a level change. It takes approximately 5-7 positive signals to cross a boundary (depending on confidence dampening). This prevents jitter.

2. **Confidence dampening** — Well-established assessments (high evidence count, high confidence) resist change. A new learner (confidence 0.3) has their signals passed through at ~85% strength. An established learner (confidence 0.95) has signals dampened to ~52.5%. This means early assessments move quickly (responsive to initial behavior), while established assessments require sustained evidence to change (stable).

3. **Asymmetric notification** — Level-ups are celebratory events communicated to the user. Level-downs are silent — the system quietly increases help depth. This prevents discouragement.

4. **Accumulator reset on boundary crossing** — When a level changes, the fractional accumulator resets to the new integer level and the signal_accumulator resets to 0. This prevents "momentum" from carrying over — each level must be earned independently.

5. **Flag signals are evidence-only** — Frustration, long pauses, and other flags increment the evidence count and update the timestamp but do not change the fractional accumulator. They exist to trigger check-in prompts, not level changes.

6. **Sub-concept tracking** — Sub-concepts have their own level and confidence but do not drive dimension-level changes directly. They provide granularity for the teaching system (e.g., "you're Level 3 in implementation overall but Level 1 in error path testing"). Sub-concepts move toward the dimension level on each signal, providing convergence over time.

### Annotation Depth Calculation

```
function calculateAnnotationDepth(verbosity, dimensionLevel):
    return max(0, verbosity - (dimensionLevel - 1))
```

Examples:
- Verbosity 3, Level 0: `max(0, 3 - (0-1))` = `max(0, 4)` = 4
- Verbosity 3, Level 3: `max(0, 3 - (3-1))` = `max(0, 1)` = 1
- Verbosity 3, Level 5: `max(0, 3 - (5-1))` = `max(0, -1)` = 0
- Verbosity 5, Level 3: `max(0, 5 - (3-1))` = `max(0, 3)` = 3
- Verbosity 1, Level 1: `max(0, 1 - (1-1))` = `max(0, 1)` = 1
- Verbosity 1, Level 2: `max(0, 1 - (2-1))` = `max(0, 0)` = 0

### Manual Override

```
function manualOverride(profile, dimension, level, subConcept):
    updatedProfile = deepCopy(profile)

    if subConcept:
        # Override a specific sub-concept
        updatedProfile.dimensions[dimension].sub_concepts[subConcept].level = level
        updatedProfile.dimensions[dimension].sub_concepts[subConcept].confidence = 0.5
    else:
        # Override the entire dimension
        updatedProfile.dimensions[dimension].level = level
        updatedProfile.dimensions[dimension].fractional_level = float(level)
        updatedProfile.dimensions[dimension].confidence = 0.5  # Moderate — respect user's self-assessment but gather evidence
        updatedProfile.signal_accumulator[dimension] = 0.0  # Reset accumulator

    return updatedProfile
```

### Phase Transition Evaluation

From phase-transition-contract.md:

```
function evaluatePhaseTransition(profile):
    currentPhase = profile.settings.phase
    nextPhase = currentPhase + 1
    if nextPhase > 5: return { eligible: false, currentPhase, nextPhase: 5, metCriteria: [], unmetCriteria: ["Already at max phase"], hasStrugglingDimensions: false }

    dimensions = profile.dimensions
    metCriteria = []
    unmetCriteria = []

    switch nextPhase:
        case 1: # Discovery -> Observer
            # Needs a scoped project
            hasProject = profile.projects.some(p => p.status === 'active')
            if hasProject: metCriteria.push("Has active project")
            else: unmetCriteria.push("Needs an active project with MVP defined")

        case 2: # Observer -> Co-Pilot
            # 2 dims at Level 2+ (planning, implementation)
            planOk = dimensions.planning.level >= 2
            implOk = dimensions.implementation.level >= 2
            if planOk: metCriteria.push("planning at Level 2+")
            else: unmetCriteria.push("planning needs Level 2+")
            if implOk: metCriteria.push("implementation at Level 2+")
            else: unmetCriteria.push("implementation needs Level 2+")

        case 3: # Co-Pilot -> Navigator
            # 3 dims at Level 3+
            dimsAt3 = Object.entries(dimensions).filter(([k,v]) => v.level >= 3)
            if dimsAt3.length >= 3: metCriteria.push(`${dimsAt3.length} dimensions at Level 3+`)
            else: unmetCriteria.push(`Need 3 dimensions at Level 3+ (have ${dimsAt3.length})`)

        case 4: # Navigator -> Driver
            # 5 dims at Level 4+
            dimsAt4 = Object.entries(dimensions).filter(([k,v]) => v.level >= 4)
            if dimsAt4.length >= 5: metCriteria.push(`${dimsAt4.length} dimensions at Level 4+`)
            else: unmetCriteria.push(`Need 5 dimensions at Level 4+ (have ${dimsAt4.length})`)

        case 5: # Driver -> Graduate
            # 7 dims at Level 4+
            dimsAt4 = Object.entries(dimensions).filter(([k,v]) => v.level >= 4)
            if dimsAt4.length >= 7: metCriteria.push(`${dimsAt4.length} dimensions at Level 4+`)
            else: unmetCriteria.push(`Need 7 dimensions at Level 4+ (have ${dimsAt4.length})`)

    # Check for struggling dimensions (negative accumulator for 3+ consecutive sessions)
    hasStrugglingDimensions = checkStrugglingDimensions(profile)
    if hasStrugglingDimensions:
        unmetCriteria.push("Has struggling dimensions (negative signal accumulator for 3+ sessions)")

    eligible = unmetCriteria.length === 0

    return { eligible, currentPhase, nextPhase, metCriteria, unmetCriteria, hasStrugglingDimensions }
```

### Mismatch Detection

```
function detectMismatch(profile, dimension):
    dim = profile.dimensions[dimension]
    history = profile.session_history

    # Count recent sessions (last 3) where this dimension had negative signals
    recentNeg = countRecentNegativeSignals(history, dimension, 3)
    recentPos = countRecentPositiveSignals(history, dimension, 3)

    # Bored indicators: user skips explanations, minimal engagement, pace acceleration
    # This is heuristic — check if dimension level hasn't changed in 5+ sessions
    # while signals are consistently positive (user is coasting)
    boredSignals = []
    if recentPos >= 6 and dim.level has not changed in last 5 sessions:
        boredSignals.push("Consistently positive signals with no level advancement — may be too easy")

    # Struggling indicators: repeated negative signals, build failures
    strugglingSignals = []
    if recentNeg >= 3:
        strugglingSignals.push(`${recentNeg} negative signals in last 3 sessions`)

    if strugglingSignals.length > 0:
        return { status: "struggling", signals: strugglingSignals }
    elif boredSignals.length > 0:
        return { status: "bored", signals: boredSignals }
    else:
        return { status: "normal", signals: [] }
```

### Deep Copy

Use `JSON.parse(JSON.stringify(profile))` for deep copy. The profile is a plain JSON object with no functions, dates as strings, no circular references. This is simple and reliable.

## Interface Contract Reference

Implements the calibration algorithm defined in: Plan section 2.3
Reads: `specs/contracts/learner-profile-schema.md` (profile structure)
Reads: `specs/contracts/phase-transition-contract.md` (phase criteria)
Reads: `specs/contracts/agent-annotation-contract.md` (annotation depth formula)

## Implementation Notes

(Empty — filled during implementation)

## Test Requirements

### updateLevel — Core Algorithm Tests

- **Positive signal applies dampened weight:** Signal of +0.15 with confidence 0.3 produces dampened delta of `0.15 * (1.0 - 0.3 * 0.5)` = `0.15 * 0.85` = `0.1275`. Verify `fractional_level` increases by 0.1275.
- **Positive signal with high confidence:** Signal of +0.15 with confidence 0.9 produces dampened delta of `0.15 * (1.0 - 0.9 * 0.5)` = `0.15 * 0.55` = `0.0825`. Verify reduced impact.
- **Level-up on boundary crossing:** Accumulate enough positive signals from level 0 until `fractional_level >= 1.0`. Verify `level` becomes 1, `fractional_level` resets to 1.0, `signal_accumulator` resets to 0.0, result has `levelChanged: true`, `direction: "up"`.
- **Level-down on boundary crossing:** Start at level 3, apply enough negative signals until `fractional_level <= 2.0`. Verify `level` becomes 2, result has `levelChanged: true`, `direction: "down"`.
- **No level change below boundary:** Apply 2 positive signals of +0.15 from level 0. Verify `level` remains 0, `levelChanged: false`.
- **Level capped at 5:** Start at level 5, apply positive signal. Verify level stays at 5.
- **Level floored at 0:** Start at level 0, apply negative signal. Verify level stays at 0 and `fractional_level` does not go below 0.0.
- **Confidence growth:** After 1 signal, confidence is 0.35. After 5 signals, 0.55. After 13 signals, 0.95 (capped).
- **Evidence count increments:** Each signal increments `evidence_count` by 1.
- **Timestamp updated:** Each signal sets `last_assessed` to a recent ISO8601 timestamp.
- **Flag signal — no accumulator change:** Signal of type "flag" increments evidence_count but does not change fractional_level or signal_accumulator.
- **Invalid dimension — no crash:** Signal with dimension "nonexistent" returns unchanged profile with `levelChanged: false`.
- **Immutability:** Verify original profile object is not modified after updateLevel call.
- **Signal accumulator reset on boundary:** After level-up, signal_accumulator for that dimension is 0.0.
- **Sub-concept update:** Signal with sub_concept "tdd_red_green_refactor" updates that sub-concept's level when appropriate.
- **Sub-concept convergence:** Positive signal when sub-concept level < dimension level moves sub-concept level up by 1.
- **Multiple successive signals:** Apply 8 positive signals of +0.15 starting from level 0 with default confidence 0.3. Verify that a level-up occurs and the resulting state is consistent.

### calculateAnnotationDepth Tests

- **V3 L0 = depth 4:** `max(0, 3 - (0-1))` = 4.
- **V3 L3 = depth 1:** `max(0, 3 - (3-1))` = 1.
- **V3 L5 = depth 0:** `max(0, 3 - (5-1))` = 0.
- **V5 L3 = depth 3:** `max(0, 5 - (3-1))` = 3.
- **V1 L1 = depth 1:** `max(0, 1 - (1-1))` = 1.
- **V1 L2 = depth 0:** `max(0, 1 - (2-1))` = 0.
- **V5 L0 = depth 6 clamped to 5:** Result should be clamped to 5 (max annotation depth).

### manualOverride Tests

- **Level override:** Set planning from 1 to 4. Verify level is 4, fractional_level is 4.0, confidence is 0.5, signal_accumulator is 0.0.
- **Sub-concept override:** Set planning:risk_identification from 0 to 2. Verify sub-concept level is 2 and confidence is 0.5.
- **Immutability:** Verify original profile is not modified.

### resetLevels Tests

- **All dimensions reset:** After reset, all dimensions have level 0, fractional_level 0.0, confidence 0.3, evidence_count 0.
- **User info preserved:** User name, domain, interests survive the reset.
- **Projects preserved:** Project list survives the reset.
- **Signal accumulator zeroed:** All entries in signal_accumulator are 0.0.
- **Immutability:** Verify original profile is not modified.

### evaluatePhaseTransition Tests

- **Phase 0 to 1 — has project:** Profile with an active project is eligible.
- **Phase 0 to 1 — no project:** Profile with no projects is not eligible.
- **Phase 1 to 2 — criteria met:** Planning at 2 and implementation at 2. Eligible.
- **Phase 1 to 2 — criteria not met:** Planning at 1. Not eligible. unmetCriteria explains why.
- **Phase 2 to 3 — 3 dims at 3+:** Eligible.
- **Phase 3 to 4 — 5 dims at 4+:** Eligible.
- **Phase 4 to 5 — 7 dims at 4+:** Eligible.
- **Phase 5 — already max:** Not eligible, explains already at max.
- **Struggling dimension blocks transition:** Even if level criteria are met, having a struggling dimension makes the transition ineligible.

### detectMismatch Tests

- **Normal state:** Profile with mixed signals, no pattern. Returns "normal".
- **Struggling:** 3+ negative signals in recent sessions for a dimension. Returns "struggling".
- **Bored:** 6+ positive signals across 3 sessions with no level change. Returns "bored".

### identifyStretchOpportunity Tests

- **Ready — top 30% of band:** Phase 2, fractional_level 1.75 with integer level 1. Returns `{ ready: true }`.
- **Not ready — below threshold:** Phase 2, fractional_level 1.5 with integer level 1. Returns `{ ready: false }`.
- **Not ready — wrong phase:** Phase 1 (Observer), fractional_level 1.8. Returns `{ ready: false }`.
- **Not ready — Phase 4+:** Phase 4, fractional_level 3.9. Returns `{ ready: false }`.
- **Edge — exactly at threshold:** fractional_level exactly level + 0.7. Returns `{ ready: true }`.

### getAverageLevel Tests

- **All zeros:** Returns 0.0.
- **Mixed levels:** dimensions at [0,1,2,3,4,5,2,1,0] returns average rounded to 1 decimal.
- **All fives:** Returns 5.0.
