/**
 * MCP Orchestrator — Intelligent Dynamic MCP Server Management
 *
 * In-process MCP server that gives ATUM CREA full awareness of its MCP
 * environment and the ability to activate/deactivate servers on-the-fly
 * within a conversation, without requiring a restart.
 *
 * Uses SDK's setMcpServers() for zero-interruption dynamic loading.
 *
 * Tools:
 *   - mcp_environment: Full MCP status overview
 *   - mcp_discover:    Find relevant MCPs for an intent
 *   - mcp_activate:    Load an MCP server into the current session
 *   - mcp_deactivate:  Unload a non-core MCP server
 */

import { z } from 'zod'
import { tool, createSdkMcpServer } from '@anthropic-ai/claude-agent-sdk'
import { getConfig } from '../config.service'
import {
  getMcpServerReadiness,
  hasPlaceholderEnvValues,
  getPlaceholderEnvKeys,
  MCP_DESCRIPTIONS,
} from './helpers'
import { MCP_REGISTRY } from '../../../shared/constants/mcp-registry'

// ============================================
// Constants
// ============================================

/** Maximum MCP servers active simultaneously (prevents system overload) */
const MAX_ACTIVE_SERVERS = 8

/** Rate limit: max activations per window */
const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW_MS = 60_000

/** Base intent-to-MCP mapping (hand-curated for precision) */
const BASE_INTENT_MAP: Record<string, string[]> = {
  'deploy': ['vercel', 'railway', 'cloudflare'],
  'deployment': ['vercel', 'railway', 'cloudflare'],
  'hosting': ['vercel', 'railway', 'cloudflare'],
  'payment': ['stripe'],
  'payments': ['stripe'],
  'billing': ['stripe'],
  'subscription': ['stripe'],
  'database': ['supabase', 'postgres', 'sqlite', 'clickhouse', 'neo4j'],
  'db': ['supabase', 'postgres', 'sqlite', 'clickhouse'],
  'sql': ['supabase', 'postgres', 'sqlite'],
  'graph': ['neo4j'],
  'email': ['resend'],
  'mail': ['resend'],
  'search': ['tavily', 'exa', 'firecrawl'],
  'web search': ['tavily', 'exa'],
  'scraping': ['firecrawl', 'puppeteer', 'playwright'],
  'scrape': ['firecrawl', 'puppeteer', 'playwright'],
  'crawl': ['firecrawl'],
  'browser': ['puppeteer', 'playwright', 'browserbase'],
  'automation': ['desktop-commander', 'desktop-automation', 'puppeteer', 'playwright'],
  'mobile': ['expo', 'dart-flutter'],
  'react native': ['expo'],
  'flutter': ['dart-flutter'],
  'ios': ['expo', 'dart-flutter'],
  'android': ['expo', 'dart-flutter'],
  'design': ['figma', 'shadcn', 'magic', 'magic-ui'],
  'ui': ['shadcn', 'magic', 'magic-ui', 'figma'],
  'component': ['shadcn', 'magic-ui'],
  'chart': ['echarts', 'mermaid'],
  'diagram': ['mermaid'],
  'visualization': ['echarts'],
  'translation': ['deepl'],
  'translate': ['deepl'],
  'cms': ['notion', 'sanity'],
  'content': ['notion', 'sanity'],
  'monitoring': ['sentry'],
  'error tracking': ['sentry'],
  'security': ['semgrep', 'sonarqube'],
  'audit': ['semgrep', 'sonarqube'],
  'document': ['docling', 'code2prompt'],
  'pdf': ['docling'],
  '3d': ['blender', 'unity'],
  'game': ['unity'],
  'modeling': ['blender'],
  'ai': ['ollama', 'replicate'],
  'inference': ['ollama', 'replicate'],
  'local ai': ['ollama'],
  'ml': ['replicate', 'ollama'],
  'video': ['youtube'],
  'youtube': ['youtube'],
  'docker': ['docker-mcp'],
  'container': ['docker-mcp'],
  'cache': ['upstash'],
  'redis': ['upstash'],
  'queue': ['upstash'],
  'code execution': ['e2b'],
  'sandbox': ['e2b'],
  'file': ['filesystem'],
  'git': ['git', 'github'],
  'github': ['github'],
  'cloudflare docs': ['cloudflare-docs'],
  'documentation': ['context7', 'cloudflare-docs'],
  'code analysis': ['code2prompt', 'semgrep'],
  'vscode': ['vscode'],
}

