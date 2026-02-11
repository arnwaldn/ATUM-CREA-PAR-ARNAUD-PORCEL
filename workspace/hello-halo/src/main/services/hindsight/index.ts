/**
 * Hindsight Module - Native Memory Engine for ATUM CREA
 *
 * Hindsight is NOT an MCP server — it is the core self-learning memory
 * of the ATUM CREA system. It starts automatically with the app,
 * is always available in every session, and is invisible in Settings.
 *
 * Public API:
 *   - initializeHindsight(): Start server + clean old MCP config
 *   - stopServer(): Graceful shutdown
 *   - createHindsightMcpServer(): SDK MCP server for session injection
 */

export { startServer, stopServer, getHindsightDir, isHindsightReady } from './server-manager'
export { createHindsightMcpServer } from './sdk-mcp-server'

import { startServer } from './server-manager'
import { getConfig, saveConfig } from '../config.service'

/**
 * Initialize the Hindsight native memory engine.
 *
 * 1. Removes any legacy MCP config entry for "hindsight" (now native)
 * 2. Starts the HTTP server subprocess
 *
 * Called from bootstrap/essential.ts after autoDetectMcpServers().
 */
export async function initializeHindsight(): Promise<void> {
  // Clean up old MCP config entry — Hindsight is now a native component
  try {
    const config = getConfig()
    if (config.mcpServers?.hindsight) {
      const { hindsight: _, ...rest } = config.mcpServers
      saveConfig({ mcpServers: rest } as any)
      console.log('[Hindsight] Removed legacy MCP config entry (now native)')
    }
  } catch (err: any) {
    console.warn('[Hindsight] Could not clean MCP config:', err.message)
  }

  // Start the HTTP server subprocess
  try {
    await startServer()
    console.log('[Hindsight] Native memory engine initialized')
  } catch (err: any) {
    // Non-fatal: the server will retry on first tool use via ensureRunning()
    console.error('[Hindsight] Server startup failed (will retry on use):', err.message)
  }
}
