---
description: "Code review approfondie avec analyse securite"
---

# Mode REVIEW Active

Review de: **$ARGUMENTS**

## WORKFLOW

1. **Code Reviewer** - Analyse qualite globale
2. **Security Auditor** - Scan vulnerabilites
3. **Hindsight Recall** - Patterns best practice
4. **Rapport** - Generer rapport avec suggestions

## AGENTS IMPLIQUES

| Role | Agent |
|------|-------|
| Primary | `code-reviewer` |
| Secondary | `security-auditor`, `self-checker` |

## MCPs REQUIS

- `hindsight` - Historique reviews

## MCPs OPTIONNELS

- `sequential-thinking` - Analyse approfondie

## CRITERES D'EVALUATION

### Qualite du Code
- [ ] Lisibilite et clarte
- [ ] Conventions de nommage
- [ ] Commentaires pertinents
- [ ] Complexite maitrisee

### Architecture
- [ ] Separation des responsabilites
- [ ] Couplage faible
- [ ] Cohesion forte
- [ ] Patterns appropries

### Securite (OWASP Top 10)
- [ ] Injection (SQL, XSS, etc.)
- [ ] Authentification/Sessions
- [ ] Exposition de donnees
- [ ] Controle d'acces
- [ ] Configuration securisee

### Performance
- [ ] Requetes optimisees
- [ ] Caching approprie
- [ ] Lazy loading
- [ ] Bundle size

## EXEMPLES

```
/review ./src
/review ./src/api
/review PR #123
```

## RAPPORT GENERE

Le rapport inclut:

1. **Score Global** - Note /100
2. **Points Forts** - Ce qui est bien fait
3. **Issues** - Problemes detectes avec severite
4. **Suggestions** - Ameliorations recommandees
5. **Quick Wins** - Corrections rapides possibles

## DIFFERENCE AVEC /review-fix

- `/review` = Analyse et rapport uniquement
- `/review-fix` = Analyse + corrections automatiques

## GO!

Effectue une review complete du code specifie.
