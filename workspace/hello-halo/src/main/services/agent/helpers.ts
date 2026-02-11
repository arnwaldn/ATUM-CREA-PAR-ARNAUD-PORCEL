/**
 * Agent Module - Helper Functions
 *
 * Utility functions shared across the agent module.
 * Includes working directory management, Electron path handling,
 * API credential resolution, and renderer communication.
 */

import { app, BrowserWindow } from 'electron'
import { join, dirname } from 'path'
import { existsSync, mkdirSync, symlinkSync, unlinkSync, lstatSync, readlinkSync } from 'fs'
import { getConfig, getTempSpacePath } from '../config.service'
import { getSpace } from '../space.service'
import { getAISourceManager } from '../ai-sources'
import { broadcastToAll, broadcastToWebSocket } from '../../http/websocket'
import type { ApiCredentials, MainWindowRef } from './types'
import { MCP_REGISTRY } from '../../../shared/constants/mcp-registry'

// ============================================
// Headless Electron Path Management
// ============================================

// Cached path to headless Electron binary (outside .app bundle to prevent Dock icon on macOS)
let headlessElectronPath: string | null = null

/**
 * Get the path to the headless Electron binary.
 *
 * On macOS, when spawning Electron as a child process with ELECTRON_RUN_AS_NODE=1,
 * macOS still shows a Dock icon because it detects the .app bundle structure
 * before Electron checks the environment variable.
 *
 * Solution: Create a symlink to the Electron binary outside the .app bundle.
 * When the symlink is not inside a .app bundle, macOS doesn't register it
 * as a GUI application and no Dock icon appears.
 *
 * Why symlink instead of copy?
 * - The Electron binary depends on Electron Framework.framework via @rpath
 * - Copying just the binary breaks the framework loading
 * - Symlinks preserve the framework resolution because the real binary is still in .app
 *
 * This is a novel solution discovered while building ATUM CREA - most Electron apps
 * that spawn child processes suffer from this Dock icon flashing issue.
 */
export function getHeadlessElectronPath(): string {
  // Return cached path if already set up
  if (headlessElectronPath && existsSync(headlessElectronPath)) {
    return headlessElectronPath
  }

  const electronPath = process.execPath

  // On non-macOS platforms or if not inside .app bundle, use original path
  if (process.platform !== 'darwin' || !electronPath.includes('.app/')) {
    headlessElectronPath = electronPath
    console.log('[Agent] Using original Electron path (not macOS or not .app bundle):', headlessElectronPath)
    return headlessElectronPath
  }

  // macOS: Create symlink to Electron binary outside .app bundle to prevent Dock icon
  try {
    // Use app's userData path for the symlink (persistent across sessions)
    const userDataPath = app.getPath('userData')
    const headlessDir = join(userDataPath, 'headless-electron')
    const headlessSymlinkPath = join(headlessDir, 'electron-node')

    // Create directory if needed
    if (!existsSync(headlessDir)) {
      mkdirSync(headlessDir, { recursive: true })
    }

    // Check if symlink exists and points to correct target
    let needsSymlink = true

    if (existsSync(headlessSymlinkPath)) {
      try {
        const stat = lstatSync(headlessSymlinkPath)
        if (stat.isSymbolicLink()) {
          const currentTarget = readlinkSync(headlessSymlinkPath)
          if (currentTarget === electronPath) {
            needsSymlink = false
          } else {
            // Symlink exists but points to wrong target, remove it
            console.log('[Agent] Symlink target changed, recreating...')
            unlinkSync(headlessSymlinkPath)
          }
        } else {
          // Not a symlink (maybe old copy), remove it
          console.log('[Agent] Removing old non-symlink file...')
          unlinkSync(headlessSymlinkPath)
        }
      } catch {
        // If we can't read it, try to remove and recreate
        try {
          unlinkSync(headlessSymlinkPath)
        } catch { /* ignore */ }
      }
    }

    if (needsSymlink) {
      console.log('[Agent] Creating symlink for headless Electron mode...')
      console.log('[Agent] Target:', electronPath)
      console.log('[Agent] Symlink:', headlessSymlinkPath)

      symlinkSync(electronPath, headlessSymlinkPath)

      console.log('[Agent] Symlink created successfully')
    }

    headlessElectronPath = headlessSymlinkPath
    console.log('[Agent] Using headless Electron symlink:', headlessElectronPath)
    return headlessElectronPath
  } catch (error) {
    // Fallback to original path if symlink fails
    console.error('[Agent] Failed to set up headless Electron symlink, falling back to original:', error)
    headlessElectronPath = electronPath
    return headlessElectronPath
  }
}

