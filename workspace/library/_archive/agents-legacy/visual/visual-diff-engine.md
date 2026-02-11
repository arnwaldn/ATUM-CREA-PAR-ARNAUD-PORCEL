# Agent: Visual Diff Engine v1.0

## Role
Agent spécialisé dans la comparaison visuelle entre designs et implémentations. Détecte les différences pixel-level et suggère des corrections.

---

## ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    VISUAL DIFF ENGINE                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────┐           ┌─────────────────┐                         │
│  │   SOURCE IMAGE  │           │   TARGET IMAGE  │                         │
│  │   (Design)      │           │   (Generated)   │                         │
│  └────────┬────────┘           └────────┬────────┘                         │
│           │                             │                                   │
│           └──────────────┬──────────────┘                                   │
│                          │                                                  │
│                          ▼                                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    IMAGE PREPROCESSING                               │   │
│  │                                                                      │   │
│  │  • Resolution matching                                              │   │
│  │  • Color space normalization                                        │   │
│  │  • Anti-aliasing handling                                           │   │
│  │  • Region alignment                                                 │   │
│  └────────────────────────────────┬────────────────────────────────────┘   │
│                                   │                                         │
│                                   ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    DIFF ALGORITHMS                                   │   │
│  │                                                                      │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │   │
│  │  │   PIXEL      │  │  STRUCTURAL  │  │   SEMANTIC   │               │   │
│  │  │   DIFF       │  │   DIFF       │  │   DIFF       │               │   │
│  │  │              │  │              │  │              │               │   │
│  │  │ Color diff   │  │ Layout diff  │  │ Component    │               │   │
│  │  │ per pixel    │  │ SSIM/DSSIM   │  │ matching     │               │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘               │   │
│  └────────────────────────────────┬────────────────────────────────────┘   │
│                                   │                                         │
│                                   ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    DIFF VISUALIZATION                                │   │
│  │                                                                      │   │
│  │  • Heatmap overlay                                                  │   │
│  │  • Side-by-side comparison                                          │   │
│  │  • Slider comparison                                                │   │
│  │  • Annotated differences                                            │   │
│  └────────────────────────────────┬────────────────────────────────────┘   │
│                                   │                                         │
│                                   ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    FIX SUGGESTER                                     │   │
│  │                                                                      │   │
│  │  • Identify CSS properties to adjust                                │   │
│  │  • Generate fix snippets                                            │   │
│  │  • Prioritize by visual impact                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## DIFF ALGORITHMS

### Pixel-Level Diff

```typescript
interface PixelDiff {
  totalPixels: number
  differentPixels: number
  percentDiff: number
  diffMap: Uint8Array        // Difference intensity per pixel
  regions: DiffRegion[]      // Clustered diff areas
}

function calculatePixelDiff(source: Image, target: Image): PixelDiff {
  const diffMap = new Uint8Array(source.width * source.height)
  let differentPixels = 0

  for (let i = 0; i < source.data.length; i += 4) {
    const dr = Math.abs(source.data[i] - target.data[i])
    const dg = Math.abs(source.data[i + 1] - target.data[i + 1])
    const db = Math.abs(source.data[i + 2] - target.data[i + 2])
    const da = Math.abs(source.data[i + 3] - target.data[i + 3])

    const diff = (dr + dg + db + da) / 4
    diffMap[i / 4] = diff

    if (diff > THRESHOLD) {
      differentPixels++
    }
  }

  return {
    totalPixels: source.width * source.height,
    differentPixels,
    percentDiff: (differentPixels / (source.width * source.height)) * 100,
    diffMap,
    regions: clusterDiffRegions(diffMap, source.width, source.height)
  }
}
```

### Structural Similarity (SSIM)

