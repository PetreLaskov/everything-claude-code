---
description: Request harder tasks. Push yourself beyond the current difficulty level in any dimension.
---

# Challenge

Request harder tasks in a specific competence dimension, temporarily raising difficulty to one level above current.

## Prerequisites

Read `state/learner-profile.json`.

- If no profile exists, redirect to `/start`.
- If no active project exists in `projects`, inform the user: "Challenges need a project context. Use /discover to find your first project." Redirect to `/discover`.
- If the user's current phase is 0 (Discovery), inform: "Challenges unlock once you have an active project. Use /discover to get started." Redirect to `/discover`.

## Dimension Determination

Determine which dimension to challenge in, using this priority:

1. **Explicit argument.** If `$ARGUMENTS` contains a dimension name, use that dimension.
2. **Pipeline context.** If the user is mid-pipeline, infer the dimension from the current step:
   - `plan` step = planning dimension
   - `implement` step = implementation dimension
   - `review` step = review dimension
   - `commit` step = git_workflow dimension
   - `verify` step = testing dimension
3. **Ask the user.** If neither of the above applies, display all 9 dimensions with their current levels and ask: "Which area do you want to push yourself in?"

## Challenge Generation

Invoke the **level-assessor** agent (Sonnet) with the following instructions:

### Current State Analysis

The agent reads:
- The user's level and confidence in the target dimension
- Sub-concept levels within that dimension
- Weakest sub-concepts (lowest confidence, lowest level)
- Recent session history for patterns

### Generate 1-3 Challenges

Propose challenges appropriate for ONE LEVEL ABOVE the user's current level in the target dimension. The challenges must be achievable stretch goals, not impossible leaps.

Example challenges by dimension and level transition:

**Implementation:**
- 0 to 1: "Write a test case yourself. I will give you the function signature and tell you what it should do. You write what the test should check."
- 1 to 2: "Before I implement, tell me what edge cases you think we should handle. I will compare your list with mine."
- 2 to 3: "Write the test AND the implementation. I will review it."
- 3 to 4: "Design the architecture for this feature. Choose the file structure, the module boundaries, and the error handling strategy."
- 4 to 5: "Orchestrate the full pipeline yourself. Tell me each step to take, in what order, with what tools."

**Git Workflow:**
- 0 to 1: "Write a commit message for the changes we just made. I will show you the format."
- 1 to 2: "Decide whether these changes should be one commit or multiple commits. Explain your reasoning."
- 2 to 3: "Create a feature branch, commit, and open a PR. I will review your PR description."
- 3 to 4: "Handle a merge conflict. I will set one up and you resolve it."

Present the challenges to the user and let them pick one.

## Difficulty Adjustment

After the user selects a challenge:

- Temporarily set the effective teaching level for the target dimension to `current_level + 1`.
- This means: less annotation, more Socratic questioning, more user-initiated work.
- Apply the annotation depth formula at the elevated level: `annotation_depth = max(0, verbosity - (dimension_level + 1 - 1))`.
- The actual stored level does NOT change. Only teaching behavior adjusts for this task.

## Outcome Handling

When the challenge attempt concludes, evaluate the outcome:

- **Success.** Record a strong positive signal (+0.20) for the dimension. Celebrate genuinely: "You nailed that. That is level [current+1] work."
- **Partial success.** Record a moderate positive signal (+0.10) for the dimension. Acknowledge: "Good attempt. You got [specific part] right. Let me show you [what was missed]."
- **Struggle.** Record NO negative signal. The user asked for harder work -- struggling is expected and should not penalize. Offer help: "This is challenging territory. Want me to walk through it?"

## Session Logging

Log the challenge attempt in session history with:
- Dimension targeted
- Level attempted (current_level + 1)
- Outcome (success, partial, struggle)

## Phase-Specific Behavior

| Phase | Behavior |
|-------|----------|
| 0 (Discovery) | Not available. Redirect to `/discover`. |
| 1 (Observer) | Challenges focus on decision-making: "What would YOU do next?" "What test cases do you see?" User contributes thinking, Claude still executes. |
| 2 (Co-Pilot) | Challenges focus on execution: "Write the test yourself." "Compose the commit message." User takes over specific tasks. |
| 3 (Navigator) | Challenges focus on orchestration: "Drive this feature from plan to commit." "Design the architecture." User runs the pipeline. |
| 4 (Driver) | Challenges focus on mastery: "Handle this merge conflict." "Optimize this for performance." "Teach me what you would do differently." |
| 5 (Graduate) | Challenges focus on meta-skills: "Set up a harness for a new project." "Orchestrate a multi-agent workflow." |
