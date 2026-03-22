# Component: build
## Type: command
## Status: pending
## Dependencies: dev-planner agent, dev-builder agent, dev-reviewer agent, dev-security agent, dev-verifier agent, git-guide agent, scripts/lib/learner-profile.js, scripts/lib/competence-engine.js
## Session Target: 5

## What This Is
The `/build` command is the primary workflow command. It runs the full guided development pipeline: plan -> implement -> review -> verify -> commit. Each step invokes the appropriate teaching agent, with annotation depth adapted to the user's competence levels. This is the command users will use most frequently.

## Command Frontmatter
```yaml
---
description: Full guided development pipeline. Plans, implements with TDD, reviews, verifies, and commits -- with teaching adapted to your level.
---
```

## Behavior Specification

1. **Profile and project check.** Read `state/learner-profile.json`. Require:
   - A learner profile exists (if not, redirect to `/start`)
   - At least one active project exists (if not, redirect to `/discover`)

2. **Feature scoping.** Ask the user what feature or task they want to build. If the user provides it as an argument, use that. If the active project has milestones, suggest the next uncompleted milestone as a starting point.

3. **Pipeline execution.** Execute the 5-step pipeline sequentially. Each step is skippable at Phase 3+ (per methodology-enforcement rule). At Phase 1-2, the pipeline runs automatically.

   **Step 1: Plan** -- Invoke `dev-planner` agent.
   - Produces an implementation plan (requirements, file changes, dependencies, risks)
   - Teaching annotations at depth calculated per annotation contract
   - At Phase 2+: asks user for input on the plan before proceeding
   - At Phase 3+: waits for user to initiate (does not auto-proceed)

   **Step 2: Implement** -- Invoke `dev-builder` agent.
   - Follows TDD cycle: write test (RED), run test (should fail), implement (GREEN), run test (should pass), refactor (IMPROVE)
   - Teaching annotations explain TDD at low levels, execute silently at high levels
   - At Phase 2+: asks user for test case ideas before writing tests
   - At Phase 3+: waits for user instruction

   **Step 3: Review** -- Invoke `dev-reviewer` agent, then `dev-security` agent.
   - Code review with severity levels (CRITICAL, HIGH, MEDIUM, LOW)
   - Security review focused on the changes made
   - Teaching annotations explain what each finding means
   - At Phase 2+: asks user to evaluate findings (Socratic mode)
   - At Phase 3+: presents findings, lets user decide what to fix

   **Step 4: Verify** -- Invoke `dev-verifier` agent.
   - Runs: build check, type check (if applicable), lint, test suite, test coverage
   - Teaching annotations explain what each check does and why
   - At Phase 2+: asks user which verification steps matter most
   - At Phase 3+: runs checks, reports results

   **Step 5: Commit** -- Invoke `git-guide` agent.
   - Stages changes, composes commit message, offers to push/create PR
   - Teaching annotations explain git concepts at low levels
   - At Phase 2+: asks user to write the commit message
   - At Phase 3+: executes git commands on instruction

4. **Inter-step transitions.** Between each step:
   - At Phase 1-2: announce the next step and explain why it follows the previous one
   - At Phase 3: ask "Ready for the next step, or want to adjust anything?"
   - At Phase 4-5: proceed without announcement unless something needs attention

5. **Error handling.** If any step fails (build error, test failure):
   - Invoke `build-fixer` agent to diagnose and fix
   - Teach what went wrong (at appropriate annotation depth)
   - Re-run the failed step after fixing
   - Never silently skip a failed step

6. **Session state.** Record pipeline steps executed in the session history entry: `pipeline_steps_executed: ["plan", "implement", "review", "verify", "commit"]`.

7. **Milestone tracking.** If the completed feature corresponds to a project milestone, update `current_milestone` and append to `milestones_completed` in the project entry.

## Arguments
| Argument | Required | Description |
|---|---|---|
| `<feature>` | No | Description of the feature to build. If omitted, the command asks interactively or suggests the next milestone. |

## Phase-Specific Behavior

| Phase | Pipeline Control | Teaching Depth | User Role |
|---|---|---|---|
| 0 | Redirect to `/discover` -- cannot build without a project | N/A | N/A |
| 1 (Observer) | Automatic execution of all 5 steps | High (verbosity 4-5). Full narration of WHY each step. | Watches, approves, asks questions |
| 2 (Co-Pilot) | Automatic execution, pauses for input at decision points | Medium (verbosity 3). Explains decisions, asks for input. | Makes decisions, Claude executes |
| 3 (Navigator) | Suggests pipeline, allows skipping. Waits for user initiation. | Low (verbosity 1-2). Annotates new concepts only. | Drives most decisions, modifies plans |
| 4 (Driver) | No suggestion. Executes steps as instructed. | Minimal. Annotates only risks/novel concepts. | Full control. Instructs Claude. |
| 5 (Graduate) | Silent. Executes on instruction. | None unless `/explain` is used. | Operates independently. |

## Implementation Notes
_Empty -- filled during implementation._

## Test Requirements
1. **Profile prerequisite test.** No profile redirects to `/start`. No active project redirects to `/discover`.
2. **Full pipeline test.** At Phase 1, all 5 pipeline steps execute in order: plan, implement, review, verify, commit.
3. **Step skip test.** At Phase 3+, the user can skip individual steps (e.g., skip review).
4. **Agent routing test.** Each step invokes the correct agent: dev-planner, dev-builder, dev-reviewer + dev-security, dev-verifier, git-guide.
5. **Error recovery test.** A build failure during implement triggers the build-fixer agent and re-runs the step.
6. **Session history test.** After pipeline completes, `pipeline_steps_executed` in the session history contains all executed step names.
7. **Milestone tracking test.** Completing a feature that matches a milestone updates `current_milestone` and `milestones_completed`.
8. **Phase behavior test.** At Phase 1 the pipeline auto-runs; at Phase 3 it pauses and waits for user initiation.
