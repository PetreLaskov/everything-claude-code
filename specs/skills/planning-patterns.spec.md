# Component: planning-patterns
## Type: skill
## Status: pending
## Dependencies: dev-pipeline (references as step 1 of the pipeline)
## Session Target: 1

## What This Is
Teaches how to break down features into implementable plans. Covers requirements analysis, phase breakdown, dependency identification, risk assessment, and the critical behavior of waiting for user approval before proceeding. This transforms the non-developer from someone who says "build me X" to someone who can evaluate and steer a plan.

## Skill Frontmatter
```yaml
name: planning-patterns
description: "Activated when the planning step of the pipeline is active, when a user describes a feature to build, or when discussing how to break down complex work into manageable pieces."
origin: MDH
```

## Content Specification

### Section 1: Why Planning Matters
Explain for non-developers: coding without a plan is like driving without a map — you might arrive, but you will waste time and gas. Cover what happens when you skip planning (scope creep, rework, missed requirements). Establish the principle: "Plan stops and WAITS for your explicit approval before any code is written."

### Section 2: What a Good Plan Contains
Teach the anatomy of an implementation plan:
- **Goal statement** — one sentence describing what we are building and why
- **Phases** — ordered chunks of work, each producing something testable
- **Dependencies** — what must be done before what (and why order matters)
- **Risks and blockers** — what could go wrong and how we handle it
- **Exit criteria** — how we know each phase is done

### Section 3: Breaking Down Work
Teach the decomposition skill — how to turn "build a dashboard" into a sequence of phases:
- Start with the MVP (minimum viable product) — the smallest version that works
- Each phase should be independently testable and demonstrable
- Later phases extend earlier ones (additive, not rewriting)
- Identify what the user will control vs. what Claude handles (varies by learner phase)

### Section 4: Reading and Evaluating a Plan
Teach the user how to critically evaluate the plan Claude produces:
- Does each phase make sense as a standalone deliverable?
- Are the dependencies logical?
- Is anything missing that you expected?
- Is the scope too big or too small?
- What questions should you ask before approving?

### Section 5: Planning at Different Scales
- **Simple feature** (single file, under 50 lines): skip formal planning, go straight to implementation
- **Medium feature** (multiple files, one session): standard plan with phases
- **Large feature** (multi-session): blueprint approach — each phase has a self-contained brief
- **Epic scope** (multi-PR, multi-session): phased rollout plan with milestone definitions

## ECC Source Material
- ECC manual section 4: "/plan — Think Before Coding" — planner agent behavior, mandatory gate, example usage
- ECC rules/common/development-workflow.md — step 1 "Plan First" (use planner agent, generate planning docs, identify dependencies and risks, break down into phases)
- ECC agents/planner.md — planner agent specification (Opus, read-only tools, stops and waits)
- ECC manual section 3: pipeline step 1 (PLAN) — "What are we building and how?"
- ECC rules/common/agents.md — planner agent usage ("Complex feature requests - Use planner agent")

## Implementation Notes
[Empty — filled during implementation]
