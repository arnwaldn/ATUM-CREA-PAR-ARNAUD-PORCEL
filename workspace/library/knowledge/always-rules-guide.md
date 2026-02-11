# Always Rules Guide - ULTRA-CREATE Enforcement

> **Concept Source**: EnzeD/vibe-coding "Always Rules"
> **Implementation**: CLAUDE.md + Hooks + Agents
> **Enforcement**: Automatique (pas de gestion humaine)

---

## Qu'est-ce qu'une "Always Rule"?

Règle critique qui doit TOUJOURS être respectée avant certaines actions.

Dans vibe-coding original:
```
"Always read @architecture.md before writing code"
```

Dans ULTRA-CREATE (automatisé):
```javascript
// Hook pre-edit-check.js
// Vérifie automatiquement Context7 + Hindsight avant édition
```

---

## Always Rules ULTRA-CREATE

### Règle 1: Context7 Before Code
```
AVANT de coder avec un framework:
→ Context7 resolve-library-id
→ Context7 get-library-docs
```

**Enforcement**: `CLAUDE.md` section "TOUJOURS"

### Règle 2: Hindsight Before Debug
```
AVANT de debugger une erreur:
→ hindsight_recall(bank: 'errors', query: error_message)
```

**Enforcement**: Hook `pre-edit-check.js`

### Règle 3: Retain After Learn
```
APRÈS avoir résolu un problème nouveau:
→ hindsight_retain(bank: 'errors', content: solution)
```

**Enforcement**: Hook `post-edit-learn.js`

### Règle 4: shadcn For UI
```
POUR tout composant UI:
→ Utiliser shadcn/ui
→ PAS de composants custom si shadcn existe
```

**Enforcement**: Agent `ui-designer.md`

### Règle 5: Stack 2025 Compliance
```
POUR tout nouveau projet:
→ Next.js 15, React 19, TypeScript 5.7
→ TailwindCSS 4, Prisma 6
→ Supabase pour backend
```

**Enforcement**: Templates + `stack-2025.md`

---

## Mécanismes d'Enforcement

### 1. CLAUDE.md (Règles Déclaratives)
```markdown
## REGLES ABSOLUES

### TOUJOURS
1. Context7 avant de coder un framework
2. Hindsight recall avant de résoudre une erreur
...

### JAMAIS
1. Coder sans vérifier la doc
2. Résoudre sans chercher les erreurs passées
...
```

### 2. Hooks (Enforcement Automatique)
```
hooks/
├── pre-edit-check.js     # Vérifie avant édition
├── post-edit-learn.js    # Apprend après édition
├── enforce-v22-rules.js  # Applique règles globales
└── anti-hallucination.js # Prévient hallucinations
```

### 3. Agents Meta (Validation)
```
agents/meta/
├── confidence-checker.md  # Vérifie avant exécution
├── self-checker.md        # Valide après exécution
└── intent-parser.md       # Parse et route correctement
```

---

## Ajout de Nouvelles Always Rules

### Option 1: CLAUDE.md
```markdown
# Ajouter dans section TOUJOURS:
X. [Description de la règle]
```

### Option 2: Hook Custom
```javascript
// hooks/my-rule-enforcement.js
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "Edit|Write",
      "commands": ["node", "hooks/my-rule.js"]
    }]
  }
}
```

### Option 3: Agent Spécialisé
```markdown
# agents/meta/my-rule-agent.md
## Règle
TOUJOURS [action] AVANT [trigger]

## Validation
- [ ] Condition 1
- [ ] Condition 2
```

---

## Escalation Phrases (Bonus vibe-coding)

Phrases pour demander plus de rigueur:

| Phrase | Effet |
|--------|-------|
| "think step by step" | Raisonnement détaillé |
| "be very careful" | Attention accrue |
| "this is critical" | Mode qualité activé |
| "double-check everything" | Validation exhaustive |
| `/mode quality` | Active mode Quality complet |

---

## Différence avec vibe-coding

| Aspect | vibe-coding | ULTRA-CREATE |
|--------|-------------|--------------|
| Définition | Humain écrit règles | Encodées dans système |
| Rappel | Humain doit mentionner | Automatique (hooks) |
| Enforcement | Discipline humaine | Système enforced |
| Update | Éditer memory-bank | Éditer CLAUDE.md/hooks |

---

## Checklist Projet Critique

Pour projets production, activer toutes les règles:

```bash
/mode quality
```

Cela active:
- [ ] ESLint/Biome strict
- [ ] TypeScript strict
- [ ] Tests coverage >80%
- [ ] Security scan (npm audit, Semgrep)
- [ ] Performance profiling
- [ ] Web Vitals monitoring

---

*Always Rules Guide - ULTRA-CREATE v24.1*
