'use strict';

// --- Constants ---

const ROUTES = ['web_app', 'automation', 'api_integration', 'data_tool', 'cli_tool', 'mobile_desktop'];

// --- Template Data ---

const TEMPLATES = [
  // web_app
  {
    id: 'web-dashboard',
    route: 'web_app',
    name: 'Personal Dashboard',
    tagline: 'Build a personal dashboard that aggregates data from APIs you care about',
    difficulty: 2,
    estimated_sessions: 8,
    tech_stack: ['Node.js', 'Express', 'HTML/CSS', 'REST APIs'],
    dimensions_developed: {
      research: 0.6, planning: 0.7, implementation: 0.9, review: 0.5,
      security: 0.6, verification: 0.7, git_workflow: 0.8, architecture: 0.7, orchestration: 0.3,
    },
    milestones: [
      { name: 'Project Setup & First Route', description: 'Initialize project, create Express server, serve a static page', sessions: 2 },
      { name: 'API Integration', description: 'Connect to an external API, fetch and display data', sessions: 2 },
      { name: 'Multiple Widgets', description: 'Add 2-3 dashboard widgets with different data sources', sessions: 2 },
      { name: 'Polish & Deploy', description: 'Add styling, error handling, and deploy to a hosting service', sessions: 2 },
    ],
    learning_moments: ['HTTP request/response cycle', 'API keys and environment variables', 'HTML templating', 'Error handling for external services'],
    keywords: ['dashboard', 'web', 'api', 'frontend', 'data', 'visualization', 'html'],
  },
  {
    id: 'booking-tool',
    route: 'web_app',
    name: 'Simple Booking System',
    tagline: 'Create a booking system for appointments, rooms, or resources',
    difficulty: 3,
    estimated_sessions: 10,
    tech_stack: ['Node.js', 'Express', 'SQLite', 'HTML/CSS'],
    dimensions_developed: {
      research: 0.5, planning: 0.8, implementation: 0.9, review: 0.6,
      security: 0.7, verification: 0.8, git_workflow: 0.7, architecture: 0.8, orchestration: 0.4,
    },
    milestones: [
      { name: 'Data Model & Setup', description: 'Design booking schema, set up database, create first migration', sessions: 2 },
      { name: 'CRUD Operations', description: 'Create, read, update, delete bookings via API', sessions: 3 },
      { name: 'Conflict Detection', description: 'Prevent double-bookings, add validation rules', sessions: 2 },
      { name: 'UI & Deployment', description: 'Build booking interface, add auth, deploy', sessions: 3 },
    ],
    learning_moments: ['Database design and migrations', 'Input validation', 'Conflict resolution logic', 'Authentication basics'],
    keywords: ['booking', 'scheduling', 'appointments', 'database', 'crud', 'calendar'],
  },

  // automation
  {
    id: 'file-organizer',
    route: 'automation',
    name: 'File Organization Tool',
    tagline: 'Automatically organize files into folders based on rules you define',
    difficulty: 1,
    estimated_sessions: 4,
    tech_stack: ['Node.js', 'fs module'],
    dimensions_developed: {
      research: 0.4, planning: 0.6, implementation: 0.8, review: 0.3,
      security: 0.3, verification: 0.6, git_workflow: 0.7, architecture: 0.5, orchestration: 0.2,
    },
    milestones: [
      { name: 'File Scanner', description: 'Read a directory, classify files by extension', sessions: 1 },
      { name: 'Rule Engine', description: 'Define and apply sorting rules (by type, date, size)', sessions: 1 },
      { name: 'Safe Move & Undo', description: 'Move files with dry-run mode and undo capability', sessions: 1 },
      { name: 'CLI Interface', description: 'Add command-line arguments and help output', sessions: 1 },
    ],
    learning_moments: ['File system operations', 'Pattern matching', 'Defensive programming (dry-run)', 'CLI argument parsing'],
    keywords: ['files', 'organize', 'automation', 'filesystem', 'cleanup', 'folders', 'sort'],
  },
  {
    id: 'data-pipeline',
    route: 'automation',
    name: 'Data Processing Pipeline',
    tagline: 'Build a pipeline that fetches, transforms, and stores data automatically',
    difficulty: 3,
    estimated_sessions: 8,
    tech_stack: ['Node.js', 'REST APIs', 'JSON', 'SQLite'],
    dimensions_developed: {
      research: 0.7, planning: 0.8, implementation: 0.8, review: 0.5,
      security: 0.5, verification: 0.8, git_workflow: 0.7, architecture: 0.8, orchestration: 0.6,
    },
    milestones: [
      { name: 'Data Source Setup', description: 'Connect to source API, fetch raw data', sessions: 2 },
      { name: 'Transform Stage', description: 'Clean, validate, and transform data', sessions: 2 },
      { name: 'Storage & Scheduling', description: 'Store processed data, add cron-like scheduling', sessions: 2 },
      { name: 'Monitoring & Recovery', description: 'Add error handling, retries, and status reporting', sessions: 2 },
    ],
    learning_moments: ['ETL pipeline design', 'Data validation', 'Error recovery patterns', 'Scheduled task execution'],
    keywords: ['pipeline', 'data', 'etl', 'automation', 'processing', 'transform', 'batch'],
  },

  // api_integration
  {
    id: 'webhook-handler',
    route: 'api_integration',
    name: 'Webhook Receiver & Processor',
    tagline: 'Build a service that receives webhooks and processes events',
    difficulty: 2,
    estimated_sessions: 6,
    tech_stack: ['Node.js', 'Express', 'JSON', 'Webhooks'],
    dimensions_developed: {
      research: 0.6, planning: 0.6, implementation: 0.8, review: 0.5,
      security: 0.8, verification: 0.7, git_workflow: 0.7, architecture: 0.6, orchestration: 0.3,
    },
    milestones: [
      { name: 'Receiver Endpoint', description: 'Create Express server with POST endpoint for webhooks', sessions: 1 },
      { name: 'Payload Validation', description: 'Validate webhook signatures and payload structure', sessions: 2 },
      { name: 'Event Processing', description: 'Route events to handlers, process and store results', sessions: 2 },
      { name: 'Reliability', description: 'Add retry logic, dead letter queue, and monitoring', sessions: 1 },
    ],
    learning_moments: ['Webhook security (signature validation)', 'Event-driven architecture', 'Idempotency', 'Error queuing'],
    keywords: ['webhook', 'api', 'events', 'integration', 'http', 'post', 'notifications'],
  },
  {
    id: 'slack-bot',
    route: 'api_integration',
    name: 'Slack Bot',
    tagline: 'Create a Slack bot that responds to commands and posts updates',
    difficulty: 3,
    estimated_sessions: 8,
    tech_stack: ['Node.js', 'Slack API', 'Express', 'OAuth'],
    dimensions_developed: {
      research: 0.8, planning: 0.7, implementation: 0.8, review: 0.5,
      security: 0.7, verification: 0.7, git_workflow: 0.7, architecture: 0.7, orchestration: 0.5,
    },
    milestones: [
      { name: 'Bot Setup & Auth', description: 'Register Slack app, set up OAuth, receive events', sessions: 2 },
      { name: 'Slash Commands', description: 'Implement 2-3 slash commands with responses', sessions: 2 },
      { name: 'Interactive Messages', description: 'Add buttons, modals, and interactive workflows', sessions: 2 },
      { name: 'Scheduled Posts', description: 'Add scheduled messages and recurring updates', sessions: 2 },
    ],
    learning_moments: ['OAuth flow', 'API rate limiting', 'Interactive message patterns', 'Bot conversation design'],
    keywords: ['slack', 'bot', 'chat', 'messaging', 'commands', 'integration', 'notifications'],
  },

  // data_tool
  {
    id: 'csv-analyzer',
    route: 'data_tool',
    name: 'CSV Analysis Tool',
    tagline: 'Build a tool that reads CSV files, analyzes data, and generates reports',
    difficulty: 1,
    estimated_sessions: 4,
    tech_stack: ['Node.js', 'csv-parse', 'CLI'],
    dimensions_developed: {
      research: 0.5, planning: 0.5, implementation: 0.8, review: 0.3,
      security: 0.2, verification: 0.6, git_workflow: 0.6, architecture: 0.4, orchestration: 0.2,
    },
    milestones: [
      { name: 'CSV Reader', description: 'Parse CSV files and handle different formats', sessions: 1 },
      { name: 'Analysis Engine', description: 'Calculate stats: sum, average, min, max, frequency', sessions: 1 },
      { name: 'Report Output', description: 'Generate formatted text and JSON reports', sessions: 1 },
      { name: 'CLI Polish', description: 'Add column selection, filtering, and help text', sessions: 1 },
    ],
    learning_moments: ['File parsing', 'Data aggregation', 'Output formatting', 'Command-line UX'],
    keywords: ['csv', 'data', 'analysis', 'spreadsheet', 'reports', 'statistics', 'excel'],
  },
  {
    id: 'report-generator',
    route: 'data_tool',
    name: 'Automated Report Generator',
    tagline: 'Generate reports from multiple data sources with charts and summaries',
    difficulty: 2,
    estimated_sessions: 6,
    tech_stack: ['Node.js', 'JSON', 'Markdown', 'REST APIs'],
    dimensions_developed: {
      research: 0.7, planning: 0.7, implementation: 0.8, review: 0.4,
      security: 0.4, verification: 0.7, git_workflow: 0.7, architecture: 0.6, orchestration: 0.4,
    },
    milestones: [
      { name: 'Data Collection', description: 'Fetch data from 2+ sources (files, APIs)', sessions: 2 },
      { name: 'Template Engine', description: 'Build Markdown report templates with data placeholders', sessions: 2 },
      { name: 'Scheduling & Output', description: 'Generate reports on schedule, output as Markdown/HTML', sessions: 2 },
    ],
    learning_moments: ['Multi-source data aggregation', 'Template rendering', 'Report design patterns', 'Scheduling'],
    keywords: ['report', 'generator', 'data', 'markdown', 'template', 'summary', 'automated'],
  },

  // cli_tool
  {
    id: 'project-scaffolder',
    route: 'cli_tool',
    name: 'Project Template Generator',
    tagline: 'Build a CLI that scaffolds new projects from customizable templates',
    difficulty: 2,
    estimated_sessions: 5,
    tech_stack: ['Node.js', 'fs module', 'CLI', 'Templates'],
    dimensions_developed: {
      research: 0.6, planning: 0.7, implementation: 0.8, review: 0.5,
      security: 0.4, verification: 0.7, git_workflow: 0.8, architecture: 0.7, orchestration: 0.3,
    },
    milestones: [
      { name: 'Template Structure', description: 'Define template format with variable placeholders', sessions: 1 },
      { name: 'CLI Interface', description: 'Parse arguments, prompt for missing values', sessions: 1 },
      { name: 'File Generation', description: 'Copy templates, replace variables, create directory structure', sessions: 2 },
      { name: 'Template Library', description: 'Add multiple templates, list/search functionality', sessions: 1 },
    ],
    learning_moments: ['Template engines', 'CLI UX design', 'File generation patterns', 'Project structure conventions'],
    keywords: ['scaffold', 'template', 'cli', 'generator', 'project', 'boilerplate', 'init'],
  },
  {
    id: 'dev-utility',
    route: 'cli_tool',
    name: 'Custom Dev Workflow Tool',
    tagline: 'Create a CLI utility that automates your personal development tasks',
    difficulty: 1,
    estimated_sessions: 3,
    tech_stack: ['Node.js', 'child_process', 'CLI'],
    dimensions_developed: {
      research: 0.4, planning: 0.5, implementation: 0.7, review: 0.3,
      security: 0.3, verification: 0.5, git_workflow: 0.7, architecture: 0.4, orchestration: 0.2,
    },
    milestones: [
      { name: 'Core Commands', description: 'Implement 2-3 utility commands (e.g., git shortcuts, file cleanup)', sessions: 1 },
      { name: 'Configuration', description: 'Add config file support for customization', sessions: 1 },
      { name: 'Polish', description: 'Add help text, error messages, and color output', sessions: 1 },
    ],
    learning_moments: ['Process execution', 'Configuration management', 'CLI design patterns'],
    keywords: ['utility', 'cli', 'tool', 'developer', 'workflow', 'automation', 'scripts'],
  },

  // mobile_desktop
  {
    id: 'desktop-app',
    route: 'mobile_desktop',
    name: 'Electron Desktop App',
    tagline: 'Build a cross-platform desktop app with web technologies',
    difficulty: 3,
    estimated_sessions: 10,
    tech_stack: ['Electron', 'Node.js', 'HTML/CSS', 'IPC'],
    dimensions_developed: {
      research: 0.7, planning: 0.8, implementation: 0.9, review: 0.6,
      security: 0.6, verification: 0.7, git_workflow: 0.7, architecture: 0.9, orchestration: 0.5,
    },
    milestones: [
      { name: 'Electron Setup', description: 'Create Electron app with main and renderer processes', sessions: 2 },
      { name: 'Core Feature', description: 'Build the main application feature with IPC communication', sessions: 3 },
      { name: 'Local Storage', description: 'Add persistent local data storage', sessions: 2 },
      { name: 'Packaging', description: 'Package for distribution on macOS/Windows/Linux', sessions: 3 },
    ],
    learning_moments: ['Process model (main vs renderer)', 'IPC communication', 'Desktop app packaging', 'Platform differences'],
    keywords: ['desktop', 'electron', 'app', 'native', 'cross-platform', 'gui', 'windows', 'mac'],
  },
];

