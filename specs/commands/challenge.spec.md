# Component: challenge
## Type: command
## Status: pending
## Dependencies: level-assessor agent, scripts/lib/learner-profile.js, scripts/lib/competence-engine.js
## Session Target: 5

## What This Is
The `/challenge` command lets the user request harder tasks in their current area of work. It invokes the `level-assessor` agent to evaluate the user's current competence and propose more advanced exercises, tasks, or approaches within the active project. This is the user's mechanism for pushing beyond what the adaptive system would naturally offer.

## Command Frontmatter
```yaml
---
description: Request harder tasks. Push yourself beyond the current difficulty level in any dimension.
---
```

## Behavior Specification

1. **Profile check.** Read `state/learner-profile.json`. If no profile exists, redirect to `/start`. If no active project exists, suggest `/discover` (challenges need a project context).

2. **Dimension determination.** Determine which dimension to challenge in:
   - If a dimension is provided as an argument, use that dimension
   - If the user is mid-pipeline, use the dimension corresponding to the current step (e.g., during implement = implementation, during review = review)
   - If neither, ask: "Which area do you want to push yourself in?" and list the 9 dimensions with current levels

3. **Invoke level-assessor agent.** The `level-assessor` agent (Sonnet) evaluates:

   **Current state analysis:**
   - Read the user's level and confidence in the target dimension
   - Read the user's sub-concept levels within that dimension
   - Identify the weakest sub-concepts (lowest confidence, lowest level)
   - Review recent session history for patterns

   **Challenge generation.** Propose 1-3 challenge tasks appropriate for one level above the user's current level:

   For implementation (example at each level transition):
   - Level 0->1: "Write a test case yourself. I will give you the function signature and tell you what it should do. You write what the test should check."
   - Level 1->2: "Before I implement, tell me what edge cases you think we should handle. I will compare your list with mine."
   - Level 2->3: "Write the test AND the implementation. I will review it."
   - Level 3->4: "Design the architecture for this feature. Choose the file structure, the module boundaries, and the error handling strategy."
   - Level 4->5: "Orchestrate the full pipeline yourself. Tell me each step to take, in what order, with what tools."

   For git_workflow (example at each level):
   - Level 0->1: "Write a commit message for the changes we just made. I will show you the format."
   - Level 1->2: "Decide whether these changes should be one commit or multiple commits. Explain your reasoning."
   - Level 2->3: "Create a feature branch, commit, and open a PR. I will review your PR description."
   - Level 3->4: "Handle a merge conflict. I will set one up and you resolve it."

4. **Difficulty adjustment.** After the user selects a challenge:
   - Temporarily increase the effective level for that dimension by 1 for teaching purposes
   - This means less annotation, more Socratic questioning, more user-initiated work
   - The actual level does NOT change -- only the teaching behavior adjusts for this task
   - If the user succeeds, it generates strong positive signals that may cause a real level increase

5. **Success and failure handling:**
   - **Success:** Strong positive signal (+0.20 for the dimension). Celebrate genuinely: "You nailed that. That is [level+1]-level work."
   - **Partial success:** Moderate positive signal (+0.10). "Good attempt. You got [specific part] right. Let me show you [what was missed]."
   - **Struggle:** No negative signal (the user asked for harder work -- struggling is expected). Offer help: "This is challenging territory. Want me to walk through it?"

6. **Session state.** Log the challenge attempt in session history with the dimension, attempted level, and outcome.

## Arguments
| Argument | Required | Description |
|---|---|---|
| `<dimension>` | No | Dimension to challenge in. One of the 9 dimensions. If omitted, infers from context or asks. |

## Phase-Specific Behavior

| Phase | Behavior |
|---|---|
| 0 | Not available. The user needs a project first. Redirect to `/discover`. |
| 1 (Observer) | Challenges focus on decision-making: "What would YOU do next?" "What test cases do you see?" User contributes thinking, Claude still executes. |
| 2 (Co-Pilot) | Challenges focus on execution: "Write the test yourself." "Compose the commit message." User takes over specific tasks. |
| 3 (Navigator) | Challenges focus on orchestration: "Drive this feature from plan to commit." "Design the architecture." User runs the pipeline. |
| 4 (Driver) | Challenges focus on mastery: "Handle this merge conflict." "Optimize this for performance." "Teach me what you would do differently." |
| 5 (Graduate) | Challenges focus on meta-skills: "Set up a harness for a new project." "Orchestrate a multi-agent workflow." |

## Implementation Notes
_Empty -- filled during implementation._

## Test Requirements
1. **Profile prerequisite test.** No profile redirects to `/start`. No active project redirects to `/discover`.
2. **Dimension inference test.** During an implement step, `/challenge` without arguments defaults to the implementation dimension.
3. **Challenge generation test.** The level-assessor agent proposes 1-3 challenges appropriate for one level above the user's current level.
4. **Level-appropriate challenge test.** A user at implementation level 1 gets Level 2 challenges (not Level 4 challenges).
5. **No negative signal on struggle test.** When the user struggles with a challenge, no negative signal is recorded.
6. **Success signal test.** Successfully completing a challenge records a strong positive signal (+0.20) for the dimension.
7. **Temporary difficulty adjustment test.** During a challenge, teaching behavior matches the challenged level (level+1), not the actual level.
8. **Session history logging test.** Challenge attempts are logged in session history with dimension, level attempted, and outcome.
9. **Agent routing test.** The `level-assessor` agent (Sonnet) is invoked for challenge generation.
