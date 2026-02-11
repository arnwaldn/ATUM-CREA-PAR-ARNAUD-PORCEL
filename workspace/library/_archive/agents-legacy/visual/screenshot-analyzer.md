# Agent: Screenshot Analyzer v1.0

## Role
Agent spécialisé dans l'analyse de captures d'écran et la génération de code React/Next.js correspondant. Transforme n'importe quelle image d'UI en composants fonctionnels.

---

## ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SCREENSHOT → CODE PIPELINE                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  SCREENSHOT INPUT                                                            │
│       │                                                                      │
│       ▼                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    IMAGE PREPROCESSING                               │   │
│  │                                                                      │   │
│  │  • Resolution normalization                                         │   │
│  │  • Contrast enhancement                                             │   │
│  │  • Edge detection                                                   │   │
│  │  • Region segmentation                                              │   │
│  └────────────────────────────────────┬────────────────────────────────┘   │
│                                       │                                     │
│                                       ▼                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    VISION ANALYSIS (Claude Vision)                   │   │
│  │                                                                      │   │
│  │  • Component identification                                         │   │
│  │  • Layout structure extraction                                      │   │
│  │  • Text content OCR                                                 │   │
│  │  • Color palette detection                                          │   │
│  │  • UI pattern recognition                                           │   │
│  └────────────────────────────────────┬────────────────────────────────┘   │
│                                       │                                     │
│                                       ▼                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    STRUCTURE MAPPER                                  │   │
│  │                                                                      │   │
│  │  • Build component tree                                             │   │
│  │  • Identify semantic regions                                        │   │
│  │  • Map to HTML structure                                            │   │
│  │  • Detect interactive elements                                      │   │
│  └────────────────────────────────────┬────────────────────────────────┘   │
│                                       │                                     │
│                                       ▼                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    CODE GENERATOR                                    │   │
│  │                                                                      │   │
│  │  • Generate React components                                        │   │
│  │  • Apply Tailwind CSS                                               │   │
│  │  • Map to shadcn/ui                                                 │   │
│  │  • Add interactivity                                                │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## VISION ANALYSIS

### Component Detection Prompt

```typescript
const visionPrompt = `
Analyze this UI screenshot and identify all visible components.

For each component, provide:
1. Type (button, input, card, modal, navbar, etc.)
2. Approximate position (top, left, width, height as percentages)
3. Visual properties (colors, borders, shadows)
4. Text content if readable
5. State (default, hover, active, disabled)
6. Potential interactivity (clickable, input, selectable)

Format as JSON:
{
  "components": [
    {
      "id": "comp-1",
      "type": "button",
      "position": { "top": 10, "left": 20, "width": 15, "height": 5 },
      "styles": {
        "backgroundColor": "#3B82F6",
        "textColor": "#FFFFFF",
        "borderRadius": "8px",
        "shadow": "sm"
      },
      "text": "Get Started",
      "interactive": true,
      "parent": null
    }
  ],
  "layout": {
    "type": "single-column",
    "sections": ["navbar", "hero", "features", "cta", "footer"]
  },
  "colorPalette": ["#3B82F6", "#1F2937", "#FFFFFF", "#F3F4F6"],
  "typography": {
    "headingFont": "sans-serif",
    "bodyFont": "sans-serif"
  }
}
`
```

### Layout Analysis

```typescript
interface LayoutAnalysis {
  type: 'single-column' | 'two-column' | 'grid' | 'dashboard' | 'app'
  sections: Section[]
  breakpoints: {
    mobile: LayoutConfig
    tablet: LayoutConfig
    desktop: LayoutConfig
  }
}

interface Section {
  id: string
  type: SectionType
  position: Position
  components: ComponentRef[]
  layout: 'flex-row' | 'flex-col' | 'grid'
}

type SectionType =
  | 'navbar'
  | 'hero'
  | 'features'
  | 'testimonials'
  | 'pricing'
  | 'cta'
  | 'footer'
  | 'sidebar'
  | 'content'
  | 'form'
  | 'table'
  | 'cards'
```

---

## COMPONENT MAPPING

### Pattern Recognition

