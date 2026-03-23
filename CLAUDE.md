# Master Dev Harness (MDH)

A Claude Code plugin that teaches intelligent non-developers to build real software through guided, adaptive, learning-by-doing mentorship.

## Architecture

MDH is a standalone commercial plugin. ECC methodology is embedded as self-knowledge, not a dependency.

### Directory Layout

```
agents/       12 agents (2 Opus, 8 Sonnet, 2 Haiku)
commands/     16 slash commands
skills/       14 skills (ECC methodology as teaching content)
hooks/        5 hooks (minimal, deliberate)
rules/        5 rules (teaching voice, guardrails, adaptive behavior)
scripts/      hooks/ (hook implementations), lib/ (core libraries)
state/        Learner profile + session history (local, gitignored)
specs/        Component specifications (development infrastructure)
tests/        Unit + integration tests
```

### Core Components

**Agents (12):**
- Opus (strategic, read-only): `mentor`, `project-advisor`
- Sonnet (execution): `dev-planner`, `dev-builder`, `dev-reviewer`, `dev-security`, `dev-verifier`, `build-fixer`, `level-assessor`, `git-guide`
- Haiku (mechanical): `doc-writer`, `progress-reporter`

**Commands (16):**
`/start`, `/discover`, `/build`, `/plan`, `/implement`, `/review`, `/verify`, `/commit`, `/explain`, `/level`, `/progress`, `/detail-level`, `/why`, `/challenge`, `/save-session`, `/resume-session`

**Core Libraries (scripts/lib/):**
- `learner-profile.js` — Profile CRUD, schema validation
- `competence-engine.js` — Level calculation, signal dampening, confidence updates
- `signal-parser.js` — Behavioral signal extraction from tool events
- `project-templates.js` — Project archetype definitions and matching

### Key Design Decisions (Do Not Re-Debate)

1. **Standalone plugin** — no ECC dependency. All methodology embedded in agent prompts and skills.
2. **Warn-only guardrails** — NEVER block user actions. Always advise, then proceed.
3. **9 competence dimensions** with levels 0-5, fractional accumulation, confidence dampening.
4. **Asymmetric notification** — level-ups celebrated, level-downs silent (just more help).
5. **Annotation depth formula** — `max(0, verbosity - (dimension_level - 1))`.
6. **6 phases** — Discovery(0), Observer(1), Co-Pilot(2), Navigator(3), Driver(4), Graduate(5).
7. **Teaching annotations woven into responses** — not separate blocks or callouts.
8. **All learner data local** — state/ directory, gitignored, no telemetry.
9. **Model routing** — Opus for strategic (2 agents), Sonnet for execution (8), Haiku for mechanical (2).

### Interface Contracts (Source of Truth)

Shared data formats that multiple components depend on:
- `specs/contracts/learner-profile-schema.md` — The learner profile JSON schema
- `specs/contracts/hook-io-contract.md` — Hook stdin/stdout format
- `specs/contracts/agent-annotation-contract.md` — How agents produce teaching annotations
- `specs/contracts/phase-transition-contract.md` — Phase transition criteria and protocol

### Development Workflow

1. Read this file (auto-loaded)
2. Read `PROGRESS.md` for current state and next step
3. Read relevant spec files from `specs/` for what you're building
4. Read relevant contracts from `specs/contracts/` for shared interfaces
5. Build, test, update PROGRESS.md

### Spec Format

Each component has a spec at `specs/<type>/<name>.spec.md`. Specs are the authoritative source for component design. The plan document (`~/master-dev-harness-plan.md`) was the genesis; specs are the truth.

### Reference Material

- Full plan: `/home/pece/master-dev-harness-plan.md` (1,360 lines, genesis document)
- ECC operational manual: `/home/pece/ecc-manual` (reverse-engineered ECC knowledge)
- ECC source: `/home/pece/ecc/` (reference for plugin patterns and formats)
