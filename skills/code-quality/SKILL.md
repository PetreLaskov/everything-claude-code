---
name: code-quality
description: "Activated when the code review step runs, when discussing review findings, when the user asks about what makes code good or bad, or when evaluating whether to fix or defer a quality issue."
origin: MDH
---

# Code Quality

## What Makes Code "Good"

Code that "works" is the minimum. Code that's **good** goes further: it's easy to understand, easy to change, and hard to break.

Think of it like building a house. A house that stands up is better than no house. But a **good** house has clear room labels on the blueprint, accessible wiring behind removable panels, doors that open the right way, and hallways wide enough that you don't bump into walls carrying furniture. You can find the breaker box without a treasure map. You can repaint a bedroom without tearing down the kitchen.

Bad code is the house where the electrician ran wires through the plumbing, labeled nothing, and cemented the access panels shut. It works today, but the moment something needs to change, everything falls apart.

Good code has three qualities:

- **Readable** — Someone who didn't write it can understand what it does.
- **Changeable** — When requirements shift (and they always do), you can modify one part without accidentally breaking three others.
- **Resilient** — When something unexpected happens (bad input, missing data, network failure), the code handles it gracefully instead of crashing.

The pipeline's code review step evaluates these qualities. The sections below explain what the reviewer looks for so you can interpret its findings and make informed decisions about what to fix.

---

## Understanding Review Findings

The code reviewer evaluates your project against quality standards and reports what it finds. Each finding belongs to a category. Here's what the categories mean and why they matter.

### Mutation Findings

**What it means:** The code is changing data in place instead of creating new copies with changes applied.

**Analogy:** Five people editing the same Google Doc simultaneously. Someone deletes a paragraph you were referencing. Someone else reformats the table you were filling in. By the time you look back, the document is chaos. The better approach: make a copy, edit the copy, share the copy. The original stays untouched.

**Why this matters for you:** Mutation bugs are among the hardest to find. They cause problems in one part of the application because something changed in a completely different part. When the reviewer flags mutation, it is worth fixing — this prevents a category of bugs that are extremely difficult to diagnose later.

**Your action:** If the reviewer flags mutation as CRITICAL or HIGH, approve the fix. If it's MEDIUM, fix it when you're already working in that area.

### File Size and Organization Findings

**What it means:** Files are too large, functions are too long, or related code is scattered across too many places.

**Analogy:** A toolbox. A good toolbox has separate compartments: screwdrivers here, wrenches there. A bad toolbox is a single giant bin where finding the right Allen key means digging through 200 tools.

**Size benchmarks** (so you can interpret findings):
- Typical file: 200-400 lines
- Maximum: 800 lines
- Functions: under 50 lines each

**Why this matters for you:** Large files are hard for the agent to work with effectively. When you ask for changes to a 2,000-line file, the agent is more likely to miss things or introduce conflicts. Keeping files focused makes every future change safer and faster.

**Your action:** If the reviewer says a file is too large, tell the agent to split it. This is a routine operation — say "split this file into smaller, focused files."

### Error Handling Findings

**What it means:** The code doesn't handle failure cases properly. Operations that could fail (network calls, database queries, file reads) either crash silently or show unhelpful error messages.

**Why this matters for you:** Silent error handling is the most dangerous quality issue after security. Your app looks like it's working, but data is disappearing or corrupting behind the scenes. Users see a blank screen with no explanation.

**What to demand:** "Does this handle errors properly? What happens if the network is down? What happens if the input is empty?" These are the questions that surface missing error handling before users find it.

**Your action:** Error handling findings rated CRITICAL or HIGH should always be fixed before shipping.

### Input Validation Findings

**What it means:** Data from users, APIs, or files enters the system without being checked first.

**The rule is simple: trust nothing from outside.** Every piece of data from the outside world must be checked before your code does anything with it. Users make mistakes. Some users are malicious. External APIs might return unexpected formats.

**What to demand:** "Is all user input validated before it reaches the database?" This single question catches most validation gaps.

**Your action:** Missing input validation on user-facing features is always HIGH priority. On internal utilities, it's MEDIUM.

---

## The Code Review Checklist

This is what the reviewer checks. You don't need to memorize this — the reviewer handles it. But understanding the checklist helps you evaluate whether findings are important or cosmetic.

- [ ] **Readable names** — Variables, functions, and files have names that describe what they contain or do.
- [ ] **Small functions** — Each function is under 50 lines. Longer means it's doing too many things.
- [ ] **Focused files** — Each file is under 800 lines and handles a single responsibility.
- [ ] **No deep nesting** — Code isn't nested more than 4 levels deep. Deep nesting is hard to follow.
- [ ] **Proper error handling** — Every operation that can fail has explicit handling. No silent swallowing.
- [ ] **No hardcoded values** — Numbers, strings, URLs, and config values are stored in named constants, not scattered through the code.
- [ ] **No mutation** — Data is transformed by creating new objects, not by modifying existing ones.

---

## Reading a Code Review

When the code review step completes, it produces a report with findings organized by severity. Here's how to read and act on them.

**Severity levels:**

- **CRITICAL** — Must fix before proceeding. Bugs, security vulnerabilities, or data corruption risks. Non-negotiable.

- **HIGH** — Should fix now. Will cause problems soon, even if not immediately. Fix unless there's a strong reason to defer.

- **MEDIUM** — Consider fixing. Improves quality but isn't urgent. Fix when you can, defer if time is tight.

- **LOW** — Optional improvements. Suggestions for polish. Address when you're already editing that area.

**How to decide "fix now vs. defer":**

- CRITICAL: Always now. No exceptions.
- HIGH: Now, unless you're in the middle of an urgent fix for something else.
- MEDIUM: Now if you're already working in that file. Otherwise, note it for next time.
- LOW: Only when convenient. Don't interrupt other work for these.

**Why the reviewer is never the one who built the code:** This is intentional. Fresh eyes catch what familiar eyes skip. When you've been working on code for an hour, your brain fills in gaps and overlooks problems. A separate reviewer sees what's actually there, not what was intended. This is a feature of the pipeline, not a limitation.
