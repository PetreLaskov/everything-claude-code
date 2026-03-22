# Component: signal-parser.js
## Type: script (library)
## Status: pending
## Dependencies: scripts/lib/learner-profile.js (for profile shape awareness, not imported at runtime)
## Session Target: 6

## What This Is

The signal-parser is the behavioral observation engine that translates raw tool events into competence signals. It reads each PostToolUse event (tool name, input, output) and the learner's current profile, then detects behavioral patterns that indicate competence growth or struggle. It returns structured signal objects that the competence-engine uses to update levels. This is pure detection logic — no state mutation, no I/O.

## Public API

```javascript
/**
 * Extract behavioral signals from a tool event.
 * Pure function — no side effects, no I/O.
 * @param {string} toolName - The tool that was used (Write, Edit, Bash, Read, etc.)
 * @param {object} toolInput - The tool's input parameters
 * @param {string|null} toolOutput - The tool's output (PostToolUse only)
 * @param {object} profile - The current learner profile (for context-dependent signals)
 * @returns {Signal[]} Array of detected signals (may be empty)
 */
function extractSignals(toolName, toolInput, toolOutput, profile)

/**
 * @typedef {object} Signal
 * @property {string} dimension - Competence dimension this signal affects
 * @property {number} weight - Signal weight (-0.20 to +0.20)
 * @property {string} reason - Human-readable reason for this signal
 * @property {string} type - Signal type: "positive", "negative", "flag"
 * @property {string|null} sub_concept - Specific sub-concept affected (optional refinement)
 */

/**
 * Get the signal weight table for reference/testing.
 * @returns {object} The full signal rules configuration
 */
function getSignalRules()

/**
 * Check if a signal should be filtered as a false positive.
 * @param {Signal} signal - The signal to check
 * @param {object} profile - The learner profile
 * @param {object} context - Additional context (recent signals, session state)
 * @returns {boolean} True if signal should be filtered out
 */
function isFlasePositive(signal, profile, context)
```

## Implementation Specification

### Signal Weight Table

From plan section 2.2, the complete signal rules:

**Positive signals (indicate higher competence):**

| Pattern | Dimension | Weight | Sub-concept | Detection |
|---|---|---|---|---|
| User modifies a plan before approving | planning | +0.15 | requirements_analysis | Bash tool with `git diff` on a plan file showing user-authored changes |
| User asks "why" about a design decision | architecture | +0.10 | separation_of_concerns | (detected at message level, not tool level — see note below) |
| User catches issue before reviewer | review | +0.20 | evaluating_severity | User Edit that fixes a problem before dev-reviewer runs |
| User writes conventional commit message | git_workflow | +0.15 | commit_messages | Bash with `git commit -m` where message follows conventional format |
| User requests edge case test | implementation | +0.20 | tdd_red_green_refactor | User-directed test file Write/Edit for scenarios not in the original plan |
| User adjusts verbosity down | (active dim) | +0.10 | null | (detected by command, not tool event — see note below) |
| User indicates familiarity ("I know") | (active dim) | +0.10 | null | (message-level detection — see note below) |
| User makes security observation | security | +0.20 | secrets_management | Write/Edit that adds input validation, env vars, or auth checks unprompted |
| User runs verification manually | verification | +0.15 | build_check | Bash with `npm test`, `npm run build`, `npm run lint` without being instructed |
| User composes multi-step instruction | orchestration | +0.15 | pipeline_composition | (message-level — see note below) |

**Negative signals (indicate struggle):**

| Pattern | Dimension | Weight | Sub-concept | Detection |
|---|---|---|---|---|
| Instant plan approval (no review) | planning | -0.05 | requirements_analysis | (timing-based — detected at message level, not tool level) |
| User asks "what does this mean" | (concept dim) | -0.10 | varies | (message-level detection) |
| "Just do it for me" pattern | implementation | -0.15 | null | (message-level detection) |
| Same question asked twice | (relevant dim) | -0.10 | varies | Requires session history comparison |
| Build/test fails after user change | implementation | -0.05 | error_handling | Bash output contains test failure or build error after user-directed Edit |
| User frustration expression | (active dim) | flag | null | (message-level detection) |

**Note on message-level vs tool-level signals:** Many signals from plan section 2.2 are detectable from user message content, not from tool events. The signal-parser handles TOOL-LEVEL signals only — it processes PostToolUse events. Message-level signals (asking "why", saying "I know", frustration) are handled by the teaching agents reading user messages in context. The signal-parser focuses on the signals that are reliably detectable from tool events.

### Detectable Tool-Level Signals (Core Implementation)

These are the signals the signal-parser can reliably detect from tool events:

1. **Conventional commit message** — Bash tool, `tool_input.command` matches `git commit`. Check if message follows `^(feat|fix|refactor|docs|test|chore|perf|ci)(\(.+\))?: .+`. Dimension: git_workflow, weight: +0.15.

2. **Manual verification run** — Bash tool, `tool_input.command` matches `npm test|npm run test|npm run build|npm run lint|npx jest|npx vitest|npx tsc`. Check that this was NOT preceded by an agent instruction (heuristic: check if there is an active project and the command was user-initiated). Dimension: verification, weight: +0.15.

3. **Build/test failure after user edit** — Bash tool, `tool_output` contains error/failure indicators (`FAIL`, `Error:`, `error TS`, `Build failed`, non-zero exit). Cross-reference: was the previous tool event an Edit initiated by the user? If yes, this is a struggle signal. Dimension: implementation, weight: -0.05.

