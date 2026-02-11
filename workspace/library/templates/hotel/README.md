# {{APP_NAME}} - Hotel

> Template ULTRA-CREATE - Hotel de luxe avec reservation

## Stack

- **Framework**: Next.js 15 (App Router + Turbopack)
- **UI**: TailwindCSS 4 + shadcn/ui
- **Database**: Prisma + Supabase
- **Fonts**: Playfair Display + Lato
- **Icons**: Lucide React

## Fonctionnalites

- Catalogue chambres avec photos
- Barre de recherche dates/voyageurs
- Calendrier disponibilites
- Reservation en ligne
- Services et equipements
- Design luxe elegant

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
│   ├── layout.tsx      # Layout avec fonts
│   ├── page.tsx        # Accueil + Chambres
│   ├── rooms/[id]/     # Detail chambre
│   └── booking/        # Reservation
├── components/
│   ├── ui/             # Composants shadcn
│   ├── rooms/          # Cards chambres
│   └── booking/        # Calendrier, form
└── lib/
    ├── utils.ts        # Types + formatters
    └── prisma.ts       # Client DB
```

## Personnalisation

### Couleurs
Theme ambre/noir luxe dans `src/app/globals.css`

### Chambres
Modifier le tableau `rooms` ou connecter a la DB

---

*Genere par ULTRA-CREATE v22.3*
