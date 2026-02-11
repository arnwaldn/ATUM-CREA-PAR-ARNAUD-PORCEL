/**
 * MCP OAuth 2.1 PKCE Service
 *
 * Implements the OAuth authorization flow for HTTP MCP servers:
 * 1. Discovery via .well-known endpoints (RFC 9728, RFC 8414)
 * 2. Dynamic Client Registration (RFC 7591)
 * 3. PKCE authorization code flow (RFC 7636)
 * 4. Token exchange and refresh
 */

import { randomBytes, createHash } from 'crypto'
import type {
  OAuthProtectedResourceMetadata,
  OAuthAuthorizationServerMetadata,
  OAuthFlowState,
  OAuthTokenResponse,
  OAuthClientRegistrationResponse,
  McpOAuthConfig,
  McpOAuthStartResult,
  McpOAuthCallbackResult
} from './types'
import { FLOW_STATE_TTL_MS, REFRESH_THRESHOLD_MS } from './types'
import { getConfig, saveConfig } from '../config.service'
import { getServerInfo, startHttpServer, isServerRunning } from '../../http/server'
import { broadcastToAllClients } from '../agent/helpers'

// ============================================
// In-Memory Flow State
// ============================================

const activeFlows = new Map<string, OAuthFlowState>()

// Cleanup expired flows periodically
setInterval(() => {
  const now = Date.now()
  for (const [state, flow] of activeFlows) {
    if (now - flow.createdAt > FLOW_STATE_TTL_MS) {
      activeFlows.delete(state)
      console.log(`[MCP-OAuth] Expired flow state for "${flow.serverName}"`)
    }
  }
}, 60_000)

// ============================================
// PKCE Utilities
// ============================================

function generateCodeVerifier(): string {
  return randomBytes(48).toString('base64url')
}

function generateCodeChallenge(verifier: string): string {
  return createHash('sha256').update(verifier).digest('base64url')
}

function generateState(): string {
  return randomBytes(32).toString('base64url')
}

// ============================================
// Discovery
// ============================================

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: { 'Accept': 'application/json' },
    signal: AbortSignal.timeout(15_000)
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} fetching ${url}`)
  }

  return response.json() as Promise<T>
}

export async function discoverProtectedResource(mcpUrl: string): Promise<OAuthProtectedResourceMetadata> {
  const baseUrl = new URL(mcpUrl)
  const wellKnownUrl = `${baseUrl.origin}/.well-known/oauth-protected-resource`
  console.log(`[MCP-OAuth] Discovering protected resource: ${wellKnownUrl}`)
  return fetchJson<OAuthProtectedResourceMetadata>(wellKnownUrl)
}

export async function discoverAuthServer(issuerUrl: string): Promise<OAuthAuthorizationServerMetadata> {
  const wellKnownUrl = `${issuerUrl.replace(/\/$/, '')}/.well-known/oauth-authorization-server`
  console.log(`[MCP-OAuth] Discovering auth server: ${wellKnownUrl}`)
  return fetchJson<OAuthAuthorizationServerMetadata>(wellKnownUrl)
}

// ============================================
// Dynamic Client Registration (RFC 7591)
// ============================================

async function registerClient(
  registrationUrl: string,
  redirectUri: string,
  serverName: string
): Promise<OAuthClientRegistrationResponse> {
  console.log(`[MCP-OAuth] Registering client at: ${registrationUrl}`)

  const response = await fetch(registrationUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_name: `ATUM CREA - ${serverName}`,
      redirect_uris: [redirectUri],
      grant_types: ['authorization_code', 'refresh_token'],
      response_types: ['code'],
      token_endpoint_auth_method: 'none'  // Public client (PKCE)
    }),
    signal: AbortSignal.timeout(15_000)
  })

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(`DCR failed (${response.status}): ${body}`)
  }

  return response.json() as Promise<OAuthClientRegistrationResponse>
}

// ============================================
// Start OAuth Flow
// ============================================

export async function startOAuthFlow(
  serverName: string,
  mcpServerUrl: string
): Promise<McpOAuthStartResult> {
  // Ensure HTTP server is running (auto-start if needed for OAuth callback)
  let serverInfo = getServerInfo()
  if (!serverInfo.running || !serverInfo.port) {
    console.log('[MCP-OAuth] HTTP server not running, auto-starting for OAuth callback...')
    const result = await startHttpServer()
    serverInfo = { running: true, port: result.port, token: result.token, clients: 0 }
    console.log(`[MCP-OAuth] HTTP server started on port ${result.port}`)
  }

  const redirectUri = `http://localhost:${serverInfo.port}/oauth/mcp/callback`

  // Step 1: Discover protected resource metadata
  const resourceMeta = await discoverProtectedResource(mcpServerUrl)
  if (!resourceMeta.authorization_servers || resourceMeta.authorization_servers.length === 0) {
    throw new Error('No authorization servers found in protected resource metadata')
  }

  const authServerUrl = resourceMeta.authorization_servers[0]

  // Step 2: Discover authorization server metadata
  const authMeta = await discoverAuthServer(authServerUrl)

  // Step 3: Dynamic Client Registration (if supported)
  let clientId: string

  if (authMeta.registration_endpoint) {
    const registration = await registerClient(authMeta.registration_endpoint, redirectUri, serverName)
    clientId = registration.client_id
    // Ignore client_secret - we're a public client using PKCE (token_endpoint_auth_method: 'none')
    if (registration.client_secret) {
      console.warn(`[MCP-OAuth] Server issued client_secret despite public client declaration. Ignoring (PKCE is sufficient).`)
    }
  } else {
    throw new Error(
      `Authorization server at ${authServerUrl} does not support Dynamic Client Registration. ` +
      'Manual client_id configuration is not yet supported.'
    )
  }

  // Step 4: Generate PKCE
  const codeVerifier = generateCodeVerifier()
  const codeChallenge = generateCodeChallenge(codeVerifier)
  const state = generateState()

  // Step 5: Store flow state
  const flowState: OAuthFlowState = {
    serverName,
    mcpServerUrl,
    codeVerifier,
    redirectUri,
    state,
    clientId,
    resource: resourceMeta.resource,
    tokenUrl: authMeta.token_endpoint,
    createdAt: Date.now()
  }
  activeFlows.set(state, flowState)

  // Step 6: Build authorization URL
  const authUrl = new URL(authMeta.authorization_endpoint)
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('client_id', clientId)
  authUrl.searchParams.set('redirect_uri', redirectUri)
  authUrl.searchParams.set('state', state)
  authUrl.searchParams.set('code_challenge', codeChallenge)
  authUrl.searchParams.set('code_challenge_method', 'S256')

  if (resourceMeta.resource) {
    authUrl.searchParams.set('resource', resourceMeta.resource)
  }

  if (resourceMeta.scopes_supported && resourceMeta.scopes_supported.length > 0) {
    authUrl.searchParams.set('scope', resourceMeta.scopes_supported.join(' '))
  }

  console.log(`[MCP-OAuth] OAuth flow started for "${serverName}" (state: ${state.slice(0, 8)}...)`)

  return { state, authUrl: authUrl.toString() }
}

