---
name: agent-orchestration
description: "Activated at Phase 4+ when teaching about the system architecture, when the user asks how the harness works internally, when composing multi-step instructions, or when discussing agent roles and pipeline composition. NOT activated in Phases 0-3."
origin: MDH
---

# Agent Orchestration

## What Agents Are

Up until now, it might feel like you've been working with one AI — "the mentor." But what's actually been happening is more like a film production.

When you watch a movie, you see one seamless experience. Behind the scenes, there's a director, a camera operator, an editor, a sound engineer, a lighting crew, a costume designer — each with a specific job, specific tools, and specific expertise. The director doesn't operate the camera. The editor doesn't do lighting. Specialization is what makes the result good.

The Master Dev Harness works the same way. "The mentor" is not one thing — it's a team of 12 specialized AI agents, each designed for a specific role. When you run `/build`, you're not talking to one AI that does everything. You're triggering a coordinated sequence where different agents handle different parts of the process.

This is called **agent orchestration** — organizing specialized workers into a pipeline where each one's output feeds the next one's input. You've been the beneficiary of this architecture since you started. Now, at Phase 4, you're ready to understand it.

---

## The Agent Team

The 12 agents are organized into three tiers based on the AI model that powers them. Different models have different strengths and different costs.

### Strategists (Opus — Deep Reasoning)

These agents think deeply but don't write code. They can read your codebase and reason about it, but they can't edit files or run commands. This constraint is intentional — it forces them to focus on thinking, not doing.

**mentor**
- **What it does:** Your primary interface. Guides your learning, explains concepts, decides what you need next. The director of the film crew.
- **Tools:** Read files, search code, access your learner profile. Cannot edit files or run commands.
- **When it activates:** Every interaction. It's always the one talking to you.
- **Output:** Explanations, guidance, decisions about what to work on next.

**project-advisor**
- **What it does:** Makes architectural decisions — technology choices, project structure, how components should fit together. The architect who draws blueprints but doesn't pour concrete.
- **Tools:** Read files, search code, search the web for research. Cannot edit files or run commands.
- **When it activates:** During `/discover` (choosing your project), when you hit architectural decisions, when the project scope needs adjusting.
- **Output:** Recommendations, architectural plans, technology evaluations.

### Executors (Sonnet — Best Coding Model)

These agents read code, write code, and run commands. They do the hands-on work of building, reviewing, and verifying software.

**dev-planner**
- **What it does:** Takes a feature request and creates a detailed implementation plan — what files to create, what functions to write, what tests to set up, in what order.
- **Tools:** Read files, search code.
- **When it activates:** Step 2 of the pipeline (Plan), or when you run `/plan`.
- **Output:** A structured plan that `dev-builder` follows.

**dev-builder**
- **What it does:** Writes the actual code. Creates files, implements functions, writes tests. Follows the plan from `dev-planner` and uses test-driven development (writes tests first, then implementation).
- **Tools:** Read files, write files, run terminal commands (install packages, run tests, start servers).
- **When it activates:** Step 3 of the pipeline (Implement), or when you run `/implement`.
- **Output:** Working code and passing tests.

**dev-reviewer**
- **What it does:** Reviews code for quality, readability, bugs, and best practices. Reads the code with fresh eyes — it never saw the code being written, so it catches things the author missed.
- **Tools:** Read files, search code.
- **When it activates:** Step 4 of the pipeline (Review), or when you run `/review`.
- **Output:** Review feedback: issues found, suggestions, approval.

**dev-security**
- **What it does:** Checks code for security vulnerabilities — exposed secrets, injection attacks, missing authentication, insecure configurations.
- **Tools:** Read files, search code, run security scanning commands.
- **When it activates:** Step 5 of the pipeline (Secure), or when security-relevant code changes.
- **Output:** Security findings categorized by severity (critical, high, medium, low).

