# Component: learner-state-persist
## Type: hook
## Status: pending
## Dependencies: scripts/lib/learner-profile.js, specs/contracts/hook-io-contract.md, specs/contracts/learner-profile-schema.md
## Session Target: 7

## What This Is

The learner-state-persist hook runs on every Stop event (after each Claude response completes). It saves the current in-memory learner profile to disk, appends or updates the current session history entry, and ensures all accumulated signals, level changes, and session metadata are persisted before the session potentially ends. This is the write counterpart to session-start-loader.

## Hook Configuration

```json
{
  "event": "Stop",
  "matcher": "",
  "hooks": [{
    "type": "command",
    "command": "node \"${CLAUDE_PLUGIN_ROOT}/scripts/hooks/learner-state-persist.js\""
  }],
  "description": "Persist learner profile and session state on every response completion"
}
```

Default 5-second timeout applies.

## Input/Output Contract

**stdin:** JSON object from Claude Code (Stop event). Fields available:
- `session_id` (string)
- `transcript_path` (string | null)
- `tool_name` (string — empty for Stop events)

**stdout:** Empty. This hook does not inject context (it runs at the end of a response, not the beginning).

**stderr:** Diagnostic logging (e.g., "[MDH:Persist] Profile saved", "[MDH:Persist] Session entry updated").

**Exit code:** Always 0. Persistence failures are logged but never block.

## Implementation Specification

1. **Read stdin** — Parse JSON from stdin (buffered, 1MB max). Extract `session_id` and `transcript_path`.

2. **Load current profile** — Read the profile from disk via `learnerProfile.loadProfile()`. This is the authoritative state — other hooks (level-signal-capture) may have written to it since session start.

3. **Update timestamps** — Set `profile.updated_at` to current ISO8601 timestamp.

4. **Update or create session history entry:**
   - Search `profile.session_history` for an entry with matching `session_id`.
   - If found (Stop fires multiple times per session): update `duration_minutes` (now minus session start), `signals_captured` count, `level_changes` array, and `user_initiated_actions`/`claude_initiated_actions` counts.
   - If not found (first Stop in this session): create a new entry with:
     ```json
     {
       "session_id": "<from stdin>",
       "date": "<YYYY-MM-DD>",
       "duration_minutes": null,
       "project_id": "<active project id or null>",
       "pipeline_steps_executed": [],
       "signals_captured": 0,
       "level_changes": [],
       "concepts_introduced": [],
       "user_initiated_actions": 0,
       "claude_initiated_actions": 0,
       "handoff_notes": null
     }
     ```

5. **Extract session summary from transcript** (if `transcript_path` is available and file exists):
   - Parse the JSONL transcript file.
   - Count user messages vs assistant messages (for `user_initiated_actions` / `claude_initiated_actions`).
   - Extract tool usage summary for the session entry.
   - This is lightweight parsing — skip lines that fail to parse.

6. **Trim session history** — Keep only the last 50 sessions to prevent unbounded growth. Older sessions are removed from the array (data is ephemeral; the profile dimensions carry the durable state).

7. **Write profile to disk** — Atomic write via `learnerProfile.saveProfile(profile)`. The save function writes to a temp file first, then renames (atomic on POSIX; best-effort on Windows).

8. **Log diagnostics** — Write to stderr: profile saved, session entry status, any warnings.

9. **Exit 0** — Always.

**Error handling:** All operations wrapped in try/catch. If the profile cannot be loaded, log and exit 0 (a persist failure is non-fatal — the data will be captured next time). If the transcript file is missing or unparseable, skip transcript extraction and save what we have. Never throw.

## Implementation Notes

(Empty — filled during implementation)

## Test Requirements

- **Profile save on Stop:** Verify profile is written to disk with updated `updated_at` timestamp.
- **Session entry creation:** On first Stop with a new session_id, verify a new session_history entry is created with correct defaults.
- **Session entry update:** On subsequent Stop events with the same session_id, verify the existing entry is updated (not duplicated).
- **Transcript parsing:** Given a valid JSONL transcript, verify user/assistant message counts are extracted.
- **Missing transcript:** When transcript_path is null or file missing, verify graceful degradation (save profile without transcript data).
- **Session history trimming:** When session_history exceeds 50 entries, verify oldest entries are removed.
- **Atomic write safety:** Verify profile is not corrupted if the process is killed mid-write (temp file + rename pattern).
- **Profile load failure:** When profile cannot be loaded, verify exit 0 with error logged.
- **stdin parsing:** Verify graceful handling of malformed stdin JSON.
- **Idempotency:** Multiple Stop events in a single session produce a consistent profile (no duplicated entries, counters do not reset).
