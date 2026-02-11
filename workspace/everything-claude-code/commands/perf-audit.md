# Performance Audit

Run a comprehensive performance audit on the application:

1. Run Lighthouse CI audit:
   - `npx lighthouse http://localhost:3000 --output=json --chrome-flags="--headless --no-sandbox"`
   - Extract Performance score, LCP, INP, CLS, TTFB
   - Flag any metric below target threshold

2. Analyze bundle size:
   - `npx next build` with ANALYZE=true (Next.js) or `npx webpack --profile --json`
   - Identify top 10 largest modules
   - Check for duplicate dependencies in bundle
   - Verify tree-shaking is working (no dead code)

3. Runtime profiling:
   - Check for N+1 database queries (Grep for query patterns)
   - Identify synchronous operations that should be async
   - Look for missing memoization in React components (useMemo, useCallback, React.memo)
   - Check for unnecessary re-renders

4. Image audit:
   - Find unoptimized images (PNG/JPG that should be WebP/AVIF)
   - Check for images without explicit dimensions
   - Verify lazy loading on below-fold images

5. Generate report with:
   - Current metrics vs. targets
   - Severity: CRITICAL (fails budget), HIGH (near budget), MEDIUM (suboptimal)
   - Specific file locations and line numbers
   - Recommended fixes with expected impact

Performance Budgets:
- LCP: < 2.5s
- INP: < 200ms
- CLS: < 0.1
- TTFB: < 800ms
- Initial JS bundle: < 100KB gzipped
- Total bundle: < 200KB gzipped

Use the **performance-profiler** agent for deep analysis.
