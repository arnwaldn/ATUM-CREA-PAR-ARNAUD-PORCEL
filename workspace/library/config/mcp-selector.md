# MCP Selector - ATUM CREA v25.0

> **Purpose**: Sélection automatique et intelligente des MCPs selon l'intent
> **Usage**: Claude consulte ce fichier pour choisir les MCPs optimaux pour chaque tâche
> **Fallbacks**: Voir `mcp-fallback.json` pour les alternatives en cas d'échec

---

## Architecture de Sélection

```
INTENT DÉTECTÉ
      │
      ▼
┌─────────────────────────────────┐
│ 1. CLASSIFIER INTENT            │
│    Catégorie principale         │
└─────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────┐
│ 2. LOOKUP MCP TABLE             │
│    MCPs primaires + fallbacks   │
└─────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────┐
│ 3. CHECK AVAILABILITY           │
│    MCP accessible?              │
└─────────────────────────────────┘
      │
      ├── ✅ Available → Use primary
      │
      └── ❌ Failed → Use fallback
```

---

## Table de Sélection par Intent

### Web Scraping & Data Extraction

| Intent | MCP Principal | Fallback 1 | Fallback 2 | Notes |
|--------|---------------|------------|------------|-------|
| Scraping URL simple | `firecrawl.scrape` | `puppeteer` | `fetch` | Firecrawl le plus fiable |
| Scraping dynamique (JS) | `puppeteer` | `playwright` | `firecrawl.scrape` | JS rendering nécessaire |
| Mapping site entier | `firecrawl.map` | `puppeteer` (crawl) | - | Map rapide, crawl complet |
| Extraction données structurées | `firecrawl.extract` | `firecrawl.agent` | `exa` | Schema JSON supporté |
| Recherche agent autonome | `firecrawl.agent` | `exa.web_search` | `firecrawl.search` | Agent plus intelligent |

### Recherche Web

| Intent | MCP Principal | Fallback 1 | Fallback 2 | Notes |
|--------|---------------|------------|------------|-------|
| Recherche web générale | `exa.web_search` | `firecrawl.search` | `WebSearch` | Exa plus précis |
| Recherche code/API | `exa.get_code_context` | `context7` | `firecrawl.search` | Context7 pour frameworks |
| News/Actualités | `exa.web_search` (news) | `firecrawl.search` | - | Paramètre sources |
| Images | `exa.web_search` (images) | - | - | Exa uniquement |

### Documentation & Frameworks

| Intent | MCP Principal | Fallback 1 | Fallback 2 | Notes |
|--------|---------------|------------|------------|-------|
| Docs framework | `context7` | `exa.get_code_context` | `WebFetch` | Context7 toujours à jour |
| API reference | `context7` | `WebFetch` (url directe) | - | Préférer Context7 |
| Exemples code | `context7` (mode: code) | `exa.get_code_context` | `github.search_code` | Context7 optimisé |
| Guides conceptuels | `context7` (mode: info) | `WebFetch` | - | Mode info pour narratif |

### UI Components

| Intent | MCP Principal | Fallback 1 | Notes |
|--------|---------------|------------|-------|
| Composant shadcn | `shadcn` | `context7` (/shadcn-ui) | shadcn toujours prioritaire |
| Recherche composant | `shadcn.search` | `context7` | Recherche par mot-clé |
| Exemples usage | `shadcn.get_examples` | `context7` | Examples détaillés |

### Base de Données & Backend

| Intent | MCP Principal | Fallback 1 | Notes |
|--------|---------------|------------|-------|
| Supabase (tout) | `supabase.*` | `postgres.query` | Supabase préféré |
| Query SQL | `supabase.execute_sql` | `postgres.query` | Supabase si projet Supabase |
| Migration DB | `supabase.apply_migration` | - | Supabase uniquement |
| Types TS | `supabase.generate_typescript_types` | - | Auto-génération |

### Mémoire & Contexte

| Intent | MCP Principal | Fallback 1 | Notes |
|--------|---------------|------------|-------|
| Recall pattern/erreur | `hindsight.recall` | `memory.search_nodes` | Hindsight sémantique |
| Stockage apprentissage | `hindsight.retain` | `memory.create_entities` | Hindsight pour persist |
| Graphe connaissances | `memory.*` | - | Memory pour relations |
| Stats mémoire | `hindsight.stats` | - | Hindsight uniquement |

### Fichiers & Système

