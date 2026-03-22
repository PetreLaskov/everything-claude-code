# Component: review
## Type: command
## Status: pending
## Dependencies: dev-reviewer agent, dev-security agent, scripts/lib/learner-profile.js
## Session Target: 5

## What This Is
The `/review` command runs code review and security review as a standalone operation outside the full `/build` pipeline. It invokes the `dev-reviewer` agent for code quality review and the `dev-security` agent for security analysis, both with teaching annotations adapted to the user's review and security dimension levels.

## Command Frontmatter
```yaml
---
description: Review code for quality and security issues. Guided code review with teaching adapted to your level.
---
```

## Behavior Specification

1. **Profile check.** Read `state/learner-profile.json`. If no profile exists, redirect to `/start`.

2. **Scope determination.** Determine what to review:
   - If a file or directory is provided as an argument, review that scope
   - If recent changes exist (git diff), offer to review those changes
   - If running after `/implement`, review the files that were just created or modified
   - If nothing is specified, ask: "What would you like me to review?"

3. **Code review -- invoke dev-reviewer agent.** The `dev-reviewer` agent (Sonnet) performs:
   - Code quality analysis with severity levels: CRITICAL, HIGH, MEDIUM, LOW
   - Checks: readability, naming, function size, file organization, error handling, immutability, input validation, code duplication
   - Produces a findings list with location, severity, description, and recommended fix

4. **Security review -- invoke dev-security agent.** The `dev-security` agent (Sonnet) performs:
   - Security analysis focused on the reviewed code
   - Checks: hardcoded secrets, SQL injection, XSS, CSRF, auth/authz, input sanitization, error message leaks
   - Produces security findings with severity and remediation

5. **Teaching annotations.** Both agents read the learner profile and apply annotation depth independently:
   - Code review: `annotation_depth = max(0, verbosity - (review_level - 1))`
   - Security review: `annotation_depth = max(0, verbosity - (security_level - 1))`
   - At depth 4-5: explains what code review IS, what each severity level means, why each issue matters, what security vulnerabilities are
   - At depth 2-3: explains key findings, asks the user to evaluate severity
   - At depth 0-1: presents findings concisely

6. **User interaction by teaching mode:**
   - **Directive (Level 0-1 in review/security):** Present all findings with explanations. Walk through each one.
   - **Socratic (Level 2+ in review):** Show the code and ask: "Do you see any issues here?" Then present findings, comparing with what the user spotted. A user who catches an issue before the reviewer is a strong positive signal (review +0.20).
   - **Socratic (Level 2+ in security):** Ask: "What security concerns do you see?" Then present security findings.

7. **Fix prioritization.** After presenting all findings:
   - CRITICAL: must fix before proceeding
   - HIGH: strongly recommend fixing
   - MEDIUM: suggest fixing when possible
   - LOW: informational, fix at user's discretion
   - Ask user which findings to address. At Phase 1-2, recommend addressing all CRITICAL and HIGH.

8. **Session state.** Record `"review"` in `pipeline_steps_executed`. If the user catches issues before the reviewer, record as a positive signal for the review dimension.

## Arguments
| Argument | Required | Description |
|---|---|---|
| `<path>` | No | File or directory to review. If omitted, reviews recent changes or asks interactively. |

## Phase-Specific Behavior

| Phase | Behavior |
|---|---|
| 0 (Discovery) | Available but unusual. Can review example code for learning purposes. |
| 1 (Observer) | Full annotation. Claude walks through each finding, explaining what it means and why it matters. Security concepts get extra annotation. |
| 2 (Co-Pilot) | Medium annotation. Claude shows code and asks user to spot issues (Socratic for review). Explains findings the user missed. Asks user to evaluate severity. |
| 3 (Navigator) | Low annotation. Presents findings. Lets user decide what to fix. Annotates only new review concepts (e.g., first time encountering a particular vulnerability type). |
| 4 (Driver) | Minimal. Presents findings concisely. User directs which to fix. |
| 5 (Graduate) | Findings only. No annotation unless requested via `/explain`. |

## Implementation Notes
_Empty -- filled during implementation._

## Test Requirements
1. **Profile prerequisite test.** No profile redirects to `/start`.
2. **Code review findings test.** The dev-reviewer agent produces findings with severity levels (CRITICAL, HIGH, MEDIUM, LOW).
3. **Security review findings test.** The dev-security agent produces security-specific findings.
4. **Dual agent invocation test.** Both `dev-reviewer` AND `dev-security` agents are invoked during a review.
5. **Annotation depth independence test.** Review and security annotations use their respective dimension levels independently (user can be Level 3 in review but Level 0 in security).
6. **Socratic mode test.** At review level 2+, the agent asks the user to spot issues before presenting findings.
7. **Pre-catch signal test.** When the user identifies an issue before the reviewer, a positive signal (+0.20) is recorded for the review dimension.
8. **Session history test.** After review, `"review"` appears in `pipeline_steps_executed`.
9. **Scope detection test.** When recent git changes exist, the command offers to review those changes.
