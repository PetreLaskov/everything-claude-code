---
description: Implement a feature using test-driven development. Writes tests first, then code, with teaching adapted to your level.
---

# Implement

Run the TDD implementation cycle for a feature. Invokes the **dev-builder** agent to write tests first, implement code to pass them, and refactor.

## Prerequisites

Read `state/learner-profile.json`.

- If no profile exists, redirect to `/start`.
- If no active project exists, suggest `/discover` first but do not block.
- Read the user's `implementation` dimension level and `verbosity` setting.
- Calculate `annotation_depth = max(0, verbosity - (implementation_level - 1))`.

## Feature Input

Determine what to implement:

1. If `$ARGUMENTS` contains a feature description, use that.
2. If a plan was recently created via `/plan` or `/build` (check `pipeline_steps_executed` for the current session), reference it and ask: "A plan was created earlier this session. Want to implement from that plan?"
3. If neither, ask interactively: "What do you want to implement?"

## Teaching Mode Selection

Check the user's `implementation` dimension level:

- **Level 0-1 (Directive):** Claude writes all tests and code. Narrate each phase at the calculated annotation depth.
- **Level 2+ (Socratic):** Before writing tests, ask the user for test case ideas: "What cases should we test for this feature?" and "What should happen if the input is invalid?" Incorporate the user's ideas into the tests.

## TDD Cycle

Invoke the **dev-builder** agent (Sonnet) to execute the three-phase TDD cycle.

### RED Phase

1. Write test(s) for the feature.
2. Run the test suite. Tests must FAIL (the implementation does not exist yet).
3. At annotation depth 4-5: "This is the RED phase. The test fails because we have not written the code yet. That is expected and actually good -- it proves the test is checking the right thing."
4. At annotation depth 2-3: Explain the current phase and point out interesting patterns in the test design.
5. At annotation depth 0-1: Execute with minimal commentary.

### GREEN Phase

1. Write the minimal implementation to make the test pass.
2. Run the test suite. Tests must PASS.
3. At annotation depth 4-5: "This is the GREEN phase. We wrote the minimum code to make the test pass. We are not optimizing yet."
4. At annotation depth 2-3: Explain key decisions made in the implementation.
5. At annotation depth 0-1: Execute with minimal commentary.

### REFACTOR Phase

1. Improve the implementation: clean up, extract functions, improve naming.
2. Run the test suite. Tests must still PASS.
3. At annotation depth 4-5: "This is the REFACTOR phase. Now that we know it works, we make it clean."
4. At annotation depth 2-3: Explain what was improved and why.
5. At annotation depth 0-1: Execute with minimal commentary.

## Error Handling

If the build or tests fail unexpectedly during any phase:

1. Invoke the **build-fixer** agent to diagnose the failure.
2. Teach what went wrong at the appropriate annotation depth. This is a teaching opportunity, not a failure.
3. Apply the fix and re-run the failing check.

## Session State

Record `"implement"` in `pipeline_steps_executed` for the current session.

## Phase-Specific Behavior

| Phase | Behavior |
|-------|----------|
| 0 (Discovery) | Redirect to `/discover`. Cannot implement without a project scope. |
| 1 (Observer) | Full annotation. Claude writes all tests and code while narrating the TDD cycle. User watches and asks questions. Claude explains what each test does and why. |
| 2 (Co-Pilot) | Medium annotation. Claude asks user for test cases before writing. User participates in deciding what to test. Claude writes the actual test code. Explains key decisions. |
| 3 (Navigator) | Low annotation. User describes test cases and may modify generated tests. Claude writes implementation. Annotates only new patterns (e.g., first time seeing mocking, edge case testing). |
| 4 (Driver) | Minimal annotation. User instructs what to build. Claude executes TDD on instruction. Annotates only risks or novel patterns. |
| 5 (Graduate) | No annotation. Executes on instruction. TDD cycle runs silently. |
