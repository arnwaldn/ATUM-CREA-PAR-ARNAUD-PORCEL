#!/usr/bin/env node
/**
 * MCP Schema Proxy — Transparent proxy that sanitizes anyOf/oneOf/allOf
 * from MCP tool schemas to make them compatible with Claude API.
 *
 * Usage in config.json:
 *   "command": "node",
 *   "args": ["scripts/mcp-schema-proxy.cjs", "npx", "-y", "echarts-mcp-server"]
 *
 * The proxy:
 * 1. Spawns the real MCP server as a subprocess
 * 2. Forwards all stdio messages bidirectionally
 * 3. Intercepts tools/list responses and flattens anyOf/oneOf/allOf
 * 4. Is fully transparent — the CLI and MCP server don't know it exists
 */

const { spawn } = require('child_process')

// Get the real server command from args
const [,, ...serverArgs] = process.argv
if (serverArgs.length === 0) {
  process.stderr.write('[mcp-schema-proxy] Error: no server command provided\n')
  process.exit(1)
}

const cmd = serverArgs[0]
const args = serverArgs.slice(1)

// On Windows, npx/uvx need shell. Use cmd.exe /c to avoid deprecation warning.
const isWin = process.platform === 'win32'
const child = isWin
  ? spawn('cmd.exe', ['/c', cmd, ...args], { stdio: ['pipe', 'pipe', 'pipe'], env: process.env })
  : spawn(cmd, args, { stdio: ['pipe', 'pipe', 'pipe'], env: process.env })

child.stderr.pipe(process.stderr)

child.on('error', (err) => {
  process.stderr.write(`[mcp-schema-proxy] Spawn error: ${err.message}\n`)
  process.exit(1)
})

child.on('exit', (code) => {
  process.exit(code || 0)
})

// Track pending request IDs to know which responses to intercept
const toolListRequestIds = new Set()

/**
 * Sanitize a JSON Schema object by flattening anyOf/oneOf/allOf.
 * Strategy:
 * - anyOf/oneOf: merge all sub-schemas into one combined schema
 * - allOf: merge all sub-schemas (intersection)
 * Both become a single flat schema that Claude API can accept.
 */
function sanitizeSchema(schema) {
  if (typeof schema !== 'object' || schema === null) return schema

  // Handle arrays
  if (Array.isArray(schema)) {
    return schema.map(sanitizeSchema)
  }

  const result = {}

  for (const [key, value] of Object.entries(schema)) {
    if (key === 'anyOf' || key === 'oneOf') {
      // Flatten: merge all variant schemas into one permissive schema
      if (Array.isArray(value) && value.length > 0) {
        const merged = mergeSchemas(value)
        Object.assign(result, sanitizeSchema(merged))
      }
    } else if (key === 'allOf') {
      // allOf = intersection: merge all schemas together
      if (Array.isArray(value) && value.length > 0) {
        const merged = mergeSchemas(value)
        Object.assign(result, sanitizeSchema(merged))
      }
    } else {
      result[key] = sanitizeSchema(value)
    }
  }

  return result
}

/**
 * Merge multiple schemas into one permissive schema.
 * Collects all types, properties, enum values, etc.
 */
function mergeSchemas(schemas) {
  const merged = {}
  const types = new Set()
  const enumValues = new Set()
  const allProperties = {}
  const allRequired = new Set()
  let hasItems = false
  let mergedItems = null
  let description = ''

  for (const s of schemas) {
    if (typeof s !== 'object' || s === null) continue

    // Collect types
    if (s.type) {
      if (Array.isArray(s.type)) {
        s.type.forEach(t => types.add(t))
      } else {
        types.add(s.type)
      }
    }

    // Collect enums
    if (s.enum) {
      s.enum.forEach(v => enumValues.add(v))
    }

    // Collect properties
    if (s.properties) {
      for (const [k, v] of Object.entries(s.properties)) {
        allProperties[k] = v
      }
    }

    // Collect required
    if (s.required && Array.isArray(s.required)) {
      // For anyOf/oneOf, required fields should be the intersection (only required if ALL variants require it)
      // For simplicity, we don't add required fields from anyOf variants
    }

    // Collect items
    if (s.items) {
      hasItems = true
      mergedItems = s.items
    }

    // Use first non-empty description
    if (s.description && !description) {
      description = s.description
    }

    // Copy other fields
    for (const [k, v] of Object.entries(s)) {
      if (!['type', 'enum', 'properties', 'required', 'items', 'anyOf', 'oneOf', 'allOf', 'description'].includes(k)) {
        merged[k] = v
      }
    }
  }

  // Build result
  if (types.size === 1) {
    merged.type = [...types][0]
  } else if (types.size > 1) {
    // Multiple types — use the most permissive
    // Prefer object > array > string > number > boolean > null
    const priority = ['object', 'array', 'string', 'number', 'integer', 'boolean', 'null']
    for (const t of priority) {
      if (types.has(t)) {
        merged.type = t
        break
      }
    }
  }

  if (enumValues.size > 0) {
    merged.enum = [...enumValues]
  }

  if (Object.keys(allProperties).length > 0) {
    merged.properties = allProperties
    merged.type = 'object'
  }

  if (hasItems) {
    merged.items = mergedItems
  }

  if (description) {
    merged.description = description
  }

  return merged
}

/**
 * Process a tools/list response by sanitizing all tool schemas
 */
function processToolsListResponse(msg) {
  if (msg.result && msg.result.tools && Array.isArray(msg.result.tools)) {
    for (const tool of msg.result.tools) {
      if (tool.inputSchema) {
        tool.inputSchema = sanitizeSchema(tool.inputSchema)
      }
    }
  }
  return msg
}

// Buffer for incoming data (JSON-RPC messages may be split across chunks)
let childBuffer = ''
let stdinBuffer = ''

// Forward stdin (from CLI) to child, tracking tools/list requests
process.stdin.on('data', (chunk) => {
  const data = chunk.toString()
  stdinBuffer += data

  // Try to extract complete JSON-RPC messages
  const lines = stdinBuffer.split('\n')
  stdinBuffer = lines.pop() || '' // Keep incomplete last line

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    try {
      const msg = JSON.parse(trimmed)
      // Track tools/list requests so we know which responses to intercept
      if (msg.method === 'tools/list' && msg.id !== undefined) {
        toolListRequestIds.add(msg.id)
      }
    } catch {}

    // Forward to child as-is
    child.stdin.write(line + '\n')
  }
})

// Forward stdout (from child) to CLI, intercepting tools/list responses
child.stdout.on('data', (chunk) => {
  const data = chunk.toString()
  childBuffer += data

  // Try to extract complete JSON-RPC messages
  const lines = childBuffer.split('\n')
  childBuffer = lines.pop() || '' // Keep incomplete last line

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) {
      process.stdout.write('\n')
      continue
    }

    try {
      const msg = JSON.parse(trimmed)

      // Intercept tools/list responses
      if (msg.id !== undefined && toolListRequestIds.has(msg.id)) {
        toolListRequestIds.delete(msg.id)
        const sanitized = processToolsListResponse(msg)
        process.stdout.write(JSON.stringify(sanitized) + '\n')
        continue
      }
    } catch {}

    // Forward as-is
    process.stdout.write(line + '\n')
  }
})

process.stdin.on('end', () => {
  child.stdin.end()
})

process.on('SIGTERM', () => child.kill('SIGTERM'))
process.on('SIGINT', () => child.kill('SIGINT'))
