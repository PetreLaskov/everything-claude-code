# Component: plan
## Type: command
## Status: pending
## Dependencies: dev-planner agent, scripts/lib/learner-profile.js
## Session Target: 5

## What This Is
The `/plan` command runs the planning step as a standalone operation outside the full `/build` pipeline. It invokes the `dev-planner` agent to create an implementation plan with teaching annotations adapted to the user's planning dimension level. Useful when the user wants to plan before committing to the full pipeline.

## Command Frontmatter
```yaml
---
description: Create an implementation plan for a feature. Guided planning with teaching adapted to your level.
---
```

## Behavior Specification

1. **Profile check.** Read `state/learner-profile.json`. If no profile exists, redirect to `/start`. If no active project exists, suggest `/discover` first (but do not block -- the user may want to plan for a project not yet tracked).

2. **Feature input.** Accept a feature description as an argument, or ask interactively: "What feature or task do you want to plan?" If the active project has milestones, suggest the next uncompleted milestone.

3. **Invoke dev-planner agent.** The `dev-planner` agent (Sonnet) produces an implementation plan containing:
   - Requirements analysis (what needs to happen)
   - File changes (which files to create, modify, or delete)
   - Dependencies (external packages, internal modules)
   - Phase breakdown (ordered steps)
   - Risk identification (what could go wrong)
   - Dependency mapping (what blocks what)

4. **Teaching annotations.** The dev-planner reads the learner profile and applies annotation depth per the annotation contract:
   - `annotation_depth = max(0, verbosity - (planning_level - 1))`
   - At depth 4-5: explains what a plan IS, why we plan before coding, what each section means
   - At depth 2-3: explains key decisions and risks
   - At depth 0-1: presents the plan with minimal annotation

5. **User interaction.** Behavior depends on phase and teaching mode:
   - **Directive mode (Level 0-1):** Present the plan and explain each section. Ask if the user has questions.
   - **Socratic mode (Level 2+):** Ask the user questions before presenting the full plan: "What files do you think we will need to change?" "What could go wrong with this approach?" Then present the plan, comparing it with the user's answers.

6. **Plan approval.** After presenting the plan, ask the user to approve, modify, or reject:
   - **Approve:** Record as a signal (instant approval of a long plan = potential negative signal for planning dimension)
   - **Modify:** User suggests changes. This is a positive signal. Update the plan accordingly.
   - **Reject:** User wants to start over with different requirements. Re-run planning.

7. **Session state.** Record `"plan"` in `pipeline_steps_executed` for the current session.

## Arguments
| Argument | Required | Description |
|---|---|---|
| `<feature>` | No | Description of the feature to plan. If omitted, asks interactively. |

## Phase-Specific Behavior

| Phase | Behavior |
|---|---|
| 0 (Discovery) | Available but suggests `/discover` first to scope a project. If user insists, plan anyway. |
| 1 (Observer) | Full annotation. Claude presents the complete plan with detailed explanations of each section. User approves or asks questions. |
| 2 (Co-Pilot) | Medium annotation. Claude asks the user for input before planning (Socratic). Presents plan with decision-point explanations. |
| 3 (Navigator) | Low annotation. Presents plan. Waits for user to evaluate and modify. Annotates only new concepts (e.g., first time seeing risk identification). |
| 4 (Driver) | Minimal annotation. Presents plan concisely. User directs any changes. |
| 5 (Graduate) | No annotation. Presents plan. Proceeds on instruction. |

## Implementation Notes
_Empty -- filled during implementation._

## Test Requirements
1. **Profile prerequisite test.** No profile redirects to `/start`.
2. **Plan output test.** The dev-planner agent produces a plan containing all required sections: requirements, file changes, dependencies, phases, risks.
3. **Annotation depth test.** At planning level 0 + verbosity 3, annotation depth is 4 (deep explanations). At planning level 4 + verbosity 3, annotation depth is 0 (no annotation).
4. **Socratic mode test.** At planning level 2+, the agent asks the user questions before presenting the plan.
5. **Plan modification signal test.** When the user modifies a plan, a positive signal is recorded for the planning dimension.
6. **Instant approval signal test.** When the user instantly approves a long plan, a mild negative signal is recorded for the planning dimension.
7. **Session history test.** After planning, `"plan"` appears in `pipeline_steps_executed`.