// ============================================
// Handle OAuth Callback
// ============================================

export async function handleCallback(
  code: string,
  state: string
): Promise<McpOAuthCallbackResult> {
  // Validate state format (base64url from 32 random bytes = 43 chars)
  if (!state || !/^[A-Za-z0-9_-]{20,64}$/.test(state)) {
    return { serverName: 'unknown', success: false, error: 'Invalid state format' }
  }

  const flowState = activeFlows.get(state)
  if (!flowState) {
    return { serverName: 'unknown', success: false, error: 'Invalid or expired OAuth state' }
  }

  // Clean up flow state immediately
  activeFlows.delete(state)

  try {
    // Exchange authorization code for tokens
    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: flowState.redirectUri,
      client_id: flowState.clientId,
      code_verifier: flowState.codeVerifier
    })

    if (flowState.resource) {
      tokenParams.set('resource', flowState.resource)
    }

    const tokenResponse = await fetch(flowState.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: tokenParams.toString(),
      signal: AbortSignal.timeout(15_000)
    })

    if (!tokenResponse.ok) {
      const body = await tokenResponse.text().catch(() => '')
      throw new Error(`Token exchange failed (${tokenResponse.status}): ${body}`)
    }

    const tokens = await tokenResponse.json() as OAuthTokenResponse

    // Calculate expiry (default 1 hour if not specified)
    const expiresIn = tokens.expires_in || 3600
    const expiresAt = Date.now() + (expiresIn * 1000)

    // Save to config
    const oauthConfig: McpOAuthConfig = {
      accessToken: tokens.access_token,
      tokenType: tokens.token_type || 'Bearer',
      expiresAt,
      tokenUrl: flowState.tokenUrl,
      clientId: flowState.clientId,
      resource: flowState.resource,
      ...(tokens.refresh_token ? { refreshToken: tokens.refresh_token } : {}),
      ...(tokens.scope ? { scope: tokens.scope } : {})
    }

    saveOAuthConfigForServer(flowState.serverName, oauthConfig)

    console.log(`[MCP-OAuth] Token obtained for "${flowState.serverName}" (expires in ${expiresIn}s)`)

    // Broadcast success to renderer
    broadcastToAllClients('mcp-oauth:result', {
      serverName: flowState.serverName,
      success: true
    })

    return { serverName: flowState.serverName, success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`[MCP-OAuth] Token exchange failed for "${flowState.serverName}":`, message)

    broadcastToAllClients('mcp-oauth:result', {
      serverName: flowState.serverName,
      success: false,
      error: message
    })

    return { serverName: flowState.serverName, success: false, error: message }
  }
}

