---
name: library-navigator
description: Navigate the ATUM CREA template library to find templates, scaffolds, workflows, and knowledge files. Use when starting any project creation.
---

# Library Navigator - ATUM CREA Template Library

## Library Root
`C:\Users\arnau\Desktop\ATUM CREA\library\`

## Structure

```
library/
├── templates/           # 164 template directories (includes full scaffolds)
├── knowledge/           # 175 pattern files (INDEX.md = entry point)
│   ├── gaming/          # 44 game dev files (Phaser, Unity, Unreal, multiplayer, physics)
│   ├── odoo/            # 15 Odoo-specific files
│   ├── mql5/            # 3 trading strategy files
│   ├── complete-templates/  # 5 full-stack template examples
│   └── reference/       # 6 reference documents
├── config/              # 24 routing configs (template-sources.json, agent-synergies.json)
├── workflows/           # 11 project workflows (saas, landing, ecommerce, api, mobile, game, desktop, ai-agent)
├── modes/               # 7 operational modes (architect, speed, quality, autonomous, standard, brainstorm, mentor)
├── prompts/             # System prompts
├── agents-legacy/       # 34 agent category directories with protocol.json and registry.json
└── llms.txt             # LLM context
```

## Project Creation Workflow

1. Read `library/knowledge/INDEX.md` to identify relevant files
2. Find template: `library/templates/{type}/`
3. Read workflow: `library/workflows/{type}-workflow.md`
4. Read knowledge: `library/knowledge/{pattern}.md`
5. Use Context7 to verify framework docs are current
6. Copy template and customize

## Key Template Categories

- **AI templates** (ai-*): 41 directories
- **RAG templates** (rag-*): 23 directories
- **Team templates** (team-*): 13 directories
- **Game templates** (game-*): 5 directories
- **Memory templates** (memory-*): 5 directories
- **Chat templates** (chat-*): 6 directories
- **MCP templates** (mcp-*): 4 directories
- **Voice templates** (voice-*): 3 directories
- **Sector-specific**: restaurant, real-estate, wedding, hotel, medical, fitness, education, photography, nonprofit, interior-design

## Critical Knowledge Files

- `design-intelligence.md` - Color palettes, typography for 35+ product types
- `stripe-patterns.md` - Payments, subscriptions, webhooks (47 KB)
- `autonomous-agents-guide.md` - Agent frameworks comparison (54 KB)
- `web-vitals-guide.md` - Core Web Vitals 2025 optimization
- `stack-2025.md` - Technology stack recommendations
- `clone-wars-catalog.md` - 100+ open-source clone references
- `mermaid-diagrams-guide.md` - Architecture diagram templates
