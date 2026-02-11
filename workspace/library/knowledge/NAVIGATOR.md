# Knowledge Navigator - Semantic Discovery

> **Version**: 1.0.0
> **Purpose**: Find the right knowledge file in < 10 seconds
> **Usage**: Consult this file to locate relevant documentation

---

## Quick Find by Intent

### "I want to BUILD something"

| What | Knowledge File | One-liner |
|------|----------------|-----------|
| Web app | `stack-2025.md` | Tech stack recommendations |
| SaaS | `templates/saas-template.md` | Auth, payments, dashboard |
| Landing page | `templates/landing-page.md` | Conversion-optimized |
| E-commerce | `templates/ecommerce-template.md` | Cart, checkout, inventory |
| API backend | `templates/api-template.md` | Hono, REST, GraphQL |
| Game 2D | `gaming/INDEX.md` → Phaser | Browser games |
| Game 3D | `gaming/INDEX.md` → Three.js/Unity | WebGL or native |
| Mobile app | `templates/mobile-template.md` | Expo SDK 52+ |
| Desktop app | `electron-patterns.md` | Tauri 2.0 recommended |
| Trading bot | `mql5/mql5-complete-guide.md` | MT5 Expert Advisors |
| Odoo module | `odoo/INDEX.md` | ERP customization |

### "I'm STUCK on something"

| Problem | Knowledge File | Solution Type |
|---------|----------------|---------------|
| Error I've seen | Hindsight `errors` bank | `hindsight_recall({bank: 'errors', query: '[error]'})` |
| Framework confusion | Context7 MCP | `context7__get-library-docs({libraryName})` |
| Architecture decision | `patterns.md` | Common patterns |
| Performance issue | `web-vitals-guide.md` | LCP, INP, CLS optimization |
| Security concern | `security-taxonomy.md` | 11 vulnerability categories |
| Database design | `odoo/odoo-performance-guide.md` | PostgreSQL patterns |
| Auth issues | `anthropic-best-practices-2025.md` | Clerk/Supabase patterns |

### "I want to LEARN something"

| Topic | Knowledge File | Depth |
|-------|----------------|-------|
| ATUM CREA philosophy | `vibe-coding-methodology.md` | Core concepts |
| How agents work | `reference/agents-detailed.md` | 148 agents |
| Available templates | `reference/templates-detailed.md` | 157 templates |
| MCP ecosystem | `reference/mcps-detailed.md` | 57 MCPs |
| Claude best practices | `anthropic-best-practices-2025.md` | Official guide |
| Game development | `gaming/INDEX.md` | Complete guide |

### "I want to OPTIMIZE something"

| Area | Knowledge File | Focus |
|------|----------------|-------|
| Web performance | `web-vitals-guide.md` | Core Web Vitals |
| Token usage | `anthropic-best-practices-2025.md` | Efficiency patterns |
| Database queries | `odoo/odoo-performance-guide.md` | PostgreSQL |
| Security | `strix-patterns.md` | Vulnerability testing |
| Code quality | `production-checklist.md` | Deployment ready |

---

## By Technology Stack

### Frontend

| Tech | Primary | Secondary |
|------|---------|-----------|
| Next.js 15 | `stack-2025.md` | Context7 docs |
| React 19 | `stack-2025.md` | Context7 docs |
| TailwindCSS 4 | `stack-2025.md` | shadcn MCP |
| shadcn/ui | shadcn MCP | `ui-components.md` |

### Backend

| Tech | Primary | Secondary |
|------|---------|-----------|
| Supabase | `stack-2025.md` | `supabase-ssr-patterns.md` |
| Hono | `stack-2025.md` | Context7 docs |
| Prisma 6 | `stack-2025.md` | Context7 docs |
| PostgreSQL | `odoo/odoo-performance-guide.md` | - |

### Auth & Payments

| Tech | Primary | Secondary |
|------|---------|-----------|
| Clerk | `stack-2025.md` | Context7 docs |
| Supabase Auth | `supabase-ssr-patterns.md` | - |
| Stripe | `stripe-patterns.md` | Context7 docs |

### Games

