# Contract: Phase Transition Protocol

## Version: 1.0.0
## Consumers: level-assessor agent, mentor agent, session-start-loader hook, learner-state-persist hook

## Phase Definitions

| Phase | Name | Min Dimensions at Level | Other Criteria |
|---|---|---|---|
| 0 | Discovery | None | Has no scoped project |
| 1 | Observer | None | Has a scoped project with MVP defined |
| 2 | Co-Pilot | 2 dims at Level 2+ (planning, implementation) | Can answer "what comes next?" in pipeline |
| 3 | Navigator | 3 dims at Level 3+ | Demonstrates independent decision-making in 2+ dims |
| 4 | Driver | 5 dims at Level 4+ | Can explain WHY a decision was made |
| 5 | Graduate | 7 dims at Level 4+ | Successfully orchestrates a full pipeline independently |

## Transition Protocol

### Step 1: Criteria Evaluation
The `level-assessor` agent evaluates transition criteria at session end (triggered by the Stop hook). It reads the learner profile and checks:
- Dimension levels meet the threshold for the next phase
- Minimum project count at current phase (at least 1 completed project, except Phase 0→1 which needs just a scoped project)
- No dimensions in "struggling" state (negative signal accumulator) for 3+ consecutive sessions

### Step 2: Proposal
If criteria are met, the assessor writes a transition proposal to the learner profile:
```json
{
  "phase_proposed": 2,
  "phase_proposed_at": "2026-03-22T14:00:00Z"
}
```

### Step 3: Announcement
At the next session start, the `session-start-loader` hook detects the pending proposal and injects a transition announcement into context. The `mentor` agent then presents it conversationally:

"Based on our work together, you've demonstrated [specific competencies]. I think you're ready to take more control. In Phase [N], you'll [description]. Want to move forward, or stay at the current pace?"

### Step 4: User Response
- **Accept:** Phase updates immediately. Verbosity adjusts. Teaching mode may shift.
- **Defer:** Proposal stays but is not re-raised for 3 sessions. `phase_deferred_until_session` is set.
- **Provide feedback:** User can say "I'm not ready for X but ready for Y." This is logged as a manual level adjustment signal.

### Step 5: Activation
On acceptance:
1. `settings.phase` updates to new value
2. `phase_proposed` clears to null
3. Session log records the transition
4. Teaching mode may shift (e.g., Phase 2+ defaults to socratic for Level 2+ dimensions)

## Phase Transition NEVER:
- Happens automatically without user confirmation
- Happens mid-session (always proposed at session end, announced at session start)
- Decreases phase (phases only go forward; if user struggles, explanation depth increases within the current phase)
- Is forced ("want to move forward, or stay?" — both answers are valid)

## Behavioral Changes by Phase

| What Changes | Phase 0-1 | Phase 2 | Phase 3 | Phase 4 | Phase 5 |
|---|---|---|---|---|---|
| Who initiates steps | Claude | Claude asks user | User initiates | User instructs | User controls |
| Pipeline enforcement | Automatic | Automatic | Suggest, allow skip | No suggestion | Silent |
| Default verbosity | 4-5 | 3 | 2-3 | 1-2 | 1 |
| "Just do it" response | Accept gracefully | Accept gracefully | Accept + gentle note | Accept silently | Accept silently |
| Meta-cognitive reveals | None | Competence tracking | Agent architecture | Model routing, costs | Full system understanding |
