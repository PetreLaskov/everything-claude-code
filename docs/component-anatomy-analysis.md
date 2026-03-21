# Component Anatomy Analysis: ECC Harness Micro-Level Patterns

**Purpose:** Extract the tacit knowledge encoded in ECC's agent, skill, and command definitions so that meta-harness-engine can generate ECC-grade components for arbitrary domains.

**Methodology:** Read all 18 agents, 15+ diverse skills (dev, business, content, research, security, meta/configuration), all 47 commands, and the CONTRIBUTING.md template guidelines. This analysis is grounded in quoted examples from the actual files.

---

## 1. Anatomy of an Excellent Agent Definition

### 1.1 YAML Frontmatter Structure

Every agent has exactly four required fields:

```yaml
---
name: lowercase-hyphenated-identifier
description: [role] + [trigger condition]. Use PROACTIVELY when [situation].
tools: ["Read", "Grep", "Glob"]   # minimum viable set
model: sonnet                      # opus | sonnet | haiku
---
```

**Optional fields** observed in newer agents:
- `color: teal` (harness-optimizer, loop-operator)

#### The `description` field is the most critical field

The description serves as the **trigger condition** -- it tells Claude's routing system WHEN to invoke this agent. The best descriptions follow a three-part formula:

**Part 1: Role identity** -- what the agent IS:
> "Software architecture specialist for system design, scalability, and technical decision-making."

**Part 2: Activation trigger** -- when to invoke:
> "Use PROACTIVELY when planning new features, refactoring large systems, or making architectural decisions."

**Part 3: Scope boundaries** (in stronger descriptions):
> "Fixes build/type errors only with minimal diffs, no architectural edits. Focuses on getting the build green quickly." (build-error-resolver)

The word **"PROACTIVELY"** appears in 9 of 18 agents. This is a deliberate prompt engineering pattern -- it tells the orchestrating model to invoke the agent WITHOUT the user explicitly requesting it when the conditions match. The phrase **"MUST BE USED"** appears in reviewers (code-reviewer, go-reviewer, kotlin-reviewer, python-reviewer) to make invocation non-optional.

**Trigger density spectrum:**

| Pattern | Example | Effect |
|---------|---------|--------|
| PROACTIVELY | architect, tdd-guide, security-reviewer | Auto-invoke on matching conditions |
| MUST BE USED | code-reviewer, go-reviewer | Non-optional for matching file types |
| Use when | chief-of-staff, loop-operator | Invoke on explicit user request |

### 1.2 System Prompt Organization

The body of every agent follows a consistent information architecture with these layers:

#### Layer 1: Role Declaration (1-2 sentences)
Always starts with "You are a [senior/expert] [role] [focused on/specializing in] [domain]."

Examples:
- `"You are a senior software architect specializing in scalable, maintainable system design."`
- `"You are an expert build error resolution specialist. Your mission is to get builds passing with minimal changes."`
- `"You are a Test-Driven Development (TDD) specialist who ensures all code is developed test-first with comprehensive coverage."`

The role declaration always uses **second person** ("You are") and **present tense**. It sets identity, not instructions.

#### Layer 2: Core Responsibilities (bulleted list, 4-6 items)
Under "## Your Role" or "## Core Responsibilities":

```markdown
## Core Responsibilities

1. **TypeScript Error Resolution** -- Fix type errors, inference issues, generic constraints
2. **Build Error Fixing** -- Resolve compilation failures, module resolution
3. **Dependency Issues** -- Fix import errors, missing packages, version conflicts
```

This section uses **bold keyword + dash + elaboration** format consistently. Numbered for priority-ranked lists, bulleted for equal-priority lists.

#### Layer 3: Diagnostic Commands (optional, task-specific)
Agents that operate on codebases include a concrete "## Diagnostic Commands" section with actual bash commands:

```bash
npx tsc --noEmit --pretty
go build ./...
go vet ./...
```

This is a pattern that grounds the agent in real tooling rather than abstract instructions.

#### Layer 4: Workflow (numbered steps, always sequential)
Under "## Workflow" or "## Review Process", typically 3-6 numbered phases:

```markdown
### 1. Collect All Errors
### 2. Fix Strategy (MINIMAL CHANGES)
### 3. Common Fixes
```

