# Anthropic Prompt Engineering Best Practices 2025

**Source**: Documentation officielle Anthropic
**Applicable a**: Claude 4.x (Opus 4.5, Sonnet 4.5, Haiku 4.5)
**Date**: Decembre 2025

---

## Principes Fondamentaux

### 1. Clarte et Explicite

Claude 4.x repond bien aux instructions claires et explicites. Etre specifique sur l'output desire ameliore significativement les resultats.

```yaml
# Mauvais
"Ecris du code pour un formulaire"

# Bon
"Ecris un composant React TypeScript pour un formulaire de contact avec:
- Champs: name, email, message
- Validation Zod
- Soumission async avec loading state
- Gestion d'erreurs"
```

### 2. Comportement "Above and Beyond"

Les modeles Claude 4.x suivent les instructions de maniere plus precise. Pour obtenir des comportements proactifs, il faut les demander explicitement.

```yaml
# Demander explicitement les ameliorations
"Implemente cette feature ET suggere des ameliorations potentielles"
"Cree ce composant ET ajoute des tests unitaires"
"Corrige ce bug ET documente la solution pour reference future"
```

### 3. Contexte et Motivation

Expliquer POURQUOI une instruction est importante aide Claude a mieux comprendre les objectifs et delivrer des resultats plus cibles.

```yaml
# Sans contexte
"Ajoute de la validation au formulaire"

# Avec contexte
"Ajoute de la validation au formulaire car ce formulaire sera utilise
par des utilisateurs non-techniques qui peuvent faire des erreurs de saisie.
La validation doit etre claire et aider l'utilisateur a corriger."
```

### 4. Capacites de Reflexion (Thinking)

Claude 4.x offre des capacites de reflexion (thinking) particulierement utiles pour:
- Reflexion apres utilisation d'outils
- Raisonnement multi-etapes complexe
- Decisions architecturales

```yaml
# Activer la reflexion
"Reflechis etape par etape avant de repondre"
"Considere plusieurs approches avant de choisir"
"Evalue les pros et cons de chaque solution"
```

### 5. Choix de Mots (Opus 4.5)

Pour Claude Opus 4.5 avec extended thinking desactive, eviter le mot "think" et ses variantes.

```yaml
# Eviter
"Think about the best approach"
"I think we should..."
"Let me think..."

# Preferer
"Consider the best approach"
"I believe we should..."
"Let me evaluate..."
"Analyze the options..."
```

### 6. Eviter le Sur-Engineering

Ne faire que les changements directement demandes ou clairement necessaires. Garder les solutions simples et focalisees.

```yaml
# Mauvais
- Ajouter des features non demandees
- Refactorer du code autour du changement
- Ajouter des commentaires/docstrings partout
- Ajouter de la gestion d'erreurs pour des cas impossibles

# Bon
- Implementer exactement ce qui est demande
- Changer uniquement les lignes necessaires
- Ajouter des commentaires seulement ou la logique n'est pas evidente
- Valider uniquement aux frontieres systeme (input user, APIs externes)
```

### 7. Long-Horizon Reasoning

Claude 4.5 excelle dans le raisonnement a long terme avec tracking d'etat exceptionnel. Il maintient l'orientation sur des sessions etendues en se concentrant sur des progres incrementaux.

```yaml
# Approche recommandee
- Faire des avancees constantes sur quelques elements a la fois
- Ne pas tenter tout en une fois
- Maintenir le contexte entre les etapes
- Valider les progres regulierement
```

---

## Structure de Prompts Recommandee

### Template Standard
```markdown
## Contexte
[Description du projet/situation]

## Objectif
[Ce qui doit etre accompli]

## Contraintes
- [Contrainte 1]
- [Contrainte 2]

## Format Attendu
[Description du format de sortie]

## Exemples (optionnel)
[Exemples de ce qui est attendu]
```

### Template pour Code
```markdown
## Task
[Description de la tache]

## Requirements
- [Requirement 1]
- [Requirement 2]

## Technical Context
- Stack: [technologies]
- Existing patterns: [patterns a suivre]
- Constraints: [limites techniques]

## Expected Output
- [Type de fichier]
- [Structure attendue]
```

---

## Techniques Avancees

### Chain-of-Thought (CoT)
```yaml
# Forcer le raisonnement etape par etape
"Resous ce probleme en suivant ces etapes:
1. Analyse le probleme
2. Identifie les contraintes
3. Propose des solutions
4. Evalue chaque solution
5. Choisis et implemente la meilleure"
```

### Few-Shot Learning
```yaml
# Fournir des exemples
"Voici des exemples du format attendu:

Input: X
Output: Y

Input: A
Output: B

Maintenant, traite: [nouveau input]"
```

### Self-Consistency
```yaml
# Generer plusieurs reponses et choisir
"Propose 3 approches differentes pour ce probleme,
evalue chacune, et recommande la meilleure avec justification."
```

---

## Anti-Patterns a Eviter

### 1. Instructions Vagues
```yaml
# Mauvais
"Ameliore ce code"

# Bon
"Ameliore la performance de cette fonction en:
- Reduisant la complexite O(n²) a O(n)
- Ajoutant du memoization
- Optimisant les requetes DB"
```

### 2. Trop de Contexte
```yaml
# Mauvais
[10 pages de contexte avant la question]

# Bon
[Contexte pertinent seulement]
[Question claire]
```

### 3. Instructions Contradictoires
```yaml
# Mauvais
"Fais vite mais prends ton temps pour bien faire"

# Bon
"Priorise la qualite. Le temps n'est pas une contrainte."
```

---

## Integration ULTRA-CREATE

Ces best practices sont integrees dans ULTRA-CREATE via:

| Element | Implementation |
|---------|----------------|
| Clarte | Intent Parser v2.0 + Wizard Agent |
| Contexte | Hindsight memory + Context7 |
| Reflexion | sequential-thinking MCP |
| Qualite | self-checker + confidence-checker |
| Structure | Templates standardises |

---

## Sources Officielles

- [Claude 4 Best Practices](https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/claude-4-best-practices)
- [Claude Code Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices)
- [Prompt Engineering Overview](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview)
- [Interactive Tutorial](https://github.com/anthropics/prompt-eng-interactive-tutorial)

---

**Version**: 1.0
**Applicable**: ULTRA-CREATE v24.1+
**Last Updated**: December 2025
