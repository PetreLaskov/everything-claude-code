---
name: cost-awareness
description: "Activated at Phase 4+ when teaching about model routing and cost optimization, when the user asks about why different models are used for different tasks, or when discussing token economics. NOT activated in Phases 0-3."
origin: MDH
---

# Cost Awareness

## Why Different Models Exist

AI models are not one-size-fits-all. They come in different sizes with different capabilities, different speeds, and different costs. A bigger model can reason more deeply and handle more ambiguity, but it costs more to run. A smaller model is faster and cheaper but handles complex reasoning less reliably.

Think of it like hiring for a project. You wouldn't pay a senior consultant $500/hour to enter data into a spreadsheet — that's a waste of their expertise and your budget. And you wouldn't ask a junior associate to redesign your company's architecture — they don't have the depth of experience. You match the person to the task.

AI model selection works the same way. The goal is always: **use the cheapest model that can do the job well.** Not the cheapest model period (that sacrifices quality), and not the most expensive model always (that wastes money). The right model for the right task.

---

## The Three Model Tiers

MDH uses three tiers of AI models, each powering different agents.

### Opus — The Strategist

**What it is:** The most powerful model with the deepest reasoning capability. It excels at ambiguous problems, architectural decisions, and situations where there's no clear right answer and the model needs to weigh trade-offs carefully.

**What it costs:** The most expensive tier per interaction.

**Who uses it:** 2 agents — `mentor` and `project-advisor`.

**Why these two:** Mentoring requires understanding your learning state, adapting explanations to your level, making judgment calls about what to teach next, and handling the full ambiguity of natural conversation. Project advising requires evaluating technology trade-offs, anticipating architectural problems, and making strategic decisions. These tasks demand deep reasoning — the kind where thinking twice as long produces a significantly better answer.

**Why only 2 agents:** Because deep reasoning is expensive, you want it focused on tasks where it makes a measurable difference. Using Opus for writing documentation or formatting a progress report would produce nearly identical results to a cheaper model — but cost significantly more.

### Sonnet — The Executor

**What it is:** The best model for writing and understanding code. Excellent at implementation, review, debugging, and any task that involves reading or writing source code.

**What it costs:** Mid-tier — significantly less than Opus, but more than Haiku.

**Who uses it:** 8 agents — `dev-planner`, `dev-builder`, `dev-reviewer`, `dev-security`, `dev-verifier`, `build-fixer`, `level-assessor`, `git-guide`.

**Why these eight:** Code is the core of software development, and these agents need to read, write, analyze, and verify code. Sonnet is the best coding model available — it's what you want writing your implementation, reviewing your logic, and fixing your build errors. It's the perfect balance of capability and cost for hands-on work.

**Why the majority of agents:** Because the majority of development work is execution. Planning, building, reviewing, testing, fixing, committing — these are the activities that make up 80% of the time spent on any project. The model that handles them needs to be excellent at code and efficient enough to run frequently.

### Haiku — The Mechanic

**What it is:** A smaller, faster model that delivers roughly 90% of Sonnet's capability at about a third of the cost. It handles well-defined, routine tasks where the format and approach are predictable.

**What it costs:** The least expensive tier — roughly 3x cheaper than Sonnet.

**Who uses it:** 2 agents — `doc-writer` and `progress-reporter`.

**Why these two:** Writing documentation follows predictable patterns: read the code, describe what it does, structure it clearly. Generating progress reports follows an even more predictable pattern: read the project state, summarize what changed, list what's next. Neither task requires deep reasoning or creative problem-solving. The output from Haiku on these tasks is virtually indistinguishable from what a more expensive model would produce.

**Why this matters:** Using Haiku for routine tasks frees up budget for the tasks where model quality actually matters. It's not about being cheap — it's about being smart with resources.

---

## Token Economics

Understanding how AI costs work gives you the vocabulary to make informed decisions about your workflow.

### What Tokens Are

AI models don't process words — they process **tokens**. A token is roughly three-quarters of a word. "Hello, world!" is 4 tokens. A typical paragraph is about 50-75 tokens. A full file of code might be 500-2,000 tokens.

You're charged for two things:
- **Input tokens:** Everything the model reads — your message, the code files it examines, the conversation history. Think of this as "what you show the model."
- **Output tokens:** Everything the model writes back — its response, the code it generates, its explanations. Think of this as "what the model produces."

Output tokens are typically more expensive than input tokens because generating new content is more computationally intensive than reading existing content.

### Why Read-Only Tools Save Money

Remember that strategist agents (Opus) can only read files, not write them? There's a cost dimension to this design choice.

When an Opus agent reads your codebase, it consumes input tokens — relatively cheaper. If it could also write code, it would generate output tokens at Opus prices — the most expensive rate. By restricting Opus to reading and thinking, the architecture keeps the expensive model's output focused on high-value reasoning (guidance, decisions, explanations) rather than code generation that Sonnet handles equally well.

### Why Haiku Handles Documentation

Documentation and progress reports are output-heavy tasks — they produce a lot of text. Running those through Opus or Sonnet would generate the same quality text at 3-10x the cost. Haiku produces equivalent documentation at a fraction of the price because the task is well-defined enough that deeper reasoning doesn't improve the result.

---

