# Visual Development Guide - ULTRA-CREATE v13.0

## Overview

Ce guide couvre les trois methodes de developpement visuel supportees par ULTRA-CREATE v13.0:
1. **Figma-to-Code**: Conversion de designs Figma en composants React
2. **Screenshot-to-Code**: Generation de UI depuis captures d'ecran
3. **Visual Diff**: Comparaison et validation visuelle

---

## 1. FIGMA-TO-CODE

### Prerequisites

```bash
# Installation Figma MCP
npx -y @anthropic/mcp-server-figma

# Variables d'environnement requises
FIGMA_ACCESS_TOKEN=figd_xxxxx  # Token depuis Figma Settings > Personal Access Tokens
```

### Workflow Complet

```
User: "Convertis ce Figma en code"
         |
         v
+------------------+
| 1. FETCH DESIGN  |
|   - Figma API    |
|   - Node tree    |
+------------------+
         |
         v
+------------------+
| 2. ANALYZE       |
|   - Components   |
|   - Layout       |
|   - Styles       |
+------------------+
         |
         v
+------------------+
| 3. MAP           |
|   - shadcn/ui    |
|   - TailwindCSS  |
|   - Custom       |
+------------------+
         |
         v
+------------------+
| 4. GENERATE      |
|   - React TSX    |
|   - Styles       |
|   - Types        |
+------------------+
         |
         v
+------------------+
| 5. PREVIEW       |
|   - Playwright   |
|   - Visual Diff  |
+------------------+
```

### Utilisation

```typescript
// Commande slash
/figma https://www.figma.com/file/xxxxx/MyDesign

// Ou en langage naturel
"Convertis ce design Figma en composants React: [URL]"
"Cree cette page depuis le Figma: [URL]"
```

### Mapping Figma -> shadcn/ui

| Composant Figma | Composant shadcn/ui |
|-----------------|---------------------|
| Button (filled) | `<Button>` |
| Button (outline) | `<Button variant="outline">` |
| Input field | `<Input>` |
| Text area | `<Textarea>` |
| Checkbox | `<Checkbox>` |
| Radio group | `<RadioGroup>` |
| Toggle | `<Switch>` |
| Select | `<Select>` |
| Card | `<Card>` |
| Modal/Dialog | `<Dialog>` |
| Dropdown | `<DropdownMenu>` |
| Tabs | `<Tabs>` |
| Accordion | `<Accordion>` |
| Avatar | `<Avatar>` |
| Badge | `<Badge>` |
| Alert | `<Alert>` |
| Toast | `<Toast>` (sonner) |
| Table | `<Table>` |
| Progress | `<Progress>` |
| Slider | `<Slider>` |
| Separator | `<Separator>` |

### Extraction Styles

```typescript
// Couleurs Figma -> CSS Variables
interface ColorExtraction {
  // Figma fill/stroke
  fills: FigmaColor[]

  // Converti en
  cssVariables: {
    '--background': 'hsl(0 0% 100%)',
    '--foreground': 'hsl(222.2 84% 4.9%)',
    '--primary': 'hsl(222.2 47.4% 11.2%)',
    // ...
  }
}

// Typographie Figma -> Tailwind
interface TypographyExtraction {
  figmaStyle: {
    fontFamily: 'Inter'
    fontSize: 16
    fontWeight: 500
    lineHeight: 24
  }

  tailwindClass: 'font-medium text-base leading-6'
}

// Spacing Figma -> Tailwind
interface SpacingExtraction {
  figmaPadding: { top: 16, right: 24, bottom: 16, left: 24 }
  tailwindClass: 'py-4 px-6'
}
```

### Exemple Output

```tsx
// Input: Figma Hero Section
// Output: React Component

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted py-24 lg:py-32">
      <div className="container mx-auto px-4 text-center">
        <Badge variant="secondary" className="mb-4">
          New Release
        </Badge>

        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Build faster with
          <span className="text-primary"> AI-powered</span> development
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Create production-ready applications in minutes, not months.
          Powered by 10+ AI agents working in parallel.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button size="lg">
            Get Started Free
          </Button>
          <Button size="lg" variant="outline">
            View Demo
          </Button>
        </div>
      </div>
    </section>
  )
}
```

---

## 2. SCREENSHOT-TO-CODE

### Prerequisites

