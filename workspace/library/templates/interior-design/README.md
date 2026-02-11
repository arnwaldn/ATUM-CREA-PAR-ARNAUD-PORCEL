# {{APP_NAME}} - Interior Design

> Template ULTRA-CREATE - Portfolio architecture d'interieur

## Stack

- **Framework**: Next.js 15 (App Router + Turbopack)
- **UI**: TailwindCSS 4
- **Fonts**: Cormorant Garamond + Montserrat
- **Icons**: Lucide React

## Fonctionnalites

- Galerie projets avec before/after slider
- Filtrage par categorie
- Services presentes
- Formulaire devis
- Design elegant et epure

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
│   ├── page.tsx        # Portfolio
│   └── project/[id]/   # Detail projet
├── components/
│   ├── slider/         # Before/After
│   └── gallery/        # Projets
└── lib/
    └── utils.ts        # Types projet
```

## Personnalisation

### Couleurs
Theme beige/stone dans `src/app/globals.css`

### Projets
Modifier le tableau `projects`

---

*Genere par ULTRA-CREATE v22.3*
