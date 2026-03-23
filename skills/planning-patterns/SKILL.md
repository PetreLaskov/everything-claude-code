---
name: planning-patterns
description: "Activated when the planning step of the pipeline is active, when a user describes a feature to build, or when discussing how to break down complex work into manageable pieces."
origin: MDH
---

# Planning Patterns

## Why Planning Matters

Coding without a plan is like driving to a city you've never visited without a map. You might eventually get there, but you'll take wrong turns, backtrack, sit at dead ends, and arrive frustrated and hours late. Or you might end up somewhere else entirely and not realize it until it's too late.

Here's what happens when you skip planning:

**Scope creep.** You start building a login page. Along the way, you think "I should also add password reset." Then "and social login." Then "and two-factor authentication." Before you know it, a one-day task has turned into a two-week project, and the login page still isn't done.

**Rework.** You build Feature A, then discover that Feature B (which you need next) requires Feature A to be structured differently. Now you're tearing apart working code to accommodate something you could have anticipated.

**Missed requirements.** You build exactly what you pictured in your head, only to realize you forgot about error handling, mobile users, or what happens when the database is empty. These "obvious" requirements are the ones most often missed without a plan.

**Stalling.** Without a clear next step, you freeze. The project feels overwhelming because you're looking at the whole thing at once instead of one manageable piece at a time.

A plan fixes all of this. It's not bureaucracy — it's the difference between confident progress and anxious guessing.

**Critical rule:** A plan always **waits for your explicit approval** before implementation begins. The plan is a proposal, not a mandate. You review it, ask questions, request changes, and say "go" only when you're satisfied. You are always in control.

---

## What a Good Plan Contains

Every plan, regardless of size, should have these components:

### Goal Statement

One or two sentences describing what you're building and why. This is the compass that keeps everything on track. If a task doesn't serve the goal, it doesn't belong in the plan.

**Example:** "Build an expense tracker that lets users log daily expenses, categorize them, and see monthly totals. Purpose: replace the spreadsheet that's become unmanageable."

### Phases

Ordered chunks of work, each producing something you can see and test. Phases are not a wish list — they're a sequence. Phase 2 builds on Phase 1. Phase 3 builds on Phase 2.

**Example phases for an expense tracker:**
1. Set up project structure and database schema
2. Build the "add expense" form and storage
3. Build the expense list view with filtering
4. Add categories and monthly summary
5. Add data export and backup

Each phase should be completable in a single working session when possible. If a phase feels like it would take days, it's too big — break it down further.

### Dependencies

What must exist before something else can be built. Dependencies prevent you from trying to build the roof before the walls.

**Example:** "The monthly summary (Phase 4) depends on the expense list (Phase 3), which depends on the ability to add expenses (Phase 2), which depends on the database being set up (Phase 1)."

### Risks and Blockers

Things that might go wrong or require decisions you haven't made yet. Identifying risks early means you can address them before they derail the project.

**Example risks:**
- "We haven't decided how users will log in — this affects Phase 2"
- "The free tier of the database service has a storage limit — this could affect Phase 5"
- "The date formatting library we found in research has a known bug with timezone conversion"

### Exit Criteria

How you'll know each phase is truly done. Without exit criteria, "done" is subjective and phases drag on indefinitely.

**Example exit criteria for Phase 2:**
- User can fill out a form with amount, date, and description
- Expense is saved to the database when form is submitted
- User sees a confirmation message after saving
- Form validation prevents empty or negative amounts
- All tests pass, coverage above 80%

---

## Breaking Down Work

Decomposition is the single most important planning skill. It's the ability to take something large and vague and turn it into something small and specific.

### The decomposition process

Start with the big picture and repeatedly ask: "What are the pieces of this, and what order do they go in?"

**Starting point:** "Build a dashboard"

That's too vague to act on. What kind of dashboard? What does it show? Let's decompose.

**First decomposition:**
1. Dashboard needs data to display (where does it come from?)
2. Dashboard needs a layout (what sections does it have?)
3. Dashboard needs individual widgets (charts, numbers, lists)
4. Dashboard needs to refresh (how often? automatically?)

**Second decomposition (Phase 1: Data layer):**
1. Define what data the dashboard needs
2. Create the API endpoint that serves this data
3. Write tests for the API endpoint
4. Verify the endpoint returns correct data

**Now it's specific enough to build.**

### The MVP principle

MVP stands for Minimum Viable Product — the smallest version of your project that actually works and provides value. You build the MVP first, then add features on top.

**Why?** Because a simple thing that works is infinitely more useful than a complex thing that's half-finished. Your expense tracker with just "add expense" and "list expenses" is already more useful than your spreadsheet. Categories, charts, and export can come later.

**How to find the MVP:** Look at your phases and ask, "After which phase would a user actually find this useful?" Everything up to and including that phase is your MVP. Everything after is enhancement.

### Each phase should be independently testable

