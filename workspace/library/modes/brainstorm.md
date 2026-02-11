# Mode Brainstorm v25.0

**Type**: ideation
**Activation**: `/mode brainstorm` ou `/ideas`
**Usage**: Exploration créative et idéation

---

## Configuration Comportementale v25.0

```json
{
  "mode": "brainstorm",
  "version": "25.0",

  "execution": {
    "parallelism": "exploratory",
    "maxConcurrentAgents": 5,
    "confidenceThreshold": 0,
    "autoFix": false,
    "checkpointFrequency": "none",
    "codeGeneration": false,
    "explorationMode": true
  },

  "validation": {
    "lint": false,
    "typeCheck": false,
    "testCoverage": 0,
    "securityScan": "none",
    "performanceCheck": false,
    "freeExploration": true
  },

  "tokens": {
    "optimization": "none",
    "maxResponseLength": "extended",
    "compressionLevel": 0,
    "verbosity": "high",
    "includeAlternatives": true
  },

  "agents": {
    "priority": ["tree-of-thoughts", "self-reflection-loop", "deep-researcher", "design-strategist"],
    "optional": ["reasoning-agent"],
    "disabled": ["confidence-checker", "auto-validator", "tester"],
    "required": ["tree-of-thoughts"]
  },

  "mcps": {
    "required": ["hindsight"],
    "preferred": ["exa", "firecrawl", "mermaid"],
    "fallbackEnabled": false
  },

  "hooks": {
    "enabled": ["knowledge-auto-load"],
    "blocking": []
  },

  "memory": {
    "recallBefore": true,
    "retainAfter": false,
    "banks": ["research", "patterns"],
    "searchInspiration": true
  },

  "creativity": {
    "treeOfThoughts": true,
    "scamper": true,
    "sixThinkingHats": true,
    "crazy8s": true,
    "divergeBeforeConverge": true,
    "wildCardIdeas": true
  },

  "outputs": {
    "ideasList": true,
    "mindMaps": true,
    "prosConsComparison": true,
    "userStories": true,
    "moodboards": true,
    "codeGen": false
  }
}
```

---

## Description

Mode créatif pour explorer des idées, générer des alternatives
et penser "outside the box". Pas de code - que des concepts.

---

## Caractéristiques

| Aspect | Comportement |
|--------|--------------|
| **Vitesse** | Conversation fluide |
| **Qualité** | Créativité maximale |
| **Coût tokens** | Variable |
| **Validation** | Aucune (exploration libre) |
| **Output** | Idées, concepts, alternatives |

---

## Techniques Activées

### 1. Tree of Thoughts
```
Idée centrale
├── Branche A
│   ├── Variation A1
│   └── Variation A2
├── Branche B
│   ├── Variation B1
│   └── Variation B2
└── Branche C (wild card)
```

### 2. SCAMPER
- **S**ubstitute - Que peut-on remplacer?
- **C**ombine - Que peut-on combiner?
- **A**dapt - Que peut-on adapter?
- **M**odify - Que peut-on modifier?
- **P**ut to other use - Autres usages?
- **E**liminate - Que peut-on supprimer?
- **R**everse - Et si on inversait?

### 3. Six Thinking Hats
- 🎩 Blanc: Faits et données
- 🎩 Rouge: Émotions et intuitions
- 🎩 Noir: Risques et problèmes
- 🎩 Jaune: Avantages et optimisme
- 🎩 Vert: Créativité et alternatives
- 🎩 Bleu: Processus et organisation

### 4. Crazy 8s
Génération de 8 idées en 8 minutes (simulation):
1. Idée conventionnelle
2. Idée opposée
3. Idée combinée
4. Idée simplifiée
5. Idée amplifiée
6. Idée inspirée (d'autre domaine)
7. Idée futuriste
8. Idée wild card

---

## Workflow Créatif

```
1. Définir le challenge/problème
2. Diverger → Générer maximum d'idées
3. Explorer → Développer les prometteuses
4. Converger → Sélectionner les meilleures
5. Raffiner → Détailler la sélection
6. (Optionnel) → Mode Architect pour concrétiser
```

---

## Quand l'utiliser

- Nouveau projet sans direction claire
- Blocage créatif
- Exploration de pivots
- Innovation produit
- Naming et branding
- Features brainstorming

---

## Agents Activés

- Tree-of-Thoughts (multi-exploration)
- Self-Reflection Loop (amélioration itérative)
- Deep Researcher (inspiration externe)
- Design Strategist (faisabilité)

---

## Outputs Typiques

- Liste d'idées classées
- Mind maps
- Comparatifs (pros/cons)
- User stories potentielles
- Moodboards conceptuels

---

## Transition

Après brainstorm:
```
/mode architect → Structurer l'idée choisie
/mode standard  → Implémenter directement
```

---

*ATUM CREA - Mode Brainstorm*