## The Model Routing Decision

When deciding which model tier to use for a task, apply this framework.

### Route to Opus (Strategic) When:

- The task is **ambiguous** — there's no clear right answer and trade-offs need weighing.
- The task is **architectural** — it affects the overall structure or direction of the project.
- The task is **strategic** — it requires understanding the big picture and making judgment calls.
- The task involves **teaching** — explaining concepts in a way that matches the learner's level.

*Examples: Choosing between two frameworks. Deciding how to restructure a growing codebase. Explaining why a design pattern matters.*

### Route to Sonnet (Execution) When:

- The task involves **reading or writing code**.
- The task requires **implementation** — turning a plan into working software.
- The task involves **review or analysis** of code quality, security, or correctness.
- The task requires **running commands** and interpreting results.

*Examples: Building a new feature. Reviewing a pull request. Fixing a failing test. Setting up a database migration.*

### Route to Haiku (Mechanical) When:

- The task is **well-defined** — the format and approach are predictable.
- The task is **routine** — it follows the same pattern every time.
- The task is **low-risk** — a slightly imperfect output has minimal consequences.
- The task is **output-heavy** — it generates a lot of text relative to the complexity of the thinking required.

*Examples: Writing a README. Generating a progress summary. Formatting a changelog.*

### The Default Rule

**Start with the cheapest model that can do the job. Escalate only when there's a clear reasoning gap.**

If Haiku can handle it, use Haiku. If the task needs code expertise, use Sonnet. Only reach for Opus when the task genuinely requires deep, strategic reasoning. Most tasks don't — and that's fine. Using the right model for the job is smarter than always using the best model.

---

## Cost-Effective Practices

Beyond model routing, your day-to-day habits affect how efficiently you use AI-assisted development. These practices keep your workflow lean without sacrificing quality.

### Keep Context Focused

Every message you send includes conversation history as input tokens. As conversations grow longer, each new message costs more because the model re-reads everything that came before.

Use `/compact` to summarize and compress your conversation history when it gets long. Use `/save-session` and `/resume-session` to start fresh sessions for new tasks rather than continuing one massive conversation.

Think of it like a desk. If you pile every document you've ever read on your desk, finding anything takes longer and costs more attention. Periodically clearing the desk and keeping only what's relevant makes everything faster.

### Write Clear Instructions

Vague instructions cause back-and-forth. "Make it better" requires the model to guess what "better" means, ask clarifying questions, and iterate. "Add input validation to the email field: check format, max length 254 characters, trim whitespace" gets the right result in one pass.

Every round trip is more tokens. Clear instructions upfront reduce total cost by reducing iterations.

### Right-Size Your Pipeline

The full 7-step pipeline (Research, Plan, Implement, Review, Secure, Verify, Commit) is designed for significant features. Using it for a one-line fix is like using a full assembly line to make one sandwich.

Match the pipeline to the task:
- **One-line fix:** Implement, verify, commit. Three steps.
- **Small feature:** Plan, implement, verify, commit. Four steps.
- **Significant feature:** Full pipeline. All seven steps.
- **Architectural decision:** Research and plan only. Two steps. No implementation yet.

Each step consumes tokens. Skipping steps you don't need saves real resources.

### Monitor Token Usage

Pay attention to how many tokens your sessions consume. Look for patterns: are certain types of tasks expensive? Are long conversations drifting without progress? Is the same question getting re-asked because the context was lost?

Awareness alone changes behavior. You don't need to obsess over every token — just notice when something feels wasteful and adjust.

### Manage Extended Thinking Budget

Agents with extended thinking enabled reserve tokens for internal reasoning before responding. This is valuable for complex tasks (deep analysis, multi-step planning) but unnecessary for simple ones.

Being aware that thinking tokens have a cost helps you structure your requests. A complex question benefits from extended thinking. A simple "rename this variable" does not.

---

## Applying Post-Graduation

Understanding cost isn't just about MDH — it's a transferable skill that applies to any AI-assisted workflow.

### Any AI System Uses Models and Tokens

Whether you're using Claude Code directly, building your own AI tools, or evaluating AI services for your work, the same economics apply. Every AI interaction has a model, a token count, and a cost. The principles you've learned here — match model to task, keep context focused, write clear instructions — apply universally.

### Cost Thinking Is Resource Thinking

In any professional context, resources are finite. Time, money, attention, computing power. A graduated developer thinks about model routing the same way a manager thinks about team assignments:

- Don't assign your most expensive resource to routine work.
- Don't assign your cheapest resource to critical decisions.
- Match capability to requirement.
- Invest in quality where it matters most; optimize for efficiency everywhere else.

This isn't about being frugal — it's about being intentional. Understanding cost lets you make informed trade-offs instead of defaulting to either "always use the best" (wasteful) or "always use the cheapest" (risky).

### The Graduated Perspective

Before this knowledge, you were a consumer of AI — you used it and accepted whatever cost came with it. Now you understand the economics behind it. You can:

- Evaluate whether a tool is using models efficiently.
- Design your own workflows with cost-appropriate model routing.
- Make informed decisions about when to invest in deep reasoning vs. quick execution.
- Explain to others why different tasks warrant different levels of AI capability.

That shift — from passive consumer to informed practitioner — is what graduation means.
