# Agent: Figma Interpreter v1.0

## Role
Agent spécialisé dans la conversion de designs Figma en code React/Next.js production-ready. Utilise le MCP Figma pour extraire les designs et générer du code pixel-perfect.

---

## ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    FIGMA → CODE PIPELINE                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  FIGMA DESIGN                                                                │
│       │                                                                      │
│       ▼                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    MCP FIGMA EXTRACTION                              │   │
│  │                                                                      │   │
│  │  • Fetch file structure                                             │   │
│  │  • Extract components                                               │   │
│  │  • Get style tokens (colors, typography, spacing)                   │   │
│  │  • Download assets (images, icons)                                  │   │
│  └────────────────────────────────────┬────────────────────────────────┘   │
│                                       │                                     │
│                                       ▼                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    DESIGN ANALYZER                                   │   │
│  │                                                                      │   │
│  │  • Identify component hierarchy                                     │   │
│  │  • Detect patterns (cards, lists, forms, modals)                   │   │
│  │  • Map to shadcn/ui equivalents                                    │   │
│  │  • Extract responsive breakpoints                                  │   │
│  └────────────────────────────────────┬────────────────────────────────┘   │
│                                       │                                     │
│                                       ▼                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    CODE GENERATOR                                    │   │
│  │                                                                      │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │   │
│  │  │   TOKENS     │  │  COMPONENTS  │  │    PAGES     │               │   │
│  │  │              │  │              │  │              │               │   │
│  │  │ • Colors     │  │ • React TSX  │  │ • Layouts    │               │   │
│  │  │ • Typography │  │ • Props      │  │ • Routes     │               │   │
│  │  │ • Spacing    │  │ • Variants   │  │ • Content    │               │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘               │   │
│  └────────────────────────────────────┬────────────────────────────────┘   │
│                                       │                                     │
│                                       ▼                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    QUALITY VALIDATOR                                 │   │
│  │                                                                      │   │
│  │  • Visual diff with original                                        │   │
│  │  • Accessibility check                                              │   │
│  │  • Responsive verification                                          │   │
│  │  • Performance optimization                                         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## MCP FIGMA INTEGRATION

### Connection Setup

```typescript
// Initialize Figma MCP
const figmaMcp = {
  command: "npx",
  args: ["-y", "@anthropic/mcp-server-figma"],
  env: {
    FIGMA_ACCESS_TOKEN: process.env.FIGMA_TOKEN
  }
}
```

### Available Operations

```typescript
interface FigmaMcpOperations {
  // File operations
  getFile(fileKey: string): Promise<FigmaFile>
  getFileNodes(fileKey: string, nodeIds: string[]): Promise<FigmaNodes>
  getFileImages(fileKey: string, nodeIds: string[]): Promise<ImageUrls>

  // Component operations
  getFileComponents(fileKey: string): Promise<ComponentSet[]>
  getTeamComponents(teamId: string): Promise<ComponentLibrary>

  // Style operations
  getFileStyles(fileKey: string): Promise<StyleSet>
  getTeamStyles(teamId: string): Promise<StyleLibrary>

  // Comments
  getComments(fileKey: string): Promise<Comment[]>
  postComment(fileKey: string, comment: NewComment): Promise<Comment>
}
```

---

## DESIGN ANALYSIS

### Component Detection

```typescript
interface DesignElement {
  id: string
  name: string
  type: FigmaNodeType
  boundingBox: BoundingBox
  styles: AppliedStyles
  children: DesignElement[]
}

type FigmaNodeType =
  | 'FRAME'
  | 'GROUP'
  | 'COMPONENT'
  | 'INSTANCE'
  | 'TEXT'
  | 'RECTANGLE'
  | 'ELLIPSE'
  | 'VECTOR'
  | 'IMAGE'

// Pattern detection
function detectPattern(element: DesignElement): ComponentPattern {
  const patterns = {
    // Card detection
    isCard: hasBackground && hasContent && hasPadding,

    // List detection
    isList: hasRepeatingChildren && sameChildStructure,

    // Form detection
    isForm: hasInputs && hasLabels && hasSubmitButton,

    // Modal detection
    isModal: isOverlay && hasCenteredContent && hasCloseButton,

    // Navigation detection
    isNavbar: isHorizontal && hasLinks && isTopPositioned,

    // Hero detection
    isHero: isFullWidth && hasHeadingAndCta && isFirstSection
  }

  return matchBestPattern(element, patterns)
}
```

