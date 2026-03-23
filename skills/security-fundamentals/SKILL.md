---
name: security-fundamentals
description: "Activated when the security review step of the pipeline is active, when auth or payment code is being written, when secrets or API keys are discussed, or when the user asks about security."
origin: MDH
---

# Security Fundamentals

## Why Security Matters for You

You might think security is only relevant for banks and government systems. It isn't. The moment your application handles any of the following, security becomes your responsibility:

- **User data** — even just email addresses and passwords. A leak exposes real people to spam, identity theft, and credential stuffing (where attackers try leaked passwords on other sites, since most people reuse passwords).
- **API keys and service credentials** — these are like credit cards for cloud services. An exposed API key for a cloud provider can rack up thousands of dollars in charges overnight. Attackers run automated scanners that find exposed keys within minutes of them appearing on GitHub.
- **Any business logic** — if your application processes orders, manages inventory, or handles payments, a security hole means someone can manipulate your system for free products, fraudulent transactions, or data they shouldn't see.

Security isn't something you "add later." It's built into every step of the pipeline, particularly Step 5 (Security Review). The patterns in this skill are what the security review checks for, and the one area where MDH's guardrails are strict rather than advisory.

---

## Secret Management (The #1 Rule)

This is the single most important security concept, and it's the simplest to understand:

**NEVER put passwords, API keys, tokens, or any credentials directly in your code. EVER.**

Think of your code as a recipe you might share publicly. You wouldn't write "the key to my house is under the third flowerpot" in a recipe you post online. But that's exactly what happens when API keys appear in code files.

**Why this is so dangerous:** Code gets shared. It goes to GitHub repositories (even "private" ones can become public accidentally). It goes to code reviewers. It goes to collaborators. Old versions are stored forever in git history. Once a secret is in your code, it's effectively public, and removing it from the current version doesn't remove it from the history.

**How it works instead:** Secrets are stored as environment variables — values that live on the computer running the application, outside the code itself. Think of it like a combination safe in your office. The recipe says "get the special ingredient from the safe" — it doesn't print the combination. Anyone reading the recipe can follow it, but only someone with access to the safe can actually get the ingredient.

**What to do if a secret is exposed:**

1. **Rotate immediately.** Generate a new key/password and invalidate the old one. Do this first, before anything else.
2. **Check for damage.** Review logs for the compromised service to see if the exposed key was used by anyone unauthorized.
3. **Remove from code history.** Just deleting the secret from the current code isn't enough — it's still in git history. The key must be rotated regardless.

**This is an enforced guardrail.** The security review step will flag any hardcoded secrets as CRITICAL, and MDH will insist on fixing them before committing. This is the one area where "we'll fix it later" is not acceptable.

---

## Common Attacks (What to Watch For)

Your application faces several categories of attack. You don't need to understand how the fixes work internally — the security agent handles that. But you need to know what these attacks ARE so you can understand security findings and know when to take them seriously.

### SQL Injection

Your application uses a database. Imagine a librarian who takes written requests: "Please find all books by [author name]."

Normal request: "Please find all books by **Agatha Christie**." The librarian finds them.

Attack request: "Please find all books by **Agatha Christie; also delete all books**." The librarian, following instructions literally, finds the books and then deletes the entire library.

That's SQL injection: the attacker puts database commands where normal data should go, and the database obeys because it can't tell the difference between the command and the data.

**What to demand:** If the security review flags SQL injection risk, it's always CRITICAL. Tell the agent to fix it immediately. The fix involves separating commands from data so the database never treats user input as instructions.

### Cross-Site Scripting (XSS)

Your application displays content from users (comments, profile names, messages). Imagine a community bulletin board where anyone can pin a note.

Normal note: "Great event last night!"

Attack note: A note that, when you look at it, somehow reaches into your pocket and steals your wallet. In web terms, the attacker writes code instead of text, and when other users' browsers display the "comment," the code runs and can steal their login session or redirect them to fake sites.

**What to demand:** If the security review flags XSS risk, it means user content is being displayed without being cleaned first. Always fix before shipping.

### Cross-Site Request Forgery (CSRF)

You're logged into your banking site. In another tab, you visit a malicious website. That website, without you knowing, sends a request to your banking site: "Transfer $500 to attacker's account." Because you're logged in, the banking site thinks the request came from you.

**What to demand:** Any form or action that changes data should be protected against this attack. If the security review flags CSRF, fix it.

---

## Authentication and Authorization

Two related but different concepts you should know when evaluating security findings:

**Authentication: Who are you?** The login process. You provide credentials and the system verifies your identity.

**Authorization: What are you allowed to do?** After confirming who you are, the system checks your permissions. An employee can view their own paycheck. A manager can view their team's paychecks. Same system, different access levels.

**What to demand from the agent:**
- Passwords must never be stored as readable text. If the security review flags plaintext passwords, it's CRITICAL.
- Login sessions must expire. A session that lasts forever means a stolen session token works forever.
- Failed login attempts must be rate-limited. Without this, an attacker can guess passwords by trying thousands of combinations per second.
- Protected pages must check both authentication (is the user logged in?) AND authorization (does this user have permission?). Hiding the URL is not access control.

---

## The Security Checklist

Before any code is committed, these items must be verified. This is what the security review step checks:

- [ ] **No hardcoded secrets** — No passwords, API keys, tokens, or credentials anywhere in the code.
- [ ] **All inputs validated** — Everything from users or external sources is checked before the application processes it.
- [ ] **SQL injection prevented** — All database queries use safe patterns, never pasting user input into commands.
- [ ] **XSS prevented** — All user-provided content is cleaned before being displayed.
- [ ] **CSRF protection enabled** — Forms and state-changing requests are protected against forged requests.
- [ ] **Authentication and authorization verified** — Protected routes check that the user is logged in and has permission.
- [ ] **Rate limiting on all endpoints** — Login attempts, API calls, and sensitive operations have rate limits.
- [ ] **Error messages don't leak sensitive data** — Error responses to users never include internal paths, database queries, or system details.

---

## What the Security Review Catches

The security review step (Step 5 of the pipeline) runs a dedicated security agent that checks every item on the checklist above.

**Findings are categorized by severity:**

- **CRITICAL** — Immediate risk. Hardcoded secrets, SQL injection vulnerabilities, missing authentication on sensitive endpoints. These are fixed before committing, period. A CRITICAL security finding is the one thing that will stop the pipeline.

- **HIGH** — Serious risk that needs prompt attention. Missing rate limiting, incomplete input validation, overly permissive authorization. Fix these now.

- **MEDIUM** — Moderate risk. Minor sanitization gaps, verbose error messages in some paths, session configuration that could be tighter. Fix when practical.

- **LOW** — Hardening suggestions. Additional headers, stricter cookie settings, defensive logging improvements. Address during maintenance.

**Why "just ship it" is dangerous here:** In code quality, a less-than-perfect function name is annoying but harmless. In security, a single missed validation can expose your entire user database. Security issues are the one category where cutting corners has consequences beyond your codebase — it affects real people whose data you're responsible for.

The security agent runs automatically. You don't need to remember all of these rules. But understanding what these attacks ARE helps you evaluate security findings and know when something flagged as CRITICAL truly cannot wait.