/**
 * Build dynamic intent map by combining the curated base map
 * with keywords extracted from MCP_DESCRIPTIONS.
 * This ensures newly added MCPs are discoverable without manual mapping.
 */
function buildIntentMap(): Record<string, string[]> {
  const map: Record<string, string[]> = { ...BASE_INTENT_MAP }

  // Extract keywords from descriptions and add reverse mappings
  const stopWords = new Set(['mcp', 'server', 'for', 'and', 'the', 'with', 'that', 'from', 'via', 'using'])

  for (const [name, description] of Object.entries(MCP_DESCRIPTIONS)) {
    // Extract meaningful words from description (3+ chars, not stop words)
    const words = description.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .split(/\s+/)
      .filter(w => w.length >= 3 && !stopWords.has(w))

    for (const word of words) {
      if (!map[word]) {
        map[word] = []
      }
      if (!map[word].includes(name)) {
        map[word].push(name)
      }
    }

    // Also add the server name itself as a keyword
    if (!map[name]) {
      map[name] = [name]
    }
  }

  return map
}

/** Computed intent map (base + auto-extracted from descriptions) */
const INTENT_MAP = buildIntentMap()

// ============================================
// Session State
// ============================================

/** Reference to the active V2 session (set by send-message.ts) */
let activeSessionRef: any = null

/** Servers dynamically activated in this session (name → config) */
let dynamicServers = new Map<string, any>()

/** Activation timestamps for rate limiting */
let activationTimestamps: number[] = []

/**
 * Set the active session reference. Called from send-message.ts after session creation.
 */
export function setOrchestratorSession(session: any): void {
  activeSessionRef = session
  dynamicServers.clear()
  activationTimestamps = []
}

/**
 * Clear the session reference. Called from send-message.ts on cleanup.
 */
export function clearOrchestratorSession(): void {
  activeSessionRef = null
  dynamicServers.clear()
  activationTimestamps = []
}

// ============================================
// Helpers
// ============================================

function isRateLimited(): boolean {
  const now = Date.now()
  activationTimestamps = activationTimestamps.filter(t => now - t < RATE_LIMIT_WINDOW_MS)
  return activationTimestamps.length >= RATE_LIMIT_MAX
}

function getActiveServerCount(): number {
  const config = getConfig()
  const mcpServers = config.mcpServers || {}
  let count = 0
  for (const [name, cfg] of Object.entries(mcpServers)) {
    if (name === 'hindsight') continue
    if (!(cfg as any).disabled && !hasPlaceholderEnvValues(cfg as any)) {
      count++
    }
  }
  // Add dynamically activated servers not already in the active count
  for (const name of dynamicServers.keys()) {
    const serverCfg = mcpServers[name]
    if (serverCfg && (serverCfg as any).disabled) {
      count++ // Was disabled in config but now dynamically active
    }
  }
  return count
}

function getCoreServers(): Set<string> {
  const cores = new Set<string>()
  for (const [name, meta] of Object.entries(MCP_REGISTRY)) {
    if ((meta as any).isCore) cores.add(name)
  }
  return cores
}

// ============================================
// Tools
// ============================================

const mcp_environment = tool(
  'mcp_environment',
  'Get the full MCP environment status: all servers with their status (active, available, missing-credentials), category, description, and the current active count vs. maximum allowed.',
  {},
  async () => {
    const config = getConfig()
    const servers = getMcpServerReadiness(config.mcpServers || {})
    const activeCount = getActiveServerCount()

    const active = servers.filter(s => s.status === 'active')
    const available = servers.filter(s => s.status === 'available')
    const missing = servers.filter(s => s.status === 'missing-credentials')

    const lines = [
      `MCP Environment: ${activeCount}/${MAX_ACTIVE_SERVERS} active slots used\n`,
      `Active (${active.length}):`,
      ...active.map(s => `  - ${s.name}: ${s.description}${s.isCore ? ' [core]' : ''}`),
      `\nAvailable — can activate (${available.length}):`,
      ...available.map(s => `  - ${s.name} [${s.category}]: ${s.description}`),
      `\nMissing Credentials (${missing.length}):`,
      ...missing.map(s => `  - ${s.name}: needs ${s.missingEnvKeys?.join(', ') || 'credentials'}`),
      `\nDynamic servers this session: ${dynamicServers.size}`,
    ]

    return {
      content: [{ type: 'text' as const, text: lines.join('\n') }]
    }
  }
)

