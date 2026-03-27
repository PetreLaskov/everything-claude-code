---
description: Discover what to build. Guided project discovery that matches your interests to a real project with defined milestones.
---

# Discover

Run the Phase 0 project discovery flow. Invokes the **project-advisor** agent to conduct a guided interview, match the user to project archetypes, scope an MVP, and write the project entry to the learner profile.

## Prerequisites

Read `state/learner-profile.json`.

- If no profile exists, stop and redirect: "Run `/start` first to create your learner profile."
- If the profile exists, read `settings.phase`, `settings.verbosity`, `user.domain`, `user.interests`, and the `projects` array.

## Active Project Check

If the `projects` array contains an entry with `status: "active"`:

1. Inform the user: "You have an active project: **[project name]**."
2. Ask: "Would you like to start a new project, or continue with the current one?"
3. If continuing, suggest `/build` instead and stop.
4. If starting new, proceed with discovery.

## Discovery Flow

Invoke the **project-advisor** agent (Opus, read-only). The agent conducts a 4-step discovery process.

### Step 1: Interest Interview

Ask 3-5 questions to understand the user's interests and constraints. Never exceed 5 questions.

- "What do you do for work or what are you interested in?"
- "Is there a problem you deal with regularly that software could solve?"
- "What kind of software do you USE that you admire or wish worked differently?"
- "How much time do you want to invest? A weekend project, a few weeks, or something ongoing?"

Skip any question already answered during `/start`. Read answers from `user.domain` and `user.interests` in the profile. Only ask what is missing.

### Step 2: Route Matching

Based on the interview answers, match to 1-3 project archetypes from `scripts/lib/project-templates.js`. Routes include: Web App, Automation, API/Integration, Data Tool, CLI Tool, Mobile/Desktop.

Present the matched archetypes to the user.

### Step 3: Recommendation

For each suggested project, explain:

- What the user will **BUILD** (concrete deliverable)
- What the user will **LEARN** (mapped to competence dimensions)
- Why **THIS** project fits **THEM** (connecting to stated interests and pain points)
- How **BIG** it is (estimated sessions, complexity level)
- What the **FIRST STEP** looks like

Calculate annotation depth: `annotation_depth = max(0, verbosity - (dimension_level - 1))`. At high depth, explain the reasoning behind each recommendation. At low depth, present recommendations concisely.

### Step 4: Project Scoping

Once the user picks a direction, define:

- **MVP**: what "done" looks like for v1
- **Feature list**: priority ordered
- **Tech stack**: recommendation with WHY for each choice
- **Learning path**: which competence dimensions develop most
- **Milestones**: ordered steps from zero to MVP

## Edge Cases

Handle these situations explicitly:

- **No idea.** Present three concrete, small projects from different routes with vivid descriptions. Fallback default: a personal CLI productivity tool.
- **Too many ideas.** Apply filter: "Which of these would you use TOMORROW if it existed?" If still stuck, pick the smallest.
- **Too ambitious.** Decompose into phases, each shippable. "That's a great end goal. The first milestone is [smaller version]."
- **Too trivial.** Accept but enrich: "Let's make it production-grade -- proper error handling, tests, deployment."

## Profile Write

After scoping completes, add a project entry to the `projects` array:

```json
{
  "id": "proj-NNN",
  "name": "string",
  "archetype": "string -- matches project-templates id",
  "started_at": "ISO8601",
  "completed_at": null,
  "status": "active",
  "current_milestone": 0,
  "milestones_completed": [],
  "sessions": 0,
  "path": "string -- filesystem path"
}
```

Generate a unique `id` that does not collide with any existing project ID in the array.

## Phase Transition Check

If the user is at Phase 0 and now has a scoped project with a defined MVP, the criteria for Phase 0->1 transition are met. Write `phase_proposed: 1` and `phase_proposed_at: <ISO8601>` to the profile. The next session start will announce the transition.

## Phase-Specific Behavior

| Phase | Behavior |
|-------|----------|
| 0 (Discovery) | Full discovery flow as described above. Primary use case. Full annotation on everything. |
| 1 (Observer) | Available for starting a NEW project. Warns if active project exists. Same flow but acknowledges the user has been through this before. |
| 2-3 (Co-Pilot/Navigator) | Same as Phase 1 but with reduced annotation. User is choosing their next project more independently. |
| 4-5 (Driver/Graduate) | Minimal annotation. User likely knows what they want to build. Advisor acts as a sounding board rather than interviewer. |