```typescript
interface StructuralDiff {
  ssim: number              // 0-1, 1 = identical
  mssim: number             // Mean SSIM across windows
  regions: SSIMRegion[]     // Per-region scores
}

function calculateSSIM(source: Image, target: Image): StructuralDiff {
  // Constants for SSIM
  const K1 = 0.01
  const K2 = 0.03
  const L = 255  // Dynamic range

  const C1 = (K1 * L) ** 2
  const C2 = (K2 * L) ** 2

  // Sliding window approach
  const windowSize = 11
  const regions: SSIMRegion[] = []
  let totalSSIM = 0
  let windowCount = 0

  for (let y = 0; y < source.height - windowSize; y += windowSize) {
    for (let x = 0; x < source.width - windowSize; x += windowSize) {
      const window1 = extractWindow(source, x, y, windowSize)
      const window2 = extractWindow(target, x, y, windowSize)

      const ssim = calculateWindowSSIM(window1, window2, C1, C2)
      totalSSIM += ssim
      windowCount++

      if (ssim < 0.9) {
        regions.push({
          x, y,
          width: windowSize,
          height: windowSize,
          ssim
        })
      }
    }
  }

  return {
    ssim: totalSSIM / windowCount,
    mssim: totalSSIM / windowCount,
    regions
  }
}
```

### Semantic Diff (AI-Powered)

```typescript
interface SemanticDiff {
  componentMatches: ComponentMatch[]
  missingComponents: string[]
  extraComponents: string[]
  styleDeviations: StyleDeviation[]
  layoutShifts: LayoutShift[]
}

async function calculateSemanticDiff(
  source: Image,
  target: Image
): Promise<SemanticDiff> {
  // Analyze both images with vision
  const sourceAnalysis = await analyzeWithVision(source)
  const targetAnalysis = await analyzeWithVision(target)

  // Match components
  const matches = matchComponents(
    sourceAnalysis.components,
    targetAnalysis.components
  )

  // Find missing/extra
  const sourceIds = new Set(sourceAnalysis.components.map(c => c.id))
  const targetIds = new Set(targetAnalysis.components.map(c => c.id))

  const missing = [...sourceIds].filter(id => !targetIds.has(id))
  const extra = [...targetIds].filter(id => !sourceIds.has(id))

  // Detect style deviations
  const styleDeviations: StyleDeviation[] = []
  for (const match of matches) {
    const deviations = compareStyles(match.source.styles, match.target.styles)
    styleDeviations.push(...deviations)
  }

  // Detect layout shifts
  const layoutShifts = detectLayoutShifts(
    sourceAnalysis.layout,
    targetAnalysis.layout
  )

  return {
    componentMatches: matches,
    missingComponents: missing,
    extraComponents: extra,
    styleDeviations,
    layoutShifts
  }
}
```

---

## DIFF VISUALIZATION

### Heatmap Overlay

```typescript
interface HeatmapConfig {
  colorScale: 'red-yellow' | 'purple-blue' | 'custom'
  opacity: number
  threshold: number
}

function generateHeatmap(
  baseImage: Image,
  diffMap: Uint8Array,
  config: HeatmapConfig
): Image {
  const heatmap = new Image(baseImage.width, baseImage.height)

  for (let i = 0; i < diffMap.length; i++) {
    const diff = diffMap[i]

    if (diff > config.threshold) {
      // Map diff intensity to color
      const color = intensityToColor(diff, config.colorScale)

      // Blend with base image
      const basePixel = getPixel(baseImage, i)
      const blendedPixel = blend(basePixel, color, config.opacity)

      setPixel(heatmap, i, blendedPixel)
    } else {
      // Keep original pixel (slightly desaturated)
      const basePixel = getPixel(baseImage, i)
      setPixel(heatmap, i, desaturate(basePixel, 0.5))
    }
  }

  return heatmap
}
```

### Side-by-Side Comparison

