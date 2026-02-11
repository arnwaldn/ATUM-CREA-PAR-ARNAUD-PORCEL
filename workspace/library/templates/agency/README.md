# {{APP_NAME}} - Agence Digitale

> Template ULTRA-CREATE - Site agence creative moderne

## Stack

- **Framework**: Next.js 15 (App Router + Turbopack)
- **UI**: TailwindCSS 4
- **Animations**: CSS transitions
- **Fonts**: Plus Jakarta Sans + DM Sans
- **Icons**: Lucide React

## Fonctionnalites

- Hero section impactant avec gradient
- Section services avec icons
- Portfolio / Case studies avec hover effects
- Presentation equipe avec social links
- Grille tarifaire
- Formulaire de contact
- Design moderne avec degrade violet/rose

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
│   ├── page.tsx        # Page complete
│   └── globals.css     # Theme violet/rose
└── lib/
    └── utils.ts        # Types services, cases, team, pricing
```

## Personnalisation

### Couleurs
Theme violet/rose avec gradient dans `src/app/globals.css`

### Services
Modifier le tableau `services` dans `page.tsx`

### Portfolio
Ajouter/modifier les case studies dans `caseStudies`

### Equipe
Personnaliser `team` avec vos membres

### Tarifs
Adapter les plans dans `pricing`

---

*Genere par ULTRA-CREATE v22.3*
