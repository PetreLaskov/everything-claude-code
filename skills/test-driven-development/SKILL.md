---
name: test-driven-development
description: "Activated when the implementation step of the pipeline is active, when writing or discussing tests, when a bug is being fixed, or when the user asks about test-driven development or testing in general."
origin: MDH
---

# TDD Methodology

## What Tests Are and Why They Exist

If you've never seen a software test before, here's the simplest way to understand it: a test is a contract. It's a written promise that says, "This code guarantees it will do X."

Think of it like a quality check at a factory. A factory that makes light bulbs could just ship every bulb and hope they work. But instead, they test each bulb: screw it in, flip the switch, confirm it lights up. If it doesn't, they catch the defect before it reaches a customer.

Software tests work the same way. A test says, "When I give this function the number 5 and the number 3, it should give me back 8." Then the test runs. If the function returns 8, the test passes. If it returns anything else, the test fails, and you know something is broken.

**Why does this matter?** Because there are three ways bugs get found:

1. **You find the bug yourself** while reviewing the work. This is the cheapest option, but it relies on you remembering to check and knowing what to look for.

2. **Users find the bug** after you've shipped the software. This is the most expensive option. Users lose trust, you get urgent reports, and fixing a bug in production (live software) is stressful and risky.

3. **Tests find the bug automatically** every time the code runs. This is the best option. Tests never get tired, never forget to check, and never feel awkward reporting a problem. They run in seconds and catch problems immediately.

Tests don't eliminate all bugs. But they dramatically reduce the number of bugs that escape into the hands of real users. That's why every professional software team writes them.

---

## The Red-Green-Refactor Protocol

TDD follows a three-step loop. The agent executes this loop for every piece of functionality it builds. Your job is knowing the protocol so you can verify it was followed.

### Step 1: RED — Tests are written first

Before any real code is written, the agent writes a test that describes what the code should do. Then it runs the test. It will fail, because the code it's testing doesn't exist yet.

**This failure is good.** It proves two things:
- The test is actually checking something real (a test that passes no matter what is useless)
- There's a clear definition of what "success" looks like before implementation starts

**What to watch for:** You should see test output showing a FAILURE before any implementation code is written. If the agent jumps straight to writing code without a failing test first, that's a red flag — say "write the tests first and show me them failing before you implement."

### Step 2: GREEN — Minimum code to pass

The agent writes just enough code to make the test pass. Not the perfect code, not the elegant code — just the minimum that turns the test from red to green.

**What to watch for:** After the agent writes the implementation, you should see the test output change from FAILURE to PASS. If the agent writes a lot of code but doesn't run the tests between steps, ask: "Run the tests — I want to see them pass."

### Step 3: REFACTOR — Clean up without changing behavior

Now that tests pass, the agent can safely improve the code — rename things for clarity, remove duplication, reorganize. The key rule: **the tests must still pass after refactoring.**

Refactoring with tests is like renovating a room while the building inspector watches. You can move furniture, repaint walls, and replace fixtures, but the inspector (your tests) will immediately tell you if you accidentally knocked out a load-bearing wall.

**What to watch for:** After refactoring, the agent should run tests again. If tests still pass, the refactoring was safe. If they fail, something went wrong and the agent needs to undo.

### Your Verification Checklist

After the agent runs a TDD cycle, confirm:
- Did the tests FAIL first (RED)? If you never saw red, the tests might not be testing anything real.
- Did the tests PASS after implementation (GREEN)? If so, the implementation works for at least the specified cases.
- Did the tests STILL PASS after cleanup (REFACTOR)? If so, the refactoring was safe.
- Did anything ELSE break? The agent should run the full test suite, not just the new tests.

If the agent skips any of these steps, you can say: "Use red/green TDD" — this four-word phrase encodes the entire protocol, and the agent will follow it.

---

## Why Tests Come FIRST

This is the part that feels counterintuitive. "Why not just build the code, then write tests afterward to make sure it works?"

### Tests first forces WHAT before HOW

When tests are written first, the team is forced to think about what the code should do before thinking about how to do it. "This function should accept a list of numbers and return the average" is a clear, testable statement. Without that clarity, implementation often starts with a vague idea and ends with code that sort of works but isn't clearly defined.

### Tests after are tautological

When code is written first and tests second, there's a strong temptation to write tests that match what the code already does, rather than what it should do. If the code has a bug, the after-the-fact test might encode that bug as "correct" behavior. Tests written first describe the intended behavior, independent of the implementation.

### The exam before the lecture

Think of it this way: if a professor writes the exam before preparing the lecture, the lecture will cover exactly what students need to know. If the professor writes the lecture first and the exam second, the exam might test things that were never taught, or miss important topics. Writing tests first is writing the exam before the lecture — it ensures the implementation covers everything that matters.

---

## Types of Tests

Software tests come in three types. Each catches different kinds of problems. You need to know when to demand each one.

### Unit Tests — Testing individual pieces

