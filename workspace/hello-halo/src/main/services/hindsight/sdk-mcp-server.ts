/**
 * Hindsight SDK MCP Server
 *
 * In-process MCP server that exposes Hindsight memory tools directly
 * within every ATUM CREA session. Each tool makes HTTP requests to the
 * local Hindsight server (localhost:8888).
 *
 * Pattern: Same as config-manager-mcp.ts — uses SDK's
 * tool() + createSdkMcpServer() for in-process MCP tools.
 *
 * Tools:
 *   - hindsight_status:  Check memory engine health and stats
 *   - hindsight_banks:   List all available memory banks
 *   - hindsight_retain:  Save a memory to a bank
 *   - hindsight_recall:  Query memories from a bank
 *   - hindsight_reflect: Get AI-powered insights from a bank
 */

import { createHash } from 'crypto'
import { z } from 'zod'
import { tool, createSdkMcpServer } from '@anthropic-ai/claude-agent-sdk'
import { ensureRunning } from './server-manager'

const HINDSIGHT_URL = 'http://localhost:8888'

// Bank name aliases for backward compatibility with ULTRA-CREATE bank names
const BANK_ALIASES: Record<string, string> = {
  'ultra-dev-memory': 'development',
  'documents': 'projects',
  'research': 'world_facts',
  'trading-brain': 'trading',
}

/**
 * Resolve a bank name, applying aliases for backward compatibility
 */
function resolveBank(bank: string): string {
  return BANK_ALIASES[bank] || bank
}

/**
 * Make an HTTP request to the Hindsight server.
 * Ensures the server is running before making the request.
 * @param timeoutMs - Request timeout in milliseconds (default: 15000, use 120000+ for retain)
 */
async function hindsightFetch(path: string, options?: RequestInit, timeoutMs = 15000): Promise<any> {
  await ensureRunning()

  const res = await fetch(`${HINDSIGHT_URL}${path}`, {
    ...options,
    signal: AbortSignal.timeout(timeoutMs),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Hindsight API error (${res.status}): ${body}`)
  }

  return res.json()
}

// ============================================
// Tools
// ============================================

const hindsight_status = tool(
  'hindsight_status',
  'Check the status of the Hindsight memory engine. Returns health info, database location, and version.',
  {},
  async () => {
    try {
      const data = await hindsightFetch('/health')
      return {
        content: [{
          type: 'text' as const,
          text: [
            'Hindsight Memory Engine Status:',
            `  Status: ${data.status}`,
            `  Database: ${data.database || 'connected'}`,
            `  Version: ${data.version || '1.0'}`,
            `  Ollama: ${data.ollama || 'unknown'}`,
          ].join('\n')
        }]
      }
    } catch (err: any) {
      return {
        content: [{ type: 'text' as const, text: `Hindsight is offline: ${err.message}` }],
        isError: true
      }
    }
  }
)

const hindsight_banks = tool(
  'hindsight_banks',
  'List all available memory banks with their memory counts. Banks organize memories by topic (patterns, errors, development, projects, trading, etc.).',
  {},
  async () => {
    try {
      const data = await hindsightFetch('/v1/default/banks')
      const banks = data.banks || data || []

      if (Array.isArray(banks) && banks.length === 0) {
        return {
          content: [{ type: 'text' as const, text: 'No memory banks found. Use hindsight_retain to create your first memory.' }]
        }
      }

      const lines = ['Available memory banks:\n']
      for (const bank of banks) {
        const name = typeof bank === 'string' ? bank : bank.id || bank.name
        const count = bank.count || bank.memories_count || ''
        lines.push(`- **${name}**${count ? ` (${count} memories)` : ''}`)
      }

      return {
        content: [{ type: 'text' as const, text: lines.join('\n') }]
      }
    } catch (err: any) {
      return {
        content: [{ type: 'text' as const, text: `Failed to list banks: ${err.message}` }],
        isError: true
      }
    }
  }
)

const hindsight_retain = tool(
  'hindsight_retain',
  'Save a memory to a specific bank. Use this after learning something new, solving an error, or discovering a pattern. The memory will persist across all future conversations.',
  {
    bank: z.string().describe('Memory bank name: patterns, errors, development, projects, trading, skills, experiences, user_preferences, world_facts'),
    content: z.string().describe('The memory content to save. Be specific and include context.'),
    context: z.string().optional().describe('Optional context metadata (e.g., project name, technology, error type)')
  },
  async (params) => {
    try {
      const bankId = resolveBank(params.bank)

      // Deduplication: hash content to generate a stable document_id
      // Same content in the same bank → same document_id → upsert instead of duplicate
      const contentHash = createHash('sha256')
        .update(`${bankId}:${params.content}`)
        .digest('hex')
        .slice(0, 16)

      const item: Record<string, any> = {
        content: params.content,
        metadata: {
          bank: params.bank,
          timestamp: new Date().toISOString(),
          source: 'atum-crea',
          ...(params.context ? { context: params.context } : {})
        },
        document_id: `atum-${contentHash}`
      }

      const data = await hindsightFetch(`/v1/default/banks/${bankId}/memories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: [item] }),
      }, 120000)

      const usage = data.usage
        ? ` (${data.usage.total_tokens} tokens)`
        : ''
      return {
        content: [{
          type: 'text' as const,
          text: `Memory saved to "${bankId}" bank. Items: ${data.items_count || 1}${usage}`
        }]
      }
    } catch (err: any) {
      return {
        content: [{ type: 'text' as const, text: `Failed to retain memory: ${err.message}` }],
        isError: true
      }
    }
  }
)

