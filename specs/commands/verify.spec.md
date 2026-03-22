# Component: verify
## Type: command
## Status: pending
## Dependencies: dev-verifier agent, build-fixer agent, scripts/lib/learner-profile.js
## Session Target: 5

## What This Is
The `/verify` command runs all verification checks as a standalone operation outside the full `/build` pipeline. It invokes the `dev-verifier` agent to run build, type, lint, test, and coverage checks, with teaching annotations explaining what each check does and why it matters. Adapted to the user's verification dimension level.

## Command Frontmatter
```yaml
---
description: Run all verification checks -- build, types, lint, tests, coverage. Guided verification with teaching adapted to your level.
---
```

## Behavior Specification

1. **Profile check.** Read `state/learner-profile.json`. If no profile exists, redirect to `/start`.

2. **Project context.** Read the active project to determine the tech stack and which verification tools apply. Different stacks have different verification steps (e.g., TypeScript has type checking, Python does not have a compile step).

3. **Invoke dev-verifier agent.** The `dev-verifier` agent (Sonnet) runs verification checks in order:

   **Check 1: Build**
   - Run the project's build command (e.g., `npm run build`, `go build`)
   - Pass: proceed. Fail: invoke `build-fixer` agent.
   - Teach: "The build check makes sure all the code compiles and can turn into a running program."

   **Check 2: Type check** (if applicable)
   - Run type checking (e.g., `npx tsc --noEmit`, `mypy`)
   - Pass: proceed. Fail: report type errors, offer to fix.
   - Teach: "Type checking catches errors where we are using the wrong kind of data -- like passing a number where text is expected."

   **Check 3: Lint**
   - Run linter (e.g., `eslint`, `ruff`, `golangci-lint`)
   - Pass: proceed. Fail: report lint issues, offer to auto-fix.
   - Teach: "Linting checks for code style issues and common mistakes. Think of it as a spell checker for code."

   **Check 4: Test suite**
   - Run the full test suite (e.g., `npm test`, `pytest`, `go test`)
   - Pass: proceed. Fail: report failures, invoke `build-fixer` for diagnosis.
   - Teach: "Running all the tests makes sure nothing we changed broke something that was already working."

   **Check 5: Test coverage**
   - Check coverage against the 80% target
   - Pass (>=80%): celebrate. Below target: identify uncovered areas, suggest tests.
   - Teach: "Test coverage tells us what percentage of our code is actually tested. 80% is our target -- it means 4 out of every 5 lines are verified."

4. **Teaching annotations.** The dev-verifier reads the learner profile:
   - `annotation_depth = max(0, verbosity - (verification_level - 1))`
   - At depth 4-5: explains what each check IS, why it exists, what the output means
   - At depth 2-3: explains check results, highlights important failures
   - At depth 0-1: reports pass/fail summary

5. **User interaction by phase:**
   - **Phase 1-2:** Run all checks automatically. Explain results.
   - **Phase 2+ (Socratic):** Before running, ask: "Which checks do you think we need to run? What are we looking for?" Then run and compare.
   - **Phase 3+:** Present results. Let user decide which failures to address.

6. **Error handling.** When any check fails:
   - At all phases: clearly explain what failed and why
   - At Phase 1-2: invoke `build-fixer` automatically
   - At Phase 3+: present the error, ask user how they want to proceed, invoke `build-fixer` on request

7. **Positive signal detection.** If the user independently initiates verification (runs build/test/lint commands without being told), record a positive signal (+0.15) for the verification dimension.

8. **Session state.** Record `"verify"` in `pipeline_steps_executed`.

## Arguments
| Argument | Required | Description |
|---|---|---|
| `<check>` | No | Specific check to run: `build`, `types`, `lint`, `tests`, `coverage`. If omitted, runs all checks. |

## Phase-Specific Behavior

| Phase | Behavior |
|---|---|
| 0 (Discovery) | Not applicable. No code to verify yet. Suggest `/discover` or `/build`. |
| 1 (Observer) | Full annotation. All checks run automatically. Each check is explained: what it does, what the output means, why it matters. |
| 2 (Co-Pilot) | Medium annotation. Claude asks which checks the user expects to run (Socratic). Runs all checks. Explains failures in detail. |
| 3 (Navigator) | Low annotation. Reports pass/fail summary. Annotates only novel checks (e.g., first time running coverage). User decides which failures to fix. |
| 4 (Driver) | Minimal. Pass/fail summary. Proceeds on instruction. |
| 5 (Graduate) | Summary only. No annotation. |

## Implementation Notes
_Empty -- filled during implementation._

## Test Requirements
1. **Profile prerequisite test.** No profile redirects to `/start`.
2. **Full verification test.** All 5 checks are executed in order: build, types, lint, tests, coverage.
3. **Selective check test.** Providing a specific check argument (e.g., `/verify tests`) runs only that check.
4. **Build failure recovery test.** A build check failure invokes the `build-fixer` agent.
5. **Coverage threshold test.** Coverage below 80% is reported with suggestions for improvement. Coverage at or above 80% is reported as passing.
6. **Annotation depth test.** At verification level 0 + verbosity 3, each check gets a full explanation. At level 4 + verbosity 3, only pass/fail is reported.
7. **Session history test.** After verification, `"verify"` appears in `pipeline_steps_executed`.
8. **User-initiated signal test.** When the user runs verification commands independently (detected by the hook), a positive signal is recorded.
