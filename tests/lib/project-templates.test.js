'use strict';

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const os = require('os');

const {
  getAllTemplates,
  getTemplateById,
  getTemplatesByRoute,
  matchTemplates,
  scaleMilestones,
  getPrimaryDimensions,
  getRoutes,
} = require('../../scripts/lib/project-templates');

const { createDefaultProfile } = require('../../scripts/lib/learner-profile');

const EXPECTED_ROUTES = ['web_app', 'automation', 'api_integration', 'data_tool', 'cli_tool', 'mobile_desktop'];

const DIMENSION_NAMES = [
  'research', 'planning', 'implementation', 'review',
  'security', 'verification', 'git_workflow', 'architecture', 'orchestration',
];

// --- Helpers ---

let tmpDir;

function setupTmpDir() {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mdh-tmpl-'));
  process.env.MDH_STATE_DIR = tmpDir;
}

function teardownTmpDir() {
  delete process.env.MDH_STATE_DIR;
  if (tmpDir && fs.existsSync(tmpDir)) {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
  tmpDir = null;
}

// --- Tests ---

describe('getAllTemplates', () => {
  it('returns at least 11 templates', () => {
    const templates = getAllTemplates();
    assert.ok(templates.length >= 11, `Expected >= 11 templates, got ${templates.length}`);
  });

  it('covers all 6 routes', () => {
    const templates = getAllTemplates();
    const routes = new Set(templates.map(t => t.route));
    for (const route of EXPECTED_ROUTES) {
      assert.ok(routes.has(route), `Missing route: ${route}`);
    }
  });

  it('has at least 1 template per route', () => {
    const templates = getAllTemplates();
    for (const route of EXPECTED_ROUTES) {
      const count = templates.filter(t => t.route === route).length;
      assert.ok(count >= 1, `Route "${route}" has ${count} templates, expected >= 1`);
    }
  });
});

describe('template schema validity', () => {
  it('every template has all required fields with correct types', () => {
    const templates = getAllTemplates();
    for (const t of templates) {
      assert.equal(typeof t.id, 'string', `${t.id || 'unknown'}: id must be string`);
      assert.equal(typeof t.route, 'string', `${t.id}: route must be string`);
      assert.equal(typeof t.name, 'string', `${t.id}: name must be string`);
      assert.equal(typeof t.tagline, 'string', `${t.id}: tagline must be string`);
      assert.ok(Number.isInteger(t.difficulty) && t.difficulty >= 1 && t.difficulty <= 5,
        `${t.id}: difficulty must be integer 1-5`);
      assert.ok(Number.isInteger(t.estimated_sessions) && t.estimated_sessions > 0,
        `${t.id}: estimated_sessions must be positive integer`);
      assert.ok(Array.isArray(t.tech_stack), `${t.id}: tech_stack must be array`);
      assert.ok(Array.isArray(t.milestones) && t.milestones.length > 0,
        `${t.id}: milestones must be non-empty array`);
      assert.ok(Array.isArray(t.learning_moments), `${t.id}: learning_moments must be array`);
      assert.ok(Array.isArray(t.keywords), `${t.id}: keywords must be array`);

      // dimensions_developed must have valid dimension keys with 0-1 values
      assert.equal(typeof t.dimensions_developed, 'object', `${t.id}: dimensions_developed must be object`);
      for (const dim of DIMENSION_NAMES) {
        const val = t.dimensions_developed[dim];
        assert.ok(typeof val === 'number' && val >= 0.0 && val <= 1.0,
          `${t.id}: dimensions_developed.${dim} must be 0.0-1.0 (got ${val})`);
      }

      // milestones schema
      for (const m of t.milestones) {
        assert.equal(typeof m.name, 'string', `${t.id} milestone: name must be string`);
        assert.equal(typeof m.description, 'string', `${t.id} milestone: description must be string`);
        assert.ok(Number.isInteger(m.sessions) && m.sessions > 0,
          `${t.id} milestone: sessions must be positive integer`);
      }
    }
  });
});

describe('getTemplateById', () => {
  it('returns correct template for "web-dashboard"', () => {
    const t = getTemplateById('web-dashboard');
    assert.ok(t !== null);
    assert.equal(t.id, 'web-dashboard');
    assert.equal(t.route, 'web_app');
  });

  it('returns null for nonexistent id', () => {
    assert.equal(getTemplateById('nonexistent-id'), null);
  });
});

describe('getTemplatesByRoute', () => {
  it('returns only templates with the specified route', () => {
    const results = getTemplatesByRoute('cli_tool');
    assert.ok(results.length > 0);
    for (const t of results) {
      assert.equal(t.route, 'cli_tool');
    }
  });

  it('returns empty array for unknown route', () => {
    const results = getTemplatesByRoute('unknown_route');
    assert.deepStrictEqual(results, []);
  });
});

describe('matchTemplates', () => {
  beforeEach(setupTmpDir);
  afterEach(teardownTmpDir);

  it('ranks web-dashboard highly for interests ["dashboard", "web"]', () => {
    const profile = createDefaultProfile();
    profile.user.interests = ['dashboard', 'web'];
    const results = matchTemplates(profile);
    assert.ok(results.length > 0);
    // web-dashboard should be in the top results
    const ids = results.map(r => r.template.id);
    assert.ok(ids.includes('web-dashboard'), `Expected web-dashboard in results, got ${ids.join(', ')}`);
  });

  it('respects maxDifficulty filter', () => {
    const profile = createDefaultProfile();
    const results = matchTemplates(profile, { maxDifficulty: 1 });
    for (const r of results) {
      assert.ok(r.template.difficulty <= 1,
        `Template ${r.template.id} has difficulty ${r.template.difficulty} > 1`);
    }
  });

  it('respects route filter', () => {
    const profile = createDefaultProfile();
    const results = matchTemplates(profile, { route: 'cli_tool' });
    for (const r of results) {
      assert.equal(r.template.route, 'cli_tool');
    }
  });

  it('favors templates that fill dimension gaps', () => {
    const profile = createDefaultProfile();
    // Set implementation high, leave everything else low
    profile.dimensions.implementation.level = 4;
    const results = matchTemplates(profile);
    // Results should prefer templates that develop non-implementation dimensions
    assert.ok(results.length > 0);
    const topTemplate = results[0].template;
    // Implementation weight should not be the dominant dimension
    assert.ok(topTemplate.dimensions_developed.implementation < 0.9,
      'Top match should not be implementation-heavy when implementation is already high');
  });

  it('defaults to 3 results', () => {
    const profile = createDefaultProfile();
    const results = matchTemplates(profile);
    assert.ok(results.length <= 3);
  });

  it('respects maxResults option', () => {
    const profile = createDefaultProfile();
    const results = matchTemplates(profile, { maxResults: 1 });
    assert.equal(results.length, 1);
  });

  it('includes a non-empty reason string', () => {
    const profile = createDefaultProfile();
    const results = matchTemplates(profile);
    for (const r of results) {
      assert.equal(typeof r.reason, 'string');
      assert.ok(r.reason.length > 0);
    }
  });

  it('includes relevanceScore between 0 and 1', () => {
    const profile = createDefaultProfile();
    const results = matchTemplates(profile);
    for (const r of results) {
      assert.ok(r.relevanceScore >= 0 && r.relevanceScore <= 1,
        `Score ${r.relevanceScore} out of range`);
    }
  });
});

describe('scaleMilestones', () => {
  it('adds Setup & Orientation milestone for beginners (level 0)', () => {
    const template = getTemplateById('web-dashboard');
    const scaled = scaleMilestones(template, 0);
    assert.equal(scaled[0].name, 'Setup & Orientation');
    assert.equal(scaled[0].sessions, 1);
    // Should have one more milestone than original
    assert.equal(scaled.length, template.milestones.length + 1);
  });

  it('doubles first substantive milestone sessions for beginners', () => {
    const template = getTemplateById('web-dashboard');
    const scaled = scaleMilestones(template, 0.5);
    // First substantive milestone (index 1) should have doubled sessions
    assert.equal(scaled[1].sessions, template.milestones[0].sessions * 2);
  });

  it('passes milestones through unchanged at mid-level (2-3)', () => {
    const template = getTemplateById('web-dashboard');
    const scaled = scaleMilestones(template, 2.5);
    assert.equal(scaled.length, template.milestones.length);
    for (let i = 0; i < scaled.length; i++) {
      assert.equal(scaled[i].name, template.milestones[i].name);
      assert.equal(scaled[i].sessions, template.milestones[i].sessions);
    }
  });

  it('condenses milestones for advanced learners (level 4+)', () => {
    const template = getTemplateById('web-dashboard');
    const scaled = scaleMilestones(template, 4.5);
    // Should have one fewer milestone (first two merged)
    assert.equal(scaled.length, template.milestones.length - 1);
    // Sessions should be reduced by ~30%, floor of 1
    for (const m of scaled) {
      assert.ok(m.sessions >= 1);
    }
  });

  it('does not mutate the original template', () => {
    const template = getTemplateById('web-dashboard');
    const originalMilestones = JSON.parse(JSON.stringify(template.milestones));
    scaleMilestones(template, 0);
    scaleMilestones(template, 5);
    assert.deepStrictEqual(template.milestones, originalMilestones);
  });
});

describe('getPrimaryDimensions', () => {
  it('returns dimensions sorted by weight (highest first)', () => {
    const template = getTemplateById('web-dashboard');
    const dims = getPrimaryDimensions(template);
    assert.ok(dims.length > 0);
    for (let i = 1; i < dims.length; i++) {
      assert.ok(dims[i - 1].weight >= dims[i].weight,
        `${dims[i - 1].dimension} (${dims[i - 1].weight}) should >= ${dims[i].dimension} (${dims[i].weight})`);
    }
  });

  it('returns all dimensions with their weights', () => {
    const template = getTemplateById('web-dashboard');
    const dims = getPrimaryDimensions(template);
    assert.equal(dims.length, 9);
    for (const d of dims) {
      assert.equal(typeof d.dimension, 'string');
      assert.equal(typeof d.weight, 'number');
    }
  });
});

describe('getRoutes', () => {
  it('returns exactly 6 route names', () => {
    const routes = getRoutes();
    assert.equal(routes.length, 6);
  });

  it('contains all expected routes', () => {
    const routes = getRoutes();
    for (const r of EXPECTED_ROUTES) {
      assert.ok(routes.includes(r), `Missing route: ${r}`);
    }
  });
});
