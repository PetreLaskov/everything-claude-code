# Component: why
## Type: command
## Status: pending
## Dependencies: mentor agent, scripts/lib/learner-profile.js
## Session Target: 5

## What This Is
The `/why` command explains why the last action or decision was taken. It invokes the `mentor` agent (Opus) to provide a retrospective explanation of the most recent operation, connecting it to the broader development methodology. Unlike `/explain` which covers any concept, `/why` is specifically about the reasoning behind what just happened in the current session.

## Command Frontmatter
```yaml
---
description: Explain why the last action was taken. Understand the reasoning behind what just happened.
---
```

## Behavior Specification

1. **Profile check.** Read `state/learner-profile.json`. If no profile exists, still proceed (the user may be curious before onboarding). Use default context (Level 0, verbosity 5).

2. **Context detection.** Determine "the last action" by examining the session context:
   - What was the most recent tool use (Write, Edit, Bash, etc.)?
   - What pipeline step was most recently executed?
   - What agent was most recently invoked?
   - What decision was most recently made?

   If no recent action can be identified (e.g., fresh session with no activity), respond: "There is nothing recent to explain. Try running a command like `/build` or `/implement` first, then use `/why` to understand the reasoning."

3. **Invoke mentor agent.** The `mentor` agent (Opus, read-only) explains:

   **The action:** What was done. ("We just wrote a test before writing the implementation code.")

   **The reasoning:** Why it was done this way. ("Writing the test first forces us to think about WHAT the code should do before HOW to write it. This catches misunderstandings early.")

   **The methodology connection:** How it fits the broader pipeline. ("This is step 2 of the development pipeline -- implementation. The test-first approach (TDD) is one of the most valuable habits a developer can build.")

   **The alternative:** What would have happened without this step. ("Without a test, we would write code that looks right but might not handle edge cases. The test is our safety net.")

4. **Teaching annotations.** The mentor reads the learner profile and adapts depth:
   - At low levels: full explanation with analogies, methodology context, alternatives
   - At high levels: brief rationale, focus on trade-offs and edge cases
   - Always explain WHY, even at high levels -- this command's purpose is the "why"

5. **Signal recording.** Asking "why" about a specific domain is a positive signal for that dimension:
   - "Why did we write the test first?" -> +0.10 for implementation
   - "Why did we use a feature branch?" -> +0.10 for git_workflow
   - "Why did we check for SQL injection?" -> +0.10 for security
   - Per plan section 2.2: "User asks 'why' about a design decision" is a positive signal

6. **No modification of prior actions.** This command is purely explanatory. It does not undo, redo, or modify anything that was done.

## Arguments
| Argument | Required | Description |
|---|---|---|
| `<topic>` | No | Optionally narrow what to explain. E.g., `/why test first` focuses on the TDD decision. If omitted, explains the most recent action generally. |

## Phase-Specific Behavior

| Phase | Behavior |
|---|---|
| 0-1 | Full depth explanation. Methodology context. Analogies. Connects to the big picture of software development. |
| 2-3 | Rationale focused. Assumes the user understands the basics. Focuses on the specific decision and its trade-offs. |
| 4-5 | Brief rationale. Focus on edge cases, alternatives, and when this approach would NOT be appropriate. Treats the user as a peer discussing strategy. |

## Implementation Notes
_Empty -- filled during implementation._

## Test Requirements
1. **Context detection test.** The command correctly identifies the most recent action from session context.
2. **No recent action test.** When no recent action exists, the command responds with guidance to perform an action first.
3. **Methodology connection test.** The explanation includes how the action fits the development pipeline (not just what was done, but how it connects to the methodology).
4. **Alternative explanation test.** The explanation includes what would have happened without the action.
5. **Level adaptation test.** The same action gets different explanation depths at Level 0 vs Level 4.
6. **Positive signal test.** Asking "why" about a domain-relevant action records a positive signal for that dimension.
7. **Mentor agent routing test.** The `mentor` agent (Opus) is invoked.
8. **No modification test.** Running `/why` does not change any code, state, or prior actions.
