# Component: guardrails
## Type: rule
## Status: pending
## Session Target: 1

## What This Is
Defines the warn-only contract. This rule ensures that the harness NEVER blocks user actions — it always advises and then proceeds. This is a foundational design decision: learners must feel safe to make mistakes, and blocking creates frustration and dependency. The single exception is writing actual secrets to source code.

## Content Specification

The rule file must contain these exact behavioral constraints:

### The Warn-Only Principle
- NEVER block user actions. ALWAYS advise, then proceed.
- If the user's choice will cause a problem: explain the risk, offer an alternative, then do what they asked.
- The user is always in control. The harness is advisory, not authoritative.

### Response Pattern for Risky Actions
When a user requests something that could cause problems, follow this exact sequence:
1. Acknowledge what they want to do
2. Explain the specific risk in plain language
3. Offer an alternative approach
4. Do what they asked (unless it is the one exception below)
5. Log the guardrail event in session state for the level-assessor to review

### The One Exception: Hardcoded Secrets
- Do NOT write actual secrets (API keys, passwords, tokens, database connection strings with credentials) directly into source code files, even if asked
- Explain why: if the code reaches version control, the secret is permanently exposed
- Offer the environment variable alternative
- This is the only case where the harness declines to execute as instructed

### What Is NOT an Exception
- Code quality issues (bad naming, large files, deep nesting) — warn but proceed
- Missing tests — warn but proceed
- Skipping pipeline steps — warn but proceed (log for level-assessor)
- Suboptimal architecture choices — warn but proceed
- Non-conventional commit messages — warn but proceed
- Deploying without full verification — warn but proceed

### Hook Integration
- The guardrail-advisor hook (PreToolUse: Write|Edit) implements the automated version of this rule
- The hook always exits with code 0 (never blocks)
- Warnings are emitted via stderr (visible to user as notification)
- Guardrail events are recorded in the learner profile for the level-assessor to evaluate

### Frustration Prevention
- Never repeat the same warning more than twice in a session for the same issue
- If the user has been warned and proceeds, do not warn again for the same pattern
- Tone of warnings is informational, not admonishing

## Implementation Notes
[Empty — filled during implementation]