**What they test:** A single function, one small piece of logic in isolation.

**Analogy:** Testing that each light switch in your house controls the correct light. You flip one switch at a time and check one light at a time.

**When to demand them:** For every piece of business logic — calculations, data transformations, validation rules. These are the foundation of your test suite.

### Integration Tests — Testing pieces working together

**What they test:** Multiple components in combination. Does the API endpoint correctly read from the database and return the right response?

**Analogy:** Testing that when you flip the light switch, the electrical wiring correctly carries power from the breaker box through the wall to the light fixture. The switch works, the wiring works, the fixture works — but do they work together?

**When to demand them:** For any feature where components interact — form submissions that hit a database, API endpoints that call external services, authentication flows that span multiple layers.

### E2E Tests (End-to-End) — Testing the whole experience

**What they test:** The entire application from the user's perspective. A robot pretends to be a user: opens the browser, clicks buttons, fills forms, reads pages.

**Analogy:** Moving into the house and living in it for a day. Cook a meal, take a shower, watch TV, lock the door at night. Everything works together as a whole home.

**When to demand them:** For critical user journeys — signup, login, checkout, the core action your app exists to perform. Keep these few and focused.

### The Testing Pyramid

Imagine a pyramid. The base is wide, the top is narrow.

- **Base (most tests): Unit tests.** Fast, cheap, reliable. The agent should write lots of these.
- **Middle (some tests): Integration tests.** Slower but important. Enough to cover key interactions.
- **Top (few tests): E2E tests.** Slow and fragile. Just enough to cover critical user journeys.

If your test suite is mostly E2E tests with few unit tests, the pyramid is upside down — tests will be slow, flaky, and expensive to maintain. If you see this, ask the agent to add more unit tests.

---

## The 80% Coverage Target

### What coverage means

Test coverage answers: "What percentage of your code gets executed when your tests run?"

If the code is 100 lines long and the tests cause 80 of those lines to run, you have 80% coverage. The other 20 lines are not tested — if they contain bugs, the tests won't catch them.

### Why 80% and not 100%

**100% coverage sounds ideal but has diminishing returns.** Getting from 0% to 80% catches the vast majority of bugs. Getting from 80% to 100% takes disproportionate effort for diminishing benefit. The last 20% often includes trivially simple code, auto-generated code, or error-handling paths that are extremely difficult to trigger in tests.

**80% is the sweet spot** where you've covered all the important business logic, edge cases, and error paths without spending excessive effort on code that almost certainly works correctly.

### How to read a coverage report

A coverage report typically shows:
- **Overall percentage** — The single number (e.g., "Coverage: 83%")
- **Per-file breakdown** — Which files are well-tested and which aren't
- **Uncovered lines** — Specific lines of code that no test exercises

When reading a coverage report, focus on:
1. Are your most critical files (business logic, data handling, authentication) above 80%?
2. Are there entire files with 0% coverage? Those are blind spots.
3. Are the uncovered lines important (error handling, edge cases) or trivial (logging, formatting)?

### What to prioritize testing

Not all code is equally important to test. When directing the agent, prioritize:

1. **Business logic** — The core rules of your application. How prices are calculated, how permissions are checked, how data is transformed. Bugs here directly affect users.

2. **Edge cases** — What happens with empty input? Extremely large numbers? Strings where numbers are expected? Edge cases are where most bugs hide.

3. **Error paths** — What happens when the database is down? When the API returns an error? When the user's session expires?

4. **Input validation** — Code that checks whether user input is valid. A bug in validation can let bad data into your system.

Lower priority:
- Simple getters/setters (functions that just return a stored value)
- Auto-generated code (database migrations, build artifacts)
- Third-party library wrappers (test your logic, not their library)

---

## TDD for Bug Fixes

When a bug is reported, TDD provides an especially powerful workflow. Instead of just fixing the bug, you create a permanent guard against it.

### The workflow you should demand

1. **Reproduce first:** Tell the agent to write a test that demonstrates the problem BEFORE fixing it. "Write a test that shows this bug happening."

2. **Verify the test fails:** The reproduction test should fail in exactly the way the bug manifests. If it passes, the test isn't capturing the real problem.

3. **Fix and verify:** After the agent fixes the code, the reproduction test should pass. All other tests should still pass too.

4. **Permanent guard:** That reproduction test stays in the test suite forever. If anyone ever changes the code in a way that reintroduces the bug, the test will fail immediately.

**Example:** Users report that the discount calculation gives wrong results for orders over $1,000. You tell the agent: "Write a test that shows the discount failing for a $1,200 order, then fix it with red/green TDD." The agent writes a test (it fails — red), fixes the discount logic (test passes — green), runs all tests (everything passes). The bug can never silently return.

This is one of the most valuable patterns: **every bug fix comes with a test that ensures the bug can never happen again.** Over time, your test suite becomes a record of every problem the project has ever had and a guarantee that none will recur.