// ============================================
// Working Directory Management
// ============================================

/**
 * Get working directory for a space, with optional override
 */
export function getWorkingDir(spaceId: string, workingDirOverride?: string): string {
  console.log(`[Agent] getWorkingDir called with spaceId: ${spaceId}${workingDirOverride ? `, override: ${workingDirOverride}` : ''}`)

  // If an override is provided and the directory exists, use it
  if (workingDirOverride) {
    if (existsSync(workingDirOverride)) {
      console.log(`[Agent] Using working directory override: ${workingDirOverride}`)
      return workingDirOverride
    }
    console.log(`[Agent] WARNING: Override directory does not exist, falling back to space path`)
  }

  if (spaceId === 'atum-temp') {
    const artifactsDir = join(getTempSpacePath(), 'artifacts')
    if (!existsSync(artifactsDir)) {
      mkdirSync(artifactsDir, { recursive: true })
    }
    console.log(`[Agent] Using temp space artifacts dir: ${artifactsDir}`)
    return artifactsDir
  }

  const space = getSpace(spaceId)
  console.log(`[Agent] getSpace result:`, space ? { id: space.id, name: space.name, path: space.path } : null)

  if (space) {
    console.log(`[Agent] Using space path: ${space.path}`)
    return space.path
  }

  console.log(`[Agent] WARNING: Space not found, falling back to temp path`)
  return getTempSpacePath()
}

// ============================================
// API Credentials
// ============================================

/**
 * Get API credentials based on current aiSources configuration (v2)
 * This is the central place that determines which API to use
 * Now uses AISourceManager for unified access with v2 format
 */
export async function getApiCredentials(config: ReturnType<typeof getConfig>): Promise<ApiCredentials> {
  const manager = getAISourceManager()
  await manager.ensureInitialized()

  console.log('[AgentService] getApiCredentials called')

  // Get current source from manager (v2 format)
  const currentSource = manager.getCurrentSourceConfig()

  console.log('[AgentService] currentSource:', currentSource ? {
    id: currentSource.id,
    name: currentSource.name,
    provider: currentSource.provider,
    authType: currentSource.authType
  } : null)

  // Ensure token is valid for OAuth sources
  if (currentSource?.authType === 'oauth') {
    console.log('[AgentService] Checking OAuth token validity for:', currentSource.name)
    const tokenResult = await manager.ensureValidToken(currentSource.id)
    console.log('[AgentService] Token check result:', tokenResult.success)
    if (!tokenResult.success) {
      throw new Error('OAuth token expired or invalid. Please login again.')
    }
  }

  // Get backend config from manager
  console.log('[AgentService] Calling manager.getBackendConfig()')
  const backendConfig = manager.getBackendConfig()
  console.log('[AgentService] backendConfig:', backendConfig ? {
    url: backendConfig.url,
    model: backendConfig.model,
    hasKey: !!backendConfig.key
  } : null)

  if (!backendConfig) {
    throw new Error('No AI source configured. Please configure an API key or login.')
  }

  // Determine provider type based on current source
  let provider: 'anthropic' | 'openai' | 'oauth'

  if (currentSource?.authType === 'oauth') {
    provider = 'oauth'
    console.log(`[Agent] Using OAuth provider ${currentSource.provider} via AISourceManager`)
  } else if (currentSource?.provider === 'anthropic') {
    provider = 'anthropic'
    console.log(`[Agent] Using Anthropic API via AISourceManager`)
  } else {
    // OpenAI-compatible providers (deepseek, siliconflow, etc.)
    provider = 'openai'
    console.log(`[Agent] Using OpenAI-compatible API (${currentSource?.provider || 'unknown'}) via AISourceManager`)
  }

  return {
    baseUrl: backendConfig.url,
    apiKey: backendConfig.key,
    model: backendConfig.model || 'claude-opus-4-6',
    provider,
    customHeaders: backendConfig.headers,
    apiType: backendConfig.apiType,
    forceStream: backendConfig.forceStream,
    filterContent: backendConfig.filterContent
  }
}

