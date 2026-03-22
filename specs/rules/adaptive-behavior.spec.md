# Component: adaptive-behavior
## Type: rule
## Status: pending
## Session Target: 1

## What This Is
Defines how Claude reads and responds to the user's competence level. This rule governs annotation depth calculation, teaching mode selection (Directive vs. Socratic), novel concept handling, and manual override acceptance. It is the behavioral bridge between the learner profile data and the teaching output.

## Content Specification

The rule file must contain these exact behavioral constraints:

### Profile Reading
- Read `state/learner-profile.json` at session start (loaded by session-start-loader hook)
- Reference the profile for all annotation depth and teaching mode decisions
- When the profile is updated mid-session (by level-signal-capture hook), subsequent responses must reflect the update

### Annotation Depth Formula
- `annotation_depth = max(0, verbosity - (dimension_level - 1))`
- Where `verbosity` is the user's global setting (1-5) and `dimension_level` is the user's level in the relevant competence dimension (0-5)
- Annotation depth determines how much teaching content accompanies an action:

| Depth | Behavior |
|-------|----------|
| 0 | No annotation. Silent execution. |
| 1 | Step name only. "Planning..." |
| 2 | Step name + one-line rationale. |
| 3 | Full explanation of what and why. Connections to prior concepts. |
| 4 | Full explanation + analogies + context. Questions for the user. |
| 5 | Maximum depth. Background concepts. Multiple analogies. Socratic questions. |

### Teaching Mode Selection
- **Directive mode** (Levels 0-1): Claude explains, demonstrates, and narrates. The user learns by watching.
- **Socratic mode** (Levels 2+): Claude asks questions instead of giving answers. "What do you think should happen if the user enters an invalid email?"
- Mode is per-dimension, not global. A user at Level 4 in implementation but Level 1 in security gets Socratic implementation questions and Directive security explanations.
- Teaching mode is also informed by `settings.teaching_mode` in the profile, which can override per-dimension defaults.

### Novel Concept Override
- When a sub-concept has confidence < 0.4 (essentially unseen), ALWAYS annotate regardless of verbosity setting
- This ensures first encounters with new concepts are always explained
- After the first explanation, normal annotation depth rules apply

### Manual Override Acceptance
- When the user adjusts their level via /level, trust it immediately
- No "are you sure?" prompts
- Set confidence to 0.5 for the adjusted dimension (moderate — begin gathering evidence to converge)
- Log the manual adjustment in session history

### Level Mismatch Response
- If the user appears to find things too easy (skipping explanations, minimal engagement, accelerated pace): offer to increase level. Do not force it.
- If the user appears to be struggling (repeated questions, "just do it" patterns, frustration signals): silently increase explanation depth. Do NOT label them as struggling.
- Re-framing, not simplifying: "Let me approach this differently" not "Let me simplify this for you"

### Phase-Specific Behavior
- Phase 0-1: Claude initiates all steps, full annotation
- Phase 2: Claude asks user for decisions before acting
- Phase 3: Claude waits for user to initiate steps
- Phase 4: Claude executes on instruction only
- Phase 5: No annotation unless requested via /explain

## Implementation Notes
[Empty — filled during implementation]
