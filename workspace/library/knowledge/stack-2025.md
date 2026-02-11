# Stack Recommandée 2025

## Web Applications

### SaaS / Dashboard
```yaml
Framework: Next.js 15 (App Router)
Language: TypeScript (strict)
Styling: TailwindCSS + shadcn/ui
Database: Supabase (PostgreSQL)
ORM: Prisma ou Drizzle
Auth: Supabase Auth ou Clerk
Payments: Stripe
State: Zustand + React Query
Forms: React Hook Form + Zod
Testing: Vitest + Playwright
Deploy: Vercel
```

### E-commerce
```yaml
Framework: Next.js 15
Styling: TailwindCSS + shadcn/ui
Database: Supabase
ORM: Prisma
Auth: Supabase Auth
Payments: Stripe (Checkout + Connect)
Search: Algolia ou Meilisearch
State: Zustand
Deploy: Vercel
```

### Landing Page / Marketing
```yaml
Framework: Astro ou Next.js
Styling: TailwindCSS
Animations: Framer Motion
CMS: Sanity ou Contentful (optionnel)
Analytics: Plausible ou Posthog
Deploy: Vercel ou Netlify
```

## Mobile Applications

### Cross-Platform
```yaml
Framework: Expo (React Native)
Routing: Expo Router
Styling: NativeWind (TailwindCSS)
State: Zustand + React Query
Storage: Expo SecureStore + AsyncStorage
Push: Expo Notifications
Auth: Supabase Auth
Build: EAS Build
Deploy: EAS Submit
```

### Alternative Flutter
```yaml
Framework: Flutter
State: Riverpod ou Bloc
Storage: Hive ou SQLite
Auth: Firebase Auth ou Supabase
Build: flutter build
Deploy: Manual ou Codemagic
```

## Desktop Applications

### Léger & Performant
```yaml
Framework: Tauri 2.0
Frontend: React + TypeScript
Styling: TailwindCSS + shadcn/ui
Database: SQLite (via rusqlite)
State: Zustand
Build: tauri build
```

### Feature-Rich
```yaml
Framework: Electron
Frontend: React + TypeScript
Styling: TailwindCSS + shadcn/ui
Database: SQLite (better-sqlite3)
State: Zustand
Build: electron-builder
```

## Backend / API

### Node.js
```yaml
Framework: Hono ou Express
Runtime: Node.js ou Bun
Database: PostgreSQL
ORM: Prisma ou Drizzle
Validation: Zod
Auth: JWT + Cookies
```

### Python
```yaml
Framework: FastAPI
Database: PostgreSQL
ORM: SQLAlchemy
Validation: Pydantic
Auth: JWT
```

## DevOps & Infrastructure

### CI/CD
```yaml
Platform: GitHub Actions
Linting: ESLint + Prettier
Testing: Vitest + Playwright
Build: Turbo (monorepo)
```

### Deployment
```yaml
Web: Vercel (primary), Netlify, Railway
Edge: Cloudflare Workers
Database: Supabase, PlanetScale, Neon
Storage: Supabase Storage, Cloudflare R2
```

## Infrastructure as Code (Terraform)

### Supabase Terraform Provider
```yaml
Provider: supabase/supabase
Ressources: Projects, branches, Edge Functions, RLS policies
State: Remote backend (S3 ou Supabase Storage)
Pattern: Modules reutilisables par env (dev/staging/prod)
```

```hcl
# main.tf
terraform {
  required_providers {
    supabase = {
      source  = "supabase/supabase"
      version = "~> 1.0"
    }
  }
}

provider "supabase" {
  access_token = var.supabase_access_token
}

resource "supabase_project" "main" {
  organization_id   = var.org_id
  name              = "mon-app-${var.environment}"
  database_password  = var.db_password
  region            = "eu-west-1"
}
```

## CLI Tool Patterns

### Packages recommandes
```yaml
Parsing: commander (mature) ou citty (TypeScript-first, zero-dep)
Prompts: @inquirer/prompts (ESM, TypeScript)
Affichage: chalk (couleurs), ora (spinners), cli-table3 (tableaux)
Config: cosmiconfig (detection auto .rc, .config.js, package.json)
```

## API Documentation

### OpenAPI depuis Zod
```yaml
Package: @asteasolutions/zod-to-openapi
UI: Scalar (moderne, React) ou Swagger UI
Pattern: Schema Zod → OpenAPI spec → UI auto-generee
```

## Reverse Proxy & CDN

```yaml
Developpement: Caddy (config simple, HTTPS auto)
Production: Cloudflare (CDN + WAF + DDoS protection)
Self-hosted: nginx ou Caddy
```

## Database Backup

```yaml
Supabase Auto: Backups automatiques (plan Pro), 7 jours retention, PITR (Pro+)
Self-managed: pg_dump + cron + stockage S3
Regle: Toujours tester la restauration periodiquement
```

---

## Outils Recommandes

### VS Code Extensions
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Prisma
- Error Lens
- GitLens

### Packages Essentiels
```json
{
  "dependencies": {
    "@tanstack/react-query": "^5.0.0",
    "zustand": "^4.5.0",
    "zod": "^3.23.0",
    "react-hook-form": "^7.52.0",
    "@hookform/resolvers": "^3.9.0",
    "date-fns": "^3.6.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.3.0"
  },
  "devDependencies": {
    "typescript": "^5.5.0",
    "vitest": "^2.0.0",
    "@playwright/test": "^1.45.0",
    "prettier": "^3.3.0",
    "eslint": "^9.0.0"
  }
}
```