/**
 * Infer OpenAI wire API type from URL or environment
 */
export function inferOpenAIWireApi(apiUrl: string): 'responses' | 'chat_completions' {
  // 1. Check environment variable override
  const envApiType = process.env.ATUM_CREA_OPENAI_API_TYPE || process.env.HALO_OPENAI_API_TYPE || process.env.ATUM_CREA_OPENAI_WIRE_API || process.env.HALO_OPENAI_WIRE_API
  if (envApiType) {
    const v = envApiType.toLowerCase()
    if (v.includes('response')) return 'responses'
    if (v.includes('chat')) return 'chat_completions'
  }
  // 2. Infer from URL
  if (apiUrl) {
    if (apiUrl.includes('/chat/completions') || apiUrl.includes('/chat_completions')) return 'chat_completions'
    if (apiUrl.includes('/responses')) return 'responses'
  }
  // 3. Default to chat_completions (most common for third-party providers)
  return 'chat_completions'
}

// ============================================
// MCP Server Filtering
// ============================================

/** Patterns that indicate placeholder/unset credential values */
const PLACEHOLDER_PATTERNS = [
  /^\$\{.+\}$/,        // ${VARIABLE_NAME} (shell variable syntax, not expanded)
  /^YOUR_/i,           // YOUR_API_KEY_HERE
  /^REPLACE_/i,        // REPLACE_WITH_YOUR_KEY
  /^TODO/i,            // TODO_SET_THIS
  /^xxx/i,             // xxx placeholder
  /^sk-xxx/i,          // sk-xxx... placeholder API key
  /^change.?me/i,      // changeme
]

/**
 * Check if an MCP server config has placeholder env values that won't work
 */
export function hasPlaceholderEnvValues(config: Record<string, any>): boolean {
  const env = config.env
  if (!env || typeof env !== 'object') return false

  for (const [, value] of Object.entries(env)) {
    if (typeof value !== 'string') continue
    if (PLACEHOLDER_PATTERNS.some(p => p.test(value))) {
      return true
    }
  }

  // Also check args for ${VAR} patterns (e.g. postgres with ${DATABASE_URL} in args)
  const args = config.args
  if (Array.isArray(args)) {
    for (const arg of args) {
      if (typeof arg === 'string' && /^\$\{.+\}$/.test(arg)) {
        return true
      }
    }
  }

  return false
}

/**
 * Get placeholder env var keys from an MCP server config.
 * Returns the names of env vars that have placeholder values.
 */
export function getPlaceholderEnvKeys(config: Record<string, any>): string[] {
  const keys: string[] = []
  const env = config.env
  if (env && typeof env === 'object') {
    for (const [key, value] of Object.entries(env)) {
      if (typeof value === 'string' && PLACEHOLDER_PATTERNS.some(p => p.test(value))) {
        keys.push(key)
      }
    }
  }
  return keys
}

// ============================================
// MCP Server Descriptions & Readiness
// ============================================