This is a critical principle. After completing any phase, you should be able to demonstrate that it works — run the tests, click through the UI, or show the output. If you can't test a phase on its own, it's either too small (merge it with another phase) or it's missing something (add what's needed to make it testable).

**Good phase:** "Build the add-expense form with validation and database storage." You can test this: fill out the form, submit it, check the database.

**Bad phase:** "Set up the form component." You can't test this meaningfully — a form that doesn't submit or save isn't useful on its own.

### Later phases extend earlier ones

Each phase should leave the project in a working state. Phase 3 adds features to what Phase 2 built, but if Phase 3 fails halfway through, Phase 2's work still functions. This is like building floors of a building — the ground floor works whether or not you ever build the second floor.

### User control varies by learning phase

- **Early phases (Observer/Follower):** Claude creates the decomposition. You review the phases and ask questions. Your role is to understand why the work was broken down this way.
- **Middle phases (Contributor/Builder):** Claude suggests a breakdown, but you actively participate. "Should this be one phase or two?" "I think we need another phase for error handling."
- **Late phases (Independent/Graduate):** You create the breakdown. Claude reviews it for gaps, risks, and ordering problems.

---

## Reading and Evaluating a Plan

Whether Claude wrote the plan or you did, you should evaluate it before approving. Here's how to read a plan critically.

### Does each phase make sense on its own?

Read each phase independently. Could you explain to someone what it accomplishes? If a phase is confusing or seems to produce nothing tangible, it needs to be clarified or merged with another phase.

### Are the dependencies logical?

Follow the dependency chain. Does Phase 3 actually require Phase 2, or could they be done in either order? Getting dependencies wrong means unnecessary sequencing (slower) or trying to build on things that don't exist yet (crashes).

### Is anything missing?

Common things plans forget:
- **Error handling.** What happens when something goes wrong? (Network fails, user enters invalid data, database is full)
- **Empty states.** What does the UI look like before there's any data?
- **Loading states.** What does the user see while data is being fetched?
- **Edge cases.** What happens with zero items? With thousands of items? With special characters in names?
- **Cleanup.** Does old data get archived or deleted? Do temporary files get removed?

### Is the scope right?

Two common scope problems:

**Too big:** The plan tries to build everything at once. Signs: phases that would take days, a long list of "nice-to-have" features mixed in with essentials, no clear MVP.

**Too small:** The plan leaves out essential pieces. Signs: it describes how to build the feature but not how to test it, no error handling, no consideration of what happens when things go wrong.

### What questions should you ask?

Good questions to ask about any plan:
- "What's the simplest version of this that would be useful?"
- "What happens if Phase 2 takes longer than expected?"
- "What are we NOT building? What's explicitly out of scope?"
- "After Phase 1, can we actually run and test something?"
- "Is there anything in Phase 4 that we'll wish we'd done in Phase 1?"

---

## Planning at Different Scales

Not every task needs the same level of planning. Match the planning effort to the size of the work.

### Simple (single file change)

**What it looks like:** Fix a bug, update a label, add a CSS style, correct a typo.

**Planning approach:** Skip formal planning. State what you're changing and why in one sentence. Go straight to implementation.

**Example:** "Change the 'Submit' button text to 'Save Changes' because users found 'Submit' confusing."

### Medium (multiple files, one feature)

**What it looks like:** Add a new page, create an API endpoint with database operations, implement a form with validation.

**Planning approach:** Standard plan with phases, dependencies, and exit criteria. Usually 2-5 phases. Can be completed in one session.

**Example:** A plan with three phases: (1) database table and API endpoint, (2) form UI with validation, (3) integration tests and error handling.

### Large (multi-session project)

**What it looks like:** Build a complete feature that spans the frontend, backend, and database. Requires multiple working sessions to complete.

**Planning approach:** Blueprint-level planning. Detailed architecture decisions up front. Phases grouped into milestones (each milestone = one session). Dependencies mapped carefully because you'll pick up work across sessions.

**Example:** Building a user notification system: Milestone 1 (notification data model and storage), Milestone 2 (real-time delivery), Milestone 3 (user preferences and controls), Milestone 4 (testing and polish).

### Epic (multi-PR, phased rollout)

**What it looks like:** A major feature or system overhaul that will be released in stages. Multiple pull requests, possibly involving coordination with other people or systems.

**Planning approach:** Phased rollout with explicit milestones and decision points. Each phase is its own pull request with its own review cycle. Include rollback plans (what to do if a phase causes problems in production). Define success metrics for each phase.

**Example:** Migrating a database — Phase 1: Set up new database alongside old one. Phase 2: Write to both databases simultaneously. Phase 3: Switch reads to new database. Phase 4: Remove old database. Each phase has a "go/no-go" decision point and a rollback plan.

**The general rule:** The bigger the change, the more time you spend planning relative to coding. A simple fix needs 10 seconds of planning. An epic needs hours. This ratio is not wasted time — it's the investment that keeps the execution phase fast and predictable.
