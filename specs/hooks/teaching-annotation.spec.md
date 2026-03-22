# Component: teaching-annotation
## Type: hook
## Status: pending
## Dependencies: scripts/lib/learner-profile.js, specs/contracts/hook-io-contract.md, specs/contracts/agent-annotation-contract.md, specs/contracts/learner-profile-schema.md
## Session Target: 7

## What This Is

The teaching-annotation hook runs on PostToolUse events for Write and Edit tools. It reads the current learner profile and computes the appropriate annotation depth for the next Claude response. It outputs annotation guidance to stdout, which Claude uses to calibrate explanation depth, teaching mode, and concept coverage. This is the mechanism that makes teaching adaptive within a single session — it recalculates annotation parameters on every file write or edit.

## Hook Configuration

```json
{
  "event": "PostToolUse",
  "matcher": "Write|Edit",
  "hooks": [{
    "type": "command",
    "command": "node \"${CLAUDE_PLUGIN_ROOT}/scripts/hooks/teaching-annotation.js\"",
    "timeout": 5
  }],
  "description": "Inject teaching annotations based on learner level and verbosity"
}
```

## Input/Output Contract

**stdin:** JSON object from Claude Code (PostToolUse event). Fields:
- `tool_name` (string — "Write" or "Edit")
- `tool_input` (object — includes `file_path`, and for Write: `content`; for Edit: `old_string`, `new_string`)
- `tool_output` (string — tool result)
- `session_id` (string)

**stdout:** Annotation guidance injected into Claude's context:
```
[MDH Teaching Context]
Phase: <N> (<phase_name>)
Annotation Depth: <0-5>
Teaching Mode: <directive|socratic>
File Context: <file_path> (<detected category: source|test|config|style|doc>)
Dimension Focus: <most relevant dimension for this file type>
<optional: Novel Concepts: <sub_concepts with confidence < 0.4 relevant to this file>>
<optional: Annotation Override: Always annotate — novel concept detected>
```

**stderr:** Diagnostic logging (e.g., "[MDH:Annotation] depth=3 mode=directive dim=implementation").

**Exit code:** Always 0.

## Implementation Specification

1. **Read stdin** — Parse JSON from stdin (buffered, 1MB max). Extract `tool_name`, `tool_input` (especially `file_path`), `session_id`.

2. **Load current profile** — Via `learnerProfile.loadProfile()`. If no profile exists, output a default annotation block with depth 5 (maximum teaching for unknown learner) and exit 0.

3. **Determine relevant dimension** — Map the file being written/edited to the most relevant competence dimension:
   - `.test.`, `.spec.`, `__tests__/` in path -> `implementation` (TDD sub-concepts)
   - `.config.`, `.env`, `tsconfig`, `package.json` -> `architecture`
   - `.md`, `.txt`, `docs/` -> (skip annotation — documentation is low-teaching-value)
   - `git`-related operations -> `git_workflow`
   - Security-related files (auth, middleware, validation) -> `security`
   - All other source files -> `implementation`

4. **Compute annotation depth** — Apply the annotation depth formula from agent-annotation-contract.md:
   ```
   annotation_depth = max(0, verbosity - (dimension_level - 1))
   ```
   Where:
   - `verbosity` = `profile.settings.verbosity` (1-5)
   - `dimension_level` = `profile.dimensions[relevant_dimension].level` (0-5)

5. **Check novel concept override** — Scan sub-concepts of the relevant dimension. If any sub-concept has `confidence < 0.4`, this is a novel concept. Override annotation_depth to `max(annotation_depth, 3)` — always explain novel concepts regardless of verbosity.

6. **Determine teaching mode** — From agent-annotation-contract.md:
   - Dimension level 0-1: `directive` (agent explains and demonstrates)
   - Dimension level 2+: `socratic` (agent asks questions, waits for input)
   - However, if `profile.settings.teaching_mode` is explicitly set, use that as a floor (never go below the user's stated preference).

7. **Categorize the file** — Classify the file being written/edited:
   - `source` — application code
   - `test` — test files
   - `config` — configuration files
   - `style` — CSS/styling files
   - `doc` — documentation

8. **Build output** — Assemble the `[MDH Teaching Context]` block. Write to stdout.

9. **Exit 0** — Always.

**Annotation depth behaviors** (reference from agent-annotation-contract.md):

| Depth | Behavior |
|---|---|
| 0 | No annotation. Silent execution. |
| 1 | Step name only. "Planning..." |
| 2 | Step name + one-line rationale. |
| 3 | Full explanation of what and why. Connections to prior concepts. |
| 4 | Full explanation + analogies + context. Questions for the user. |
| 5 | Maximum depth. Background concepts. Multiple analogies. Socratic questions. |

**Error handling:** All operations in try/catch. If profile cannot be loaded, output maximum depth annotation (err on the side of too much teaching, not too little). Exit 0 always.

## Implementation Notes

(Empty — filled during implementation)

## Test Requirements

- **Annotation depth calculation:** For each combination of verbosity (1-5) and dimension level (0-5), verify the formula `max(0, verbosity - (dimension_level - 1))` produces the correct depth.
- **Dimension mapping from file path:** Verify `.test.js` maps to `implementation`, `.config.ts` maps to `architecture`, plain `.js` maps to `implementation`.
- **Novel concept override:** When a sub-concept has confidence 0.2 (< 0.4), verify annotation depth is at least 3 regardless of verbosity setting.
- **Teaching mode selection:** At dimension level 0, verify mode is "directive". At level 2, verify mode is "socratic".
- **Missing profile fallback:** When no profile exists, verify output uses depth 5 and directive mode.
- **Documentation file skip:** When the file is a `.md` file in `docs/`, verify annotation depth is reduced or skipped.
- **Phase inclusion:** Verify the output includes the correct phase name from the profile.
- **File categorization:** Verify source, test, config, style, and doc files are correctly categorized.
- **stdin parsing:** Verify graceful handling of malformed stdin JSON.
- **Performance:** Verify execution under 100ms (this fires on every Write/Edit).
