# Component: resume-session
## Type: command
## Status: pending
## Dependencies: mentor agent, scripts/lib/learner-profile.js, scripts/hooks/session-start-loader.js
## Session Target: 5

## What This Is
The `/resume-session` command resumes a previous session with full learner context. It reads the most recent (or specified) session from history, loads the learner profile, and invokes the `mentor` agent to deliver a contextual briefing that orients the user to where they left off. This provides continuity across Claude Code sessions.

## Command Frontmatter
```yaml
---
description: Resume where you left off. Loads your previous session context and briefs you on what happened and what comes next.
---
```

## Behavior Specification

1. **Profile check.** Read `state/learner-profile.json`. If no profile exists, redirect to `/start`. If no session history exists, inform: "No previous sessions found. Use `/start` to begin."

2. **Session selection.** Determine which session to resume:
   - **No argument:** Resume the most recent session (last entry in `session_history`)
   - **With session ID argument:** Resume the specified session. If the ID is not found, list available sessions and ask the user to pick one.
   - **With "list" argument:** Display all sessions with IDs, dates, and summaries for the user to pick from.

3. **Context loading.** Read the selected session entry:
   - `pipeline_steps_executed` -- what was done
   - `handoff_notes` -- where the user left off (if provided via `/save-session`)
   - `project_id` -- which project was active
   - `level_changes` -- what levels changed
   - `concepts_introduced` -- what was learned

4. **Invoke mentor agent for briefing.** The `mentor` agent (Opus, read-only) delivers a contextual resumption briefing:

   **Greeting:** Personalized welcome back (using `user.name` if set).

   **Recap:** Brief summary of the previous session:
   - "Last time, we worked on [project name]."
   - "We completed [pipeline steps] and introduced [key concepts]."
   - "Your [dimension] level went from [X] to [Y]."

   **Handoff notes:** If available, present the user's own notes: "You noted: '[handoff_notes]'"

   **Suggested next step:** Based on the session context:
   - If pipeline was partially completed, suggest the next step: "We got through planning and implementation last time. Ready to review?"
   - If a milestone is close, highlight it: "You are one step away from completing the [milestone name] milestone."
   - If no clear continuation, ask: "What would you like to work on today?"

5. **Phase transition check.** If a phase transition was proposed (during the previous session's Stop hook), this is where it gets announced per the phase-transition-contract:
   - "Based on our work together, you've demonstrated [specific competencies]. I think you're ready to take more control. In Phase [N], you will [description]. Want to move forward, or stay at the current pace?"
   - Handle accept, defer, or feedback per the contract.

6. **Profile state update.** Increment the active project's `sessions` count. Update `updated_at` timestamp.

7. **Briefing depth.** Adapted to the user's phase:
   - Phase 0-1: Full recap with explanations of what each step means
   - Phase 2-3: Concise recap focused on what was done and what is next
   - Phase 4-5: Terse: "Last session: [summary]. Handoff notes: [notes]. Ready?"

## Arguments
| Argument | Required | Description |
|---|---|---|
| `<session_id>` | No | Session ID to resume (e.g., `2026-03-22-abc123`). If omitted, resumes the most recent session. |
| `list` | No | Special keyword. Lists all available sessions for the user to pick from. |

## Phase-Specific Behavior

| Phase | Behavior |
|---|---|
| 0 (Discovery) | Full recap. If the user was mid-discovery, remind them of the project options discussed. |
| 1 (Observer) | Full recap. Explain what each completed step was and what comes next in the pipeline. |
| 2 (Co-Pilot) | Concise recap. Focus on decisions made and what the user should decide next. |
| 3 (Navigator) | Brief recap. Focus on where the user left off. Let the user drive. |
| 4-5 (Driver/Graduate) | Minimal. State what was done, present handoff notes, wait for instruction. |

## Implementation Notes
_Empty -- filled during implementation._

## Test Requirements
1. **Profile prerequisite test.** No profile redirects to `/start`. No session history informs the user and suggests `/start`.
2. **Most recent session test.** `/resume-session` with no arguments loads the last entry from `session_history`.
3. **Specific session test.** `/resume-session 2026-03-22-abc123` loads the session with that ID.
4. **Invalid session ID test.** An unrecognized session ID lists available sessions and asks the user to pick.
5. **List sessions test.** `/resume-session list` displays all sessions with IDs, dates, and summaries.
6. **Handoff notes display test.** When the resumed session has handoff notes, they are presented to the user.
7. **Next step suggestion test.** When the previous session had an incomplete pipeline (e.g., plan + implement but no review), the briefing suggests the next step (review).
8. **Phase transition announcement test.** When `phase_proposed` is set, the briefing includes the transition proposal per the phase-transition-contract.
9. **Mentor agent routing test.** The `mentor` agent (Opus) is invoked for the briefing.
10. **Session count increment test.** The active project's `sessions` count is incremented on resume.
