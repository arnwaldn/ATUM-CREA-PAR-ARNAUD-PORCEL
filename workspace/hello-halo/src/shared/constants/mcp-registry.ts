/**
 * MCP Server Registry
 *
 * Static metadata for all known MCP servers: descriptions, categories, core flags.
 * This data lives in code (not config.json) to avoid polluting the SDK config.
 *
 * IMPORTANT: This file NEVER modifies config.json. It only provides UI metadata.
 */

// ============================================
// Types
// ============================================

export type McpCategory =
  | 'core'
  | 'search'
  | 'dev-tools'
  | 'deployment'
  | 'external-services'
  | 'automation'
  | 'specialty'

export interface McpServerMeta {
  /** i18n key for the description shown in Settings UI */
  descriptionKey: string
  /** Category for grouping in Settings UI */
  category: McpCategory
  /** Whether this server is essential for vibe coding (shown with Core badge) */
  isCore: boolean
  /** Sort order within the category (lower = higher in list) */
  sortOrder: number
}

export interface McpCategoryInfo {
  /** i18n key for category label */
  labelKey: string
  /** Sort order for category groups (lower = higher in list) */
  sortOrder: number
}

// ============================================
// Category Definitions
// ============================================

export const MCP_CATEGORIES: Record<McpCategory, McpCategoryInfo> = {
  'core': { labelKey: 'mcp.category.core', sortOrder: 0 },
  'search': { labelKey: 'mcp.category.search', sortOrder: 1 },
  'dev-tools': { labelKey: 'mcp.category.devTools', sortOrder: 2 },
  'deployment': { labelKey: 'mcp.category.deployment', sortOrder: 3 },
  'external-services': { labelKey: 'mcp.category.externalServices', sortOrder: 4 },
  'automation': { labelKey: 'mcp.category.automation', sortOrder: 5 },
  'specialty': { labelKey: 'mcp.category.specialty', sortOrder: 6 },
}

// ============================================
// Server Registry (56 entries — 9 core, 4 search, 13 dev-tools, 5 deployment, 15 external, 6 automation, 4 specialty)
// Architecture: 9 core (always active) + 47 on-demand (dynamically activated via mcp_activate/mcp_deactivate)
// ============================================