// --- Public API ---

function getAllTemplates() {
  return TEMPLATES.map(t => ({ ...t }));
}

function getTemplateById(id) {
  const t = TEMPLATES.find(t => t.id === id);
  return t ? { ...t } : null;
}

function getTemplatesByRoute(route) {
  return TEMPLATES.filter(t => t.route === route).map(t => ({ ...t }));
}

function getRoutes() {
  return [...ROUTES];
}

function getPrimaryDimensions(template) {
  return Object.entries(template.dimensions_developed)
    .map(([dimension, weight]) => ({ dimension, weight }))
    .sort((a, b) => b.weight - a.weight);
}

// --- Scoring constants ---

const SCORE_WEIGHT_INTEREST = 0.4;
const SCORE_WEIGHT_DIFFICULTY = 0.3;
const SCORE_WEIGHT_GAP = 0.3;
const DIFFICULTY_PENALTY_FACTOR = 0.25;
const HIGH_SCORE_THRESHOLD = 0.7;

function computeRelevanceScore(template, avgLevel, interestSet, dims) {
  const matchedKeywords = template.keywords.filter(k => interestSet.has(k.toLowerCase()));
  const interestScore = template.keywords.length > 0
    ? matchedKeywords.length / template.keywords.length
    : 0;

  const optimalDifficulty = avgLevel + 1;
  const difficultyScore = Math.max(0, Math.min(1,
    1.0 - Math.abs(template.difficulty - optimalDifficulty) * DIFFICULTY_PENALTY_FACTOR));

  let gapSum = 0;
  let gapMax = 0;
  for (const dim of Object.keys(template.dimensions_developed)) {
    const learnerLevel = dims[dim] ? dims[dim].level : 0;
    gapSum += template.dimensions_developed[dim] * ((5 - learnerLevel) / 5);
    gapMax += template.dimensions_developed[dim];
  }
  const gapScore = gapMax > 0 ? gapSum / gapMax : 0;

  const relevanceScore = Math.round(
    (interestScore * SCORE_WEIGHT_INTEREST + difficultyScore * SCORE_WEIGHT_DIFFICULTY + gapScore * SCORE_WEIGHT_GAP) * 1000
  ) / 1000;

  return { relevanceScore, matchedKeywords, difficultyScore, gapScore };
}

