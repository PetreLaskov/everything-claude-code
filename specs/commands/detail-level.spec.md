# Component: detail-level
## Type: command
## Status: pending
## Dependencies: scripts/lib/learner-profile.js
## Session Target: 5

## What This Is
The `/detail-level` command adjusts the global explanation depth setting (1-5) in the learner profile. This directly controls how much teaching annotation appears in all subsequent agent interactions. It performs a direct profile update without invoking any agent. Adjusting verbosity down is recorded as a positive competence signal.

## Command Frontmatter
```yaml
---
description: Adjust explanation depth. 1 = silent, 3 = default, 5 = maximum teaching. Changes take effect immediately.
---
```

## Behavior Specification

1. **Profile check.** Read `state/learner-profile.json`. If no profile exists, redirect to `/start`.

2. **Argument handling:**

   **No argument (`/detail-level`):** Display current verbosity setting with an explanation of the scale:
   ```
   Current verbosity: 3

   1 = Silent. No explanations. Just execute.
   2 = Brief. New concepts only.
   3 = Default. New concepts + key decisions.
   4 = Detailed. Most steps explained.
   5 = Maximum. Everything explained with analogies and background.
   ```

   **With argument (`/detail-level N`):** Set verbosity to N (1-5).
   - Validate: must be integer 1-5. Reject other values with a clear message.
   - Update `settings.verbosity` in the learner profile
   - Confirm: "Verbosity set to [N]. [brief description of what that means]."
   - Changes take effect immediately for all subsequent interactions in the session.

3. **Signal recording.** When the user adjusts verbosity DOWN (e.g., from 3 to 2):
   - Record a positive signal (+0.10) for all active dimensions (the user is indicating they need less help)
   - Per plan section 2.2: "User adjusts verbosity down" is a positive signal for any active dimension

4. **Annotation depth impact.** The new verbosity setting is used in the annotation depth formula for all agents:
   - `annotation_depth = max(0, verbosity - (dimension_level - 1))`
   - Example: Setting verbosity to 1 with dimension levels of 0 produces depth 2 (still some annotation for completely new concepts)
   - Example: Setting verbosity to 5 with dimension levels of 0 produces depth 6, clamped to 5 (maximum depth)

5. **Environment variable override.** If `MDH_VERBOSITY` is set, inform the user that the environment variable takes precedence over the profile setting. Update the profile anyway (the env var may be removed later).

6. **No agent invocation.** This is a direct profile update. No agent is needed.

## Arguments
| Argument | Required | Description |
|---|---|---|
| `<level>` | No | Integer 1-5. If omitted, displays current setting and scale description. |

## Phase-Specific Behavior

| Phase | Behavior |
|---|---|
| 0-1 | When displaying the scale, include examples of what verbosity 1 vs 5 looks like in practice. Recommend staying at 3-5 during early learning. |
| 2-3 | Display the scale. No recommendation -- the user knows their preference. |
| 4-5 | Terse confirmation only. "Verbosity set to [N]." |

## Implementation Notes
_Empty -- filled during implementation._

## Test Requirements
1. **Profile prerequisite test.** No profile redirects to `/start`.
2. **Display test.** `/detail-level` with no argument shows the current setting and scale description.
3. **Update test.** `/detail-level 2` sets `settings.verbosity` to 2 in the learner profile.
4. **Validation test.** Values outside 1-5 (e.g., 0, 6, "high") are rejected with a clear error message.
5. **Immediate effect test.** After setting verbosity, the next agent interaction uses the new value in the annotation depth formula.
6. **Downward signal test.** Changing verbosity from 3 to 2 records a positive signal (+0.10) for active dimensions.
7. **Upward neutral test.** Changing verbosity from 2 to 4 does NOT record any signal (asking for more help is neutral, not negative).
8. **Env var notice test.** When `MDH_VERBOSITY` is set, the command informs the user that the env var takes precedence.
9. **No agent invocation test.** The command completes without invoking any agent.
