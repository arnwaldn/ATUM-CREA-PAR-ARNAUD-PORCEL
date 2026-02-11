# {{APP_NAME}}

Boutique e-commerce créée avec ULTRA-CREATE.

## Stack

- **Next.js 15** - Framework React
- **TypeScript 5.7** - Typage statique
- **TailwindCSS** - Styling
- **Supabase** - Backend (Auth + Database)
- **Stripe** - Paiements
- **Prisma 6** - ORM

## Installation

```bash
npm install
npx prisma generate
npx prisma db push
```

## Configuration

1. Copier `.env.example` vers `.env`
2. Configurer Supabase et Stripe

## Développement

```bash
npm run dev
```

## Structure

```
src/
├── app/
│   ├── page.tsx           # Accueil
│   ├── (shop)/            # Pages boutique
│   └── api/stripe/        # API Stripe
├── components/            # UI Components
├── lib/                   # Utilitaires
└── prisma/                # Schema DB
```

## Performance Monitoring

Ce template inclut **web-vitals v5** pour Core Web Vitals:
- `src/lib/web-vitals.ts` - Configuration monitoring + alertes
- `src/components/web-vitals-init.tsx` - Client component
- Alertes automatiques si performance "poor" (Sentry compatible)
- Voir `knowledge/web-vitals-guide.md` pour configuration avancée

---

Généré par ULTRA-CREATE v24.1
