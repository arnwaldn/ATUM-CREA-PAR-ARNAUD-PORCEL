# CI/CD - GitHub Actions Patterns

> **Version**: v1.0 | ATUM CREA
> **Stack**: GitHub Actions + Vercel + Next.js
> **Principe**: CI sur chaque PR, CD sur merge dans main

---

## Architecture Pipeline

```
PR ouverte ──> CI Workflow
                ├── lint (ESLint + Prettier)
                ├── type-check (tsc --noEmit)
                ├── test (Vitest + coverage 80%)
                └── build (next build)

Merge main ──> CD Workflow
                ├── build (vercel build)
                ├── deploy preview (vercel deploy)
                ├── smoke tests (Playwright)
                └── deploy production (vercel deploy --prod)
```

---

## CI Workflow

```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main]

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

jobs:
  lint:
    name: Lint & Format
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm format:check

  typecheck:
    name: Type Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm tsc --noEmit

  test:
    name: Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm test -- --coverage --reporter=default --reporter=json
        env:
          CI: true
      - name: Check coverage threshold
        run: |
          COVERAGE=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
          echo "Coverage: $COVERAGE%"
          if (( $(echo "$COVERAGE < 80" | bc -l) )); then
            echo "Coverage below 80% threshold"
            exit 1
          fi

  build:
    name: Build
    runs-on: ubuntu-latest
    needs: [lint, typecheck, test]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
        env:
          NEXT_TELEMETRY_DISABLED: 1
```

---

## CD Workflow

```yaml
# .github/workflows/cd.yml
name: CD

on:
  push:
    branches: [main]

concurrency:
  group: cd-production
  cancel-in-progress: false  # Ne pas annuler un deploiement en cours

env:
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

jobs:
  deploy-preview:
    name: Deploy Preview
    runs-on: ubuntu-latest
    outputs:
      preview-url: ${{ steps.deploy.outputs.url }}
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'

      - name: Install Vercel CLI
        run: pnpm add -g vercel

      - name: Pull Vercel config
        run: vercel pull --yes --environment=preview --token=${{ secrets.VERCEL_TOKEN }}

      - name: Build
        run: vercel build --token=${{ secrets.VERCEL_TOKEN }}

      - name: Deploy Preview
        id: deploy
        run: |
          URL=$(vercel deploy --prebuilt --token=${{ secrets.VERCEL_TOKEN }})
          echo "url=$URL" >> "$GITHUB_OUTPUT"

  smoke-tests:
    name: Smoke Tests
    runs-on: ubuntu-latest
    needs: deploy-preview
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm exec playwright install --with-deps chromium
      - name: Run smoke tests
        run: pnpm exec playwright test tests/smoke/
        env:
          BASE_URL: ${{ needs.deploy-preview.outputs.preview-url }}

  deploy-production:
    name: Deploy Production
    runs-on: ubuntu-latest
    needs: [deploy-preview, smoke-tests]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'
      - name: Install Vercel CLI
        run: pnpm add -g vercel
      - name: Pull Vercel config
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
      - name: Build
        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
      - name: Deploy Production
        run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
```

---

## Secrets a configurer

```
VERCEL_TOKEN        → https://vercel.com/account/tokens
VERCEL_ORG_ID       → .vercel/project.json (apres vercel link)
VERCEL_PROJECT_ID   → .vercel/project.json
```

---

## Optimisations

### Cache pnpm

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: 22
    cache: 'pnpm'
```

### Matrix pour multi-version

```yaml
strategy:
  matrix:
    node: [20, 22]
```

### Dependabot

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: npm
    directory: /
    schedule:
      interval: weekly
    groups:
      production-dependencies:
        patterns: ['*']
        exclude-patterns: ['@types/*', 'eslint*', 'prettier*']
      dev-dependencies:
        dependency-type: development
        patterns: ['*']
```

---

## Checklist

- [ ] CI: lint + typecheck + test + build sur chaque PR
- [ ] CD: deploy preview + smoke tests + deploy production sur merge
- [ ] Secrets configures (VERCEL_TOKEN, ORG_ID, PROJECT_ID)
- [ ] Concurrency groups (annulation PR, pas de CD en parallele)
- [ ] Coverage threshold 80%
- [ ] Dependabot configure
- [ ] Cache pnpm active

---

*Knowledge ATUM CREA | Sources: GitHub Actions docs, Vercel CLI docs*