```bash
# Installation Screenshot MCP
npx -y @sethbang/mcp-screenshot-server

# Playwright pour preview
npx -y @anthropic/mcp-server-playwright
```

### Workflow

```
User: "Reproduis cette UI" + [screenshot.png]
         |
         v
+-------------------+
| 1. VISION ANALYZE |
|   - Claude Vision |
|   - Multi-pass    |
+-------------------+
         |
         v
+-------------------+
| 2. DECOMPOSE      |
|   - Layout grid   |
|   - Components    |
|   - Hierarchy     |
+-------------------+
         |
         v
+-------------------+
| 3. PATTERN MATCH  |
|   - UI patterns   |
|   - shadcn/ui     |
|   - Common layouts|
+-------------------+
         |
         v
+-------------------+
| 4. GENERATE       |
|   - React TSX     |
|   - TailwindCSS   |
|   - Responsive    |
+-------------------+
         |
         v
+-------------------+
| 5. VISUAL DIFF    |
|   - Capture new   |
|   - Compare       |
|   - Iterate       |
+-------------------+
```

### Utilisation

```typescript
// Commande slash
/screenshot C:\path\to\screenshot.png

// Ou en langage naturel
"Reproduis cette interface: [chemin image]"
"Cree une page similaire a ce screenshot"
"Clone ce design d'apres cette capture"
```

### Multi-Pass Analysis

```typescript
// Pass 1: Layout Structure
const layoutAnalysis = {
  type: 'page',
  layout: 'flex-col',
  sections: [
    { type: 'header', height: '64px', sticky: true },
    { type: 'hero', height: 'auto', background: 'gradient' },
    { type: 'features', layout: 'grid-3', gap: '32px' },
    { type: 'footer', height: '200px' }
  ]
}

// Pass 2: Component Detection
const components = [
  { type: 'navbar', position: 'fixed top', elements: ['logo', 'nav-links', 'cta-button'] },
  { type: 'hero', elements: ['badge', 'heading', 'subtext', 'button-group'] },
  { type: 'feature-card', count: 3, elements: ['icon', 'title', 'description'] }
]

// Pass 3: Style Extraction
const styles = {
  colorPalette: ['#000000', '#ffffff', '#3b82f6', '#f3f4f6'],
  typography: {
    headings: 'font-bold tracking-tight',
    body: 'text-muted-foreground'
  },
  spacing: {
    section: 'py-24',
    container: 'max-w-6xl mx-auto px-4'
  }
}
```

### Precision Levels

| Level | Description | Use Case |
|-------|-------------|----------|
| **Quick** | 80% accuracy, fast | Prototypes, MVP |
| **Standard** | 90% accuracy | Production UI |
| **Pixel-Perfect** | 95%+ accuracy | Design systems |

```typescript
// Configuration precision
/screenshot path/to/image.png --precision pixel-perfect
```

---

## 3. VISUAL DIFF ENGINE

### Purpose

Compare visuellement deux versions d'une UI pour:
- Detecter les regressions visuelles
- Valider les changements CSS
- Verifier la fidelite au design original

### Workflow

```
+----------------+     +----------------+
|  Reference     |     |  Current       |
|  (before.png)  |     |  (after.png)   |
+-------+--------+     +--------+-------+
        |                       |
        +----------+------------+
                   |
                   v
         +-----------------+
         | VISUAL DIFF     |
         | - Pixel diff    |
         | - SSIM score    |
         | - Perceptual    |
         +-----------------+
                   |
                   v
         +-----------------+
         | DIFF REPORT     |
         | - Heatmap       |
         | - Changed areas |
         | - Suggestions   |
         +-----------------+
```

### Utilisation

```typescript
// Commande slash
/visual-diff before.png after.png

// Ou en langage naturel
"Compare ces deux versions visuellement"
"Montre les differences entre ces screenshots"
"Verifie si mon UI correspond au design"
```

### Metriques de Comparaison

```typescript
interface VisualDiffResult {
  // Score global de similarite (0-100)
  similarity: number

  // Structural Similarity Index
  ssim: number

  // Nombre de pixels differents
  changedPixels: number
  changedPercentage: number

  // Zones de changement
  changedRegions: {
    x: number
    y: number
    width: number
    height: number
    type: 'added' | 'removed' | 'modified'
  }[]

  // Suggestions de fix
  suggestions: string[]
}
```

