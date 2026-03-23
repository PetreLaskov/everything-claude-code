---
name: research-patterns
description: "Activated when the research step of the pipeline is active, when a user is about to start building something new, or when discussing whether to build vs. reuse existing solutions."
origin: MDH
---

# Research Patterns

## Why Research Comes First

The best code is code you don't write.

Think of it like IKEA. You need a bookshelf. You could buy raw lumber, design the shelf yourself, cut every piece, sand them, drill holes, and assemble it from scratch. Or you could go to IKEA, find a bookshelf that fits your space, and spend an afternoon assembling something that thousands of people have already proven works.

Neither approach is wrong. But if you go straight to the lumber yard without checking whether a perfectly good bookshelf already exists, you've wasted time, money, and effort reinventing something that's already been invented.

Professional developers spend a surprising amount of time searching before coding. A senior engineer might spend 30 minutes to an hour researching before writing a single line of code. This isn't laziness — it's efficiency. They know that:

- **Someone has probably solved this before.** Most problems in software aren't unique. Authentication, form validation, data visualization, file uploads — these have all been solved thousands of times.
- **Battle-tested solutions are more reliable.** A library used by 50,000 projects has had its bugs found and fixed by thousands of contributors. Your from-scratch version has been tested by exactly one person: you.
- **Reinventing the wheel is expensive.** Writing, testing, debugging, and maintaining custom code for a solved problem costs hours that could go toward the parts of your project that actually are unique.

Research isn't a preliminary chore — it's the step that determines whether your project takes a week or a month.

---

## The Research Hierarchy

Not all sources of information are equally useful. Search in this order, and only move to the next level when the previous one didn't give you what you need.

### Level 1: GitHub Code Search (Start Here)

**What it is:** GitHub is where most open-source software lives. Searching GitHub means looking through millions of real projects for code, templates, and patterns.

**How to use it:**
- `gh search repos` — Find entire projects that do something similar to what you need
- `gh search code` — Find specific code patterns or implementations within projects

**Why it's first:** GitHub shows you real, working code in real projects. You can see how experienced developers solved the same problem, read their tests, check their documentation, and often use their code directly.

