---
description: Full guided development pipeline. Plans, implements with TDD, reviews, verifies, and commits -- with teaching adapted to your level.
---

# Build

Run the full 5-step guided development pipeline: plan, implement, review, verify, commit. Each step invokes the appropriate teaching agent with annotation depth adapted to the user's competence levels. This is the primary workflow command.

## Prerequisites

Read `state/learner-profile.json`.

- If no profile exists, stop and redirect: "Run `/start` first to create your learner profile."
- If no active project exists in the `projects` array (`status: "active"`), stop and redirect: "Run `/discover` first to scope a project."
- If the user is at Phase 0, redirect to `/discover`. Cannot build without a scoped project.
- Read `settings.phase`, `settings.verbosity`, and all dimension levels from the profile.

## Feature Scoping

Determine what the user wants to build:

1. If `$ARGUMENTS` contains a feature description, use that.
2. Otherwise, check if the active project has milestones. If so, suggest the next uncompleted milestone as a starting point.
3. If no milestones or no argument, ask interactively: "What feature or task do you want to build?"

## Pipeline Execution

Execute the 5-step pipeline sequentially. At Phase 1-2, the pipeline runs automatically with inter-step transitions. At Phase 3+, each step is skippable and the pipeline waits for user initiation.

### Step 1: Plan

Invoke the **dev-planner** agent (Sonnet).

- Produces an implementation plan: requirements, file changes, dependencies, phases, risks.
- Teaching annotations at depth: `annotation_depth = max(0, verbosity - (planning_level - 1))`.
- At Phase 2+: ask user for input on the plan before proceeding.
- At Phase 3+: present the plan and wait for user to initiate the next step.

### Step 2: Implement

Invoke the **dev-builder** agent (Sonnet).

- Follows the TDD cycle: write test (RED), run test (should fail), implement (GREEN), run test (should pass), refactor (IMPROVE).
- Teaching annotations at depth: `annotation_depth = max(0, verbosity - (implementation_level - 1))`.
- At Phase 2+: ask user for test case ideas before writing tests.
- At Phase 3+: wait for user instruction before proceeding.

### Step 3: Review

Invoke the **dev-reviewer** agent (Sonnet), then the **dev-security** agent (Sonnet).

- Code review with severity levels: CRITICAL, HIGH, MEDIUM, LOW.
- Security review focused on the changes made.
- Teaching annotations at depth: `annotation_depth = max(0, verbosity - (review_level - 1))` for code review, and `annotation_depth = max(0, verbosity - (security_level - 1))` for security review.
- At Phase 2+: ask user to evaluate findings (Socratic mode).
- At Phase 3+: present findings and let user decide what to fix.

### Step 4: Verify

Invoke the **dev-verifier** agent (Sonnet).

- Runs: build check, type check (if applicable), lint, test suite, test coverage.
- Teaching annotations at depth: `annotation_depth = max(0, verbosity - (testing_level - 1))`.
- At Phase 2+: ask user which verification steps matter most.
- At Phase 3+: run checks and report results.

### Step 5: Commit

Invoke the **git-guide** agent (Sonnet).

- Stages changes, composes commit message, offers to push or create PR.
- Teaching annotations at depth: `annotation_depth = max(0, verbosity - (git_level - 1))`.
- At Phase 2+: ask user to write the commit message.
- At Phase 3+: execute git commands on instruction.

## Inter-Step Transitions

Between each pipeline step:

- At Phase 1-2: announce the next step and explain why it follows the previous one.
- At Phase 3: ask "Ready for the next step, or want to adjust anything?"
- At Phase 4-5: proceed without announcement unless something needs attention.

## Error Handling

If any step fails (build error, test failure, lint error):

1. Invoke the **build-fixer** agent (Sonnet) to diagnose and fix the issue.
2. Teach what went wrong at the appropriate annotation depth.
3. Re-run the failed step after fixing.
4. Never silently skip a failed step.

## Session State

After the pipeline completes (or partially completes), record the executed steps in the session history entry:

```json
{
  "pipeline_steps_executed": ["plan", "implement", "review", "verify", "commit"]
}
```

Only include steps that were actually executed. If a step was skipped (Phase 3+), omit it from the array.

## Milestone Tracking

If the completed feature corresponds to a project milestone:

1. Increment `current_milestone` in the active project entry.
2. Append the milestone to `milestones_completed` with a timestamp.
3. Announce the milestone completion to the user.

## Phase-Specific Behavior

| Phase | Pipeline Control | Teaching Depth | User Role |
|-------|-----------------|----------------|-----------|
| 0 | Redirect to `/discover` | N/A | N/A |
| 1 (Observer) | Automatic execution of all 5 steps | High (verbosity 4-5). Full narration of WHY each step. | Watches, approves, asks questions |
| 2 (Co-Pilot) | Automatic execution, pauses for input at decision points | Medium (verbosity 3). Explains decisions, asks for input. | Makes decisions, Claude executes |
| 3 (Navigator) | Suggests pipeline, allows skipping. Waits for user initiation. | Low (verbosity 1-2). Annotates new concepts only. | Drives most decisions, modifies plans |
| 4 (Driver) | No suggestion. Executes steps as instructed. | Minimal. Annotates only risks and novel concepts. | Full control. Instructs Claude. |
| 5 (Graduate) | Silent. Executes on instruction. | None unless `/explain` is used. | Operates independently. |