### Thresholds

| Threshold | Value | Action |
|-----------|-------|--------|
| **Pass** | > 98% | Aucun changement significatif |
| **Warning** | 95-98% | Revue recommandee |
| **Fail** | < 95% | Changements majeurs detectes |

### Output Example

```
VISUAL DIFF REPORT
==================

Reference: before.png
Current: after.png

SIMILARITY SCORE: 94.2% [WARNING]

CHANGED REGIONS:
1. Header (0,0,1200,64) - Modified
   - Logo size changed: 32px -> 28px
   - Navigation spacing increased

2. Hero (0,64,1200,400) - Modified
   - Button color changed: blue-500 -> blue-600
   - Text size decreased on mobile

3. Footer (0,1800,1200,200) - Added
   - New social media icons

SUGGESTIONS:
- Verify logo size change is intentional
- Check button hover states
- Test responsive breakpoints

HEATMAP: [generated at diff-heatmap.png]
```

---

## 4. INTEGRATION COMPLETE

### Workflow Figma + Preview + Diff

```typescript
// 1. Convertir Figma en code
/figma https://figma.com/file/xxxxx

// 2. Preview automatique via Playwright
// (Capture screenshot du resultat)

// 3. Comparer avec design original
/visual-diff figma-export.png generated-ui.png

// 4. Si diff > 5%, auto-ajuster
// (Self-healer active)

// 5. Iteration jusqu'a match
// (Similarity > 98%)
```

### Commande Tout-en-Un

```typescript
/visual-create https://figma.com/file/xxxxx --auto-iterate --target-similarity 98
```

Cette commande:
1. Fetch le design Figma
2. Genere le code React
3. Lance preview Playwright
4. Compare visuellement
5. Iterate jusqu'a 98% similarity
6. Livre le code final

---

## 5. BEST PRACTICES

### Design Figma

1. **Nommer les layers** - Facilite la detection de composants
2. **Utiliser Auto Layout** - Meilleure conversion en Flexbox/Grid
3. **Definir les variantes** - Mapping automatique vers props
4. **Styles consistants** - Extraction CSS Variables fiable

### Screenshots

1. **Resolution fixe** - 1920x1080 ou 1440x900 recommande
2. **Etat complet** - Pas de contenu tronque
3. **Mode light** - Meilleure detection de contrastes
4. **Sans overlays** - Eviter tooltips/modals ouverts

### Visual Diff

1. **Meme viewport** - Reference et current identiques
2. **Meme etat** - Hover, focus, etc.
3. **Ignorer dynamic** - Masquer dates, avatars aleatoires
4. **Baseline stable** - Reference committee en git

---

## 6. TROUBLESHOOTING

### Figma MCP ne repond pas

```bash
# Verifier le token
echo $FIGMA_ACCESS_TOKEN

# Tester l'API
curl -H "X-Figma-Token: $FIGMA_ACCESS_TOKEN" \
  "https://api.figma.com/v1/me"
```

### Screenshot analysis imprecise

1. Augmenter la resolution de l'image
2. Utiliser `--precision pixel-perfect`
3. Fournir contexte: "C'est un dashboard SaaS avec..."

### Visual diff trop sensible

```typescript
// Ignorer certaines zones
/visual-diff before.png after.png --ignore-regions "0,0,100,50"

// Ajuster le threshold
/visual-diff before.png after.png --threshold 0.95
```

---

## 7. AGENTS IMPLIQUES

| Agent | Role dans Visual Development |
|-------|------------------------------|
| `figma-interpreter` | Conversion Figma -> Code |
| `screenshot-analyzer` | Analyse Vision screenshots |
| `visual-diff-engine` | Comparaison avant/apres |
| `frontend-developer` | Generation React/Next.js |
| `ui-designer` | Mapping shadcn/ui |
| `self-healer` | Auto-correction des ecarts |

---

## 8. METRIQUES DE SUCCES

| Metrique | Objectif |
|----------|----------|
| Figma-to-Code accuracy | > 90% |
| Screenshot-to-Code accuracy | > 85% |
| Visual Diff precision | > 98% |
| Iteration cycles | < 3 |
| Time to match | < 5 min |

---

**"Du design au code en un clic, avec verification visuelle automatique."**
