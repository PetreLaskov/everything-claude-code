'use strict';

// session-start-loader.js — SessionStart hook
// Loads learner profile and injects context summary into Claude's session.

const fs = require('fs');
const path = require('path');

function main() {
  try {
    const lp = require(path.resolve(__dirname, '../lib/learner-profile'));

    let profile = lp.loadProfile();
    if (!profile) {
      profile = lp.createDefaultProfile();
    }

    const settings = profile.settings || {};
    const phase = settings.phase != null ? settings.phase : 0;
    const verbosity = settings.verbosity != null ? settings.verbosity : 3;
    const teachingMode = settings.teaching_mode || 'directive';
    const phaseLabel = lp.getPhaseLabel(phase);

    // Build dimension summary
    const dimSummary = {};
    for (const [name, dim] of Object.entries(profile.dimensions || {})) {
      dimSummary[name] = {
        level: dim.level,
        label: lp.getLevelLabel(dim.level),
        fractional: dim.fractional_level,
      };
    }

    // Active project
    const activeProject = lp.getActiveProject(profile);

    // Last session
    const lastSession = lp.getLastSession(profile);

    const context = {
      type: 'mdh_session_context',
      phase,
      phase_label: phaseLabel,
      verbosity,
      teaching_mode: teachingMode,
      dimensions: dimSummary,
      active_project: activeProject ? {
        name: activeProject.name,
        type: activeProject.type,
        status: activeProject.status,
      } : null,
      last_session: lastSession ? {
        date: lastSession.date,
        duration_minutes: lastSession.duration_minutes,
      } : null,
      user: profile.user || {},
    };

    process.stdout.write(JSON.stringify(context));
  } catch (err) {
    // Never block session start — output minimal context
    process.stderr.write(`session-start-loader: ${err.message}\n`);
    process.stdout.write(JSON.stringify({
      type: 'mdh_session_context',
      phase: 0,
      phase_label: 'Discovery',
      verbosity: 3,
      teaching_mode: 'directive',
      error: 'Failed to load profile — using defaults',
    }));
  }
  process.exit(0);
}

main();
