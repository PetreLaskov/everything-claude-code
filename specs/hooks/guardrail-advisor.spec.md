# Component: guardrail-advisor
## Type: hook
## Status: pending
## Dependencies: scripts/lib/learner-profile.js, specs/contracts/hook-io-contract.md, specs/contracts/learner-profile-schema.md
## Session Target: 7

## What This Is

The guardrail-advisor hook runs on PreToolUse events for Write and Edit tools. It performs warn-only checks on file writes, looking for common mistakes like hardcoded secrets, overly large files, and anti-patterns. It NEVER blocks (always exits 0) — it warns via stderr and provides advisory context via stdout. This embodies the MDH principle: advise, never block. The only exception: if actual secrets (API keys, passwords) are detected in source code, the hook warns strongly but still does not block.

## Hook Configuration

```json
{
  "event": "PreToolUse",
  "matcher": "Write|Edit",
  "hooks": [{
    "type": "command",
    "command": "node \"${CLAUDE_PLUGIN_ROOT}/scripts/hooks/guardrail-advisor.js\""
  }],
  "description": "Warn-only guardrails: advise on potential issues before file writes"
}
```

Default 5-second timeout applies.

## Input/Output Contract

**stdin:** JSON object from Claude Code (PreToolUse event). Fields:
- `tool_name` (string — "Write" or "Edit")
- `tool_input` (object — for Write: `file_path`, `content`; for Edit: `file_path`, `old_string`, `new_string`)
- `session_id` (string)

Note: `tool_output` is null for PreToolUse (the tool has not run yet).

**stdout:** Advisory messages injected into Claude's context. When warnings are detected:
```
[MDH Guardrail Advisory]
<warning_type>: <description>
Suggestion: <what to do instead>
```
When no warnings: empty stdout (no noise for clean writes).

**stderr:** User-visible notifications for warnings:
```
[MDH] Warning: <brief warning message>
```

**Exit code:** Always 0. NEVER exit 2 (block). The MDH warn-only policy is absolute.

## Implementation Specification

1. **Read stdin** — Parse JSON from stdin (buffered, 1MB max). Extract `tool_name`, `tool_input`.

2. **Extract content to check:**
   - For Write: `tool_input.content` (the full file content being written)
   - For Edit: `tool_input.new_string` (the replacement text)
   - Also extract `tool_input.file_path` for file-type-specific checks.

3. **Run checks** — Apply each guardrail check. Collect all warnings (do not short-circuit):

   **Check 1: Hardcoded secrets detection**
   - Scan content for patterns matching API keys, passwords, tokens, connection strings:
     - `(?:api[_-]?key|apikey)\s*[:=]\s*['"][A-Za-z0-9]{20,}['"]` (API keys)
     - `(?:password|passwd|pwd)\s*[:=]\s*['"][^'"]{8,}['"]` (passwords)
     - `(?:secret|token)\s*[:=]\s*['"][A-Za-z0-9+/=]{20,}['"]` (secrets/tokens)
     - `(?:mongodb\+srv|postgres|mysql|redis):\/\/[^\s'"]+` (connection strings)
     - `(?:sk-|pk_live_|sk_live_|ghp_|gho_|glpat-)[A-Za-z0-9]{20,}` (known key prefixes)
   - Exclude: files in `node_modules/`, `.env.example`, test fixtures, documentation files
   - Exclude: lines that are clearly comments or documentation
   - Warning level: HIGH
   - Suggestion: "Use environment variables. Store secrets in .env (gitignored) and access via process.env."

   **Check 2: Large file warning**
   - For Write: count lines in `content`. If > 800 lines, warn.
   - For Edit: skip this check (edits to existing large files are acceptable).
   - Warning level: MEDIUM
   - Suggestion: "Consider splitting into smaller, focused modules. MDH recommends 200-400 lines per file."

   **Check 3: Common anti-pattern detection**
   - `eval(` in JS/TS files: warn about security risk
   - `innerHTML\s*=` in JS/TS files: warn about XSS
   - `document.write(` in JS/TS files: warn about security
   - `SELECT.*\*.*FROM` with string concatenation (not parameterized): warn about SQL injection
   - Warning level: MEDIUM
   - Suggestion: specific to each pattern

   **Check 4: Missing error handling**
   - For Write only: if the file is a JS/TS source file (not test) and contains async functions or Promises but no try/catch or .catch(): warn.
   - Warning level: LOW
   - Suggestion: "Consider adding error handling for async operations."

4. **Build output:**
   - If no warnings: empty stdout, no stderr messages. Exit 0.
   - If warnings found:
     - Write `[MDH Guardrail Advisory]` block to stdout with all warnings and suggestions.
     - Write brief warning messages to stderr (user-visible notifications).
     - For HIGH-level warnings (secrets), include a stronger message: "SECURITY: Potential hardcoded secret detected."

5. **Log guardrail event** — If any warnings were generated, load the learner profile and record the guardrail event in a lightweight way (increment a counter or flag). This allows the level-assessor to consider guardrail triggers when evaluating security competence. Write the updated profile.

6. **Exit 0** — Always. No exceptions. The guardrail NEVER blocks.

**Error handling:** All operations in try/catch. If stdin parsing fails, exit 0 silently (do not block the write). If profile loading fails for the guardrail event logging, skip the logging and still exit 0.

## Implementation Notes

(Empty — filled during implementation)

## Test Requirements

- **Secret detection — API key:** Content containing `apiKey = "sk_live_abc123def456ghi789"` triggers HIGH warning.
- **Secret detection — password:** Content containing `password = "myS3cretP@ss"` triggers HIGH warning.
- **Secret detection — connection string:** Content containing `mongodb+srv://user:pass@cluster.example.com` triggers HIGH warning.
- **Secret detection — known prefixes:** Content containing `ghp_abcdefghij1234567890` triggers HIGH warning.
- **Secret exclusions:** Content in `.env.example` does NOT trigger. Content in test fixtures does NOT trigger. Comments do NOT trigger.
- **Large file warning:** Write with 900 lines triggers MEDIUM warning. Write with 400 lines does NOT trigger.
- **Large file — Edit exempt:** Edit to a large file does NOT trigger the large file warning.
- **Anti-pattern — eval:** Content with `eval(userInput)` triggers MEDIUM warning.
- **Anti-pattern — innerHTML:** Content with `el.innerHTML = data` triggers MEDIUM warning.
- **Anti-pattern — SQL injection:** Content with `` `SELECT * FROM users WHERE id = ${id}` `` triggers MEDIUM warning.
- **Clean content:** A normal source file with no issues produces empty stdout and no warnings.
- **Never blocks:** Verify exit code is always 0 regardless of warnings detected.
- **Guardrail event logging:** After a warning is generated, verify the profile reflects the guardrail event.
- **stdin parsing:** Verify graceful handling of malformed stdin JSON.
- **Performance:** Verify execution under 100ms for typical file content.
