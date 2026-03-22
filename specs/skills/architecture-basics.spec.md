# Component: architecture-basics
## Type: skill
## Status: pending
## Dependencies: dev-pipeline (architecture decisions arise during planning), code-quality (file organization is architectural)
## Session Target: 1

## What This Is
Teaches system design fundamentals for non-developers. Covers what architecture IS, separation of concerns, file structure, the repository pattern, API design basics, and how to think about building systems that can grow. This skill helps users understand the structural decisions Claude makes during planning and eventually participate in those decisions.

## Skill Frontmatter
```yaml
name: architecture-basics
description: "Activated when architectural decisions arise during planning, when discussing system structure, when choosing how to organize code, or when the user asks about system design, file structure, or how the pieces of an application fit together."
origin: MDH
```

## Content Specification

### Section 1: What Architecture Is
Explain for non-developers: architecture is the blueprint of your software — how the pieces are organized, how they talk to each other, and how the system can grow without falling apart. Use the house analogy: plumbing goes in the walls, not through the living room; the kitchen is near the dining room, not in the attic. Good architecture means things are where you expect them.

### Section 2: Separation of Concerns
Teach the most fundamental architectural principle:
- Each piece of code should have ONE job
- Data access code should be separate from business logic
- Business logic should be separate from user interface
- Why: when things are separated, you can change one part without breaking others
- Example: if your database code is separate from your display code, you can switch databases without rewriting your UI

### Section 3: File and Directory Structure
Teach how to organize a project:
- Group by feature/domain, not by type (e.g., `users/` contains the user model, user routes, user tests — not `models/` with all models from every feature)
- Common patterns: src/ for source code, tests/ for test code, config/ for configuration
- Each directory should have a clear purpose
- How to read a directory tree and understand what a project does from its structure alone

### Section 4: The Repository Pattern
Teach the most practical architectural pattern for beginners:
- Define a consistent interface for data access (findAll, findById, create, update, delete)
- The actual storage details (database, API, file) are hidden behind this interface
- Why: you can swap storage mechanisms without changing business logic
- Testing becomes easy because you can use a fake (mock) data source

### Section 5: API Design Basics
Teach what an API is (a contract between pieces of software) and basic design principles:
- Consistent response format (envelope pattern: success, data, error, metadata)
- Clear naming (the URL describes the resource, the method describes the action)
- Error handling (meaningful error codes and messages)
- Versioning (why and when you need it)

### Section 6: Making Decisions About Architecture
Teach the user how to participate in architectural decisions:
- What questions to ask when Claude proposes a structure
- Trade-offs: simplicity vs. flexibility, speed vs. maintainability
- The principle: start simple, add complexity only when needed ("you aren't gonna need it")
- When architecture matters most (early decisions have outsized impact)

## ECC Source Material
- ECC rules/common/patterns.md — Repository Pattern, API Response Format, Skeleton Projects
- ECC rules/common/coding-style.md — file organization principles (many small files, organize by feature/domain)
- ECC manual section 12: architect agent — system design, scalability analysis, trade-off evaluation, ADRs
- ECC manual section 6: "Tier 1: Strategists (Opus)" — architect agent description
- ECC manual section 14: "Quality Thresholds" — file length standards (200-400 lines typical, 800 max)

## Implementation Notes
[Empty — filled during implementation]
