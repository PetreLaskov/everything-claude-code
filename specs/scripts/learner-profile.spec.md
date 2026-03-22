# Component: learner-profile.js
## Type: script (library)
## Status: pending
## Dependencies: Node.js fs, path modules. No external dependencies.
## Session Target: 2

## What This Is

The learner-profile library is the CRUD layer for the learner profile — the central data structure of the entire MDH system. It handles creating default profiles, loading from disk, saving to disk (atomically), schema validation, and providing convenience accessors for common profile queries. Every hook and every agent that reads or writes learner state depends on this library.

## Public API

```javascript
/**
 * Get the resolved path to the learner profile file.
 * Respects MDH_STATE_DIR env var override.
 * @returns {string} Absolute path to learner-profile.json
 */
function getProfilePath()

/**
 * Create a new default profile with all dimensions at level 0.
 * Writes to disk at getProfilePath(). Creates state/ directory if needed.
 * @returns {object} The created profile object
 */
function createDefaultProfile()

/**
 * Load the learner profile from disk.
 * @returns {object|null} The profile object, or null if file does not exist
 * @throws {Error} If file exists but contains invalid JSON (caller should handle)
 */
function loadProfile()

/**
 * Save the learner profile to disk atomically.
 * Writes to temp file first, then renames.
 * Updates the `updated_at` timestamp automatically.
 * @param {object} profile - The profile object to save
 * @returns {void}
 * @throws {Error} If write fails
 */
function saveProfile(profile)

/**
 * Validate a profile object against the expected schema.
 * Checks for required fields, correct types, valid ranges.
 * @param {object} profile - The profile to validate
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateProfile(profile)

/**
 * Get the active project from the profile, if any.
 * @param {object} profile - The profile object
 * @returns {object|null} The active project entry, or null
 */
function getActiveProject(profile)

/**
 * Get the current phase label for display.
 * @param {number} phase - Phase number (0-5)
 * @returns {string} Phase label ("Discovery", "Observer", "Co-Pilot", "Navigator", "Driver", "Graduate")
 */
function getPhaseLabel(phase)

/**
 * Get the level label for display.
 * @param {number} level - Level number (0-5)
 * @returns {string} Level label ("Unaware", "Aware", "Familiar", "Competent", "Proficient", "Expert")
 */
function getLevelLabel(level)

/**
 * Get the list of all dimension names.
 * @returns {string[]} Array of 9 dimension names
 */
function getDimensionNames()

/**
 * Add a session history entry to the profile.
 * Trims history to keep only the last 50 entries.
 * @param {object} profile - The profile object
 * @param {object} entry - The session history entry
 * @returns {object} The modified profile (new object, not mutated)
 */
function addSessionEntry(profile, entry)

/**
 * Get the most recent session history entry.
 * @param {object} profile - The profile object
 * @returns {object|null} The most recent entry, or null if no history
 */
function getLastSession(profile)
```

## Implementation Specification

### Constants

```javascript
const SCHEMA_VERSION = '1.0.0';
const MAX_SESSION_HISTORY = 50;

const DIMENSION_NAMES = [
  'research', 'planning', 'implementation', 'review',
  'security', 'verification', 'git_workflow', 'architecture', 'orchestration'
];

const PHASE_LABELS = ['Discovery', 'Observer', 'Co-Pilot', 'Navigator', 'Driver', 'Graduate'];
const LEVEL_LABELS = ['Unaware', 'Aware', 'Familiar', 'Competent', 'Proficient', 'Expert'];

const DEFAULT_SUB_CONCEPTS = {
  research: ['github_search', 'library_docs', 'package_registries'],
  planning: ['requirements_analysis', 'phase_breakdown', 'risk_identification', 'dependency_mapping'],
  implementation: ['tdd_red_green_refactor', 'file_organization', 'error_handling', 'immutability', 'input_validation'],
  review: ['reading_review_output', 'evaluating_severity', 'deciding_fix_vs_defer'],
  security: ['secrets_management', 'input_sanitization', 'auth_basics'],
  verification: ['build_check', 'test_coverage', 'lint_and_format'],
  git_workflow: ['staging_and_committing', 'commit_messages', 'branching', 'pull_requests'],
  architecture: ['file_structure', 'separation_of_concerns', 'api_design'],
  orchestration: ['agent_roles', 'pipeline_composition', 'model_routing']
};
```

### Profile Path Resolution

