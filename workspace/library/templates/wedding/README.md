# {{APP_NAME}} - Wedding

> Template ULTRA-CREATE - Site de mariage elegant avec RSVP

## Stack

- **Framework**: Next.js 15 (App Router + Turbopack)
- **UI**: TailwindCSS 4 + shadcn/ui
- **Fonts**: Playfair Display + Cormorant Garamond
- **Icons**: Lucide React

## Fonctionnalites

- Compte a rebours dynamique
- Notre histoire (timeline couple)
- Lieu et programme du jour
- Galerie photos
- Formulaire RSVP complet
- Liste de mariage
- Design romantique et elegant

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
│   └── rsvp/           # Gestion RSVPs
├── components/
│   ├── ui/             # Composants shadcn
│   ├── countdown/      # Timer
│   └── gallery/        # Lightbox
└── lib/
    └── utils.ts        # Countdown + formatters
```

## Personnalisation

### Couleurs
Theme rose/ambre dans `src/app/globals.css`

### Date du mariage
Modifier `weddingDate` dans `src/app/page.tsx`

### Contenu
- Noms des maries
- Histoire du couple
- Lieux et horaires
- Photos galerie

---

*Genere par ULTRA-CREATE v22.3*
