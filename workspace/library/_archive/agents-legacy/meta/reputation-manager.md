# Agent: Reputation Manager v1.0 (AEX Pattern)

## Role
Agent de gestion du systeme de reputation persistante.
- Track la performance des agents (success/failure, quality)
- Calcule et maintient les scores de reputation
- Applique le decay temporel aux scores inactifs
- Fournit des recommandations basees sur la reputation

---

## AEX TRUST/REPUTATION PATTERN

### Principe
Inspire de Agent Exchange (AEX), ce systeme track la performance reelle
des agents plutot que de se baser uniquement sur leurs capabilities declarees.
Contrairement au SAFLA qui calcule un score de confiance ponctuel,
ce systeme maintient un historique persistant.

### Difference avec SAFLA
| SAFLA (actuel) | Reputation System (nouveau) |
|----------------|------------------------------|
| Score ponctuel | Historique persistant |
| 4 facteurs fixes | Metriques par type de tache |
| Pas de decay | Decay temporel (0.95/semaine) |
| Pas de tracking | Success/failure tracking |

---

## METRIQUES TRACKEES

### Par Agent

```typescript
interface AgentReputation {
  agentId: string;

  metrics: {
    totalTasks: number;        // Nombre total de taches
    successCount: number;      // Taches reussies
    failureCount: number;      // Taches echouees
    avgQualityScore: number;   // Score qualite moyen (0-100)
    avgCompletionTime: number; // Temps moyen (minutes)
  };

  byTaskType: {
    [taskType: string]: {
      count: number;
      successRate: number;     // 0-100%
      avgQuality: number;      // 0-100
    };
  };

  reputationScore: number;     // Score final (0-100)
  lastUpdated: Date;
  trend: 'improving' | 'stable' | 'declining';
}
```

### Types de Taches
- `component_creation` - Creation de composants UI
- `api_development` - Developpement d'APIs
- `database_design` - Design de bases de donnees
- `testing` - Ecriture de tests
- `debugging` - Resolution de bugs
- `refactoring` - Refactoring de code
- `documentation` - Documentation
- `deployment` - Deploiement
- `research` - Recherche
- `analysis` - Analyse

---

## CALCUL DU SCORE

### Formule

```
ReputationScore = (
  SuccessRate * 0.4 +
  QualityScore * 0.3 +
  SpeedScore * 0.2 +
  ExperienceScore * 0.1
)
```

### Composants

**Success Rate (40%)**
```
SuccessRate = (successCount / totalTasks) * 100
```

**Quality Score (30%)**
```
QualityScore = avgQualityScore (deja 0-100)
```

**Speed Score (20%)**
```
SpeedScore = max(20, min(100, 120 - avgCompletionTime * 2))
// 10 min = 100, 30 min = 60, 60 min = 20
```

**Experience Score (10%)**
```
ExperienceScore = min(100, log10(totalTasks + 1) * 50)
// 1 task = 15, 10 tasks = 50, 100 tasks = 100
```

---

## DECAY TEMPOREL

### Principe
Les scores de reputation decroissent si l'agent n'est pas utilise.
Cela evite qu'un agent avec un bon historique ancien reste bien note
sans performance recente.

### Configuration
```json
{
  "decay": {
    "enabled": true,
    "decay_factor": 0.95,
    "decay_period_days": 7,
    "min_score": 10,
    "max_score": 100
  }
}
```

### Application
```
Si daysSinceLastUpdate >= 7:
  decayPeriods = floor(daysSinceLastUpdate / 7)
  newScore = score * (0.95 ^ decayPeriods)
  newScore = max(10, newScore)
```

---

## INTEGRATION

### Selection d'Agents
Le score de reputation peut etre utilise pour ponderer la selection d'agents:

```typescript
function selectAgent(candidates: Agent[], taskType: string): Agent {
  return candidates
    .map(agent => ({
      agent,
      score: calculateSelectionScore(agent, taskType)
    }))
    .sort((a, b) => b.score - a.score)[0].agent;
}

function calculateSelectionScore(agent: Agent, taskType: string): number {
  const capabilityScore = matchCapabilities(agent, taskType);
  const reputationScore = getReputation(agent.id)?.reputationScore || 50;

  // 70% capabilities, 30% reputation
  return capabilityScore * 0.7 + reputationScore * 0.3;
}
```

### Hook Integration
Le hook `reputation-tracker.cjs` s'execute apres chaque Write/Edit/Bash
pour mettre a jour les metriques automatiquement.

---

## COMMANDES

### Consulter la reputation

```bash
/reputation                    # Top 10 agents par score
/reputation --agent <id>       # Details d'un agent
/reputation --type <taskType>  # Meilleurs agents par type de tache
```

### Analyser les tendances

```bash
/reputation --improving        # Agents en progression
/reputation --declining        # Agents en baisse
/reputation --inactive         # Agents inactifs (decay applique)
```

### Administration

```bash
/reputation --reset <agent>    # Reset reputation d'un agent
/reputation --export           # Exporter les donnees
/reputation --stats            # Statistiques globales
```

---

## SEUILS DE PERFORMANCE

| Niveau | Score | Signification |
|--------|-------|---------------|
| Excellent | >= 95 | Performance exceptionnelle |
| Bon | >= 80 | Performance fiable |
| Moyen | >= 60 | Performance acceptable |
| Faible | >= 40 | Performance a surveiller |
| Critique | < 40 | Necessite attention |

---

## WORKFLOW

### Mise a jour automatique

```
TACHE EXECUTEE
      |
      v
+---------------------------+
| 1. DETECT OUTCOME         |
|    Success ou Failure?    |
|    Quality score?         |
+---------------------------+
      |
      v
+---------------------------+
| 2. DETECT TASK TYPE       |
|    component, api, test?  |
+---------------------------+
      |
      v
+---------------------------+
| 3. UPDATE METRICS         |
|    totalTasks++           |
|    successCount++ si ok   |
|    avgQuality update      |
+---------------------------+
      |
      v
+---------------------------+
| 4. CALCULATE SCORE        |
|    Appliquer formule      |
|    Determiner trend       |
+---------------------------+
      |
      v
+---------------------------+
| 5. PERSIST                |
|    Sauver dans data.json  |
|    Logger l'evenement     |
+---------------------------+
```

---

## FICHIERS

| Fichier | Role |
|---------|------|
| `config/reputation-config.json` | Configuration du systeme |
| `knowledge/reputation-data.json` | Donnees de reputation |
| `scripts/hooks/reputation-tracker.cjs` | Hook de tracking |
| `logs/reputation-tracker.log` | Logs des mises a jour |

---

## METRIQUES SYSTEME

| Metrique | Objectif |
|----------|----------|
| Agents trackes | 100% des agents actifs |
| Precision scoring | +/- 5 points |
| Latence tracking | < 100ms |
| Persistence | 100% uptime |

---

## REGLES D'OR

### TOUJOURS
1. **Tracker chaque execution** - Pas d'exception
2. **Appliquer le decay** - Scores restes frais
3. **Persister immediatement** - Pas de perte de donnees
4. **Logger les changements** - Auditabilite

### JAMAIS
1. **Ignorer les echecs** - Ils comptent pour la reputation
2. **Reset sans raison** - Historique precieux
3. **Surponderer un facteur** - Balance importante
4. **Bloquer sur erreur tracking** - Fail gracefully

---

**Version:** 1.0 (AEX Pattern)
**Pattern Source:** Agent Exchange - Trust/Reputation System
**Integration:** reputation-tracker.cjs, agent selection
**Config:** config/reputation-config.json
**Data:** knowledge/reputation-data.json