export const MCP_REGISTRY: Record<string, McpServerMeta> = {
  // ── Core (9) ──────────────────────────────────────────────
  'memory': {
    descriptionKey: 'mcp.desc.memory',
    category: 'core',
    isCore: true,
    sortOrder: 0,
  },
  'sequential-thinking': {
    descriptionKey: 'mcp.desc.sequentialThinking',
    category: 'core',
    isCore: true,
    sortOrder: 1,
  },
  'context7': {
    descriptionKey: 'mcp.desc.context7',
    category: 'core',
    isCore: true,
    sortOrder: 2,
  },
  'filesystem': {
    descriptionKey: 'mcp.desc.filesystem',
    category: 'core',
    isCore: true,
    sortOrder: 3,
  },
  'git': {
    descriptionKey: 'mcp.desc.git',
    category: 'core',
    isCore: true,
    sortOrder: 4,
  },
  'github': {
    descriptionKey: 'mcp.desc.github',
    category: 'core',
    isCore: true,
    sortOrder: 5,
  },
  'fetch': {
    descriptionKey: 'mcp.desc.fetch',
    category: 'core',
    isCore: true,
    sortOrder: 6,
  },
  'supabase': {
    descriptionKey: 'mcp.desc.supabase',
    category: 'core',
    isCore: true,
    sortOrder: 7,
  },
  'desktop-commander': {
    descriptionKey: 'mcp.desc.desktopCommander',
    category: 'core',
    isCore: true,
    sortOrder: 8,
  },

  // ── Search (4) ────────────────────────────────────────────
  'tavily': {
    descriptionKey: 'mcp.desc.tavily',
    category: 'search',
    isCore: false,
    sortOrder: 0,
  },
  'exa': {
    descriptionKey: 'mcp.desc.exa',
    category: 'search',
    isCore: false,
    sortOrder: 1,
  },
  'firecrawl': {
    descriptionKey: 'mcp.desc.firecrawl',
    category: 'search',
    isCore: false,
    sortOrder: 2,
  },
  'youtube': {
    descriptionKey: 'mcp.desc.youtube',
    category: 'search',
    isCore: false,
    sortOrder: 3,
  },

  // ── Dev Tools (13) ───────────────────────────────────────
  'shadcn': {
    descriptionKey: 'mcp.desc.shadcn',
    category: 'dev-tools',
    isCore: false,
    sortOrder: 0,
  },
  'magic': {
    descriptionKey: 'mcp.desc.magic',
    category: 'dev-tools',
    isCore: false,
    sortOrder: 1,
  },
  'magic-ui': {
    descriptionKey: 'mcp.desc.magicUi',
    category: 'dev-tools',
    isCore: false,
    sortOrder: 2,
  },
  'mermaid': {
    descriptionKey: 'mcp.desc.mermaid',
    category: 'dev-tools',
    isCore: false,
    sortOrder: 3,
  },
  'echarts': {
    descriptionKey: 'mcp.desc.echarts',
    category: 'dev-tools',
    isCore: false,
    sortOrder: 4,
  },
  'e2b': {
    descriptionKey: 'mcp.desc.e2b',
    category: 'dev-tools',
    isCore: false,
    sortOrder: 5,
  },
  'sqlite': {
    descriptionKey: 'mcp.desc.sqlite',
    category: 'dev-tools',
    isCore: false,
    sortOrder: 6,
  },
  // hindsight: Removed — now a native component (see src/main/services/hindsight/)
  'code2prompt': {
    descriptionKey: 'mcp.desc.code2prompt',
    category: 'dev-tools',
    isCore: false,
    sortOrder: 7,
  },
  'docling': {
    descriptionKey: 'mcp.desc.docling',
    category: 'dev-tools',
    isCore: false,
    sortOrder: 8,
  },
  'vscode': {
    descriptionKey: 'mcp.desc.vscode',
    category: 'dev-tools',
    isCore: false,
    sortOrder: 9,
  },
  'semgrep': {
    descriptionKey: 'mcp.desc.semgrep',
    category: 'dev-tools',
    isCore: false,
    sortOrder: 10,
  },
  'sonarqube': {
    descriptionKey: 'mcp.desc.sonarqube',
    category: 'dev-tools',
    isCore: false,
    sortOrder: 11,
  },
  'ffmpeg': {
    descriptionKey: 'mcp.desc.ffmpeg',
    category: 'dev-tools',
    isCore: false,
    sortOrder: 12,
  },

  // ── Deployment (5) ────────────────────────────────────────
  'railway': {
    descriptionKey: 'mcp.desc.railway',
    category: 'deployment',
    isCore: false,
    sortOrder: 0,
  },
  'vercel': {
    descriptionKey: 'mcp.desc.vercel',
    category: 'deployment',
    isCore: false,
    sortOrder: 1,
  },
  'cloudflare': {
    descriptionKey: 'mcp.desc.cloudflare',
    category: 'deployment',
    isCore: false,
    sortOrder: 2,
  },
  'cloudflare-docs': {
    descriptionKey: 'mcp.desc.cloudflareDocs',
    category: 'deployment',
    isCore: false,
    sortOrder: 3,
  },
  'docker-mcp': {
    descriptionKey: 'mcp.desc.dockerMcp',
    category: 'deployment',
    isCore: false,
    sortOrder: 4,
  },

  // ── External Services (15) ───────────────────────────────
  'stripe': {
    descriptionKey: 'mcp.desc.stripe',
    category: 'external-services',
    isCore: false,
    sortOrder: 0,
  },
  'sentry': {
    descriptionKey: 'mcp.desc.sentry',
    category: 'external-services',
    isCore: false,
    sortOrder: 1,
  },
  'notion': {
    descriptionKey: 'mcp.desc.notion',
    category: 'external-services',
    isCore: false,
    sortOrder: 2,
  },
  'resend': {
    descriptionKey: 'mcp.desc.resend',
    category: 'external-services',
    isCore: false,
    sortOrder: 3,
  },
  'sanity': {
    descriptionKey: 'mcp.desc.sanity',
    category: 'external-services',
    isCore: false,
    sortOrder: 4,
  },
  'upstash': {
    descriptionKey: 'mcp.desc.upstash',
    category: 'external-services',
    isCore: false,
    sortOrder: 5,
  },
  'replicate': {
    descriptionKey: 'mcp.desc.replicate',
    category: 'external-services',
    isCore: false,
    sortOrder: 6,
  },
  'deepl': {
    descriptionKey: 'mcp.desc.deepl',
    category: 'external-services',
    isCore: false,
    sortOrder: 7,
  },
  'expo': {
    descriptionKey: 'mcp.desc.expo',
    category: 'external-services',
    isCore: false,
    sortOrder: 8,
  },
  'clickhouse': {
    descriptionKey: 'mcp.desc.clickhouse',
    category: 'external-services',
    isCore: false,
    sortOrder: 9,
  },
  'neo4j': {
    descriptionKey: 'mcp.desc.neo4j',
    category: 'external-services',
    isCore: false,
    sortOrder: 10,
  },
  'postgres': {
    descriptionKey: 'mcp.desc.postgres',
    category: 'external-services',
    isCore: false,
    sortOrder: 11,
  },
  'mongodb': {
    descriptionKey: 'mcp.desc.mongodb',
    category: 'external-services',
    isCore: false,
    sortOrder: 12,
  },
  'elevenlabs': {
    descriptionKey: 'mcp.desc.elevenlabs',
    category: 'external-services',
    isCore: false,
    sortOrder: 13,
  },
  'slack': {
    descriptionKey: 'mcp.desc.slack',
    category: 'external-services',
    isCore: false,
    sortOrder: 14,
  },

  // ── Automation (6) ────────────────────────────────────────
  // desktop-commander: Moved to Core (9th core server)
  'desktop-automation': {
    descriptionKey: 'mcp.desc.desktopAutomation',
    category: 'automation',
    isCore: false,
    sortOrder: 0,
  },
  'puppeteer': {
    descriptionKey: 'mcp.desc.puppeteer',
    category: 'automation',
    isCore: false,
    sortOrder: 1,
  },
  'playwright': {
    descriptionKey: 'mcp.desc.playwright',
    category: 'automation',
    isCore: false,
    sortOrder: 2,
  },
  'browserbase': {
    descriptionKey: 'mcp.desc.browserbase',
    category: 'automation',
    isCore: false,
    sortOrder: 3,
  },
  'figma': {
    descriptionKey: 'mcp.desc.figma',
    category: 'automation',
    isCore: false,
    sortOrder: 4,
  },
  'n8n': {
    descriptionKey: 'mcp.desc.n8n',
    category: 'automation',
    isCore: false,
    sortOrder: 5,
  },

  // ── Specialty (4) ─────────────────────────────────────────
  'blender': {
    descriptionKey: 'mcp.desc.blender',
    category: 'specialty',
    isCore: false,
    sortOrder: 0,
  },
  'unity': {
    descriptionKey: 'mcp.desc.unity',
    category: 'specialty',
    isCore: false,
    sortOrder: 1,
  },
  'dart-flutter': {
    descriptionKey: 'mcp.desc.dartFlutter',
    category: 'specialty',
    isCore: false,
    sortOrder: 2,
  },
  'ollama': {
    descriptionKey: 'mcp.desc.ollama',
    category: 'specialty',
    isCore: false,
    sortOrder: 3,
  },
}

