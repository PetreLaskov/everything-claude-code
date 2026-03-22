# Component: git-workflow
## Type: skill
## Status: pending
## Dependencies: dev-pipeline (references step 6 of the pipeline)
## Session Target: 1

## What This Is
Teaches git, commits, branches, and pull requests for non-developers. Covers what version control IS, why it matters, how to write good commit messages, and the branching/PR workflow. This skill transforms git from an intimidating command-line tool into a comprehensible system for tracking and sharing changes.

## Skill Frontmatter
```yaml
name: git-workflow
description: "Activated when git operations are needed, when the commit step of the pipeline is active, when creating branches or pull requests, or when the user asks about version control, git, or how to save and share code changes."
origin: MDH
```

## Content Specification

### Section 1: What Version Control Is
Explain for non-developers using a relatable analogy: git is like "Track Changes" in a word processor, but for your entire project. It records every change, who made it, when, and why. You can go back to any previous version. You can try experiments without risking your working code.

### Section 2: The Core Concepts
Teach the vocabulary in plain language:
- **Repository (repo)** — your project folder, tracked by git
- **Commit** — a snapshot of your project at a specific moment (like hitting "Save" with a note about what you changed)
- **Staging** — choosing which changes go into the next commit (not everything you changed has to go in)
- **Branch** — a parallel version of your project for trying something without affecting the main version
- **Merge** — combining changes from one branch into another
- **Pull Request (PR)** — asking someone to review your changes before merging them into the main branch

### Section 3: Writing Good Commit Messages
Teach the conventional commit format and WHY it matters:
- Format: `type: description` (e.g., `feat: add email validation`, `fix: handle empty input`)
- Types: feat (new feature), fix (bug fix), refactor (restructuring), docs (documentation), test (tests), chore (maintenance)
- The message should explain WHAT changed and WHY, not HOW (the code shows how)
- Good: `fix: prevent crash when user submits empty form`
- Bad: `updated stuff` or `fixed bug`

### Section 4: The Branching Workflow
Teach why branches exist and how they are used:
- The main/master branch is the "stable" version
- Create a branch for each feature or fix
- Work on the branch without affecting main
- When done, create a pull request to merge back
- The PR is where review happens before changes go live

### Section 5: Pull Requests
Teach what a PR is and why it matters:
- A PR is a proposal to merge your changes into the main branch
- It shows exactly what changed (the diff)
- It is where code review happens
- A good PR has: a clear title, a summary of changes, a test plan
- The PR should analyze the full commit history, not just the latest commit

### Section 6: Common Git Operations
A quick reference of what happens and when (the user does not need to memorize commands — Claude handles execution):
- Checking what changed (git status, git diff)
- Staging and committing changes
- Creating and switching branches
- Pushing to remote (sharing your changes)
- Creating a pull request

## ECC Source Material
- ECC rules/common/git-workflow.md — commit message format, conventional commit types, PR workflow steps
- ECC manual section 3: pipeline step 6 (COMMIT) — conventional commit format, detailed messages, PR with full history analysis
- ECC manual section 8: "Session Continuity: Never Lose Your Work" — session save/resume (related to git as persistence mechanism)
- ECC manual section 4: "/save-session and /resume-session" — continuity chain (parallels to git's role in preserving work)

## Implementation Notes
[Empty — filled during implementation]
