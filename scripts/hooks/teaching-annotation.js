'use strict';

// teaching-annotation.js — PostToolUse hook for Write|Edit events
// Calculates annotation depth and teaching mode guidance for the current learner.
// Output: JSON on stdout consumed by Claude as context injection.

const fs = require('fs');
const path = require('path');

// --- File pattern → sub-concept mapping ---

const FILE_SUBCONCEPT_MAP = [
  { pattern: /\.(test|spec)\.(js|ts|jsx|tsx)$|__tests__\//, subConcept: 'tdd_red_green_refactor', dimension: 'implementation' },
  { pattern: /\.env|secrets?|credentials/i, subConcept: 'secrets_management', dimension: 'security' },
  { pattern: /auth|middleware/i, subConcept: 'auth_basics', dimension: 'security' },
  { pattern: /\.plan\.md$|PLAN\.md$|\/plans\//i, subConcept: 'requirements_analysis', dimension: 'planning' },
  { pattern: /Dockerfile|docker-compose/i, subConcept: 'separation_of_concerns', dimension: 'architecture' },
];

// --- Main ---

function main() {
  try {
    // Read stdin
    let raw = '';
    try {
      raw = fs.readFileSync(0, 'utf-8').trim();
    } catch {
      // stdin not available
    }

    if (!raw) {
      process.exit(0);
      return;
    }

    let input;
    try {
      input = JSON.parse(raw);
    } catch {
      process.exit(0);
      return;
    }

    // Load learner profile
    let profile;
    try {
      const lp = require(path.resolve(__dirname, '../lib/learner-profile'));
      profile = lp.loadProfile();
      if (!profile) {
        profile = lp.createDefaultProfile();
      }
    } catch {
      // Fallback defaults
      profile = {
        settings: { verbosity: 3, phase: 0, teaching_mode: 'directive' },
        dimensions: {
          implementation: { level: 0, fractional_level: 0, sub_concepts: {} },
        },
      };
    }

    const settings = profile.settings || { verbosity: 3, phase: 0, teaching_mode: 'directive' };
    const verbosity = settings.verbosity != null ? settings.verbosity : 3;
    const phase = settings.phase != null ? settings.phase : 0;
    const teachingMode = settings.teaching_mode || 'directive';

    // Relevant dimension for Write/Edit is implementation
    const dimension = 'implementation';
    const dimData = (profile.dimensions && profile.dimensions[dimension]) || { level: 0, sub_concepts: {} };
    const dimensionLevel = dimData.level != null ? dimData.level : 0;

    // Base annotation depth: max(0, verbosity - (dimension_level - 1)), clamped to 0-5
    let annotationDepth = Math.min(5, Math.max(0, verbosity - (dimensionLevel - 1)));

    // Phase override flag: Phase 0-1 signals full annotation to agents
    // The flag tells agents to annotate fully; the depth formula still applies
    // so agents can see the computed depth AND know the phase context.
    let phaseOverride = false;
    if (phase <= 1) {
      phaseOverride = true;
    }

    // Novel concept detection
    let novelConcept = false;
    const filePath = (input.tool_input && input.tool_input.file_path) || '';
    const content = (input.tool_input && (input.tool_input.content || input.tool_input.new_string)) || '';

    if (dimData.sub_concepts) {
      for (const [scName, scData] of Object.entries(dimData.sub_concepts)) {
        if (scData && scData.confidence < 0.4) {
          const related = FILE_SUBCONCEPT_MAP.some(
            m => m.subConcept === scName && (m.pattern.test(filePath) || m.pattern.test(content))
          );
          if (related) {
            novelConcept = true;
            if (annotationDepth === 0) {
              annotationDepth = Math.min(5, Math.max(1, verbosity));
            }
            break;
          }
        }
      }
    }

    // Build output
    const output = {
      annotation_depth: annotationDepth,
      teaching_mode: teachingMode,
      dimension,
      dimension_level: dimensionLevel,
      phase,
    };

    if (phaseOverride) output.phase_override = true;
    if (novelConcept) output.novel_concept = true;

    process.stdout.write(JSON.stringify(output));
  } catch (err) {
    // Never block — warn-only
    process.stderr.write(`teaching-annotation: ${err.message}\n`);
  }
  process.exit(0);
}

main();
