---
name: git-workflow
description: "Activated when git operations are needed, when the commit step of the pipeline is active, when creating branches or pull requests, or when the user asks about version control, git, or how to save and share code changes."
origin: MDH
---

# Git Workflow

## What Version Control Is

Imagine "Track Changes" in a word processor, but for your entire project, running forever.

Every change you make is recorded: what changed, who changed it, when, and a note explaining why. You can go back to any previous version at any time. You can try an experimental idea without risking the working version -- if the experiment fails, you revert to where you were. If it succeeds, you merge it in.

Without version control, you're working on a tightrope without a net. One bad change can destroy working code with no way back. With version control, every save point is preserved. You can always get back to solid ground.

Git is the version control system used by virtually every professional software team. You don't need to memorize git commands -- Claude handles the mechanics. But understanding what's happening and why gives you the vocabulary to direct the process and make informed decisions.

---

## The Core Concepts

Six ideas form the foundation of everything git does:

### Repository ("Repo")

Your project folder, tracked by git. Every file, every change, every version -- all stored inside the repository. When you hear "repo," think "project folder with a perfect memory."

### Commit

A snapshot of your project at a specific moment, packaged with a note describing what changed and why. Think of it like saving a game. Each save has a timestamp, a description ("defeated the dragon, unlocked the gate"), and a complete record of the game state. You can load any save and pick up from exactly that point.

Commits are permanent records. Once created, they become part of the project's history. This is why commit messages matter -- they're the breadcrumbs that help you (and anyone else) understand why the project looks the way it does.

### Staging

The step between making changes and committing them. Not every change you've made needs to go into the next commit. Staging lets you select which changes to include.

Think of it as packing a box for shipping. You've pulled several items off the shelf (your changes), but this particular shipment (commit) should only include three of them. You place those three in the box (staging area). The rest stay on the shelf for a different shipment.

This matters because good commits are focused. A commit that says "add user login" should contain only login-related changes, not a mix of login code, a CSS tweak, and a database fix. Staging gives you that control.

### Branch

A parallel version of your project. The main branch is the stable, working version. When you want to add a feature or fix a bug, you create a new branch -- a copy that diverges from main. You work on your branch freely, making changes, breaking things, fixing them, without affecting main at all.

Think of it as a drafting table. The published version of a blueprint is locked in the filing cabinet (main branch). You pull out a copy to your drafting table (your branch) and sketch modifications. The published version stays clean while you experiment. When your modifications are proven and reviewed, they get incorporated into the published version.

### Merge

Combining changes from one branch into another. When your feature branch is complete and reviewed, it gets merged into main. Git is smart about this -- it can usually combine changes automatically, even when different people edited different parts of the same files.

Occasionally, two branches change the same lines of code in conflicting ways. Git can't guess which version to keep, so it asks for help. This is called a "merge conflict" and it's normal, not a crisis. You review both versions, decide what the final result should be, and tell git to proceed.

### Pull Request ("PR")

A formal proposal to merge one branch into another. Instead of merging directly, you open a pull request that says: "Here are the changes I made on my branch. Please review them before merging into main."

A pull request shows exactly what changed (the "diff"), provides space for discussion and review, and creates a permanent record of why changes were made and who approved them. It's the code review stage of version control.

---

## Writing Good Commit Messages

A commit message is the note attached to your snapshot. Six months from now, when you or someone else is trying to understand why a change was made, this message is all they have. Good messages save hours of detective work. Bad messages waste them.

**The format:**

```
type: description
```

**Types tell you the category of change at a glance:**

| Type | Meaning | Example |
|------|---------|---------|
| `feat` | New functionality added | `feat: add password reset email` |
| `fix` | Bug corrected | `fix: prevent crash when form is empty` |
| `refactor` | Code restructured, behavior unchanged | `refactor: split user module into auth and profile` |
| `docs` | Documentation updated | `docs: add setup instructions for new developers` |
| `test` | Tests added or modified | `test: add coverage for payment edge cases` |
| `chore` | Maintenance, dependencies, config | `chore: update database library to v3.2` |
| `perf` | Performance improvement | `perf: cache user lookup to reduce database calls` |
| `ci` | Build/deployment pipeline changes | `ci: add automated test step before deploy` |

