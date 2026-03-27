'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

// --- Path to hooks.json ---

const HOOKS_JSON_PATH = path.resolve(__dirname, '../../hooks/hooks.json');
const SCRIPTS_HOOKS_DIR = path.resolve(__dirname, '../../scripts/hooks');

// --- Helpers ---

function loadHooksJson() {
  const raw = fs.readFileSync(HOOKS_JSON_PATH, 'utf-8');
  return JSON.parse(raw);
}

function getAllHookCommands(config) {
  const commands = [];
  for (const [, entries] of Object.entries(config.hooks || {})) {
    for (const entry of entries) {
      for (const hook of entry.hooks || []) {
        if (hook.command) commands.push(hook.command);
      }
    }
  }
  return commands;
}

function countTotalHooks(config) {
  let count = 0;
  for (const [, entries] of Object.entries(config.hooks || {})) {
    for (const entry of entries) {
      count += (entry.hooks || []).length;
    }
  }
  return count;
}

// --- Tests ---

describe('hooks.json file', () => {
  it('exists at hooks/hooks.json', () => {
    assert.ok(fs.existsSync(HOOKS_JSON_PATH), `hooks.json not found at ${HOOKS_JSON_PATH}`);
  });

  it('is valid JSON', () => {
    const raw = fs.readFileSync(HOOKS_JSON_PATH, 'utf-8');
    assert.doesNotThrow(() => JSON.parse(raw), 'hooks.json must be valid JSON');
  });

  it('has $schema key', () => {
    const config = loadHooksJson();
    assert.ok(config.$schema, 'hooks.json should have a $schema key');
    assert.ok(config.$schema.includes('claude-code'), '$schema should reference Claude Code settings');
  });

  it('has hooks object at top level', () => {
    const config = loadHooksJson();
    assert.ok(config.hooks, 'hooks.json must have a "hooks" key');
    assert.equal(typeof config.hooks, 'object');
  });

  it('has at least 4 event types', () => {
    const config = loadHooksJson();
    const eventTypes = Object.keys(config.hooks);
    assert.ok(eventTypes.length >= 4, `Expected >= 4 event types, got ${eventTypes.length}`);
  });

  it('has all expected event types', () => {
    const config = loadHooksJson();
    const expected = ['PreToolUse', 'PostToolUse', 'Stop', 'SessionStart'];
    for (const event of expected) {
      assert.ok(event in config.hooks, `Missing event type: ${event}`);
    }
  });

  it('has no unexpected event types', () => {
    const config = loadHooksJson();
    const allowed = new Set(['PreToolUse', 'PostToolUse', 'Stop', 'SessionStart']);
    for (const key of Object.keys(config.hooks)) {
      assert.ok(allowed.has(key), `Unexpected event type: ${key}`);
    }
  });

  it('total hook count is at least 5', () => {
    const config = loadHooksJson();
    assert.ok(countTotalHooks(config) >= 5, `MDH should have >= 5 hooks, got ${countTotalHooks(config)}`);
  });
});

describe('PreToolUse hooks', () => {
  it('has exactly one PreToolUse entry', () => {
    const config = loadHooksJson();
    assert.equal(config.hooks.PreToolUse.length, 1);
  });

  it('matcher is "Write|Edit"', () => {
    const config = loadHooksJson();
    const entry = config.hooks.PreToolUse[0];
    assert.equal(entry.matcher, 'Write|Edit');
  });

  it('command references guardrail-advisor.js', () => {
    const config = loadHooksJson();
    const hook = config.hooks.PreToolUse[0].hooks[0];
    assert.ok(hook.command.includes('guardrail-advisor.js'), 'PreToolUse hook should reference guardrail-advisor.js');
  });

  it('hook type is "command"', () => {
    const config = loadHooksJson();
    const hook = config.hooks.PreToolUse[0].hooks[0];
    assert.equal(hook.type, 'command');
  });

  it('has a description', () => {
    const config = loadHooksJson();
    const entry = config.hooks.PreToolUse[0];
    assert.ok(entry.description, 'PreToolUse entry must have a description');
    assert.ok(entry.description.length > 10, 'Description should be meaningful');
  });
});

