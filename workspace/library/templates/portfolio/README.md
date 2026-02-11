# {{APP_NAME}} - Portfolio

> Template ULTRA-CREATE - Portfolio developpeur moderne

## Stack

- **Framework**: Next.js 15 (App Router + Turbopack)
- **UI**: TailwindCSS 4
- **Fonts**: Inter + JetBrains Mono
- **Icons**: Lucide React

## Fonctionnalites

- Presentation personnelle
- Projets avec tags et liens
- Competences avec barres de progression
- Timeline experience
- Mode sombre/clair
- Liens reseaux sociaux
- Design developpeur moderne

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
│   ├── page.tsx        # Portfolio complet
│   └── blog/           # Articles (optionnel)
├── components/
│   ├── projects/       # Cards projets
│   └── skills/         # Barres progression
└── lib/
    └── utils.ts        # Types portfolio
```

## Personnalisation

### Couleurs
Theme bleu/violet dans `src/app/globals.css`

### Contenu
Modifier les tableaux `projects`, `skills`, `experiences`

### Reseaux sociaux
Modifier les liens dans le Hero

---

*Genere par ULTRA-CREATE v22.3*