**The description explains WHAT changed and WHY, not HOW:**

- **Good:** `fix: prevent crash when user submits empty form` -- Tells you the problem (crash on empty form) and that it's fixed. Anyone reading the log understands the intent.
- **Bad:** `updated stuff` -- Tells you nothing. When you find this in the log six months later while debugging, it provides zero help.
- **Bad:** `changed line 47 in validator.js to add null check` -- Too focused on HOW. The "how" is visible in the code diff. The message should explain the purpose.

The optional body (the lines after the first line) can provide additional context: what the original problem was, what approach was chosen and why, what alternatives were considered.

---

## The Branching Workflow

Professional teams follow a consistent pattern for managing branches:

1. **Main (or master) is always stable.** This branch represents the production-ready version. Code on main has been reviewed, tested, and approved. You never commit directly to main.

2. **Create a branch for each feature or fix.** Starting from main, create a branch with a descriptive name: `feature/user-login`, `fix/empty-form-crash`, `refactor/split-user-module`. The name tells everyone what this branch is for.

3. **Work on your branch without affecting main.** Make as many commits as you need. Break things. Fix them. Experiment. Main stays untouched. Other people working on other branches aren't affected either.

4. **When your work is complete, open a pull request.** This is your proposal to merge your branch into main. The PR triggers the review process.

5. **After review and approval, merge into main.** Your changes become part of the stable codebase. Your branch has served its purpose and can be deleted.

This workflow means main is always deployable, experiments are isolated, and all changes go through review. It scales from solo projects to teams of hundreds.

---

## Pull Requests

A pull request is where the pipeline's review and collaboration steps come together. It's the bridge between "code written on a branch" and "code merged into main."

**What makes a good PR:**

- **Clear title** -- Short, descriptive, under 70 characters. Like a commit message, it tells you what this PR accomplishes: "Add password reset flow" not "Various changes."

- **Summary** -- A few bullet points explaining what changed and why. Not a line-by-line recounting of code changes (the diff shows that), but the high-level story: what problem this solves, what approach was taken, what the user-facing impact is.

- **Test plan** -- How were these changes verified? What tests were added or run? This gives reviewers confidence that the changes work and won't break existing functionality.

**What happens during PR review:**

- The diff shows exactly what lines were added, removed, or modified across all files.
- Reviewers (human or agent) read the changes and leave comments on specific lines or on the PR as a whole.
- If changes are requested, you update your branch with additional commits. The PR updates automatically.
- Once approved, the branch is merged into main.

**An important practice:** When reviewing a PR, look at the full commit history -- all the commits on the branch since it diverged from main, not just the latest commit. A PR might have ten commits, and reviewing only the last one misses the context of the other nine.

---

## Common Git Operations

You don't need to memorize these. Claude handles the actual commands. This section is so you understand what's happening when git operations are mentioned, and so you can ask for the right thing.

| What you want | What it's called | What happens |
|---|---|---|
| See what's changed since last commit | **Status** | Lists files that have been modified, added, or deleted. Shows what's staged and what's not. |
| Select changes for the next commit | **Stage** (or "add") | Moves specific changes into the staging area, ready to be included in the next commit. |
| Save a snapshot with a message | **Commit** | Takes everything in the staging area, bundles it with your message, and records it as a permanent entry in the project history. |
| Start working on something new | **Branch** (create) | Creates a new branch from the current point. Your work happens here without affecting main. |
| Switch to a different branch | **Checkout** (or "switch") | Moves you to a different branch. Your files change to match that branch's state. |
| Upload your branch to GitHub | **Push** | Sends your local commits to the remote repository (GitHub) so others can see them and so they're backed up. |
| Propose merging your branch | **Pull request** (create) | Opens a PR on GitHub, showing your changes and starting the review process. |
| Get latest changes from the team | **Pull** | Downloads commits that others have pushed and integrates them into your local branch. |
| Combine one branch into another | **Merge** | Takes the commits from one branch and applies them to another. Usually done through a PR after review. |

The commit step in the pipeline (Step 7) handles staging, committing, and pushing. The git-guide agent assists with branching, PRs, and any git situation that needs explanation. You direct what should happen; the tools handle how.
