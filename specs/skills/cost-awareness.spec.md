# Component: cost-awareness
## Type: skill
## Status: pending
## Dependencies: agent-orchestration (model routing is an orchestration concept), dev-pipeline (cost is a pipeline concern)
## Session Target: 1

## What This Is
Teaches model routing and token economics for Phase 4+ users. This skill reveals why different agents use different AI models, how token usage translates to cost, and how to make cost-effective decisions when steering Claude Code independently. This is the "invisible layer" that advanced users need to understand to operate efficiently post-graduation.

## Skill Frontmatter
```yaml
name: cost-awareness
description: "Activated at Phase 4+ when teaching about model routing and cost optimization, when the user asks about why different models are used for different tasks, or when discussing token economics. NOT activated in Phases 0-3."
origin: MDH
```

## Content Specification

### Section 1: Why Different Models Exist
Teach the model landscape in plain terms:
- AI models come in different sizes with different capabilities and costs
- Bigger models think deeper but cost more
- Smaller models are faster and cheaper but handle less complexity
- The analogy: hiring a senior consultant for strategy and a junior associate for data entry — you match the expertise to the task

### Section 2: The Three Model Tiers
Teach the MDH model routing strategy:
- **Opus** (deepest reasoning) — for strategic decisions: planning complex features, understanding ambiguous requirements, teaching nuanced concepts. Used sparingly (2 agents: mentor, project-advisor)
- **Sonnet** (best coding model) — for execution: writing code, reviewing code, running tests, fixing errors. Used for most work (8 agents)
- **Haiku** (90% capability at 3x savings) — for mechanical tasks: generating documentation, formatting reports, routine processing. Used for cost-optimized work (2 agents)

### Section 3: Token Economics
Teach what tokens are and how they relate to cost:
- A token is roughly a word or part of a word (the unit AI models process)
- Input tokens (what you send) and output tokens (what the AI generates)
- Each model has different per-token prices
- Why read-only tools for strategists save money (no expensive tool calls generating content)
- Why Haiku handles documentation (same quality, fraction of the cost)

### Section 4: The Model Routing Decision
Teach the decision framework for choosing the right model:
- Is the task strategic, ambiguous, or architectural? Use Opus.
- Is the task coding, implementation, or review? Use Sonnet.
- Is the task mechanical, deterministic, or low-risk? Use Haiku.
- The default rule: "Start with the cheapest model that can do the job. Escalate only when it fails with a clear reasoning gap."

### Section 5: Cost-Effective Practices
Teach practical habits for post-graduation efficiency:
- Keep context windows focused (use /compact when context fills up)
- Write clear, specific instructions (reduces back-and-forth)
- Use the right pipeline steps for the task (do not run the full pipeline for a one-line fix)
- Monitor token usage (understand why a session cost what it cost)
- Extended thinking budget management (when deep reasoning is worth the tokens)

### Section 6: Applying This Knowledge Post-Graduation
Connect cost awareness to independent Claude Code usage:
- Any harness or Claude Code setup uses models and tokens
- The cost patterns learned here apply everywhere
- Understanding cost helps the user decide when to invest in deep reasoning vs. quick execution
- The graduated user should think about model routing the same way a manager thinks about team assignments

## ECC Source Material
- ECC manual section 6: "Model Routing Decision" — decision tree for model selection
- ECC manual section 3: "Where the Models Route" — cost/capability mapping per pipeline step
- ECC rules/common/performance.md — Model Selection Strategy (Haiku 90% capability at 3x savings, Sonnet for main work, Opus for complex reasoning), Extended Thinking + Plan Mode
- ECC manual section 14: "Environment Variables Reference" — CLAW_MODEL, cost-related configuration
- Plan section 8.5: "Cost Management" — model routing for cost, cost mitigation strategies, cost teaching at Phase 4+
- Plan section 5.5: "The Meta-Cognitive Layer" — Phase 4 reveal of model routing and costs

## Implementation Notes
[Empty — filled during implementation]