```typescript
const uiPatterns = {
  // Navigation patterns
  navbar: {
    indicators: ['horizontal layout', 'logo left', 'links right', 'top position'],
    shadcnComponent: 'NavigationMenu',
    confidence: 0.9
  },

  // Hero patterns
  hero: {
    indicators: ['large heading', 'subtext', 'CTA button', 'full width', 'top section'],
    shadcnComponent: 'custom',
    confidence: 0.85
  },

  // Card patterns
  card: {
    indicators: ['bordered container', 'heading', 'content', 'optional image'],
    shadcnComponent: 'Card',
    confidence: 0.95
  },

  // Form patterns
  form: {
    indicators: ['input fields', 'labels', 'submit button', 'vertical layout'],
    shadcnComponent: 'Form',
    confidence: 0.9
  },

  // Table patterns
  table: {
    indicators: ['grid layout', 'headers row', 'data rows', 'borders'],
    shadcnComponent: 'Table',
    confidence: 0.95
  },

  // Modal patterns
  modal: {
    indicators: ['overlay background', 'centered content', 'close button', 'title'],
    shadcnComponent: 'Dialog',
    confidence: 0.9
  }
}
```

### Color Extraction

```typescript
interface ColorPalette {
  primary: string
  secondary: string
  accent: string
  background: string
  foreground: string
  muted: string
  border: string
}

function extractColorPalette(screenshot: Image): ColorPalette {
  // Use vision to identify dominant colors
  const colors = analyzeColors(screenshot)

  // Map to semantic roles
  return {
    primary: findPrimaryColor(colors),      // Most used accent color
    secondary: findSecondaryColor(colors),  // Second most used accent
    accent: findAccentColor(colors),        // Highlight color
    background: findBackgroundColor(colors), // Page background
    foreground: findForegroundColor(colors), // Text color
    muted: findMutedColor(colors),          // Subtle backgrounds
    border: findBorderColor(colors)         // Border color
  }
}

// Map extracted colors to Tailwind
function colorsToTailwind(palette: ColorPalette): TailwindConfig {
  return {
    extend: {
      colors: {
        primary: {
          DEFAULT: palette.primary,
          foreground: getContrastColor(palette.primary)
        },
        secondary: {
          DEFAULT: palette.secondary,
          foreground: getContrastColor(palette.secondary)
        },
        // ... etc
      }
    }
  }
}
```

---

## CODE GENERATION

### Component Generator

```typescript
async function generateFromScreenshot(screenshot: Image): Promise<GeneratedCode> {
  // Step 1: Vision analysis
  const analysis = await analyzeWithVision(screenshot, visionPrompt)

  // Step 2: Build component tree
  const componentTree = buildComponentTree(analysis.components)

  // Step 3: Generate code for each component
  const components: GeneratedComponent[] = []

  for (const node of componentTree) {
    const code = generateComponentCode(node, analysis.colorPalette)
    components.push(code)
  }

  // Step 4: Generate page layout
  const pageCode = generatePageLayout(componentTree, analysis.layout)

  // Step 5: Generate Tailwind config
  const tailwindConfig = generateTailwindConfig(analysis.colorPalette, analysis.typography)

  return {
    components,
    page: pageCode,
    tailwind: tailwindConfig,
    assets: analysis.detectedImages
  }
}
```

### JSX Generation

```typescript
function generateJSX(component: AnalyzedComponent): string {
  const { type, styles, text, children } = component

  // Map to appropriate shadcn/ui component
  const mapping = uiPatterns[type]

  if (mapping && mapping.shadcnComponent !== 'custom') {
    return generateShadcnComponent(mapping.shadcnComponent, component)
  }

  // Generate custom component
  const tailwindClasses = stylesToTailwind(styles)

  let jsx = `<div className="${tailwindClasses}">`

  if (text) {
    jsx += `\n  ${text}`
  }

  if (children) {
    for (const child of children) {
      jsx += `\n  ${generateJSX(child)}`
    }
  }

  jsx += '\n</div>'

  return jsx
}
```

### Full Component Template

```typescript
function generateFullComponent(analysis: ComponentAnalysis): string {
  return `
"use client"

import { cn } from "@/lib/utils"
${generateImports(analysis)}

interface ${analysis.name}Props {
  className?: string
  ${generatePropsInterface(analysis)}
}

export function ${analysis.name}({ className, ...props }: ${analysis.name}Props) {
  return (
    <div className={cn(
      "${generateBaseClasses(analysis)}",
      className
    )}>
      ${generateJSXBody(analysis)}
    </div>
  )
}
`
}
```

---

## MCP INTEGRATION

### Screenshot MCP

