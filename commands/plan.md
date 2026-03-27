---
description: Create an implementation plan for a feature. Guided planning with teaching adapted to your level.
---

# Plan

Run the planning step as a standalone operation outside the full `/build` pipeline. Invokes the **dev-planner** agent to create an implementation plan with teaching annotations adapted to the user's planning dimension level.

## Prerequisites

Read `state/learner-profile.json`.

- If no profile exists, stop and redirect: "Run `/start` first to create your learner profile."
- If no active project exists in the `projects` array (`status: "active"`), suggest `/discover` first but do not block. The user may want to plan for a project not yet tracked.
- Read `settings.phase`, `settings.verbosity`, `settings.teaching_mode`, and `dimensions.planning.level` from the profile.

## Feature Input

Determine what the user wants to plan:

1. If `$ARGUMENTS` contains a feature description, use that.
2. Otherwise, check if the active project has milestones. If so, suggest the next uncompleted milestone.
3. If no milestones or no argument, ask interactively: "What feature or task do you want to plan?"

## Teaching Mode Selection

Determine the teaching mode based on the user's planning dimension level:

- **Directive mode (planning level 0-1):** Present the complete plan and explain each section. Ask if the user has questions.
- **Socratic mode (planning level 2+):** Before presenting the plan, ask the user questions: "What files do you think we will need to change?" "What could go wrong with this approach?" Then present the plan, comparing it with the user's answers.

## Plan Generation

Invoke the **dev-planner** agent (Sonnet). The agent produces an implementation plan containing:

- **Requirements analysis** -- what needs to happen
- **File changes** -- which files to create, modify, or delete
- **Dependencies** -- external packages, internal modules
- **Phase breakdown** -- ordered implementation steps
- **Risk identification** -- what could go wrong
- **Dependency mapping** -- what blocks what

Calculate annotation depth: `annotation_depth = max(0, verbosity - (planning_level - 1))`.

| Depth | Annotation Behavior |
|-------|--------------------|
| 4-5 | Explains what a plan IS, why we plan before coding, what each section means |
| 2-3 | Explains key decisions and risks |
| 0-1 | Presents the plan with minimal annotation |

## Plan Approval

After presenting the plan, ask the user to approve, modify, or reject.

**Approve.** The user accepts the plan as-is. Record this as a signal. If the plan was long and approval was instant (no questions asked, no modifications), record a mild negative signal for the planning dimension. Instant approval of complex plans may indicate the user did not engage with the content.

**Modify.** The user suggests changes to the plan. This is a positive signal for the planning dimension -- it demonstrates engagement and understanding. Update the plan to incorporate the user's changes.

**Reject.** The user wants to start over with different requirements. Re-run the planning flow from the Feature Input step.

## Session State

Record `"plan"` in `pipeline_steps_executed` for the current session history entry.

## Phase-Specific Behavior

| Phase | Behavior |
|-------|----------|
| 0 (Discovery) | Available but suggests `/discover` first to scope a project. If user insists, plan anyway. |
| 1 (Observer) | Full annotation. Claude presents the complete plan with detailed explanations of each section. User approves or asks questions. |
| 2 (Co-Pilot) | Medium annotation. Claude asks the user for input before planning (Socratic). Presents plan with decision-point explanations. |
| 3 (Navigator) | Low annotation. Presents plan. Waits for user to evaluate and modify. Annotates only new concepts. |
| 4 (Driver) | Minimal annotation. Presents plan concisely. User directs any changes. |
| 5 (Graduate) | No annotation. Presents plan. Proceeds on instruction. |
