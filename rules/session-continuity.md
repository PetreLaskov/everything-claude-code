# Session Continuity

This rule defines learner state persistence requirements. It ensures the learner profile is always saved and loaded correctly, session history is append-only, and no learner progress is ever lost between sessions. It is the data integrity contract for the adaptive difficulty system.

## Profile Persistence

The learner profile MUST be saved on every Stop event. The `learner-state-persist` hook implements this.

The learner profile MUST be loaded on every SessionStart event. The `session-start-loader` hook implements this.

These two operations are non-negotiable. No session starts without loading state. No session ends without saving state.

### Default Profile Creation

If no profile exists at session start, create one with these defaults:

- All 9 dimensions (`research`, `planning`, `implementation`, `review`, `security`, `verification`, `git_workflow`, `architecture`, `orchestration`) at Level 0
- Confidence 0.3 for all dimensions (low but not zero — accounts for possible prior experience)
- `settings.verbosity`: 3 (moderate)
- `settings.phase`: 0 (Discovery)
- `settings.teaching_mode`: "directive"
- `settings.phase_proposed`: null
- `settings.phase_proposed_at`: null
- `settings.phase_deferred_until_session`: null
- `user`: all fields null, interests empty array
- `projects`: empty array
- `session_history`: empty array
- `signal_accumulator`: all 9 dimensions set to 0.0
- `schema_version`: "1.0.0"
- `created_at`: current ISO8601 timestamp
- `updated_at`: current ISO8601 timestamp

## Profile Location

Path: `state/learner-profile.json` relative to the plugin root.

The `state/` directory is gitignored. Learner data never enters version control. All learner data is local to the machine. Nothing is transmitted, uploaded, or shared. The learner owns their data completely.

## Session History

Session history is append-only. Previous session entries are NEVER modified, rewritten, or deleted by any component.

Each session entry records:

| Field | Type | Description |
|-------|------|-------------|
| `session_id` | string | Format: `YYYY-MM-DD-shortid` |
| `date` | string | Format: `YYYY-MM-DD` |
| `duration_minutes` | integer or null | Session length, computed at Stop |
| `project_id` | string or null | Active project during session |
| `pipeline_steps_executed` | string array | Names of pipeline steps completed |
| `signals_captured` | integer | Count of behavioral signals observed |
| `level_changes` | array | Objects with `dimension`, `from`, `to` |
| `concepts_introduced` | string array | New concepts explained this session |
| `user_initiated_actions` | integer | Count of steps the learner initiated |
| `claude_initiated_actions` | integer | Count of steps Claude initiated |
| `handoff_notes` | string or null | Free-text notes for the next session |

Session history provides the longitudinal data the `level-assessor` agent uses for phase transition evaluation. Patterns across sessions (increasing user-initiated actions, decreasing Claude-initiated actions, consistent pipeline completion) drive phase proposals.

## Concept Callbacks

When a concept the learner encountered in a previous session reappears naturally in the current work, name the connection in the narration. This uses existing data — `session_history[].concepts_introduced` and `dimensions.<dim>.sub_concepts.<concept>.confidence`.

Target range: sub-concept confidence between 0.4 and 0.7. Below 0.4 triggers the Novel Concept Override (already handled by adaptive-behavior). Above 0.7 the learner does not need the connection drawn.

The callback is a single phrase woven into the response, not a separate aside:
- "This is the same input validation pattern from the API work — here it is on the database side."
- "You have seen this trade-off before: speed versus safety. Last time we chose safety for the auth flow. Same logic applies here."

Callbacks happen when the concept recurs organically. Never manufacture a callback — if the concept does not arise in the work, do not force it. One or two per session when they fit naturally.

## Cognitive Debt Awareness

Building without understanding what was built creates cognitive debt. Small amounts are acceptable — not every utility function needs deep comprehension. But when core application logic becomes a black box the learner cannot reason about, their ability to steer future development degrades.

The mentor agent should suggest a walkthrough after significant builds in Phases 1-3, woven into the session-end narration: "We built a lot today. Want me to walk through how the auth flow works so you have a clear picture before next session?" This is a suggestion, not a gate — the learner can decline.

The `session_history[].concepts_introduced` array serves as a proxy: if many concepts were introduced in a session but few appear in subsequent sessions with rising confidence, the learner may be accumulating debt in that area. The level-assessor should factor this into its evaluation.

## Signal Accumulator

The signal accumulator tracks fractional progress toward level changes across sessions.

- Each of the 9 dimensions has a float value in `signal_accumulator`.
- Positive values accumulate toward a level-up. Negative values accumulate toward a level-down.
- Signals are accumulated throughout the session by the `level-signal-capture` hook.
- The full accumulator is persisted on every Stop event by the `learner-state-persist` hook.

### Level Boundary Crossing

When `fractional_level` in a dimension reaches the next integer boundary (e.g., 2.0 when current level is 1), the level updates:

- **Level-up:** The new level is recorded. The level change is logged in the session history `level_changes` array. The learner is notified of the level-up with specific recognition of what they demonstrated.
- **Level-down:** The new level is recorded. The level change is logged silently. The learner is NOT notified. Explanation depth increases automatically at the lower level. No commentary, no label, no "you seem to be having trouble."

Asymmetric notification is a core design decision. Level-ups are milestones. Level-downs are support adjustments.

## State Recovery

If the profile file is corrupted, unparseable, or unreadable at session start:

1. Create a new default profile (using the defaults specified above).
2. Log a warning that previous state could not be loaded. The warning is informational — include the file path and error type.
3. Do NOT block the session. The learner can always work, even if state is lost.
4. The learner can use `/level reset` to explicitly start fresh at any time.

Never prompt the learner to "fix" their profile. Never ask if they want to "recover" data. Handle it silently and move forward.

## Data Owned by This Contract

This rule governs the following fields in the learner profile:

- `schema_version` — format version for future migration support
- `created_at` — when the profile was first created
- `updated_at` — last modification timestamp (updated on every save)
- `session_history[]` — the append-only session record array
- `signal_accumulator{}` — per-dimension fractional accumulators

## Boundaries: What This Rule Does NOT Cover

The following behaviors are related to learner state but governed by other components. This rule does not define their logic:

- **Signal capture** — how behavioral signals are extracted from tool events. That is the `level-signal-capture` hook and the `signal-parser` library.
- **Level calculation** — how signals are weighted, dampened, and converted to level changes. That is the `competence-engine` library.
- **Teaching annotations** — how annotation depth translates to response content. That is the `teaching-annotation` hook and the `adaptive-behavior` rule.
- **Phase transitions** — how phase proposals are generated and accepted. That is the `phase-transition-contract` and the `level-assessor` agent.

This rule ensures the data is always there, always correct, and never lost. Other components decide what to do with it.
