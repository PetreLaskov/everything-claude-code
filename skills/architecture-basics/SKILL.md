---
name: architecture-basics
description: "Activated when architectural decisions arise during planning, when the project-advisor proposes a structure, when reviewing how code is organized, or when the user asks about system design."
origin: MDH
---

# Architecture Basics

## What Architecture Is

Software architecture is the blueprint of your application. It describes how all the pieces are organized, how they communicate with each other, and how the system can grow over time.

Think of it like designing a house. You wouldn't put the plumbing in the middle of the living room, and you wouldn't build the kitchen in the attic far away from the dining room. Each room has a purpose, and you arrange them so the house makes sense for the people living in it. The plumbing runs through the walls where it belongs — out of sight but easy to access when you need to fix something.

Good architecture works the same way. Things are where you expect to find them. If you're looking for user-related code, there's one clear place to look. If you need to change how the database works, you go to the database layer, not scattered code across fifty files.

**Why it matters:** Bad architecture doesn't show up on day one. It shows up on day thirty when you try to add a feature and realize everything is tangled together. Good architecture means changes are local — you fix one thing without accidentally breaking three others.

---

## Separation of Concerns

Separation of concerns is one of the most important ideas in software. It means: each piece of code should have ONE job.

Imagine a restaurant. The chef cooks. The server takes orders and delivers food. The cashier handles payment. Nobody does everything — each person focuses on their role. If the chef is also running to tables and processing credit cards, the kitchen falls apart.

In software, code is separated into layers: how data is stored, what the application does with that data, and what the user sees. When these are properly separated, you can change one layer without touching the others.

**A practical example:** Say your app shows a list of products. Right now products come from a simple file. Later you switch to a real database. If the code that reads products is separate from the code that displays them, you only change the reading part. The display code stays exactly the same because it doesn't care where the products come from.

**Why this matters for you:** When the project-advisor or reviewer talks about "separation of concerns," they're checking that the agent organized the code so future changes are safe. If the reviewer flags a separation issue, it means one part of the system knows too much about another part — approve the fix because it prevents cascading breakage later.

---

## Reading a Project Structure

When the agent creates or modifies your project, the folder structure tells a story. You can evaluate the agent's organizational choices by reading it.

**What good structure looks like:**
- Each folder has a clear purpose you can describe in one sentence
- Related code lives together (everything about users in one place, everything about payments in another)
- You can roughly understand what the project does from the folder names alone

**Red flags in structure:**
- Folders with vague names like `utils/`, `helpers/`, or `misc/` that accumulate unrelated code
- Folders containing dozens of files with no sub-organization
- The same kind of logic scattered across many different folders

**What to ask when the agent proposes a structure:**
- "Can you explain what goes in each of these folders?"
- "If I need to add a new feature later, where would it go?"
- "Is this the simplest structure that would work for this project?"

You don't need to propose an alternative. The questions surface whether the agent has a clear rationale or is over-engineering. If the answers are clear and consistent, the structure is sound.

---

## Evaluating Architectural Proposals

Architecture decisions come up early in a project, and the early ones have outsized impact. Choosing a structure on day one affects every feature built afterward.

**Questions to ask about any proposal:**

- "Why this structure instead of something simpler?"
- "What happens when we need to add a new feature — where does it go?"
- "If we need to change the database later, how much code changes?"
- "Is there a simpler version of this that would work for now?"

You don't need to know the "right" answer. Asking these questions forces the reasoning into the open and helps you learn from the decision.

**Key trade-offs to understand:**

- **Simplicity vs. flexibility.** A simple structure is easy to understand but might need restructuring as the project grows. A flexible structure handles growth but adds complexity you might not need yet.
- **Speed vs. maintainability.** The fastest way to build something today might create a mess to maintain tomorrow. But over-engineering for "someday" wastes time on problems that may never arrive.
- **Convention vs. customization.** Following well-known patterns means the agent (and any future collaborators) understand the project quickly. Custom solutions might fit better but require more explanation.

**The most important principle: start simple and add complexity only when you need it.** This is sometimes called "YAGNI" — You Aren't Gonna Need It. Don't build a complex system to handle ten thousand users when you have ten. Build for what you have now, with clean enough architecture that you CAN scale later.

**When to push back:** If the agent proposes something that feels more complex than the project needs — three layers of abstraction for a simple tool, a microservice architecture for a prototype — push back. Say "is there a simpler way to do this?" Simplicity almost always wins for early-stage projects.
