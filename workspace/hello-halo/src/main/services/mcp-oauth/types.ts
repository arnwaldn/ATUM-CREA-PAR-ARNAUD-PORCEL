/**
 * MCP OAuth 2.1 PKCE Types
 *
 * Types for the OAuth authorization flow defined in the MCP spec (June 2025).
 * Implements RFC 9728 (Protected Resource Metadata), RFC 8414 (Authorization Server Metadata),
 * RFC 7591 (Dynamic Client Registration), and RFC 7636 (PKCE).
 */

// ============================================
// Discovery Metadata
// ============================================

/** RFC 9728 - OAuth 2.0 Protected Resource Metadata */
export interface OAuthProtectedResourceMetadata {
  resource: string
  authorization_servers: string[]
  scopes_supported?: string[]
  bearer_methods_supported?: string[]
}

/** RFC 8414 - OAuth 2.0 Authorization Server Metadata */
export interface OAuthAuthorizationServerMetadata {
  issuer: string
  authorization_endpoint: string
  token_endpoint: string
  registration_endpoint?: string
  scopes_supported?: string[]
  response_types_supported?: string[]
  grant_types_supported?: string[]
  code_challenge_methods_supported?: string[]
}

// ============================================
// OAuth Flow State (in-memory, per-flow)
// ============================================

/** Tracks an in-progress OAuth authorization flow */
export interface OAuthFlowState {
  readonly serverName: string
  readonly mcpServerUrl: string
  readonly codeVerifier: string
  readonly redirectUri: string
  readonly state: string
  readonly clientId: string
  readonly resource?: string
  readonly tokenUrl: string
  readonly createdAt: number
}

// ============================================
// Token Exchange
// ============================================

/** OAuth token endpoint response */
export interface OAuthTokenResponse {
  access_token: string
  token_type: string
  expires_in?: number
  refresh_token?: string
  scope?: string
}

/** Dynamic Client Registration response (RFC 7591) */
export interface OAuthClientRegistrationResponse {
  client_id: string
  client_secret?: string
  client_id_issued_at?: number
  client_secret_expires_at?: number
}

// ============================================
// Persisted Config (stored in config.json)
// ============================================

/** OAuth tokens stored per MCP server in config.mcpServers[name].oauth */
export interface McpOAuthConfig {
  readonly accessToken: string
  readonly refreshToken?: string
  readonly expiresAt: number
  readonly tokenType: string
  readonly tokenUrl: string
  readonly clientId: string
  readonly clientSecret?: string
  readonly resource?: string
  readonly scope?: string
}

// ============================================
// IPC Types
// ============================================

export interface McpOAuthStartResult {
  state: string
  authUrl: string
}

export interface McpOAuthCallbackResult {
  serverName: string
  success: boolean
  error?: string
}

// ============================================
// Constants
// ============================================

/** Flow state expires after 10 minutes */
export const FLOW_STATE_TTL_MS = 10 * 60 * 1000

/** Refresh tokens 5 minutes before expiry */
export const REFRESH_THRESHOLD_MS = 5 * 60 * 1000
