# Component: discover
## Type: command
## Status: pending
## Dependencies: project-advisor agent, scripts/lib/learner-profile.js, scripts/lib/project-templates.js
## Session Target: 5

## What This Is
The `/discover` command runs Phase 0 project discovery. It invokes the `project-advisor` agent (Opus) to conduct a guided interview, match the user to project archetypes, scope an MVP, define milestones, and write the project entry to the learner profile. This is how users find what to build.

## Command Frontmatter
```yaml
---
description: Discover what to build. Guided project discovery that matches your interests to a real project with defined milestones.
---
```

## Behavior Specification

1. **Profile check.** Read `state/learner-profile.json`. If no profile exists, redirect to `/start` first. If a profile exists, proceed.

2. **Active project check.** If `projects` array already contains an active project (`status: "active"`), inform the user they have an active project and ask if they want to start a new one or continue the current one. If continuing, suggest `/build` instead.

3. **Invoke project-advisor agent.** The `project-advisor` agent (Opus, read-only) conducts the discovery interview:

   **Step 1: Interest discovery** (3-5 questions, never more):
   - "What do you do for work or what are you interested in?" (if not already in profile from `/start`)
   - "Is there a problem you deal with regularly that software could solve?"
   - "What kind of software do you USE that you admire or wish worked differently?"
   - "How much time do you want to invest? A weekend project, a few weeks, or something ongoing?"
   - Questions already answered during `/start` are skipped (read from `user.domain`, `user.interests`).

   **Step 2: Route matching.** Based on answers, match to 1-3 project archetypes from `scripts/lib/project-templates.js`. Routes include: Web App, Automation, API/Integration, Data Tool, CLI Tool, Mobile/Desktop.

   **Step 3: Recommendation with rationale.** For each suggested project, explain:
   - What the user will BUILD (concrete deliverable)
   - What the user will LEARN (mapped to competence dimensions)
   - Why THIS project fits THEM (connecting to stated interests/pain points)
   - How BIG it is (estimated sessions, complexity level)
   - What the FIRST STEP looks like

   **Step 4: Project scoping.** Once user picks a direction:
   - Define MVP (what "done" looks like for v1)
   - Feature list (priority ordered)
   - Tech stack recommendation with WHY for each choice
   - Learning path (which competence dimensions develop most)

4. **Profile write.** Add a project entry to `projects` array:
   ```json
   {
     "id": "proj-NNN",
     "name": "string",
     "archetype": "string — matches project-templates id",
     "started_at": "ISO8601",
     "completed_at": null,
     "status": "active",
     "current_milestone": 0,
     "milestones_completed": [],
     "sessions": 0,
     "path": "string — filesystem path"
   }
   ```

5. **Phase transition check.** If the user was at phase 0 and now has a scoped project with defined MVP, the criteria for Phase 0->1 transition are met. Write `phase_proposed: 1` to the profile per the phase transition contract. The next session start will announce the transition.

6. **Edge case handling** (per plan section 3.2):
   - **No idea:** Present three concrete, small projects from different routes with vivid descriptions. Fallback default: personal CLI productivity tool.
   - **Too many ideas:** Apply filter: "Which of these would you use TOMORROW if it existed?" If still stuck, pick the smallest.
   - **Too ambitious:** Decompose into phases, each shippable. "That's a great end goal. The first milestone is [smaller version]."
   - **Too trivial:** Accept but enrich: "Let's make it production-grade -- proper error handling, tests, deployment."

## Arguments
None. The discovery interview is conversational, not argument-driven.

## Phase-Specific Behavior

| Phase | Behavior |
|---|---|
| 0 (Discovery) | Full discovery flow as described above. Primary use case. |
| 1 (Observer) | Available for starting a NEW project. Warns if active project exists. Same flow but acknowledges the user has been through this before. |
| 2-3 (Co-Pilot/Navigator) | Same as Phase 1 but with less annotation. User is choosing their next project more independently. |
| 4-5 (Driver/Graduate) | Minimal annotation. User likely knows what they want to build. Advisor acts as a sounding board rather than interviewer. |

## Implementation Notes
_Empty -- filled during implementation._

## Test Requirements
1. **Profile prerequisite test.** Running `/discover` with no profile redirects to `/start`.
2. **Active project detection test.** Running `/discover` when an active project exists warns the user and offers alternatives.
3. **Project entry creation test.** After discovery completes, a valid project entry exists in `projects` array matching the learner-profile-schema contract.
4. **Project ID uniqueness test.** Generated project IDs do not collide with existing project IDs.
5. **Phase transition proposal test.** Completing discovery at phase 0 writes `phase_proposed: 1` to the profile.
6. **Agent routing test.** The `project-advisor` agent (Opus) is invoked, not any other agent.
7. **Template matching test.** At least one project archetype from `project-templates.js` is matched and presented to the user.
