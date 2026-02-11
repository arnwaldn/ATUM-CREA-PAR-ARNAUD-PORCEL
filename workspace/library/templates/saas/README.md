# {{APP_NAME}} - SaaS Template

Template SaaS production-ready avec Next.js 15, Clerk, Stripe et Supabase.

## Stack

- **Framework:** Next.js 15 (App Router)
- **Auth:** Clerk
- **Database:** Supabase + Prisma
- **Paiements:** Stripe
- **UI:** shadcn/ui + Tailwind CSS 4
- **Tests:** Vitest + Playwright

## Installation

```bash
npm install
cp .env.example .env.local
# Configurer les variables d'environnement
npx prisma generate
npx prisma db push
npm run dev
```

## Structure

```
src/
├── app/
│   ├── (auth)/          # Pages login/signup
│   ├── (dashboard)/     # Dashboard protégé
│   └── api/             # API routes
├── components/
│   └── ui/              # Composants shadcn
└── lib/                 # Utilitaires
```

## Variables d'environnement

Voir `.env.example` pour la liste complète.

## Performance Monitoring

Ce template inclut **web-vitals v5** pour Core Web Vitals:
- `src/lib/web-vitals.ts` - Configuration monitoring (5 métriques)
- `src/components/web-vitals-init.tsx` - Client component
- Intégration GA4 automatique si gtag présent
- Voir `knowledge/web-vitals-guide.md` pour configuration avancée

## Déploiement

```bash
npm run build
# Deploy sur Vercel recommandé
```
