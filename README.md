# Master Dev Harness

A Claude Code plugin that teaches you to build real software — not by teaching you to code, but by teaching you to steer the thing that codes.

## The idea

Software development, as a manual craft, is largely solved. AI agents write competent code. What they cannot do is decide *what* to build, *when* to test, *why* one architecture beats another, or *whether* the output is actually correct. Those decisions — the ones that used to live inside a senior engineer's head — are now the entire job. Master Dev Harness teaches you that job.

You start with zero experience. The harness asks what you want to build, scopes a real project (not a tutorial), and walks you through the full development pipeline: research, planning, implementation, testing, review, security, deployment. At every step it explains what is happening and why it matters. As you demonstrate competence, the explanations thin out and the harness hands you more control. By the end, you are directing the full pipeline yourself with the judgment of someone who has shipped software before — because you have.

## Getting started

Install the plugin into Claude Code:

```bash
claude plugin add master-dev-harness
```

Then start a new session and run:

```
/start
```

The harness asks three questions — your name, what you do, and whether you have any prior experience. From those answers it creates a learner profile and calibrates its teaching. The whole onboarding takes about two minutes.

After onboarding, run `/discover` to find a project. The harness matches your interests and domain to a concrete, scoped build — something you would actually use. From there, `/plan`, `/implement`, `/review`, `/verify`, `/commit`. Each command maps to a real phase of the development pipeline.

## What you will experience

The harness tracks your competence across nine dimensions — planning, implementation, testing, debugging, security, architecture, git workflow, research, and orchestration. Each dimension has its own level (0 through 5), updated automatically based on what you do in each session. When you demonstrate that you understand why a test should be written before the implementation, your testing level goes up. When you ask the harness to check for security issues without being prompted, your security level goes up.

These levels control how much teaching you get. At Level 0 in a dimension, every technical term gets a parenthetical definition and every decision gets a full explanation. At Level 4, the harness executes and moves on. You never have to configure this. You also never see a level go down — if you forget something, the harness quietly provides more help without commentary.

The six phases map to your overall progression:

| Phase | Name | You are... |
|-------|------|------------|
| 0 | Discovery | Finding out what you want to build |
| 1 | Observer | Watching the harness work, learning the process |
| 2 | Co-Pilot | Making decisions together at key points |
| 3 | Navigator | Directing the work, with the harness advising |
| 4 | Driver | Running the pipeline yourself, harness on standby |
| 5 | Graduate | Full autonomy — the harness stays out of your way |

## Commands

| Command | What it does |
|---------|-------------|
| `/start` | Onboarding — creates your learner profile |
| `/discover` | Guided project discovery matched to your interests |
| `/build` | Resume work on your active project |
| `/plan` | Plan a feature or milestone before implementing |
| `/implement` | Build the next piece with TDD and review |
| `/review` | Code quality review of recent changes |
| `/verify` | Run tests, check security, validate the build |
| `/commit` | Stage, commit, and push with guided messaging |
| `/explain` | Ask about any concept — get an answer calibrated to your level |
| `/why` | Understand the reasoning behind a past decision |
| `/level` | See your current competence levels across all dimensions |
| `/progress` | Overview of your project and learning trajectory |
| `/detail-level` | Adjust how much teaching annotation you receive |
| `/challenge` | Request a stretch task slightly above your current level |
| `/save-session` | Persist session state for later continuation |
| `/resume-session` | Pick up where you left off |

## How it works

Twelve agents handle different parts of the pipeline. Two strategic agents (Opus) handle mentoring and project advising — work that requires deep reasoning about your situation. Eight execution agents (Sonnet) handle the day-to-day: planning, building, reviewing, security analysis, verification, build fixing, level assessment, and git guidance. Two mechanical agents (Haiku) handle documentation and progress reporting.

Five hooks run automatically during your session. On session start, the harness loads your profile and injects context. During tool use, it captures behavioral signals (did you run tests? did you ask for a review?) and updates your competence levels in real time. A teaching annotation hook calibrates explanation depth for every response. On session end, it persists your progress. A guardrail hook watches for common mistakes — hardcoded secrets, oversized files, writes to sensitive paths — and warns without blocking.

Four core libraries handle the data:

- **learner-profile** — Profile CRUD with schema validation and atomic saves
- **competence-engine** — Level calculation with fractional accumulation and confidence dampening
- **signal-parser** — Extracts behavioral signals from tool events, filters false positives
- **project-templates** — Eleven project templates across six routes, matched to learner interests

All learner data stays local in the `state/` directory. Nothing is sent anywhere. The state directory is gitignored by default.

## Guardrails

The harness never blocks you. Every guardrail is warn-only. If you are about to commit a hardcoded API key, it will tell you — and then let you proceed if you choose to. If you skip testing, it will explain why testing matters — and then build the feature anyway. The philosophy is that you learn more from an informed choice than from a locked door.

## Requirements

- Claude Code
- Node.js 18 or later

No other dependencies. The plugin uses only Node.js built-in modules.

## Development

```bash
# Run the test suite (311 tests across 11 files)
node tests/run-all.js
```

Tests use `node:test` and `node:assert/strict` — zero external test dependencies.

## License

MIT
