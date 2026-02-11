/**
 * Config Manager MCP Server
 *
 * In-process MCP server that allows Claude to manage MCP server
 * configurations directly from the chat. This enables novice users
 * to add, update, remove, and toggle MCP servers conversationally
 * without needing to edit JSON files manually.
 *
 * Pattern: Same as ai-browser/sdk-mcp-server.ts — uses SDK's
 * tool() + createSdkMcpServer() for in-process MCP tools.
 */

import { z } from 'zod'
import { tool, createSdkMcpServer } from '@anthropic-ai/claude-agent-sdk'
import { getConfig, saveConfig } from '../config.service'

// ============================================
// Helper: Read current MCP servers from config
// ============================================

function getMcpServers(): Record<string, any> {
  const config = getConfig()
  return config.mcpServers || {}
}

function saveMcpServers(servers: Record<string, any>): void {
  saveConfig({ mcpServers: servers } as any)
}

// ============================================
// Tools
// ============================================

const config_list_mcp_servers = tool(
  'config_list_mcp_servers',
  'List all configured MCP servers with their status, type, and configuration details. Shows env var keys (not values) for security.',
  {},
  async () => {
    const servers = getMcpServers()
    const names = Object.keys(servers)

    if (names.length === 0) {
      return {
        content: [{ type: 'text' as const, text: 'No MCP servers configured.' }]
      }
    }

    const lines = [`${names.length} MCP server(s) configured:\n`]

    for (const [name, config] of Object.entries(servers)) {
      const type = config.type || 'stdio'
      const disabled = config.disabled ? ' [DISABLED]' : ''
      const line = [`- **${name}**${disabled} (${type})`]

      if (type === 'stdio' && config.command) {
        const argsStr = (config.args || []).join(' ')
        line.push(`  Command: ${config.command} ${argsStr}`)
      }

      if (config.type === 'http' && config.url) {
        line.push(`  URL: ${config.url}`)
      }

      if (config.env && Object.keys(config.env).length > 0) {
        const envKeys = Object.keys(config.env)
        line.push(`  Env vars: ${envKeys.join(', ')}`)
      }

      lines.push(line.join('\n'))
    }

    return {
      content: [{ type: 'text' as const, text: lines.join('\n') }]
    }
  }
)

const config_add_mcp_server = tool(
  'config_add_mcp_server',
  'Add a new stdio MCP server to the configuration. The server will be available in the next conversation.',
  {
    name: z.string().describe('Unique server name (lowercase, alphanumeric, hyphens allowed). Example: "vercel", "github", "supabase"'),
    command: z.string().describe('Command to run. Usually "npx" for npm-based MCP servers.'),
    args: z.array(z.string()).describe('Command arguments. Example: ["-y", "vercel-mcp"] or ["-y", "@modelcontextprotocol/server-github"]'),
    env: z.record(z.string()).optional().describe('Environment variables (API keys, tokens). Example: { "VERCEL_API_TOKEN": "..." }')
  },
  async (params) => {
    const servers = getMcpServers()

    // Check for duplicate
    if (servers[params.name] !== undefined) {
      return {
        content: [{ type: 'text' as const, text: `Server "${params.name}" already exists. Use config_update_mcp_server to modify it, or config_remove_mcp_server to delete it first.` }],
        isError: true
      }
    }

    // Build config
    const newConfig: Record<string, any> = {
      command: params.command,
      args: params.args
    }
    if (params.env && Object.keys(params.env).length > 0) {
      newConfig.env = params.env
    }

    // Save
    saveMcpServers({ ...servers, [params.name]: newConfig })

    const envInfo = params.env
      ? ` with env vars: ${Object.keys(params.env).join(', ')}`
      : ''

    return {
      content: [{ type: 'text' as const, text: `MCP server "${params.name}" added successfully${envInfo}.\n\nStart a new conversation for this server to be available.` }]
    }
  }
)