Key observation: workflows are ALWAYS numbered, NEVER bulleted. The numbering implies sequence and prevents the model from parallelizing steps that should be sequential.

#### Layer 5: Domain Knowledge (tables, patterns, checklists)
Structured reference material specific to the agent's domain:

- **Lookup tables** for error-to-fix mappings (build-error-resolver, go-build-resolver)
- **Severity-rated checklists** for reviewers (CRITICAL > HIGH > MEDIUM > LOW)
- **Anti-pattern lists** for architects and reviewers
- **Code examples** showing BAD vs GOOD patterns (always paired)

#### Layer 6: DO/DON'T Boundaries
Explicit scope constraints:

```markdown
## DO and DON'T

**DO:**
- Add type annotations where missing
- Fix imports/exports

**DON'T:**
- Refactor unrelated code
- Change architecture
- Rename variables (unless causing error)
```

This is critical for agent containment. Without explicit DON'T boundaries, agents tend to expand scope.

#### Layer 7: Exit Conditions and Handoffs
When to stop and where to redirect:

```markdown
## When NOT to Use
- Code needs refactoring -> use `refactor-cleaner`
- Architecture changes needed -> use `architect`
- New features required -> use `planner`
```

This creates a routing mesh -- each agent knows its own limits AND which other agent handles the overflow case.

#### Layer 8: Success Metrics (quantitative when possible)
```markdown
## Success Metrics
- `npx tsc --noEmit` exits with code 0
- `npm run build` completes successfully
- Minimal lines changed (< 5% of affected file)
```

#### Layer 9: Closing Principle (bold, 1-2 sentences)
```markdown
**Remember**: Fix the error, verify the build passes, move on. Speed and precision over perfection.
```

Every agent ends with a memorable principle that encodes its core philosophy. This acts as a "north star" instruction that survives long context.

### 1.3 Agent Archetypes

From analyzing all 18 agents, four distinct archetypes emerge:

| Archetype | Examples | Characteristics |
|-----------|----------|----------------|
| **Planner/Architect** | planner, architect | Read-only tools, opus model, produces plans not code, waits for confirmation |
| **Implementer/Fixer** | build-error-resolver, go-build-resolver, tdd-guide, refactor-cleaner | Full tool access, sonnet model, produces code changes, measures success by passing builds/tests |
| **Reviewer** | code-reviewer, go-reviewer, kotlin-reviewer, python-reviewer, security-reviewer, database-reviewer | Read + Bash tools (no Write/Edit), sonnet model, produces findings not changes, severity-rated output |
| **Operator** | loop-operator, harness-optimizer, chief-of-staff | Mixed tools, handles meta-workflows, monitors and intervenes |

### 1.4 Information Density

Agent files range from 36 lines (loop-operator) to 212 lines (architect). The sweet spot is 80-120 lines. Beyond 150 lines, agents include extensive code examples (code-reviewer at 238 lines).

Density rule of thumb:
- **Role + Responsibilities**: ~10% of file
- **Workflow**: ~20% of file
- **Domain Knowledge (tables, patterns, examples)**: ~50% of file
- **Boundaries + Metrics + Principle**: ~20% of file

---

## 2. Anatomy of an Excellent Skill Definition

### 2.1 Frontmatter Structure

```yaml
---
name: lowercase-hyphenated-name
description: [what it covers] + [when to use it]. Use when [trigger].
origin: ECC
---
```

Skills have three fields vs agents' four. Notably, skills have NO `tools` or `model` field -- they are pure knowledge, not executable agents. The `origin` field is always `ECC` for first-party skills.

### 2.2 How Skills Differ from Agents

This is the most important architectural distinction in ECC:

