# Component: project-templates.js
## Type: script (library)
## Status: pending
## Dependencies: No external dependencies. Pure data and matching logic.
## Session Target: 2

## What This Is

The project-templates library contains the project archetype definitions and matching logic used during Phase 0 (Discovery). It stores structured data about each project type — what it builds, what it teaches, how difficult it is, what milestones it has — and provides functions to match user interests to appropriate project archetypes and scale difficulty based on learner level.

## Public API

```javascript
/**
 * Get all project templates.
 * @returns {object[]} Array of all project template objects
 */
function getAllTemplates()

/**
 * Get a template by its ID.
 * @param {string} id - Template ID (e.g., "web-dashboard")
 * @returns {object|null} The template, or null if not found
 */
function getTemplateById(id)

/**
 * Get templates filtered by route.
 * @param {string} route - Route name ("web_app", "automation", "api_integration", "data_tool", "cli_tool", "mobile_desktop")
 * @returns {object[]} Templates matching the route
 */
function getTemplatesByRoute(route)

/**
 * Match templates to user interests and profile.
 * Returns templates sorted by relevance score (best match first).
 * @param {object} userProfile - The learner profile (reads user.interests, user.domain, settings.phase, dimensions)
 * @param {object} [options] - Optional filters
 * @param {number} [options.maxDifficulty] - Maximum difficulty (1-5)
 * @param {string} [options.route] - Filter by route
 * @param {number} [options.maxResults=3] - Maximum number of results
 * @returns {{ template: object, relevanceScore: number, reason: string }[]}
 */
function matchTemplates(userProfile, options)

/**
 * Scale a template's milestones based on learner level.
 * Higher-level learners get condensed milestones; lower-level learners get expanded ones.
 * @param {object} template - The project template
 * @param {number} averageLevel - The learner's average dimension level (0-5)
 * @returns {object[]} Adjusted milestones array
 */
function scaleMilestones(template, averageLevel)

/**
 * Get the dimensions that a template develops most.
 * Returns dimensions sorted by development weight (highest first).
 * @param {object} template - The project template
 * @returns {{ dimension: string, weight: number }[]}
 */
function getPrimaryDimensions(template)

/**
 * Get all available route names.
 * @returns {string[]} Array of route names
 */
function getRoutes()
```

## Implementation Specification

### Template Data Structure

Each template follows this schema (from plan section 3.3):

```javascript
{
  id: "string",                    // Unique identifier (e.g., "web-dashboard")
  route: "string",                 // Route category
  name: "string",                  // Display name
  tagline: "string",               // One-line description
  difficulty: 1-5,                 // Difficulty level
  estimated_sessions: number,      // Expected sessions to complete
  tech_stack: ["string"],          // Technologies used
  dimensions_developed: {          // How much each dimension is exercised
    research: 0.0-1.0,
    planning: 0.0-1.0,
    implementation: 0.0-1.0,
    review: 0.0-1.0,
    security: 0.0-1.0,
    verification: 0.0-1.0,
    git_workflow: 0.0-1.0,
    architecture: 0.0-1.0,
    orchestration: 0.0-1.0
  },
  milestones: [
    { name: "string", description: "string", sessions: number }
  ],
  learning_moments: ["string"],    // Key concepts taught during this project
  keywords: ["string"]            // For interest matching
}
```

### Initial Templates (6 routes, minimum 1 per route)

**Route: web_app**
- `web-dashboard` — Personal Dashboard (difficulty 2, ~8 sessions)
- `booking-tool` — Simple Booking System (difficulty 3, ~10 sessions)

**Route: automation**
- `file-organizer` — File Organization Tool (difficulty 1, ~4 sessions)
- `data-pipeline` — Data Processing Pipeline (difficulty 3, ~8 sessions)

**Route: api_integration**
- `webhook-handler` — Webhook Receiver + Processor (difficulty 2, ~6 sessions)
- `slack-bot` — Slack Bot (difficulty 3, ~8 sessions)