const mcp_discover = tool(
  'mcp_discover',
  'Find relevant MCP servers for a given intent or task. Returns matching servers with their readiness status. Example intents: "deploy", "payments", "database", "scraping", "mobile", "3d".',
  {
    intent: z.string().describe('The task or intent to find MCPs for (e.g., "deploy", "payment", "browser automation")')
  },
  async (params) => {
    const config = getConfig()
    const allServers = getMcpServerReadiness(config.mcpServers || {})
    const intent = params.intent.toLowerCase()

    // Find matching servers from intent map
    const matched = new Set<string>()

    // Exact and partial key matching
    for (const [key, names] of Object.entries(INTENT_MAP)) {
      if (intent.includes(key) || key.includes(intent)) {
        for (const name of names) matched.add(name)
      }
    }

    // Fuzzy: match against server names and descriptions
    for (const server of allServers) {
      if (server.name.includes(intent) || server.description.toLowerCase().includes(intent)) {
        matched.add(server.name)
      }
    }

    if (matched.size === 0) {
      return {
        content: [{
          type: 'text' as const,
          text: `No MCP servers found for intent "${params.intent}". Use mcp_environment to see all available servers.`
        }]
      }
    }

    // Build result with readiness info
    const results = allServers.filter(s => matched.has(s.name))
    const lines = [`MCP servers for "${params.intent}":\n`]
    for (const s of results) {
      const statusEmoji = s.status === 'active' ? 'ACTIVE' : s.status === 'available' ? 'READY' : 'NEEDS CREDENTIALS'
      lines.push(`- **${s.name}** [${statusEmoji}]: ${s.description}`)
      if (s.missingEnvKeys?.length) {
        lines.push(`  Needs: ${s.missingEnvKeys.join(', ')}`)
      }
    }

    return {
      content: [{ type: 'text' as const, text: lines.join('\n') }]
    }
  }
)

const mcp_activate = tool(
  'mcp_activate',
  `Dynamically load an MCP server into the current session. The server's tools become available immediately, no restart needed. Maximum ${MAX_ACTIVE_SERVERS} servers can be active simultaneously — deactivate a non-core server first if at the limit.`,
  {
    name: z.string().describe('Name of the MCP server to activate (e.g., "vercel", "stripe", "playwright")')
  },
  async (params) => {
    const serverName = params.name

    // Check session
    if (!activeSessionRef) {
      return {
        content: [{ type: 'text' as const, text: 'No active session. Cannot activate MCP servers outside of a conversation.' }],
        isError: true
      }
    }

    // Check rate limit
    if (isRateLimited()) {
      return {
        content: [{ type: 'text' as const, text: `Rate limit exceeded: maximum ${RATE_LIMIT_MAX} activations per minute. Wait a moment and try again.` }],
        isError: true
      }
    }

    // Check server exists in config
    const config = getConfig()
    const mcpServers = config.mcpServers || {}
    const serverConfig = mcpServers[serverName]

    if (!serverConfig) {
      return {
        content: [{
          type: 'text' as const,
          text: `Server "${serverName}" not found in config. Use mcp_environment to see available servers.`
        }],
        isError: true
      }
    }

    // Check if already dynamically active
    if (dynamicServers.has(serverName)) {
      return {
        content: [{ type: 'text' as const, text: `Server "${serverName}" is already active in this session.` }]
      }
    }

    // Check if already active from boot (not disabled, no placeholders)
    if (!serverConfig.disabled && !hasPlaceholderEnvValues(serverConfig)) {
      return {
        content: [{ type: 'text' as const, text: `Server "${serverName}" is already active (loaded at session start). Its tools are available now.` }]
      }
    }

    // Check placeholder credentials
    if (hasPlaceholderEnvValues(serverConfig)) {
      const keys = getPlaceholderEnvKeys(serverConfig)
      return {
        content: [{
          type: 'text' as const,
          text: `Cannot activate "${serverName}": missing credentials.\nNeeded: ${keys.join(', ')}\n\nAsk the user to provide these values, then use config_update_mcp_server to set them.`
        }],
        isError: true
      }
    }

    // Check active count limit
    const activeCount = getActiveServerCount()
    if (activeCount >= MAX_ACTIVE_SERVERS) {
      const coreServers = getCoreServers()
      // Find non-core active servers that could be deactivated
      const deactivatable = [...dynamicServers.keys()].filter(n => !coreServers.has(n))
      const suggestion = deactivatable.length > 0
        ? `\nSuggestion: deactivate one of these first: ${deactivatable.join(', ')}`
        : '\nAll active servers are core — cannot free a slot automatically.'

      return {
        content: [{
          type: 'text' as const,
          text: `Cannot activate "${serverName}": maximum ${MAX_ACTIVE_SERVERS} servers active (${activeCount} currently active).${suggestion}`
        }],
        isError: true
      }
    }

    // Build clean server config for SDK
    const { disabled, oauth, ...sdkConfig } = serverConfig as any

    // Inject OAuth token if applicable
    if (serverConfig.type === 'http' && oauth?.accessToken && oauth.expiresAt > Date.now()) {
      sdkConfig.headers = {
        ...sdkConfig.headers,
        'Authorization': `${oauth.tokenType || 'Bearer'} ${oauth.accessToken}`
      }
    }

    // Call SDK setMcpServers to load dynamically
    try {
      // Build the full dynamic servers map (existing + new)
      const allDynamic: Record<string, any> = {}
      for (const [n, c] of dynamicServers.entries()) {
        allDynamic[n] = c
      }
      allDynamic[serverName] = sdkConfig

      const result = await activeSessionRef.setMcpServers(allDynamic)

      // Track activation
      dynamicServers.set(serverName, sdkConfig)
      activationTimestamps.push(Date.now())

      const desc = MCP_DESCRIPTIONS[serverName] || serverName
      const errors = result.errors && Object.keys(result.errors).length > 0
        ? `\nWarnings: ${JSON.stringify(result.errors)}`
        : ''

      console.log(`[MCP Orchestrator] Activated "${serverName}" dynamically`)

      return {
        content: [{
          type: 'text' as const,
          text: `"${serverName}" activated — ${desc}\nTools are now available (prefix: mcp__${serverName}__).${errors}\n\nActive: ${getActiveServerCount()}/${MAX_ACTIVE_SERVERS}`
        }]
      }
    } catch (err: any) {
      return {
        content: [{
          type: 'text' as const,
          text: `Failed to activate "${serverName}": ${err.message}`
        }],
        isError: true
      }
    }
  }
)