function buildReason(matchedKeywords, difficultyScore, gapScore, template) {
  const reasons = [];
  if (matchedKeywords.length > 0) {
    reasons.push(`Matches your interests: ${matchedKeywords.join(', ')}`);
  }
  if (difficultyScore > HIGH_SCORE_THRESHOLD) {
    reasons.push('Good difficulty fit for your current level');
  }
  if (gapScore > HIGH_SCORE_THRESHOLD) {
    reasons.push('Develops dimensions you haven\'t explored yet');
  }
  if (reasons.length === 0) {
    const keyAreas = Object.keys(template.dimensions_developed).filter(d => template.dimensions_developed[d] > 0.5).length;
    reasons.push(`Covers ${keyAreas} key development areas`);
  }
  return reasons.join('. ');
}

function matchTemplates(userProfile, options = {}) {
  const { maxDifficulty, route, maxResults = 3 } = options;

  // Step 1: Filter (defensive copy prevents accidental mutation of module constant)
  let candidates = [...TEMPLATES];
  if (maxDifficulty != null) {
    candidates = candidates.filter(t => t.difficulty <= maxDifficulty);
  }
  if (route) {
    candidates = candidates.filter(t => t.route === route);
  }

  const dims = userProfile.dimensions || {};
  const dimValues = Object.values(dims);
  const avgLevel = dimValues.length > 0
    ? dimValues.reduce((sum, d) => sum + d.level, 0) / dimValues.length
    : 0;

  const interests = (userProfile.user && userProfile.user.interests) || [];
  const domain = (userProfile.user && userProfile.user.domain) || '';
  const interestSet = new Set([
    ...interests.map(i => i.toLowerCase()),
    ...(domain ? [domain.toLowerCase()] : []),
  ]);

  // Step 2: Score and sort
  const scored = candidates.map(template => {
    const { relevanceScore, matchedKeywords, difficultyScore, gapScore } =
      computeRelevanceScore(template, avgLevel, interestSet, dims);
    return {
      template: { ...template },
      relevanceScore,
      reason: buildReason(matchedKeywords, difficultyScore, gapScore, template),
    };
  });

  scored.sort((a, b) => b.relevanceScore - a.relevanceScore);
  return scored.slice(0, maxResults);
}

