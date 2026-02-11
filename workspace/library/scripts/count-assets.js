#!/usr/bin/env node
/**
 * ATUM CREA Asset Counter
 * Quick counts of all library assets for CLAUDE.md synchronization.
 * Usage: node count-assets.js [library-path]
 */

const fs = require('fs');
const path = require('path');

const LIBRARY_ROOT = process.argv[2] || path.resolve(__dirname, '..');

function countRecursive(dir, ext) {
  let count = 0;
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isFile() && (!ext || entry.name.endsWith(ext))) count++;
      if (entry.isDirectory()) count += countRecursive(fullPath, ext);
    }
  } catch { /* skip */ }
  return count;
}

function countDirs(dir) {
  try {
    return fs.readdirSync(dir, { withFileTypes: true }).filter(e => e.isDirectory()).length;
  } catch { return 0; }
}

function countByPrefix(dir, prefix) {
  try {
    return fs.readdirSync(dir, { withFileTypes: true })
      .filter(e => e.isDirectory() && e.name.startsWith(prefix)).length;
  } catch { return 0; }
}

const templatesDir = path.join(LIBRARY_ROOT, 'templates');

console.log('=== ATUM CREA Library Asset Count ===\n');

console.log('Top-level counts:');
console.log(`  templates/          ${countDirs(templatesDir)} directories`);
console.log(`  knowledge/          ${countRecursive(path.join(LIBRARY_ROOT, 'knowledge'), '.md')} .md files`);
console.log(`  workflows/          ${countRecursive(path.join(LIBRARY_ROOT, 'workflows'), '.md')} .md files`);
console.log(`  config/             ${countRecursive(path.join(LIBRARY_ROOT, 'config'), null)} files`);
console.log(`  modes/              ${countRecursive(path.join(LIBRARY_ROOT, 'modes'), '.md')} .md files`);
console.log('');

console.log('Template categories:');
const prefixes = ['ai-', 'rag-', 'team-', 'game-', 'memory-', 'chat-', 'mcp-', 'voice-'];
for (const p of prefixes) {
  console.log(`  ${(p + '*').padEnd(12)} ${countByPrefix(templatesDir, p)} directories`);
}
console.log('');

console.log('Use these numbers to update CLAUDE.md and skill files.');
