'use strict';

// learner-state-persist.js — Stop hook
// Persists learner profile and records session history entry on session end.

const path = require('path');

function main() {
  try {
    const lp = require(path.resolve(__dirname, '../lib/learner-profile'));

    let profile = lp.loadProfile();
    if (!profile) {
      // Nothing to persist
      process.exit(0);
      return;
    }

    // Build session history entry
    const now = new Date();
    const lastSession = lp.getLastSession(profile);

    // Estimate session duration from last session start or profile update
    let durationMinutes = 0;
    if (lastSession && lastSession.date) {
      const lastDate = new Date(lastSession.date);
      const diffMs = now.getTime() - lastDate.getTime();
      // Only count if less than 24 hours (sanity check)
      if (diffMs > 0 && diffMs < 86400000) {
        durationMinutes = Math.round(diffMs / 60000);
      }
    }

    // Build dimension signal summary from accumulator
    const dimensionSignals = {};
    for (const [dim, acc] of Object.entries(profile.signal_accumulator || {})) {
      dimensionSignals[dim] = {
        positive: acc > 0 ? Math.round(acc * 100) / 100 : 0,
        negative: acc < 0 ? Math.round(Math.abs(acc) * 100) / 100 : 0,
      };
    }

    const settings = profile.settings || {};
    const sessionEntry = {
      date: now.toISOString(),
      duration_minutes: durationMinutes,
      phase: settings.phase != null ? settings.phase : 0,
      dimension_signals: dimensionSignals,
      level_changes: [],
    };

    // Add session entry and save
    const updated = lp.addSessionEntry(profile, sessionEntry);
    lp.saveProfile(updated);

    process.stdout.write(JSON.stringify({
      type: 'mdh_session_saved',
      date: sessionEntry.date,
      duration_minutes: durationMinutes,
    }));
  } catch (err) {
    // Best-effort persistence — never block session end
    process.stderr.write(`learner-state-persist: ${err.message}\n`);
  }
  process.exit(0);
}

main();
