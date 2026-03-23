'use strict';

// --- Signal Rules ---

const SIGNAL_RULES = {
  positive: [
    { id: 'conventional_commit', dimension: 'git_workflow', weight: 0.15, sub_concept: 'commit_messages', detector: 'detectConventionalCommit' },
    { id: 'manual_verification', dimension: 'verification', weight: 0.15, sub_concept: 'build_check', detector: 'detectManualVerification' },
    { id: 'security_write', dimension: 'security', weight: 0.20, sub_concept: 'secrets_management', detector: 'detectSecurityWrite' },
    { id: 'edge_case_test', dimension: 'implementation', weight: 0.20, sub_concept: 'tdd_red_green_refactor', detector: 'detectEdgeCaseTest' },
    { id: 'plan_modification', dimension: 'planning', weight: 0.15, sub_concept: 'requirements_analysis', detector: 'detectPlanModification' },
  ],
  negative: [
    { id: 'build_fail_after_edit', dimension: 'implementation', weight: -0.05, sub_concept: 'error_handling', detector: 'detectBuildFailAfterEdit' },
    { id: 'large_file_write', dimension: 'architecture', weight: -0.05, sub_concept: 'file_structure', detector: 'detectLargeFileWrite' },
  ],
};

// --- Passive tools that never produce signals ---

const PASSIVE_TOOLS = new Set(['Read', 'Glob', 'Grep', 'Search', 'WebSearch', 'WebFetch']);

// --- Conventional commit pattern ---

const CONVENTIONAL_COMMIT_RE = /^(feat|fix|refactor|docs|test|chore|perf|ci)(\(.+\))?: .+/;

// --- Detectors ---

