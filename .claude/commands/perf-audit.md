# Performance Audit Command

Run a comprehensive performance audit on the current project.

## Instructions

Invoke the `performance-audit` skill to analyze:

1. **Bundle Size** - Analyze JS/CSS bundle sizes
2. **Core Web Vitals** - Measure LCP, FID, CLS, FCP, TTFB
3. **Database Performance** - Check for slow queries and missing indexes
4. **Rendering Performance** - Identify unnecessary re-renders
5. **Network Optimization** - Verify compression, caching, CDN

## Arguments

$ARGUMENTS can be:
- `quick` - Bundle size + Core Web Vitals only
- `full` - All checks (default)
- `database` - Database-focused audit
- `frontend` - Frontend-focused audit

## Output

Produce a scored performance report with the top 5 actionable optimizations ranked by impact.