function scaleMilestones(template, averageLevel) {
  // Deep copy milestones
  const milestones = template.milestones.map(m => ({ ...m }));

  if (averageLevel < 2) {
    // Beginner: expand — add orientation, double first milestone sessions
    const orientation = {
      name: 'Setup & Orientation',
      description: 'Get familiar with the project tools, directory structure, and development environment',
      sessions: 1,
    };
    milestones[0] = { ...milestones[0], sessions: milestones[0].sessions * 2 };
    return [orientation, ...milestones];
  }

  if (averageLevel > 3) {
    // Advanced: condense — merge first two, reduce sessions by 30%
    if (milestones.length >= 2) {
      const merged = {
        name: `${milestones[0].name} + ${milestones[1].name}`,
        description: `${milestones[0].description}; ${milestones[1].description}`,
        sessions: Math.max(1, Math.floor((milestones[0].sessions + milestones[1].sessions) * 0.7)),
      };
      const rest = milestones.slice(2).map(m => ({
        ...m,
        sessions: Math.max(1, Math.floor(m.sessions * 0.7)),
      }));
      return [merged, ...rest];
    }
    // Single milestone — just reduce sessions
    return milestones.map(m => ({
      ...m,
      sessions: Math.max(1, Math.floor(m.sessions * 0.7)),
    }));
  }

  // Mid-level: pass through as-is
  return milestones;
}

// --- Exports ---

module.exports = {
  getAllTemplates,
  getTemplateById,
  getTemplatesByRoute,
  matchTemplates,
  scaleMilestones,
  getPrimaryDimensions,
  getRoutes,
};
