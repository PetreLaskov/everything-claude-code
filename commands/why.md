---
description: Explain why the last action was taken. Understand the reasoning behind what just happened.
---

# Why

Explain why the most recent action or decision was taken in the current session. Connects the action to the broader development methodology.

## Prerequisites

Read `state/learner-profile.json`.

- If no profile exists, proceed anyway. Default to Level 0 across all dimensions and verbosity 5. Do NOT redirect to `/start`.
- If profile exists, extract `competence_dimensions`, `preferences.verbosity`, and `preferences.preferred_analogies`.

## Step 1: Context Detection

Determine "the last action" by examining session context. Look for, in order of recency:

- The most recent tool use (Write, Edit, Bash, etc.)
- The most recent pipeline step executed
- The most recent agent invocation
- The most recent decision or choice made

If `$ARGUMENTS` contains a topic, narrow the search to that domain. For example, `/why test first` focuses on the TDD decision rather than the most recent generic action.

If no recent action can be identified (e.g., fresh session with no activity):
- Respond: "There is nothing recent to explain. Try running a command like `/build` or `/implement` first, then use `/why` to understand the reasoning."
- Stop. Do not proceed.

## Step 2: Four-Part Explanation

Invoke the **mentor** agent (Opus, read-only).

Deliver a four-part explanation adapted to the user's level:

**The action.** State what was done in plain terms.
- "We just wrote a test before writing the implementation code."

**The reasoning.** Explain why it was done this way.
- "Writing the test first forces us to think about WHAT the code should do before HOW to write it. This catches misunderstandings early."

**The methodology connection.** Show how it fits the broader development pipeline.
- "This is step 2 of the development pipeline -- implementation. The test-first approach (TDD) is one of the most valuable habits a developer can build."

**The alternative.** Describe what would have happened without this step.
- "Without a test, we would write code that looks right but might not handle edge cases. The test is our safety net."

All four parts are always present, at every level. The depth of each part adapts:

- At annotation_depth 4-5: full explanation with analogies from the user's `preferred_analogies` domain, methodology context, and detailed alternatives.
- At annotation_depth 2-3: focused rationale. Assumes the user understands the basics. Emphasizes the specific decision and its trade-offs.
- At annotation_depth 0-1: brief rationale. Focus on edge cases, alternatives, and when this approach would NOT be appropriate. Even at low depth, always explain WHY -- that is this command's purpose.

## Step 3: Signal Recording

Asking "why" about a specific domain is a positive signal for that dimension:

| Question domain | Dimension | Weight |
|-----------------|-----------|--------|
| "Why did we write the test first?" | implementation | +0.10 |
| "Why did we use a feature branch?" | git_workflow | +0.10 |
| "Why did we check for SQL injection?" | security | +0.10 |
| "Why did we split that into separate files?" | architecture | +0.10 |
| "Why did we use that library?" | tooling | +0.10 |

Map the question to the relevant dimension and record the signal. If the question does not clearly map to a dimension, do not record a signal.

## No Modification of Prior Actions

This command is purely explanatory. It does not undo, redo, or modify anything that was done. It does not change code, state files, or session history beyond recording the signal in Step 3.

## Phase-Specific Behavior

| Phase | Behavior |
|-------|----------|
| 0-1 (Discovery/Observer) | Full depth explanation. Methodology context. Analogies. Connects to the big picture of software development. |
| 2-3 (Co-Pilot/Navigator) | Rationale focused. Assumes the user understands the basics. Focuses on the specific decision and its trade-offs. |
| 4-5 (Driver/Graduate) | Brief rationale. Focus on edge cases, alternatives, and when this approach would NOT be appropriate. Treats the user as a peer discussing strategy. |
