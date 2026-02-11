# {{APP_NAME}} - Real Estate

> Template ULTRA-CREATE - Portail immobilier moderne

## Stack

- **Framework**: Next.js 15 (App Router + Turbopack)
- **UI**: TailwindCSS 4 + shadcn/ui
- **Maps**: Mapbox GL (optionnel)
- **Database**: Prisma + Supabase
- **Icons**: Lucide React

## Fonctionnalites

- Listings propriétés avec photos
- Recherche avancée (type, prix, ville)
- Filtres dynamiques
- Favoris utilisateur
- Carte interactive (optionnel)
- Formulaire de contact
- Design responsive

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
│   ├── page.tsx        # Listings
│   ├── property/[id]/  # Détail bien
│   └── search/         # Recherche avancée
├── components/
│   ├── ui/             # Composants shadcn
│   ├── property/       # Cards, galerie
│   └── search/         # Filtres, carte
└── lib/
    ├── utils.ts        # Types + formatters
    └── prisma.ts       # Client DB
```

## Personnalisation

### Couleurs
Thème bleu professionnel dans `src/app/globals.css`

### Propriétés
Modifier le tableau `properties` ou connecter à Supabase/Prisma

---

*Genere par ULTRA-CREATE v22.3*
