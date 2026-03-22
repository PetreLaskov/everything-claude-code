# Contract: Hook I/O

## Version: 1.0.0
## Consumers: All hook scripts in scripts/hooks/
## Reference: Claude Code hooks documentation

## Hook Input (stdin)

All hooks receive a JSON object on stdin from Claude Code:

```json
{
  "tool_name": "string — Write, Edit, Bash, Read, Grep, Glob, etc.",
  "tool_input": { "...tool-specific parameters..." },
  "tool_output": "string | null — only present for PostToolUse",
  "session_id": "string",
  "transcript_path": "string | null"
}
```

### Tool-Specific Input Examples

**Write/Edit:**
```json
{
  "tool_name": "Write",
  "tool_input": { "file_path": "/path/to/file.ts", "content": "..." }
}
```

**Bash:**
```json
{
  "tool_name": "Bash",
  "tool_input": { "command": "npm test" }
}
```

## Hook Output

### Exit Codes
- `0` — success (hook completed, action proceeds)
- `2` — BLOCK action (MDH does NOT use this — warn-only policy)

### stdout
Content written to stdout is injected into Claude's context as a system message. Use for:
- Teaching annotations (PostToolUse)
- Learner context loading (SessionStart)
- Warnings and advice (PreToolUse)

### stderr
Content written to stderr is shown to the user as a notification. Use for:
- Warnings that should be visible but not injected into context
- Debug logging

## Hook Event Types Used by MDH

| Event | Matcher | Script | Purpose |
|---|---|---|---|
| SessionStart | `*` | session-start-loader.js | Load learner profile, inject context |
| PreToolUse | `Write\|Edit` | guardrail-advisor.js | Warn-only advice before writes |
| PostToolUse | `*` | level-signal-capture.js | Capture behavioral signals |
| PostToolUse | `Write\|Edit` | teaching-annotation.js | Inject teaching context |
| Stop | `*` | learner-state-persist.js | Persist profile and session state |

## Timeout Contract
- All hooks: 5 second timeout (except session-start-loader: 10 seconds)
- Hooks MUST exit within timeout or be killed
- Long-running work should be async (write to file, don't block)

## Path Resolution
- `${CLAUDE_PLUGIN_ROOT}` resolves to the MDH plugin root directory
- Profile path: `${CLAUDE_PLUGIN_ROOT}/state/learner-profile.json`
- All script paths relative to plugin root
