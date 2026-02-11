/**
 * Agent Module - Error Classifier
 *
 * Classifies SDK errors as retriable or fatal.
 * Used by sendMessage to implement automatic retry with backoff
 * for transient API errors (concurrency, rate limits).
 */

// ============================================
// Custom Error Class
// ============================================

/**
 * Error that can be retried with backoff.
 * Thrown by processMessageStream when a retriable error is detected.
 */
export class RetriableError extends Error {
  constructor(
    message: string,
    public readonly errorType: string
  ) {
    super(message)
    this.name = 'RetriableError'
  }
}

// ============================================
// Circuit Breaker
// ============================================

/**
 * Simple circuit breaker that tracks consecutive identical errors.
 * Prevents infinite retry loops when the same error keeps occurring.
 */
class CircuitBreaker {
  private errorCounts = new Map<string, { count: number; lastSeen: number }>()
  private readonly maxConsecutive = 3
  private readonly resetAfterMs = 60_000 // Reset after 1 minute of no errors

  /**
   * Record an error occurrence. Returns true if the circuit should break (stop retrying).
   */
  record(errorType: string): boolean {
    const now = Date.now()
    const entry = this.errorCounts.get(errorType)

    if (entry && now - entry.lastSeen < this.resetAfterMs) {
      entry.count++
      entry.lastSeen = now
      return entry.count >= this.maxConsecutive
    }

    this.errorCounts.set(errorType, { count: 1, lastSeen: now })
    return false
  }

  /**
   * Reset the breaker for a specific error type (e.g. after a successful request).
   */
  reset(errorType?: string): void {
    if (errorType) {
      this.errorCounts.delete(errorType)
    } else {
      this.errorCounts.clear()
    }
  }
}

/** Global circuit breaker instance shared across all conversations */
export const circuitBreaker = new CircuitBreaker()

// ============================================
// Error Classification
// ============================================

/** Patterns that indicate a transient, retriable error */
const RETRIABLE_PATTERNS = [
  /concurrency/i,
  /rate.?limit/i,
  /overloaded/i,
  /too many requests/i,
  /service.?unavailable/i,
  /temporarily.?unavailable/i,
  /529/,        // Anthropic overloaded status code
  /503/,        // Service unavailable
  /504/,        // Gateway timeout
  /ETIMEDOUT/i,
  /ECONNRESET/i,
  /ECONNREFUSED/i,
  /gateway.?timeout/i
]

/** Pattern for MCP tool schema validation errors (requires special retry - disable MCP) */
const SCHEMA_VALIDATION_PATTERN = /input_schema.*does not support|does not support.*oneOf|does not support.*allOf|does not support.*anyOf/i

/** Error codes from the SDK that are always fatal (never retry) */
const FATAL_ERROR_CODES = new Set([
  'authentication_failed',
  'billing_error',
  'invalid_api_key',
  'permission_denied',
  'invalid_request'
])

export interface ErrorContext {
  toolName?: string    // Which tool was running when error occurred
  attempt?: number     // Retry attempt number (0-based)
  mcpServer?: string   // Which MCP server was involved
}

export interface ErrorClassification {
  isRetriable: boolean
  errorType: string
  suggestedDelay?: number  // Optional: suggested delay in ms before retry
}

/**
 * Classify an error message and optional error code.
 * Supports optional context for smarter classification.
 *
 * @param message - Error message string from SDK
 * @param errorCode - Optional error code from SDK (e.g. 'rate_limit', 'authentication_failed')
 * @param context - Optional context (tool, attempt, MCP server)
 * @returns Classification with isRetriable flag, errorType label, and optional suggested delay
 */
export function classifyError(message: string, errorCode?: string, context?: ErrorContext): ErrorClassification {
  // Fatal error codes are never retriable
  if (errorCode && FATAL_ERROR_CODES.has(errorCode)) {
    return { isRetriable: false, errorType: errorCode }
  }

  // Check error code for known retriable types
  if (errorCode === 'rate_limit' || errorCode === 'overloaded_error') {
    // Increase delay on later attempts
    const baseDelay = errorCode === 'rate_limit' ? 5000 : 3000
    const multiplier = context?.attempt ? Math.pow(2, context.attempt) : 1
    return { isRetriable: true, errorType: errorCode, suggestedDelay: baseDelay * multiplier }
  }

  // Schema validation errors: retriable but requires disabling MCP servers
  if (SCHEMA_VALIDATION_PATTERN.test(message)) {
    return {
      isRetriable: true,
      errorType: 'schema_validation',
      suggestedDelay: 1000 // Quick retry after disabling problematic MCPs
    }
  }

  // MCP-specific errors: if a specific MCP server keeps failing, suggest disabling it
  if (context?.mcpServer && /tool.*error|server.*error|connection.*refused/i.test(message)) {
    return { isRetriable: true, errorType: `mcp_error:${context.mcpServer}`, suggestedDelay: 2000 }
  }

  // Check message content against retriable patterns
  for (const pattern of RETRIABLE_PATTERNS) {
    if (pattern.test(message)) {
      return { isRetriable: true, errorType: pattern.source.replace(/[/\\i]/g, '') }
    }
  }

  // Unknown errors are NOT retriable (conservative approach)
  return { isRetriable: false, errorType: 'unknown' }
}
