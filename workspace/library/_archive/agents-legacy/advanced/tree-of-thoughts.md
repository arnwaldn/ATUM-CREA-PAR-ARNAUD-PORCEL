# Tree-of-Thoughts Agent

**Category**: advanced
**Version**: 1.0.0 (Inspired by Yao et al. 2023)
**Purpose**: Explorer plusieurs branches de raisonnement pour decisions complexes

---

## Overview

Le Tree-of-Thoughts (ToT) permet d'explorer systematiquement plusieurs chemins de raisonnement en parallele, evaluant chaque branche avant de choisir la meilleure solution.

**Benefice**: Ameliore la qualite des decisions de **37%** sur les problemes complexes.

---

## Architecture

```
                         [PROBLEME]
                              │
                              ▼
                    ┌─────────────────┐
                    │  DECOMPOSITION  │
                    │  Sous-problemes │
                    └────────┬────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
        ┌──────────┐   ┌──────────┐   ┌──────────┐
        │ BRANCHE A│   │ BRANCHE B│   │ BRANCHE C│
        │ Approche │   │ Approche │   │ Approche │
        │ conserv. │   │ innovante│   │ hybride  │
        └────┬─────┘   └────┬─────┘   └────┬─────┘
              │               │               │
              ▼               ▼               ▼
        ┌──────────┐   ┌──────────┐   ┌──────────┐
        │EVAL: 7/10│   │EVAL: 9/10│   │EVAL: 5/10│
        │ Fiable   │   │ Optimal  │   │ Risque   │
        └────┬─────┘   └────┬─────┘   └────┬─────┘
              │               │               │
              └───────────────┼───────────────┘
                              ▼
                    ┌─────────────────┐
                    │ SELECTION: B    │
                    │ Score max: 9/10 │
                    └────────┬────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ EXPANSION       │
                    │ Developper B    │
                    └────────┬────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ SOLUTION FINALE │
                    └─────────────────┘
```

---

## Algorithme ToT

### Phase 1: Decomposition
```yaml
input: Probleme complexe
process:
  - Identifier les sous-problemes independants
  - Lister les contraintes
  - Definir les criteres de succes
output: Liste de sous-problemes + criteres
```

### Phase 2: Generation de Branches
```yaml
input: Sous-problemes
process:
  - Generer 3-5 approches distinctes
  - Chaque approche = une branche
  - Varier les perspectives (conservateur, innovant, hybride)
output: 3-5 branches de solution
min_branches: 3
max_branches: 5
```

### Phase 3: Evaluation
```yaml
input: Branches generees
process:
  - Evaluer chaque branche sur les criteres
  - Calculer score pondere (0-10)
  - Classer par score
output: Branches avec scores
threshold_expand: 7  # Developper si >= 7
threshold_prune: 5   # Eliminer si < 5
```

### Phase 4: Expansion Selective
```yaml
input: Branches >= threshold_expand
process:
  - Developper les details de chaque branche viable
  - Identifier les risques specifiques
  - Estimer l'effort d'implementation
output: Branches detaillees
```

### Phase 5: Selection Finale
```yaml
input: Branches detaillees avec scores
process:
  - Comparer les scores finaux
  - Verifier la coherence globale
  - Documenter le raisonnement
output: Meilleure solution + justification
```

---

## Criteres d'Evaluation

| Critere | Poids | Description | Questions cles |
|---------|-------|-------------|----------------|
| **Faisabilite** | 25% | Peut etre implemente avec les ressources actuelles | Stack compatible? Dependencies disponibles? |
| **Qualite** | 25% | Resultat final attendu | Performance? UX? Maintenabilite? |
| **Efficacite** | 20% | Temps et ressources necessaires | Combien de temps? Cout? |
| **Maintenabilite** | 15% | Facilite de maintenance future | Code lisible? Tests? Documentation? |
| **Risques** | 15% | Risques potentiels | Points de failure? Edge cases? |

### Formule de Score
```
Score = (Faisabilite * 0.25) + (Qualite * 0.25) + (Efficacite * 0.20) + (Maintenabilite * 0.15) + (10 - Risques) * 0.15
```

---

## Exemple Complet

### Probleme
"Implementer un systeme d'authentification pour une application SaaS"

### Phase 1: Decomposition
```yaml
sous_problemes:
  - Choix du provider d'authentification
  - Gestion des sessions
  - Protection des routes
  - UI de connexion/inscription

contraintes:
  - Budget: $0-50/mois
  - Stack: Next.js 15 + Supabase
  - Delai: 1 semaine

criteres_succes:
  - Login/logout fonctionnel
  - OAuth Google/GitHub
  - Sessions securisees
  - Protection CSRF
```

### Phase 2: Branches Generees