const hindsight_recall = tool(
  'hindsight_recall',
  'Query memories from a specific bank. Use before starting work to recall relevant past experiences, errors, and patterns. Layer 1 returns summaries (token-efficient), layer 3 returns full details.',
  {
    bank: z.string().describe('Memory bank to query: patterns, errors, development, projects, trading, skills, experiences, user_preferences, world_facts'),
    query: z.string().describe('Search query — describe what you are looking for'),
    maxResults: z.number().optional().describe('Maximum number of results (default: 5)'),
    layer: z.number().optional().describe('Detail level: 1=summary (default, saves tokens), 2=standard, 3=full details')
  },
  async (params) => {
    try {
      const bankId = resolveBank(params.bank)
      const budgetMap: Record<number, string> = { 1: 'low', 2: 'mid', 3: 'high' }
      const body: Record<string, any> = {
        query: params.query,
        budget: budgetMap[params.layer || 1] || 'mid',
        max_tokens: (params.maxResults || 5) * 512,
      }

      const data = await hindsightFetch(`/v1/default/banks/${bankId}/memories/recall`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const memories = data.memories || data.results || data || []

      if (Array.isArray(memories) && memories.length === 0) {
        return {
          content: [{
            type: 'text' as const,
            text: `No memories found in "${bankId}" for query: "${params.query}"`
          }]
        }
      }

      const lines = [`Found ${memories.length} memory(ies) in "${bankId}":\n`]
      for (const mem of memories) {
        const content = mem.content || mem.text || JSON.stringify(mem)
        const score = mem.score !== undefined ? ` (score: ${mem.score.toFixed(2)})` : ''
        const date = mem.created_at ? ` [${new Date(mem.created_at).toLocaleDateString()}]` : ''
        lines.push(`---${score}${date}\n${content}\n`)
      }

      return {
        content: [{ type: 'text' as const, text: lines.join('\n') }]
      }
    } catch (err: any) {
      return {
        content: [{ type: 'text' as const, text: `Failed to recall memories: ${err.message}` }],
        isError: true
      }
    }
  }
)

const hindsight_reflect = tool(
  'hindsight_reflect',
  'Get AI-powered insights and analysis from accumulated memories in a bank. Useful for discovering trends, patterns, and connections across past experiences. Requires a working LLM provider (Groq, Ollama, etc.).',
  {
    bank: z.string().describe('Memory bank to reflect on: patterns, errors, development, projects, trading'),
    query: z.string().describe('What to reflect on — e.g., "common error patterns", "project architecture trends"')
  },
  async (params) => {
    try {
      const bankId = resolveBank(params.bank)
      const data = await hindsightFetch(`/v1/default/banks/${bankId}/reflect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: params.query }),
      }, 60000) // 60s timeout — Groq LPU inference is fast (~1-2s) but allow headroom

      const reflection = data.reflection || data.response || data.text || JSON.stringify(data)
      return {
        content: [{
          type: 'text' as const,
          text: `Reflection on "${bankId}" — ${params.query}:\n\n${reflection}`
        }]
      }
    } catch (err: any) {
      return {
        content: [{
          type: 'text' as const,
          text: `Reflection failed: ${err.message}\n\nNote: Reflection requires an LLM provider (Groq/Ollama) to be configured in Hindsight.`
        }],
        isError: true
      }
    }
  }
)

const hindsight_export = tool(
  'hindsight_export',
  'Export all memories from a bank as JSON. Use for backup, sharing, or migration. Returns the full memory data that can be saved to a file.',
  {
    bank: z.string().describe('Memory bank to export: patterns, errors, development, projects, trading, skills, experiences, user_preferences, world_facts')
  },
  async (params) => {
    try {
      const bankId = resolveBank(params.bank)
      // Recall with high budget and many results to get all memories
      const data = await hindsightFetch(`/v1/default/banks/${bankId}/memories/recall`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: '*', budget: 'high', max_tokens: 100000 }),
      }, 60000)

      const memories = data.memories || data.results || data || []
      const exportData = {
        bank: bankId,
        exportedAt: new Date().toISOString(),
        count: memories.length,
        memories
      }

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify(exportData, null, 2)
        }]
      }
    } catch (err: any) {
      return {
        content: [{ type: 'text' as const, text: `Export failed: ${err.message}` }],
        isError: true
      }
    }
  }
)

const hindsight_import = tool(
  'hindsight_import',
  'Import memories into a bank from previously exported JSON data. Use for restoring backups or importing shared knowledge.',
  {
    bank: z.string().describe('Target memory bank'),
    data: z.string().describe('JSON string of memories to import (array of objects with content field)')
  },
  async (params) => {
    try {
      const bankId = resolveBank(params.bank)
      const parsed = JSON.parse(params.data)
      const memories = Array.isArray(parsed) ? parsed : (parsed.memories || [])

      if (memories.length === 0) {
        return {
          content: [{ type: 'text' as const, text: 'No memories found in import data.' }]
        }
      }

      // Import each memory with deduplication hash
      const items = memories.map((mem: any) => {
        const content = mem.content || mem.text || JSON.stringify(mem)
        const hash = createHash('sha256')
          .update(`${bankId}:${content}`)
          .digest('hex')
          .slice(0, 16)
        return {
          content,
          metadata: { ...mem.metadata, imported: true, importedAt: new Date().toISOString() },
          document_id: `atum-${hash}`
        }
      })

      const data = await hindsightFetch(`/v1/default/banks/${bankId}/memories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      }, 120000)

      return {
        content: [{
          type: 'text' as const,
          text: `Imported ${items.length} memories into "${bankId}" bank. Items processed: ${data.items_count || items.length}`
        }]
      }
    } catch (err: any) {
      return {
        content: [{ type: 'text' as const, text: `Import failed: ${err.message}` }],
        isError: true
      }
    }
  }
)

// ============================================
// Export SDK MCP Server
// ============================================

const allTools = [
  hindsight_status,
  hindsight_banks,
  hindsight_retain,
  hindsight_recall,
  hindsight_reflect,
  hindsight_export,
  hindsight_import
]

/**
 * Create the Hindsight SDK MCP Server.
 * Always injected into every session — this is the core memory engine of ATUM CREA.
 */
export function createHindsightMcpServer() {
  return createSdkMcpServer({
    name: 'hindsight',
    version: '2.0.0',
    tools: allTools
  })
}
