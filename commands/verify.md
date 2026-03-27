---
description: Run all verification checks -- build, types, lint, tests, coverage. Guided verification with teaching adapted to your level.
---

# Verify

Run verification checks against the active project. Invokes the **dev-verifier** agent to execute build, type check, lint, test suite, and coverage checks in order.

## Prerequisites

Read `state/learner-profile.json`.

- If no profile exists, redirect to `/start`.
- Read the user's `verification` dimension level and `verbosity` setting.
- Calculate `annotation_depth = max(0, verbosity - (verification_level - 1))`.
- Read the active project to determine the tech stack and which verification tools apply.

## Selective Check

If `$ARGUMENTS` contains a specific check name (`build`, `types`, `lint`, `tests`, `coverage`), run only that check. Otherwise, run all 5 checks in order.

## User-Initiated Signal

If the user independently initiated this verification (ran `/verify` without being prompted or guided to do so), record a positive signal of +0.15 for the `verification` dimension.

## Teaching Mode Selection

Check the user's `verification` dimension level:

- **Phase 1-2:** Run all checks automatically. Explain results at the calculated annotation depth.
- **Phase 2+ (Socratic):** Before running, ask: "Which checks do you think we need to run? What are we looking for?" Then run the checks and compare the user's expectations to the results.
- **Phase 3+:** Present results. Let the user decide which failures to address.

## Verification Checks

Invoke the **dev-verifier** agent (Sonnet) to run the following checks in order.

### Check 1: Build

Run the project's build command (e.g., `npm run build`, `go build`).

- Pass: proceed to the next check.
- Fail: invoke the **build-fixer** agent to diagnose and fix.
- At annotation depth 4-5: "The build check makes sure all the code compiles and can turn into a running program."
- At annotation depth 2-3: Explain what failed and highlight the key error.
- At annotation depth 0-1: Report pass/fail.

### Check 2: Type Check

Run type checking if applicable to the tech stack (e.g., `npx tsc --noEmit`, `mypy`). Skip if the stack has no type checker.

- Pass: proceed to the next check.
- Fail: report type errors, offer to fix.
- At annotation depth 4-5: "Type checking catches errors where we are using the wrong kind of data -- like passing a number where text is expected."
- At annotation depth 2-3: Explain the type errors and what they mean.
- At annotation depth 0-1: Report pass/fail.

### Check 3: Lint

Run the project's linter (e.g., `eslint`, `ruff`, `golangci-lint`).

- Pass: proceed to the next check.
- Fail: report lint issues, offer to auto-fix.
- At annotation depth 4-5: "Linting checks for code style issues and common mistakes. Think of it as a spell checker for code."
- At annotation depth 2-3: Explain the lint issues and which ones matter most.
- At annotation depth 0-1: Report pass/fail.

### Check 4: Test Suite

Run the full test suite (e.g., `npm test`, `pytest`, `go test`).

- Pass: proceed to the next check.
- Fail: report test failures, invoke the **build-fixer** agent for diagnosis.
- At annotation depth 4-5: "Running all the tests makes sure nothing we changed broke something that was already working."
- At annotation depth 2-3: Explain which tests failed and why.
- At annotation depth 0-1: Report pass/fail.

### Check 5: Test Coverage

Check test coverage against the 80% target.

- Pass (>=80%): report the coverage percentage and celebrate the result.
- Below target: identify uncovered areas and suggest tests to improve coverage.
- At annotation depth 4-5: "Test coverage tells us what percentage of our code is actually tested. 80% is our target -- it means 4 out of every 5 lines are verified."
- At annotation depth 2-3: Explain which areas are uncovered and why they matter.
- At annotation depth 0-1: Report the coverage percentage and pass/fail.

## Error Handling

When any check fails:

- At all phases: clearly explain what failed and why.
- At Phase 1-2: invoke the **build-fixer** agent automatically to diagnose and fix.
- At Phase 3+: present the error, ask the user how they want to proceed, invoke the **build-fixer** agent on request.

## Session State

Record `"verify"` in `pipeline_steps_executed` for the current session.

## Phase-Specific Behavior

| Phase | Behavior |
|-------|----------|
| 0 (Discovery) | Not applicable. No code to verify yet. Suggest `/discover` or `/build`. |
| 1 (Observer) | Full annotation. All checks run automatically. Each check is explained: what it does, what the output means, why it matters. |
| 2 (Co-Pilot) | Medium annotation. Claude asks which checks the user expects to run (Socratic). Runs all checks. Explains failures in detail. |
| 3 (Navigator) | Low annotation. Reports pass/fail summary. Annotates only novel checks (e.g., first time running coverage). User decides which failures to fix. |
| 4 (Driver) | Minimal. Pass/fail summary. Proceeds on instruction. |
| 5 (Graduate) | Summary only. No annotation. |
