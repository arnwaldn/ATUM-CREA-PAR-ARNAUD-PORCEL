---
description: "Scaffold projet optimise avec structure best practices 2025"
---

# Mode SCAFFOLD Active

Scaffold projet: **$ARGUMENTS**

## STACK PAR DEFAUT (2025)

| Composant | Technologie |
|-----------|-------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5.7 strict |
| Styling | TailwindCSS 4 + shadcn/ui |
| Database | Supabase (si necessaire) |
| Auth | Clerk ou Supabase Auth |
| Payments | Stripe (si necessaire) |

## STRUCTURE STANDARD

```
project/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   ├── globals.css         # Global styles
│   │   ├── (auth)/             # Auth group
│   │   │   ├── sign-in/
│   │   │   └── sign-up/
│   │   ├── (dashboard)/        # Protected group
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   └── api/                # API routes
│   │       └── [...]/route.ts
│   ├── components/
│   │   ├── ui/                 # shadcn components
│   │   ├── layout/             # Layout components
│   │   └── features/           # Feature components
│   ├── lib/
│   │   ├── utils.ts            # Utilities
│   │   ├── supabase.ts         # DB client
│   │   └── stripe.ts           # Payment client
│   ├── hooks/                  # Custom hooks
│   └── types/                  # TypeScript types
├── public/                     # Static assets
├── prisma/                     # If using Prisma
│   └── schema.prisma
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
└── .env.local
```

## FICHIERS A CREER

### 1. Configuration de base
- `package.json` avec dependencies 2025
- `tsconfig.json` strict
- `tailwind.config.ts`
- `next.config.ts`
- `.env.local` template

### 2. App structure
- `src/app/layout.tsx` - Root layout
- `src/app/page.tsx` - Home page
- `src/app/globals.css` - Styles

### 3. Components de base
- `src/components/ui/` - shadcn components
- `src/lib/utils.ts` - cn() helper

### 4. Types
- `src/types/index.ts` - Types globaux

## DEPENDENCIES 2025

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "tailwindcss": "^4.0.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0"
  },
  "devDependencies": {
    "typescript": "^5.7.0",
    "@types/react": "^19.0.0",
    "@types/node": "^22.0.0"
  }
}
```

## GO!

Cree la structure de base pour ce projet.