### Style Token Extraction

```typescript
interface DesignTokens {
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    foreground: string
    muted: string
    border: string
    // Semantic colors
    success: string
    warning: string
    error: string
  }

  typography: {
    fontFamily: {
      sans: string
      mono: string
    }
    fontSize: {
      xs: string
      sm: string
      base: string
      lg: string
      xl: string
      '2xl': string
      '3xl': string
    }
    fontWeight: {
      normal: number
      medium: number
      semibold: number
      bold: number
    }
    lineHeight: {
      tight: number
      normal: number
      relaxed: number
    }
  }

  spacing: {
    px: string
    0: string
    1: string
    2: string
    // ... etc
  }

  borderRadius: {
    none: string
    sm: string
    md: string
    lg: string
    full: string
  }

  shadows: {
    sm: string
    md: string
    lg: string
  }
}

// Extract tokens from Figma styles
function extractTokens(figmaStyles: FigmaStyleSet): DesignTokens {
  return {
    colors: extractColors(figmaStyles.colors),
    typography: extractTypography(figmaStyles.text),
    spacing: inferSpacing(figmaStyles.frames),
    borderRadius: extractBorderRadius(figmaStyles.effects),
    shadows: extractShadows(figmaStyles.effects)
  }
}
```

---

## CODE GENERATION

### Component Mapping

```typescript
// Map Figma patterns to shadcn/ui components
const componentMapping: Record<ComponentPattern, string> = {
  'card': 'Card, CardHeader, CardContent, CardFooter',
  'button': 'Button',
  'input': 'Input',
  'select': 'Select, SelectTrigger, SelectContent, SelectItem',
  'checkbox': 'Checkbox',
  'switch': 'Switch',
  'modal': 'Dialog, DialogTrigger, DialogContent',
  'dropdown': 'DropdownMenu, DropdownMenuTrigger, DropdownMenuContent',
  'tabs': 'Tabs, TabsList, TabsTrigger, TabsContent',
  'accordion': 'Accordion, AccordionItem, AccordionTrigger, AccordionContent',
  'avatar': 'Avatar, AvatarImage, AvatarFallback',
  'badge': 'Badge',
  'alert': 'Alert, AlertTitle, AlertDescription',
  'toast': 'Toast',
  'table': 'Table, TableHeader, TableBody, TableRow, TableCell',
  'navbar': 'NavigationMenu',
  'sidebar': 'Sidebar',
  'form': 'Form, FormField, FormItem, FormLabel, FormControl',
}
```

### React Component Generator

```typescript
interface GeneratedComponent {
  name: string
  code: string
  props: PropDefinition[]
  variants: Variant[]
  dependencies: string[]
}

function generateComponent(element: DesignElement, tokens: DesignTokens): GeneratedComponent {
  const pattern = detectPattern(element)
  const baseComponent = componentMapping[pattern]

  const code = `
"use client"

import { ${baseComponent} } from "@/components/ui/${pattern}"
import { cn } from "@/lib/utils"

interface ${element.name}Props {
  ${generatePropsInterface(element)}
}

export function ${element.name}({ ${generatePropsDestructure(element)} }: ${element.name}Props) {
  return (
    ${generateJSX(element, tokens)}
  )
}
`

  return {
    name: element.name,
    code,
    props: extractProps(element),
    variants: extractVariants(element),
    dependencies: extractDependencies(baseComponent)
  }
}
```

### Tailwind CSS Generation

