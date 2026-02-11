/**
 * Essential Services - First Screen Dependencies
 *
 * These services are REQUIRED for the initial screen render.
 * They are loaded synchronously before the window becomes interactive.
 *
 * GUIDELINES:
 *   - Each service here directly impacts startup time
 *   - Total initialization should be < 500ms
 *   - New additions require architecture review
 *
 * CURRENT SERVICES:
 *   - Config: Application configuration (API keys, settings)
 *   - Space: Workspace management (list displayed on first screen)
 *   - Conversation: Chat history (core feature)
 *   - Agent: Message handling (core feature)
 *   - Artifact: File management (sidebar display)
 *   - System: Window controls (basic functionality)
 *   - Updater: Auto-update checks (lightweight, needs early start)
 */

import { registerConfigHandlers } from '../ipc/config'
import { registerSpaceHandlers } from '../ipc/space'
import { registerConversationHandlers } from '../ipc/conversation'
import { registerAgentHandlers } from '../ipc/agent'
import { registerArtifactHandlers } from '../ipc/artifact'
import { registerSystemHandlers } from '../ipc/system'
import { registerUpdaterHandlers, initAutoUpdater } from '../services/updater.service'
import { registerAuthHandlers } from '../ipc/auth'
import { registerMcpOAuthHandlers } from '../ipc/mcp-oauth'
import { registerVoiceHandlers } from '../ipc/voice'
import { registerGitHandlers } from '../ipc/git'
import { registerBootstrapStatusHandler } from './state'
import { autoDetectClaudeCode } from '../services/claude-code-auth'
import { autoDetectMcpServers } from '../services/mcp-auto-detect'
import { initializeHindsight } from '../services/hindsight'

/**
 * Initialize essential services required for first screen render
 *
 * Window reference is managed by window.service.ts, no need to pass here.
 *
 * IMPORTANT: These handlers are loaded synchronously.
 * Only add services that are absolutely required for the initial UI.
 */
export function initializeEssentialServices(): void {
  const start = performance.now()

  // === BOOTSTRAP STATUS ===
  // Register early so renderer can query status even before extended services are ready.
  // This enables Pull+Push pattern for reliable initialization.
  registerBootstrapStatusHandler()

  // === ESSENTIAL SERVICES ===
  // Each service below is required for the first screen render.
  // Do NOT add new services without architecture review.

  // Config: Must be first - other services may depend on configuration
  registerConfigHandlers()

  // Auto-detect Claude Code CLI credentials before auth handlers
  // This creates an AI source from ~/.claude/ so the setup flow is skipped
  autoDetectClaudeCode()

  // Auto-detect MCP servers from ~/.claude/mcp-configs/mcp-servers.json
  // Merges ECC MCP ecosystem into ATUM CREA (GitHub, Memory, Context7, etc.)
  autoDetectMcpServers()

  // Hindsight: Native self-learning memory engine
  // Starts the HTTP server subprocess in the background.
  // Non-blocking: health check runs async, server retries on first tool use if needed.
  initializeHindsight().catch(err => {
    console.error('[Bootstrap] Hindsight initialization failed:', err.message)
  })

  // Auth: OAuth login handlers for multi-platform login (generic + backward compat)
  registerAuthHandlers()

  // MCP OAuth: OAuth 2.1 PKCE flow for HTTP MCP servers (Vercel, Cloudflare, ClickHouse)
  registerMcpOAuthHandlers()

  // Space: Workspace list is displayed immediately on the left sidebar
  registerSpaceHandlers()

  // Conversation: Chat history is displayed in the main content area
  registerConversationHandlers()

  // Agent: Message sending is the core feature, must be ready immediately
  registerAgentHandlers()

  // Artifact: File list is displayed in the right sidebar
  registerArtifactHandlers()

  // Voice: Speech-to-text transcription via OpenAI Whisper API
  registerVoiceHandlers()

  // Git: Read-only git operations for Canvas Git integration
  registerGitHandlers()

  // System: Window controls (maximize/minimize/close) are basic functionality
  registerSystemHandlers()

  // Updater: Lightweight, starts checking for updates in background
  registerUpdaterHandlers()
  initAutoUpdater()

  const duration = performance.now() - start
  console.log(`[Bootstrap] Essential services initialized in ${duration.toFixed(1)}ms`)
}
