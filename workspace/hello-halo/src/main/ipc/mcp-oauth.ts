/**
 * IPC Handlers - MCP OAuth 2.1 PKCE
 *
 * Handles OAuth flow lifecycle for HTTP MCP servers:
 * - Start: Discover, register, open browser for authorization
 * - Disconnect: Clear stored OAuth tokens
 * - Refresh: Force token refresh
 */

import { ipcMain, shell } from 'electron'
import {
  startOAuthFlow,
  refreshAccessToken,
  clearOAuthConfigForServer
} from '../services/mcp-oauth'
import type { McpOAuthConfig } from '../services/mcp-oauth'
import { getConfig } from '../services/config.service'

export function registerMcpOAuthHandlers(): void {
  // ============================================
  // Start OAuth Flow
  // ============================================

  ipcMain.handle(
    'mcp-oauth:start',
    async (_event, serverName: string, mcpServerUrl: string) => {
      try {
        if (!serverName || !mcpServerUrl) {
          return { success: false, error: 'Missing serverName or mcpServerUrl' }
        }

        // Validate URL
        try {
          new URL(mcpServerUrl)
        } catch {
          return { success: false, error: `Invalid MCP server URL: ${mcpServerUrl}` }
        }

        const result = await startOAuthFlow(serverName, mcpServerUrl)

        // Open browser for authorization
        try {
          await shell.openExternal(result.authUrl)
        } catch (browserError) {
          console.error('[MCP-OAuth] Failed to open browser:', browserError)
          // Return the URL so the renderer can display it for manual copy
          return {
            success: true,
            data: {
              state: result.state,
              authUrl: result.authUrl,
              manualOpen: true
            }
          }
        }

        return {
          success: true,
          data: {
            state: result.state,
            authUrl: result.authUrl,
            manualOpen: false
          }
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        console.error(`[MCP-OAuth] Start failed for "${serverName}":`, message)
        return { success: false, error: message }
      }
    }
  )

  // ============================================
  // Disconnect (Clear OAuth Tokens)
  // ============================================

  ipcMain.handle(
    'mcp-oauth:disconnect',
    async (_event, serverName: string) => {
      try {
        if (!serverName) {
          return { success: false, error: 'Missing serverName' }
        }

        clearOAuthConfigForServer(serverName)
        return { success: true }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        console.error(`[MCP-OAuth] Disconnect failed for "${serverName}":`, message)
        return { success: false, error: message }
      }
    }
  )

  // ============================================
  // Force Token Refresh
  // ============================================

  ipcMain.handle(
    'mcp-oauth:refresh',
    async (_event, serverName: string) => {
      try {
        if (!serverName) {
          return { success: false, error: 'Missing serverName' }
        }

        const config = getConfig()
        const serverConfig = (config.mcpServers || {})[serverName] as any

        if (!serverConfig || serverConfig.type !== 'http') {
          return { success: false, error: `"${serverName}" is not an HTTP MCP server` }
        }

        if (!serverConfig.oauth?.refreshToken) {
          return { success: false, error: `No refresh token for "${serverName}". Please reconnect.` }
        }

        const oauth = serverConfig.oauth as McpOAuthConfig
        const refreshed = await refreshAccessToken(serverName, oauth)

        if (refreshed) {
          return { success: true }
        }

        return { success: false, error: 'Token refresh failed. Please reconnect.' }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        console.error(`[MCP-OAuth] Refresh failed for "${serverName}":`, message)
        return { success: false, error: message }
      }
    }
  )

  console.log('[IPC] MCP OAuth handlers registered')
}
