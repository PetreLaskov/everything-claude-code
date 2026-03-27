---
description: View or adjust your competence levels. Shows your current assessment across all dimensions, or lets you override specific levels.
---

# Level

View or manually adjust competence levels across all 9 dimensions. Performs direct profile reads and writes using `scripts/lib/learner-profile.js` and `scripts/lib/competence-engine.js`. No agent invocation.

## Prerequisites

Read `state/learner-profile.json`.

- If no profile exists, stop and redirect: "Run `/start` first to create your learner profile."
- If the profile exists, read `settings.phase`, `settings.verbosity`, and the full `competence` object (all 9 dimensions).

## Mode Selection

Parse `$ARGUMENTS` to determine the mode.

### No Arguments (`/level`)

Display all 9 dimensions as a table. Adapt the columns to the user's phase.

**Phase 0-1 format (labels only):**

```
Dimension        Level
research         Familiar
planning         Aware
implementation   Familiar
review           Aware
security         Unaware
verification     Aware
git_workflow     Unaware
architecture     Unaware
orchestration    Unaware
```

Include a brief explanation: "These levels reflect what the harness has observed about your skills. They adapt as you work."

**Phase 2-3 format (numbers + labels):**

```
Dimension        Level  Label
research         2      Familiar
planning         1      Aware
implementation   2      Familiar
review           1      Aware
security         0      Unaware
verification     1      Aware
git_workflow     0      Unaware
architecture     0      Unaware
orchestration    0      Unaware
```

**Phase 4-5 format (full transparency):**

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

Level labels: Unaware (0), Aware (1), Familiar (2), Proficient (3), Advanced (4), Expert (5).

### Single Dimension Argument (`/level <dimension>`)

Display detailed view of the specified dimension including all sub-concepts. Adapt detail to phase.

**Phase 0-1:** Show sub-concept names and labels only.

**Phase 2-3:** Show sub-concept names, numeric levels, and labels.

**Phase 4-5:** Show sub-concept names, levels, and confidence values. Include evidence count and last assessed timestamp for the dimension.

Example (Phase 4-5):

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

### Dimension + Level Argument (`/level <dimension> <level>`)

Manual override. Set the dimension to the specified level.

1. Validate the dimension name against the 9 known dimensions. If no match, check for close matches using string similarity and suggest: "Did you mean `<closest>`?"
2. Validate the level is an integer 0-5. If not, reject: "Level must be an integer from 0 (Unaware) to 5 (Expert)."
3. Apply the override using `scripts/lib/competence-engine.js`:
   - Set `level` to the specified value.
   - Set `fractional_level` to match (e.g., level 4 sets fractional_level to 4.0).
   - Set `confidence` to 0.5.
   - Set `last_assessed` to the current ISO 8601 timestamp.
4. Log the manual adjustment in session history.
5. Confirm the change. Phase 0-1: "Your planning level is now Aware." Phase 2-3: "Planning set to Level 1 (Aware)." Phase 4-5: "Planning set to 1, confidence reset to 0.5."
6. At Phase 0-1, add: "The harness will continue observing your work and may adjust this over time."

Accept immediately. No confirmation prompt for single-dimension overrides.

### Sub-Concept Override (`/level <dimension>:<sub_concept> <level>`)

Set a specific sub-concept to the specified level.

1. Validate the dimension name.
2. Validate the sub-concept exists within that dimension. If not, list valid sub-concepts for the dimension.
3. Validate the level is an integer 0-5.
4. Apply the override to the sub-concept:
   - Set the sub-concept's `level` to the specified value.
   - Set the sub-concept's `confidence` to 0.5.
5. Log the manual adjustment in session history.
6. Confirm the change using the same phase-adapted format as dimension overrides.

### Reset Argument (`/level reset`)

Reset ALL dimensions to Level 0.

1. Prompt for confirmation: "This will reset all your levels to 0. Are you sure? (yes/no)"
2. If confirmed, reset every dimension:
   - `level` to 0
   - `fractional_level` to 0.0
   - `confidence` to 0.3
   - Evidence count to 0
   - Reset all sub-concepts within each dimension to the same defaults.
3. Log the full reset in session history.
4. Confirm: "All levels reset to 0 (Unaware). The harness will begin re-assessing from scratch."

If not confirmed, cancel: "Reset cancelled. No changes made."

## Input Validation

- **Level range:** Must be integer 0-5. Reject floats, negative numbers, strings. Message: "Level must be an integer from 0 (Unaware) to 5 (Expert)."
- **Dimension name:** Must match one of: research, planning, implementation, review, security, verification, git_workflow, architecture, orchestration. On typo, compute closest match and suggest it.
- **Sub-concept name:** Must exist within the specified dimension. On invalid name, list valid sub-concepts.

## Phase-Specific Behavior

| Phase | Behavior |
|-------|----------|
| 0-1 | Display uses labels only (Unaware, Aware, Familiar, Proficient, Advanced, Expert). No numbers, no confidence, no evidence. Briefly explains what levels mean. On overrides, add a note that the harness continues observing. |
| 2-3 | Display uses numbers and labels. This is a meta-cognitive reveal: the user learns about the competence tracking system. On first invocation at Phase 2+, briefly explain how levels are tracked. |
| 4-5 | Display includes confidence and evidence count. Full system transparency. Terse confirmations on overrides. |
