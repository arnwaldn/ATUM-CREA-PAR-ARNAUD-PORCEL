---
description: UI/UX Feedback Team multi-agents (user)
---

# /uiux - UI/UX Analysis & Improvement

## USAGE
```
/uiux analyze "https://example.com"
/uiux plan "https://example.com"
/uiux full "https://example.com"
/uiux compare "url1" "url2"
/uiux edit "feedback utilisateur"
```

## MODES

### analyze
Analyse complete + scoring 10 dimensions
```
/uiux analyze "https://mysite.com"
```
Output:
```yaml
uiux_analysis:
  overall_score: 78/100

  dimensions:
    visual_hierarchy: 8/10
    color_harmony: 7/10
    typography: 9/10
    spacing: 7/10
    responsiveness: 8/10
    accessibility: 6/10
    navigation: 8/10
    cta_clarity: 7/10
    loading_speed: 8/10
    consistency: 8/10

  strengths:
    - Clean typography
    - Good visual hierarchy

  weaknesses:
    - Accessibility issues (contrast)
    - CTA buttons not prominent enough

  recommendations:
    - Increase button contrast to 4.5:1
    - Add focus states for keyboard nav
```

### plan
Analyse + specifications techniques
```
/uiux plan "https://mysite.com"
```
Output: Analyse + specs CSS/composants pour amelioration

### full
Pipeline complet → code genere
```
/uiux full "https://mysite.com"
```
Output: Analyse + specs + code React/shadcn

### compare
Comparaison deux sites
```
/uiux compare "https://site1.com" "https://site2.com"
```
Output: Comparatif dimensions par dimensions

### edit
Modification iterative basee sur feedback
```
/uiux edit "Le bouton doit etre plus visible"
```

## AGENTS IMPLIQUES

```
┌─────────────────────────────────────┐
│           UI/UX LEAD                │
│    (orchestration pipeline)         │
└─────────────┬───────────────────────┘
              │
    ┌─────────┼─────────┐
    │         │         │
    ▼         ▼         ▼
┌───────┐ ┌───────┐ ┌───────┐
│VISUAL │ │ UX    │ │A11Y   │
│ANALYST│ │EXPERT │ │AUDITOR│
└───────┘ └───────┘ └───────┘
    │         │         │
    └─────────┼─────────┘
              ▼
       ┌───────────┐
       │ DESIGNER  │
       │(code gen) │
       └───────────┘
```

## WORKFLOW

### 1. Capture
```javascript
mcp__playwright__browser_navigate({ url })
mcp__playwright__browser_screenshot({ name: "full", fullPage: true })
```

### 2. Analyse multi-agents
Chaque agent analyse son domaine en parallele

### 3. Synthese
Compilation des analyses en rapport unifie

### 4. Recommendations
Priorisation par impact/effort

### 5. Code (mode full)
Generation composants ameliores

## OPTIONS
| Option | Description |
|--------|-------------|
| --mobile | Analyser version mobile |
| --focus="X" | Focus sur aspect (a11y, colors, etc) |
| --benchmark="Y" | Comparer a reference |

## SCORING DIMENSIONS

| Dimension | Description | Poids |
|-----------|-------------|-------|
| Visual Hierarchy | Structure visuelle | 15% |
| Color Harmony | Coherence couleurs | 10% |
| Typography | Lisibilite, hierarchie | 10% |
| Spacing | Respiration, grilles | 10% |
| Responsiveness | Adaptation ecrans | 10% |
| Accessibility | WCAG compliance | 15% |
| Navigation | Clarte parcours | 10% |
| CTA Clarity | Actions evidentes | 10% |
| Loading Speed | Performance percue | 5% |
| Consistency | Coherence globale | 5% |
