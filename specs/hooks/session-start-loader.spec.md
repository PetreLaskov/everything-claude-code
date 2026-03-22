# Component: session-start-loader
## Type: hook
## Status: pending
## Dependencies: scripts/lib/learner-profile.js, specs/contracts/hook-io-contract.md, specs/contracts/learner-profile-schema.md, specs/contracts/phase-transition-contract.md
## Session Target: 7

## What This Is

The session-start-loader hook runs on every SessionStart event. It loads the learner profile from disk, creates a default profile if none exists, detects pending phase transition proposals, and injects learner context into Claude's session via stdout. This is the entry point for every MDH session — it ensures Claude always knows who the learner is and where they are in their journey.

## Hook Configuration

```json
{
  "event": "SessionStart",
  "matcher": "",
  "hooks": [{
    "type": "command",
    "command": "node \"${CLAUDE_PLUGIN_ROOT}/scripts/hooks/session-start-loader.js\""
  }],
  "description": "Load learner profile and recent session context at session start",
  "timeout": 10
}
```

Note: 10-second timeout (longer than other hooks) because first-run profile creation may involve directory creation and writing defaults.

## Input/Output Contract

**stdin:** JSON object from Claude Code (SessionStart event). Fields available:
- `session_id` (string)
- `transcript_path` (string | null)

**stdout:** Injected into Claude's context as a system message. Outputs a structured learner context block:
```
[MDH Learner Context]
Phase: <N> (<phase_name>)
Verbosity: <N>
Teaching Mode: <directive|socratic>
Active Project: <name> (milestone <N>) | None
Dimensions: <dimension>: L<level> (confidence <N>), ...
Session Count: <N>
<optional: Phase Transition Pending — see phase-transition-contract.md>
<optional: Last Session Summary — handoff_notes from most recent session_history entry>
```

**stderr:** Diagnostic logging only (e.g., "[MDH:SessionStart] Profile loaded", "[MDH:SessionStart] Created default profile").

**Exit code:** Always 0. Never blocks session start, even on errors.

## Implementation Specification

1. **Read stdin** — Parse JSON from stdin (buffered, 1MB max). Extract `session_id`.

2. **Resolve profile path** — `path.join(process.env.CLAUDE_PLUGIN_ROOT || path.resolve(__dirname, '../..'), 'state', 'learner-profile.json')`. Also check `MDH_STATE_DIR` env var override.

3. **Load or create profile:**
   - If profile file exists: read and parse JSON via `learnerProfile.loadProfile()`.
   - If profile file does not exist: call `learnerProfile.createDefaultProfile()` which creates the file with all dimensions at level 0, confidence 0.3, verbosity 3, phase 0, teaching_mode "directive", empty projects, empty session_history, zeroed signal_accumulator.
   - If profile file exists but fails to parse: log error to stderr, create a fresh default profile, rename the corrupted file to `learner-profile.corrupted.<timestamp>.json`.

4. **Validate schema version** — Check `profile.schema_version` matches expected "1.0.0". If mismatch, log warning to stderr and attempt to migrate (future-proofing; for v1.0 just warn and proceed).

5. **Detect pending phase transition** — Check `profile.settings.phase_proposed !== null`. If present:
   - Check `profile.settings.phase_deferred_until_session` — if set and current session count is less than that value, suppress the announcement.
   - Otherwise, include the transition announcement in stdout output per phase-transition-contract.md.

6. **Extract last session summary** — Read the last entry in `profile.session_history`. If it has `handoff_notes`, include them in the context output.

7. **Find active project** — Scan `profile.projects` for `status === 'active'`. If found, include project name and current milestone in context output.

8. **Build context string** — Assemble the `[MDH Learner Context]` block described in Output above. Write to stdout.

9. **Log diagnostics** — Write status to stderr: profile loaded/created, session count, active project if any.

10. **Exit 0** — Always.

**Error handling:** Every step is wrapped in try/catch. On any error, log to stderr and exit 0. A failed session-start-loader must never prevent the session from starting. If the profile cannot be loaded or created, output a minimal context block: `[MDH Learner Context]\nPhase: 0 (Discovery)\nVerbosity: 3\nNo profile loaded — using defaults.`

## Implementation Notes

(Empty — filled during implementation)

## Test Requirements

- **Default profile creation:** When no profile exists, verify a valid default profile is created with correct schema, all dimensions at level 0, confidence 0.3.
- **Profile loading:** When a valid profile exists, verify it is loaded and context output includes correct phase, verbosity, dimensions.
- **Corrupted profile recovery:** When profile JSON is invalid, verify corrupted file is renamed and a new default is created.
- **Phase transition detection:** When `phase_proposed` is set, verify the transition announcement appears in stdout.
- **Phase transition suppression:** When `phase_deferred_until_session` is set to a future session count, verify the transition is NOT announced.
- **Active project inclusion:** When an active project exists, verify it appears in the context output.
- **Last session handoff:** When `session_history` has entries with `handoff_notes`, verify notes appear in context.
- **Empty session history:** When `session_history` is empty, verify no error and clean output.
- **Error resilience:** Verify exit code is always 0, even when file system operations fail.
- **stdin parsing:** Verify graceful handling of malformed stdin JSON.
