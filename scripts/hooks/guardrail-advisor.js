'use strict';

// guardrail-advisor.js — PreToolUse hook for Write|Edit events
// Provides warn-only advice before file writes. NEVER blocks.

const fs = require('fs');
const path = require('path');

// --- Warning patterns ---

const SECRET_PATTERNS = [
  /(?:api[_-]?key|secret|password|token|credential)\s*[:=]\s*['"][^'"]{8,}['"]/i,
  /(?:AKIA|sk-|ghp_|gho_|glpat-|xox[bpoas]-)\w+/,
  /-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/,
];

const LARGE_FILE_THRESHOLD = 800;

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

    const toolInput = input.tool_input || {};
    const content = toolInput.content || toolInput.new_string || '';
    const filePath = toolInput.file_path || '';
    const warnings = [];

    // Check for hardcoded secrets
    for (const pattern of SECRET_PATTERNS) {
      if (pattern.test(content)) {
        warnings.push({
          severity: 'high',
          message: 'Possible hardcoded secret detected. Use environment variables or a secrets manager instead.',
        });
        break;
      }
    }

    // Check for large file writes
    if (content) {
      const lineCount = content.split('\n').length;
      if (lineCount > LARGE_FILE_THRESHOLD) {
        warnings.push({
          severity: 'medium',
          message: `Large file write (${lineCount} lines). Consider splitting into smaller, focused modules.`,
        });
      }
    }

    // Check for sensitive file paths
    if (/\.env(?:\.|$)|secrets?\./i.test(filePath)) {
      warnings.push({
        severity: 'high',
        message: 'Writing to a sensitive file. Ensure this file is in .gitignore and contains no real credentials.',
      });
    }

    // Output warnings if any
    if (warnings.length > 0) {
      // Load profile for phase-appropriate messaging
      let phase = 0;
      try {
        const lp = require(path.resolve(__dirname, '../lib/learner-profile'));
        const profile = lp.loadProfile();
        if (profile) phase = profile.settings.phase || 0;
      } catch {
        // Use default phase
      }

      const output = {
        type: 'mdh_guardrail_advice',
        warnings,
        phase,
        note: phase <= 2
          ? 'These are learning moments — here is why these patterns matter:'
          : 'Quick check:',
      };
      process.stdout.write(JSON.stringify(output));
    }
  } catch (err) {
    // Never block — guardrails are advisory only
    process.stderr.write(`guardrail-advisor: ${err.message}\n`);
  }
  // Always exit 0 — warn-only policy
  process.exit(0);
}

main();
