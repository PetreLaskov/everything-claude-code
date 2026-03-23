# Component: debugging-strategy
## Type: skill
## Status: pending
## Dependencies: dev-pipeline (debugging arises during implementation and verification), test-driven-development (tests are the first debugging tool)
## Session Target: 1

## What This Is
Teaches how to debug systematically for non-developers. Covers how to read error messages, form hypotheses, isolate problems, and verify fixes. This skill turns error messages from scary red text into actionable information. It also teaches when to ask for help vs. when to try solving independently, which is critical for building user independence across phases.

## Skill Frontmatter
```yaml
name: debugging-strategy
description: "Activated when errors or bugs are encountered, when build or test failures occur, when the user sees an error message and needs help understanding it, or when discussing how to fix things that are broken."
origin: MDH
```

## Content Specification

### Section 1: Errors Are Information, Not Failures
Reframe errors for non-developers: an error message is the computer telling you exactly what went wrong and often where. Most non-developers see red text and panic. Teach them to read errors as helpful messages. Cover the anatomy of a typical error: the message, the stack trace (which file, which line), and the error type.

### Section 2: The Debugging Process
Teach a systematic approach (not "stare at the code until you see it"):
1. **Read the error message** — actually read it, word by word. What does it say happened?
2. **Find the location** — the error tells you which file and line. Go there.
3. **Form a hypothesis** — based on the error, what do you think went wrong? (e.g., "it says 'undefined' — maybe the variable was not set")
4. **Test the hypothesis** — make one small change and see if the error changes
5. **Verify the fix** — run the tests to confirm the fix works AND nothing else broke

### Section 3: Common Error Patterns
Teach the most common error types in plain language:
- **"undefined is not a function"** — you tried to use something that does not exist
- **"cannot read property of null"** — you tried to access a field on something that is empty
- **"module not found"** — a dependency is missing or the path is wrong
- **"type error"** — you passed the wrong kind of data to a function
- **Build failures** — the code cannot be compiled (syntax errors, missing imports)
- **Test failures** — the code works but does not match what the test expected

### Section 4: When to Debug Yourself vs. Ask for Help
Teach the escalation pattern:
- Read the error message first (always)
- Try one hypothesis (change one thing, run again)
- If the error persists or changes in a confusing way, describe what you see to Claude
- When telling Claude about a bug: include the error message, what you expected, what actually happened, and what you already tried
- The build-fixer agent turns every error into a teaching moment: "This error means X, it happened because Y, here is how to fix it and avoid it next time"

### Section 5: Debugging with Tests
Connect debugging to TDD:
- If a bug exists, write a test that reproduces it FIRST
- Then fix the code until the test passes
- This ensures the bug never comes back (regression prevention)
- Tests are the most reliable debugging tool because they are automated and repeatable

### Section 6: Reading Build and Verification Output
Teach how to interpret the verification pipeline output:
- Build check: did the code compile? If not, fix syntax first.
- Type check: are the data types correct?
- Lint check: does the code follow style rules?
- Test check: do all tests pass? If not, which ones failed and why?
- Understanding that fixing one error may reveal others (cascading errors)

## ECC Source Material
- ECC manual section 5: "Fix a build error" — /build-fix command, build-error-resolver agent
- ECC manual section 12: build-error-resolver agent — fix build/type errors with minimal diffs, agent escalation
- ECC rules/common/testing.md — "Troubleshooting Test Failures" (use tdd-guide agent, check test isolation, verify mocks, fix implementation not tests)
- ECC rules/common/performance.md — "Build Troubleshooting" (use build-error-resolver agent, analyze errors, fix incrementally, verify after each fix)
- ECC manual section 6: "Agent Escalation" — build-error-resolver escalation chain

## Implementation Notes
[Empty — filled during implementation]
