# Component: explain
## Type: command
## Status: pending
## Dependencies: mentor agent, scripts/lib/learner-profile.js
## Session Target: 5

## What This Is
The `/explain` command provides on-demand deep explanation of any development concept. It invokes the `mentor` agent (Opus) to deliver a thorough, level-adapted explanation using analogies from the user's domain. This is the user's escape hatch for understanding anything at any time, independent of the pipeline. It works at all phases, including Phase 5 (Graduate) where annotations are otherwise silent.

## Command Frontmatter
```yaml
---
description: Get a deep explanation of any concept. Works at any time, adapted to your current level and interests.
---
```

## Behavior Specification

1. **Profile check.** Read `state/learner-profile.json`. If no profile exists, create a minimal context (treat as Level 0, verbosity 5). Do not redirect to `/start` -- this command should always be accessible.

2. **Concept input.** Accept the concept to explain as an argument. If no argument is provided, ask: "What would you like me to explain?"

3. **Invoke mentor agent.** The `mentor` agent (Opus, read-only) delivers the explanation:

   **Concept classification.** The mentor maps the concept to a competence dimension and sub-concept:
   - "TDD" -> implementation.tdd_red_green_refactor
   - "git branching" -> git_workflow.branching
   - "API design" -> architecture.api_design
   - "what is a test" -> implementation (general)
   - Unclassifiable concepts get general-purpose explanation

   **Level-adapted depth.** The mentor reads the user's level in the relevant dimension:
   - Level 0-1: Start from fundamentals. Define terms. Use analogies from `user.preferred_analogies`. Assume no prior knowledge.
   - Level 2-3: Build on existing understanding. Connect to concepts the user has already seen (reference `session_history.concepts_introduced`).
   - Level 4-5: Go deep. Discuss trade-offs, edge cases, when NOT to use the pattern. Treat the user as a peer.

   **Analogy selection.** Use the user's `preferred_analogies` domain:
   - If user domain is "cooking": "A function is like a recipe -- it takes ingredients (inputs), follows steps, and produces a dish (output)."
   - If user domain is "construction": "A test is like a building inspection -- it verifies the structure meets specifications before anyone moves in."
   - If no preferred domain is set, use universally accessible analogies.

   **Connection to prior learning.** Reference concepts the user has already encountered (from `session_history.concepts_introduced`). "Remember when we wrote that first test? TDD is the discipline of always starting there."

4. **Novel concept tracking.** If this concept (or its sub-concept) has not been introduced before:
   - Add it to `concepts_introduced` for the current session
   - If the sub-concept's confidence is < 0.4, the novel concept override applies (always explain fully)

5. **Follow-up invitation.** After explaining, ask: "Does that make sense? Want me to go deeper on any part, or see an example in our project?"

6. **No side effects on levels.** The `/explain` command does NOT modify competence levels. Asking for an explanation is not a signal of struggle -- it is a signal of curiosity. The request itself is neutral; only the user's response afterward may generate signals.

## Arguments
| Argument | Required | Description |
|---|---|---|
| `<concept>` | No | The concept to explain (e.g., "TDD", "git branching", "what is an API"). If omitted, asks interactively. |

## Phase-Specific Behavior

| Phase | Behavior |
|---|---|
| 0-1 (Discovery/Observer) | Full depth. Start from fundamentals. Maximum use of analogies. Define every term. |
| 2-3 (Co-Pilot/Navigator) | Build on existing knowledge. Reference prior concepts. Go deeper into nuances. |
| 4 (Driver) | Discuss trade-offs and edge cases. Treat user as a peer exploring a topic. |
| 5 (Graduate) | This is the primary teaching mechanism at Phase 5. All other commands are silent. `/explain` is how graduates access the teaching layer on demand. Full depth on any requested topic. |

## Implementation Notes
_Empty -- filled during implementation._

## Test Requirements
1. **Always accessible test.** `/explain` works even without a learner profile (defaults to Level 0, verbosity 5).
2. **Concept classification test.** Known concepts (TDD, git branching, API design) are correctly mapped to their competence dimension and sub-concept.
3. **Level adaptation test.** The same concept produces different explanation depths at Level 0 vs Level 4 in the relevant dimension.
4. **Analogy usage test.** When `user.preferred_analogies` is set, the explanation uses analogies from that domain.
5. **Prior concept reference test.** When explaining a concept related to previously introduced concepts, the explanation references the prior learning.
6. **Novel concept tracking test.** An explained concept not previously seen is added to `concepts_introduced` for the session.
7. **No level modification test.** Running `/explain` does not produce any signals that modify competence levels.
8. **Mentor agent routing test.** The `mentor` agent (Opus) is invoked, not any other agent.
