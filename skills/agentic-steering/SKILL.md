---
name: agentic-steering
description: "Activated at Phase 2+ when teaching about effective AI collaboration, when the learner is composing prompts, when verification decisions arise, or when the mentor needs to model good steering behavior. Patterns sourced from Simon Willison's Agentic Engineering Patterns."
origin: MDH (adapted from simonwillison.net/guides/agentic-engineering-patterns/)
---

# Agentic Steering Patterns

A reference library of patterns for steering AI agents effectively. Each pattern is a short entry: what to do, when to use it, what to watch for. Agents consult this when relevant; the mentor weaves patterns into narration at the right phase.

---

## Steering Phrases

Short prompts that encode deep engineering discipline. The models already understand these — the learner's job is knowing WHICH phrase to use WHEN.

### "First run the tests"

Use at the start of every session on an existing project. Three purposes: orients the agent to the codebase through its test suite, establishes a passing baseline before you change anything, and primes the agent to maintain tests going forward. If some tests fail before you start, you know not to blame your own changes.

### "Use red/green TDD"

Append to any feature request. Makes the agent write tests first (they fail — red), then implement until tests pass (green). Skipping the red phase risks tests that pass vacuously. The learner's verification job: confirm the agent showed failure BEFORE success.

### "Explore that using curl"

After building an API, this single word — "explore" — triggers broad-spectrum manual verification. The agent will try multiple endpoints, edge cases, error conditions. Works for any verification where you want the agent to poke around rather than follow a script.

### "Sort out this git mess"

Delegates complex git situations (merge conflicts, tangled history, accidental commits) without requiring the learner to understand the mechanics. The agent reasons through intent and resolves it. The learner evaluates the result, not the process.

---

## Steering Judgment

When/what/how decisions that separate effective steering from vibe coding.

### Trust Calibration

Not all agent output needs the same verification. Calibrate by risk:
- **High trust, low check:** Boilerplate, formatting, routine scaffolding. The agent has seen this pattern millions of times.
- **Medium trust, spot-check:** Business logic, API integrations, data transformations. Read the output — does it match what you asked for?
- **Low trust, full verification:** Security-sensitive code, deployment configs, anything touching money or user data. Run the full pipeline. Do not skip verification.

The skill is not "verify everything" — that defeats the purpose. The skill is knowing which category the current task falls into.

### Active Supervision

Expert agent use is watching and redirecting mid-flight, not fire-and-forget. Keep an eye on what the agent is doing. Redirect if it goes off course. Inject new ideas while it is working. The agent works best with a human who is paying attention, not one who walks away and checks back later.

### Decomposition Instinct

If you find yourself writing a long, complex prompt, that is a signal to decompose. Break it into steps. Run each step through the relevant part of the pipeline. The instinct for WHEN to decompose and HOW to scope each piece is the core orchestration skill. Agents work best with clear, bounded tasks.

### Depth Limit Recognition

You will reach moments where the agent's output looks plausible but you cannot evaluate whether it is correct. This is your depth limit. Recognizing it is a strength. When you hit it: ask the agent to explain its reasoning. Run the review and security steps even if you would normally skip them. If the explanation does not make sense to you, that is the next concept to learn.

### Intent Over Polish

A clumsy prompt works if the intent is clear. Do not over-invest in prompt perfection. Express what you want, let the agent interpret. Correct on the next turn if needed. Velocity comes from iterating quickly, not from crafting the perfect first prompt.

### Unsolicited Feature Detection

Agents sometimes add things you did not ask for. A URL input field you did not request. An extra configuration option. A feature that seems useful but was not in scope. Your job is to NOTICE these additions and consciously decide: keep it, or ask the agent to remove it. Do not let scope drift happen passively.

---

## Steering Habits

Recurring practices that compound over time.

### Cognitive Debt Repayment

When you build without understanding what was built, you take on cognitive debt. Small amounts are fine — not every utility function needs deep comprehension. But when core logic becomes a black box, you lose the ability to steer future development. Repayment: commission the agent to walk you through what it built. "Read the source and give me a structured walkthrough of how this works." Do this after significant builds, especially in areas you will need to extend later.

### Compound Engineering

After each significant build, do a brief retrospective: what worked, what did not, what should be encoded into the harness for next time. Small improvements compound. A prompt pattern that worked gets saved. A verification step that caught a bug gets made standard. Your harness evolves with your experience.

### Hoard What Works

Your harness — CLAUDE.md, rules, skills, agent configs — IS your accumulated knowledge library. When you figure out a trick that works (a prompt pattern, a verification workflow, a project structure), encode it. You only need to figure something out once. Everything encoded is available to every future session.

### Testing Provision

Before giving the agent a task, your highest-leverage move is ensuring it can test its own work. For a web app: make sure it can start a dev server. For an API: make sure it can call endpoints. For a library: make sure it can run the test suite. An agent that can execute and verify its own code produces dramatically better results than one that writes blind.

### The Walkthrough Ladder

When you need to understand code the agent wrote, escalate progressively:
1. **Ask for an explanation** — usually sufficient for simple logic.
2. **Commission a linear walkthrough** — structured, file-by-file, with actual code excerpts extracted by the agent (not copy-pasted, to avoid hallucination).
3. **Commission an interactive explanation** — for complex algorithms or flows where static text does not build intuition.

Most understanding needs stop at step 1 or 2. Step 3 is for critical-path logic you will need to reason about repeatedly.
