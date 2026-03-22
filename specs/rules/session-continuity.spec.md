# Component: session-continuity
## Type: rule
## Status: pending
## Session Target: 1

## What This Is
Defines learner state persistence requirements. This rule ensures that the learner profile is always saved and loaded correctly, that session history is append-only, and that no learner progress is ever lost between sessions. It is the data integrity contract for the adaptive difficulty system.

## Content Specification

The rule file must contain these exact behavioral constraints:

### Profile Persistence
- The learner profile MUST be saved on every Stop event (implemented by learner-state-persist hook)
- The learner profile MUST be loaded on every SessionStart event (implemented by session-start-loader hook)
- If no profile exists at session start, create one with default values:
  - All 9 dimensions at Level 0
  - Confidence 0.3 for all dimensions
  - Verbosity 3
  - Phase 0
  - Teaching mode "directive"
  - Empty projects, session_history, zeroed signal_accumulator

### Profile Location
- Path: `state/learner-profile.json` relative to the plugin root
- The state/ directory is gitignored — learner data never enters version control
- All learner data is local. Nothing is transmitted or uploaded.

### Session History
- Session history is append-only. Previous session entries are NEVER modified.
- Each session entry records: session_id, date, duration, project_id, pipeline_steps_executed, signals_captured, level_changes, concepts_introduced, user_initiated_actions, claude_initiated_actions, handoff_notes
- Session history provides the longitudinal data for phase transition evaluation

### Signal Accumulator
- The signal accumulator tracks fractional progress toward level changes
- Signals are accumulated across the session and persisted on every Stop event
- When a level boundary is crossed (fractional_level reaches the next integer), the level updates
- Level-ups are noted in session history level_changes array
- Level-downs are silent (no notification, just more help)

### State Recovery
- If the profile file is corrupted or unreadable, create a new default profile
- Log a warning that previous state was lost, but do not block the session
- The user can always start fresh with /level reset

### Data Owned by This Contract
The following fields in the learner profile are governed by this rule:
- `schema_version` — format version for migration support
- `created_at`, `updated_at` — timestamps
- `session_history[]` — append-only session records
- `signal_accumulator{}` — per-dimension fractional accumulators

### What This Rule Does NOT Cover
- How signals are captured (that is the level-signal-capture hook)
- How levels are calculated (that is the competence-engine library)
- How annotations are generated (that is the teaching-annotation hook)
- How phase transitions work (that is the phase-transition contract)

## Implementation Notes
[Empty — filled during implementation]
