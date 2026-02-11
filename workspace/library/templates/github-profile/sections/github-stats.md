# GitHub Stats Section

## Stats Generales

### Card de base
```markdown
![GitHub Stats](https://github-readme-stats.vercel.app/api?username={{USERNAME}}&show_icons=true&theme=dark)
```

### Options disponibles
```markdown
![Stats](https://github-readme-stats.vercel.app/api?username={{USERNAME}}&show_icons=true&theme=dark&hide_border=true&include_all_commits=true&count_private=true)
```

| Parametre | Valeurs | Description |
|-----------|---------|-------------|
| `show_icons` | true/false | Afficher les icones |
| `theme` | dark, radical, tokyonight, etc. | Theme |
| `hide_border` | true/false | Masquer la bordure |
| `include_all_commits` | true/false | Tous les commits |
| `count_private` | true/false | Repos prives |
| `hide` | stars,commits,prs,issues | Masquer elements |

## Langages les Plus Utilises

### Layout compact
```markdown
![Top Languages](https://github-readme-stats.vercel.app/api/top-langs/?username={{USERNAME}}&layout=compact&theme=dark)
```

### Layout donut
```markdown
![Top Languages](https://github-readme-stats.vercel.app/api/top-langs/?username={{USERNAME}}&layout=donut&theme=dark)
```

### Exclure des langages
```markdown
![Top Languages](https://github-readme-stats.vercel.app/api/top-langs/?username={{USERNAME}}&exclude_repo=repo1,repo2&hide=html,css)
```

## Streak Stats

```markdown
![GitHub Streak](https://streak-stats.demolab.com/?user={{USERNAME}}&theme=dark&hide_border=true)
```

### Themes populaires
- `dark` - Sombre
- `radical` - Rose/violet
- `tokyonight` - Bleu nuit
- `dracula` - Violet
- `gruvbox` - Orange/marron

## Trophees GitHub

```markdown
![Trophies](https://github-profile-trophy.vercel.app/?username={{USERNAME}}&theme=darkhub&no-frame=true&row=1)
```

### Options trophees
```markdown
![Trophies](https://github-profile-trophy.vercel.app/?username={{USERNAME}}&theme=darkhub&no-frame=true&margin-w=15&column=7)
```

## Activity Graph

```markdown
![Activity Graph](https://github-readme-activity-graph.vercel.app/graph?username={{USERNAME}}&theme=github-dark&hide_border=true)
```

## Profile Views Counter

```markdown
![Profile Views](https://komarev.com/ghpvc/?username={{USERNAME}}&color=blueviolet&style=flat-square)
```

## Repo Pin Cards

### Single repo
```markdown
[![Repo](https://github-readme-stats.vercel.app/api/pin/?username={{USERNAME}}&repo={{REPO}}&theme=dark)](https://github.com/{{USERNAME}}/{{REPO}})
```

### Multiple repos (cote a cote)
```markdown
<p align="center">
  <a href="https://github.com/{{USERNAME}}/{{REPO1}}">
    <img src="https://github-readme-stats.vercel.app/api/pin/?username={{USERNAME}}&repo={{REPO1}}&theme=dark" />
  </a>
  <a href="https://github.com/{{USERNAME}}/{{REPO2}}">
    <img src="https://github-readme-stats.vercel.app/api/pin/?username={{USERNAME}}&repo={{REPO2}}&theme=dark" />
  </a>
</p>
```

## WakaTime Stats

```markdown
![WakaTime Stats](https://github-readme-stats.vercel.app/api/wakatime?username={{WAKATIME_USERNAME}}&theme=dark)
```

## Contribution Snake

```markdown
![Snake animation](https://raw.githubusercontent.com/{{USERNAME}}/{{USERNAME}}/output/github-snake-dark.svg)
```

Note: Necessite une GitHub Action pour generer le snake.

## Themes Populaires

| Theme | Preview |
|-------|---------|
| `dark` | Fond sombre |
| `radical` | Rose/violet gradient |
| `tokyonight` | Bleu nuit |
| `dracula` | Violet fonce |
| `gruvbox` | Orange/marron |
| `onedark` | Gris fonce |
| `nord` | Bleu arctique |
| `merko` | Vert |
| `synthwave` | Rose/cyan retro |
| `react` | Bleu React |

## Layout Centre

```markdown
<p align="center">
  <img src="stats-url" alt="GitHub Stats" />
</p>

<p align="center">
  <img src="languages-url" alt="Top Languages" />
</p>

<p align="center">
  <img src="streak-url" alt="GitHub Streak" />
</p>
```
