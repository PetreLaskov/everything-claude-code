# Component: progress
## Type: command
## Status: pending
## Dependencies: progress-reporter agent, scripts/lib/learner-profile.js
## Session Target: 5

## What This Is
The `/progress` command displays a comprehensive view of the user's learning journey. It invokes the `progress-reporter` agent (Haiku, cost-optimized) to generate a human-readable summary of competence growth, project milestones, session history, and learning trajectory. This is how the user sees their development as a developer over time.

## Command Frontmatter
```yaml
---
description: View your learning progress. Shows competence growth, project milestones, and learning trajectory.
---
```

## Behavior Specification

1. **Profile check.** Read `state/learner-profile.json`. If no profile exists, redirect to `/start`.

2. **Invoke progress-reporter agent.** The `progress-reporter` agent (Haiku) reads the learner profile and generates a progress report with these sections:

   **Section 1: Phase status**
   - Current phase with name and description (e.g., "Phase 2: Co-Pilot -- You make decisions, I execute them")
   - If a phase transition is proposed (`phase_proposed` is set), mention it: "A transition to Phase [N] has been proposed."
   - Progress toward next phase (which criteria are met, which remain)

   **Section 2: Competence overview**
   - All 9 dimensions with current levels and growth direction (trending up, stable, new)
   - Highlight dimensions that leveled up recently (within last 3 sessions)
   - Highlight dimensions that may need attention (stagnant for 5+ sessions)
   - Visual representation if possible (e.g., ASCII bar chart or level indicators)

   **Section 3: Project status**
   - Active project name, archetype, milestone progress
   - Milestones completed vs total
   - Sessions on current project
   - Completed projects summary (if any)

   **Section 4: Session summary**
   - Total sessions completed
   - Pipeline steps most frequently executed
   - Concepts introduced (cumulative list)
   - Level changes history (recent 5 level-ups)

   **Section 5: Learning trajectory**
   - Strongest dimensions (highest levels)
   - Growth areas (dimensions with most recent improvement)
   - Suggested next focus ("Your security level is at 0 -- the next `/build` will introduce security concepts")

3. **Adaptive detail.** The report's detail level adapts to the user's phase:
   - Phase 0-1: Simple summary. Focus on project progress and what has been learned.
   - Phase 2-3: Include competence tracking details. This is a meta-cognitive reveal.
   - Phase 4-5: Full system transparency. Include confidence values, evidence counts, signal accumulator state.

4. **No side effects.** This command is purely informational. It does not modify the profile, levels, or any state.

## Arguments
| Argument | Required | Description |
|---|---|---|
| `<dimension>` | No | If provided, show detailed progress for a specific dimension instead of the full overview. |

## Phase-Specific Behavior

| Phase | Behavior |
|---|---|
| 0-1 | Simple report: what you have built, what you have learned, what comes next. No numbers or system details. Uses labels like "You are getting comfortable with planning." |
| 2-3 | Detailed report: competence levels with numbers, project milestones, level change history. Meta-cognitive reveal of the tracking system. |
| 4-5 | Full transparency: confidence values, evidence counts, signal accumulator state, phase transition criteria. User sees the system internals. |

## Implementation Notes
_Empty -- filled during implementation._

## Test Requirements
1. **Profile prerequisite test.** No profile redirects to `/start`.
2. **Full report test.** The progress-reporter agent produces a report containing all 5 sections: phase status, competence overview, project status, session summary, learning trajectory.
3. **Phase adaptation test.** At Phase 1, the report uses labels and simple language. At Phase 4, it includes confidence values and evidence counts.
4. **Recent level-up highlight test.** Dimensions that leveled up within the last 3 sessions are highlighted in the report.
5. **Phase transition proposal test.** When `phase_proposed` is set, the report mentions the pending transition.
6. **Dimension detail test.** `/progress implementation` shows detailed progress for the implementation dimension only.
7. **No side effects test.** Running `/progress` does not modify any profile state.
8. **Agent routing test.** The `progress-reporter` agent (Haiku) is invoked.
9. **Empty history test.** With a fresh profile (no sessions, no projects), the report still generates without errors, showing initial state.