```typescript
// Screenshot MCP for capturing live pages
const screenshotMcp = {
  command: "npx",
  args: ["-y", "@sethbang/mcp-screenshot-server"]
}

interface ScreenshotMcpOperations {
  // Capture current screen
  captureScreen(): Promise<Screenshot>

  // Capture specific window
  captureWindow(windowId: string): Promise<Screenshot>

  // Capture region
  captureRegion(x: number, y: number, width: number, height: number): Promise<Screenshot>

  // Capture URL
  captureUrl(url: string, options?: CaptureOptions): Promise<Screenshot>
}

interface CaptureOptions {
  width: number
  height: number
  fullPage: boolean
  delay: number      // Wait before capture
  deviceScale: number
}
```

### Playwright Integration

```typescript
// Use Playwright for URL captures and visual comparison
async function captureUrlScreenshot(url: string): Promise<Screenshot> {
  const browser = await playwright.chromium.launch()
  const page = await browser.newPage()

  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto(url, { waitUntil: 'networkidle' })

  // Capture full page
  const screenshot = await page.screenshot({
    fullPage: true,
    type: 'png'
  })

  await browser.close()

  return {
    data: screenshot,
    width: 1440,
    height: await page.evaluate(() => document.body.scrollHeight)
  }
}
```

---

## COMMANDS

### Analyze Screenshot

```bash
# From clipboard
/screenshot analyze

# From file
/screenshot analyze /path/to/image.png

# From URL
/screenshot capture https://example.com
```

### Generate Code

```bash
# Generate full page
/screenshot generate

# Generate specific component
/screenshot generate --component "navbar"

# Generate with specific framework
/screenshot generate --framework next --ui shadcn
```

---

## ACCURACY IMPROVEMENTS

### Multi-Pass Analysis

```typescript
async function multiPassAnalysis(screenshot: Image): Promise<Analysis> {
  // Pass 1: Overall structure
  const structurePass = await analyzeWithVision(screenshot, structurePrompt)

  // Pass 2: Component details
  const componentPass = await analyzeWithVision(screenshot, componentPrompt)

  // Pass 3: Style extraction
  const stylePass = await analyzeWithVision(screenshot, stylePrompt)

  // Pass 4: Text content
  const textPass = await analyzeWithVision(screenshot, textPrompt)

  // Merge results
  return mergeAnalyses([structurePass, componentPass, stylePass, textPass])
}
```

### Confidence Scoring

```typescript
interface ConfidenceScore {
  overall: number
  components: Map<string, number>
  layout: number
  styles: number
}

function calculateConfidence(analysis: Analysis): ConfidenceScore {
  return {
    overall: calculateOverallConfidence(analysis),
    components: new Map(
      analysis.components.map(c => [c.id, c.confidence])
    ),
    layout: analysis.layout.confidence,
    styles: analysis.styles.confidence
  }
}

// Flag low-confidence areas for human review
function flagLowConfidence(score: ConfidenceScore): ReviewItem[] {
  const items: ReviewItem[] = []

  for (const [id, confidence] of score.components) {
    if (confidence < 0.7) {
      items.push({
        type: 'component',
        id,
        confidence,
        message: `Component ${id} has low confidence (${confidence}). Please verify.`
      })
    }
  }

  return items
}
```

---

## WORKFLOW

### Complete Workflow

```markdown
## Screenshot to Code Workflow

### 1. Capture
- User provides screenshot (file, clipboard, or URL)
- Preprocess image (normalize, enhance)

### 2. Analyze
- Vision analysis (structure, components, colors)
- Pattern recognition (map to known UI patterns)
- Text extraction (OCR for content)

### 3. Map
- Build component hierarchy
- Map to shadcn/ui components
- Extract Tailwind classes

### 4. Generate
- Create React components
- Apply styling
- Add interactivity stubs

### 5. Validate
- Visual comparison with original
- Accessibility check
- Code quality check

### 6. Deliver
- Present generated code
- Highlight areas needing attention
- Provide next steps
```

---

## BEST PRACTICES

### DO
- Use multi-pass analysis for accuracy
- Map to existing component libraries
- Preserve semantic structure
- Include responsive considerations
- Flag low-confidence areas

### DON'T
- Trust single-pass analysis blindly
- Hard-code pixel values
- Ignore accessibility
- Skip visual validation
- Over-complicate simple components

---

## LIMITATIONS

| Limitation | Mitigation |
|------------|------------|
| Complex animations | Generate static, add notes |
| Custom illustrations | Export as assets |
| Very small text | Prompt user for clarification |
| Overlapping elements | Manual adjustment needed |
| Dynamic content | Generate placeholder structure |

---

**Version:** 1.0
**Type:** Visual Agent
**MCP Required:** Screenshot MCP, Playwright
**Dependencies:** Claude Vision
**Trigger:** `/screenshot` command, image file detected
