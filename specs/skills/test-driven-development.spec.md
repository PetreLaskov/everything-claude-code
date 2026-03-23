# Component: test-driven-development
## Type: skill
## Status: pending
## Dependencies: dev-pipeline (references as step 2 of the pipeline)
## Session Target: 1

## What This Is
Teaches test-driven development for non-developers. Covers what tests ARE, why writing them first matters, the Red-Green-Refactor cycle, the 80% coverage target, and how tests prevent bugs. This is the most opinionated skill — TDD is mandatory in the pipeline, and this skill explains why in terms a non-developer can understand and internalize.

## Skill Frontmatter
```yaml
name: test-driven-development
description: "Activated when the implementation step of the pipeline is active, when writing or discussing tests, when a bug is being fixed, or when the user asks about test-driven development or testing in general."
origin: MDH
```

## Content Specification

### Section 1: What Tests Are and Why They Exist
Explain for someone who has never seen a test. Use the analogy: a test is a contract that says "this code promises to do X." If the code breaks the contract, the test catches it immediately instead of a user finding the bug later. Cover the difference between: finding bugs yourself, users finding bugs, and tests finding bugs automatically.

### Section 2: The Red-Green-Refactor Cycle
Teach the TDD workflow with concrete, step-by-step explanations:
1. **Red** — Write a test that describes what the code SHOULD do. Run it. It FAILS because the code does not exist yet. This failure is GOOD — it proves the test is checking the right thing.
2. **Green** — Write the MINIMUM code needed to make the test pass. Do not write extra features. Just make it pass.
3. **Refactor** — Clean up the code without changing what it does. The tests prove you did not break anything during cleanup.
4. **Repeat** — For each new behavior, add a new test and repeat the cycle.

### Section 3: Why Tests Come FIRST (Not After)
Address the common objection: "Why not write the code first, then add tests?" Explain the cognitive difference:
- Writing tests first forces you to think about WHAT before HOW
- Tests written after tend to test what the code does (tautological) rather than what it should do
- Tests first catches design problems early — if something is hard to test, it is often poorly designed
- Frame as: "writing the exam before the lecture"

### Section 4: Types of Tests
Teach at a conceptual level (not implementation details):
- **Unit tests** — test individual functions in isolation (fast, focused)
- **Integration tests** — test how pieces work together (API calls, database operations)
- **E2E tests** — test the whole application from a user's perspective (slow, comprehensive)
Explain the testing pyramid and why most tests should be unit tests.

### Section 5: The 80% Coverage Target
Explain what test coverage means (percentage of code lines that are executed by tests). Why 80% is the target — not 100% (diminishing returns, some code is trivial). How to read a coverage report. What to prioritize testing (business logic, edge cases, error paths).

### Section 6: TDD for Bug Fixes
Teach the bug-fix TDD pattern: write a test that REPRODUCES the bug first, then fix the code to make the test pass. This ensures the bug never comes back (regression prevention).

## ECC Source Material
- ECC manual section 4: "/tdd — Build It Test-First" — the five-step TDD workflow (Scaffold, Red, Green, Refactor, Coverage)
- ECC rules/common/testing.md — minimum 80% test coverage, three test types required, mandatory TDD workflow, troubleshooting test failures
- ECC rules/common/development-workflow.md — step 2 "TDD Approach" (use tdd-guide agent, write tests first, verify 80%+ coverage)
- ECC manual section 3: pipeline step 2 (IMPLEMENT) — "Build it test-first"
- ECC agents/tdd-guide.md — TDD enforcement agent specification

## Implementation Notes
[Empty — filled during implementation]
