'use strict';

// level-signal-capture.js — PostToolUse hook for all tools
// Extracts behavioral signals and updates learner levels.

const fs = require('fs');
const path = require('path');

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

    const toolName = input.tool_name || '';
    const toolInput = input.tool_input || {};
    const toolOutput = input.tool_output || null;

    // Load profile
    const lp = require(path.resolve(__dirname, '../lib/learner-profile'));
    let profile = lp.loadProfile();
    if (!profile) {
      profile = lp.createDefaultProfile();
    }

    // Extract signals
    const sp = require(path.resolve(__dirname, '../lib/signal-parser'));
    const context = {
      filePath: toolInput.file_path || '',
      recentSignals: [],
    };
    const signals = sp.extractSignals(toolName, toolInput, toolOutput, profile, context);

    if (signals.length === 0) {
      process.exit(0);
      return;
    }

    // Filter false positives
    const validSignals = signals.filter(s => !sp.isFalsePositive(s, profile, context));

    if (validSignals.length === 0) {
      process.exit(0);
      return;
    }

    // Apply signals to profile via competence engine
    const ce = require(path.resolve(__dirname, '../lib/competence-engine'));
    let updated = profile;
    const levelChanges = [];

    for (const signal of validSignals) {
      const result = ce.updateLevel(updated, signal);
      updated = result.profile;
      if (result.levelChanged) {
        levelChanges.push({
          dimension: result.dimension,
          direction: result.direction,
          newLevel: result.newLevel,
        });
      }
    }

    // Persist updated profile
    lp.saveProfile(updated);

    // Output level change notifications
    if (levelChanges.length > 0) {
      const output = {
        type: 'mdh_level_update',
        signals_captured: validSignals.length,
        level_changes: levelChanges,
      };
      process.stdout.write(JSON.stringify(output));
    }
  } catch (err) {
    // Never block — signal capture is best-effort
    process.stderr.write(`level-signal-capture: ${err.message}\n`);
  }
  process.exit(0);
}

main();
