# Component: dev-pipeline
## Type: skill
## Status: pending
## Dependencies: None (foundational skill — all other skills reference this)
## Session Target: 1

## What This Is
The core methodology skill. Contains the full seven-step development pipeline (Research, Plan, Implement, Review, Secure, Verify, Commit) rewritten as a teaching document for non-developers. This skill is always loaded as reference and serves as both the curriculum backbone and the operational methodology that agents follow.

## Skill Frontmatter
```yaml
name: dev-pipeline
description: "Activated when discussing the development process, pipeline steps, or when a user asks about how software gets built. Always available as reference."
origin: MDH
```

## Content Specification

### Section 1: The Big Picture
Explain what a development pipeline IS using a non-developer analogy (e.g., building a house: you don't start hammering before you have blueprints). Establish that professional software is built in steps, not in a single burst. Cover why order matters.

### Section 2: The Seven Steps
Each step gets its own subsection with:
- **What it is** (one sentence, no jargon)
- **Why it matters** (consequence of skipping it)
- **What happens during it** (concrete actions)
- **Who does what** (at this stage, Claude does X, you do Y — varies by phase)
- **How you'll know it's done** (exit criteria in plain language)

Steps:
1. **Research** — Find what already exists before building anything new
2. **Plan** — Break the work into pieces, identify risks, get agreement before coding
3. **Implement** — Build it test-first (TDD: write the test, then the code)
4. **Review** — Check the code for quality issues with fresh eyes
5. **Secure** — Check for security vulnerabilities (secrets, input handling, auth)
6. **Verify** — Run all automated checks (build, types, lint, tests, security scan)
7. **Commit** — Record the change in version control with a clear message

### Section 3: When to Use the Full Pipeline vs. Shortcuts
Teach when the full pipeline is needed (multi-file features, new functionality) vs. when shortcuts are acceptable (single-line fixes, documentation updates). Reference Phase-based enforcement from methodology-enforcement rule.

### Section 4: The Pipeline as a Learning Path
Map each step to a competence dimension. Explain that mastering each step is how the user progresses from observer to independent developer. Reference the phase progression (Observer -> Co-Pilot -> Navigator -> Driver -> Graduate).

### Section 5: Model Routing (Why Different Steps Use Different AI)
Teach at a conceptual level why planning uses the most powerful model (Opus), implementation uses the best coding model (Sonnet), and documentation uses the cheapest (Haiku). Frame as "matching the tool to the job."

## ECC Source Material
- ECC manual section 3: "The Creator's Workflow (Reverse-Engineered)" — the seven-step pipeline diagram and descriptions
- ECC manual section 6: "The Agent Team" — model routing table and tier definitions
- ECC rules/common/development-workflow.md — the Feature Implementation Workflow
- ECC manual section 3: "The Four Pre-Built Pipelines" — orchestrate command workflows
- ECC manual section 3: "Where the Models Route" — cost/capability mapping

## Implementation Notes
[Empty — filled during implementation]
