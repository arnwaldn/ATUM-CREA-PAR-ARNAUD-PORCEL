---
name: deployment
description: Full deployment pipeline for shipping projects to production. Supports Vercel, Railway, Supabase, and custom Docker deployments. Use when a project is ready to ship.
---

# Deployment Skill - Ship to Production

## When to Use
- User says "deploy", "ship", "mise en production", "publish"
- After all verification gates pass
- When project is production-ready

## Pre-Deployment Checklist (MANDATORY)

Before ANY deployment, verify:

### 1. Build Verification
```bash
npm run build
# OR pnpm build / yarn build
# MUST pass with ZERO errors
```

### 2. Test Verification
```bash
npm run test -- --coverage
# MUST achieve 80%+ coverage
# MUST have ZERO failing tests
```

### 3. Environment Variables
- [ ] All required env vars documented in `.env.example`
- [ ] No hardcoded secrets in source code
- [ ] Production env vars are set in deployment platform
- [ ] Database connection strings use production values

### 4. Security Scan
- [ ] No `console.log` in production code (search: `console.log`)
- [ ] No API keys in source code (search: `sk-`, `api_key`, `secret`)
- [ ] CORS configured for production domain only
- [ ] Rate limiting enabled on API endpoints
- [ ] Input validation on all user-facing endpoints

### 5. Performance Check
- [ ] Images optimized (WebP/AVIF, lazy loading)
- [ ] Bundle size < 200KB gzipped (initial JS)
- [ ] No N+1 database queries
- [ ] Caching headers configured

## Deployment Targets

### Vercel (Recommended for Next.js)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy preview
vercel

# Deploy production
vercel --prod
```

**Vercel MCP**: If available, use `mcp_activate("vercel")` for direct deployment.

Configuration requirements:
- `vercel.json` for custom config
- Environment variables set in Vercel dashboard
- Domain configured and DNS propagated

### Railway (Recommended for APIs/Backend)
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway up
```

### Supabase (Database & Auth)
Already managed via Supabase MCP:
- Run migrations: `mcp__supabase__apply_migration`
- Check advisors: `mcp__supabase__get_advisors`
- Verify RLS: `mcp__supabase__get_advisors({type: "security"})`

### Docker (Custom deployments)
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

## Post-Deployment Verification

After deployment, ALWAYS:

1. **Verify the live URL** loads correctly
2. **Test critical user flows** (login, main feature, payment if applicable)
3. **Check error tracking** (Sentry or equivalent is reporting)
4. **Monitor performance** (Lighthouse on production URL)
5. **Verify SSL certificate** is active

## Rollback Plan

If deployment fails:
1. Revert to previous deployment (Vercel: `vercel rollback`, Railway: previous deploy)
2. Check deployment logs for errors
3. Fix locally, re-verify, re-deploy
4. Never leave a broken production site

## Output Format

```
DEPLOYMENT REPORT
=================
Target:     [Vercel/Railway/Docker/Custom]
URL:        [production URL]
Status:     [SUCCESS/FAILED]

Pre-Deploy:
  Build:    [PASS/FAIL]
  Tests:    [PASS/FAIL] (X% coverage)
  Security: [PASS/FAIL]
  Env Vars: [PASS/FAIL]

Post-Deploy:
  Site Live:    [YES/NO]
  SSL Active:   [YES/NO]
  Performance:  [Score/100]

Recommendation: [SHIP / ROLLBACK / FIX AND REDEPLOY]
```
