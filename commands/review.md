---
description: Review code for quality and security issues. Guided code review with teaching adapted to your level.
---

# Review

Run code review and security review on the specified scope. Invokes the **dev-reviewer** agent for code quality and the **dev-security** agent for security analysis.

## Prerequisites

Read `state/learner-profile.json`.

- If no profile exists, redirect to `/start`.
- Read the user's `review` dimension level, `security` dimension level, and `verbosity` setting.
- Calculate annotation depths independently:
  - Code review: `annotation_depth = max(0, verbosity - (review_level - 1))`
  - Security review: `annotation_depth = max(0, verbosity - (security_level - 1))`

## Scope Determination

Determine what to review, in priority order:

1. If `$ARGUMENTS` contains a file or directory path, review that scope.
2. If recent changes exist (run `git diff --name-only` and `git diff --cached --name-only`), offer to review those changes.
3. If running after `/implement` (check `pipeline_steps_executed`), review the files that were just created or modified.
4. If nothing matches, ask: "What would you like me to review?"

## Teaching Mode Selection

Check the user's dimension levels separately for each review pass:

- **Review Level 0-1 (Directive):** Present all code review findings with explanations. Walk through each one.
- **Review Level 2+ (Socratic):** Show the code first and ask: "Do you see any issues here?" Collect the user's observations, then present the reviewer's findings. Compare what the user spotted against the findings.
- **Security Level 0-1 (Directive):** Present all security findings with explanations.
- **Security Level 2+ (Socratic):** Ask: "What security concerns do you see?" Collect the user's observations, then present the security findings.

## Pre-Catch Signal

If the user identifies an issue before the reviewer reveals it (Socratic mode), record a positive signal of +0.20 for the `review` dimension. This applies to both code review and security review Socratic passes.

## Code Review

Invoke the **dev-reviewer** agent (Sonnet) on the determined scope.

The agent performs code quality analysis and produces findings with severity levels:

- **CRITICAL** -- must fix before proceeding
- **HIGH** -- strongly recommend fixing
- **MEDIUM** -- suggest fixing when possible
- **LOW** -- informational, fix at user's discretion

Checks include: readability, naming, function size, file organization, error handling, immutability, input validation, code duplication.

Present findings at the calculated review annotation depth:
- At depth 4-5: Explain what code review is, what each severity level means, why each issue matters.
- At depth 2-3: Explain key findings. Ask the user to evaluate severity.
- At depth 0-1: Present findings concisely.

## Security Review

Invoke the **dev-security** agent (Sonnet) on the same scope as a second pass.

The agent performs security analysis and produces findings with severity and remediation steps.

Checks include: hardcoded secrets, SQL injection, XSS, CSRF, auth/authz, input sanitization, error message leaks.

Present findings at the calculated security annotation depth:
- At depth 4-5: Explain what security vulnerabilities are, why each finding matters, what attackers could exploit.
- At depth 2-3: Explain key security findings. Highlight the most important remediations.
- At depth 0-1: Present security findings concisely.

## Fix Prioritization

After presenting all findings from both passes:

1. List all CRITICAL findings -- these must be fixed before proceeding.
2. List all HIGH findings -- strongly recommend fixing.
3. List MEDIUM and LOW findings as suggestions.
4. At Phase 1-2, recommend addressing all CRITICAL and HIGH findings.
5. Ask the user which findings to address.

## Session State

Record `"review"` in `pipeline_steps_executed` for the current session. If the user caught issues before the reviewer in Socratic mode, record the pre-catch as a positive signal for the `review` dimension.

## Phase-Specific Behavior

| Phase | Behavior |
|-------|----------|
| 0 (Discovery) | Available but unusual. Can review example code for learning purposes. |
| 1 (Observer) | Full annotation. Claude walks through each finding, explaining what it means and why it matters. Security concepts get extra annotation. |
| 2 (Co-Pilot) | Medium annotation. Claude shows code and asks user to spot issues (Socratic for review). Explains findings the user missed. Asks user to evaluate severity. |
| 3 (Navigator) | Low annotation. Presents findings. Lets user decide what to fix. Annotates only new review concepts (e.g., first time encountering a particular vulnerability type). |
| 4 (Driver) | Minimal. Presents findings concisely. User directs which to fix. |
| 5 (Graduate) | Findings only. No annotation unless requested via `/explain`. |
