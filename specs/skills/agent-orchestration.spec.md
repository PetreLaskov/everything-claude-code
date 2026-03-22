# Component: agent-orchestration
## Type: skill
## Status: pending
## Dependencies: dev-pipeline (orchestration chains pipeline steps), cost-awareness (model routing is an orchestration concern)
## Session Target: 1

## What This Is
Teaches how multi-agent workflows work for Phase 4+ users. This is a meta-cognitive skill — it reveals the system's own architecture as a teaching tool. When a user reaches Phase 4, they learn that the "mentor" who has been teaching them is actually an orchestrated system of specialized AI agents. Understanding this architecture IS the graduation requirement, because a user who understands orchestration can steer Claude Code independently with any harness.

## Skill Frontmatter
```yaml
name: agent-orchestration
description: "Activated at Phase 4+ when teaching about the system architecture, when the user asks how the harness works internally, when composing multi-step instructions, or when discussing agent roles and pipeline composition. NOT activated in Phases 0-3."
origin: MDH
```

## Content Specification

### Section 1: What Agents Are
Reveal the architecture: the "mentor" is not one thing — it is a team of specialized AI workers, each with a specific role, specific tools, and a specific AI model powering it. Use the analogy: a film crew — the director (mentor) coordinates, but there is a camera operator (builder), an editor (reviewer), a sound engineer (verifier), and each brings different expertise.

### Section 2: The Agent Team
Teach the MDH agent roster and their roles:
- **Strategists** (Opus) — think deeply but do not write code: mentor, project-advisor
- **Executors** (Sonnet) — the workhorses that read, write, and run code: dev-planner, dev-builder, dev-reviewer, dev-security, dev-verifier, build-fixer, level-assessor, git-guide
- **Mechanicals** (Haiku) — handle routine tasks cheaply: doc-writer, progress-reporter

For each agent, cover: what it does, what tools it has access to (and why), when it activates, and how its output feeds into the next step.

### Section 3: The Pipeline as Orchestration
Show how /build actually works behind the scenes:
1. dev-planner creates a plan and waits for approval
2. dev-builder implements with TDD
3. dev-reviewer reviews the code with fresh eyes (never saw it being written)
4. dev-security checks for vulnerabilities
5. dev-verifier runs all automated checks
6. git-guide handles the commit and PR

Teach the key insight: each agent runs in a SEPARATE context. The reviewer literally does not know what the builder was thinking — this is intentional, because fresh eyes catch more bugs.

### Section 4: Tool Constraints as Architecture
Teach why agents have different tool permissions:
- Strategists (Opus) are read-only — this forces them to THINK, not act, and prevents expensive tokens from being spent on file editing
- Executors (Sonnet) have full access — they need to read, write, and run code
- This is a design pattern: constrain the tool set to shape behavior

### Section 5: Composing Your Own Instructions
Teach how to write multi-step instructions that efficiently steer Claude Code:
- "Plan this, then implement with TDD, then review" — this is pipeline composition
- Each instruction maps to an agent or a step
- The user is now the orchestrator — deciding which steps to run and in what order
- When to use the full pipeline vs. skipping steps (with awareness of trade-offs)

### Section 6: Beyond MDH
Connect orchestration knowledge to the broader Claude Code ecosystem:
- The ECC harness uses the same architecture but with more agents and automation
- Any Claude Code setup can be orchestrated the same way
- The patterns learned here transfer to any AI-assisted workflow
- This knowledge makes the user a power user of Claude Code, not just MDH

## ECC Source Material
- ECC manual section 6: "The Agent Team (Your AI Org Chart)" — full agent roster, three tiers, proactive vs. reactive activation
- ECC manual section 6: "Model Routing Decision" — decision tree for model selection
- ECC manual section 6: "Agent Escalation" — how agents refer to other agents
- ECC rules/common/agents.md — available agents table, immediate agent usage, parallel task execution, multi-perspective analysis
- ECC manual section 3: "The Four Pre-Built Pipelines" — orchestrate command workflows (feature, bugfix, refactor, security)
- Plan section 5.5: "The Meta-Cognitive Layer" — Phase 4 reveal of model routing and costs

## Implementation Notes
[Empty — filled during implementation]
