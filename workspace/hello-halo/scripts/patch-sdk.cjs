#!/usr/bin/env node
/**
 * Patch Claude Agent SDK — add missing delegate methods to SessionImpl
 *
 * The SDK's SessionImpl class delegates most methods to this.query.*
 * but misses setMcpServers(). This patch adds it.
 *
 * Run after npm install: node scripts/patch-sdk.cjs
 */

const fs = require('fs')
const path = require('path')

const SDK_PATH = path.join(__dirname, '..', 'node_modules', '@anthropic-ai', 'claude-agent-sdk', 'sdk.mjs')

if (!fs.existsSync(SDK_PATH)) {
  console.log('[patch-sdk] SDK not found, skipping')
  process.exit(0)
}

let content = fs.readFileSync(SDK_PATH, 'utf-8')

// Patch 1: setMcpServers delegate
if (!content.includes('setMcpServers(servers)')) {
  const anchor = '  // [PATCHED] Expose subprocess PID'
  const fallbackAnchor = '  get pid() {'

  const target = content.includes(anchor) ? anchor : fallbackAnchor
  const patch = `  // [PATCHED] Expose setMcpServers for dynamic MCP orchestration
  async setMcpServers(servers) {
    return this.query.setMcpServers(servers);
  }
  `

  if (content.includes(target)) {
    content = content.replace(target, patch + target)
    console.log('[patch-sdk] Added setMcpServers delegate to SessionImpl')
  } else {
    console.warn('[patch-sdk] Could not find anchor point for setMcpServers patch')
  }
}

// Patch 2: PID getter (existing patch, preserve it)
if (!content.includes('get pid()')) {
  const anchor = '  close() {'
  const patch = `  // [PATCHED] Expose subprocess PID for health system process tracking
  get pid() {
    return this.query?.transport?.process?.pid;
  }
  `
  if (content.includes(anchor)) {
    content = content.replace(anchor, patch + anchor)
    console.log('[patch-sdk] Added PID getter to SessionImpl')
  }
}

fs.writeFileSync(SDK_PATH, content)
console.log('[patch-sdk] SDK patched successfully')
