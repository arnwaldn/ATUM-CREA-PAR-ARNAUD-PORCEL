# {{APP_NAME}} - Blog

> Template ULTRA-CREATE - Blog moderne avec MDX

## Stack

- **Framework**: Next.js 15 (App Router + Turbopack)
- **UI**: TailwindCSS 4
- **Content**: MDX / Contentlayer
- **Fonts**: Merriweather + Inter
- **Icons**: Lucide React

## Fonctionnalites

- Articles avec Markdown/MDX
- Recherche full-text
- Filtrage par categorie
- Temps de lecture calcule
- Newsletter subscription
- RSS feed
- Design editorial elegant

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
│   ├── page.tsx        # Liste articles
│   └── post/[slug]/    # Article complet
├── components/
│   ├── post/           # Cards, content
│   └── newsletter/     # Form subscription
├── content/
│   └── posts/          # Fichiers MDX
└── lib/
    └── utils.ts        # Types + helpers
```

## Personnalisation

### Couleurs
Theme neutre avec accent rose dans `src/app/globals.css`

### Articles
Ajouter des fichiers `.mdx` dans `content/posts/`

### Newsletter
Integrer avec Mailchimp, ConvertKit, etc.

---

*Genere par ULTRA-CREATE v22.3*
