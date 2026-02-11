#!/usr/bin/env node
/**
 * ATUM CREA Library Validator
 * Validates the integrity of the template library.
 * Usage: node validate-library.js [library-path]
 */

const fs = require('fs');
const path = require('path');

const LIBRARY_ROOT = process.argv[2] || path.resolve(__dirname, '..');

const errors = [];
const warnings = [];
const stats = {};

function countFiles(dir, ext, recursive = true) {
  let count = 0;
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isFile() && (!ext || entry.name.endsWith(ext))) count++;
      if (entry.isDirectory() && recursive) count += countFiles(fullPath, ext, recursive);
    }
  } catch { /* directory not found */ }
  return count;
}

function countDirs(dir) {
  try {
    return fs.readdirSync(dir, { withFileTypes: true }).filter(e => e.isDirectory()).length;
  } catch { return 0; }
}

function checkExists(relativePath, label) {
  const full = path.join(LIBRARY_ROOT, relativePath);
  if (!fs.existsSync(full)) {
    errors.push(`MISSING: ${label} (${relativePath})`);
    return false;
  }
  return true;
}

// 1. Check required directories
console.log('Validating library structure...\n');

const requiredDirs = [
  'templates', 'knowledge', 'workflows', 'config', 'modes', 'prompts', 'scripts'
];
for (const dir of requiredDirs) {
  checkExists(dir, `Required directory: ${dir}`);
}

// 2. Count assets
stats.templates = countDirs(path.join(LIBRARY_ROOT, 'templates'));
stats.knowledgeFiles = countFiles(path.join(LIBRARY_ROOT, 'knowledge'), '.md');
stats.workflows = countFiles(path.join(LIBRARY_ROOT, 'workflows'), '.md', false);
stats.configs = countFiles(path.join(LIBRARY_ROOT, 'config'), null, false);
stats.modes = countFiles(path.join(LIBRARY_ROOT, 'modes'), '.md', false);

// 3. Check critical knowledge files
const criticalKnowledge = [
  'knowledge/INDEX.md',
  'knowledge/design-intelligence.md',
  'knowledge/stripe-patterns.md',
  'knowledge/autonomous-agents-guide.md',
  'knowledge/web-vitals-guide.md',
  'knowledge/stack-2025.md',
  'knowledge/mermaid-diagrams-guide.md',
];
for (const file of criticalKnowledge) {
  checkExists(file, `Critical knowledge: ${file}`);
}

// 4. Check workflows exist for all project types
const requiredWorkflows = [
  'workflows/saas-workflow.md',
  'workflows/landing-workflow.md',
  'workflows/api-workflow.md',
  'workflows/game-workflow.md',
  'workflows/desktop-workflow.md',
  'workflows/ai-agent-workflow.md',
];
for (const file of requiredWorkflows) {
  checkExists(file, `Required workflow: ${file}`);
}

// 5. Check for artifact files
const rootEntries = fs.readdirSync(LIBRARY_ROOT, { withFileTypes: true });
const artifactNames = ['nul', 'con', 'prn', 'aux', 'com1', 'lpt1'];
for (const entry of rootEntries) {
  if (artifactNames.includes(entry.name.toLowerCase())) {
    errors.push(`ARTIFACT: Windows reserved name found: ${entry.name}`);
  }
}

// 6. Check templates have at least one file
const templatesDir = path.join(LIBRARY_ROOT, 'templates');
if (fs.existsSync(templatesDir)) {
  const templateDirs = fs.readdirSync(templatesDir, { withFileTypes: true }).filter(e => e.isDirectory());
  for (const dir of templateDirs) {
    const files = countFiles(path.join(templatesDir, dir.name), null);
    if (files === 0) {
      warnings.push(`EMPTY TEMPLATE: templates/${dir.name}/ has no files`);
    }
  }
}

// Print results
console.log('=== Library Stats ===');
console.log(`  Templates:      ${stats.templates}`);
console.log(`  Knowledge:      ${stats.knowledgeFiles} .md files`);
console.log(`  Workflows:      ${stats.workflows}`);
console.log(`  Configs:        ${stats.configs}`);
console.log(`  Modes:          ${stats.modes}`);
console.log('');

if (errors.length > 0) {
  console.log(`=== ERRORS (${errors.length}) ===`);
  errors.forEach(e => console.log(`  [ERROR] ${e}`));
  console.log('');
}

if (warnings.length > 0) {
  console.log(`=== WARNINGS (${warnings.length}) ===`);
  warnings.forEach(w => console.log(`  [WARN]  ${w}`));
  console.log('');
}

if (errors.length === 0 && warnings.length === 0) {
  console.log('All checks passed.\n');
}

process.exit(errors.length > 0 ? 1 : 0);
