# {{APP_NAME}} - Restaurant

> Template ULTRA-CREATE - Site restaurant moderne avec réservation

## Stack

- **Framework**: Next.js 15 (App Router + Turbopack)
- **UI**: TailwindCSS 4 + shadcn/ui
- **QR Code**: qrcode.react
- **Icons**: Lucide React
- **Backend**: Supabase (optionnel)

## Fonctionnalites

- Menu digital avec catégories
- Système de réservation en ligne
- QR Code pour menu mobile
- Horaires d'ouverture
- Localisation et contact
- Galerie photos
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
│   ├── layout.tsx      # Layout avec fonts
│   ├── page.tsx        # Page principale
│   ├── menu/           # Menu complet
│   └── reservation/    # Gestion réservations
├── components/
│   ├── ui/             # Composants shadcn
│   ├── menu/           # Affichage menu
│   └── reservation/    # Formulaire résa
└── lib/
    ├── utils.ts        # Utilitaires
    └── supabase.ts     # Client Supabase
```

## Personnalisation

### Couleurs
Modifier les variables CSS dans `src/app/globals.css`
Thème chaud et accueillant par défaut (ambre/or)

### Menu
Modifier le tableau `menuCategories` dans `src/app/page.tsx`

### Horaires
Modifier le tableau `openingHours` dans `src/app/page.tsx`

---

*Genere par ULTRA-CREATE v22.3*
