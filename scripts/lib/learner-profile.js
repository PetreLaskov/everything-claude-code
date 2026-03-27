'use strict';

const fs = require('fs');
const path = require('path');

// --- Constants ---

const SCHEMA_VERSION = '1.0.0';
const MAX_SESSION_HISTORY = 50;

const DIMENSION_NAMES = [
  'research', 'planning', 'implementation', 'review',
  'security', 'verification', 'git_workflow', 'architecture', 'orchestration',
];

const PHASE_LABELS = ['Discovery', 'Observer', 'Co-Pilot', 'Navigator', 'Driver', 'Graduate'];
const LEVEL_LABELS = ['Unaware', 'Aware', 'Familiar', 'Competent', 'Proficient', 'Expert'];

const DEFAULT_SUB_CONCEPTS = {
  research: ['github_search', 'library_docs', 'package_registries'],
  planning: ['requirements_analysis', 'phase_breakdown', 'risk_identification', 'dependency_mapping'],
  implementation: ['tdd_red_green_refactor', 'file_organization', 'error_handling', 'immutability', 'input_validation'],
  review: ['reading_review_output', 'evaluating_severity', 'deciding_fix_vs_defer'],
  security: ['secrets_management', 'input_sanitization', 'auth_basics'],
  verification: ['build_check', 'test_coverage', 'lint_and_format'],
  git_workflow: ['staging_and_committing', 'commit_messages', 'branching', 'pull_requests'],
  architecture: ['file_structure', 'separation_of_concerns', 'api_design'],
  orchestration: ['agent_roles', 'pipeline_composition', 'model_routing'],
};

// --- Path Resolution ---

function getProfilePath() {
  const baseDir = process.env.MDH_STATE_DIR
    || (process.env.CLAUDE_PLUGIN_ROOT && path.join(process.env.CLAUDE_PLUGIN_ROOT, 'state'))
    || path.resolve(__dirname, '..', '..', 'state');

  const resolved = path.resolve(baseDir, 'learner-profile.json');
  const safeRoot = path.resolve(baseDir);

  // Prevent path traversal via malicious env vars
  if (!resolved.startsWith(safeRoot + path.sep) && resolved !== path.join(safeRoot, 'learner-profile.json')) {
    throw new Error(`Profile path escapes state directory: ${resolved}`);
  }

  return resolved;
}

// --- Profile Construction ---

function buildDefaultProfile() {
  const now = new Date().toISOString();

  const dimensions = {};
  for (const dim of DIMENSION_NAMES) {
    const subConcepts = {};
    for (const sc of DEFAULT_SUB_CONCEPTS[dim]) {
      subConcepts[sc] = { level: 0, confidence: 0.3 };
    }
    dimensions[dim] = {
      level: 0,
      fractional_level: 0.0,
      confidence: 0.3,
      last_assessed: null,
      evidence_count: 0,
      sub_concepts: subConcepts,
    };
  }

  const signalAccumulator = {};
  for (const dim of DIMENSION_NAMES) {
    signalAccumulator[dim] = 0.0;
  }

  return {
    schema_version: SCHEMA_VERSION,
    created_at: now,
    updated_at: now,
    user: {
      name: null,
      domain: null,
      interests: [],
      stated_experience: null,
      preferred_analogies: null,
    },
    settings: {
      verbosity: 3,
      phase: 0,
      phase_proposed: null,
      phase_proposed_at: null,
      phase_deferred_until_session: null,
      teaching_mode: 'directive',
    },
    dimensions,
    projects: [],
    session_history: [],
    signal_accumulator: signalAccumulator,
  };
}

function createDefaultProfile() {
  const profile = buildDefaultProfile();
  const filePath = getProfilePath();
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(profile, null, 2), 'utf-8');
  return profile;
}

// --- Load / Save ---

function loadProfile() {
  const filePath = getProfilePath();
  if (!fs.existsSync(filePath)) {
    return null;
  }
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    // Corrupted profile — treat as missing so callers can recreate
    return null;
  }
}

function saveProfile(profile) {
  const filePath = getProfilePath();
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Build a new object with updated timestamp (do not mutate input)
  const toWrite = {
    ...profile,
    updated_at: new Date().toISOString(),
  };

  // Atomic write: temp file then rename
  const tmpPath = filePath + '.tmp.' + Date.now();
  try {
    fs.writeFileSync(tmpPath, JSON.stringify(toWrite, null, 2), 'utf-8');
    fs.renameSync(tmpPath, filePath);
  } catch (err) {
    // Windows fallback: direct write if rename fails due to lock
    if (err.code === 'EPERM' || err.code === 'EACCES') {
      fs.writeFileSync(filePath, JSON.stringify(toWrite, null, 2), 'utf-8');
    } else {
      throw err;
    }
  } finally {
    // Clean up temp file if rename failed but didn't fall through to direct write
    try { fs.unlinkSync(tmpPath); } catch { /* already renamed or cleaned up */ }
  }
}

