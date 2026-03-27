---
description: View your learning progress. Shows competence growth, project milestones, and learning trajectory.
---

# Progress

Display a comprehensive view of the learning journey. Invokes the **progress-reporter** agent (Haiku) to generate a human-readable summary across five sections. This command is purely informational and does not modify any profile state.

## Prerequisites

Read `state/learner-profile.json`.

- If no profile exists, stop and redirect: "Run `/start` first to create your learner profile."
- If the profile exists, read `settings.phase`, `settings.verbosity`, the full `competence` object, `projects` array, and `sessions` history.

## Argument Handling

Parse `$ARGUMENTS`:

- **No arguments (`/progress`):** Generate the full five-section report.
- **Dimension argument (`/progress <dimension>`):** Generate a detailed progress view for that specific dimension instead of the full overview. Validate the dimension name against the 9 known dimensions. On typo, suggest the closest match.

## Report Generation

Invoke the **progress-reporter** agent (Haiku). Pass the full learner profile as context. The agent generates a report adapted to the user's current phase.

### Section 1: Phase Status

- Current phase with name and description (e.g., "Phase 2: Co-Pilot -- You make decisions, I execute them").
- If `phase_proposed` is set in the profile, mention it: "A transition to Phase [N] has been proposed."
- Progress toward next phase: list which transition criteria are met and which remain.

### Section 2: Competence Overview

- All 9 dimensions with current levels and growth direction (trending up, stable, new).
- Highlight dimensions that leveled up within the last 3 sessions.
- Highlight dimensions that appear stagnant (no level change for 5+ sessions despite activity).
- Visual representation where possible (e.g., simple bar indicators or level markers).

### Section 3: Project Status

- Active project name, archetype, and milestone progress.
- Milestones completed vs total.
- Sessions spent on the current project.
- Summary of completed projects if any exist.

### Section 4: Session Summary

- Total sessions completed.
- Pipeline steps most frequently executed across sessions.
- Concepts introduced (cumulative list from session history).
- Recent level changes (last 5 level-ups with dimension, old level, new level, session).

### Section 5: Learning Trajectory

- Strongest dimensions (highest levels).
- Growth areas (dimensions with the most recent improvement).
- Suggested next focus, connecting low dimensions to upcoming work (e.g., "Your security level is at 0 -- the next `/build` will introduce security concepts").

## Dimension Detail Mode

When `$ARGUMENTS` contains a dimension name, replace the full report with a focused view of that dimension:

- Current level, fractional progress, confidence (phase-adapted).
- All sub-concepts with their individual levels.
- Level change history for this dimension (when each level-up occurred).
- Recent behavioral signals observed (Phase 4-5 only).
- How this dimension connects to the active project.

## Phase-Adapted Detail

The report's content and language adapt to the user's phase.

**Phase 0-1:** Simple summary. Focus on what the user has built and learned. Use natural language and labels, not numbers. Example: "You are getting comfortable with planning." No system internals. No confidence values.

**Phase 2-3:** Detailed report. Include competence levels with numbers and labels. Show project milestones and level change history. This is a meta-cognitive reveal -- the user sees the tracking system for the first time. Briefly explain what the numbers mean on first invocation.

**Phase 4-5:** Full transparency. Include confidence values, evidence counts, and signal accumulator state. Show phase transition criteria explicitly. The user sees the system internals.

## Edge Cases

- **Fresh profile (no sessions, no projects):** Generate the report without errors. Phase status shows the current phase. Competence overview shows all dimensions at initial values. Project status says "No projects yet." Session summary says "No sessions recorded." Trajectory suggests running `/discover`.
- **No active project:** Project status section shows completed projects if any exist, otherwise suggests `/discover`.
- **Single session so far:** Session summary reflects the single session. Trajectory avoids trend language ("trending up") since there is no trend data yet.

## Phase-Specific Behavior

| Phase | Behavior |
|-------|----------|
| 0-1 | Simple report: what you have built, what you have learned, what comes next. Labels only, no numbers or system details. Warm, encouraging tone. |
| 2-3 | Detailed report: competence levels with numbers, project milestones, level change history. Meta-cognitive reveal of the tracking system. |
| 4-5 | Full transparency: confidence values, evidence counts, signal accumulator state, phase transition criteria. User sees the system internals. Terse, data-forward presentation. |
