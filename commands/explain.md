---
description: Get a deep explanation of any concept. Works at any time, adapted to your current level and interests.
---

# Explain

On-demand deep explanation of any development concept. This command is always accessible, even without a learner profile or during Phase 5 when other teaching is silent.

## Prerequisites

Read `state/learner-profile.json`.

- If no profile exists, proceed anyway. Default to Level 0 across all dimensions and verbosity 5. Do NOT redirect to `/start`.
- If profile exists, extract `competence_dimensions`, `preferences.verbosity`, `preferences.preferred_analogies`, and `session_history.concepts_introduced`.

## Step 1: Concept Input

Check `$ARGUMENTS` for the concept to explain.

- If provided, use it as the concept.
- If not provided, ask: "What would you like me to explain?"
- Wait for the user's response before proceeding.

## Step 2: Concept Classification

Invoke the **mentor** agent (Opus, read-only).

Map the concept to a competence dimension and sub-concept:

- "TDD" -> implementation.tdd_red_green_refactor
- "git branching" -> git_workflow.branching
- "API design" -> architecture.api_design
- "what is a test" -> implementation (general)
- "environment variables" -> tooling.env_configuration
- Concepts that do not map to a known dimension get a general-purpose explanation without dimension-specific depth adaptation.

Determine `dimension_level` from the relevant dimension. Compute `annotation_depth = max(0, verbosity - (dimension_level - 1))`.

## Step 3: Level-Adapted Explanation

Deliver the explanation at the appropriate depth:

- At Level 0-1 in the relevant dimension: start from fundamentals. Define every term. Assume no prior knowledge. Use analogies from `preferred_analogies` domain. If the sub-concept's confidence is below 0.4, apply the novel concept override and explain fully regardless of other factors.
- At Level 2-3: build on existing understanding. Connect to concepts the user has already seen by referencing `session_history.concepts_introduced`. Go into nuances and practical applications.
- At Level 4-5: go deep. Discuss trade-offs, edge cases, when NOT to use the pattern. Treat the user as a peer exploring a topic together.

## Step 4: Analogy Selection

Use the user's `preferred_analogies` domain for analogies:

- If domain is "cooking": "A function is like a recipe -- it takes ingredients (inputs), follows steps, and produces a dish (output)."
- If domain is "construction": "A test is like a building inspection -- it verifies the structure meets specifications before anyone moves in."
- If domain is "music": "Refactoring is like rearranging a song -- the melody stays the same, but the arrangement gets cleaner."
- If no preferred domain is set, use universally accessible analogies.

Weave analogies into the explanation naturally. Do not present them as separate callout blocks.

## Step 5: Connection to Prior Learning

Reference concepts the user has already encountered from `session_history.concepts_introduced`.

- "Remember when we wrote that first test? TDD is the discipline of always starting there."
- "This connects to the branching workflow you used in your last commit."

If no prior concepts are relevant, skip this step.

## Step 6: Novel Concept Tracking

If this concept (or its sub-concept) has not been introduced before in the current session, add it to `session_history.concepts_introduced`.

## Step 7: Follow-Up Invitation

After the explanation, ask: "Does that make sense? Want me to go deeper on any part, or see an example in our project?"

## No Side Effects on Levels

This command does NOT modify competence levels. It does NOT record signals. Asking for an explanation is a signal of curiosity, not struggle. The request itself is neutral. Only the user's response afterward (in a different command context) may generate signals.

## Phase-Specific Behavior

| Phase | Behavior |
|-------|----------|
| 0-1 (Discovery/Observer) | Full depth. Start from fundamentals. Maximum use of analogies. Define every term. |
| 2-3 (Co-Pilot/Navigator) | Build on existing knowledge. Reference prior concepts. Go deeper into nuances and practical applications. |
| 4 (Driver) | Discuss trade-offs and edge cases. Treat user as a peer exploring a topic. |
| 5 (Graduate) | This is THE primary teaching mechanism. All other commands execute silently. `/explain` is how graduates access the teaching layer on demand. Full depth on any requested topic. |
