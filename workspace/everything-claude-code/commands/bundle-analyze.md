# Bundle Analyze

Analyze the application bundle for size, tree-shaking, and code splitting optimization:

1. Build and measure:
   - Run production build: `npm run build`
   - Measure total output size (raw and gzipped)
   - Compare against budget: < 200KB gzipped initial load

2. Bundle composition:
   - `npx source-map-explorer dist/**/*.js` (or build output path)
   - Identify top 10 largest modules
   - Calculate percentage of bundle per dependency
   - Flag any single dependency > 50KB gzipped

3. Tree-shaking verification:
   - Check for barrel file imports (`import { x } from './index'`)
   - Verify `sideEffects: false` in package.json where applicable
   - Look for default imports of large libraries (`import _ from 'lodash'`)
   - Suggest named imports: `import { debounce } from 'lodash-es'`

4. Code splitting analysis:
   - Verify route-level code splitting (dynamic imports per page)
   - Check for heavy components that should be lazy loaded
   - Identify shared chunks between routes
   - Look for components imported synchronously that are only used conditionally

5. Duplicate dependency detection:
   - `npm ls --all` to find multiple versions of same package
   - Identify peer dependency mismatches causing duplication
   - Suggest deduplication: `npm dedupe`

6. Optimization recommendations:
   - Replace heavy packages with lighter alternatives
   - Move client-only code out of server bundles
   - Identify polyfills that can be removed (check browser targets)
   - Suggest dynamic imports for below-fold content

7. Generate report:
   - Bundle size: current vs. budget
   - Top 10 modules by size
   - Tree-shaking issues found
   - Code splitting opportunities
   - Duplicate dependencies
   - Estimated savings from each recommendation

Use the **performance-profiler** agent for deep analysis.