// ============================================
// Helper Functions
// ============================================

/**
 * Get metadata for an MCP server by name.
 * Returns undefined for servers not in the registry (custom/unknown).
 */
export function getMcpMeta(name: string): McpServerMeta | undefined {
  return MCP_REGISTRY[name]
}

/**
 * Get names of all core MCP servers.
 * Used by mcp-auto-detect to enable only core servers by default.
 */
export function getCoreMcpNames(): string[] {
  return Object.entries(MCP_REGISTRY)
    .filter(([, meta]) => meta.isCore)
    .map(([name]) => name)
}

/**
 * Recommended MCP servers for the ATUM CREA experience.
 * Maps to the 9 core servers that are always active at startup.
 * All other servers are in the on-demand pool, activated dynamically
 * via mcp_activate/mcp_deactivate when needed during a session.
 * Used by "Apply recommended defaults" in Settings UI.
 */
const RECOMMENDED_MCP_NAMES: string[] = [
  // Core (9) — always active at startup
  'memory', 'sequential-thinking', 'context7', 'filesystem', 'git', 'github', 'fetch', 'supabase',
  'desktop-commander',
]

/**
 * Get names of all recommended MCP servers (= 9 core servers).
 * Used by "Apply recommended defaults" button in Settings UI.
 * Enables only core servers, disabling all others for dynamic on-demand activation.
 */
export function getRecommendedMcpNames(): string[] {
  return [...RECOMMENDED_MCP_NAMES]
}
