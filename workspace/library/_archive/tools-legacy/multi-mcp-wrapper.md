# MultiMCPTools Wrapper

**Version**: 1.0.0 (Inspired by Agno MultiMCPTools)
**Category**: tools
**Purpose**: Wrapper unifie pour orchestrer plusieurs serveurs MCP simultanement

---

## Overview

Le MultiMCPTools Wrapper permet d'utiliser plusieurs serveurs MCP comme
un ensemble unifie d'outils, avec gestion de session et memoire persistante.

---

## Architecture

```
                    MULTI-MCP WRAPPER

    ┌───────────────────────────────────────────────────┐
    │                  MultiMCPTools                     │
    │                                                    │
    │   ┌─────────┐  ┌─────────┐  ┌─────────┐          │
    │   │ GitHub  │  │ Notion  │  │Firecrawl│  ...     │
    │   │  MCP    │  │  MCP    │  │  MCP    │          │
    │   └────┬────┘  └────┬────┘  └────┬────┘          │
    │        │            │            │                │
    │        └────────────┼────────────┘                │
    │                     │                             │
    │              ┌──────┴──────┐                      │
    │              │  Unified    │                      │
    │              │  Tool Set   │                      │
    │              └──────┬──────┘                      │
    │                     │                             │
    │              ┌──────┴──────┐                      │
    │              │   Agent     │                      │
    │              │  Interface  │                      │
    │              └─────────────┘                      │
    └───────────────────────────────────────────────────┘
```

---

## Configuration

### MCP Servers Groups

```yaml
development:
  - mcp__github__*          # GitHub operations
  - mcp__git__*             # Local git
  - mcp__filesystem__*      # File system
  - mcp__desktop-commander__*

research:
  - mcp__firecrawl__*       # Web scraping
  - mcp__exa__*             # Semantic search
  - mcp__context7__*        # Documentation
  - mcp__fetch__*           # URL fetching

productivity:
  - mcp__notion__*          # Notion workspace
  - mcp__memory__*          # Knowledge graph
  - mcp__hindsight__*       # Persistent memory

ui_development:
  - mcp__shadcn__*          # UI components
  - mcp__figma__*           # Design files
  - mcp__mermaid__*         # Diagrams

backend:
  - mcp__supabase__*        # Database & auth
  - mcp__postgres__*        # PostgreSQL
  - mcp__e2b__*             # Code sandbox

automation:
  - mcp__playwright__*      # Browser automation
  - mcp__puppeteer__*       # Browser control
  - mcp__desktop-automation__*
```

---

## Usage Patterns

### Pattern 1: Group Activation
```yaml
# Activate a group of MCPs
activate_group: "development"
# All github, git, filesystem MCPs now available
```

### Pattern 2: Combined Search
```yaml
# Search across multiple sources
multi_search:
  query: "authentication best practices"
  sources:
    - mcp__github__search_repositories
    - mcp__exa__web_search_exa
    - mcp__context7__get-library-docs
  merge_results: true
  rank_by: relevance
```

### Pattern 3: Pipeline Execution
```yaml
# Chain multiple MCPs
pipeline:
  step1:
    mcp: mcp__figma__view_node
    output: design_spec

  step2:
    mcp: mcp__shadcn__get_component_details
    input: design_spec.component_type
    output: component_code

  step3:
    mcp: mcp__filesystem__write_file
    input: component_code
    path: src/components/
```

---

## Session Management

### Session State
```yaml
session:
  id: "session_{uuid}"
  user_id: "user_{uuid}"
  active_mcps: []
  history: []

persistence:
  database: SqliteDb
  path: "tmp/multi_mcp_sessions.db"

memory:
  enable_user_memories: true
  add_history_to_context: true
  num_history_runs: 10
```

### Context Preservation
```yaml
context:
  # Shared across all MCPs in session
  project_path: string
  current_branch: string
  active_files: string[]

  # Per-MCP context
  github:
    owner: string
    repo: string

  supabase:
    project_ref: string
    organization: string
```

---

## Error Handling

```yaml
error_strategies:
  connection_failed:
    action: retry
    max_retries: 3
    backoff: exponential

  tool_not_found:
    action: fallback
    fallback_mcp: alternative_mcp

  timeout:
    action: cancel_and_report
    timeout_ms: 30000

  rate_limit:
    action: queue_and_wait
    queue_timeout_ms: 60000
```

---

## Integration avec ULTRA-CREATE

### Auto-Loading
```yaml
session_start:
  always_load:
    - mcp__hindsight__*     # Memory
    - mcp__memory__*        # Graph
    - mcp__context7__*      # Docs

  load_on_demand:
    # Loaded when needed
    - mcp__supabase__*
    - mcp__figma__*
    - mcp__e2b__*
```

### Command Integration
```yaml
commands:
  /mcp-status:
    description: "Show active MCPs"
    output: List of loaded MCPs with status

  /mcp-load [group]:
    description: "Load MCP group"
    groups: [development, research, productivity, ui, backend, automation]

  /mcp-search [query]:
    description: "Search across all active MCPs"
```

---

## Performance Optimization

```yaml
caching:
  enable: true
  ttl: 300  # 5 minutes
  cache_keys:
    - mcp__context7__* results
    - mcp__shadcn__* components
    - mcp__github__* repo structure

parallel_execution:
  enable: true
  max_concurrent: 5
  independent_calls_only: true

lazy_loading:
  enable: true
  # Only connect to MCP when first used
```

---

## Metriques

| Metrique | Description |
|----------|-------------|
| Active MCPs | Nombre de serveurs connectes |
| Avg Response Time | Temps moyen par appel |
| Cache Hit Rate | Ratio cache hits |
| Error Rate | Pourcentage d'echecs |
| Memory Usage | RAM utilisee |

---

## Example: Full Session

```javascript
// Session initialization
const session = {
  id: "session_abc123",
  groups: ["development", "research"],
  context: {
    project: "my-saas-app",
    branch: "feature/auth"
  }
}

// Multi-source research
const research = await multiSearch({
  query: "Supabase auth with Next.js",
  sources: [
    "mcp__context7__get-library-docs",
    "mcp__github__search_code",
    "mcp__exa__web_search_exa"
  ]
})

// Pipeline execution
const result = await pipeline([
  { mcp: "mcp__github__get_file_contents", args: {...} },
  { mcp: "mcp__supabase__execute_sql", args: {...} },
  { mcp: "mcp__filesystem__write_file", args: {...} }
])

// Save to memory
await mcp__hindsight__hindsight_retain({
  bank: "patterns",
  content: "Auth implementation pattern...",
  context: session.context
})
```

---

*MultiMCPTools Wrapper v1.0 - Unified MCP Orchestration*