function detectConventionalCommit(toolName, toolInput) {
  if (toolName !== 'Bash') return null;
  const cmd = toolInput.command || '';
  if (!cmd.includes('git commit')) return null;

  // Extract the commit message from the command
  const msgMatch = cmd.match(/git commit\s+.*-m\s+["'](.+?)["']/);
  if (!msgMatch) return null;

  if (CONVENTIONAL_COMMIT_RE.test(msgMatch[1])) {
    return {
      dimension: 'git_workflow',
      weight: 0.15,
      reason: `Conventional commit message: "${msgMatch[1]}"`,
      type: 'positive',
      sub_concept: 'commit_messages',
    };
  }
  return null;
}

const VERIFICATION_RE = /^(npm test|npm run test|npm run build|npm run lint|npx jest|npx vitest|npx tsc)/;

function detectManualVerification(toolName, toolInput) {
  if (toolName !== 'Bash') return null;
  const cmd = (toolInput.command || '').trim();
  if (VERIFICATION_RE.test(cmd)) {
    return {
      dimension: 'verification',
      weight: 0.15,
      reason: `Manual verification run: ${cmd}`,
      type: 'positive',
      sub_concept: 'build_check',
    };
  }
  return null;
}

const FAILURE_INDICATORS = ['FAIL', 'Error:', 'error TS', 'Build failed', 'ERR!', 'ELIFECYCLE'];

function detectBuildFailAfterEdit(toolName, toolInput, toolOutput, profile, context) {
  if (toolName !== 'Bash') return null;
  if (!toolOutput) return null;

  // Phase-gated: only at Phase 3+
  if (profile.settings.phase < 3) return null;

  // Must have been preceded by a user edit
  if (!context || !context.lastToolWasUserEdit) return null;

  const hasFailure = FAILURE_INDICATORS.some(indicator => toolOutput.includes(indicator));
  if (!hasFailure) return null;

  return {
    dimension: 'implementation',
    weight: -0.05,
    reason: 'Build/test failure after user-directed edit',
    type: 'negative',
    sub_concept: 'error_handling',
  };
}

const SECURITY_PATTERNS = [
  /process\.env\.\w+/,
  /if\s*\(\s*!\w/,               // input validation: if (!
  /schema\s*\.\s*validate/i,     // schema validation
  /\.sanitize\(/,                 // sanitization
  /helmet\(/,                     // security middleware
  /auth.*middleware/i,            // auth middleware
];

function detectSecurityWrite(toolName, toolInput, _toolOutput, profile) {
  if (toolName !== 'Write' && toolName !== 'Edit') return null;

  // Skip if security level >= 3 (expected behavior)
  if (profile.dimensions.security.level >= 3) return null;

  const content = toolInput.content || toolInput.new_string || '';
  const hasSecurityPattern = SECURITY_PATTERNS.some(re => re.test(content));

  if (hasSecurityPattern) {
    return {
      dimension: 'security',
      weight: 0.20,
      reason: 'Security-conscious code pattern detected',
      type: 'positive',
      sub_concept: 'secrets_management',
    };
  }
  return null;
}

const TEST_FILE_RE = /\.(test|spec)\.(js|ts|jsx|tsx)$|__tests__\//;
const TEST_CASE_RE = /\b(it|test|describe)\s*\(/g;
const ERROR_KEYWORDS = /invalid|null|error|fail|boundary|edge|empty|missing|unauthorized|forbidden|timeout|overflow/i;

function detectEdgeCaseTest(toolName, toolInput) {
  if (toolName !== 'Write' && toolName !== 'Edit') return null;

  const filePath = toolInput.file_path || '';
  if (!TEST_FILE_RE.test(filePath)) return null;

  const content = toolInput.content || toolInput.new_string || '';

  // Count test cases that look like error/edge cases
  const testCases = content.match(TEST_CASE_RE) || [];
  if (testCases.length < 3) return null; // Need meaningful test coverage

  // Check if tests include error/edge case handling
  if (ERROR_KEYWORDS.test(content)) {
    return {
      dimension: 'implementation',
      weight: 0.20,
      reason: 'Edge case and error handling tests detected',
      type: 'positive',
      sub_concept: 'tdd_red_green_refactor',
    };
  }
  return null;
}

const PLAN_FILE_RE = /\.plan\.md$|PLAN\.md$|\/plans\//i;

function detectPlanModification(toolName, toolInput) {
  if (toolName !== 'Edit') return null;

  const filePath = toolInput.file_path || '';
  if (!PLAN_FILE_RE.test(filePath)) return null;

  const content = toolInput.new_string || '';
  // Must be substantive (not just whitespace changes)
  if (content.trim().length < 10) return null;

  return {
    dimension: 'planning',
    weight: 0.15,
    reason: 'Plan file modified with substantive changes',
    type: 'positive',
    sub_concept: 'requirements_analysis',
  };
}

function detectLargeFileWrite(toolName, toolInput, _toolOutput, _profile, context) {
  if (toolName !== 'Write') return null;

  // Attribution guard: only if user-directed
  if (context && context.isUserDirected === false) return null;

  const content = toolInput.content || '';
  const lineCount = content.split('\n').length;

  if (lineCount > 800) {
    return {
      dimension: 'architecture',
      weight: -0.05,
      reason: `Large file write (${lineCount} lines) — consider splitting`,
      type: 'negative',
      sub_concept: 'file_structure',
    };
  }
  return null;
}

// --- Detector registry ---

const DETECTORS = {
  detectConventionalCommit,
  detectManualVerification,
  detectBuildFailAfterEdit,
  detectSecurityWrite,
  detectEdgeCaseTest,
  detectPlanModification,
  detectLargeFileWrite,
};

// --- Public API ---

function extractSignals(toolName, toolInput, toolOutput, profile, context) {
  // Passive tools never produce signals
  if (PASSIVE_TOOLS.has(toolName)) return [];

  const signals = [];

  // Run all positive detectors
  for (const rule of SIGNAL_RULES.positive) {
    const detector = DETECTORS[rule.detector];
    if (detector) {
      const signal = detector(toolName, toolInput, toolOutput, profile, context);
      if (signal) signals.push(signal);
    }
  }

  // Run all negative detectors
  for (const rule of SIGNAL_RULES.negative) {
    const detector = DETECTORS[rule.detector];
    if (detector) {
      const signal = detector(toolName, toolInput, toolOutput, profile, context);
      if (signal) signals.push(signal);
    }
  }

  return signals;
}

// --- False Positive Filter Patterns ---

const FIXTURE_PATHS = /\/(fixtures|__mocks__|test-data)\//;

function isFalsePositive(signal, profile, context) {
  // 1. Confidence gate — suppress weak signals on well-established dimensions
  if (profile.dimensions[signal.dimension]) {
    const confidence = profile.dimensions[signal.dimension].confidence;
    if (confidence > 0.85 && Math.abs(signal.weight) < 0.10) {
      return true;
    }
  }

  // 2. Repetition suppression — same dimension+type within recent signals
  const recent = (context && context.recentSignals) || [];
  const isDuplicate = recent.some(
    s => s.dimension === signal.dimension && s.type === signal.type
  );
  if (isDuplicate) return true;

  // 3. Test fixture exclusion
  const filePath = (context && context.filePath) || '';
  if (FIXTURE_PATHS.test(filePath)) return true;

  return false;
}

function getSignalRules() {
  return {
    positive: SIGNAL_RULES.positive.map(r => ({ ...r })),
    negative: SIGNAL_RULES.negative.map(r => ({ ...r })),
  };
}

// --- Exports ---

module.exports = {
  extractSignals,
  getSignalRules,
  isFalsePositive,
};