const config_update_mcp_server = tool(
  'config_update_mcp_server',
  'Update an existing MCP server configuration. Useful for changing API tokens or adding new environment variables. Env vars are merged (existing keys are preserved unless overwritten).',
  {
    name: z.string().describe('Name of the server to update'),
    command: z.string().optional().describe('New command (optional)'),
    args: z.array(z.string()).optional().describe('New arguments (optional, replaces all args)'),
    env: z.record(z.string()).optional().describe('Environment variables to set or update (merged with existing)')
  },
  async (params) => {
    const servers = getMcpServers()

    if (servers[params.name] === undefined) {
      return {
        content: [{ type: 'text' as const, text: `Server "${params.name}" not found. Use config_list_mcp_servers to see available servers.` }],
        isError: true
      }
    }

    const existing = { ...servers[params.name] }

    if (params.command !== undefined) {
      existing.command = params.command
    }
    if (params.args !== undefined) {
      existing.args = params.args
    }
    if (params.env) {
      existing.env = { ...(existing.env || {}), ...params.env }
    }

    saveMcpServers({ ...servers, [params.name]: existing })

    const changes: string[] = []
    if (params.command !== undefined) changes.push('command')
    if (params.args !== undefined) changes.push('args')
    if (params.env) changes.push(`env vars: ${Object.keys(params.env).join(', ')}`)

    return {
      content: [{ type: 'text' as const, text: `MCP server "${params.name}" updated (${changes.join(', ')}).\n\nStart a new conversation for changes to take effect.` }]
    }
  }
)

const config_remove_mcp_server = tool(
  'config_remove_mcp_server',
  'Remove an MCP server from the configuration.',
  {
    name: z.string().describe('Name of the server to remove')
  },
  async (params) => {
    const servers = getMcpServers()

    if (servers[params.name] === undefined) {
      return {
        content: [{ type: 'text' as const, text: `Server "${params.name}" not found. Use config_list_mcp_servers to see available servers.` }],
        isError: true
      }
    }

    const { [params.name]: removed, ...rest } = servers
    saveMcpServers(rest)

    return {
      content: [{ type: 'text' as const, text: `MCP server "${params.name}" removed.` }]
    }
  }
)

const config_toggle_mcp_server = tool(
  'config_toggle_mcp_server',
  'Enable or disable an MCP server without removing it.',
  {
    name: z.string().describe('Name of the server to toggle'),
    enabled: z.boolean().describe('true to enable, false to disable')
  },
  async (params) => {
    const servers = getMcpServers()

    if (servers[params.name] === undefined) {
      return {
        content: [{ type: 'text' as const, text: `Server "${params.name}" not found. Use config_list_mcp_servers to see available servers.` }],
        isError: true
      }
    }

    const updated = { ...servers[params.name] }
    if (params.enabled) {
      delete updated.disabled
    } else {
      updated.disabled = true
    }

    saveMcpServers({ ...servers, [params.name]: updated })

    const status = params.enabled ? 'enabled' : 'disabled'
    return {
      content: [{ type: 'text' as const, text: `MCP server "${params.name}" ${status}.\n\nStart a new conversation for changes to take effect.` }]
    }
  }
)

// ============================================
// Export SDK MCP Server
// ============================================

const allTools = [
  config_list_mcp_servers,
  config_add_mcp_server,
  config_update_mcp_server,
  config_remove_mcp_server,
  config_toggle_mcp_server
]

/**
 * Create Config Manager SDK MCP Server
 * Always injected into every session so Claude can manage MCP configuration.
 */
export function createConfigManagerMcpServer() {
  return createSdkMcpServer({
    name: 'config-manager',
    version: '1.0.0',
    tools: allTools
  })
}

/**
 * Get all Config Manager tool names (for allowedTools if needed)
 */
export function getConfigManagerToolNames(): string[] {
  return allTools.map(t => t.name)
}
