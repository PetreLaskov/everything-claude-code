---
description: Adjust explanation depth. 1 = silent, 3 = default, 5 = maximum teaching. Changes take effect immediately.
---

# Detail Level

Adjust the global explanation depth setting (verbosity 1-5) in the learner profile. This directly controls how much teaching annotation appears in all subsequent interactions. Performs a direct profile update using `scripts/lib/learner-profile.js`. No agent invocation.

## Prerequisites

Read `state/learner-profile.json`.

- If no profile exists, stop and redirect: "Run `/start` first to create your learner profile."
- If the profile exists, read `settings.phase`, `settings.verbosity`, and the full `competence` object (needed for signal recording).

## Argument Handling

Parse `$ARGUMENTS` to determine the mode.

### No Arguments (`/detail-level`)

Display the current verbosity setting with the scale description. Adapt the output to the user's phase.

**Phase 0-1:** Show the scale with practical examples and a recommendation.

```
Current verbosity: 3

1 = Silent. No explanations. Just execute.
2 = Brief. New concepts only.
3 = Default. New concepts + key decisions.
4 = Detailed. Most steps explained.
5 = Maximum. Everything explained with analogies and background.
```

Then add examples of what different levels look like in practice:

- "At level 2, you would see a one-line note when a new concept appears, like 'This is called a callback function.'"
- "At level 4, you would see step-by-step reasoning for why each decision was made."
- "At level 5, you would see analogies, background context, and connections to concepts you already know."

End with: "During early learning, 3-5 is recommended so you absorb the reasoning behind each step."

**Phase 2-3:** Show the scale without examples or recommendations.

```
Current verbosity: 3

1 = Silent    2 = Brief    3 = Default    4 = Detailed    5 = Maximum
```

**Phase 4-5:** Terse display only.

```
Verbosity: 3
```

### With Argument (`/detail-level N`)

Set verbosity to N.

1. Validate: must be an integer 1-5. If not, reject: "Verbosity must be an integer from 1 (Silent) to 5 (Maximum)."
2. Read the current verbosity value before updating.
3. Update `settings.verbosity` in the learner profile using `scripts/lib/learner-profile.js`.
4. Check for environment variable override (see below).
5. Record signal if applicable (see below).
6. Confirm the change, adapted to phase:
   - Phase 0-1: "Explanation depth set to [N] ([label]). [brief description of what that means]. You can change this anytime."
   - Phase 2-3: "Verbosity set to [N] ([label])."
   - Phase 4-5: "Verbosity set to [N]."

## Signal Recording

When the user adjusts verbosity DOWN (new value < old value):

- Record a positive signal (+0.10) for ALL active dimensions using `scripts/lib/competence-engine.js`.
- Rationale: the user is indicating they need less explanation, which is a behavioral signal of growing competence.

When the user adjusts verbosity UP (new value > old value):

- Record NO signal. Asking for more help is neutral, not negative.

When the new value equals the old value:

- No signal. Confirm: "Verbosity is already set to [N]."

## Annotation Depth Impact

The new verbosity setting is used in the annotation depth formula for all agents:

`annotation_depth = max(0, verbosity - (dimension_level - 1))`

Examples:
- Verbosity 1, dimension level 0: depth = max(0, 1 - (0 - 1)) = 2. Still some annotation for completely new concepts.
- Verbosity 3, dimension level 2: depth = max(0, 3 - (2 - 1)) = 2. Moderate annotation.
- Verbosity 5, dimension level 3: depth = max(0, 5 - (3 - 1)) = 3. Solid annotation depth.
- Verbosity 1, dimension level 4: depth = max(0, 1 - (4 - 1)) = 0. No annotation.

The change takes effect immediately for all subsequent interactions in the session.

## Environment Variable Override

Check if `MDH_VERBOSITY` is set.

If set, inform the user: "Note: the `MDH_VERBOSITY` environment variable is set to [value] and takes precedence over this setting. Your profile has been updated to [N], but the environment variable will be used until it is removed."

Update the profile regardless. The env var may be removed later, and the profile value will then take effect.

## Input Validation

- Must be an integer 1-5. Reject 0, 6, negative numbers, floats, and strings.
- Message on invalid input: "Verbosity must be an integer from 1 (Silent) to 5 (Maximum)."

## Phase-Specific Behavior

| Phase | Behavior |
|-------|----------|
| 0-1 | When displaying, include practical examples of what each level looks like and recommend 3-5 for early learning. On update, include a brief description of the chosen level and reassure that it can be changed anytime. |
| 2-3 | When displaying, show the scale on a single line. On update, confirm with level number and label. No recommendation or examples. |
| 4-5 | Terse output only. Display shows just the current value. Update confirms with just the number. |