| Intent | MCP Principal | Fallback 1 | Notes |
|--------|---------------|------------|-------|
| Lecture fichier | `Read` | `desktop-commander.read_file` | Read tool natif |
| Écriture fichier | `Write` | `desktop-commander.write_file` | Write tool natif |
| Recherche fichiers | `Glob` | `desktop-commander.search_files` | Glob plus rapide |
| Commandes système | `Bash` | `desktop-commander.execute_command` | Bash natif |
| PDF création | `desktop-commander.write_pdf` | - | DC seul support PDF |
| Excel | `desktop-commander.read_file` | - | DC supporte Excel |

### GitHub

| Intent | MCP Principal | Notes |
|--------|---------------|-------|
| Créer repo | `github.create_repository` | Via MCP |
| Push fichiers | `github.push_files` | Multi-fichiers |
| Issues/PRs | `github.create_issue/pull_request` | Complet |
| Recherche code | `github.search_code` | GitHub search |

### Browser Automation

| Intent | MCP Principal | Fallback 1 | Notes |
|--------|---------------|------------|-------|
| Navigation simple | `playwright.navigate` | `puppeteer.navigate` | Playwright préféré |
| Screenshot | `playwright.screenshot` | `puppeteer.screenshot` | Équivalents |
| Fill form | `playwright.fill` | `puppeteer.fill` | Équivalents |
| JavaScript eval | `playwright.evaluate` | `puppeteer.evaluate` | Équivalents |
| Click par texte | `playwright.click_text` | `puppeteer.click` | Playwright plus flexible |

### Design & Visualisation

| Intent | MCP Principal | Notes |
|--------|---------------|-------|
| Import Figma | `figma.add_figma_file` | Analyse design |
| Commentaires Figma | `figma.read_comments` | Review design |
| Diagrammes | `mermaid.generate` | Tous types diagrammes |
| Notion pages | `notion.*` | CRUD complet |

### Code Execution

| Intent | MCP Principal | Notes |
|--------|---------------|-------|
| Python sandbox | `e2b.run_code` | Sécurisé |
| Raisonnement séquentiel | `sequential-thinking` | Problèmes complexes |

---

## Règles de Sélection Automatique

### Priorités Globales

1. **MCPs spécialisés** > MCPs génériques
2. **Outils natifs Claude** > MCPs quand équivalent
3. **Premier MCP disponible** dans la chaîne de fallback
4. **Combiner MCPs** si besoin (ex: firecrawl + hindsight)

### Patterns de Détection

```javascript
const MCP_PATTERNS = {
  // Web scraping
  scrape: ['scrape', 'extraire', 'récupérer page', 'contenu url'],
  search: ['recherche', 'search', 'chercher', 'find'],

  // Frameworks
  framework: ['next', 'react', 'vue', 'svelte', 'express', 'prisma'],

  // UI
  ui: ['composant', 'component', 'button', 'modal', 'form', 'shadcn'],

  // Database
  database: ['database', 'sql', 'query', 'table', 'migration'],

  // Memory
  memory: ['rappeler', 'recall', 'mémoire', 'pattern', 'erreur passée'],

  // Files
  files: ['fichier', 'file', 'lire', 'écrire', 'read', 'write'],

  // Browser
  browser: ['browser', 'naviguer', 'click', 'form', 'screenshot'],

  // Design
  design: ['figma', 'design', 'diagramme', 'diagram'],
};
```

### Exemple Workflow

```
User: "Recherche les docs React 19 et crée un composant Card avec shadcn"

MCP Selector:
1. Détecte: "docs React" → context7 (framework)
2. Détecte: "composant Card" + "shadcn" → shadcn (UI)

Actions:
1. context7.resolve-library-id({libraryName: 'react'})
2. context7.get-library-docs({topic: 'React 19'})
3. shadcn.get_component_details({componentName: 'card'})
4. shadcn.get_component_examples({componentName: 'card'})
```

---

## Combinaisons Recommandées

| Tâche | MCPs à Combiner |
|-------|-----------------|
| Nouveau projet web | `context7` + `shadcn` + `supabase` |
| Debug erreur | `hindsight` (errors) + `context7` |
| Research topic | `exa` + `firecrawl` + `hindsight` |
| Import design | `figma` + `shadcn` |
| Deploy | `supabase` + `github` |
| Documentation | `context7` + `mermaid` |
| Trading EA | `hindsight` (trading-brain) + `desktop-commander` |

---

## Détection de Contexte MCP

Pour chaque intent, le système détecte automatiquement:

1. **Catégorie principale** (web, code, data, ui, etc.)
2. **MCPs primaires** pour cette catégorie
3. **MCPs complémentaires** si combinaison nécessaire
4. **Fallbacks** en cas d'échec

---

*MCP Selector v25.0 - Sélection intelligente de 54 MCPs pour ATUM CREA*
