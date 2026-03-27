---
description: Resume where you left off. Loads your previous session context and briefs you on what happened and what comes next.
---

# Resume Session

Resume a previous session with a contextual briefing from the **mentor** agent.

## Prerequisites

Read `state/learner-profile.json`.

- If no profile exists, redirect to `/start`.
- If `session_history` is empty or missing, inform: "No previous sessions found. Use /start to begin."

## Session Selection

Determine which session to resume based on `$ARGUMENTS`:

- **No argument:** Resume the most recent session (last entry in `session_history`).
- **Session ID argument:** Resume the session matching that ID. If the ID is not found, list all available sessions with IDs, dates, and summaries, then ask the user to pick one.
- **"list" argument:** Display all sessions with IDs, dates, project names, and handoff note previews. Wait for the user to pick one.

## Context Loading

Read the selected session entry and extract:

- `pipeline_steps_executed` -- what was done
- `handoff_notes` -- where the user left off (if provided via `/save-session`)
- `project_id` -- which project was active
- `level_changes` -- what levels changed
- `concepts_introduced` -- what was learned

## Mentor Briefing

Invoke the **mentor** agent (Opus, read-only) to deliver a 4-part contextual resumption briefing:

### 1. Greeting

Personalized welcome back using `user.name` from the learner profile if set. Otherwise use a generic welcome.

### 2. Recap

Brief summary of the previous session:
- "Last time, we worked on [project name]."
- "We completed [pipeline steps] and introduced [key concepts]."
- "Your [dimension] level went from [X] to [Y]." (for each level change)

### 3. Handoff Notes

If the resumed session has `handoff_notes`, present them: "You noted: '[handoff_notes]'"

If no handoff notes exist, skip this section.

### 4. Suggested Next Step

Based on the session context:
- If the pipeline was partially completed, suggest the next step: "We got through planning and implementation last time. Ready to review?"
- If a milestone is close, highlight it: "You are one step away from completing the [milestone name] milestone."
- If no clear continuation, ask: "What would you like to work on today?"

## Phase Transition Check

If `phase_proposed` is set in the learner profile (from a previous session's Stop hook), announce the transition per the phase-transition-contract:

- "Based on our work together, you've demonstrated [specific competencies]. I think you're ready to take more control. In Phase [N], you will [description]. Want to move forward, or stay at the current pace?"
- Handle the user's response: accept, defer, or feedback per the contract.

## Profile State Update

After briefing:
- Increment the active project's `sessions` count.
- Update the profile's `updated_at` timestamp.

Write changes using `scripts/lib/learner-profile.js`.

## Phase-Specific Behavior

| Phase | Behavior |
|-------|----------|
| 0 (Discovery) | Full recap with explanations. If the user was mid-discovery, remind them of the project options discussed. |
| 1 (Observer) | Full recap. Explain what each completed step was and what comes next in the pipeline. |
| 2 (Co-Pilot) | Concise recap. Focus on decisions made and what the user should decide next. |
| 3 (Navigator) | Brief recap. Focus on where the user left off. Let the user drive. |
| 4-5 (Driver/Graduate) | Minimal. State what was done, present handoff notes, "Ready?" |
