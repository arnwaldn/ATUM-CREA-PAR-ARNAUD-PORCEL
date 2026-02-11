# {{APP_NAME}} - Medical Center

> Template ULTRA-CREATE - Centre medical avec prise de RDV

## Stack

- **Framework**: Next.js 15 (App Router + Turbopack)
- **UI**: TailwindCSS 4 + shadcn/ui
- **Auth**: Supabase Auth
- **Database**: Supabase
- **Icons**: Lucide React

## Fonctionnalites

- Prise de rendez-vous en ligne
- Profils médecins par spécialité
- Choix consultation / téléconsultation
- Créneaux horaires dynamiques
- Portail patient (auth)
- Design médical professionnel

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
│   ├── page.tsx        # Accueil + RDV
│   ├── doctors/        # Liste médecins
│   ├── booking/        # Prise RDV
│   └── patient/        # Espace patient
├── components/
│   ├── ui/             # Composants shadcn
│   ├── booking/        # Calendrier, slots
│   └── doctors/        # Cards, profils
└── lib/
    ├── utils.ts        # Types + formatters
    └── supabase.ts     # Client Supabase
```

## Personnalisation

### Couleurs
Thème cyan médical dans `src/app/globals.css`

### Médecins
Modifier le tableau `doctors` ou connecter à Supabase

### Créneaux
Modifier `timeSlots` pour ajuster les disponibilités

---

*Genere par ULTRA-CREATE v22.3*
