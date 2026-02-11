/**
 * MCP Auto-Detection
 *
 * Detects MCP servers configured in ~/.claude/mcp-configs/mcp-servers.json
 * and incrementally merges new ones into ATUM CREA's config.
 *
 * On each startup:
 * - Compares ECC source servers with user's existing config
 * - Imports any ECC servers NOT already present (additive only)
 * - Never overwrites user-customized servers
 * - Servers with placeholder credentials are imported as disabled
 *
 * Pattern: Same auto-detect approach as autoDetectClaudeCode() in claude-code-auth.ts
 */

import { existsSync, readFileSync } from 'fs'
import path from 'path'
import { homedir } from 'os'
import { getConfig, saveConfig } from './config.service'
import { getCoreMcpNames } from '../../shared/constants/mcp-registry'

/** Placeholder patterns that indicate unconfigured credentials */
const PLACEHOLDER_PATTERNS = [
  /YOUR_/,
  /REPLACE_/,
  /^TODO/i,
  /^xxx/i,
  /\/path\/to\//,
]

/**
 * Check if an env value is a placeholder (not real credentials)
 */
function isPlaceholder(value: string): boolean {
  return PLACEHOLDER_PATTERNS.some(pattern => pattern.test(value))
}

/**
 * Check if a server config has placeholder credentials in env vars
 */
function hasPlaceholderCredentials(serverConfig: Record<string, any>): boolean {
  const env = serverConfig.env as Record<string, string> | undefined
  if (!env) return false

  return Object.values(env).some(val => typeof val === 'string' && isPlaceholder(val))
}

/**
 * Check if a server has placeholder values in its args
 */
function hasPlaceholderArgs(serverConfig: Record<string, any>): boolean {
  const args = serverConfig.args as string[] | undefined
  if (!args) return false

  return args.some(arg => typeof arg === 'string' && PLACEHOLDER_PATTERNS.some(p => p.test(arg)))
}

/**
 * Get the path to ~/.claude/mcp-configs/mcp-servers.json
 */
function getMcpConfigPath(): string {
  return path.join(homedir(), '.claude', 'mcp-configs', 'mcp-servers.json')
}

/**
 * Read and parse MCP servers from ~/.claude/mcp-configs/mcp-servers.json
 *
 * @returns Record of server configs, or null if file doesn't exist or is invalid
 */
function readEccMcpServers(): Record<string, Record<string, any>> | null {
  const configPath = getMcpConfigPath()

  if (!existsSync(configPath)) {
    console.log('[MCP-AutoDetect] No MCP config found at:', configPath)
    return null
  }

  try {
    const content = readFileSync(configPath, 'utf-8')
    const parsed = JSON.parse(content)

    if (!parsed.mcpServers || typeof parsed.mcpServers !== 'object') {
      console.log('[MCP-AutoDetect] Invalid MCP config format (missing mcpServers key)')
      return null
    }

    return parsed.mcpServers
  } catch (error) {
    console.error('[MCP-AutoDetect] Failed to read MCP config:', error)
    return null
  }
}

/**
 * Convert ECC MCP server config to ATUM CREA format.
 *
 * Strips the `description` field (not in ATUM CREA types) and marks
 * servers with placeholder credentials as disabled.
 */
function convertToAtumFormat(
  name: string,
  eccConfig: Record<string, any>
): Record<string, any> {
  // Strip description (ECC-only field, not in ATUM CREA's McpServerConfig)
  const { description, ...serverConfig } = eccConfig

  // Auto-disable servers with placeholder credentials or args
  if (hasPlaceholderCredentials(eccConfig) || hasPlaceholderArgs(eccConfig)) {
    console.log(`[MCP-AutoDetect] Disabling "${name}" (placeholder credentials detected)`)
    return { ...serverConfig, disabled: true }
  }

  // Non-core servers are disabled by default to avoid tool overload
  // (Anthropic recommends ~50 tools max for reliable selection)
  const coreNames = getCoreMcpNames()
  if (!coreNames.includes(name)) {
    console.log(`[MCP-AutoDetect] Disabling "${name}" (non-core, enable manually in Settings)`)
    return { ...serverConfig, disabled: true }
  }

  return serverConfig
}

/**
 * Auto-detect and incrementally merge MCP servers from ECC into ATUM CREA config.
 *
 * For each ECC server:
 * - If NOT in user config -> import (with placeholder detection for disabled flag)
 * - If already in user config -> skip (preserves user customizations)
 * - User-added servers (not in ECC) -> preserved as-is
 *
 * To prevent an ECC server from being re-imported after deletion,
 * disable it instead of deleting (the toggle exists in Settings > MCP).
 *
 * Call this from essential.ts after autoDetectClaudeCode().
 */
export function autoDetectMcpServers(): void {
  try {
    const config = getConfig()
    const existingServers = config.mcpServers || {}

    // Read ECC MCP servers
    const eccServers = readEccMcpServers()
    if (!eccServers) {
      return
    }

    const eccNames = Object.keys(eccServers)
    if (eccNames.length === 0) {
      console.log('[MCP-AutoDetect] No MCP servers found in ECC config')
      return
    }

    // Selective merge: only import ECC servers not already in user config
    const mergedServers: Record<string, any> = { ...existingServers }
    let importedCount = 0
    let skippedCount = 0
    let disabledCount = 0

    for (const [name, eccConfig] of Object.entries(eccServers)) {
      // Hindsight is a native component — never import it as an MCP server
      if (name === 'hindsight') {
        skippedCount++
        continue
      }

      // Skip servers that already exist in user config (never overwrite)
      if (existingServers[name] !== undefined) {
        skippedCount++
        continue
      }

      // New server from ECC — import it
      const converted = convertToAtumFormat(name, eccConfig)
      mergedServers[name] = converted
      importedCount++

      if (converted.disabled) {
        disabledCount++
      }
    }

    // Only save if we actually imported new servers
    if (importedCount === 0) {
      console.log(
        `[MCP-AutoDetect] All ${skippedCount} ECC servers already in config, nothing to import`
      )
      return
    }

    // Save merged config (saveConfig replaces mcpServers entirely,
    // so we pass the full merged object: existing + new)
    saveConfig({ mcpServers: mergedServers })

    const enabledCount = importedCount - disabledCount
    console.log(
      `[MCP-AutoDetect] Imported ${importedCount} new MCP servers ` +
      `(${enabledCount} enabled, ${disabledCount} disabled - need credentials), ` +
      `${skippedCount} already existed`
    )
  } catch (error) {
    console.error('[MCP-AutoDetect] Auto-detection failed:', error)
    // Non-fatal: app works fine without MCP servers
  }
}
