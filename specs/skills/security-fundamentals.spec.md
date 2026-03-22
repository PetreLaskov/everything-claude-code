# Component: security-fundamentals
## Type: skill
## Status: pending
## Dependencies: dev-pipeline (references step 4 of the pipeline), code-quality (input validation overlaps)
## Session Target: 1

## What This Is
Teaches security fundamentals for non-developers. Covers secret management, input sanitization, authentication basics, and the OWASP Top 10 in plain language. This is NOT a deep security course — it teaches just enough for the user to understand WHY security matters and what the security review step checks, so they can make informed decisions when security issues are flagged.

## Skill Frontmatter
```yaml
name: security-fundamentals
description: "Activated when the security review step of the pipeline is active, when auth or payment code is being written, when secrets or API keys are discussed, or when the user asks about security."
origin: MDH
```

## Content Specification

### Section 1: Why Security Matters for You
Frame security for non-developers: even if your app is small, a security hole can leak user data, expose API keys (costing you money), or let someone hijack your application. Security is not just for banks — it is for anyone who handles user data or connects to services with credentials.

### Section 2: Secret Management (The #1 Rule)
Teach the most critical security practice in the simplest terms:
- NEVER put passwords, API keys, or tokens directly in your code
- ALWAYS use environment variables or a secret manager
- Why: if your code goes to GitHub (even accidentally), your secrets are exposed
- How environment variables work (conceptual, not implementation details)
- What to do if a secret is exposed (rotate immediately)
- This is the ONE guardrail that the harness enforces even in warn-only mode

### Section 3: Input Sanitization (Don't Trust Users)
Teach the concept that all user input is potentially dangerous:
- **SQL injection** — what it is in plain language (someone types a command instead of their name, and your database obeys it). Why parameterized queries prevent it.
- **XSS (Cross-Site Scripting)** — someone injects code into your web page that runs in other users' browsers. Why sanitizing HTML prevents it.
- **CSRF** — someone tricks a logged-in user into performing an action they did not intend. Why CSRF tokens prevent it.

### Section 4: Authentication Basics
Teach what authentication and authorization ARE (who are you vs. what are you allowed to do):
- Passwords should never be stored in plain text (hashing)
- Sessions and tokens — how "staying logged in" works conceptually
- Rate limiting — preventing someone from guessing passwords by trying millions of times

### Section 5: The Security Checklist
Present the pre-commit security checklist in plain language:
- No hardcoded secrets
- All user inputs validated
- SQL injection prevention (parameterized queries)
- XSS prevention (sanitized HTML)
- CSRF protection enabled
- Authentication/authorization verified
- Rate limiting on all endpoints
- Error messages do not leak sensitive data

### Section 6: What the Security Review Catches
Explain what happens during the security review step: the security agent checks for the items above and flags them by severity. Teach the user that CRITICAL security issues should always be fixed before committing — this is the one area where "just ship it" is dangerous.

## ECC Source Material
- ECC rules/common/security.md — mandatory security checklist, secret management rules, security response protocol
- ECC manual section 3: pipeline step 4 (SECURE) — security-reviewer activation, OWASP Top 10, secrets detection
- ECC manual section 12: security-reviewer agent — OWASP checklist, proactive trigger on auth/payment code
- ECC manual section 7: "Security Guardrails" — doc file warning, console.log detection, InsAIts monitor

## Implementation Notes
[Empty — filled during implementation]
