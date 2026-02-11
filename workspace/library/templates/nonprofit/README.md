# {{APP_NAME}} - Association / Nonprofit

> Template ULTRA-CREATE - Site association caritative moderne

## Stack

- **Framework**: Next.js 15 (App Router + Turbopack)
- **UI**: TailwindCSS 4
- **Fonts**: Source Sans 3 + Merriweather
- **Icons**: Lucide React

## Fonctionnalites

- Hero plein ecran avec image et overlay
- Statistiques d'impact animees
- Presentation mission avec 3 pilliers
- Campagnes de collecte avec progress bar
- Evenements a venir
- Section benevoles
- Formulaire de don avec tiers predefinis
- Newsletter signup
- Design vert emeraude / nature

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
│   ├── page.tsx        # Site complet
│   └── globals.css     # Theme emeraude
└── lib/
    └── utils.ts        # Types Campaign, Event, DonationTier + helpers
```

## Personnalisation

### Couleurs
Theme vert emeraude dans `src/app/globals.css`

### Campagnes
Modifier `campaigns` avec vos collectes en cours

### Evenements
Personnaliser `events` avec vos evenements

### Dons
Adapter les paliers dans `donationTiers`

### Impact
Changer les statistiques dans `impactStats`

## Integration Paiement

Integrer Stripe pour les dons:
1. Installer `@stripe/stripe-js`
2. Creer les endpoints API dans `app/api/`
3. Remplacer le bouton de don par Stripe Checkout

---

*Genere par ULTRA-CREATE v22.3*