/** English descriptions for all MCP servers (used in system prompt, locale-independent) */
export const MCP_DESCRIPTIONS: Record<string, string> = {
  'memory': 'Persistent memory that retains context across sessions',
  'sequential-thinking': 'Step-by-step reasoning for complex problem solving',
  'context7': 'Up-to-date documentation for frameworks and libraries',
  'filesystem': 'File operations (read, write, search)',
  'git': 'Git operations (commits, branches, diffs, history)',
  'github': 'GitHub integration (repos, issues, PRs, code search)',
  'fetch': 'Web content retrieval (pages, APIs, files)',
  'supabase': 'Supabase backend (database, auth, storage)',
  'tavily': 'AI-optimized web search',
  'exa': 'Semantic search with neural embeddings',
  'firecrawl': 'Smart web scraping and content extraction',
  'shadcn': 'Pre-built shadcn/ui components',
  'mermaid': 'Diagram generation (flowcharts, sequences, ER)',
  'echarts': 'Charts and data visualizations',
  'e2b': 'Sandboxed code execution environment',
  'sqlite': 'Local SQLite database operations',
  'vscode': 'VS Code integration',
  'semgrep': 'Static code security analysis',
  'sonarqube': 'Code quality analysis (SonarCloud)',
  'railway': 'Railway deployment (containers, databases)',
  'vercel': 'Vercel deployment (Next.js, serverless)',
  'cloudflare': 'Cloudflare Workers and Pages deployment',
  'cloudflare-docs': 'Cloudflare documentation (API reference)',
  'docker-mcp': 'Docker MCP Gateway (100+ integrations)',
  'stripe': 'Stripe payments and subscriptions',
  'sentry': 'Error monitoring and performance',
  'notion': 'Notion content and documentation management',
  'resend': 'Transactional email sending API',
  'sanity': 'Sanity headless CMS',
  'upstash': 'Serverless Redis and message queue',
  'replicate': 'ML inference (Stable Diffusion, LLMs, etc.)',
  'deepl': 'High-quality machine translation',
  'expo': 'React Native / Expo mobile development',
  'clickhouse': 'ClickHouse analytics database',
  'desktop-commander': 'System control (processes, files, terminal)',
  'puppeteer': 'Chromium browser automation',
  'playwright': 'Multi-browser automation',
  'figma': 'Figma design import and inspection',
  'blender': 'Blender 3D modeling and scenes',
  'unity': 'Unity game development',
  'dart-flutter': 'Flutter/Dart mobile development',
  'ollama': 'Local AI inference with Ollama',
  'magic-ui': '21st.dev Magic UI visual effects components',
  'youtube': 'YouTube data extraction',
  'docling': 'Document analysis (PDF, DOCX, PPTX)',
  'neo4j': 'Neo4j graph database queries and operations',
  'postgres': 'Direct PostgreSQL database connection',
  'browserbase': 'Browserbase cloud browser automation',
}

export type McpReadiness = 'active' | 'available' | 'missing-credentials'

export interface McpServerInfo {
  name: string
  status: McpReadiness
  category: string
  isCore: boolean
  description: string
  missingEnvKeys?: string[]
}

/**
 * Get readiness status of all configured MCP servers.
 * Used by system prompt and MCP orchestrator for environment awareness.
 */
export function getMcpServerReadiness(mcpServers: Record<string, any>): McpServerInfo[] {
  const results: McpServerInfo[] = []

  for (const [name, config] of Object.entries(mcpServers)) {
    // Skip native components (hindsight is not an MCP)
    if (name === 'hindsight') continue

    const meta = MCP_REGISTRY[name]
    const description = MCP_DESCRIPTIONS[name] || `MCP server: ${name}`
    const category = meta?.category || 'other'
    const isCore = meta?.isCore || false

    // Determine readiness
    const placeholderKeys = getPlaceholderEnvKeys(config)
    let status: McpReadiness

    if (placeholderKeys.length > 0) {
      status = 'missing-credentials'
    } else if (config.disabled) {
      status = 'available'
    } else {
      status = 'active'
    }

    results.push({
      name,
      status,
      category,
      isCore,
      description,
      ...(placeholderKeys.length > 0 ? { missingEnvKeys: placeholderKeys } : {}),
    })
  }

  // Sort: active first, then available, then missing-credentials
  const order: Record<McpReadiness, number> = { 'active': 0, 'available': 1, 'missing-credentials': 2 }
  results.sort((a, b) => order[a.status] - order[b.status])

  return results
}

