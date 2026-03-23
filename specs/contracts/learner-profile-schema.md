# Contract: Learner Profile Schema

## Version: 1.0.0
## Consumers: All agents, all hooks, all commands that read/write learner state
## Owner: scripts/lib/learner-profile.js

## File Location
`state/learner-profile.json` (created at runtime, gitignored)

## Schema

```json
{
  "schema_version": "1.0.0",
  "created_at": "ISO8601",
  "updated_at": "ISO8601",

  "user": {
    "name": "string | null",
    "domain": "string | null — user's work/interest domain",
    "interests": ["string"],
    "stated_experience": "string | null — self-reported coding experience",
    "preferred_analogies": "string | null — domain for analogies (e.g., 'cooking', 'construction')"
  },

  "settings": {
    "verbosity": "integer 1-5, default 3",
    "phase": "integer 0-5, default 0",
    "phase_proposed": "integer | null — pending phase transition proposal",
    "phase_proposed_at": "ISO8601 | null",
    "phase_deferred_until_session": "integer | null — session count before re-proposing",
    "teaching_mode": "'directive' | 'socratic', default 'directive'"
  },

  "dimensions": {
    "<dimension_name>": {
      "level": "integer 0-5",
      "fractional_level": "float — accumulator for fractional progress",
      "confidence": "float 0.0-1.0 — certainty of assessment",
      "last_assessed": "ISO8601 | null",
      "evidence_count": "integer — total signals observed",
      "sub_concepts": {
        "<sub_concept_name>": {
          "level": "integer 0-5",
          "confidence": "float 0.0-1.0"
        }
      }
    }
  },

  "projects": [
    {
      "id": "string — proj-NNN",
      "name": "string",
      "archetype": "string — matches project-templates id",
      "started_at": "ISO8601",
      "completed_at": "ISO8601 | null",
      "status": "'active' | 'completed' | 'paused'",
      "current_milestone": "integer — 0-indexed",
      "milestones_completed": ["integer"],
      "sessions": "integer — count",
      "path": "string — filesystem path to project"
    }
  ],

  "session_history": [
    {
      "session_id": "string — YYYY-MM-DD-shortid",
      "date": "YYYY-MM-DD",
      "duration_minutes": "integer | null",
      "project_id": "string | null",
      "pipeline_steps_executed": ["string — step names"],
      "signals_captured": "integer",
      "level_changes": [
        { "dimension": "string", "from": "integer", "to": "integer" }
      ],
      "concepts_introduced": ["string"],
      "user_initiated_actions": "integer",
      "claude_initiated_actions": "integer",
      "handoff_notes": "string | null"
    }
  ],

  "signal_accumulator": {
    "<dimension_name>": "float — current fractional accumulation toward next level change"
  }
}
```

## Dimension Names (9)
`research`, `planning`, `implementation`, `review`, `security`, `verification`, `git_workflow`, `architecture`, `orchestration`

## Level Definitions

| Level | Label | Meaning |
|---|---|---|
| 0 | Unaware | Has not encountered this concept |
| 1 | Aware | Has seen it, needs full guidance |
| 2 | Familiar | Understands the idea, needs help directing |
| 3 | Competent | Can direct with occasional guidance |
| 4 | Proficient | Can direct independently, understands trade-offs |
| 5 | Expert | Can make novel decisions, guide others |

## Default Profile (New User)

All dimensions at level 0, confidence 0.3, verbosity 3, phase 0, teaching_mode "directive". Empty projects, session_history, signal_accumulator zeroed.

## Read/Write Protocol

- **Read:** Any component can read the profile at any time via `require('../lib/learner-profile').loadProfile()`
- **Write:** Only these components write:
  - `scripts/hooks/learner-state-persist.js` — saves on every Stop event
  - `scripts/hooks/level-signal-capture.js` — updates signal_accumulator and levels
  - `scripts/hooks/session-start-loader.js` — creates default profile if none exists
  - `/level` command — manual override
  - `/detail-level` command — updates settings.verbosity
  - `/start` command — initializes user section
  - `/discover` command — adds project entries