4. **Security-conscious write** — Write/Edit tool, content adds `.env` references (`process.env.`), input validation (`if (!`, schema validation), or auth middleware. Check that the user's security dimension is < 3 (if already 3+, this is expected behavior, not a signal). Dimension: security, weight: +0.20.

5. **Edge case test write** — Write/Edit tool, `file_path` matches test file pattern (`.test.`, `.spec.`, `__tests__/`). Content includes test cases beyond the basic happy path (error cases, boundary conditions, null inputs). Heuristic: count `describe`/`it`/`test` blocks; if more than what was in the original plan, this indicates user-directed test expansion. Dimension: implementation, weight: +0.20. Sub-concept: tdd_red_green_refactor.

6. **Large file write (anti-pattern)** — Write tool, content exceeds 800 lines. Dimension: architecture, weight: -0.05. Sub-concept: file_structure.

7. **User-authored plan modification** — Edit tool on a plan file (`.plan.md`, `PLAN.md`, files in `plans/`). The `new_string` contains substantive changes (not just formatting). Dimension: planning, weight: +0.15. Sub-concept: requirements_analysis.

### False Positive Filtering

`isFalsePositive(signal, profile, context)`:

1. **Confidence gate** — If the dimension's confidence is > 0.85, suppress small signals (abs(weight) < 0.10). Well-established assessments should not be moved by weak signals.

2. **Repetition suppression** — If `context.recentSignals` contains a signal with the same dimension and type within the last 3 tool events, suppress the duplicate. Prevents the same behavior from being counted multiple times in rapid succession.

3. **Agent-directed action filter** — If the tool use was part of an agent execution (heuristic: multiple rapid sequential tool calls without user message in between), suppress positive signals. Agent-directed actions do not indicate USER competence.

4. **Test fixture exclusion** — If the file being written/edited is in a `fixtures/`, `__mocks__/`, or `test-data/` directory, suppress signals from content analysis. Test fixtures often contain patterns (like hardcoded values) that would trigger false signals.

### Data Structures

```javascript
// Signal rules configuration (for getSignalRules())
const SIGNAL_RULES = {
  positive: [
    { id: 'conventional_commit', dimension: 'git_workflow', weight: 0.15, sub_concept: 'commit_messages', detector: 'detectConventionalCommit' },
    { id: 'manual_verification', dimension: 'verification', weight: 0.15, sub_concept: 'build_check', detector: 'detectManualVerification' },
    { id: 'security_write', dimension: 'security', weight: 0.20, sub_concept: 'secrets_management', detector: 'detectSecurityWrite' },
    { id: 'edge_case_test', dimension: 'implementation', weight: 0.20, sub_concept: 'tdd_red_green_refactor', detector: 'detectEdgeCaseTest' },
    { id: 'plan_modification', dimension: 'planning', weight: 0.15, sub_concept: 'requirements_analysis', detector: 'detectPlanModification' }
  ],
  negative: [
    { id: 'build_fail_after_edit', dimension: 'implementation', weight: -0.05, sub_concept: 'error_handling', detector: 'detectBuildFailAfterEdit' },
    { id: 'large_file_write', dimension: 'architecture', weight: -0.05, sub_concept: 'file_structure', detector: 'detectLargeFileWrite' }
  ]
};
```

## Interface Contract Reference

Consumed by: `specs/hooks/level-signal-capture.spec.md` (the hook that calls extractSignals on every PostToolUse event)
Output feeds into: `specs/scripts/competence-engine.spec.md` (the engine that processes signals into level changes)

## Implementation Notes

(Empty — filled during implementation)

## Test Requirements

- **Conventional commit detection:** Bash event with `git commit -m "feat: add user login"` returns a positive signal for git_workflow with weight +0.15.
- **Non-conventional commit:** Bash event with `git commit -m "fixed stuff"` returns no signal.
- **Manual verification — npm test:** Bash event with `npm test` returns a positive signal for verification.
- **Manual verification — npx jest:** Bash event with `npx jest` returns a positive signal for verification.
- **Build failure detection:** Bash event with output containing "FAIL" and "Error:" returns a negative signal for implementation.
- **Build failure without prior user edit:** Bash event with failure output but no user-directed Edit context returns no signal (agent was working, not user).
- **Security-conscious write — env vars:** Edit adding `process.env.API_KEY` returns a positive signal for security (when user security level < 3).
- **Security-conscious write — high level:** Same pattern but user security level is 4 — returns no signal (expected behavior).
- **Edge case test write:** Write to `auth.test.js` with error case tests returns a positive signal for implementation.
- **Large file write:** Write with 900+ lines returns a negative signal for architecture.
- **Plan modification:** Edit to `project.plan.md` with substantive changes returns a positive signal for planning.
- **No signals from Read:** Read tool event returns empty array.
- **No signals from Glob:** Glob tool event returns empty array.
- **False positive — confidence gate:** Signal with weight 0.05 when dimension confidence is 0.90 is filtered out.
- **False positive — repetition:** Same signal type twice in 3 events is filtered on the second occurrence.
- **False positive — test fixture:** Write to `__mocks__/db.js` produces no signals despite content patterns.
- **getSignalRules:** Returns the complete rule set with correct structure.
- **extractSignals — pure function:** Calling extractSignals does not modify the profile parameter.
- **extractSignals — multiple signals:** A single event can return multiple signals (e.g., a security-conscious edit to a test file).
