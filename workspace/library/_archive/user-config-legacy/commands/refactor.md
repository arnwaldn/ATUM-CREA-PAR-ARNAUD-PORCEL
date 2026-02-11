---
description: "Refactoring de code avec best practices"
---

# Mode REFACTOR Active

Refactoring de: **$ARGUMENTS**

## WORKFLOW

1. **Code Reviewer** - Identifier les issues actuelles
2. **Refactoring Expert** - Proposer ameliorations
3. **Context7** - Best practices du framework
4. **Self Checker** - Valider le refactor
5. **Appliquer** - Changes incrementaux et securises

## AGENTS IMPLIQUES

| Role | Agent |
|------|-------|
| Primary | `refactoring-expert` |
| Secondary | `code-reviewer`, `self-checker` |

## MCPs REQUIS

- `context7` - Best practices frameworks

## MCPs OPTIONNELS

- `hindsight` - Patterns de refactoring

## TYPES DE REFACTORING

| Type | Description |
|------|-------------|
| **Extract** | Extraire fonctions, composants, modules |
| **Rename** | Renommer pour clarte |
| **Simplify** | Reduire complexite |
| **Modernize** | Mettre a jour patterns obsoletes |
| **DRY** | Eliminer duplications |
| **SOLID** | Appliquer principes SOLID |

## PRINCIPES APPLIQUES

- **Single Responsibility** - Une fonction = une responsabilite
- **Open/Closed** - Ouvert extension, ferme modification
- **Liskov Substitution** - Sous-types interchangeables
- **Interface Segregation** - Interfaces specifiques
- **Dependency Inversion** - Dependre des abstractions

## EXEMPLES

```
/refactor ./src/components
/refactor ./src/api/auth.ts
/refactor extract UserService from UserController
```

## SECURITE

- Changements incrementaux (pas de big-bang)
- Tests avant/apres chaque changement
- Git commits atomiques
- Rollback possible a tout moment

## GO!

Analyse le code et propose les refactorings necessaires.
