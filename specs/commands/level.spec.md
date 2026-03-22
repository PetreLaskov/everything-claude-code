# Component: level
## Type: command
## Status: pending
## Dependencies: scripts/lib/learner-profile.js, scripts/lib/competence-engine.js
## Session Target: 5

## What This Is
The `/level` command lets the user view and manually adjust their competence levels across all 9 dimensions. It performs direct profile reads and writes without invoking any agent. Manual adjustments are trusted immediately with confidence set to 0.5. This is the user's override mechanism for the adaptive difficulty system.

## Command Frontmatter
```yaml
---
description: View or adjust your competence levels. Shows your current assessment across all dimensions, or lets you override specific levels.
---
```

## Behavior Specification

1. **Profile check.** Read `state/learner-profile.json`. If no profile exists, redirect to `/start`.

2. **Mode selection based on arguments:**

   **No arguments (`/level`):** Display all 9 dimensions with their current levels, confidence, and evidence count. Format as a readable table:
   ```
   Dimension        Level  Label       Confidence  Evidence
   research         2      Familiar    0.65        8
   planning         1      Aware       0.45        3
   implementation   2      Familiar    0.70        12
   review           1      Aware       0.50        5
   security         0      Unaware     0.30        0
   verification     1      Aware       0.50        4
   git_workflow     0      Unaware     0.30        0
   architecture     0      Unaware     0.30        0
   orchestration    0      Unaware     0.30        0
   ```

   **Single dimension argument (`/level planning`):** Display detailed view of that dimension including all sub-concepts:
   ```
   Planning (Level 1 - Aware, Confidence 0.45)

   Sub-concepts:
     requirements_analysis    Level 1  Confidence 0.50
     phase_breakdown          Level 1  Confidence 0.40
     risk_identification      Level 0  Confidence 0.30
     dependency_mapping       Level 1  Confidence 0.50

   Evidence count: 3
   Last assessed: 2026-03-22T14:30:00Z
   ```

   **Dimension + level argument (`/level planning 4`):** Manual override. Set the dimension to the specified level (0-5).

   **Sub-concept override (`/level planning:risk_id 2`):** Set a specific sub-concept to the specified level.

   **Reset argument (`/level reset`):** Reset ALL dimensions to Level 0 with confidence 0.3 and evidence count 0. Requires confirmation: "This will reset all your levels to 0. Are you sure?"

3. **Manual override protocol.** When the user manually sets a level:
   - Accept immediately. No "are you sure?" (except for full reset).
   - Set the dimension's `level` to the specified value
   - Set `fractional_level` to match the new level (e.g., if set to 4, fractional_level = 4.0)
   - Set `confidence` to 0.5 (moderate -- respects the user's self-assessment but not fully locked)
   - Set `last_assessed` to current timestamp
   - Log the manual adjustment in session history
   - Begin gathering behavioral evidence to converge toward the true level

4. **Input validation:**
   - Level must be 0-5 (integer). Reject other values with a clear message.
   - Dimension name must match one of the 9 known dimensions. Suggest closest match on typo.
   - Sub-concept name must exist within the specified dimension.

5. **No agent invocation.** This command reads and writes the profile directly. No agent is needed for display or override operations.

## Arguments
| Argument | Required | Description |
|---|---|---|
| `<dimension>` | No | Dimension name to view in detail or adjust. One of: research, planning, implementation, review, security, verification, git_workflow, architecture, orchestration. |
| `<level>` | No | Integer 0-5 to set the dimension to. Only valid when a dimension is specified. |
| `reset` | No | Special keyword. Resets all levels to 0. |

Sub-concept syntax: `<dimension>:<sub_concept>` (e.g., `planning:risk_id`).

## Phase-Specific Behavior

| Phase | Behavior |
|---|---|
| 0-1 | Display format uses labels (Unaware, Aware, Familiar) rather than numbers for readability. Briefly explains what levels mean. |
| 2-3 | Display format includes both numbers and labels. At Phase 2+, this is a meta-cognitive reveal: the user learns about the competence tracking system (per plan section 5.5). |
| 4-5 | Display includes confidence and evidence count. Full system transparency. |

## Implementation Notes
_Empty -- filled during implementation._

## Test Requirements
1. **Profile prerequisite test.** No profile redirects to `/start`.
2. **All dimensions display test.** `/level` with no arguments displays all 9 dimensions with correct levels, labels, and confidence values.
3. **Single dimension detail test.** `/level planning` displays the dimension with all its sub-concepts.
4. **Manual override test.** `/level planning 4` sets planning level to 4, fractional_level to 4.0, and confidence to 0.5.
5. **Sub-concept override test.** `/level planning:risk_id 2` sets the risk_identification sub-concept to level 2.
6. **Reset test.** `/level reset` with confirmation resets all dimensions to level 0, confidence 0.3, evidence count 0.
7. **Validation test.** Invalid level values (e.g., 6, -1, "high") are rejected with a clear error message.
8. **Dimension name validation test.** Mistyped dimension names suggest the closest match.
9. **Session history logging test.** Manual overrides are logged in the session history.
10. **No agent invocation test.** The command completes without invoking any agent.
