# {{APP_NAME}} - Admin Dashboard

> Template ULTRA-CREATE - Dashboard administratif moderne

## Stack

- **Framework**: Next.js 15 (App Router + Turbopack)
- **UI**: TailwindCSS 4 + shadcn/ui
- **Charts**: Recharts
- **Tables**: TanStack Table
- **State**: Zustand
- **Icons**: Lucide React

## Fonctionnalites

- Dashboard avec statistiques en temps reel
- Tables de donnees avec pagination, tri et filtres
- Graphiques interactifs (ligne, barre, camembert)
- Gestion utilisateurs CRUD
- Mode sombre/clair
- Sidebar responsive
- Notifications
- Recherche globale

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
│   ├── page.tsx        # Dashboard
│   ├── users/          # Gestion utilisateurs
│   ├── orders/         # Gestion commandes
│   ├── analytics/      # Analytiques
│   └── settings/       # Parametres
├── components/
│   ├── ui/             # Composants shadcn
│   ├── charts/         # Graphiques
│   ├── tables/         # Tables de donnees
│   └── layout/         # Sidebar, Header
└── lib/
    ├── utils.ts        # Utilitaires
    └── store.ts        # State Zustand
```

## Personnalisation

### Couleurs
Modifier les variables CSS dans `src/app/globals.css`

### Navigation
Modifier le tableau `navigation` dans `src/app/page.tsx`

---

*Genere par ULTRA-CREATE v22.3*
