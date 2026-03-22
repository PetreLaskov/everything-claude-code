# Component: implement
## Type: command
## Status: pending
## Dependencies: dev-builder agent, build-fixer agent, scripts/lib/learner-profile.js
## Session Target: 5

## What This Is
The `/implement` command runs the TDD implementation step as a standalone operation outside the full `/build` pipeline. It invokes the `dev-builder` agent to write tests first, implement code to pass them, and refactor -- all with teaching annotations adapted to the user's implementation dimension level. This is the renamed equivalent of ECC's `/tdd` command, avoiding jargon for the non-developer audience.

## Command Frontmatter
```yaml
---
description: Implement a feature using test-driven development. Writes tests first, then code, with teaching adapted to your level.
---
```

## Behavior Specification

1. **Profile check.** Read `state/learner-profile.json`. If no profile exists, redirect to `/start`. If no active project exists, suggest `/discover` first (but do not block).

2. **Feature input.** Accept a feature description or plan reference as an argument, or ask interactively: "What do you want to implement?" If a plan was recently created via `/plan` or `/build`, reference it and ask if the user wants to implement from that plan.

3. **Invoke dev-builder agent.** The `dev-builder` agent (Sonnet) executes the TDD cycle:

   **RED phase:**
   - Write test(s) for the feature
   - Run the test suite -- tests should FAIL (the code does not exist yet)
   - Teach: "This is the RED phase. The test fails because we have not written the code yet. That is expected and actually good -- it proves the test is checking the right thing."

   **GREEN phase:**
   - Write the minimal implementation to make the test pass
   - Run the test suite -- tests should PASS
   - Teach: "This is the GREEN phase. We wrote the minimum code to make the test pass. We are not optimizing yet."

   **REFACTOR phase:**
   - Improve the implementation (clean up, extract functions, improve naming)
   - Run the test suite -- tests should still PASS
   - Teach: "This is the REFACTOR phase. Now that we know it works, we make it clean."

4. **Teaching annotations.** The dev-builder reads the learner profile and applies annotation depth:
   - `annotation_depth = max(0, verbosity - (implementation_level - 1))`
   - At depth 4-5: explains what TDD is, what tests are, what assertions mean, why we write tests first
   - At depth 2-3: explains the current phase of the cycle, points out interesting patterns
   - At depth 0-1: executes the cycle with minimal annotation

5. **User interaction by phase and teaching mode:**
   - **Directive (Level 0-1):** Claude writes everything and narrates. User watches and asks questions.
   - **Socratic (Level 2+):** Claude asks the user for test case ideas: "What cases should we test for this feature?" "What should happen if the input is invalid?" Then writes the tests incorporating the user's ideas.

6. **Error handling.** If build or tests fail unexpectedly:
   - Invoke `build-fixer` agent to diagnose
   - Teach what went wrong at appropriate depth
   - Fix and re-run
   - This is a teaching opportunity, not a failure

7. **Session state.** Record `"implement"` in `pipeline_steps_executed` for the current session.

## Arguments
| Argument | Required | Description |
|---|---|---|
| `<feature>` | No | Description of the feature to implement. If omitted, asks interactively or references the most recent plan. |

## Phase-Specific Behavior

| Phase | Behavior |
|---|---|
| 0 (Discovery) | Redirect to `/discover`. Cannot implement without a project scope. |
| 1 (Observer) | Full annotation. Claude writes all tests and code while narrating the TDD cycle. User watches, asks questions. Claude explains what each test does and why. |
| 2 (Co-Pilot) | Medium annotation. Claude asks user for test cases before writing. User participates in deciding WHAT to test. Claude writes the actual test code. Explains key decisions. |
| 3 (Navigator) | Low annotation. User describes test cases AND may modify generated tests. Claude writes implementation. Annotates only new patterns (e.g., first time seeing mocking, edge case testing). |
| 4 (Driver) | Minimal annotation. User instructs what to build. Claude executes TDD on instruction. Annotates only risks or novel patterns. |
| 5 (Graduate) | No annotation. Executes on instruction. TDD cycle runs silently. |

## Implementation Notes
_Empty -- filled during implementation._

## Test Requirements
1. **Profile prerequisite test.** No profile redirects to `/start`.
2. **TDD cycle test.** The dev-builder agent executes all three phases: RED (test fails), GREEN (test passes), REFACTOR (test still passes).
3. **Test-first verification test.** Tests are written BEFORE implementation code. The test run during RED phase produces at least one failure.
4. **Annotation depth test.** At implementation level 0 + verbosity 3, depth is 4 (full TDD explanation). At level 4 + verbosity 3, depth is 0 (silent execution).
5. **Socratic mode test.** At implementation level 2+, the agent asks user for test case ideas before writing tests.
6. **Build failure recovery test.** When implementation causes a build error, `build-fixer` agent is invoked and the step re-runs.
7. **Session history test.** After implementation, `"implement"` appears in `pipeline_steps_executed`.
8. **Plan reference test.** When a recent plan exists, the command offers to implement from that plan.
