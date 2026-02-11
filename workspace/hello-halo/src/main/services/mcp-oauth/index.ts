/**
 * MCP OAuth Module - Public API
 */

export type {
  OAuthProtectedResourceMetadata,
  OAuthAuthorizationServerMetadata,
  OAuthFlowState,
  OAuthTokenResponse,
  McpOAuthConfig,
  McpOAuthStartResult,
  McpOAuthCallbackResult
} from './types'

export { FLOW_STATE_TTL_MS, REFRESH_THRESHOLD_MS } from './types'

export {
  startOAuthFlow,
  handleCallback,
  refreshAccessToken,
  refreshExpiredMcpTokens,
  clearOAuthConfigForServer,
  getFlowState,
  hasActiveFlows
} from './oauth-service'
