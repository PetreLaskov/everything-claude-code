# Component: project-archetypes
## Type: skill
## Status: pending
## Dependencies: dev-pipeline (projects exercise the pipeline), architecture-basics (each archetype has architectural patterns)
## Session Target: 1

## What This Is
Contains the project template library with descriptions, learning value, difficulty ratings, and milestone definitions for each project type. This skill activates during /discover and project scoping, helping the project-advisor agent match user interests to appropriate project types. It also serves as a reference for what each project route teaches.

## Skill Frontmatter
```yaml
name: project-archetypes
description: "Activated during project discovery (/discover), when helping a user choose what to build, when discussing project scope and milestones, or when the user asks about what kinds of projects they could build."
origin: MDH
```

## Content Specification

### Section 1: Project Routes Overview
Present the six project routes with plain-language descriptions of what each produces:

| Route | What You Build | What You Learn |
|-------|---------------|----------------|
| Web App | A web application people use in their browser | Full-stack development: frontend, backend, database, deployment |
| Automation | A script or tool that automates a repetitive task | Scripting, APIs, scheduling, error handling |
| API/Integration | A service that connects systems or responds to events | API design, authentication, webhooks |
| Data Tool | A tool that processes, analyzes, or visualizes data | Data processing, file I/O, visualization |
| CLI Tool | A command-line utility for productivity | Terminal interaction, argument parsing, file system operations |
| Mobile/Desktop | An app that runs on phones or desktops | Cross-platform development, state management, packaging |

### Section 2: Route Details
For each route, provide:
- **Example projects** (3-4 concrete ideas with vivid descriptions)
- **Difficulty level** (1-5 scale with explanation of what each level means)
- **Estimated sessions** (range for MVP completion)
- **Tech stack recommendations** (with brief rationale for each choice)
- **Competence dimensions developed** (which pipeline steps this route exercises most)
- **Milestones** (5-stage progression: Hello World, First Feature, Data Layer, Polish, Ship)
- **Key learning moments** (concepts the user will encounter during this project)

### Section 3: Choosing Your Project
Teach the decision framework for picking a project:
- "Which of these would you use TOMORROW if it existed?" (urgency filter)
- Finishing a project teaches more than starting three (scope control)
- Too ambitious? Decompose into milestones, each a shippable product
- Too trivial? Make it production-grade (proper error handling, tests, deployment)
- No idea? Default recommendation: personal CLI productivity tool (smallest surface area, fastest to a working result)

### Section 4: Difficulty Scaling
Explain how the same project type can be scaled up or down:
- Level 1: Minimal features, one data source, no auth
- Level 2: Multiple features, simple database, basic auth
- Level 3: Complex features, API integrations, full auth
- Level 4: Multiple services, real-time features, advanced patterns
- Level 5: Production-scale architecture, monitoring, CI/CD

### Section 5: Milestone Structure
Teach what milestones are and why they matter:
- Each milestone is a checkpoint where the project works (even if incomplete)
- Milestones prevent the "90% done, 90% to go" problem
- The five standard milestones and what "done" looks like for each:
  1. Hello World — project scaffolded and running locally
  2. First Feature — one real capability working end-to-end
  3. Data Layer — data persists between sessions (database or file)
  4. Polish — error handling, tests, styling, edge cases
  5. Ship — deployed and accessible to others

## ECC Source Material
- Plan section 3.1: "The Discovery Flow" — route matching table, recommendation rationale, project scoping
- Plan section 3.2: "Handling Edge Cases" — no idea, too many ideas, too ambitious, too trivial
- Plan section 3.3: "Project Template Data" — template structure with id, route, difficulty, estimated_sessions, tech_stack, dimensions_developed, milestones, learning_moments
- Plan section 4.1: "Phase Definitions" — Phase 0 Discovery description
- ECC manual section 5: "Building Things" — project type decision tree

## Implementation Notes
[Empty — filled during implementation]
