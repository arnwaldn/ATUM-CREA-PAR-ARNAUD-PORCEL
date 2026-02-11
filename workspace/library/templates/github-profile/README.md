# GitHub Profile README Template

> Template ULTRA-CREATE pour creer des GitHub Profile READMEs professionnels

## Utilisation Rapide

### Option 1: Commande `/profile`
```
/profile                           # Generation interactive
/profile "John Doe" --style=elaborate
/profile --github=username         # Auto-fetch depuis GitHub
```

### Option 2: Copier le template
1. Copier `profile-template.md` dans un repo nomme identique a votre username GitHub
2. Renommer en `README.md`
3. Remplacer les `{{PLACEHOLDERS}}`
4. Push vers GitHub

## Styles Disponibles

| Style | Description | Fichier |
|-------|-------------|---------|
| `elaborate` | Complet avec toutes les sections | `examples/elaborate.md` |
| `minimal` | Minimaliste et epure | `examples/minimal.md` |
| `dynamic` | Avec stats temps reel | `examples/dynamic.md` |
| `code-styled` | Style terminal/code | `examples/code-styled.md` |
| `multimedia` | Avec GIFs et images | `examples/multimedia.md` |
| `tabular` | Format tableau structure | `examples/tabular.md` |
| `default` | Style standard equilibre | `examples/default.md` |

## Sections Modulaires

Combinez les sections selon vos besoins:

| Section | Fichier | Description |
|---------|---------|-------------|
| Header | `sections/header.md` | Greeting + avatar + titre |
| Social | `sections/social-badges.md` | Badges LinkedIn, Twitter, etc. |
| About | `sections/about-me.md` | Bio + Quick Facts |
| Tech | `sections/tech-stack.md` | 50+ badges technologies |
| Stats | `sections/github-stats.md` | Cards stats dynamiques |
| Projects | `sections/projects.md` | Repos mis en avant |
| Contact | `sections/contact.md` | CTA et coordonnees |

## Placeholders

| Placeholder | Description |
|-------------|-------------|
| `{{USERNAME}}` | Votre username GitHub |
| `{{NAME}}` | Votre nom complet |
| `{{TITLE}}` | Votre titre/role |
| `{{BIO}}` | Description courte |
| `{{COMPANY}}` | Entreprise actuelle |
| `{{LOCATION}}` | Localisation |
| `{{WEBSITE}}` | URL site perso |
| `{{LINKEDIN}}` | Username LinkedIn |
| `{{TWITTER}}` | Username Twitter |
| `{{EMAIL}}` | Email contact |

## Personnalisation Badges Tech

### Format shields.io
```markdown
![Tech](https://img.shields.io/badge/-NomTech-couleur?style=flat-square&logo=nomlogo)
```

### Couleurs populaires
- JavaScript: `F7DF1E`
- TypeScript: `3178C6`
- Python: `3776AB`
- React: `61DAFB`
- Node.js: `339933`
- AWS: `232F3E`

## GitHub Stats Cards

### Stats generales
```markdown
![Stats](https://github-readme-stats.vercel.app/api?username={{USERNAME}}&show_icons=true&theme=dark)
```

### Langages les plus utilises
```markdown
![Languages](https://github-readme-stats.vercel.app/api/top-langs/?username={{USERNAME}}&layout=compact&theme=dark)
```

### Streak Stats
```markdown
![Streak](https://streak-stats.demolab.com/?user={{USERNAME}}&theme=dark)
```

### Trophees
```markdown
![Trophies](https://github-profile-trophy.vercel.app/?username={{USERNAME}}&theme=darkhub&no-frame=true)
```

## Ressources

- [shields.io](https://shields.io) - Badges personnalises
- [simple-icons](https://simpleicons.org) - Logos technologies
- [github-readme-stats](https://github.com/anuraghazra/github-readme-stats) - Stats cards
- [streak-stats](https://streak-stats.demolab.com) - Streak cards
- [github-profile-trophy](https://github.com/ryo-ma/github-profile-trophy) - Trophees

---

*Genere par ULTRA-CREATE v22.4*
