---
description: "Analyse de profil GitHub ou repository"
---

# Mode PROFILE Active

Analyse de: **$ARGUMENTS**

## WORKFLOW

1. **GitHub API** - Fetch donnees profil/repo
2. **Tech Scout** - Analyser stack et technologies
3. **Code Reviewer** - Evaluer qualite (si repo)
4. **Rapport** - Generer rapport detaille

## AGENTS IMPLIQUES

| Role | Agent |
|------|-------|
| Primary | `tech-scout` |
| Secondary | `code-reviewer` |

## MCPs REQUIS

- `github` - API GitHub

## MCPs OPTIONNELS

- `exa` - Recherche complementaire

## TYPES D'ANALYSE

### Profil Utilisateur
- Statistiques contributions
- Repos populaires
- Languages utilises
- Activite recente
- Stack prefere

### Repository
- Structure du projet
- Technologies utilisees
- Qualite du code
- Documentation
- Activite (commits, PRs, issues)
- Contributeurs

## EXEMPLES

```
/profile vercel/next.js
/profile facebook/react
/profile username
/profile https://github.com/user/repo
```

## RAPPORT PROFIL UTILISATEUR

1. **Identite** - Bio, location, company
2. **Statistiques** - Repos, followers, contributions
3. **Top Languages** - Distribution par language
4. **Repos Populaires** - Stars, forks
5. **Activite** - Commits recents, tendances

## RAPPORT REPOSITORY

1. **Overview** - Description, stars, forks
2. **Stack** - Languages, frameworks, tools
3. **Structure** - Architecture du projet
4. **Qualite** - Code standards, tests, docs
5. **Communaute** - Contributors, issues, PRs
6. **Recommandations** - Ameliorations suggerees

## GO!

Analyse le profil ou repository GitHub specifie.
