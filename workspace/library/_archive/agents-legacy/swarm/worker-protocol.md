# Worker Protocol - Swarm Intelligence

## Identité Worker

Chaque agent spécialisé dans le système ULTRA-CREATE v11.0 est également un **Worker** capable de fonctionner dans le Swarm.

## Protocol de Communication

### 1. Réception de Tâche

```yaml
on_task_received:
  1. Valider le format de la tâche
  2. Vérifier les dépendances
  3. Confirmer la capacité d'exécution
  4. Signaler ACCEPTED ou BLOCKED
  5. Commencer l'exécution si ACCEPTED
```

### 2. Exécution

```yaml
during_execution:
  1. Envoyer status updates réguliers (30s)
  2. Signaler immédiatement les blocages
  3. Demander clarification si ambiguïté
  4. Produire des résultats partiels si possible
  5. Documenter les décisions importantes
```

### 3. Livraison

```yaml
on_task_complete:
  1. Packager le résultat
  2. Inclure les métadonnées de qualité
  3. Signaler COMPLETED
  4. Attendre validation ou feedback
  5. Corriger si nécessaire
```

## Status Reporting

### Format de Status
```yaml
worker_status:
  worker_id: "{agent_type}-{instance}"
  task_id: "{swarm_task_id}"
  status: "RUNNING|BLOCKED|COMPLETED|FAILED"
  progress: 0-100
  current_action: "Description courte"
  blockers: []
  estimated_completion: "{timestamp}"
  partial_results: "optional"
```

### Fréquence de Reporting
- **Normal**: Toutes les 30 secondes
- **Blocage**: Immédiat
- **Milestone**: À chaque étape majeure
- **Completion**: Immédiat

## Inter-Worker Communication

### Demande de Ressource
```yaml
resource_request:
  from: "{worker_id}"
  to: "queen|{worker_id}"
  type: "data|dependency|clarification"
  payload:
    description: "Ce dont j'ai besoin"
    blocking: true|false
    timeout: "optional"
```

### Partage de Résultat
```yaml
result_share:
  from: "{worker_id}"
  to: ["queen", "dependent_workers"]
  type: "partial|final"
  payload:
    content: "Le résultat"
    format: "code|json|text|file"
    quality_score: 0-100
    notes: "Observations importantes"
```

## Gestion des Erreurs

### Types d'Erreurs
```yaml
errors:
  DEPENDENCY_MISSING:
    action: "Signaler à Queen, attendre résolution"

  RESOURCE_UNAVAILABLE:
    action: "Retry 3x, puis escalade"

  AMBIGUOUS_REQUIREMENTS:
    action: "Demander clarification"

  TECHNICAL_FAILURE:
    action: "Log erreur, signaler FAILED"

  QUALITY_BELOW_THRESHOLD:
    action: "Auto-correction ou escalade"
```

### Recovery Protocol
```yaml
on_error:
  1. Log l'erreur avec contexte complet
  2. Évaluer si auto-recovery possible
  3. Si oui: tenter recovery (max 3 tentatives)
  4. Si non: signaler BLOCKED avec détails
  5. Attendre instruction de Queen
```

## Collaboration Patterns

### Pattern: PAIR_WORK
Deux workers collaborent sur une tâche liée.
```yaml
pattern:
  worker_a: "Produit le code"
  worker_b: "Review en temps réel"
  sync: "Toutes les 5 minutes"
  merge: "Validation conjointe avant livraison"
```

### Pattern: PIPELINE
Travail séquentiel entre workers.
```yaml
pattern:
  step_1: "worker_a produit output"
  step_2: "worker_b consomme, produit output"
  step_3: "worker_c finalise"
  sync: "À chaque handoff"
```

### Pattern: BROADCAST
Un worker produit pour plusieurs consommateurs.
```yaml
pattern:
  producer: "worker_a crée une ressource partagée"
  consumers: ["worker_b", "worker_c", "worker_d"]
  sync: "Notification à tous les consumers"
```

## Quality Standards

### Acceptance Criteria
Chaque worker doit garantir:
- [ ] Code/output fonctionnel
- [ ] Pas d'erreurs critiques
- [ ] Documentation inline
- [ ] Tests si applicable
- [ ] Respect des conventions du projet

### Self-Review Checklist
Avant de signaler COMPLETED:
- [ ] J'ai relu mon output
- [ ] J'ai vérifié les edge cases
- [ ] J'ai documenté les décisions importantes
- [ ] J'ai inclus les dépendances nécessaires
- [ ] Mon output est prêt pour intégration

## Optimisation Individuelle

### Caching
- Réutiliser les résultats précédents si applicable
- Stocker les patterns fréquents
- Accélérer avec les learnings

### Pipelining
- Commencer la tâche suivante pendant la validation
- Préparer les ressources à l'avance
- Optimiser le temps d'attente
