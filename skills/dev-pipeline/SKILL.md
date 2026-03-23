---
name: dev-pipeline
description: "Activated when discussing the development process, pipeline steps, or when a user asks about how software gets built. Always available as reference."
origin: MDH
---

# The Development Pipeline

## The Big Picture

Building software is like building a house. You wouldn't start hammering nails before you have blueprints. You wouldn't wire the electricity before the walls are up. And you wouldn't move in before the building inspector signs off.

Professional software works the same way. It's built in deliberate steps, not frantic bursts. Each step produces something specific, and each step depends on the one before it.

**Why does order matter?** Because mistakes get more expensive the later you catch them. A typo in a blueprint costs an eraser. A typo in a finished wall costs a sledgehammer. In software, a design mistake caught during planning costs five minutes of conversation. The same mistake caught after the code is written costs hours of rewriting.

The pipeline is your assembly line. It turns a vague idea ("I want a website that tracks expenses") into reliable, working software. Every professional development team follows some version of this process. You're learning the real thing, not a toy version.

---

## The Seven Steps

### Step 1: Research

**What it is:** Find out what already exists before you build anything new.

**Why it matters:** The best code is code you never have to write. If someone already built a reliable solution, using it saves you days of work and gives you something battle-tested. Skipping research means you might spend a week building something that already exists as a free library.

**What happens during it:**
- Search GitHub for existing projects, templates, and code patterns
- Check package registries (npm, PyPI, etc.) for libraries that solve the problem
- Read documentation for tools and frameworks you might use
- Evaluate what you find: Is it maintained? Well-documented? Widely used?

**Who does what (varies by phase):**
- **Early phases (Observer/Follower):** Claude performs the research and explains what was found and why it matters. You learn what "good research" looks like by watching.
- **Middle phases (Contributor/Builder):** Claude guides the search strategy, but you help evaluate options and make decisions about what to use.
- **Late phases (Independent/Graduate):** You drive the research. Claude reviews your findings and fills gaps.

**How you'll know it's done:** You have a clear picture of what's available. You know whether you're building from scratch, using a library, or adapting an existing project. There are no obvious "did you check if X exists?" questions left unanswered.

---

### Step 2: Plan

**What it is:** Break the work into ordered, manageable pieces and get agreement before coding starts.

**Why it matters:** Coding without a plan is like driving without a map. You might eventually arrive, but you'll waste time on wrong turns, dead ends, and backtracking. Plans also prevent scope creep, which is when a project quietly grows from "add a login page" to "rebuild the entire app." Skipping planning is the number one cause of projects that stall or get abandoned.

**What happens during it:**
- Define the goal in plain language
- Break the work into phases, each producing something you can test
- Identify dependencies (what must come before what)
- Flag risks and unknowns
- Write down what "done" looks like for each phase
- **Wait for explicit user approval before proceeding**

**Who does what (varies by phase):**
- **Early phases:** Claude creates the plan and walks you through it. You approve, ask questions, or request changes.
- **Middle phases:** Claude drafts the plan, you actively evaluate and suggest modifications.
- **Late phases:** You create the plan. Claude reviews it for gaps and risks.

**How you'll know it's done:** There's a written plan with clear phases. You understand what will be built and in what order. You've explicitly approved the plan. Every phase has a definition of "done."

---

### Step 3: Implement

**What it is:** Build the actual code, writing tests first to define what the code should do before writing the code itself.

**Why it matters:** This is where the software actually gets created. But notice — it's step 3, not step 1. All the preparation up to this point makes implementation smoother and faster. Implementation follows the TDD (Test-Driven Development) method: write a test that describes what you want, then write the code that makes the test pass. This feels backwards at first, but it produces more reliable software. Skipping tests means bugs hide until real users find them.

