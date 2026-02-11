# {{APP_NAME}} - Photography

> Template ULTRA-CREATE - Portfolio photographe minimaliste

## Stack

- **Framework**: Next.js 15 (App Router + Turbopack)
- **UI**: TailwindCSS 4
- **Images**: Cloudinary (optionnel)
- **Font**: Space Grotesk
- **Icons**: Lucide React

## Fonctionnalites

- Galerie masonry responsive
- Filtrage par categorie
- Lightbox plein ecran
- Navigation clavier
- About et services
- Design minimaliste noir/blanc

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
│   ├── layout.tsx      # Layout minimal
│   ├── page.tsx        # Portfolio
│   └── gallery/[id]/   # Galerie detail
├── components/
│   ├── gallery/        # Masonry + Lightbox
│   └── filters/        # Categories
└── lib/
    └── utils.ts        # Types photo
```

## Personnalisation

### Couleurs
Theme noir/blanc dans `src/app/globals.css`

### Photos
Modifier le tableau `photos` ou integrer Cloudinary

### Categories
Modifier `categories` dans `src/lib/utils.ts`

---

*Genere par ULTRA-CREATE v22.3*