**Route: data_tool**
- `csv-analyzer` — CSV Analysis Tool (difficulty 1, ~4 sessions)
- `report-generator` — Automated Report Generator (difficulty 2, ~6 sessions)

**Route: cli_tool**
- `project-scaffolder` — Project Template Generator (difficulty 2, ~5 sessions)
- `dev-utility` — Custom Dev Workflow Tool (difficulty 1, ~3 sessions)

**Route: mobile_desktop**
- `desktop-app` — Electron Desktop App (difficulty 3, ~10 sessions)

### Template Matching Algorithm

`matchTemplates(userProfile, options)`:

1. Start with all templates. Apply filters:
   - If `options.maxDifficulty` set, exclude templates with higher difficulty.
   - If `options.route` set, include only that route.

2. For each remaining template, compute a relevance score (0.0-1.0):
   - **Interest match** (weight 0.4): Compare `template.keywords` against `userProfile.user.interests` and `userProfile.user.domain`. Score = matched keywords / total keywords.
   - **Difficulty fit** (weight 0.3): Optimal difficulty is `averageLevel + 1` (slightly challenging). Score = `1.0 - abs(template.difficulty - optimalDifficulty) * 0.25`. Clamp to 0.0-1.0.
   - **Dimension gap fill** (weight 0.3): Prefer templates that develop the learner's weakest dimensions. For each dimension in `dimensions_developed`, multiply the template weight by `(5 - learner_level) / 5`. Sum and normalize.

3. Sort by relevance score descending. Return top `options.maxResults` (default 3).

4. Each result includes a `reason` string explaining why this template was suggested (for the project-advisor agent to use).

### Milestone Scaling

`scaleMilestones(template, averageLevel)`:

- Level 0-1: Expand milestones. Add an extra "Setup & Orientation" milestone at the start (1 session). Double the sessions estimate for the first substantive milestone.
- Level 2-3: Use milestones as-is from the template.
- Level 4-5: Condense milestones. Merge the first two milestones into one. Reduce session estimates by 30% (floor of 1).

Returns a new array (does not mutate the template).

## Interface Contract Reference

Referenced by: `specs/contracts/learner-profile-schema.md` (project entries reference template archetypes by ID)

## Implementation Notes

(Empty — filled during implementation)

## Test Requirements

- **getAllTemplates:** Returns at least 11 templates covering all 6 routes.
- **getTemplateById — found:** Returns correct template for "web-dashboard".
- **getTemplateById — not found:** Returns null for "nonexistent-id".
- **getTemplatesByRoute:** Returns only templates with the specified route. Returns empty array for unknown route.
- **matchTemplates — interest matching:** Profile with interests ["dashboard", "web"] ranks "web-dashboard" highly.
- **matchTemplates — difficulty filter:** With maxDifficulty 1, only difficulty-1 templates are returned.
- **matchTemplates — route filter:** With route "cli_tool", only CLI templates are returned.
- **matchTemplates — dimension gap fill:** Profile with all dimensions at 0 except implementation at 4 ranks templates that develop non-implementation dimensions higher.
- **matchTemplates — maxResults:** Default returns 3. Setting maxResults to 1 returns 1.
- **matchTemplates — result includes reason:** Each result has a non-empty reason string.
- **scaleMilestones — beginner expansion:** At averageLevel 0, verify extra "Setup & Orientation" milestone is added.
- **scaleMilestones — advanced condensation:** At averageLevel 5, verify milestones are merged and session estimates reduced.
- **scaleMilestones — mid-level passthrough:** At averageLevel 2, verify milestones match the template exactly.
- **scaleMilestones — immutability:** Verify original template milestones are not modified.
- **getPrimaryDimensions:** For "web-dashboard", implementation should be the highest-weighted dimension.
- **getRoutes:** Returns exactly 6 route names.
- **Template schema validity:** Every template has all required fields with correct types.