**What happens during it:**
- Write a test that describes what the code should do
- Run the test — it should fail (because the code doesn't exist yet)
- Write just enough code to make the test pass
- Clean up the code without changing what it does
- Repeat for each piece of functionality

**Who does what (varies by phase):**
- **Early phases:** Claude writes both tests and code. You observe and ask questions about what you see.
- **Middle phases:** Claude writes tests and code. You specify what scenarios to cover and evaluate whether the output matches your intent.
- **Late phases:** You direct the full implementation — specifying requirements, choosing approaches, evaluating results. Claude executes to your specification.

**How you'll know it's done:** All tests pass. The code does what the plan said it should do. Test coverage meets the 80% target. The code is clean and readable.

---

### Step 4: Review

**What it is:** Check the quality of the code with fresh eyes, looking for problems that the original author might have missed.

**Why it matters:** When you build something, you develop blind spots. You know what the code is supposed to do, so you unconsciously read it that way. A reviewer sees what it actually does. Code review catches bugs, unclear naming, missing error handling, and design problems. Skipping review means shipping code that works by accident rather than by design.

**What happens during it:**
- Read through all changed code systematically
- Check for correctness: Does it do what it claims?
- Check for clarity: Could someone else understand this?
- Check for edge cases: What happens with unexpected input?
- Check for consistency: Does it follow the patterns used elsewhere?
- Flag issues by severity: Critical, High, Medium, Low

**Who does what (varies by phase):**
- **Early phases:** Claude performs the review and explains each finding. You learn what reviewers look for.
- **Middle phases:** You review alongside Claude. You try to spot issues before Claude points them out.
- **Late phases:** You perform the primary review. Claude acts as a second reviewer.

**How you'll know it's done:** All Critical and High issues are fixed. Medium issues are fixed where practical. The code is clean, readable, and follows established patterns. No obvious problems remain.

---

### Step 5: Secure

**What it is:** Check the code for security vulnerabilities — weaknesses that could let attackers steal data, break the system, or access things they shouldn't.

**Why it matters:** Security breaches are among the most expensive problems in software. A single leaked password database can destroy a company's reputation and trigger lawsuits. Most security holes come from simple, preventable mistakes: storing passwords in plain text, trusting user input without checking it, or accidentally including secret keys in the code. Skipping this step is like leaving your front door unlocked because "nobody would try it."

**What happens during it:**
- Check that no secrets (API keys, passwords, tokens) are hardcoded in the source
- Verify that all user input is validated before processing
- Confirm that database queries are protected against injection attacks
- Review authentication and authorization logic
- Check error messages to ensure they don't leak internal details
- Verify that sensitive data is encrypted where needed

**Who does what (varies by phase):**
- **Early phases:** Claude performs the security audit and explains common vulnerabilities in plain language.
- **Middle phases:** Claude runs the checklist, you learn to identify common patterns (like "never put a password directly in code").
- **Late phases:** You run the security checklist. Claude verifies nothing was missed.

**How you'll know it's done:** The security checklist is complete with no Critical findings. All secrets are stored safely (environment variables or secret managers, never in code). User input is validated. Error messages are safe to show publicly.

---

### Step 6: Verify

**What it is:** Run all automated checks — tests, linters, type checkers, build processes — to confirm everything works together.

**Why it matters:** Individual pieces can work perfectly alone but break when combined. Verification catches integration problems, type mismatches, formatting inconsistencies, and build failures before they reach users. Think of it as the final inspection before a car leaves the factory. Skipping verification means shipping software that might crash on the first user interaction.

**What happens during it:**
- Run the full test suite (unit, integration, and E2E tests)
- Run the linter (a tool that checks for code style and common mistakes)
- Run the type checker (if the language supports it)
- Build the project to confirm it compiles/bundles correctly
- Verify test coverage meets the 80% threshold
- Fix any failures before proceeding

**Who does what (varies by phase):**
- **Early phases:** Claude runs all checks and explains the output. You learn to read test results and error messages.
- **Middle phases:** You initiate verification runs. Claude helps interpret results and categorize any failures.
- **Late phases:** You decide what to verify, interpret results, and direct Claude to fix failures. You know which failures are critical and which can wait.

**How you'll know it's done:** All tests pass. Linter reports no errors. Type checker reports no errors. The project builds successfully. Coverage is at or above 80%.

---

### Step 7: Commit

**What it is:** Record the completed work in version control (git), creating a permanent, labeled snapshot of what changed and why.

**Why it matters:** Version control is your undo button for the entire project. Every commit is a save point you can return to if something goes wrong later. Good commit messages are a diary of the project's evolution — six months from now, you (or someone else) can read the history and understand not just what changed, but why. Skipping proper commits means losing the ability to track, undo, or understand changes.

**What happens during it:**
- Review what files have changed
- Stage the appropriate files (not everything — be selective)
- Write a clear commit message following the conventional format
- Verify the commit succeeded
- Push to the remote repository if appropriate

**Who does what (varies by phase):**
- **Early phases:** Claude handles the commit process and explains each part. You learn what a good commit message looks like.
- **Middle phases:** You write or approve the commit message. Claude handles the git commands.
- **Late phases:** You decide when to commit, what to include, and approve the message. Claude handles the mechanics.

**How you'll know it's done:** The commit exists in the git history with a clear, descriptive message. The working directory is clean (no uncommitted changes for the completed work). The remote repository is updated if applicable.

---

## Full Pipeline vs. Shortcuts

Not every change needs the full seven-step treatment. The pipeline is designed to scale with the size and risk of the work.

### Full pipeline (all seven steps):
- Multi-file features or new functionality
- Changes that affect how users interact with the system
- Anything involving security-sensitive code (authentication, payments, data handling)
- Work that multiple people depend on

### Shortened pipeline (skip or abbreviate some steps):
- Single-line bug fixes (skip formal planning, abbreviate research)
- Documentation updates (skip security, abbreviate review)
- Formatting or style changes (skip research and planning)
- Dependency version bumps (abbreviate most steps)

**The rule of thumb:** If a mistake would take more than five minutes to fix, use the full pipeline. If you could fix it in under a minute, a shortcut is fine.

Phase-based enforcement determines the minimum pipeline requirements at each learning stage. Early phases require the full pipeline more often, because the goal is learning the process. Later phases trust you to judge when shortcuts are appropriate.

---

## Pipeline as Learning Path

Each step in the pipeline maps to a skill you're developing. Mastering these skills is what moves you from Observer (Phase 0) to Graduate (Phase 5).

| Pipeline Step | Core Skill Being Developed | Competence Dimension |
|---|---|---|
| Research | Evaluating existing solutions, reading documentation | Tool Proficiency, Architecture Awareness |
| Plan | Breaking problems into pieces, identifying risks | Decomposition, Architecture Awareness |
| Implement | Writing code, understanding tests, TDD workflow | Code Literacy, Testing Competence |
| Review | Reading code critically, spotting problems | Code Literacy, Quality Awareness |
| Secure | Recognizing vulnerability patterns, safe practices | Security Awareness |
| Verify | Running tools, interpreting output, diagnosing failures | Tool Proficiency, Debugging Skill |
| Commit | Version control, clear communication | Git Proficiency, Communication |

You don't have to master all seven steps at once. Each phase focuses on specific steps, gradually expanding your responsibility. By the time you reach Graduate level, you can run the full pipeline independently.

---

## Model Routing

Behind the scenes, different AI models handle different steps. This is like using the right tool for the job — you wouldn't use a sledgehammer to hang a picture frame.

**Opus (most powerful reasoning):** Used for planning, architectural decisions, and complex problem-solving. When the work requires deep thinking about trade-offs, structure, and strategy, Opus provides the most thorough analysis. Think of it as the senior architect who designs the blueprint.

**Sonnet (best coding model):** Used for implementation, code review, and the bulk of development work. Sonnet excels at writing code, spotting bugs, and understanding complex codebases. Think of it as the skilled craftsperson who builds what the architect designed.

**Haiku (fast and efficient):** Used for mechanical tasks like documentation, formatting, and repetitive operations. Haiku is significantly cheaper to run and handles straightforward work quickly. Think of it as the efficient assistant who handles routine paperwork.

You don't need to worry about model routing — the system handles it automatically. But understanding it helps explain why some operations feel faster than others, and why certain tasks produce more detailed responses. The system matches the power of the tool to the difficulty of the job, keeping costs reasonable while ensuring quality where it matters most.