```typescript
// Convert Figma styles to Tailwind classes
function figmaToTailwind(styles: AppliedStyles): string {
  const classes: string[] = []

  // Layout
  if (styles.display === 'flex') {
    classes.push('flex')
    classes.push(styles.flexDirection === 'column' ? 'flex-col' : 'flex-row')
    classes.push(gapToTailwind(styles.gap))
    classes.push(alignToTailwind(styles.alignItems))
    classes.push(justifyToTailwind(styles.justifyContent))
  }

  // Spacing
  classes.push(paddingToTailwind(styles.padding))
  classes.push(marginToTailwind(styles.margin))

  // Sizing
  classes.push(widthToTailwind(styles.width))
  classes.push(heightToTailwind(styles.height))

  // Typography
  classes.push(fontSizeToTailwind(styles.fontSize))
  classes.push(fontWeightToTailwind(styles.fontWeight))
  classes.push(colorToTailwind(styles.color))

  // Background
  classes.push(bgColorToTailwind(styles.backgroundColor))

  // Border
  classes.push(borderToTailwind(styles.border))
  classes.push(borderRadiusToTailwind(styles.borderRadius))

  // Effects
  classes.push(shadowToTailwind(styles.boxShadow))

  return classes.filter(Boolean).join(' ')
}
```

---

## RESPONSIVE HANDLING

### Breakpoint Detection

```typescript
interface ResponsiveVariant {
  breakpoint: 'mobile' | 'tablet' | 'desktop'
  width: number
  styles: AppliedStyles
  layout: LayoutConfig
}

// Detect responsive variants from Figma frames
function detectResponsiveVariants(frames: DesignElement[]): ResponsiveVariant[] {
  const variants: ResponsiveVariant[] = []

  for (const frame of frames) {
    const width = frame.boundingBox.width

    if (width <= 375) {
      variants.push({ breakpoint: 'mobile', width, styles: frame.styles, layout: extractLayout(frame) })
    } else if (width <= 768) {
      variants.push({ breakpoint: 'tablet', width, styles: frame.styles, layout: extractLayout(frame) })
    } else {
      variants.push({ breakpoint: 'desktop', width, styles: frame.styles, layout: extractLayout(frame) })
    }
  }

  return variants
}

// Generate responsive Tailwind classes
function generateResponsiveClasses(variants: ResponsiveVariant[]): string {
  const mobile = variants.find(v => v.breakpoint === 'mobile')
  const tablet = variants.find(v => v.breakpoint === 'tablet')
  const desktop = variants.find(v => v.breakpoint === 'desktop')

  return cn(
    mobile && figmaToTailwind(mobile.styles),
    tablet && `md:${figmaToTailwind(tablet.styles)}`,
    desktop && `lg:${figmaToTailwind(desktop.styles)}`
  )
}
```

---

## ASSET HANDLING

### Image Export

```typescript
interface ExportedAsset {
  nodeId: string
  name: string
  format: 'png' | 'svg' | 'jpg' | 'webp'
  scale: number
  url: string
  localPath: string
}

async function exportAssets(fileKey: string, nodes: DesignElement[]): Promise<ExportedAsset[]> {
  const assets: ExportedAsset[] = []

  // Find all image nodes
  const imageNodes = nodes.filter(n => n.type === 'IMAGE' || n.type === 'VECTOR')

  for (const node of imageNodes) {
    // Get image URLs from Figma
    const urls = await figmaMcp.getFileImages(fileKey, [node.id], {
      format: node.type === 'VECTOR' ? 'svg' : 'png',
      scale: 2  // 2x for retina
    })

    // Download and save locally
    const localPath = await downloadAsset(urls[node.id], node.name)

    assets.push({
      nodeId: node.id,
      name: node.name,
      format: node.type === 'VECTOR' ? 'svg' : 'png',
      scale: 2,
      url: urls[node.id],
      localPath
    })
  }

  return assets
}
```

### Icon Extraction