// --- Validation ---

function validateDimensions(dimensions) {
  const errors = [];
  if (!dimensions || typeof dimensions !== 'object') {
    return ['dimensions must be an object'];
  }
  const keys = Object.keys(dimensions);
  for (const dim of DIMENSION_NAMES) {
    if (!keys.includes(dim)) errors.push(`Missing dimension: ${dim}`);
  }
  if (keys.length !== DIMENSION_NAMES.length) {
    errors.push(`Expected ${DIMENSION_NAMES.length} dimensions, got ${keys.length}`);
  }
  for (const [name, dim] of Object.entries(dimensions)) {
    if (!Number.isInteger(dim.level) || dim.level < 0 || dim.level > 5) {
      errors.push(`${name}: level must be integer 0-5 (got ${dim.level})`);
    }
    if (typeof dim.fractional_level !== 'number') {
      errors.push(`${name}: fractional_level must be a number`);
    }
    if (typeof dim.confidence !== 'number' || dim.confidence < 0.0 || dim.confidence > 1.0) {
      errors.push(`${name}: confidence must be number 0.0-1.0 (got ${dim.confidence})`);
    }
    if (!Number.isInteger(dim.evidence_count) || dim.evidence_count < 0) {
      errors.push(`${name}: evidence_count must be integer >= 0`);
    }
  }
  return errors;
}

function validateSettings(settings) {
  if (!settings) return ['settings is required'];
  const errors = [];
  if (!Number.isInteger(settings.verbosity) || settings.verbosity < 1 || settings.verbosity > 5) {
    errors.push(`verbosity must be integer 1-5 (got ${settings.verbosity})`);
  }
  if (!Number.isInteger(settings.phase) || settings.phase < 0 || settings.phase > 5) {
    errors.push(`phase must be integer 0-5 (got ${settings.phase})`);
  }
  if (settings.teaching_mode !== 'directive' && settings.teaching_mode !== 'socratic') {
    errors.push(`teaching_mode must be "directive" or "socratic" (got "${settings.teaching_mode}")`);
  }
  return errors;
}

function validateSignalAccumulator(accumulator) {
  if (!accumulator || typeof accumulator !== 'object') {
    return ['signal_accumulator must be an object'];
  }
  const errors = [];
  for (const dim of DIMENSION_NAMES) {
    if (!(dim in accumulator)) errors.push(`signal_accumulator missing key: ${dim}`);
  }
  return errors;
}

function validateProfile(profile) {
  if (!profile || typeof profile !== 'object') {
    return { valid: false, errors: ['profile must be a non-null object'] };
  }

  const errors = [];
  if (typeof profile.schema_version !== 'string') {
    errors.push('schema_version must be a string');
  }
  errors.push(...validateDimensions(profile.dimensions));
  errors.push(...validateSettings(profile.settings));
  if (!Array.isArray(profile.projects)) errors.push('projects must be an array');
  if (!Array.isArray(profile.session_history)) errors.push('session_history must be an array');
  errors.push(...validateSignalAccumulator(profile.signal_accumulator));

  return { valid: errors.length === 0, errors };
}

// --- Accessors ---

function getActiveProject(profile) {
  if (!profile.projects || profile.projects.length === 0) return null;
  return profile.projects.find(p => p.status === 'active') || null;
}

function getPhaseLabel(phase) {
  return PHASE_LABELS[phase] || 'Unknown';
}

function getLevelLabel(level) {
  return LEVEL_LABELS[level] || 'Unknown';
}

function getDimensionNames() {
  return [...DIMENSION_NAMES];
}

// --- Session History ---

function addSessionEntry(profile, entry) {
  const newHistory = [...profile.session_history, entry];
  // Trim to last MAX_SESSION_HISTORY entries
  const trimmed = newHistory.length > MAX_SESSION_HISTORY
    ? newHistory.slice(newHistory.length - MAX_SESSION_HISTORY)
    : newHistory;
  return { ...profile, session_history: trimmed };
}

function getLastSession(profile) {
  if (!profile.session_history || profile.session_history.length === 0) return null;
  return profile.session_history[profile.session_history.length - 1];
}

// --- Exports ---

module.exports = {
  getProfilePath,
  createDefaultProfile,
  loadProfile,
  saveProfile,
  validateProfile,
  getActiveProject,
  getPhaseLabel,
  getLevelLabel,
  getDimensionNames,
  addSessionEntry,
  getLastSession,
  // Constants exported for consumers
  SCHEMA_VERSION,
  MAX_SESSION_HISTORY,
  DIMENSION_NAMES,
  PHASE_LABELS,
  LEVEL_LABELS,
  DEFAULT_SUB_CONCEPTS,
};