**dev-verifier**
- **What it does:** Runs all checks — tests pass, code compiles, linting passes, no regressions. The quality gate before anything gets committed.
- **Tools:** Read files, run terminal commands.
- **When it activates:** Step 6 of the pipeline (Verify).
- **Output:** Pass/fail verdict with details on any failures.

**build-fixer**
- **What it does:** When something breaks — a build error, a failing test, a configuration issue — this agent diagnoses the problem and fixes it.
- **Tools:** Read files, write files, run terminal commands.
- **When it activates:** Whenever a build or test fails during the pipeline.
- **Output:** Fixed code and passing builds.

**level-assessor**
- **What it does:** Observes your work and updates your competence profile. Tracks which skills are growing, which need more practice, and when you're ready for the next phase.
- **Tools:** Read files, read your learner profile, update your learner profile.
- **When it activates:** After significant work sessions, during `/level` checks.
- **Output:** Updated competence scores and phase recommendations.

**git-guide**
- **What it does:** Handles version control — creating commits with meaningful messages, managing branches, creating pull requests.
- **Tools:** Read files, run git commands.
- **When it activates:** Step 7 of the pipeline (Commit), or when you run `/commit`.
- **Output:** Clean git history with descriptive commits.

### Mechanicals (Haiku — Efficient and Fast)

These agents handle routine tasks that don't require deep reasoning. They produce the same quality output as more expensive models for their specific tasks, but at a fraction of the cost.

**doc-writer**
- **What it does:** Writes documentation — README files, code comments, API documentation, usage guides.
- **Tools:** Read files, write files.
- **When it activates:** When documentation needs creating or updating.
- **Output:** Clear, well-structured documentation.

**progress-reporter**
- **What it does:** Generates progress summaries — what was accomplished, what's next, how the project is tracking against milestones.
- **Tools:** Read files, read your learner profile.
- **When it activates:** During `/progress`, at session boundaries.
- **Output:** Formatted progress reports.

---

## The Pipeline as Orchestration

When you run `/build`, here's what actually happens behind the scenes. Each step is handled by a different agent, in sequence.

### The Sequence

```
dev-planner  →  dev-builder  →  dev-reviewer  →  dev-security  →  dev-verifier  →  git-guide
  (Plan)        (Implement)      (Review)         (Secure)        (Verify)        (Commit)
```

1. **dev-planner** reads your codebase and the feature request. It produces a plan: which files to change, what functions to write, what tests to create, and in what order.

