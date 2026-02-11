# Next.js SaaS Template

## Stack
- Next.js 15 (App Router)
- TypeScript
- TailwindCSS + shadcn/ui
- Supabase (Auth + Database)
- Stripe (Payments)
- Prisma (ORM)

## Structure
```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/page.tsx
│   │   ├── settings/page.tsx
│   │   ├── billing/page.tsx
│   │   └── layout.tsx
│   ├── (marketing)/
│   │   ├── page.tsx
│   │   ├── pricing/page.tsx
│   │   └── layout.tsx
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── stripe/webhook/route.ts
│   │   └── users/route.ts
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/           # shadcn components
│   ├── auth/         # Auth forms
│   ├── dashboard/    # Dashboard components
│   ├── marketing/    # Landing page components
│   └── billing/      # Stripe components
├── lib/
│   ├── supabase.ts
│   ├── stripe.ts
│   ├── prisma.ts
│   └── utils.ts
├── hooks/
├── stores/
└── types/
```

## Features
- [x] Authentication (Email, OAuth)
- [x] User dashboard
- [x] Subscription plans
- [x] Stripe checkout
- [x] Billing portal
- [x] Team management
- [x] Settings page
- [x] Dark mode
- [x] Responsive design

## Environment Variables
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Commands
```bash
pnpm dev          # Development
pnpm build        # Production build
pnpm test         # Run tests
pnpm db:push      # Push schema to database
pnpm db:studio    # Open Prisma Studio
```