| Dimension | Agent | Skill |
|-----------|-------|-------|
| **Nature** | Executable actor | Reference knowledge |
| **Invocation** | Via Task tool, gets its own context window | Loaded into calling agent's context |
| **Tools** | Explicitly scoped | None (inherits caller's tools) |
| **Model** | Explicitly assigned | None (uses caller's model) |
| **Persistence** | Lives for one task | Persists across session |
| **Role** | Does work | Informs work |
| **File structure** | `agents/name.md` (flat file) | `skills/name/SKILL.md` (directory) |

A skill is a **knowledge module** that gets injected into context when conditions match. An agent is a **work-performing actor** that gets its own isolated context window and tool permissions.

The key insight: skills provide the "what to know" and agents provide the "what to do." The `tdd-guide` agent references the `tdd-workflow` skill. The `database-reviewer` agent references the `postgres-patterns` skill. This separation means knowledge can be updated independently from behavior.

### 2.3 "When to Activate" Section

Every skill has a "## When to Activate" section with 4-7 bullet points describing trigger conditions. This section uses natural-language pattern matching to help Claude decide when to load the skill.

**Pattern 1: Action-oriented triggers** (most common):
```markdown
## When to Activate
- Writing new Go code
- Reviewing Go code
- Refactoring existing Go code
- Designing Go packages/modules
```

**Pattern 2: Situation-oriented triggers** (business skills):
```markdown
## When to Activate
- researching a market, category, company, investor, or technology trend
- building TAM/SAM/SOM estimates
- comparing competitors or adjacent products
- pressure-testing a thesis before building, funding, or entering a market
```

**Pattern 3: Keyword triggers** (deep-research):
```markdown
- User says "research", "deep dive", "investigate", or "what's the current state of"
```

This last pattern is particularly effective -- it explicitly lists the natural-language phrases that should trigger activation, leaving no ambiguity for the routing model.

### 2.4 Knowledge Architecture Within Skills

Skills follow a layered knowledge structure, from abstract to concrete:

#### Layer 1: Principles (the "why")
```markdown
## Core Principles
### 1. Simplicity and Clarity
Go favors simplicity over cleverness. Code should be obvious and easy to read.
```

2-4 foundational principles, stated as declarative truths.

#### Layer 2: Patterns (the "what")
Named, categorized patterns with code examples:
```markdown
### Error Wrapping with Context
### Worker Pool
### Functional Options Pattern
```

Each pattern gets: name, 1-sentence explanation, full code example.

#### Layer 3: Anti-patterns (the "what NOT to do")
Always paired with the correct pattern:
```go
// Bad: Ignoring error with blank identifier
result, _ := doSomething()

// Good: Handle or explicitly document
result, err := doSomething()
```

The BAD/GOOD pairing appears in every technical skill. It is never just BAD without GOOD.

#### Layer 4: Quick Reference (lookup tables)
Condensed reference for in-context retrieval:
```markdown
| Idiom | Description |
|-------|-------------|
| Accept interfaces, return structs | Functions accept interface params, return concrete types |
```

#### Layer 5: Tooling Integration
Concrete commands for the ecosystem:
```bash
go vet ./...
staticcheck ./...
golangci-lint run
```

#### Layer 6: Cross-references
Links to related components:
```markdown
## Related
- Agent: `database-reviewer` - Full database review workflow
- Skill: `backend-patterns` - API and backend patterns
```

### 2.5 Skill Archetypes

| Archetype | Examples | Structure |
|-----------|----------|-----------|
| **Language Pattern Library** | golang-patterns, python-patterns, kotlin-patterns | Principles -> Patterns -> Anti-patterns -> Tooling |
| **Workflow Guide** | tdd-workflow, autonomous-loops, verification-loop | When to Use -> Steps -> Variations -> Choosing |
| **Domain Reference** | postgres-patterns, api-design, e2e-testing | Concepts -> Quick Reference Tables -> Config Templates |
| **Business Playbook** | market-research, investor-materials, content-engine | Standards -> Modes/Types -> Output Format -> Quality Gate |
| **Meta/Configuration** | configure-ecc, search-first | Prerequisites -> Interactive Steps -> Troubleshooting |

### 2.6 Skill Length and Density

Skills range from 76 lines (market-research) to 675 lines (golang-patterns). Business skills tend to be shorter (76-97 lines) and rely on prose. Technical skills tend to be longer (400-675 lines) and are dominated by code examples.

The CONTRIBUTING.md guideline says "under 500 lines" but several first-party skills exceed this (golang-patterns: 675, python-patterns: 751, autonomous-loops: 613). The actual constraint seems to be: keep each skill under the point where it would consume a significant fraction of context when loaded.

### 2.7 Quality Gate Pattern

Business and content skills consistently end with a "## Quality Gate" section:

```markdown
## Quality Gate

Before delivering:
- every number matches the current source of truth
- use of funds and revenue layers sum correctly
- assumptions are visible, not buried
- the story is clear without hype language
- the final asset is defensible in a partner meeting
```

This pattern is the business-domain equivalent of the "Success Metrics" section in technical agents. It defines completion criteria BEFORE work begins.

---

## 3. Anatomy of an Excellent Command Definition

### 3.1 Frontmatter Structure

Commands have the simplest frontmatter -- just a `description`:

```yaml
---
description: Enforce test-driven development workflow. Scaffold interfaces, generate tests FIRST, then implement minimal code to pass. Ensure 80%+ coverage.
---
```

Some commands also have `name` and `allowed_tools` (skill-create), but most use only `description`.

### 3.2 How Commands Differ from Agents

A command is an **invocation layer** that sits between the user and agent(s):

| Dimension | Command | Agent |
|-----------|---------|-------|
| **Triggered by** | User types `/command-name` | System routing or command delegation |
| **Contains** | Instructions for orchestration | System prompt for execution |
| **Complexity** | Can chain multiple agents | Single-agent scope |
| **Arguments** | `$ARGUMENTS` parameter | Receives task context |
| **Examples** | Shows full session dialogue | Shows domain patterns |

Commands answer "what happens when the user says X?" Agents answer "how does this role behave?"

### 3.3 Command Complexity Spectrum

From analyzing all 47 commands, three complexity tiers emerge:

#### Tier 1: Direct Agent Delegation (simplest)
The command is essentially a named shortcut to invoke a specific agent.

**Example: `/plan`**
```markdown
This command invokes the **planner** agent to create a comprehensive implementation plan.
```

The command body contains: purpose, when-to-use, how-it-works, example session, integration notes. It adds value beyond raw agent invocation by providing user-facing documentation and example workflows.

#### Tier 2: Orchestrated Workflow (medium)
The command chains multiple agents in sequence.

**Example: `/orchestrate`**
```markdown
### feature
Full feature implementation workflow:
planner -> tdd-guide -> code-reviewer -> security-reviewer
```

Includes handoff document format between agents, parallel execution patterns, and final report format.

#### Tier 3: Parameterized Meta-Commands (complex)
The command accepts arguments and routes to different behaviors.

**Example: `/verify`**
```markdown
$ARGUMENTS can be:
- `quick` - Only build + types
- `full` - All checks (default)
- `pre-commit` - Checks relevant for commits
- `pre-pr` - Full checks plus security scan
```

**Example: `/harness-audit`**
```markdown
`/harness-audit [scope] [--format text|json]`
- `scope` (optional): `repo` (default), `hooks`, `skills`, `commands`, `agents`
```

### 3.4 Command Information Architecture

Commands follow this consistent structure:

1. **Title** (H1, descriptive name)
2. **One-line purpose** (what this command does)
3. **"What This Command Does"** (numbered list, 3-6 items)
4. **"When to Use"** (bulleted conditions)
5. **"How It Works"** (numbered steps, maps to agent workflow)
6. **"Example Usage"** (full annotated dialogue showing input and output)
7. **Integration notes** (which other commands to combine with)
8. **"Related Agents"** (links back to agent file)

The example usage section is particularly notable -- it shows a complete simulated session with the user's input AND the agent's full response. This serves as both documentation and as a few-shot prompt that shapes the agent's output format.

### 3.5 The `$ARGUMENTS` Pattern

Several commands accept positional arguments via `$ARGUMENTS`. This is a Claude Code framework feature where user input after the slash command is passed as a variable:

```markdown
## Arguments

$ARGUMENTS:
- `feature <description>` - Full feature workflow
- `bugfix <description>` - Bug fix workflow
```

Commands document this at the bottom, after all the behavioral content, keeping the user-facing documentation clean.

---

## 4. Tool-Scoping Principles

### 4.1 The Permission Matrix

From analyzing all 18 agents:

| Tool Combination | Agents | Rationale |
|-----------------|--------|-----------|
| Read, Grep, Glob (read-only) | architect, planner | Planning/analysis roles must NEVER modify code; their value is in assessment, not action |
| Read, Grep, Glob, Bash | code-reviewer, go-reviewer, kotlin-reviewer, python-reviewer | Reviewers can RUN diagnostic commands (go vet, tsc) but cannot EDIT code; they report findings |
| Read, Write, Edit, Bash, Grep, Glob (full access) | build-error-resolver, e2e-runner, security-reviewer, database-reviewer, doc-updater, refactor-cleaner, tdd-guide | Implementers and fixers need full write access to make changes |
| Read, Write, Edit, Grep, Glob (no Bash) | tdd-guide (note: has Bash removed but has Write) | Interesting edge case |
| Read, Grep, Glob, Bash, Edit (no Write) | harness-optimizer, loop-operator | Can modify existing files but not create new ones |

### 4.2 The Underlying Principles

1. **Planners get no write access.** The architect and planner are read-only because their job is to THINK, not to ACT. Giving them write access would tempt them to implement during planning.

2. **Reviewers get no edit access.** code-reviewer, go-reviewer, kotlin-reviewer, and python-reviewer can READ and RUN commands but cannot MODIFY files. This is the digital equivalent of "you can look but not touch" -- it ensures review findings are reported to the user, not silently fixed.

3. **Fixers get everything.** build-error-resolver, refactor-cleaner, and e2e-runner need full access because their job is to make concrete changes and verify them.

4. **Bash access implies runtime.** Agents with Bash can run builds, tests, linters, and other tools. Agents without Bash are purely file-based.

5. **Write vs Edit distinction.** `Write` creates new files; `Edit` modifies existing ones. Some agents (harness-optimizer) can Edit but not Write, preventing them from creating new files while allowing modifications to existing configuration.

---

## 5. Model-Routing Principles

### 5.1 The Routing Table

| Model | Agents | Task Characteristics |
|-------|--------|---------------------|
| **opus** | architect, planner, chief-of-staff | Ambiguous requirements, architectural decisions, deep reasoning, multi-step planning, trade-off analysis |
| **sonnet** | build-error-resolver, code-reviewer, database-reviewer, e2e-runner, go-build-resolver, go-reviewer, harness-optimizer, kotlin-build-resolver, kotlin-reviewer, loop-operator, python-reviewer, refactor-cleaner, security-reviewer, tdd-guide | Implementation, code review, error fixing, testing, mechanical reasoning |
| **haiku** | doc-updater | Structured output from structured input, low-creativity tasks, high-frequency invocation |

### 5.2 The Decision Framework

**Use opus when:**
- The task is fundamentally about DECIDING, not DOING
- Trade-offs need to be evaluated (architect: "For each design decision, document Pros, Cons, Alternatives, Decision")
- Requirements are ambiguous and need interpretation (planner: "Ask clarifying questions if needed")
- The output will guide significant downstream work
- Cross-domain reasoning is required (chief-of-staff: triaging across email, Slack, LINE, Messenger)

**Use sonnet when:**
- The task has clear inputs and expected outputs
- The work is bounded and measurable (build passes, tests pass, review complete)
- Code needs to be written, fixed, or reviewed
- The task is primarily pattern-matching against known patterns
- Speed matters (most agents are sonnet because they run frequently)

**Use haiku when:**
- The task is primarily structural/formatting
- Input and output formats are well-defined
- Creativity requirements are minimal
- The agent will be invoked very frequently (cost sensitivity)
- The task can be described as "transform X into Y using template Z"

Only 1 of 18 agents uses haiku (doc-updater). This suggests ECC errs on the side of capability over cost savings. The `model-route` command explicitly states the heuristic: "haiku: deterministic, low-risk mechanical changes."

### 5.3 Cost-Routing Integration

The ECC rules file `performance.md` provides the broader framework:

> **Haiku 4.5** (90% of Sonnet capability, 3x cost savings): Lightweight agents with frequent invocation, pair programming, worker agents in multi-agent systems.
>
> **Sonnet 4.6** (Best coding model): Main development work, orchestrating multi-agent workflows, complex coding tasks.
>
> **Opus 4.5** (Deepest reasoning): Complex architectural decisions, maximum reasoning requirements, research and analysis tasks.

---

## 6. Trigger Description Patterns

### 6.1 Agent Description Triggers

Agent descriptions use these linguistic patterns to ensure correct invocation:

**Pattern 1: "Use PROACTIVELY when"** (9/18 agents)
```
description: Expert code review specialist. [...] Use PROACTIVELY after writing or modifying code.
```
This pattern is for agents that should be invoked BY THE SYSTEM without user request.

**Pattern 2: "MUST BE USED for"** (4/18 agents)
```
description: Expert Go code reviewer [...]. MUST BE USED for Go projects.
```
This creates a mandatory association between file type/project type and agent.

**Pattern 3: "Use when"** (5/18 agents)
```
description: Operate autonomous agent loops [...]. Use when managing multi-channel communication workflows.
```
This is a softer trigger for agents that require explicit user intent.

### 6.2 Skill "When to Activate" Triggers

Skills use a more detailed trigger section. The most effective patterns:

**Pattern A: Verb-object pairs**
```markdown
- Writing new Go code
- Reviewing Go code
- Designing Go packages/modules
```

**Pattern B: Situational descriptions**
```markdown
- Starting a new feature that likely has existing solutions
- Adding a dependency or integration
- Before creating a new utility, helper, or abstraction
```

**Pattern C: Explicit keyword matching**
```markdown
- User says "research", "deep dive", "investigate", or "what's the current state of"
```

**Pattern D: Negative triggers (when NOT to use)**
```markdown
## When NOT to Use
- During active feature development
- Right before production deployment
- Without proper test coverage
```

### 6.3 Trigger Description Quality Indicators

The most effective trigger descriptions share these qualities:

1. **Specificity over abstraction**: "Fix build errors, go vet issues, and linter warnings" beats "Handle Go build problems"
2. **Include the scope boundary**: "with minimal changes" in build-error-resolver prevents scope creep
3. **Name the explicit handoff**: "Fixes build/type errors only -- no architectural edits" tells the router what this agent does NOT do
4. **Use file-type markers**: "MUST BE USED for Go projects" creates file-extension-based routing

---

## 7. Information Architecture Within Each Component Type

### 7.1 The Layered Knowledge Model

All three component types (agents, skills, commands) follow a consistent layering pattern, but at different densities:

```
         AGENTS              SKILLS              COMMANDS
         ------              ------              --------
Layer 1: Identity           Overview            Purpose
Layer 2: Responsibilities   When to Activate    What It Does
Layer 3: Workflow           Principles          When to Use
Layer 4: Domain Knowledge   Patterns/Examples   How It Works
Layer 5: Boundaries         Anti-patterns       Example Session
Layer 6: Success Metrics    Quick Reference     Integration
Layer 7: Closing Principle  Cross-references    Related Agents
```

### 7.2 The Density Gradient

- **Agents** are densest in workflow and boundaries (they need precise behavioral guardrails)
- **Skills** are densest in domain knowledge and examples (they are reference material)
- **Commands** are densest in example sessions and integration (they are user-facing documentation)

### 7.3 The Consistent Patterns Across All Types

**The BAD/GOOD pair**: Every technical component uses paired examples showing the wrong way and the right way. Never just one.

**The severity hierarchy**: CRITICAL > HIGH > MEDIUM > LOW appears in all reviewers, all security skills, and the verification command.

**The closing principle**: A single bold sentence at the end encoding the core philosophy:
- Agent: `"**Remember**: Fix the error, verify the build passes, move on."`
- Skill: `"**Remember**: Go code should be boring in the best way."`
- Command: `"Never approve code with security vulnerabilities!"`

**The cross-reference mesh**: Every component links to related components:
- Agents reference skills they draw knowledge from
- Commands reference agents they invoke
- Skills reference agents that use them
- Commands reference other commands in workflows

This creates a navigable graph where no component is an island.

### 7.4 What Makes Business/Non-Dev Components Different

Business skills (market-research, investor-materials, content-engine, article-writing) differ from dev skills in several structural ways:

1. **No code examples** -- replaced by prose checklists and output format templates
2. **Quality Gate replaces Success Metrics** -- subjective criteria ("the recommendation follows from the evidence") vs objective criteria ("tests pass")
3. **"Golden Rule" pattern** -- investor-materials opens with "All investor materials must agree with each other" as a non-negotiable principle
4. **"Banned Patterns" section** -- article-writing explicitly lists phrases to never generate ("In today's rapidly evolving landscape")
5. **Shorter files** -- business skills average 80-100 lines vs 400-600 for technical skills
6. **First-person perspective shifts** -- content-engine asks clarifying questions ("what are we adapting from"), making the skill more interactive

---

## 8. Synthesis: The Meta-Template

From this analysis, the meta-harness-engine should generate components using these templates:

### Agent Generation Template
```
FRONTMATTER:
  name: {domain}-{role}
  description: {1-sentence role} + {trigger phrase with PROACTIVELY/MUST BE USED/Use when}
  tools: {minimum viable set for the task}
  model: {opus for planning/deciding, sonnet for doing/reviewing, haiku for formatting}

BODY:
  1. Role declaration (You are a {seniority} {role} {focus area})
  2. Core responsibilities (4-6 items, bold-dash format)
  3. [If applicable] Diagnostic commands (real executable commands)
  4. Workflow (3-6 numbered phases)
  5. Domain knowledge (tables, paired BAD/GOOD examples)
  6. DO/DON'T boundaries (explicit scope constraints)
  7. Exit conditions and handoffs to other agents
  8. Success metrics (quantitative when possible)
  9. Closing principle (bold, memorable, 1-2 sentences)
```

### Skill Generation Template
```
FRONTMATTER:
  name: {domain-topic}
  description: {what it covers}. Use when {trigger conditions}.
  origin: {source}

BODY:
  1. Title and 1-sentence overview
  2. When to Activate (4-7 trigger conditions)
  3. Core Principles (2-4 foundational truths)
  4. Patterns with examples (named, categorized)
  5. Anti-patterns (always paired with correct pattern)
  6. Quick reference tables
  7. Tooling integration (concrete commands)
  8. Quality Gate / Success Criteria
  9. Cross-references to related components
```

### Command Generation Template
```
FRONTMATTER:
  description: {imperative verb} + {what} + {constraints}

BODY:
  1. Title (H1)
  2. What This Command Does (3-6 numbered items)
  3. When to Use (bulleted conditions)
  4. How It Works (numbered steps)
  5. Example Usage (full simulated session with input AND output)
  6. Integration with Other Commands
  7. Related Agents
  8. [If applicable] $ARGUMENTS documentation
```

---

## 9. Key Findings for Meta-Harness-Engine

1. **The three-way split (agent/skill/command) is load-bearing.** Collapsing them into one format would lose the separation between knowledge, behavior, and invocation.

2. **Description fields are routing instructions, not documentation.** They must contain activation signals (PROACTIVELY, MUST BE USED, "Use when"), scope boundaries, and explicit handoff points.

3. **Tool scoping encodes trust architecture.** Read-only for thinkers, full access for doers, no-edit for reviewers. This is not arbitrary -- it prevents role confusion.

4. **Model routing follows a simple heuristic.** Deciding = opus. Doing = sonnet. Formatting = haiku. The heuristic is based on reasoning depth required, not task complexity.

5. **Every component ends with a principle.** This is a prompt engineering technique -- the last thing the model reads has disproportionate influence on behavior.

6. **BAD/GOOD pairs are universal.** Every technical component uses paired examples. The meta-harness-engine must generate these pairs for any domain.

7. **The cross-reference mesh creates emergent routing.** Each component knows what it does NOT handle and where to redirect. This creates a self-organizing system where gaps are explicitly addressed.

8. **Business skills are structurally different from dev skills.** They use Quality Gates instead of Success Metrics, Banned Patterns instead of Anti-patterns, and prose instead of code examples. The meta-harness-engine needs separate templates for knowledge-work vs engineering domains.

9. **The "When to Activate" section is the most important section in a skill.** If Claude cannot determine when to load the skill, the skill is useless regardless of its content quality.

10. **Workflow steps must be numbered, not bulleted.** This prevents the model from parallelizing sequential steps. It is a consistent pattern across all 18 agents and all commands.
