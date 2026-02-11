---
description: Activer optimisation tokens TOON (30-60% reduction) (user)
---

# /optimize - Token Optimization

## USAGE
```
/optimize              # Activer pour la session
/optimize --estimate   # Estimer avant execution
/optimize --report     # Voir economies realisees
```

## FORMAT TOON (Tree-structured Output Notation)

### Principe
Remplacer la prose par du YAML structure compact:

```yaml
# AVANT (~500 tokens)
"L'analyse du code a revele plusieurs problemes de securite.
Le premier concerne l'authentification qui presente des failles XSS..."

# APRES TOON (~150 tokens, -70%)
analysis:
  auth: {issues: [xss, csrf], fix: sanitize, priority: high}
  db: {issues: [no_index], fix: add_index, priority: medium}
  ui: {status: ok}
decision: proceed_with_fixes
next: [fix_auth, add_indexes, deploy]
```

## MODES

### Mode Standard (default)
- Outputs en YAML quand applicable
- Reduction estimee: 30-40%

### Mode Aggressive
```
/optimize --aggressive
```
- Tout en YAML sauf code
- Reduction estimee: 50-60%

### Mode Estimate
```
/optimize --estimate
```
Avant execution, affiche:
- Tokens estimes sans optimisation
- Tokens estimes avec TOON
- Economie prevue

### Mode Report
```
/optimize --report
```
Affiche pour la session:
- Tokens utilises
- Tokens economises
- % reduction

## SEUILS AUTOMATIQUES

| Niveau | Tokens | Action Auto |
|--------|--------|-------------|
| Normal | < 50K | Continuer normalement |
| Attention | 50K-100K | Activer TOON outputs |
| Warning | 100K-200K | Chunking + TOON |
| Critical | > 200K | Pause + strategie requise |

## QUAND UTILISER

### TOUJOURS pour:
- Projets longs (estimation > 50K tokens)
- Analyses complexes
- Multi-fichiers edits
- Rapports/syntheses

### PAS NECESSAIRE pour:
- Questions simples
- Edits mineurs
- Debugging rapide

## TECHNIQUES APPLIQUEES

1. **YAML Output**: Structures au lieu de prose
2. **Chunking**: Decouper grands fichiers
3. **Lazy Loading**: Lire fichiers a la demande
4. **Summary First**: Resume avant details
5. **Delta Only**: Montrer changements, pas fichier entier