// ============================================
// Token Refresh
// ============================================

const refreshSemaphores = new Map<string, Promise<boolean>>()

export async function refreshAccessToken(
  serverName: string,
  oauth: McpOAuthConfig
): Promise<boolean> {
  if (!oauth.refreshToken) {
    console.warn(`[MCP-OAuth] No refresh token for "${serverName}"`)
    return false
  }

  // Prevent concurrent refreshes
  const existing = refreshSemaphores.get(serverName)
  if (existing) {
    return existing
  }

  const refreshPromise = (async (): Promise<boolean> => {
    try {
      const tokenParams = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: oauth.refreshToken!,
        client_id: oauth.clientId
      })

      if (oauth.resource) {
        tokenParams.set('resource', oauth.resource)
      }

      const response = await fetch(oauth.tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: tokenParams.toString(),
        signal: AbortSignal.timeout(15_000)
      })

      if (!response.ok) {
        const body = await response.text().catch(() => '')
        console.error(`[MCP-OAuth] Refresh failed for "${serverName}" (${response.status}): ${body}`)

        // If refresh token is invalid, clear oauth config
        if (response.status === 400 || response.status === 401) {
          clearOAuthConfigForServer(serverName)
          broadcastToAllClients('mcp:needs-auth', { servers: [serverName] })
        }
        return false
      }

      const tokens = await response.json() as OAuthTokenResponse
      const expiresIn = tokens.expires_in || 3600

      const updatedConfig: McpOAuthConfig = {
        ...oauth,
        accessToken: tokens.access_token,
        tokenType: tokens.token_type || oauth.tokenType,
        expiresAt: Date.now() + (expiresIn * 1000),
        ...(tokens.refresh_token ? { refreshToken: tokens.refresh_token } : {})
      }

      saveOAuthConfigForServer(serverName, updatedConfig)
      console.log(`[MCP-OAuth] Token refreshed for "${serverName}" (expires in ${expiresIn}s)`)
      return true
    } catch (error) {
      console.error(`[MCP-OAuth] Refresh error for "${serverName}":`, error)
      return false
    } finally {
      refreshSemaphores.delete(serverName)
    }
  })()

  refreshSemaphores.set(serverName, refreshPromise)
  return refreshPromise
}

/**
 * Refresh all MCP OAuth tokens that are about to expire.
 * Called before each SDK session init.
 */
export async function refreshExpiredMcpTokens(): Promise<void> {
  const config = getConfig()
  const mcpServers = config.mcpServers || {}
  const refreshPromises: Promise<boolean>[] = []

  for (const [name, serverConfig] of Object.entries(mcpServers)) {
    if (
      (serverConfig as any).type === 'http' &&
      (serverConfig as any).oauth?.refreshToken &&
      (serverConfig as any).oauth?.expiresAt
    ) {
      const oauth = (serverConfig as any).oauth as McpOAuthConfig
      const timeUntilExpiry = oauth.expiresAt - Date.now()

      if (timeUntilExpiry < REFRESH_THRESHOLD_MS) {
        refreshPromises.push(refreshAccessToken(name, oauth))
      }
    }
  }

  if (refreshPromises.length > 0) {
    await Promise.allSettled(refreshPromises)
  }
}

// ============================================
// Config Persistence Helpers
// ============================================

function saveOAuthConfigForServer(serverName: string, oauth: McpOAuthConfig): void {
  const config = getConfig()
  const mcpServers = config.mcpServers || {}
  const serverConfig = mcpServers[serverName]

  if (!serverConfig) {
    console.warn(`[MCP-OAuth] Server "${serverName}" not found in config`)
    return
  }

  saveConfig({
    mcpServers: {
      ...mcpServers,
      [serverName]: {
        ...serverConfig,
        oauth
      }
    }
  })
}

export function clearOAuthConfigForServer(serverName: string): void {
  const config = getConfig()
  const mcpServers = config.mcpServers || {}
  const serverConfig = mcpServers[serverName]

  if (!serverConfig || !(serverConfig as any).oauth) {
    return
  }

  const { oauth, ...rest } = serverConfig as any
  saveConfig({
    mcpServers: {
      ...mcpServers,
      [serverName]: rest
    }
  })

  console.log(`[MCP-OAuth] Cleared OAuth config for "${serverName}"`)
}

// ============================================
// Flow State Accessors
// ============================================

export function getFlowState(state: string): OAuthFlowState | undefined {
  return activeFlows.get(state)
}

export function hasActiveFlows(): boolean {
  return activeFlows.size > 0
}