2. **dev-builder** takes that plan and executes it. It writes tests first (they fail because the feature doesn't exist yet), then writes the implementation (tests pass), then refactors if needed.

3. **dev-reviewer** gets a fresh look at the code. It didn't see the builder writing it — it only sees the finished result. This is intentional. Fresh eyes catch things the author can't see: naming issues, missed edge cases, overly complex logic, code that's correct but hard to understand.

4. **dev-security** scans for vulnerabilities. Are there secrets in the code? Unvalidated inputs? Missing authentication checks? SQL injection risks?

5. **dev-verifier** runs everything: tests, linting, type checking, build. If anything fails, `build-fixer` gets called to resolve it.

6. **git-guide** creates a commit with a meaningful message describing what was built and why.

### Why Separate Contexts Matter

Here's the key architectural insight: **each agent runs in its own context.** The reviewer doesn't know what the builder was thinking. The security scanner doesn't know what shortcuts the builder took. The verifier doesn't care about intentions — only results.

This separation is the same reason companies have separate teams for development, QA, and security. When the person who wrote the code also reviews it, they see what they meant to write, not what they actually wrote. A fresh pair of eyes catches what familiarity hides.

---

## Tool Constraints as Architecture

Notice something about the agent list: not every agent can do everything. The mentor can read code but can't edit it. The reviewer can read code but can't fix it. This might seem like a limitation, but it's a deliberate design choice.

### Why Strategists Are Read-Only

The mentor and project-advisor run on Opus — the most powerful and most expensive model. If they could edit files and run commands, they'd be tempted to do the work directly. But that would be like hiring a CEO to pack boxes in the warehouse. It's a waste of their abilities and your budget.

By limiting strategists to reading and thinking, the architecture forces them to do what they're best at: reason deeply, make decisions, and provide guidance. The actual work goes to Sonnet agents, who are excellent at coding and cost less per interaction.

### Why Reviewers Can't Edit

If the reviewer could fix issues directly, it would just become a second builder. The separation forces a clear workflow: the reviewer identifies problems, the builder fixes them. This creates accountability and ensures the builder learns from the feedback.

### The Design Pattern

This is a pattern you'll see everywhere in software architecture: **constrain capabilities to shape behavior.** Give a component only the tools it needs for its specific job, and it's forced to do that job well. Give it everything, and it becomes unfocused.

Your own tools have constraints too. A hammer can't screw. A screwdriver can't hammer. That's not a flaw — it's what makes each tool good at its job.

---

## Composing Your Own Instructions

Now that you understand the pipeline, you can compose your own workflows. Instead of always running the full `/build` command, you can run individual steps and combine them however you want.

### Individual Commands Map to Agents

| Command | Agent Triggered | What Happens |
|---|---|---|
| `/plan` | dev-planner | Creates an implementation plan |
| `/implement` | dev-builder | Writes code following TDD |
| `/review` | dev-reviewer | Reviews code for quality |
| `/verify` | dev-verifier | Runs tests and checks |
| `/commit` | git-guide | Creates a git commit |

### Composing Workflows

When you say "plan this feature, then implement it with TDD, then review" — you're composing a pipeline. Each instruction maps to an agent and step. You're the orchestrator now, deciding which steps matter and in what order.

**Full pipeline** (for important features):
Plan, implement, review, secure, verify, commit. Every check, every safety net.

**Quick iteration** (for small changes):
Implement, verify, commit. You skip the planning (it's simple enough) and the review (low risk). You keep verification because tests should always pass.

**Research and plan only** (for complex decisions):
Plan only, without implementation. Get the plan, review it yourself, adjust it, then implement.

### Trade-Off Awareness

Skipping steps saves time but removes safety nets. That's a trade-off, not a free optimization. Know what you're giving up:

- **Skip planning:** Risk building the wrong thing or taking a wasteful approach.
- **Skip review:** Risk shipping bugs, unclear code, or missed edge cases.
- **Skip security:** Risk vulnerabilities. Only safe to skip for code with no user input or external access.
- **Skip verification:** Risk committing broken code. Almost never worth skipping.

The more experienced you get, the better your judgment about which steps to skip for which tasks. That judgment is a skill in itself.

---

## Beyond MDH

Everything you've learned about agent orchestration applies far beyond this harness.

### The Pattern Is Universal

MDH uses 12 agents with a 7-step pipeline. But the architecture pattern — specialized agents, sequential pipelines, tool constraints, fresh-eyes review — is how any AI-assisted workflow can be organized.

The professional version of this architecture (ECC — the system MDH is based on) uses the same pattern with more agents and more sophisticated orchestration. But the principles are identical. You already understand them.

### What Transfers

- **Specialization over generalization.** One focused agent with the right tools outperforms one general-purpose agent trying to do everything.
- **Pipeline composition.** Breaking work into sequential steps with clear inputs and outputs.
- **Tool constraints as design.** Limiting what a component can do to shape what it will do.
- **Fresh-eyes review.** Separating creation from evaluation.

### You Are Now a Power User

Understanding orchestration makes you a power user of Claude Code, not just MDH. You can:

- Design your own agent workflows for specific tasks.
- Write multi-step instructions that compose cleanly.
- Make informed decisions about when to use the full pipeline vs. shortcuts.
- Evaluate any AI-assisted workflow using the same principles.

You've moved from "person who uses a tool" to "person who understands how the tool works and can adapt it." That's the difference between a user and a practitioner.