```typescript
interface ComparisonView {
  type: 'side-by-side' | 'slider' | 'overlay' | 'diff-only'
  source: Image
  target: Image
  diff: Image
  annotations: Annotation[]
}

function generateSideBySide(
  source: Image,
  target: Image,
  diff: PixelDiff
): ComparisonView {
  // Create combined image
  const combined = new Image(source.width * 3, source.height)

  // Left: Source with annotations
  drawImage(combined, source, 0, 0)
  drawAnnotations(combined, diff.regions, 0, 'source')

  // Center: Diff visualization
  const diffImage = generateHeatmap(source, diff.diffMap, defaultConfig)
  drawImage(combined, diffImage, source.width, 0)

  // Right: Target with annotations
  drawImage(combined, target, source.width * 2, 0)
  drawAnnotations(combined, diff.regions, source.width * 2, 'target')

  return {
    type: 'side-by-side',
    source,
    target,
    diff: diffImage,
    annotations: generateAnnotations(diff)
  }
}
```

### Interactive Slider

```typescript
// Generate HTML for interactive slider comparison
function generateSliderHTML(source: Image, target: Image): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    .comparison-container {
      position: relative;
      width: ${source.width}px;
      height: ${source.height}px;
      overflow: hidden;
    }
    .comparison-image {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .comparison-overlay {
      clip-path: inset(0 50% 0 0);
    }
    .comparison-slider {
      position: absolute;
      top: 0;
      left: 50%;
      width: 4px;
      height: 100%;
      background: white;
      cursor: ew-resize;
      z-index: 10;
    }
  </style>
</head>
<body>
  <div class="comparison-container">
    <img class="comparison-image" src="${toDataURL(target)}" alt="Generated">
    <img class="comparison-image comparison-overlay" src="${toDataURL(source)}" alt="Original">
    <div class="comparison-slider"></div>
  </div>
  <script>
    const container = document.querySelector('.comparison-container');
    const slider = document.querySelector('.comparison-slider');
    const overlay = document.querySelector('.comparison-overlay');

    let isDragging = false;

    slider.addEventListener('mousedown', () => isDragging = true);
    document.addEventListener('mouseup', () => isDragging = false);
    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;

      const rect = container.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      const percent = (x / rect.width) * 100;

      slider.style.left = percent + '%';
      overlay.style.clipPath = \`inset(0 \${100 - percent}% 0 0)\`;
    });
  </script>
</body>
</html>
`
}
```

---

## FIX SUGGESTIONS

### CSS Property Analyzer

```typescript
interface StyleFix {
  property: string
  current: string
  expected: string
  selector: string
  priority: 'high' | 'medium' | 'low'
  impact: number           // Visual impact score 0-100
}

function generateStyleFixes(
  styleDeviations: StyleDeviation[]
): StyleFix[] {
  const fixes: StyleFix[] = []

  for (const deviation of styleDeviations) {
    const { property, sourceValue, targetValue, element } = deviation

    // Calculate visual impact
    const impact = calculateVisualImpact(property, sourceValue, targetValue)

    fixes.push({
      property,
      current: targetValue,
      expected: sourceValue,
      selector: generateSelector(element),
      priority: impact > 70 ? 'high' : impact > 30 ? 'medium' : 'low',
      impact
    })
  }

  // Sort by impact (highest first)
  return fixes.sort((a, b) => b.impact - a.impact)
}
```

### Code Patch Generator

```typescript
interface CodePatch {
  file: string
  line: number
  original: string
  replacement: string
  description: string
}

function generatePatches(fixes: StyleFix[], codebase: Codebase): CodePatch[] {
  const patches: CodePatch[] = []

  for (const fix of fixes) {
    // Find the file containing this style
    const location = findStyleLocation(fix.selector, codebase)

    if (!location) continue

    // Generate Tailwind class change
    const oldClass = cssToTailwind({ [fix.property]: fix.current })
    const newClass = cssToTailwind({ [fix.property]: fix.expected })

    patches.push({
      file: location.file,
      line: location.line,
      original: `className="...${oldClass}..."`,
      replacement: `className="...${newClass}..."`,
      description: `Fix ${fix.property}: ${fix.current} → ${fix.expected}`
    })
  }

  return patches
}
```

---

## REGRESSION TESTING

### Visual Regression Test Suite

```typescript
interface VisualTest {
  name: string
  baselineImage: string     // Path to baseline
  currentImage: string      // Path to current
  threshold: number         // Max allowed diff %
  status: 'pass' | 'fail' | 'new'
}

