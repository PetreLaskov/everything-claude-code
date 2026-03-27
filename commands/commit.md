---
description: Commit changes and optionally create a pull request. Guided git workflow with teaching adapted to your level.
---

# Commit

Run the git commit step as a standalone operation outside the full `/build` pipeline.

## Prerequisites

Read `state/learner-profile.json`.

- If no profile exists, redirect to `/start`. Do not proceed.
- Extract `competence_dimensions.git_workflow.level` as `git_level`.
- Extract `preferences.verbosity` as `verbosity`.
- Compute `annotation_depth = max(0, verbosity - (git_level - 1))`.

## Step 0: Changes Check

Run `git status` to detect uncommitted changes.

- If there are no changes (nothing staged, nothing modified, nothing untracked):
  - Inform the user: "There are no changes to commit."
  - Suggest running `/implement` or `/build` first.
  - Stop. Do not proceed.

## Step 1: Review Changes

Invoke the **git-guide** agent (Sonnet).

Show `git diff --stat` to summarize what changed.

- At annotation_depth 4-5: explain what each changed file represents and what the diff summary means.
- At annotation_depth 2-3: present the summary with brief context on notable changes.
- At annotation_depth 0-1: present the summary without commentary.

## Step 2: Staging

Stage changes using specific file paths. Never use `git add -A` unless the user explicitly intends to stage everything.

- At annotation_depth 4-5: explain what staging is. Weave in the teaching: "Staging is like putting items in a shopping cart before checkout. We are choosing which changes to include in this commit."
- At annotation_depth 2-3: briefly note which files are being staged and why.
- At annotation_depth 0-1: stage and proceed.

## Step 3: Commit Message Composition

Check if the user provided a message via `$ARGUMENTS`. If so, use it as the commit message and skip to Step 4. If the provided message follows conventional commits format unprompted, record a positive signal: +0.15 for `git_workflow`.

If no message was provided:

- At git_level 0-1 (Directive): compose the commit message. Explain its structure -- the conventional commits format `<type>: <description>`, what types mean (feat, fix, refactor, docs, test, chore, perf, ci). Show the user the message before committing.
- At git_level 2-3 (Socratic): ask the user to write the commit message. Evaluate what they write. Offer specific improvements if needed. If the format is correct, acknowledge it.
- At git_level 4+: let the user write the message. Accept it without commentary unless it has a clear problem.

All commit messages must follow conventional commits format: `<type>: <description>`.

## Step 4: Commit

Execute `git commit` with the composed message.

- At annotation_depth 4-5: explain what a commit is. Weave in: "A commit is a snapshot of your code at this moment. Like saving a version of a document."
- At annotation_depth 2-3: confirm the commit with a brief note.
- At annotation_depth 0-1: execute silently, report success.

## Step 5: Push/PR (Optional)

Ask if the user wants to push to remote or create a pull request.

If yes:
- Check if on `main` or `master`. If so, create a feature branch first. If the user suggests the branch name unprompted, record a positive signal: +0.10 for `git_workflow`.
- Push with the `-u` flag.
- If creating a PR, use `gh pr create`.
- At annotation_depth 4-5: explain branching, remotes, and pull requests thoroughly.
- At annotation_depth 2-3: explain the branching strategy and PR process.
- At annotation_depth 0-1: execute on instruction.

If no: skip. The commit is complete.

## Signal Detection

Monitor throughout the workflow for positive signals:

| Signal | Dimension | Weight |
|--------|-----------|--------|
| User writes a conventional commit message unprompted | git_workflow | +0.15 |
| User suggests creating a feature branch | git_workflow | +0.10 |
| User asks about branching strategy | git_workflow | +0.10 |

## Session State

Record `"commit"` in `session_history.pipeline_steps_executed`.

## Phase-Specific Behavior

| Phase | Behavior |
|-------|----------|
| 0 (Discovery) | Unlikely but allowed. If a git repo exists, full annotation. Explain every git concept. |
| 1 (Observer) | Full annotation. Claude composes the commit message and explains every git concept. User watches. |
| 2 (Co-Pilot) | Medium annotation. Claude asks user to write the commit message (Socratic). Explains branching and PRs. |
| 3 (Navigator) | Low annotation. User writes commit message. Claude stages and commits. Annotates only first encounters (e.g., first PR creation). |
| 4 (Driver) | Minimal. Executes git commands on instruction. No annotation unless asked. |
| 5 (Graduate) | Silent execution. |
