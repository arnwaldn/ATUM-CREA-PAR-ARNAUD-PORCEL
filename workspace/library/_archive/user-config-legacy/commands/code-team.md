---
description: Multimodal vision-to-code team (user)
---

# /code-team - Vision-to-Code Pipeline

## USAGE
```
/code-team "screenshot.png"
/code-team "figma-export.png" --framework=react
/code-team "ui-mockup.jpg" --style=shadcn
/code-team "design-system.pdf" --generate=components
```

## DESCRIPTION
Pipeline multimodal qui convertit des designs visuels
(screenshots, mockups, exports Figma) en code fonctionnel.

## WORKFLOW

### 1. Analyse visuelle
```javascript
// Lire l'image
Read(imagePath)  // Claude analyse nativement les images

// Extraire structure
analyze:
  layout: grid/flex/stack
  components: [buttons, inputs, cards, ...]
  colors: [primary, secondary, ...]
  typography: [headings, body, ...]
  spacing: consistent/variable
```

### 2. Mapping composants
```yaml
detected_components:
  - type: button
    variants: [primary, secondary, outline]
    count: 5
  - type: card
    content: [image, title, description]
    count: 3
  - type: input
    types: [text, email, password]
    count: 4
```

### 3. Generation code
Framework detection ou --framework specifie:
- React/Next.js → JSX + Tailwind
- Vue → SFC + Tailwind
- Svelte → Svelte + Tailwind
- HTML → HTML + CSS

### 4. shadcn Integration
Si --style=shadcn:
```javascript
// Utiliser composants shadcn existants
mcp__shadcn__get_component_details({ componentName: detected })
```

### 5. Output
```tsx
// Composant genere avec:
// - TypeScript strict
// - Tailwind classes
// - Responsive design
// - Accessibilite (aria, semantic HTML)
// - shadcn/ui components
```

## OPTIONS
| Option | Description |
|--------|-------------|
| --framework=X | react, vue, svelte, html |
| --style=shadcn | Utiliser shadcn/ui |
| --responsive | Mobile-first design |
| --a11y | Focus accessibilite |
| --dark | Inclure dark mode |

## EXEMPLE OUTPUT

Input: Screenshot d'une landing page

```tsx
// components/hero.tsx
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="flex flex-col items-center gap-8 py-20">
      <h1 className="text-5xl font-bold tracking-tight">
        Build faster with AI
      </h1>
      <p className="text-xl text-muted-foreground max-w-2xl text-center">
        Transform your ideas into production-ready code
      </p>
      <div className="flex gap-4">
        <Button size="lg">Get Started</Button>
        <Button size="lg" variant="outline">Learn More</Button>
      </div>
    </section>
  )
}
```

## MCP UTILISES
- Read (analyse image)
- shadcn (composants UI)
- Context7 (docs framework)
