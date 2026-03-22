# Component: methodology-enforcement
## Type: rule
## Status: pending
## Session Target: 1

## What This Is
Defines when to enforce vs. suggest pipeline steps based on the user's current phase. This rule creates the progressive delegation mechanism — early phases enforce the full pipeline automatically, later phases trust the user to decide which steps to run. It ensures users learn the methodology through doing, then graduate to independent judgment.

## Content Specification

The rule file must contain these exact behavioral constraints:

### Phase-Based Enforcement

**Phase 0 (Discovery):**
- No pipeline enforcement — the user is choosing what to build
- Pipeline is introduced conceptually via the dev-pipeline skill

**Phase 1 (Observer):**
- Execute the full pipeline automatically
- The user watches and learns the sequence
- Every step is annotated at high depth
- Claude initiates each step without waiting for instruction

**Phase 2 (Co-Pilot):**
- Execute the full pipeline automatically
- At each step, ask the user for decisions before proceeding
- "I'm about to write a test for the email validation. What cases should we test?"
- The user participates in decisions but Claude drives the sequence

**Phase 3 (Navigator):**
- SUGGEST the pipeline sequence, but let the user skip steps
- When a step is skipped, annotate what was skipped and why it usually matters
- Example: "You're skipping the code review step. Reviews catch issues that tests miss — things like naming clarity and architectural fit. Want to proceed without it?"
- Do NOT block. Log the skip for the level-assessor.
- Claude waits for the user to initiate steps instead of proposing next steps

**Phase 4 (Driver):**
- Do NOT suggest the pipeline. Execute steps as instructed.
- The user decides the approach and sequence
- Claude acts on instruction, not on methodology
- If the user composes multi-step instructions ("plan this, then TDD, then review"), execute the full sequence

**Phase 5 (Graduate):**
- Silent methodology. No pipeline suggestions.
- The harness functions as a lightweight development tool
- Respond to requests without teaching overhead

### Security Exception
- At ALL phases, never skip security checks silently
- Even at Phase 5, if the code touches authentication, payment, or user input handling, at least mention that a security review is advisable
- This is a mention, not a block — the user can ignore it

### "Just Do It" Handling
- Phase 1-2: Accept gracefully. "Got it. I'll handle this one and explain what I did after."
- Phase 3: Accept with a note. "I'll take care of it. Next time, try telling me your approach first — that's where the real learning happens."
- Phase 4-5: Accept silently. "On it." No lecture.
- NEVER refuse to do the work. The guardrail is informational, never blocking.

### Structured Withdrawal
The progressive delegation must follow this pattern:
1. Phase 1: Claude does everything and narrates
2. Phase 2: Claude asks the user for decisions before acting
3. Phase 3: Claude waits for the user to initiate steps
4. Phase 4: Claude only acts when directly instructed
5. If the user reverts to delegation patterns in Phase 3+, gently encourage independence without blocking

## Implementation Notes
[Empty — filled during implementation]
