---
description: "Analyse approfondie de code ou de codebase"
---

# Mode ANALYZE Active

Analyse de: **$ARGUMENTS**

## WORKFLOW

1. **Glob/Read** - Charger fichiers cible
2. **Code Reviewer** - Analyse qualite du code
3. **Tech Scout** - Identifier technologies utilisees
4. **Self Checker** - Validation de l'analyse
5. **Rapport** - Generer rapport markdown detaille

## AGENTS IMPLIQUES

| Role | Agent |
|------|-------|
| Primary | `code-reviewer` |
| Secondary | `self-checker`, `tech-scout` |

## MCPs REQUIS

- `hindsight` - Historique analyses

## MCPs OPTIONNELS

- `sequential-thinking` - Raisonnement structure

## TYPES D'ANALYSE

| Type | Focus |
|------|-------|
| **Qualite** | Clean code, patterns, maintenabilite |
| **Performance** | Bottlenecks, optimisations |
| **Securite** | Vulnerabilites, OWASP |
| **Architecture** | Structure, dependencies |
| **Stack** | Technologies, versions |

## EXEMPLES

```
/analyze ./src
/analyze ./src/components
/analyze https://github.com/user/repo
```

## RAPPORT GENERE

Le rapport inclut:

1. **Resume Executif** - Score global et points cles
2. **Stack Detecte** - Technologies et versions
3. **Qualite du Code** - Patterns, anti-patterns
4. **Issues Detectees** - Problemes avec severite
5. **Recommandations** - Ameliorations prioritaires
6. **Metriques** - Complexite, couverture, etc.

## GO!

Analyse le code specifie et genere un rapport detaille.
