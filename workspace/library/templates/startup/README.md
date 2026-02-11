# {{APP_NAME}} - Startup Landing

> Template ULTRA-CREATE - Landing page startup SaaS moderne

## Stack

- **Framework**: Next.js 15 (App Router + Turbopack)
- **UI**: TailwindCSS 4
- **Animations**: CSS transitions + glow effects
- **Fonts**: Inter + Outfit
- **Icons**: Lucide React

## Fonctionnalites

- Hero avec badge announcement et CTA
- Section features en grid
- Pricing avec toggle mensuel/annuel
- Testimonials clients
- FAQ accordion
- Waitlist / Newsletter signup
- Stats et logos partenaires
- Design moderne bleu tech

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
│   ├── page.tsx        # Landing complete
│   └── globals.css     # Theme bleu tech
└── lib/
    └── utils.ts        # Types features, pricing, testimonials, FAQ
```

## Personnalisation

### Couleurs
Theme bleu avec glow effect dans `src/app/globals.css`

### Features
Modifier le tableau `features` dans `page.tsx`

### Pricing
Adapter les plans dans `pricing` avec toggle annuel (-20%)

### Testimonials
Personnaliser les temoignages dans `testimonials`

### FAQ
Ajouter vos questions dans `faqs`

### Stats
Modifier les chiffres cles dans `stats`

---

*Genere par ULTRA-CREATE v22.3*