describe('PostToolUse hooks', () => {
  it('has exactly two PostToolUse entries', () => {
    const config = loadHooksJson();
    assert.equal(config.hooks.PostToolUse.length, 2);
  });

  it('first entry matches "*" for level-signal-capture', () => {
    const config = loadHooksJson();
    const entry = config.hooks.PostToolUse[0];
    assert.equal(entry.matcher, '*');
    assert.ok(entry.hooks[0].command.includes('level-signal-capture.js'));
  });

  it('second entry matches "Write|Edit" for teaching-annotation', () => {
    const config = loadHooksJson();
    const entry = config.hooks.PostToolUse[1];
    assert.equal(entry.matcher, 'Write|Edit');
    assert.ok(entry.hooks[0].command.includes('teaching-annotation.js'));
  });

  it('level-signal-capture has timeout <= 5', () => {
    const config = loadHooksJson();
    const hook = config.hooks.PostToolUse[0].hooks[0];
    assert.ok(hook.timeout <= 5, `Timeout should be <= 5 seconds, got ${hook.timeout}`);
  });

  it('teaching-annotation has timeout <= 5', () => {
    const config = loadHooksJson();
    const hook = config.hooks.PostToolUse[1].hooks[0];
    assert.ok(hook.timeout <= 5, `Timeout should be <= 5 seconds, got ${hook.timeout}`);
  });

  it('both entries have descriptions', () => {
    const config = loadHooksJson();
    for (const entry of config.hooks.PostToolUse) {
      assert.ok(entry.description, 'Each PostToolUse entry must have a description');
    }
  });

  it('both hooks have type "command"', () => {
    const config = loadHooksJson();
    for (const entry of config.hooks.PostToolUse) {
      assert.equal(entry.hooks[0].type, 'command');
    }
  });
});

describe('Stop hooks', () => {
  it('has exactly one Stop entry', () => {
    const config = loadHooksJson();
    assert.equal(config.hooks.Stop.length, 1);
  });

  it('command references learner-state-persist.js', () => {
    const config = loadHooksJson();
    const hook = config.hooks.Stop[0].hooks[0];
    assert.ok(hook.command.includes('learner-state-persist.js'));
  });

  it('hook type is "command"', () => {
    const config = loadHooksJson();
    const hook = config.hooks.Stop[0].hooks[0];
    assert.equal(hook.type, 'command');
  });

  it('has a description', () => {
    const config = loadHooksJson();
    assert.ok(config.hooks.Stop[0].description);
  });
});

describe('SessionStart hooks', () => {
  it('has exactly one SessionStart entry', () => {
    const config = loadHooksJson();
    assert.equal(config.hooks.SessionStart.length, 1);
  });

  it('command references session-start-loader.js', () => {
    const config = loadHooksJson();
    const hook = config.hooks.SessionStart[0].hooks[0];
    assert.ok(hook.command.includes('session-start-loader.js'));
  });

  it('hook type is "command"', () => {
    const config = loadHooksJson();
    const hook = config.hooks.SessionStart[0].hooks[0];
    assert.equal(hook.type, 'command');
  });

  it('has a description', () => {
    const config = loadHooksJson();
    assert.ok(config.hooks.SessionStart[0].description);
  });
});

describe('script path references', () => {
  it('all commands use ${CLAUDE_PLUGIN_ROOT} prefix', () => {
    const config = loadHooksJson();
    const commands = getAllHookCommands(config);
    for (const cmd of commands) {
      assert.ok(
        cmd.includes('${CLAUDE_PLUGIN_ROOT}'),
        `Command should use \${CLAUDE_PLUGIN_ROOT}: ${cmd}`
      );
    }
  });

  it('all commands reference .js files', () => {
    const config = loadHooksJson();
    const commands = getAllHookCommands(config);
    for (const cmd of commands) {
      assert.ok(cmd.includes('.js'), `Command should reference a .js file: ${cmd}`);
    }
  });

  it('all commands use node as runner', () => {
    const config = loadHooksJson();
    const commands = getAllHookCommands(config);
    for (const cmd of commands) {
      assert.ok(cmd.startsWith('node '), `Command should start with "node ": ${cmd}`);
    }
  });

  it('all referenced script filenames correspond to expected hook scripts', () => {
    const config = loadHooksJson();
    const commands = getAllHookCommands(config);
    const expectedScripts = new Set([
      'guardrail-advisor.js',
      'level-signal-capture.js',
      'teaching-annotation.js',
      'learner-state-persist.js',
      'session-start-loader.js',
    ]);
    for (const cmd of commands) {
      const filename = path.basename(cmd.replace(/"/g, ''));
      assert.ok(expectedScripts.has(filename), `Unexpected script reference: ${filename}`);
      expectedScripts.delete(filename);
    }
    assert.equal(expectedScripts.size, 0, `Missing script references: ${[...expectedScripts].join(', ')}`);
  });
});
