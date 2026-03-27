---
description: Save the current session with a summary. Creates a checkpoint you can resume later with /resume-session.
---

# Save Session

Explicitly save the current session state with a summary and optional handoff notes.

## Prerequisites

Read `state/learner-profile.json`.

- If no profile exists, redirect to `/start`.

## Session Summary Generation

Compile the current session state into a session entry. No agent invocation -- this is a direct state write using `scripts/lib/learner-profile.js`.

### Session Metadata

- `session_id`: Generate as `YYYY-MM-DD-shortid` format (e.g., `2026-03-24-abc123`)
- `date`: Current date as `YYYY-MM-DD`
- `duration_minutes`: Calculate from session start if available, otherwise set to null
- `project_id`: Active project ID, or null if no active project

### Activity Summary

- `pipeline_steps_executed`: List of pipeline steps run during this session (e.g., `["plan", "implement"]`)
- `signals_captured`: Count of behavioral signals captured during the session
- `level_changes`: Array of level changes that occurred (e.g., `[{"dimension": "implementation", "from": 0, "to": 1}]`)
- `concepts_introduced`: Array of new concepts introduced during the session
- `user_initiated_actions`: Count of user-initiated actions
- `claude_initiated_actions`: Count of Claude-initiated actions

## Handoff Notes

If `$ARGUMENTS` contains notes, use those as `handoff_notes`.

If `$ARGUMENTS` is empty, ask: "Any notes about where you left off or what to work on next?"

- If the user provides notes, store as `handoff_notes` in the session entry.
- If the user skips, set `handoff_notes` to null.

These notes are read by `/resume-session` to provide continuity across sessions.

## Persistence

Write the session entry to the `session_history` array in the learner profile using `scripts/lib/learner-profile.js`.

### No Duplicate Sessions

Before writing, check if a session entry with the same `session_id` already exists in `session_history`. If it does, update the existing entry rather than creating a duplicate.

## Confirmation

Display a summary to the user:

- Session ID
- Pipeline steps completed
- Concepts covered
- Level changes (if any)
- Handoff notes (if provided)
- Reminder: "Resume with /resume-session to pick up where you left off."

## Phase-Specific Behavior

| Phase | Behavior |
|-------|----------|
| 0-1 | Save confirmation includes a brief explanation: "This saves your progress so we can pick up exactly where we left off next time." Show full summary with all fields. |
| 2-3 | Standard save confirmation with summary. |
| 4-5 | Terse confirmation: "Session saved: [id]. Resume with /resume-session." |
