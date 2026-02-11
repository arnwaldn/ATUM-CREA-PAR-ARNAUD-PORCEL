# ULTRA-CREATE Memory Architecture v17.0

## Vue d'ensemble

L'architecture mémoire d'ULTRA-CREATE v17.0 intègre **Hindsight** pour une mémoire biomimétique
qui apprend et s'améliore avec le temps.

```
┌─────────────────────────────────────────────────────────────┐
│            LAYER 5: Memory Management (Hindsight)           │
│     reflect() → Opinions │ Observations │ Learning         │
├─────────────────────────────────────────────────────────────┤
│            LAYER 4: Procedural Memory (Skills Bank)         │
│     Patterns appris │ Best practices │ Confidence scores   │
├─────────────────────────────────────────────────────────────┤
│            LAYER 3: Long-term Memory (Hindsight)            │
│     World Facts │ Experiences │ Semantic + Graph retrieval │
├─────────────────────────────────────────────────────────────┤
│            LAYER 2: Session Memory (Hindsight Banks)        │
│     Context récent │ Temporal queries │ Entity tracking    │
├─────────────────────────────────────────────────────────────┤
│            LAYER 1: Working Memory (Claude Context)         │
│     Tâche courante │ Raisonnement │ État actif             │
└─────────────────────────────────────────────────────────────┘
```

---

## Hindsight Integration

### Memory Banks

| Bank ID | Type | Usage |
|---------|------|-------|
| `ultra-create-world` | World | Faits sur frameworks, APIs, patterns |
| `ultra-create-experiences` | Experiences | Succès et échecs d'opérations |
| `ultra-create-skills` | Opinions | Patterns appris avec scores de confiance |
| `ultra-create-insights` | Observations | Insights générés par `reflect()` |

### Opérations Hindsight

#### 1. RETAIN - Stocker en mémoire

```javascript
const memory = require('./scripts/hindsight-adapter');

// Fait sur le monde
await memory.retain('world', 'Next.js 15 utilise App Router par défaut');

// Expérience de succès
await memory.recordSuccess('deploy', 'Cloudflare Workers déployé en 23s');

// Expérience d'échec
await memory.recordFailure('build', 'Module not found: lodash', 'npm install lodash');

// Skill appris
await memory.recordSkill('Toujours vérifier les types TypeScript avant build', 0.95);
```

#### 2. RECALL - Récupérer des mémoires

```javascript
// Recherche sémantique
const results = await memory.recall('Comment configurer Stripe webhooks?');

// Recherche dans un bank spécifique
const errors = await memory.recall('Quelles erreurs avec Supabase?', { bank: 'experiences' });

// Contexte avant une tâche
const context = await memory.getTaskContext('Créer une page de login avec Next.js');
```

#### 3. REFLECT - Générer des insights

```javascript
// Réflexion sur les patterns
const insights = await memory.reflect('Quels patterns React fonctionnent le mieux?');

// Insights de fin de session
const sessionInsights = await memory.generateSessionInsights(
  'Créé une landing page avec shadcn, déployé sur Vercel'
);
```

---

## Layer 1: Working Memory (Claude Context)

**Caractéristiques:**
- Capacité: ~200K tokens (Claude)
- Latence: 0ms (in-context)
- Persistance: Durée de la conversation

**Contenu:**
- Contexte de tâche actuel
- Raisonnement immédiat
- État des opérations en cours

**Gestion:**
- Compression automatique si > 80% capacité
- Priorisation par pertinence

---

## Layer 2: Session Memory (Hindsight)

**Caractéristiques:**
- Backend: Hindsight Memory Banks
- Latence: <50ms
- Persistance: Cross-session

**Contenu:**
- Contexte récent des interactions
- Entités et relations extraites
- Données temporelles

**Accès:**
```javascript
await memory.recall('Que s'est-il passé dans la dernière heure?');
```

---

## Layer 3: Long-term Memory (Hindsight)

**Caractéristiques:**
- Backend: Hindsight (Vector + Graph + Temporal)
- Latence: <100ms
- Persistance: Permanente

**Stratégies de retrieval (parallèles):**
1. **Semantic:** Similarité vectorielle
2. **Keyword:** BM25 exact matching
3. **Graph:** Liens entités/temporels/causaux
4. **Temporal:** Filtrage par période

**Fusion:** Reciprocal rank fusion + cross-encoder reranking

---

## Layer 4: Procedural Memory (Skills)

**Caractéristiques:**
- Backend: Hindsight Skills Bank
- Type: Opinions avec scores de confiance
- Latence: <50ms

**Contenu:**
- Patterns de code validés
- Best practices apprises
- Préférences utilisateur

**Exemple:**
```json
{
  "skill": "Utiliser Context7 avant génération de code framework",
  "confidence": 0.98,
  "source": "15 expériences positives, 0 négatives"
}
```

---

## Layer 5: Memory Management (Reflect)

**Caractéristiques:**
- Opération: `reflect()`
- Fréquence: On-demand ou fin de session
- Résultat: Nouvelles opinions et observations

**Processus:**
1. Analyse des expériences récentes
2. Identification de patterns
3. Génération d'observations
4. Mise à jour des scores de confiance

**Exemple de réflexion:**
```
Input: "Quels problèmes de déploiement ai-je rencontrés?"

Output:
- Observation: "Les builds échouent souvent à cause de dépendances manquantes"
- Opinion (0.92): "Toujours vérifier package-lock.json avant deploy"
- Opinion (0.87): "Utiliser pnpm au lieu de npm pour meilleure reproductibilité"
```

---

## Démarrage

### 1. Lancer Hindsight

```powershell
# Démarrer le serveur
.\scripts\start-hindsight.ps1

# Vérifier le status
.\scripts\start-hindsight.ps1 -Status

# Ouvrir l'interface web
.\scripts\start-hindsight.ps1 -UI
```

### 2. Utiliser l'adaptateur

```javascript
const memory = require('./scripts/hindsight-adapter');

// Vérifier la disponibilité
const isUp = await memory.isAvailable();

// Utiliser la mémoire
await memory.retain('world', 'Information importante');
const results = await memory.recall('Ma question');
```

---

## Configuration

Voir `config/hindsight-config.json` pour:
- Ports API et UI
- Modèle LLM utilisé
- Configuration des memory banks
- Triggers d'auto-retain

---

## Comparaison avec v16.0

| Aspect | v16.0 (MCP Memory) | v17.0 (Hindsight) |
|--------|-------------------|-------------------|
| Type | Key-value simple | Biomimétique |
| Retrieval | Exact match | Semantic + Graph + Temporal |
| Apprentissage | Non | Oui (reflect) |
| Confiance | Non | Scores de confiance |
| Relations | Non | Extraction automatique |
| Insights | Non | Génération automatique |

---

## Benchmark

Hindsight atteint **state-of-the-art** sur LongMemEval:
- Surpasse GPT-4o full context
- Surpasse Mem0, Zep, Letta
- Validé par Virginia Tech et Washington Post

---

*Version: 17.0.0 | Backend: Hindsight | Architecture: 5 Layers*