async function runVisualRegressionTests(
  testDir: string
): Promise<VisualTest[]> {
  const tests: VisualTest[] = []
  const baselines = await glob(`${testDir}/baselines/*.png`)

  for (const baseline of baselines) {
    const name = path.basename(baseline, '.png')
    const current = `${testDir}/current/${name}.png`

    if (!await exists(current)) {
      tests.push({ name, baselineImage: baseline, currentImage: '', threshold: 0, status: 'new' })
      continue
    }

    // Run diff
    const baseImg = await loadImage(baseline)
    const currImg = await loadImage(current)
    const diff = calculatePixelDiff(baseImg, currImg)

    const threshold = 1 // 1% max diff
    tests.push({
      name,
      baselineImage: baseline,
      currentImage: current,
      threshold,
      status: diff.percentDiff <= threshold ? 'pass' : 'fail'
    })
  }

  return tests
}
```

### Continuous Integration Integration

```yaml
# GitHub Actions workflow
name: Visual Regression Tests

on: [push, pull_request]

jobs:
  visual-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build

      - name: Capture screenshots
        run: npm run capture-screenshots

      - name: Run visual diff
        run: npm run visual-diff

      - name: Upload diff report
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: visual-diff-report
          path: test-results/visual-diff/

      - name: Comment on PR
        if: failure() && github.event_name == 'pull_request'
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '## Visual Regression Failed\n\nSee attached diff report for details.'
            })
```

---

## COMMANDS

### Compare Images

```bash
# Compare two images
/diff compare source.png target.png

# Compare with threshold
/diff compare source.png target.png --threshold 1%

# Compare directory (batch)
/diff compare-dir ./designs ./screenshots
```

### Generate Report

```bash
# Full diff report
/diff report --output report.html

# JSON report (for CI)
/diff report --format json --output report.json
```

### Apply Fixes

```bash
# Preview fixes
/diff fix --preview

# Apply high-priority fixes
/diff fix --priority high

# Apply all fixes
/diff fix --all
```

---

## METRICS

### Diff Thresholds

| Level | Pixel Diff | SSIM | Action |
|-------|------------|------|--------|
| Identical | < 0.1% | > 0.99 | Pass |
| Acceptable | < 1% | > 0.95 | Review optional |
| Minor | < 5% | > 0.90 | Review recommended |
| Major | < 20% | > 0.80 | Review required |
| Critical | > 20% | < 0.80 | Fail |

### Report Summary

```markdown
## Visual Diff Report

### Summary
- Files compared: 12
- Passed: 10
- Failed: 2
- New (no baseline): 0

### Failed Comparisons

#### 1. Landing Page Hero (8.3% diff)
- SSIM: 0.89
- Main issues:
  - Font size difference in heading (-2px)
  - Button color mismatch (#3B82F6 vs #2563EB)
  - Image alignment shifted 4px right

**Suggested fixes:**
1. `text-5xl` → `text-4xl` in heading
2. `bg-blue-500` → `bg-blue-600` in CTA button
3. Add `mr-4` to image container

#### 2. Pricing Cards (12.1% diff)
- SSIM: 0.84
- Main issues:
  - Card shadow intensity
  - Price typography weight
  - Border radius mismatch
```

---

## BEST PRACTICES

### DO
- Use multiple diff algorithms for accuracy
- Set appropriate thresholds per component type
- Generate actionable fix suggestions
- Integrate with CI/CD pipeline
- Keep baselines up to date

### DON'T
- Use exact pixel matching (allow anti-aliasing variance)
- Ignore structural differences
- Auto-apply fixes without review
- Compare different viewports without resizing
- Block deployments on minor visual differences

---

**Version:** 1.0
**Type:** Visual Agent
**MCP Required:** Playwright, Screenshot MCP
**Dependencies:** Image processing library
**Trigger:** `/diff` command, visual regression tests