/**
 * Filter out disabled MCP servers and servers with placeholder credentials before passing to SDK
 */
export function getEnabledMcpServers(mcpServers: Record<string, any>): Record<string, any> | null {
  if (!mcpServers || Object.keys(mcpServers).length === 0) {
    return null
  }

  const enabled: Record<string, any> = {}
  for (const [name, config] of Object.entries(mcpServers)) {
    if (config.disabled) continue

    // Hindsight is a native component, injected separately in send-message.ts
    if (name === 'hindsight') continue

    // Skip servers with placeholder credentials (they can't connect anyway)
    if (hasPlaceholderEnvValues(config)) {
      console.log(`[MCP] Skipping "${name}": placeholder credentials detected`)
      continue
    }

    // Remove ATUM CREA-only fields before passing to SDK
    const { disabled, oauth, ...sdkConfig } = config as any

    // Inject OAuth token as Authorization header for HTTP MCP servers
    if (config.type === 'http' && oauth?.accessToken) {
      if (oauth.expiresAt > Date.now()) {
        sdkConfig.headers = {
          ...sdkConfig.headers,
          'Authorization': `${oauth.tokenType || 'Bearer'} ${oauth.accessToken}`
        }
        console.log(`[MCP OAuth] Injected token for "${name}" (expires in ${Math.floor((oauth.expiresAt - Date.now()) / 1000)}s)`)
      } else {
        console.warn(`[MCP OAuth] Token expired for "${name}" (expired ${Math.floor((Date.now() - oauth.expiresAt) / 1000)}s ago)`)
      }
    }

    enabled[name] = sdkConfig
  }

  return Object.keys(enabled).length > 0 ? enabled : null
}

// ============================================
// Renderer Communication
// ============================================

// Current main window reference
let currentMainWindow: MainWindowRef = null

/**
 * Set the current main window reference
 */
export function setMainWindow(window: MainWindowRef): void {
  currentMainWindow = window
}

/**
 * Get the current main window reference
 */
export function getMainWindow(): MainWindowRef {
  return currentMainWindow
}

/**
 * Send event to renderer with session identifiers
 * Also broadcasts to WebSocket for remote clients
 */
export function sendToRenderer(
  channel: string,
  spaceId: string,
  conversationId: string,
  data: Record<string, unknown>
): void {
  // Always include spaceId and conversationId in event data
  const eventData = { ...data, spaceId, conversationId }

  // 1. Send to Electron renderer via IPC
  if (currentMainWindow && !currentMainWindow.isDestroyed()) {
    currentMainWindow.webContents.send(channel, eventData)
    // console.log(`[Agent] Sent to renderer: ${channel}`, JSON.stringify(eventData).substring(0, 200))
  }

  // 2. Broadcast to remote WebSocket clients
  try {
    broadcastToWebSocket(channel, eventData)
  } catch (error) {
    // WebSocket module might not be initialized yet, ignore
  }
}

/**
 * Broadcast event to all clients (global event, not conversation-scoped)
 */
export function broadcastToAllClients(channel: string, data: Record<string, unknown>): void {
  // 1. Send to Electron renderer via IPC (global event)
  if (currentMainWindow && !currentMainWindow.isDestroyed()) {
    currentMainWindow.webContents.send(channel, data)
  }

  // 2. Broadcast to remote WebSocket clients
  try {
    broadcastToAll(channel, data)
  } catch (error) {
    // WebSocket module might not be initialized yet, ignore
  }
}