| Engine | Primary | Index |
|--------|---------|-------|
| Phaser 3 | `gaming/references/phaser-best-practices.md` | gaming/INDEX.md |
| Three.js | `gaming/INDEX.md` | - |
| Unity 6 | `gaming/unity/` | 8 guides |
| Godot | `gaming/INDEX.md` | - |

### Specialized

| Domain | Primary | Depth |
|--------|---------|-------|
| Odoo | `odoo/INDEX.md` | 16 guides |
| MQL5/Trading | `mql5/mql5-complete-guide.md` | Complete |
| AI/RAG | `graphrag-patterns.md` | Advanced |

---

## By Task Type

### CREATE (New Project)

```
1. Check: stack-2025.md (tech recommendations)
2. Find template: templates/manifest.json
3. Load docs: Context7 for frameworks
4. Recall patterns: hindsight_recall({bank: 'patterns', query: '[type]'})
```

### DEBUG (Fix Issues)

```
1. Recall: hindsight_recall({bank: 'errors', query: '[error_message]'})
2. If no match: Context7 for framework docs
3. Check: always-rules-guide.md for common mistakes
4. Security: security-taxonomy.md if security-related
```

### OPTIMIZE (Improve)

```
1. Performance: web-vitals-guide.md
2. Security: strix-patterns.md
3. Quality: production-checklist.md
4. Patterns: patterns.md
```

### DEPLOY (Ship)

```
1. Checklist: production-checklist.md
2. Security scan: security-taxonomy.md
3. Platform: vercel-advanced-patterns.md
```

---

## Auto-Discovery Queries

### For Building

```javascript
// Template matching
hindsight_recall({
  bank: 'patterns',
  query: `template ${tech} ${type}`,
  top_k: 3
});

// Framework docs
context7__resolve-library-id({libraryName: framework});
context7__get-library-docs({libraryId, topic, mode: 'code'});
```

### For Debugging

```javascript
// Error lookup
hindsight_recall({
  bank: 'errors',
  query: `${errorType} ${framework}`,
  top_k: 5
});
```

### For Learning

```javascript
// Direct file read
Read('C:/Users/arnau/Desktop/ATUM CREA/library/knowledge/[topic].md');
```

---

## Directory Structure

```
knowledge/
├── INDEX.md                    # Intent routing (legacy)
├── NAVIGATOR.md                # This file - semantic discovery
├── SEMANTIC-INDEX.md           # Full tag index
├── vibe-coding-methodology.md  # Core philosophy
├── stack-2025.md               # Tech recommendations
├── patterns.md                 # Code patterns
├── anthropic-best-practices-2025.md
├── strix-patterns.md           # Security testing
├── security-taxonomy.md        # Vulnerabilities
├── production-checklist.md     # Deployment ready
│
├── gaming/                     # Game development (8+ files)
│   ├── INDEX.md
│   ├── unity/                  # Unity guides (8 files)
│   ├── references/             # Engine patterns
│   └── ...
│
├── odoo/                       # ERP development (16 files)
│   ├── INDEX.md
│   └── ...
│
├── mql5/                       # Trading (2 files)
│
├── templates/                  # Template docs
│
├── reference/                  # Detailed references
│   ├── agents-detailed.md
│   ├── templates-detailed.md
│   ├── mcps-detailed.md
│   └── hooks-detailed.md
│
├── onboarding/                 # Progressive learning
│   ├── LEVEL-1-QUICKSTART.md
│   ├── LEVEL-2-INTERMEDIATE.md
│   ├── LEVEL-3-REFERENCE.md
│   └── LEVEL-4-EXPERT.md
│
└── learnings/                  # Accumulated knowledge
    └── system.md
```

---

## Search Priority

When looking for information, check in this order:

1. **Hindsight Memory** - Past solutions and patterns
2. **This Navigator** - Locate the right file
3. **Specific Knowledge File** - Read the documentation
4. **Context7 MCP** - Framework-specific docs
5. **Web Search** - External resources (last resort)

---

*Part of ATUM CREA Knowledge System (migrated from ULTRA-CREATE v27.18)*
