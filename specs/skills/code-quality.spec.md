# Component: code-quality
## Type: skill
## Status: pending
## Dependencies: dev-pipeline (references implementation and review steps)
## Session Target: 1

## What This Is
Teaches coding standards and quality patterns for non-developers. Covers immutability, file organization, error handling, input validation, naming conventions, and the code quality checklist. This skill helps users understand what "good code" looks like and why it matters, so they can evaluate code review findings and eventually make quality judgments independently.

## Skill Frontmatter
```yaml
name: code-quality
description: "Activated when writing or reviewing code, when discussing coding standards, when the code review step finds quality issues, or when the user asks about what makes code good or bad."
origin: MDH
```

## Content Specification

### Section 1: What Makes Code "Good"
Explain for non-developers that good code is not just code that works — it is code that is easy to understand, easy to change, and hard to break. Use the analogy: working code is like a house that stands up; good code is like a house that stands up AND has clear room labels, accessible wiring, and doors that open the right way.

### Section 2: Immutability (The Most Important Pattern)
Teach the concept at a non-developer level: instead of changing an existing thing, create a new thing with the changes applied. Use analogy: editing a shared Google Doc vs. making a copy with your changes. Cover why mutation causes bugs (hidden side effects, hard to debug, unsafe in concurrent environments). Present the rule: "ALWAYS create new objects, NEVER mutate existing ones."

### Section 3: File Organization
Teach the principle "many small files over few large files":
- Each file should do ONE thing (high cohesion)
- Files should not depend heavily on each other (low coupling)
- Typical file length: 200-400 lines, never more than 800
- Organize by feature/domain, not by type (e.g., "user/" not "controllers/")
- Functions should be small (under 50 lines)

### Section 4: Error Handling
Teach why errors must be handled explicitly:
- Never silently swallow errors (the worst kind of bug is the invisible one)
- User-facing errors should be helpful ("Your email format is invalid" not "Error 422")
- Server-side errors should include full context for debugging
- Fail fast: if something is wrong, stop early rather than continuing with bad data

### Section 5: Input Validation
Teach the "trust no one" principle:
- All user input must be validated before processing
- All external data (API responses, file contents) must be checked
- Use schema-based validation when available
- Fail with clear error messages when validation fails

### Section 6: The Code Review Checklist
Present the quality checklist as a practical tool the user will encounter during code review:
- Code is readable and well-named
- Functions are small (under 50 lines)
- Files are focused (under 800 lines)
- No deep nesting (more than 4 levels)
- Proper error handling at every level
- No hardcoded values (use constants or config)
- No mutation (immutable patterns used)

### Section 7: Reading a Code Review
Teach how to interpret code review findings:
- Severity levels: CRITICAL (must fix), HIGH (should fix), MEDIUM (consider fixing), LOW (optional)
- How to decide what to fix now vs. defer
- The reviewer never wrote the code — this is intentional (fresh eyes catch more)

## ECC Source Material
- ECC rules/common/coding-style.md — immutability rules, file organization, error handling, input validation, code quality checklist
- ECC manual section 3: pipeline step 3 (REVIEW) — code review severity levels, separate context principle
- ECC manual section 12: code-reviewer agent — quality and security review specification
- ECC rules/common/patterns.md — design patterns (Repository Pattern, API Response Format)
- ECC manual section 14: "Quality Thresholds" — function length, file length, nesting depth standards

## Implementation Notes
[Empty — filled during implementation]
