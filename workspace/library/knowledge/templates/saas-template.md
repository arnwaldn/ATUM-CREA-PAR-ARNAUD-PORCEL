# Template: SaaS Application

## Overview

Template complet pour créer une application SaaS (Software as a Service) avec authentification, facturation, dashboard, et gestion multi-tenant.

---

## STACK TECHNIQUE

| Couche | Technologie | Raison |
|--------|-------------|--------|
| **Framework** | Next.js 15 (App Router) | SSR, RSC, API Routes |
| **Auth** | Clerk | Auth complète, multi-tenant ready |
| **Database** | Supabase (PostgreSQL) | Realtime, Row Level Security |
| **ORM** | Prisma | Type-safe queries |
| **Payments** | Stripe | Subscriptions, invoices |
| **UI** | shadcn/ui + TailwindCSS | Composants accessibles |
| **Email** | Resend | Transactional emails |
| **Deploy** | Vercel | Edge functions, analytics |

---

## STRUCTURE PROJET

```
my-saas/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   │   ├── sign-up/[[...sign-up]]/page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx              # Main dashboard
│   │   │   │   ├── settings/page.tsx     # User settings
│   │   │   │   ├── billing/page.tsx      # Subscription management
│   │   │   │   └── team/page.tsx         # Team management
│   │   │   └── layout.tsx                # Dashboard layout (sidebar)
│   │   │
│   │   ├── (marketing)/
│   │   │   ├── page.tsx                  # Landing page
│   │   │   ├── pricing/page.tsx          # Pricing page
│   │   │   ├── about/page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── api/
│   │   │   ├── webhooks/
│   │   │   │   ├── stripe/route.ts       # Stripe webhooks
│   │   │   │   └── clerk/route.ts        # Clerk webhooks
│   │   │   └── [...]/route.ts            # API routes
│   │   │
│   │   ├── layout.tsx                    # Root layout
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── ui/                           # shadcn/ui components
│   │   ├── dashboard/                    # Dashboard-specific
│   │   │   ├── sidebar.tsx
│   │   │   ├── header.tsx
│   │   │   └── stats-cards.tsx
│   │   ├── marketing/                    # Landing page components
│   │   │   ├── hero.tsx
│   │   │   ├── features.tsx
│   │   │   └── pricing-table.tsx
│   │   └── shared/                       # Shared components
│   │       ├── logo.tsx
│   │       └── user-button.tsx
│   │
│   ├── lib/
│   │   ├── db.ts                         # Prisma client
│   │   ├── stripe.ts                     # Stripe client
│   │   ├── utils.ts                      # Utilities (cn, etc)
│   │   └── validations/                  # Zod schemas
│   │
│   ├── hooks/
│   │   ├── use-subscription.ts
│   │   └── use-user.ts
│   │
│   └── types/
│       └── index.ts
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── public/
├── .env.local
├── package.json
├── tailwind.config.ts
└── next.config.js
```

---

## MODÈLES DE DONNÉES

### Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// User synced from Clerk
model User {
  id        String   @id // Clerk user ID
  email     String   @unique
  name      String?
  imageUrl  String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  organizations OrganizationMember[]
  subscription  Subscription?

  @@map("users")
}

// Multi-tenant organization
model Organization {
  id        String   @id @default(cuid())
  name      String
  slug      String   @unique
  logoUrl   String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  members      OrganizationMember[]
  subscription Subscription?

  @@map("organizations")
}

// Organization membership
model OrganizationMember {
  id             String       @id @default(cuid())
  role           Role         @default(MEMBER)
  userId         String
  organizationId String
  createdAt      DateTime     @default(now())

  user         User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  @@unique([userId, organizationId])
  @@map("organization_members")
}

enum Role {
  OWNER
  ADMIN
  MEMBER
}