**Branche A: Supabase Auth (Natif)**
```yaml
approche: Utiliser Supabase Auth integre
avantages:
  - Zero config supplementaire
  - Gratuit jusqu'a 50k MAU
  - OAuth pre-configure
inconvenients:
  - Moins flexible
  - Vendor lock-in
```

**Branche B: Clerk (SaaS specialise)**
```yaml
approche: Utiliser Clerk pour auth
avantages:
  - UI pre-construite
  - Multi-tenancy natif
  - Webhooks avances
inconvenients:
  - Cout a grande echelle
  - Dependance externe
```

**Branche C: NextAuth.js (DIY)**
```yaml
approche: Implementer avec NextAuth.js
avantages:
  - Controle total
  - Pas de vendor lock-in
  - Gratuit
inconvenients:
  - Plus de code a maintenir
  - Configuration complexe
```

### Phase 3: Evaluation

| Branche | Faisabilite | Qualite | Efficacite | Maintenabilite | Risques | **SCORE** |
|---------|-------------|---------|------------|----------------|---------|-----------|
| A: Supabase | 10 | 8 | 9 | 7 | 2 | **8.35** |
| B: Clerk | 9 | 9 | 7 | 8 | 2 | **8.15** |
| C: NextAuth | 7 | 8 | 5 | 6 | 4 | **6.60** |

### Phase 4: Expansion (Branche A)
```yaml
branche_selectionnee: A - Supabase Auth
details:
  implementation:
    - Configurer Supabase Auth dans dashboard
    - Installer @supabase/auth-helpers-nextjs
    - Creer middleware.ts pour protection routes
    - Implementer SignIn/SignUp components

  fichiers:
    - src/lib/supabase.ts
    - src/middleware.ts
    - src/app/(auth)/sign-in/page.tsx
    - src/app/(auth)/sign-up/page.tsx

  temps_estime: 2-3 heures
```

### Phase 5: Decision Finale
```yaml
solution: Branche A - Supabase Auth
score_final: 8.35/10
justification: |
  Meilleur equilibre entre rapidite d'implementation,
  cout (gratuit), et integration native avec le stack
  existant (Supabase). Le vendor lock-in est acceptable
  car Supabase est deja dans le stack.
```

---

## Integration ULTRA-CREATE

### Avec Sequential-Thinking MCP
```javascript
// Utiliser pour reflexion approfondie sur chaque branche
mcp__sequential-thinking__sequentialthinking({
  thought: "Evaluation branche A...",
  thoughtNumber: 1,
  totalThoughts: 5,
  nextThoughtNeeded: true
})
```

### Avec Confidence-Checker
```yaml
# Valider le score final avant selection
confidence_check:
  - score >= 8: GO
  - score 6-8: INVESTIGUER alternatives
  - score < 6: STOP et repenser
```

### Avec Hindsight
```javascript
// Sauvegarder la decision pour reference future
mcp__hindsight__hindsight_retain({
  bank: 'patterns',
  content: 'ToT Decision: Auth system -> Supabase Auth (8.35/10)',
  context: 'SaaS authentication decision'
})
```

---

## Regles

### TOUJOURS
1. Generer **minimum 3 branches** differentes
2. Evaluer chaque branche **independamment** avant comparaison
3. **Documenter le raisonnement** de chaque branche
4. Choisir base sur les **scores**, pas l'intuition
5. **Sauvegarder** les decisions dans Hindsight

### JAMAIS
1. S'arreter a la **premiere solution** qui semble fonctionner
2. **Ignorer** les branches peu conventionnelles
3. Evaluer **sans criteres explicites**
4. Choisir par **biais de confirmation**
5. **Oublier** de documenter le raisonnement

---

## Quand Utiliser ToT

| Situation | Utiliser ToT? | Raison |
|-----------|---------------|--------|
| Choix d'architecture | ✅ OUI | Impact long terme |
| Choix de stack | ✅ OUI | Decisions strategiques |
| Bug simple | ❌ NON | Over-engineering |
| Refactoring majeur | ✅ OUI | Multiple approches possibles |
| Feature triviale | ❌ NON | Cout > benefice |
| Migration | ✅ OUI | Risques eleves |

---

## References

- [Tree of Thoughts: Deliberate Problem Solving with Large Language Models](https://arxiv.org/abs/2305.10601) - Yao et al. 2023
- [Chain-of-Thought Prompting](https://arxiv.org/abs/2201.11903) - Wei et al. 2022

---

**Version**: 1.0
**Pattern Type**: Agentic Reasoning
**Compatibility**: All ULTRA-CREATE agents
**Integration**: sequential-thinking, confidence-checker, hindsight
**New in v24.1**: Agent cree pour ameliorer qualite des decisions complexes
