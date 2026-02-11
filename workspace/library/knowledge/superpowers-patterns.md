# Superpowers Framework Patterns - ULTRA-CREATE v28.1

> **Source**: github.com/obra/superpowers (26.4k stars - GitHub Trending Jan 2026)
> **Integration**: Agentic skills framework for Claude Code users
> **Status**: Essential framework selon GitHub Trending analysis
> **Charge automatiquement via**: `knowledge-auto-load.js` pour keywords: superpowers, agentic skills, agent skills

---

## Overview

Superpowers est un framework "agentic skills" qui definit une methodologie pour:
1. Definir des skills (capacites) executables par des agents AI
2. Composer des skills en workflows complexes
3. Executer des skills avec validation et feedback
4. Apprendre et ameliorer les skills au fil du temps

Le framework a gagne +3,114 stars en 2 jours (Jan 2026), devenant **essentiel pour Claude Code users**.

---

## Core Concepts

### 1. Skill Definition

Un skill est une unite atomique de capacite:

```javascript
const skill = {
  name: 'code-review',
  description: 'Review code for quality and security',
  inputs: ['code', 'context'],
  outputs: ['review_report', 'suggestions'],
  validation: {
    required_inputs: ['code'],
    output_schema: { type: 'object', properties: {...} }
  },
  execute: async (inputs) => {
    // Skill execution logic
    return { review_report, suggestions };
  }
};
```

### 2. Skill Composition

Les skills peuvent etre composes en workflows:

```javascript
const workflow = {
  name: 'pr-review-workflow',
  skills: [
    { skill: 'fetch-pr', parallel: false },
    { skill: 'code-review', parallel: true },
    { skill: 'security-scan', parallel: true },
    { skill: 'generate-summary', parallel: false }
  ],
  dependencies: {
    'code-review': ['fetch-pr'],
    'security-scan': ['fetch-pr'],
    'generate-summary': ['code-review', 'security-scan']
  }
};
```

### 3. Skill Execution

Execution avec validation et retry:

```javascript
const result = await superpowers.execute('code-review', {
  code: sourceCode,
  context: { language: 'typescript', framework: 'next.js' }
}, {
  timeout: 30000,
  retries: 3,
  validate: true
});
```

### 4. Skill Learning

Les skills peuvent s'ameliorer au fil du temps:

```javascript
// Record successful execution
await superpowers.learn({
  skill: 'code-review',
  input_hash: hashInputs(inputs),
  output: result,
  feedback: { quality: 0.95, time_ms: 1200 }
});

// Retrieve learned patterns
const patterns = await superpowers.recall('code-review', {
  similar_to: currentInputs,
  top_k: 5
});
```

---

## Integration avec ULTRA-CREATE

### Mapping Superpowers → ULTRA-CREATE

| Superpowers Concept | ULTRA-CREATE Equivalent |
|---------------------|------------------------|
| Skill | Agent |
| Workflow | Synergie |
| Skill Registry | agents/registry.json |
| Learning | Hindsight patterns bank |
| Execution | Task + hooks |
| Validation | confidence-checker + auto-validator |

### Agents Recommandes

| Agent ULTRA-CREATE | Role Superpowers |
|-------------------|------------------|
| `autonomous-agent-expert` | Framework integration expert |
| `wizard-agent` | Skill composition |
| `fullstack-super` | Complex workflow execution |
| `prompt-engineer` | Skill prompt optimization |
| `tester` | Skill validation |

### MCPs Requis

| MCP | Usage |
|-----|-------|
| context7 | Documentation framework |
| github | Repo superpowers access |
| e2b | Skill execution sandbox |

---

## Patterns d'Integration

### Pattern 1: Skill-as-Agent

Convertir un skill Superpowers en agent ULTRA-CREATE:

```javascript
// Superpowers skill
const superpowersSkill = { name: 'refactor', ... };

// ULTRA-CREATE agent equivalent
const ultraCreateAgent = {
  id: 'refactor-agent',
  category: 'automation',
  capabilities: ['code-refactoring', 'pattern-matching'],
  triggers: superpowersSkill.inputs,
  synergies: ['code-review']
};
```

### Pattern 2: Workflow-as-Synergie

Convertir un workflow Superpowers en synergie ULTRA-CREATE:

```javascript
// Superpowers workflow
const workflow = { skills: ['a', 'b', 'c'], dependencies: {...} };

// ULTRA-CREATE synergie equivalent
const synergie = {
  primary: ['a-agent', 'b-agent', 'c-agent'],
  executionOrder: 'sequential',
  phases: workflow.dependencies
};
```

### Pattern 3: Learning Integration

Connecter le learning Superpowers a Hindsight:

```javascript
// Apres execution skill reussie
await hindsight_retain({
  bank: 'patterns',
  content: JSON.stringify({
    type: 'superpowers_skill',
    skill: skillName,
    input_signature: hashInputs(inputs),
    output_summary: summarize(result),
    quality_score: feedback.quality
  })
});
```

---

## Best Practices

### 1. Skill Granularity
- Skills doivent etre atomiques (une seule responsabilite)
- Composition via workflows, pas skills monolithiques
- Max 3 inputs, 2 outputs recommandes

### 2. Error Handling
- Toujours definir validation schemas
- Implementer retry avec backoff exponentiel
- Logger erreurs dans Hindsight pour learning

### 3. Performance
- Paralleliser skills independants
- Cacher resultats intermediaires
- Timeout explicite pour chaque skill

### 4. Testing
- Unit tests pour chaque skill
- Integration tests pour workflows
- Regression tests apres learning updates

---

## Ressources

- **Repository**: [github.com/obra/superpowers](https://github.com/obra/superpowers)
- **Documentation**: Context7 pour derniere version
- **Community**: GitHub Issues + Discussions

---

## Relation avec ULTRA-CREATE v28.1

Cette integration fait partie de la version v28.1:
- **Synergie**: `superpowers-integration`
- **Agents**: `autonomous-agent-expert` active automatiquement
- **Knowledge**: Ce fichier charge automatiquement

---

*v28.1 SUPERPOWERS INTEGRATION | 26.4k GitHub stars | Essential pour Claude Code users*
*Charge auto via knowledge-auto-load.js | Synergie: superpowers-integration*