// Stripe subscription
model Subscription {
  id                   String   @id @default(cuid())
  stripeCustomerId     String   @unique
  stripeSubscriptionId String?  @unique
  stripePriceId        String?
  stripeCurrentPeriodEnd DateTime?
  status               SubscriptionStatus @default(INACTIVE)
  plan                 Plan     @default(FREE)

  userId         String?       @unique
  organizationId String?       @unique
  user           User?         @relation(fields: [userId], references: [id], onDelete: Cascade)
  organization   Organization? @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("subscriptions")
}

enum SubscriptionStatus {
  ACTIVE
  INACTIVE
  PAST_DUE
  CANCELED
  TRIALING
}

enum Plan {
  FREE
  PRO
  ENTERPRISE
}
```

---

## COMPOSANTS CLÉS

### 1. Dashboard Layout

```tsx
// src/app/(dashboard)/layout.tsx
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
```

### 2. Pricing Component

```tsx
// src/components/marketing/pricing-table.tsx
"use client"

import { useState } from "react"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const plans = [
  {
    name: "Free",
    price: { monthly: 0, yearly: 0 },
    features: [
      "Up to 3 projects",
      "Basic analytics",
      "Email support",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    price: { monthly: 29, yearly: 290 },
    features: [
      "Unlimited projects",
      "Advanced analytics",
      "Priority support",
      "Custom integrations",
      "Team collaboration",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: { monthly: 99, yearly: 990 },
    features: [
      "Everything in Pro",
      "Dedicated support",
      "Custom contracts",
      "SLA guarantee",
      "SSO/SAML",
    ],
    cta: "Contact Sales",
    popular: false,
  },
]

export function PricingTable() {
  const [interval, setInterval] = useState<"monthly" | "yearly">("monthly")

  return (
    <div className="py-24">
      {/* Interval Toggle */}
      <div className="flex justify-center mb-12">
        <div className="inline-flex rounded-lg border p-1">
          <button
            onClick={() => setInterval("monthly")}
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium transition",
              interval === "monthly"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground"
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setInterval("yearly")}
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium transition",
              interval === "yearly"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground"
            )}
          >
            Yearly (Save 20%)
          </button>
        </div>
      </div>

      {/* Plans */}
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={cn(
              "rounded-2xl border p-8",
              plan.popular && "border-primary shadow-lg scale-105"
            )}
          >
            {plan.popular && (
              <span className="bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full">
                Most Popular
              </span>
            )}
            <h3 className="text-2xl font-bold mt-4">{plan.name}</h3>
            <div className="mt-4">
              <span className="text-4xl font-bold">
                ${plan.price[interval]}
              </span>
              <span className="text-muted-foreground">
                /{interval === "monthly" ? "mo" : "yr"}
              </span>
            </div>
            <ul className="mt-8 space-y-4">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-primary" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Button
              className="w-full mt-8"
              variant={plan.popular ? "default" : "outline"}
            >
              {plan.cta}
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
```

### 3. Stripe Webhook Handler

```typescript
// src/app/api/webhooks/stripe/route.ts
import { headers } from "next/headers"
import { NextResponse } from "next/server"
import Stripe from "stripe"
import { db } from "@/lib/db"
import { stripe } from "@/lib/stripe"

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get("Stripe-Signature") as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    return new NextResponse("Webhook Error", { status: 400 })
  }

  const session = event.data.object as Stripe.Checkout.Session

  switch (event.type) {
    case "checkout.session.completed":
      // Create or update subscription
      await db.subscription.upsert({
        where: { stripeCustomerId: session.customer as string },
        create: {
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.subscription as string,
          userId: session.metadata?.userId,
          status: "ACTIVE",
          plan: session.metadata?.plan as any || "PRO",
        },
        update: {
          stripeSubscriptionId: session.subscription as string,
          status: "ACTIVE",
          plan: session.metadata?.plan as any || "PRO",
        },
      })
      break

    case "invoice.payment_succeeded":
      // Update subscription period
      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      )
      await db.subscription.update({
        where: { stripeSubscriptionId: subscription.id },
        data: {
          stripePriceId: subscription.items.data[0].price.id,
          stripeCurrentPeriodEnd: new Date(
            subscription.current_period_end * 1000
          ),
        },
      })
      break

    case "customer.subscription.deleted":
      // Handle cancellation
      await db.subscription.update({
        where: { stripeSubscriptionId: session.id },
        data: { status: "CANCELED" },
      })
      break
  }

  return new NextResponse(null, { status: 200 })
}
```

---

## CONFIGURATION

### Environment Variables

```env
# .env.local

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Database
DATABASE_URL=postgresql://...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Resend
RESEND_API_KEY=re_...
```

### Package.json Dependencies

```json
{
  "dependencies": {
    "@clerk/nextjs": "^5.0.0",
    "@prisma/client": "^5.0.0",
    "@radix-ui/react-*": "latest",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "lucide-react": "^0.400.0",
    "next": "15.0.0",
    "react": "19.0.0",
    "react-dom": "19.0.0",
    "resend": "^3.0.0",
    "stripe": "^14.0.0",
    "tailwind-merge": "^2.0.0",
    "tailwindcss-animate": "^1.0.7",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "autoprefixer": "^10",
    "postcss": "^8",
    "prisma": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5"
  }
}
```

---

## FEATURES INCLUSES

### MVP (Phase 1)
- [x] Landing page avec hero, features, pricing
- [x] Auth complète (sign-in, sign-up, forgot password)
- [x] Dashboard avec sidebar navigation
- [x] User settings (profile, password)
- [x] Stripe checkout integration
- [x] Webhook handling

### Phase 2
- [ ] Team/Organization management
- [ ] Role-based access control
- [ ] Billing history & invoices
- [ ] Email notifications (Resend)
- [ ] Usage analytics

### Phase 3
- [ ] API keys management
- [ ] Webhooks configuration
- [ ] Audit logs
- [ ] SSO/SAML (Enterprise)
- [ ] Custom domains

---

## COMMANDES DE GÉNÉRATION

```bash
# Créer un nouveau SaaS
/create saas MonSaaS