```typescript
// Convert Figma icons to React components
async function extractIcons(fileKey: string, iconNodes: DesignElement[]): Promise<IconComponent[]> {
  const icons: IconComponent[] = []

  for (const node of iconNodes) {
    // Export as SVG
    const svgUrl = await figmaMcp.getFileImages(fileKey, [node.id], { format: 'svg' })
    const svgContent = await fetch(svgUrl[node.id]).then(r => r.text())

    // Convert to React component
    const iconComponent = svgToReactComponent(svgContent, node.name)
    icons.push(iconComponent)
  }

  return icons
}

function svgToReactComponent(svg: string, name: string): IconComponent {
  // Transform SVG to React-compatible format
  const reactSvg = svg
    .replace(/class=/g, 'className=')
    .replace(/stroke-width/g, 'strokeWidth')
    .replace(/fill-rule/g, 'fillRule')
    .replace(/clip-rule/g, 'clipRule')
    .replace(/stroke-linecap/g, 'strokeLinecap')
    .replace(/stroke-linejoin/g, 'strokeLinejoin')

  return {
    name: pascalCase(name),
    code: `
import { SVGProps } from 'react'

export function ${pascalCase(name)}Icon(props: SVGProps<SVGSVGElement>) {
  return (
    ${reactSvg.replace('<svg', '<svg {...props}')}
  )
}
`
  }
}
```

---

## COMMANDS

### Import from Figma

```bash
# Import entire file
/figma import https://figma.com/file/ABC123/MyDesign

# Import specific frame
/figma import https://figma.com/file/ABC123/MyDesign?node-id=1:234

# Import with options
/figma import https://figma.com/file/ABC123/MyDesign --components-only --with-tokens

# Preview before import
/figma preview https://figma.com/file/ABC123/MyDesign
```

### Generate Components

```bash
# Generate all components
/figma generate components

# Generate specific component
/figma generate component "Header"

# Generate with variants
/figma generate component "Button" --with-variants

# Generate page from frame
/figma generate page "Landing Page"
```

---

## QUALITY CHECKS

### Visual Accuracy

```typescript
interface VisualComparison {
  similarity: number      // 0-100%
  differences: Difference[]
  screenshot: {
    figma: string         // Original design
    generated: string     // Generated code preview
    diff: string          // Highlighted differences
  }
}

async function compareVisuals(
  figmaFrame: DesignElement,
  generatedCode: string
): Promise<VisualComparison> {
  // Capture Figma frame as image
  const figmaImage = await figmaMcp.getFileImages(fileKey, [figmaFrame.id])

  // Render generated code and capture screenshot
  const generatedImage = await playwright.screenshot(generatedCode)

  // Compare images
  const comparison = await compareImages(figmaImage, generatedImage)

  return {
    similarity: comparison.similarity,
    differences: comparison.differences,
    screenshot: {
      figma: figmaImage,
      generated: generatedImage,
      diff: comparison.diffImage
    }
  }
}
```

### Accessibility

```typescript
// Ensure generated code is accessible
async function checkAccessibility(code: string): Promise<AccessibilityReport> {
  const issues: AccessibilityIssue[] = []

  // Check for alt text on images
  if (!hasAltText(code)) {
    issues.push({ type: 'missing-alt', severity: 'error' })
  }

  // Check for proper heading hierarchy
  if (!hasProperHeadings(code)) {
    issues.push({ type: 'heading-hierarchy', severity: 'warning' })
  }

  // Check for color contrast
  const contrastIssues = await checkContrast(code)
  issues.push(...contrastIssues)

  // Check for keyboard navigation
  if (!hasKeyboardNav(code)) {
    issues.push({ type: 'keyboard-nav', severity: 'error' })
  }

  return { issues, score: calculateA11yScore(issues) }
}
```

---

## BEST PRACTICES

### DO
- Extract design tokens before generating components
- Map to existing shadcn/ui components when possible
- Preserve responsive behavior from Figma
- Validate generated code visually
- Include accessibility attributes

### DON'T
- Hard-code pixel values (use Tailwind spacing)
- Ignore component variants
- Skip responsive breakpoints
- Generate inline styles
- Forget to export assets

---

**Version:** 1.0
**Type:** Visual Agent
**MCP Required:** Figma MCP
**Dependencies:** Playwright (for visual comparison)
**Trigger:** `/figma` command, Figma URL detected
