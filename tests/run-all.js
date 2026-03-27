#!/usr/bin/env node
'use strict';

/**
 * MDH Test Runner
 * Discovers and runs all *.test.js files using Node's built-in test runner.
 * Usage: node tests/run-all.js [filter]
 *   filter — optional substring to match test file paths
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const testsDir = __dirname;
const filter = process.argv[2] || '';

function findTestFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findTestFiles(fullPath));
    } else if (entry.name.endsWith('.test.js')) {
      results.push(fullPath);
    }
  }
  return results;
}

const testFiles = findTestFiles(testsDir)
  .filter(f => f.includes(filter))
  .sort();

if (testFiles.length === 0) {
  console.log('No test files found' + (filter ? ` matching "${filter}"` : '') + '.');
  process.exit(0);
}

console.log(`\nRunning ${testFiles.length} test file(s)...\n`);

let passed = 0;
let failed = 0;

for (const file of testFiles) {
  const rel = path.relative(testsDir, file);
  try {
    execSync(`node --test "${file}"`, { stdio: 'inherit', timeout: 30000 });
    passed++;
  } catch (err) {
    failed++;
    if (err.signal) {
      console.error(`  CRASHED (${err.signal}): ${rel}`);
    }
  }
}

console.log(`\n${'='.repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed, ${testFiles.length} total`);
console.log('='.repeat(50));

process.exit(failed > 0 ? 1 : 0);