# Avec options spécifiques
/create saas MonSaaS --with-teams --with-api

# Ajouter une feature à un SaaS existant
/generate feature billing
/generate feature teams
/generate feature api-keys
```

---

## CUSTOMISATION

### Modifier le pricing

```typescript
// src/config/pricing.ts
export const PLANS = {
  free: {
    name: "Free",
    price: 0,
    limits: {
      projects: 3,
      storage: "100MB",
      apiCalls: 1000,
    },
  },
  pro: {
    name: "Pro",
    price: 29,
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID,
    limits: {
      projects: -1, // Unlimited
      storage: "10GB",
      apiCalls: 100000,
    },
  },
  enterprise: {
    name: "Enterprise",
    price: 99,
    stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
    limits: {
      projects: -1,
      storage: "100GB",
      apiCalls: -1,
    },
  },
}
```

### Ajouter des features au dashboard

```tsx
// Ajouter une nouvelle page dashboard
// src/app/(dashboard)/dashboard/analytics/page.tsx

import { getAnalytics } from "@/lib/analytics"

export default async function AnalyticsPage() {
  const analytics = await getAnalytics()

  return (
    <div>
      <h1>Analytics</h1>
      {/* Charts et données */}
    </div>
  )
}
```

---

## DÉPLOIEMENT

### Vercel (Recommandé)

```bash
# 1. Push to GitHub
git push origin main

# 2. Connect to Vercel
vercel link

# 3. Set environment variables in Vercel dashboard

# 4. Deploy
vercel --prod
```

### Checklist Production

- [ ] Toutes les env vars configurées
- [ ] Stripe webhooks pointent vers prod URL
- [ ] Clerk production instance créée
- [ ] Database en mode production
- [ ] Domaine custom configuré
- [ ] SSL activé
- [ ] Analytics configurés

---

**Version:** 1.0
**Stack:** Next.js 15 + Clerk + Stripe + Supabase
**Temps estimé:** 2-4 heures pour MVP