const mcp_deactivate = tool(
  'mcp_deactivate',
  'Unload a non-core MCP server from the current session to free an active slot. Only works on servers activated dynamically in this session. Core servers cannot be deactivated.',
  {
    name: z.string().describe('Name of the MCP server to deactivate')
  },
  async (params) => {
    const serverName = params.name

    if (!activeSessionRef) {
      return {
        content: [{ type: 'text' as const, text: 'No active session.' }],
        isError: true
      }
    }

    // Check if it's a core server
    const coreServers = getCoreServers()
    if (coreServers.has(serverName)) {
      return {
        content: [{
          type: 'text' as const,
          text: `Cannot deactivate "${serverName}": it is a core server. Core servers must remain active.`
        }],
        isError: true
      }
    }

    // Check if it was dynamically activated
    if (!dynamicServers.has(serverName)) {
      return {
        content: [{
          type: 'text' as const,
          text: `Cannot deactivate "${serverName}": it was not dynamically activated in this session. Only dynamically activated servers can be deactivated.`
        }],
        isError: true
      }
    }

    try {
      // Remove from tracking
      dynamicServers.delete(serverName)

      // Rebuild dynamic servers map without the removed one
      const remaining: Record<string, any> = {}
      for (const [n, c] of dynamicServers.entries()) {
        remaining[n] = c
      }

      const result = await activeSessionRef.setMcpServers(remaining)

      console.log(`[MCP Orchestrator] Deactivated "${serverName}"`)

      return {
        content: [{
          type: 'text' as const,
          text: `"${serverName}" deactivated. Slot freed.\nActive: ${getActiveServerCount()}/${MAX_ACTIVE_SERVERS}`
        }]
      }
    } catch (err: any) {
      // Restore tracking on failure
      return {
        content: [{
          type: 'text' as const,
          text: `Failed to deactivate "${serverName}": ${err.message}`
        }],
        isError: true
      }
    }
  }
)

// ============================================
// Export SDK MCP Server
// ============================================

const allTools = [mcp_environment, mcp_discover, mcp_activate, mcp_deactivate]

/**
 * Create the MCP Orchestrator SDK MCP Server.
 * Always injected into every session for intelligent MCP management.
 */
export function createMcpOrchestratorServer() {
  return createSdkMcpServer({
    name: 'mcp-orchestrator',
    version: '1.0.0',
    tools: allTools
  })
}