**What to look for:**
- Projects with many stars (a star is like a bookmark — more stars usually means more people found it useful)
- Recent activity (commits in the last few months means it's actively maintained)
- Good documentation (a README that explains how to use it)
- Tests (projects with tests are more reliable)

### Level 2: Library Documentation

**What it is:** Official documentation for programming libraries, frameworks, and tools. This is the instruction manual written by the people who built the tool.

**How to use it:** Read the official docs for any library or framework you're considering. Look for getting-started guides, API references, and example code.

**Why it's second:** Once you've found a promising library on GitHub, the official docs tell you exactly how to use it correctly. They cover edge cases, configuration options, and best practices that you won't find anywhere else.

**What to look for:**
- Getting-started tutorials (can you get a basic example working quickly?)
- API documentation (is every feature clearly explained?)
- Migration guides (if you're upgrading or switching from something else)
- Version-specific details (does the documentation match the version you're using?)

### Level 3: Package Registries

**What it is:** Package registries are like app stores for code libraries. Each programming language has one or more:
- **npm** — JavaScript/TypeScript packages
- **PyPI** — Python packages
- **crates.io** — Rust packages
- **Go modules** — Go packages
- **RubyGems** — Ruby packages
- **NuGet** — .NET packages

**How to use it:** Search the registry for your programming language using keywords that describe what you need (e.g., "date formatting," "CSV parser," "email validation").

**Why it's third:** Registries let you discover libraries you didn't know existed. They also show download counts, which tell you how widely used a package is. A package with millions of weekly downloads is almost certainly more reliable than one with 12.

**What to look for:**
- Download counts (higher = more trusted by the community)
- Last published date (recent = actively maintained)
- Number of dependencies (fewer = simpler, less risk of conflicts)
- License (make sure you're legally allowed to use it for your project)

### Level 4: Web Search (Last Resort)

**What it is:** General web searching for articles, blog posts, tutorials, and discussions.

**Why it's last:** The web is full of outdated tutorials, incorrect answers, and opinions disguised as facts. It's useful when the first three levels don't have what you need, but treat results with more skepticism.

**When to use it:**
- The problem is unusual or domain-specific
- You need to understand a concept before you can search effectively
- You're looking for comparisons or community opinions on competing approaches
- The first three levels came up empty

**What to look for:**
- Recent publication dates (software changes fast; a 3-year-old tutorial may be obsolete)
- Reputable sources (official blogs, well-known developers, established publications)
- Working code examples (not just theory)
- Multiple sources agreeing (one blog post is an opinion; five saying the same thing is a pattern)

---

## What to Search For

When you start research, you're looking for one of these things (in order of preference):

### A library that does exactly what you need

The ideal outcome. You install it, configure it, and it handles the hard work. Example: you need to send emails from your app. There are mature, well-tested email libraries for every major language. You don't build an email sender from scratch.

### A skeleton project or template that solves 80%+ of the problem

The next best thing. Someone has built a project that's close to what you need. You use it as a starting point and customize the remaining 20%. Example: you need a web app with authentication, a database, and an admin panel. Starter templates exist for exactly this combination.

### Patterns and approaches others have used

Even if you can't use someone else's code directly, seeing how they approached the problem saves you from design mistakes. Example: you need to build a notification system. Reading how three different projects handle notifications reveals common patterns you should follow and pitfalls you should avoid.

### Evaluating What You Find

Not everything on the internet is worth using. Evaluate your finds with these criteria:

**Stars and downloads** — Popularity isn't everything, but a library with 10,000 stars has been vetted by thousands of developers. One with 3 stars might be someone's weekend experiment.

**Maintenance activity** — Check the last commit date and how quickly issues get responses. A library that hasn't been updated in two years might be abandoned. One that had a commit last week is alive and supported.

**Documentation quality** — Good documentation means you can actually use the library. Bad or missing documentation means you'll spend hours guessing how it works, which defeats the purpose of not building it yourself.

**License compatibility** — Software licenses determine how you can use the code. MIT and Apache 2.0 licenses are permissive (you can use them in almost any project). GPL requires you to open-source your own code. No license technically means you can't legally use it.

**Test coverage** — Libraries with comprehensive tests are more reliable. If the library's own authors didn't bother testing it, that's a warning sign.

---

## Build vs. Reuse Decision

After research, you'll face a decision: use what you found, modify it, or build your own. Here's how to decide.

### Use an existing library when:
- It does what you need with minimal configuration
- It's well-maintained and widely used
- The documentation is clear
- The license is compatible with your project
- The performance is acceptable for your use case

**This is the default choice.** Unless you have a specific reason to build your own, use what exists.

### Fork and modify when:
- A project does 80%+ of what you need but requires specific changes
- The changes you need are too niche to be accepted by the original project
- You need to control the release schedule or feature direction
- The original is no longer maintained but the code is solid

**Forking** means making your own copy of someone else's project. You can then modify your copy freely. It's like buying a house and renovating it rather than building one from the ground up.

### Build from scratch when:
- Nothing exists that fits your specific needs
- Your requirements are genuinely unique
- Existing solutions have fundamental limitations you can't work around
- Security requirements demand you control every line of code
- The problem is simple enough that a library would be overkill

**This should be your last choice.** The instinct to build everything yourself is strong but usually wrong. Most software is gluing existing pieces together in new combinations, not inventing new pieces.

The guiding principle: **prefer a proven approach over writing something new** whenever the proven approach meets your requirements.

---

## Research in Practice

### Example 1: Building a web app with user accounts

**Research flow:**
1. GitHub search for "starter template [your framework] authentication" — find projects that already combine your web framework with login/signup functionality
2. Check the framework's official docs for recommended authentication approaches
3. Search npm/PyPI for authentication libraries (passport.js, django-allauth, etc.)
4. Compare two or three options based on stars, docs quality, and maintenance

**Good research output:** "Found three authentication libraries. Library A has the most downloads and best docs. Library B is newer but handles our specific case (social login) better. Library C is outdated. Recommending Library B with Library A as fallback."

### Example 2: Building a CLI tool

**Research flow:**
1. GitHub search for CLI tools that do something similar — study their structure and user experience
2. Search for CLI framework libraries (commander.js, click, cobra)
3. Check if a template/scaffold exists for CLI projects in your language
4. Read one or two well-built CLI tools' source code to understand patterns

**Good research output:** "Found a CLI framework that handles argument parsing, help text, and subcommands. Also found a project template that sets up the project structure. Starting with the template and adding the framework."

### Example 3: Automating a repetitive task

**Research flow:**
1. GitHub search for existing automation scripts that handle the same task
2. Check if the service you're automating has an official API or SDK
3. Search for workflow automation libraries or tools
4. Look for existing integrations (Zapier, GitHub Actions, etc.) that might solve the problem without custom code

**Good research output:** "The service has an official API with a Python SDK. Found three existing scripts on GitHub that automate similar tasks. The SDK documentation is excellent. Plan: use the official SDK, adapt the pattern from the most popular existing script."

### What makes research output useful:
- States what was found (specific libraries, projects, or patterns)
- Explains why one option is better than others
- Identifies gaps (what still needs to be built custom)
- Gives a clear recommendation with reasoning
- Estimates how much existing code covers vs. what needs custom work
