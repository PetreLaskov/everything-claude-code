# Component: level-signal-capture
## Type: hook
## Status: pending
## Dependencies: scripts/lib/learner-profile.js, scripts/lib/signal-parser.js, scripts/lib/competence-engine.js, specs/contracts/hook-io-contract.md, specs/contracts/learner-profile-schema.md
## Session Target: 7

## What This Is

The level-signal-capture hook runs on every PostToolUse event (matcher: *). It is the behavioral observation engine — it reads each tool event, passes it to the signal-parser to detect behavioral signals, then feeds detected signals into the competence-engine to update the learner's dimension levels and signal accumulator. This is the bridge between raw tool events and the adaptive difficulty system.

## Hook Configuration

```json
{
  "event": "PostToolUse",
  "matcher": "*",
  "hooks": [{
    "type": "command",
    "command": "node \"${CLAUDE_PLUGIN_ROOT}/scripts/hooks/level-signal-capture.js\"",
    "timeout": 5
  }],
  "description": "Capture behavioral signals for adaptive difficulty"
}
```

## Input/Output Contract

**stdin:** JSON object from Claude Code (PostToolUse event). Fields:
- `tool_name` (string — Write, Edit, Bash, Read, Grep, Glob, etc.)
- `tool_input` (object — tool-specific parameters)
- `tool_output` (string — the tool's output, present for PostToolUse)
- `session_id` (string)
- `transcript_path` (string | null)

**stdout:** Empty in most cases. On a level-up event, outputs a brief celebration message:
```
[MDH] Level up! Your <dimension> competence is now Level <N> (<label>).
```
Level-down events produce NO stdout output (asymmetric notification — silent increase in help).

**stderr:** Diagnostic logging (e.g., "[MDH:Signal] Detected: planning +0.15", "[MDH:Signal] No signals from Glob event").

**Exit code:** Always 0.

## Implementation Specification

1. **Read stdin** — Parse JSON from stdin (buffered, 1MB max). Extract `tool_name`, `tool_input`, `tool_output`, `session_id`.

2. **Load current profile** — Via `learnerProfile.loadProfile()`. If profile does not exist, exit 0 (session-start-loader should have created it; if it did not, skip silently).

3. **Parse signals** — Call `signalParser.extractSignals(tool_name, tool_input, tool_output, profile)`. The signal parser returns an array of signal objects:
   ```javascript
   [
     { dimension: "planning", weight: +0.15, reason: "User modified plan before approving" },
     { dimension: "implementation", weight: -0.05, reason: "Build failed after user-directed change" }
   ]
   ```
   If no signals detected, log to stderr and exit 0.

4. **Apply signals to competence engine** — For each signal, call `competenceEngine.updateLevel(profile, signal)`. This function:
   - Applies the dampened delta to `signal_accumulator[dimension]`
   - Checks for integer boundary crossings
   - Updates `dimensions[dimension].level`, `fractional_level`, `confidence`, `evidence_count`, `last_assessed`
   - Returns `{ levelChanged: boolean, direction: 'up'|'down'|null, newLevel: number }`

5. **Handle level changes:**
   - **Level up:** Write celebration message to stdout. Log to stderr.
   - **Level down:** Write nothing to stdout. Log to stderr. The system silently increases help depth.
   - Record level changes in a session-scoped accumulator (written to profile by learner-state-persist).

6. **Save profile** — Write updated profile to disk via `learnerProfile.saveProfile(profile)`.

7. **Exit 0** — Always.

**Performance constraint:** This hook fires on EVERY tool use. It must be fast. The signal parser does pattern matching (no I/O). The competence engine does arithmetic (no I/O). The only I/O is profile load + save. Target: under 100ms total execution time.

**Error handling:** All operations in try/catch. If signal parsing throws, log and exit 0. If profile save fails, log and exit 0. A failed signal capture is non-fatal — the signal is simply lost (behavioral signals are probabilistic; losing individual signals does not corrupt the model).

## Implementation Notes

(Empty — filled during implementation)

## Test Requirements

- **Signal detection and forwarding:** Given a PostToolUse event that matches a known signal pattern, verify the signal is detected and passed to the competence engine.
- **No-signal events:** Given a PostToolUse event with no detectable signal (e.g., a Read event with no behavioral significance), verify the hook exits cleanly with no profile changes.
- **Level-up notification:** When a signal causes an integer boundary crossing upward, verify stdout contains the celebration message.
- **Level-down silence:** When a signal causes an integer boundary crossing downward, verify stdout is empty.
- **Profile persistence:** After signal processing, verify the profile on disk reflects updated `signal_accumulator`, `fractional_level`, `confidence`, and `evidence_count`.
- **Multiple signals per event:** When the signal parser returns multiple signals from one event, verify all are applied.
- **Missing profile:** When no profile exists, verify exit 0 with no error.
- **Performance:** Verify total execution time is under 200ms for a typical event (lenient test threshold; target is 100ms).
- **Concurrent safety:** Two rapid successive events do not corrupt the profile (load-modify-save cycle is consistent).
- **stdin parsing:** Verify graceful handling of malformed stdin JSON.
