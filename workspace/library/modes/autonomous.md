# Mode Autonomous v25.0

**Type**: full-auto
**Activation**: `/mode autonomous` ou `yolo`
**Usage**: Exécution complète sans intervention

---

## Configuration Comportementale v25.0

```json
{
  "mode": "autonomous",
  "version": "25.0",

  "execution": {
    "parallelism": "maximum",
    "maxConcurrentAgents": 20,
    "confidenceThreshold": 50,
    "autoFix": true,
    "checkpointFrequency": "5min",
    "skipConfirmations": true,
    "maxRetries": 3
  },

  "validation": {
    "lint": true,
    "typeCheck": true,
    "testCoverage": 50,
    "securityScan": "basic",
    "performanceCheck": false,
    "autoResolveErrors": true
  },

  "tokens": {
    "optimization": "balanced",
    "maxResponseLength": "auto",
    "compressionLevel": 2,
    "skipExplanations": true
  },

  "agents": {
    "priority": ["autonomous-executor", "self-healer", "checkpoint-manager", "priority-queue"],
    "optional": ["parallel-executor-v18"],
    "disabled": ["wizard-agent"],
    "required": ["corrective-rag"]
  },

  "mcps": {
    "required": ["hindsight"],
    "preferred": ["context7", "shadcn", "supabase"],
    "fallbackEnabled": true,
    "autoSelect": true
  },

  "hooks": {
    "enabled": ["memory-first", "knowledge-auto-load", "anti-hallucination"],
    "blocking": ["anti-hallucination"]
  },

  "memory": {
    "recallBefore": true,
    "retainAfter": true,
    "banks": ["ultra-dev-memory", "patterns", "errors"],
    "autoApplyPatterns": true
  },

  "decisions": {
    "autoChooseStack": true,
    "autoResolveAmbiguity": true,
    "autoInstallDeps": true,
    "autoCommit": true,
    "bestGuessOnLowConfidence": true
  },

  "safety": {
    "noPushForce": true,
    "noDeleteProduction": true,
    "noModifyCredentials": true,
    "requireConfirmFor": ["deploy", "payment", "api-keys"],
    "errorThreshold": "critical_only",
    "stopOnCriticalError": true
  }
}
```

---

## Description

Mode d'exécution entièrement autonome. Claude prend toutes les décisions
sans demander confirmation. Maximum d'efficacité pour les tâches bien définies.

---

## Caractéristiques

| Aspect | Comportement |
|--------|--------------|
| **Vitesse** | Très rapide |
| **Qualité** | Standard |
| **Coût tokens** | Optimisé |
| **Validation** | Auto-validation |
| **Intervention** | Zéro (sauf erreur critique) |

---

## Comportement Autonome

### Décisions Automatiques
- Choix de stack (basé sur requirements)
- Structure de projet
- Nommage fichiers/fonctions
- Résolution d'ambiguïtés (best guess)
- Gestion d'erreurs (auto-fix)

### Auto-Corrections
```javascript
// Si erreur TypeScript → fix automatique
// Si test échoue → debug et retry
// Si dépendance manquante → install auto
// Si conflit → résolution intelligente
```

### Limites de Sécurité
- Pas de push force vers remote
- Pas de suppression de données production
- Pas de modification de credentials
- Demande confirmation pour: deploy, paiement, API keys

---

## Workflow Autonome

```
1. Parse intent → Si >50% confidence, exécuter
2. Memory recall → Appliquer patterns connus
3. Exécution parallèle maximale
4. Auto-validation continue
5. Auto-fix des erreurs mineures
6. Checkpoint automatique
7. Completion sans interruption
```

---

## Quand l'utiliser

- Tâches répétitives bien connues
- Scripts et automatisations
- Génération de code boilerplate
- Sessions de travail prolongées
- Quand vous faites confiance au système

---

## Agents Activés

- Autonomous Executor (principal)
- Self-Healer (auto-correction)
- Checkpoint Manager (sauvegarde)
- Priority Queue (gestion tâches)

---

## Configuration Avancée

```yaml
autonomous:
  max_retries: 3
  auto_commit: true
  auto_install_deps: true
  skip_confirmations: true
  checkpoint_frequency: 5min
  error_threshold: critical_only
```

---

## Sécurité

⚠️ **Recommandations:**
- Utilisez sur des projets non-critiques
- Vérifiez les changements après exécution
- Gardez des backups
- Limitez les permissions système

---

## Sortie du Mode

Le mode s'arrête automatiquement si:
- Erreur critique détectée
- Demande d'action dangereuse
- Ambiguïté majeure (confidence <30%)
- Utilisateur interrompt (`Ctrl+C` ou `/stop`)

---

*ATUM CREA - Mode Autonomous*
