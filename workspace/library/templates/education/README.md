# {{APP_NAME}} - Education

> Template ULTRA-CREATE - Plateforme e-learning moderne

## Stack

- **Framework**: Next.js 15 (App Router + Turbopack)
- **UI**: TailwindCSS 4 + shadcn/ui
- **Database**: Supabase
- **Video**: Mux (optionnel)
- **Icons**: Lucide React

## Fonctionnalites

- Catalogue cours avec filtres
- Progression utilisateur
- Quiz et exercices
- Certificats
- Dashboard etudiant
- Design educatif moderne

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
│   ├── page.tsx        # Catalogue cours
│   ├── course/[id]/    # Detail cours
│   ├── learn/          # Lecture video
│   └── dashboard/      # Espace etudiant
├── components/
│   ├── ui/             # Composants shadcn
│   ├── course/         # Cards, player
│   └── quiz/           # Questions
└── lib/
    ├── utils.ts        # Types + formatters
    └── supabase.ts     # Client DB
```

## Personnalisation

### Couleurs
Theme violet educatif dans `src/app/globals.css`

### Cours
Modifier le tableau `courses` ou connecter a la DB

---

*Genere par ULTRA-CREATE v22.3*
