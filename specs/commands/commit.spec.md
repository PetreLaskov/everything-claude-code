# Component: commit
## Type: command
## Status: pending
## Dependencies: git-guide agent, scripts/lib/learner-profile.js
## Session Target: 5

## What This Is
The `/commit` command runs the git commit/PR step as a standalone operation outside the full `/build` pipeline. It invokes the `git-guide` agent to teach and execute git staging, commit message composition, branching, and pull request creation, with annotation depth adapted to the user's git_workflow dimension level.

## Command Frontmatter
```yaml
---
description: Commit changes and optionally create a pull request. Guided git workflow with teaching adapted to your level.
---
```

## Behavior Specification

1. **Profile check.** Read `state/learner-profile.json`. If no profile exists, redirect to `/start`.

2. **Changes check.** Run `git status` to detect changes. If no changes exist:
   - Inform: "There are no changes to commit."
   - Suggest running `/implement` or `/build` first.
   - Do not proceed.

3. **Invoke git-guide agent.** The `git-guide` agent (Sonnet) handles the git workflow:

   **Step 1: Review changes**
   - Show `git diff --stat` summary
   - At low levels: explain what each changed file means
   - At high levels: present summary

   **Step 2: Staging**
   - Stage changes appropriately (specific files, not `git add -A` unless intentional)
   - At low levels: explain what staging is ("Staging is like putting items in a shopping cart before checkout. We are choosing which changes to include in this commit.")
   - At high levels: stage and proceed

   **Step 3: Commit message composition**
   - At Level 0-1 (Directive): compose the commit message and explain its structure (type: description format, conventional commits)
   - At Level 2+ (Socratic): ask the user to write the commit message. Evaluate it. Offer improvements if needed.
   - At Level 4+: let the user write the message, accept it.
   - Follow conventional commits format: `<type>: <description>`

   **Step 4: Commit**
   - Execute `git commit` with the composed message
   - At low levels: explain what a commit IS ("A commit is a snapshot of your code at this moment. Like saving a version of a document.")
   - At high levels: execute silently

   **Step 5: Push/PR (optional)**
   - Ask if the user wants to push to remote or create a PR
   - If yes: handle branching (create feature branch if on main), push with `-u`, create PR via `gh`
   - At low levels: explain branching, remotes, and PRs
   - At high levels: execute on instruction

4. **Teaching annotations.** The git-guide reads the learner profile:
   - `annotation_depth = max(0, verbosity - (git_workflow_level - 1))`
   - At depth 4-5: explains what git is, what commits are, what staging means, what branches are, what PRs are
   - At depth 2-3: explains the commit message format, branching strategy
   - At depth 0-1: executes git commands with minimal annotation

5. **Signal detection.** Monitor for positive signals:
   - User writes a conventional commit message unprompted (+0.15 for git_workflow)
   - User suggests creating a feature branch (+0.10 for git_workflow)
   - User asks about branching strategy (+0.10 for git_workflow)

6. **Session state.** Record `"commit"` in `pipeline_steps_executed`.

## Arguments
| Argument | Required | Description |
|---|---|---|
| `<message>` | No | Commit message. If provided, skip the message composition step (but still stage and review changes). |

## Phase-Specific Behavior

| Phase | Behavior |
|---|---|
| 0 (Discovery) | Unlikely but allowed. If the user has initialized a git repo during discovery, they can commit. Full annotation. |
| 1 (Observer) | Full annotation. Claude composes the commit message and explains every git concept. User watches. |
| 2 (Co-Pilot) | Medium annotation. Claude asks user to write the commit message (Socratic). Explains branching and PRs. |
| 3 (Navigator) | Low annotation. User writes commit message. Claude stages and commits. Annotates only new git concepts (e.g., first time creating a PR). |
| 4 (Driver) | Minimal. Executes git commands on instruction. No annotation. |
| 5 (Graduate) | Silent execution. |

## Implementation Notes
_Empty -- filled during implementation._

## Test Requirements
1. **Profile prerequisite test.** No profile redirects to `/start`.
2. **No changes test.** Running `/commit` with no git changes informs the user and does not proceed.
3. **Staging test.** Changes are staged with specific file paths, not blanket `git add -A` (unless all changes are intentional).
4. **Commit message format test.** Commit messages follow conventional commits format: `<type>: <description>`.
5. **Socratic commit message test.** At git_workflow level 2+, the agent asks the user to compose the commit message.
6. **Unprompted message signal test.** When the user provides a correctly formatted commit message as an argument, a positive signal is recorded for git_workflow.
7. **PR creation test.** When the user opts to create a PR, a feature branch is created (if on main), changes are pushed, and a PR is created via `gh`.
8. **Session history test.** After commit, `"commit"` appears in `pipeline_steps_executed`.
