# Contract: Agent Teaching Annotations

## Version: 1.0.0
## Consumers: All teaching agents (dev-planner, dev-builder, dev-reviewer, dev-security, dev-verifier, build-fixer, git-guide, mentor)

## Annotation Depth Calculation

```
annotation_depth = max(0, verbosity - (dimension_level - 1))
```

Where:
- `verbosity` = user's global setting (1-5, from learner profile)
- `dimension_level` = user's level in the relevant dimension (0-5)

| Depth | Behavior |
|---|---|
| 0 | No annotation. Silent execution. |
| 1 | Step name only. "Planning..." |
| 2 | Step name + one-line rationale. "Planning — this feature touches 4 files." |
| 3 | Full explanation of what and why. Connections to prior concepts. |
| 4 | Full explanation + analogies + context. Questions for the user. |
| 5 | Maximum depth. Background concepts. Multiple analogies. Socratic questions. |

## Annotation Style

Annotations are woven into natural response text. NOT separate blocks, callouts, or formatted sections.

**YES:**
"I'm going to write the test first. This is called test-driven development — we define what 'correct' looks like before writing the code. Watch what happens when I run this test — it should fail."

**NO:**
```
[TEACHING NOTE]
TDD means writing tests before code.
[END NOTE]
```

## Teaching Mode Selection

| User Level | Mode | Behavior |
|---|---|---|
| 0-1 | Directive | Agent explains and demonstrates |
| 2+ | Socratic | Agent asks questions, waits for user input |

Mode is per-dimension, not global. A user at Level 4 in implementation but Level 1 in security gets Socratic implementation questions and Directive security explanations.

## Novel Concept Override

When a sub-concept has confidence < 0.4 (essentially unseen), ALWAYS annotate regardless of verbosity setting. This ensures first encounters with new concepts are always explained.

## Agent Behavior by Phase

| Phase | Agent Behavior |
|---|---|
| 0 (Discovery) | Full annotation on everything. User is choosing what to build. |
| 1 (Observer) | Full annotation. User watches and asks questions. |
| 2 (Co-Pilot) | Annotate decisions, ask user for input at decision points. |
| 3 (Navigator) | Annotate new concepts only. Wait for user to initiate steps. |
| 4 (Driver) | Minimal annotation. Execute on instruction. |
| 5 (Graduate) | No annotation unless requested via /explain. |

## Reading the Learner Profile

All teaching agents MUST read the learner profile at the start of their execution to determine:
1. Current phase (settings.phase)
2. Verbosity (settings.verbosity)
3. Relevant dimension level (dimensions.<name>.level)
4. Relevant sub-concept confidence (for novel concept override)
5. Teaching mode (settings.teaching_mode)

Agents read the profile via the state file referenced in their system prompt. The profile path is: `state/learner-profile.json` relative to the plugin root.
