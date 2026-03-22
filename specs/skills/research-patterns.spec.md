# Component: research-patterns
## Type: skill
## Status: pending
## Dependencies: dev-pipeline (references as step 0 of the pipeline)
## Session Target: 1

## What This Is
Teaches the research-first methodology: how and why to search for existing solutions before writing new code. Covers GitHub search, library documentation lookup, package registry checks, and web research. This is the skill that prevents the most common non-developer mistake — building something that already exists.

## Skill Frontmatter
```yaml
name: research-patterns
description: "Activated when the research step of the pipeline is active, when a user is about to start building something new, or when discussing whether to build vs. reuse existing solutions."
origin: MDH
```

## Content Specification

### Section 1: Why Research Comes First
Explain the principle: "The best code is code you don't have to write." Frame for non-developers using analogies — you would not build furniture without checking if IKEA sells what you need. Professional developers spend significant time searching before coding. Cover the cost of reinventing the wheel (bugs, maintenance, time).

### Section 2: The Research Hierarchy
Present the four-step research order with rationale for each priority level:
1. **GitHub code search** — search for existing implementations, templates, patterns (`gh search repos`, `gh search code`)
2. **Library documentation** — confirm API behavior, package usage, version-specific details (Context7 MCP or vendor docs)
3. **Package registries** — search npm, PyPI, crates.io before writing utility code (prefer battle-tested libraries)
4. **Web search** — broader discovery only when the first three are insufficient

### Section 3: What to Search For
Teach the non-developer what "searching for existing implementations" actually means in practice:
- Searching for a library that does what you need (e.g., "email validation npm")
- Searching for skeleton projects / templates that solve 80%+ of the problem
- Searching for patterns and approaches others have used
- Evaluating what you find (stars, maintenance activity, documentation quality, license)

### Section 4: The Build vs. Reuse Decision
Teach the decision framework: when to use an existing library, when to fork and modify, when to build from scratch. Cover the principle: "Prefer adopting or porting a proven approach over writing net-new code when it meets the requirement."

### Section 5: Research in Practice
Concrete examples of research for common project types (web app, CLI tool, automation). Show what good research output looks like — a brief summary of what was found, what will be reused, what needs to be built custom.

## ECC Source Material
- ECC rules/common/development-workflow.md — step 0 "Research & Reuse" with the four-step hierarchy
- ECC manual section 3: pipeline step 0 (RESEARCH) — "What already exists?"
- ECC manual section 5: "I want to... Research before building" — search-first skill activation
- ECC rules/common/patterns.md — "Skeleton Projects" section (search for battle-tested skeleton projects, evaluate with parallel agents)

## Implementation Notes
[Empty — filled during implementation]
