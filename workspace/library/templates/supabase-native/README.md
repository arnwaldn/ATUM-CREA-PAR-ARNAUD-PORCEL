# Supabase Native SaaS Template

Next.js 15 avec Supabase Auth native, Row Level Security (RLS), et Stripe.

## Stack

- **Framework**: Next.js 15 (App Router)
- **Auth**: Supabase Auth native avec @supabase/ssr
- **Database**: Supabase PostgreSQL avec RLS
- **Payments**: Stripe
- **Styling**: TailwindCSS 4

## Fonctionnalités

### Authentication
- ✅ Login/Register avec email/password
- ✅ SSR avec cookies (session persistante)
- ✅ MFA (TOTP) avec authenticator app
- ✅ Middleware de protection des routes

### Sécurité
- ✅ Row Level Security (RLS) sur toutes les tables
- ✅ Fonction `is_user_authenticated()` pour vérifier MFA
- ✅ Policies par utilisateur pour le storage
- ✅ Service role pour les webhooks

### Paiements
- ✅ Stripe Checkout
- ✅ Webhooks pour subscription lifecycle
- ✅ Gestion des statuts (active, canceled, past_due)

## Installation

```bash
# Cloner
npx create-next-app@latest my-app --example https://github.com/ultra-create/supabase-native

# Installer
cd my-app
npm install

# Configuration
cp .env.example .env.local
# Remplir les variables

# Supabase local (optionnel)
supabase start
supabase db push

# Dev
npm run dev
```

## Configuration Supabase

### 1. Créer un projet
Aller sur [supabase.com](https://supabase.com) et créer un projet.

### 2. Appliquer les migrations
```bash
# Via Supabase CLI
supabase link --project-ref your-project-ref
supabase db push
```

### 3. Activer MFA
Dans le dashboard Supabase:
- Authentication → Providers → MFA
- Activer TOTP

### 4. Créer le bucket storage
Dans le dashboard:
- Storage → Create bucket → `files` (private)

## Configuration Stripe

### 1. Clés API
Copier les clés depuis le dashboard Stripe vers `.env.local`

### 2. Webhook
```bash
# Local testing
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Production
# Ajouter le webhook dans le dashboard Stripe avec l'URL:
# https://your-domain.com/api/webhooks/stripe
```

## Structure

```
src/
├── app/
│   ├── (auth)/           # Login, register, MFA setup
│   ├── (dashboard)/      # Protected routes
│   └── api/webhooks/     # Stripe webhooks
├── components/
│   └── auth/             # Auth components
└── lib/
    └── supabase/
        ├── client.ts     # Browser client
        ├── server.ts     # SSR client
        ├── middleware.ts # Session update
        └── unified.ts    # Abstraction class

supabase/
├── config.toml           # Supabase CLI config
└── migrations/
    ├── 001_mfa_function.sql
    ├── 002_storage_bucket.sql
    └── 003_profiles_table.sql
```

## Différences avec le template `saas`

| Aspect | supabase-native | saas |
|--------|-----------------|------|
| Auth | Supabase native | Clerk |
| MFA | TOTP natif | Via Clerk |
| ORM | Supabase direct | Prisma |
| RLS | ✅ Migrations SQL | ❌ Non |
| SSR | @supabase/ssr | Basic client |
| Storage | Supabase Storage | Vercel Blob |

## Commandes

```bash
# Dev
npm run dev

# Build
npm run build

# Generate types
npm run db:generate

# Push migrations
npm run db:migrate

# Reset database
npm run db:reset
```

---

*Template ULTRA-CREATE v27.0 - Supabase Native SaaS*