1. Check `process.env.MDH_STATE_DIR` — if set, use `path.join(MDH_STATE_DIR, 'learner-profile.json')`.
2. Check `process.env.CLAUDE_PLUGIN_ROOT` — if set, use `path.join(CLAUDE_PLUGIN_ROOT, 'state', 'learner-profile.json')`.
3. Fallback: `path.resolve(__dirname, '..', '..', 'state', 'learner-profile.json')`.

### Default Profile Construction

Build the full default profile per learner-profile-schema.md:
- `schema_version`: "1.0.0"
- `created_at`: current ISO8601
- `updated_at`: current ISO8601
- `user`: all fields null/empty
- `settings`: `{ verbosity: 3, phase: 0, phase_proposed: null, phase_proposed_at: null, phase_deferred_until_session: null, teaching_mode: "directive" }`
- `dimensions`: for each of the 9 dimension names, create: `{ level: 0, fractional_level: 0.0, confidence: 0.3, last_assessed: null, evidence_count: 0, sub_concepts: {} }`. Populate `sub_concepts` from `DEFAULT_SUB_CONCEPTS` — each sub-concept gets `{ level: 0, confidence: 0.3 }`.
- `projects`: empty array
- `session_history`: empty array
- `signal_accumulator`: object with each dimension name mapped to `0.0`

### Atomic Save

1. Generate temp path: `profilePath + '.tmp.' + Date.now()`
2. Write JSON (pretty-printed, 2-space indent) to temp path
3. Rename temp path to profile path (`fs.renameSync`)
4. On Windows, if rename fails due to lock, fall back to direct write

### Schema Validation

Check:
- `schema_version` is a string
- `dimensions` is an object with exactly 9 keys matching `DIMENSION_NAMES`
- Each dimension has `level` (integer 0-5), `fractional_level` (number), `confidence` (number 0.0-1.0), `evidence_count` (integer >= 0)
- `settings.verbosity` is integer 1-5
- `settings.phase` is integer 0-5
- `settings.teaching_mode` is "directive" or "socratic"
- `projects` is an array
- `session_history` is an array
- `signal_accumulator` is an object with keys matching `DIMENSION_NAMES`

Return `{ valid: true, errors: [] }` or `{ valid: false, errors: ["description of each issue"] }`.

### Immutability

All public functions that modify profile data return NEW objects. `addSessionEntry` returns a new profile with the entry appended. `saveProfile` does not modify the input object. This follows the MDH coding-style rule of immutability.

## Interface Contract Reference

Implements: `specs/contracts/learner-profile-schema.md`

## Implementation Notes

(Empty — filled during implementation)

## Test Requirements

- **createDefaultProfile:** Verify returned profile passes `validateProfile`, has 9 dimensions all at level 0, confidence 0.3, correct sub-concepts for each dimension.
- **createDefaultProfile file creation:** Verify the file is created at `getProfilePath()` and contains valid JSON.
- **loadProfile — existing file:** Write a valid profile, then load it. Verify all fields are preserved.
- **loadProfile — missing file:** Verify returns null when no file exists.
- **loadProfile — invalid JSON:** Write garbage to the profile path. Verify it throws an error.
- **saveProfile — atomic write:** Save a profile, verify the file contains the expected JSON with updated `updated_at`.
- **saveProfile — immutability:** Verify the input object is not modified by saveProfile.
- **validateProfile — valid profile:** A default profile passes validation with no errors.
- **validateProfile — missing dimension:** Remove one dimension. Verify validation returns `valid: false` with a descriptive error.
- **validateProfile — out-of-range values:** Set verbosity to 7. Verify validation catches it. Set level to 6. Verify validation catches it. Set confidence to 1.5. Verify validation catches it.
- **getActiveProject:** Profile with one active project returns it. Profile with no active projects returns null. Profile with multiple projects (one active, one completed) returns the active one.
- **getPhaseLabel:** Verify all 6 phases return correct labels.
- **getLevelLabel:** Verify all 6 levels return correct labels.
- **getDimensionNames:** Returns exactly 9 names in expected order.
- **addSessionEntry:** Verify entry is appended, original profile is not modified, returned profile has the entry.
- **addSessionEntry — trimming:** Add 55 entries. Verify only the last 50 remain.
- **getLastSession:** Returns the last entry. Returns null for empty history.
- **getProfilePath:** Verify MDH_STATE_DIR override works. Verify CLAUDE_PLUGIN_ROOT fallback works. Verify default resolution works.
