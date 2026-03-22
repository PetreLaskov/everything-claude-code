# Component: start
## Type: command
## Status: pending
## Dependencies: mentor agent, scripts/lib/learner-profile.js, scripts/hooks/session-start-loader.js
## Session Target: 5

## What This Is
The `/start` command is the first-session onboarding flow. It introduces the harness, asks 3 initial calibration questions (name, domain, experience), writes the user section of the learner profile, and transitions to `/discover` if the user is ready. Total onboarding target: under 5 minutes.

## Command Frontmatter
```yaml
---
description: First session onboarding. Introduces the harness, creates your learner profile, and gets you started.
---
```

## Behavior Specification

1. **Profile check.** Read `state/learner-profile.json`. If the `user.name` field is already populated and `settings.phase >= 1`, the profile already exists -- inform the user they have already onboarded and suggest `/discover`, `/build`, or `/progress` instead. Do NOT re-run onboarding unless the user explicitly requests a reset.

2. **Welcome message.** Deliver the harness introduction in 2-3 sentences. Tone: confident, warm, no fluff. Example from plan: "Welcome. I'm your development mentor. I'm going to teach you to build real software. Not toy examples -- real tools you'll actually use."

3. **Calibration questions.** Ask exactly 3 questions, one at a time (wait for response before asking next):
   - "What's your name?" (optional -- user can skip)
   - "What do you do for work, or what are you most interested in?" (establishes `user.domain` and `user.interests`)
   - "Do you have any experience with programming, even small things like spreadsheet formulas or HTML?" (establishes `user.stated_experience`)

4. **Profile write.** Update the learner profile's `user` section with the answers:
   - `user.name` -- from question 1 (null if skipped)
   - `user.domain` -- extracted from question 2
   - `user.interests` -- extracted as an array from question 2
   - `user.stated_experience` -- from question 3
   - `user.preferred_analogies` -- inferred from domain (e.g., if user is a chef, set to "cooking")

5. **Harness explanation.** Brief (2-3 sentences) explanation of how the harness works: "We will build real projects together. I will guide you through each step and explain everything along the way. As you learn, I will step back and let you take more control."

6. **Transition.** Invoke the `mentor` agent to deliver the welcome and conduct the interview. After profile is written, ask: "Ready to find something to build?" If yes, transition to `/discover`. If the user wants to explore first, suggest `/explain` for concept exploration.

7. **Mentor agent invocation.** The `mentor` agent handles all conversational interaction during onboarding. The command provides the interview structure; the mentor provides the voice.

## Arguments
None. This command takes no arguments.

## Phase-Specific Behavior

| Phase | Behavior |
|---|---|
| 0 (Discovery) | Full onboarding flow as described above. This is the only phase where `/start` runs its primary flow. |
| 1-5 | Profile already exists. Inform the user: "You have already completed onboarding. Use `/progress` to see where you are, or `/build` to continue working." Offer `/level reset` if they want a fresh start. |

## Implementation Notes
_Empty -- filled during implementation._

## Test Requirements
1. **Profile creation test.** Running `/start` with no existing profile creates a valid learner profile with all required fields from the schema contract.
2. **Idempotency test.** Running `/start` when a profile already exists (phase >= 1) does NOT overwrite the existing profile. Returns guidance to use other commands.
3. **Partial answer test.** User skipping the name question results in `user.name: null` without errors.
4. **Schema compliance test.** The profile written by `/start` passes validation against `specs/contracts/learner-profile-schema.md`.
5. **Transition test.** After onboarding completes, the command correctly suggests and can transition to `/discover`.
6. **Mentor agent invocation test.** The `mentor` agent is invoked during the onboarding flow (not dev-planner, not project-advisor).
