# Component: save-session
## Type: command
## Status: pending
## Dependencies: scripts/lib/learner-profile.js, scripts/hooks/learner-state-persist.js
## Session Target: 5

## What This Is
The `/save-session` command explicitly saves the current session state with learner context, producing a session summary that can be resumed later. While the Stop hook automatically persists the profile, this command gives the user explicit control over session boundaries and lets them add handoff notes describing where they left off and what to do next.

## Command Frontmatter
```yaml
---
description: Save the current session with a summary. Creates a checkpoint you can resume later with /resume-session.
---
```

## Behavior Specification

1. **Profile check.** Read `state/learner-profile.json`. If no profile exists, redirect to `/start`.

2. **Session summary generation.** Compile the current session state:

   **Session metadata:**
   - `session_id`: Generate as `YYYY-MM-DD-shortid` format
   - `date`: Current date as `YYYY-MM-DD`
   - `duration_minutes`: Calculate from session start (if available) or set to null
   - `project_id`: Active project ID (or null if no active project)

   **Activity summary:**
   - `pipeline_steps_executed`: List of pipeline steps run during this session (e.g., ["plan", "implement"])
   - `signals_captured`: Count of behavioral signals captured during the session
   - `level_changes`: Array of level changes that occurred (e.g., [{"dimension": "implementation", "from": 0, "to": 1}])
   - `concepts_introduced`: Array of new concepts introduced during the session
   - `user_initiated_actions`: Count of user-initiated actions
   - `claude_initiated_actions`: Count of Claude-initiated actions

3. **Handoff notes.** Ask the user (or accept as argument): "Any notes about where you left off or what to work on next?"
   - If provided, store as `handoff_notes` in the session entry
   - If skipped, set to null
   - These notes are read by `/resume-session` to provide continuity

4. **Profile persistence.** Write the session entry to `session_history` array in the learner profile. This is the same format that the Stop hook writes, but with the addition of user-provided handoff notes.

5. **Confirmation.** Display a summary to the user:
   ```
   Session saved: 2026-03-22-abc123

   Steps completed: plan, implement
   Concepts covered: TDD, unit testing, assertions
   Level changes: implementation 0 -> 1

   Notes: "Working on user authentication. Next step: write tests for login endpoint."

   Resume with /resume-session to pick up where you left off.
   ```

6. **No duplicate sessions.** If the current session has already been saved (session_id exists in history), update the existing entry rather than creating a duplicate.

7. **No agent invocation.** This is a direct state write. No agent is needed.

## Arguments
| Argument | Required | Description |
|---|---|---|
| `<notes>` | No | Handoff notes describing where you left off. If omitted, the command asks interactively. |

## Phase-Specific Behavior

| Phase | Behavior |
|---|---|
| 0-1 | Save confirmation includes a brief explanation of what session saving does: "This saves your progress so we can pick up exactly where we left off next time." |
| 2-3 | Standard save confirmation with summary. |
| 4-5 | Terse confirmation: "Session saved: [id]. Resume with /resume-session." |

## Implementation Notes
_Empty -- filled during implementation._

## Test Requirements
1. **Profile prerequisite test.** No profile redirects to `/start`.
2. **Session entry creation test.** After saving, a valid session entry exists in `session_history` matching the learner-profile-schema contract.
3. **Session ID format test.** Session ID follows `YYYY-MM-DD-shortid` format.
4. **Handoff notes test.** User-provided notes are stored in the session entry's `handoff_notes` field.
5. **No duplicate test.** Saving the same session twice updates the existing entry instead of creating a duplicate.
6. **Pipeline steps test.** `pipeline_steps_executed` correctly reflects the steps run during the session.
7. **Level changes test.** Level changes that occurred during the session are recorded in the session entry.
8. **Concepts test.** Concepts introduced during the session are recorded in `concepts_introduced`.
9. **No agent invocation test.** The command completes without invoking any agent.
10. **Session history append-only test.** Saving a new session does not modify previous session entries.
