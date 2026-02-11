# UI/UX Feedback Team - Orchestrateur

## Role
Orchestrateur d'equipe multi-agents pour analyse et amelioration UI/UX complete.

## Inspiration
Base sur le pattern "Multimodal UI/UX Feedback Agent Team" (awesome-llm-apps) avec adaptation pour ULTRA-CREATE.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    UI/UX FEEDBACK TEAM                      │
│                      (Coordinator)                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐   ┌──────────────┐   ┌─────────────────┐  │
│  │  UI Critic  │ → │   Design     │ → │ Code Generator  │  │
│  │  (Analyse)  │   │  Strategist  │   │ (Implementation)│  │
│  └─────────────┘   └──────────────┘   └─────────────────┘  │
│        ↓                  ↓                   ↓             │
│    Rapport +          Plan avec           Code React/       │
│    Scores            Specs Tech          Next.js + shadcn   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Modes d'Operation

### Mode ANALYZE
Analyse seule sans generation de code:
```
/uiux analyze "https://example.com"
```
Output: Rapport UI Critic uniquement

### Mode PLAN
Analyse + Plan d'amelioration:
```
/uiux plan "https://example.com"
```
Output: Rapport + Specifications techniques

### Mode FULL (Recommande)
Pipeline complet analyse → plan → code:
```
/uiux full "https://example.com"
```
Output: Rapport + Specs + Code executable

### Mode COMPARE
Compare deux designs:
```
/uiux compare "url1" "url2"
```
Output: Analyse comparative

## Pipeline Sequentiel

### Etape 1: Capture & Vision
```javascript
// Capturer la page
await mcp__playwright__browser_navigate({ url: targetUrl })
await mcp__playwright__browser_screenshot({ name: "uiux-analysis", fullPage: true })

// Extraire structure DOM
const domStructure = await mcp__playwright__browser_evaluate({
  script: `JSON.stringify({
    title: document.title,
    headings: [...document.querySelectorAll('h1,h2,h3')].map(h => ({
      tag: h.tagName,
      text: h.textContent.trim()
    })),
    buttons: [...document.querySelectorAll('button, a.btn, [role="button"]')].map(b => ({
      text: b.textContent.trim(),
      classes: b.className
    })),
    images: document.querySelectorAll('img').length,
    forms: document.querySelectorAll('form').length,
    links: document.querySelectorAll('a').length
  })`
})
```

### Etape 2: UI Critic Analysis
```
Agent: agents/visual/ui-critic.md
Input: Screenshot + DOM structure
Output: {
  scores: { layout: X, typography: X, ... },
  issues: [...],
  priorities: [...],
  report: "markdown"
}
```

### Etape 3: Design Strategist Planning
```
Agent: agents/visual/design-strategist.md
Input: UI Critic report
Output: {
  colorPalette: { primary: "#...", ... },
  typography: { h1: "48px Inter bold", ... },
  spacing: { section: "96px", ... },
  components: ["button", "card", ...],
  plan: "markdown"
}
```

### Etape 4: Code Generation
```
Agent: agents/core/frontend-developer.md
Input: Design Strategist specs
MCPs: Context7 (Next.js), shadcn
Output: {
  files: [
    { path: "app/page.tsx", content: "..." },
    { path: "components/hero.tsx", content: "..." },
    ...
  ]
}
```

## MCPs Utilises

| MCP | Usage | Etape |
|-----|-------|-------|
| **Playwright** | Screenshot, DOM | 1 |
| **Puppeteer** | Chrome connect | 1 |
| **Figma** | Reference design | 1,2 |
| **Exa** | Tendances UI/UX | 2 |
| **Context7** | Docs frameworks | 3,4 |
| **shadcn** | Composants UI | 4 |
| **E2B** | Test code genere | 4 |

## State Management

```javascript
// Etat partage entre agents
state = {
  // Input
  targetUrl: "...",
  screenshot: "uiux-analysis.png",
  domStructure: {...},

  // UI Critic output
  analysis: {
    scores: {...},
    issues: [...],
    priorities: [...]
  },

  // Design Strategist output
  plan: {
    colors: {...},
    typography: {...},
    components: [...]
  },

  // Code Generator output
  generatedCode: {
    files: [...],
    preview: "..."
  },

  // Versioning
  version: 1,
  history: [...]
}
```

## Routing Logic

```
USER INPUT
    │
    ├── "analyze [url]" → UI Critic only
    │
    ├── "plan [url]" → UI Critic → Design Strategist
    │
    ├── "full [url]" → UI Critic → Design Strategist → Code Gen
    │
    ├── "compare [url1] [url2]" → 2x UI Critic → Comparison
    │
    ├── "edit [feedback]" → Design Strategist (iterative)
    │
    └── "help" / "?" → Info response
```

## Output Final

### Mode FULL Output
```markdown
# UI/UX FEEDBACK REPORT

## 1. ANALYSE (UI Critic)
[Rapport complet avec scores]

## 2. PLAN D'AMELIORATION (Design Strategist)
[Specifications techniques detaillees]

## 3. CODE GENERE
[Fichiers React/Next.js avec shadcn]

### Fichiers Crees:
- `app/page.tsx` - Page principale
- `components/hero.tsx` - Section hero
- `components/features.tsx` - Section features
- `components/cta.tsx` - Call-to-action
- `styles/globals.css` - Styles globaux

### Preview
[Instructions pour lancer: npm run dev]

---

**Score Initial**: X/100
**Score Estime Apres**: Y/100
**Amelioration**: +Z points
```

## Integration Hindsight

```javascript
// Sauvegarder l'analyse pour reference future
mcp__hindsight__hindsight_retain({
  bank: 'patterns',
  content: `UI/UX Analysis: ${url}\nScore: ${score}/100\nKey Issues: ${issues.join(', ')}`,
  context: 'UI/UX Feedback Team analysis'
})
```

## Usage

```
/uiux analyze "https://example.com"
/uiux plan "https://example.com"
/uiux full "https://example.com"
/uiux compare "url1" "url2"
/uiux edit "rendre le CTA plus visible"
```

## Metriques

| Metrique | Valeur |
|----------|--------|
| Agents dans equipe | 3 |
| Dimensions analysees | 10 |
| Score max | 100 |
| Temps pipeline complet | ~2-3 min |
| Output | Rapport + Specs + Code |

## Version
- Team: 1.0.0
- Pattern: Sequential Pipeline + Coordinator
- Agents: UI Critic, Design Strategist, Code Generator
