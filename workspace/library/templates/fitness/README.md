# {{APP_NAME}} - Fitness Center

> Template ULTRA-CREATE - Salle de sport avec abonnements

## Stack

- **Framework**: Next.js 15 (App Router + Turbopack)
- **UI**: TailwindCSS 4 + shadcn/ui
- **Payments**: Stripe
- **Icons**: Lucide React

## Fonctionnalites

- Planning cours dynamique
- Filtrage par categorie/niveau
- Systeme de reservation
- Grille tarifaire avec abonnements
- Profils coachs
- Design sportif et dynamique

## Installation

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

## Structure

```
src/
├── app/
│   ├── layout.tsx      # Layout principal
│   ├── page.tsx        # Accueil + Planning
│   ├── classes/        # Tous les cours
│   ├── pricing/        # Abonnements
│   └── booking/        # Reservations
├── components/
│   ├── ui/             # Composants shadcn
│   ├── schedule/       # Planning
│   └── pricing/        # Cards tarifs
└── lib/
    ├── utils.ts        # Types + formatters
    └── stripe.ts       # Client Stripe
```

## Personnalisation

### Couleurs
Theme vert/noir sportif dans `src/app/globals.css`

### Cours
Modifier le tableau `classes` dans `src/app/page.tsx`

### Tarifs
Modifier le tableau `memberships`

---

*Genere par ULTRA-CREATE v22.3*
