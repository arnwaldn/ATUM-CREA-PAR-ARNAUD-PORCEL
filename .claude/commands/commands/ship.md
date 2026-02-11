# Ship Command - Deploy to Production

Full deployment pipeline: verify -> optimize -> deploy -> validate.

## Instructions

Execute the complete shipping pipeline:

### Phase 1: Pre-Flight Checks
1. Run `/verify full` - all gates must pass
2. Check for uncommitted changes
3. Verify all environment variables are set

### Phase 2: Performance Optimization
1. Analyze bundle size
2. Check for unoptimized images
3. Verify caching configuration
4. Remove any console.log statements

### Phase 3: Deploy
1. Detect deployment target (Vercel config? Railway? Docker?)
2. Execute deployment
3. Wait for deployment to complete

### Phase 4: Post-Deploy Validation
1. Verify the live URL loads
2. Test critical user flows via AI Browser
3. Check error tracking is receiving events
4. Run Lighthouse on production URL

## Arguments

$ARGUMENTS can be:
- `preview` - Deploy to preview/staging only
- `production` - Deploy to production (default)
- `rollback` - Rollback to previous deployment
- `status` - Check current deployment status

## Output

```
SHIP REPORT
===========
Phase 1 - Verification: [PASS/FAIL]
Phase 2 - Optimization:  [PASS/FAIL]
Phase 3 - Deployment:    [SUCCESS/FAILED]
Phase 4 - Validation:    [PASS/FAIL]

Production URL: [url]
Status: SHIPPED / FAILED / ROLLED BACK
```
