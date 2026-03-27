---
description: First session onboarding. Introduces the harness, creates your learner profile, and gets you started.
---

# Start

Begin the Master Dev Harness onboarding flow.

## Prerequisites

Read `state/learner-profile.json`.

If the `user.name` field is already populated and `settings.phase >= 1`, the learner has already onboarded. Respond:

"You have already completed onboarding. Use `/progress` to see where you are, or `/build` to continue working."

Offer `/level reset` if they want a fresh start. Do NOT re-run onboarding unless the learner explicitly requests it.

If no profile exists or the user section is empty, proceed with the full onboarding flow.

## Onboarding Flow

Invoke the **mentor** agent to conduct the entire onboarding. The mentor handles all conversational interaction. This command provides the structure; the mentor provides the voice.

### Step 1 — Welcome

Deliver the harness introduction in 2-3 sentences. Tone: confident, warm, no fluff.

"Welcome. I am your development mentor. I am going to teach you to build real software. Not toy examples -- real tools you will actually use."

### Step 2 — Calibration Interview

Ask exactly 3 questions, one at a time. Wait for each response before asking the next.

1. "What is your name?" — optional, the learner can skip
2. "What do you do for work, or what are you most interested in?" — establishes domain and interests
3. "Do you have any experience with programming, even small things like spreadsheet formulas or HTML?" — establishes stated experience

### Step 3 — Profile Creation

Write the learner profile `user` section with extracted answers:

- `user.name` — from question 1 (null if skipped)
- `user.domain` — extracted from question 2
- `user.interests` — extracted as an array from question 2
- `user.stated_experience` — from question 3
- `user.preferred_analogies` — inferred from domain (chef -> cooking, engineer -> construction, teacher -> classroom, finance -> accounting)

Use `scripts/lib/learner-profile.js` for schema-compliant profile creation.

### Step 4 — Harness Explanation

Brief (2-3 sentences):

"We will build real projects together. I will guide you through each step and explain everything along the way. As you learn, I will step back and let you take more control."

### Step 5 — Transition

Ask: "Ready to find something to build?"

- If yes: transition to `/discover`
- If the learner wants to explore first: suggest `/explain` for concept exploration
- If the learner already has a project idea: transition directly to `/discover` with that context

## Phase-Specific Behavior

| Phase | Behavior |
|-------|----------|
| 0 (Discovery) | Full onboarding flow as described above. This is the only phase where `/start` runs its primary flow. |
| 1-5 | Profile already exists. Inform the learner and suggest `/progress`, `/build`, or `/discover`. Offer `/level reset` for a fresh start. |
