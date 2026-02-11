---
name: performance-audit
description: Comprehensive performance audit for web applications. Checks Core Web Vitals, bundle size, database queries, rendering performance, and provides actionable optimization recommendations.
---

# Performance Audit Skill

## When to Use
- Before deployment to production
- When users report slow performance
- After major feature additions
- Regular health checks on existing projects

## Audit Phases

### Phase 1: Bundle Analysis
```bash
# Next.js bundle analysis
ANALYZE=true npm run build

# Check bundle sizes
npx @next/bundle-analyzer

# Alternative: source-map-explorer
npx source-map-explorer .next/static/chunks/*.js
```

**Targets:**
- Initial JS bundle: < 200KB gzipped
- Per-page JS: < 100KB gzipped
- Total CSS: < 50KB gzipped
- No single chunk > 150KB

### Phase 2: Core Web Vitals (via AI Browser)
```
1. browser_navigate to production URL
2. browser_perf_start
3. browser_navigate through critical pages
4. browser_perf_stop
5. browser_perf_insight for Web Vitals
```

**Targets:**
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1
- FCP (First Contentful Paint): < 1.8s
- TTI (Time to Interactive): < 3.8s
- TTFB (Time to First Byte): < 800ms

### Phase 3: Rendering Performance
Check for:
- [ ] Unnecessary re-renders (React DevTools Profiler)
- [ ] Missing `React.memo()` on expensive components
- [ ] Missing `useMemo()`/`useCallback()` for heavy computations
- [ ] Images without `width`/`height` (causes CLS)
- [ ] Images without lazy loading (`loading="lazy"`)
- [ ] Missing `next/image` for image optimization
- [ ] CSS animations using `top`/`left` instead of `transform`

### Phase 4: Database Performance
```sql
-- Check for slow queries (Supabase)
SELECT * FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 20;

-- Check for missing indexes
SELECT relname, seq_scan, idx_scan
FROM pg_stat_user_tables
WHERE seq_scan > idx_scan
ORDER BY seq_scan DESC;
```

**Check for:**
- [ ] N+1 query patterns
- [ ] Missing indexes on frequently filtered columns
- [ ] Queries selecting `*` instead of specific columns
- [ ] Missing pagination on list endpoints
- [ ] Unoptimized JOINs

### Phase 5: Network Optimization
- [ ] HTTP/2 or HTTP/3 enabled
- [ ] Gzip/Brotli compression enabled
- [ ] Cache-Control headers set correctly
- [ ] Static assets served from CDN
- [ ] API responses have appropriate cache headers
- [ ] Prefetch/preload for critical resources

### Phase 6: Code-Level Optimizations
- [ ] Dynamic imports for heavy components (`next/dynamic`)
- [ ] Tree-shaking working (no barrel exports importing everything)
- [ ] No unused dependencies in package.json
- [ ] Server components used where possible (Next.js App Router)
- [ ] Static generation for content pages (SSG over SSR)

## Output Format

```
PERFORMANCE AUDIT REPORT
========================

Bundle Size:
  Initial JS:    [X KB] [OK/OVER]
  Total CSS:     [X KB] [OK/OVER]
  Largest Chunk: [X KB] [OK/OVER]

Core Web Vitals:
  LCP:  [X.Xs] [GOOD/NEEDS IMPROVEMENT/POOR]
  FID:  [Xms]  [GOOD/NEEDS IMPROVEMENT/POOR]
  CLS:  [X.XX] [GOOD/NEEDS IMPROVEMENT/POOR]
  FCP:  [X.Xs] [GOOD/NEEDS IMPROVEMENT/POOR]
  TTFB: [Xms]  [GOOD/NEEDS IMPROVEMENT/POOR]

Database:
  Slow Queries:    [X found]
  Missing Indexes: [X found]
  N+1 Patterns:    [X found]

Rendering:
  Unnecessary Re-renders: [X components]
  Missing Optimizations:  [X items]

Overall Score: [X/100]
Status: [EXCELLENT/GOOD/NEEDS WORK/CRITICAL]

TOP 5 OPTIMIZATIONS (by impact):
1. [Description] -> [Expected improvement]
2. [Description] -> [Expected improvement]
3. [Description] -> [Expected improvement]
4. [Description] -> [Expected improvement]
5. [Description] -> [Expected improvement]
```
