# Agent Pattern: ReAct (Reasoning + Acting)

## Overview

ReAct est un pattern d'agent qui alterne entre **raisonnement** (Thought) et **action** (Act), puis observe les résultats avant de continuer. Ce pattern est inspiré par le papier "ReAct: Synergizing Reasoning and Acting in Language Models" (Yao et al., 2022).

---

## CORE LOOP

```
┌─────────────────────────────────────────────────────────────┐
│                      ReAct LOOP                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌──────────┐    ┌──────────┐    ┌──────────────┐         │
│   │ THOUGHT  │───►│  ACTION  │───►│ OBSERVATION  │         │
│   │          │    │          │    │              │         │
│   │ Analyser │    │ Exécuter │    │ Observer     │         │
│   │ Planifier│    │ Tool Call│    │ Résultats    │         │
│   └──────────┘    └──────────┘    └──────┬───────┘         │
│        ▲                                  │                 │
│        │                                  │                 │
│        └──────────────────────────────────┘                 │
│                    Répéter jusqu'à succès                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## ALGORITHME DÉTAILLÉ

### Étape 1: THOUGHT (Raisonnement)

```markdown
## Thought {n}

**Situation actuelle:**
- État: {description de l'état actuel}
- Problème: {ce qui doit être résolu}
- Contraintes: {limitations connues}

**Analyse:**
- Hypothèse: {ce que je pense être la cause/solution}
- Options: {actions possibles}
- Choix: {action sélectionnée et pourquoi}

**Plan:**
1. {étape immédiate}
2. {étape suivante si succès}
3. {étape alternative si échec}
```

### Étape 2: ACTION (Exécution)

```markdown
## Action {n}

**Type:** {Tool Call | Code Write | Code Execute | Search | Read}

**Détails:**
- Tool: {nom de l'outil}
- Parameters: {paramètres}
- Expected outcome: {résultat attendu}

**Exécution:**
{résultat de l'action}
```

### Étape 3: OBSERVATION (Analyse du résultat)

```markdown
## Observation {n}

**Résultat:**
- Status: {Success | Partial | Failure}
- Output: {ce qui a été produit/retourné}

**Analyse:**
- Attendu vs Réel: {comparaison}
- Insights: {ce que j'ai appris}
- Next step: {continue | adjust | pivot}
```

---

## EXEMPLE COMPLET

### Tâche: "Ajoute une fonctionnalité de panier à l'app e-commerce"

```markdown
## Thought 1

**Situation actuelle:**
- État: App e-commerce Next.js existante avec catalogue produits
- Problème: Pas de système de panier
- Contraintes: Utiliser Zustand pour le state, localStorage pour persistance

**Analyse:**
- Hypothèse: Besoin d'un store Zustand + composants Cart + API routes
- Options:
  1. Store client-side only (localStorage)
  2. Store + sync serveur (Supabase)
- Choix: Option 1 pour MVP, plus simple et rapide

**Plan:**
1. Créer le store Zustand pour le panier
2. Créer le composant CartButton (header)
3. Créer la page Cart avec liste items
4. Ajouter bouton "Add to Cart" aux produits

---

## Action 1

**Type:** Code Write

**Détails:**
- Tool: Write
- File: src/store/useCartStore.ts
- Expected outcome: Store Zustand fonctionnel

**Exécution:**
```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
}

interface CartStore {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  total: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => set((state) => {
        const existing = state.items.find(i => i.id === item.id)
        if (existing) {
          return {
            items: state.items.map(i =>
              i.id === item.id
                ? { ...i, quantity: i.quantity + 1 }
                : i
            )
          }
        }
        return { items: [...state.items, { ...item, quantity: 1 }] }
      }),
      removeItem: (id) => set((state) => ({
        items: state.items.filter(i => i.id !== id)
      })),
      updateQuantity: (id, quantity) => set((state) => ({
        items: state.items.map(i =>
          i.id === id ? { ...i, quantity } : i
        )
      })),
      clearCart: () => set({ items: [] }),
      total: () => get().items.reduce((sum, item) =>
        sum + item.price * item.quantity, 0
      )
    }),
    { name: 'cart-storage' }
  )
)
```

---

## Observation 1

**Résultat:**
- Status: Success
- Output: Store créé avec toutes les méthodes nécessaires

**Analyse:**
- Attendu vs Réel: ✅ Store conforme aux attentes
- Insights: La persistance localStorage est intégrée via middleware
- Next step: Continue → Créer CartButton component

---

## Thought 2

**Situation actuelle:**
- État: Store panier créé et fonctionnel
- Problème: Besoin d'UI pour afficher/modifier le panier
- Contraintes: Utiliser shadcn/ui pour cohérence

**Analyse:**
- Hypothèse: CartButton dans header + CartSheet pour afficher items
- Options: Page dédiée vs Sheet/Drawer
- Choix: Sheet pour UX plus fluide (pas de changement de page)

**Plan:**
1. Créer CartButton avec badge quantité
2. Créer CartSheet avec liste items
3. Intégrer dans le header

---

## Action 2

**Type:** Code Write

**Détails:**
- Tool: Write
- File: src/components/cart/CartButton.tsx
- Expected outcome: Bouton panier avec badge

**Exécution:**
[Code du composant CartButton...]

---

## Observation 2

**Résultat:**
- Status: Success
- Output: Composant CartButton créé

**Analyse:**
- Attendu vs Réel: ✅ Badge s'affiche correctement
- Insights: Utiliser useCartStore.getState() pour éviter re-renders
- Next step: Continue → Créer CartSheet

[... Loop continue jusqu'à completion ...]
```

---

## RÈGLES DU PATTERN

### ✅ TOUJOURS

1. **Expliciter le raisonnement AVANT l'action**
   - Pas d'action sans justification
   - Documenter les hypothèses

2. **Observer et analyser chaque résultat**
   - Ne pas enchaîner les actions aveuglément
   - Ajuster le plan si nécessaire

3. **Garder un historique des étapes**
   - Permet de backtrack si erreur
   - Facilite le debugging

4. **Limiter la profondeur**
   - Max 10 itérations par tâche
   - Escalader si blocage

### ❌ JAMAIS

1. **Agir sans réfléchir**
   - Pas de "je vais juste essayer"
   - Toujours avoir un plan

2. **Ignorer les erreurs**
   - Chaque erreur = nouvelle itération Thought
   - Analyser la cause root

3. **Continuer sur échec répété**
   - Si 3 échecs similaires → changer d'approche
   - Considérer aide externe

---

## INTÉGRATION AVEC MCP

### Utilisation de Sequential Thinking

```typescript
// Avant chaque Thought majeur
await mcp.sequential_thinking.sequentialthinking({
  thought: "Analyse de la situation...",
  thoughtNumber: 1,
  totalThoughts: 5,
  nextThoughtNeeded: true
})
```

### Logging dans Memory

```typescript
// Après chaque cycle complet
await mcp.memory.create_entities([{
  name: `ReAct-${taskId}-${Date.now()}`,
  entityType: "reasoning-trace",
  observations: [
    `Task: ${taskDescription}`,
    `Thoughts: ${thoughtCount}`,
    `Actions: ${actionCount}`,
    `Result: ${finalResult}`
  ]
}])
```

---

## CAS D'USAGE

| Situation | ReAct Approprié? | Raison |
|-----------|------------------|--------|
| Bug complexe à debugger | ✅ Oui | Nécessite investigation itérative |
| Feature simple à ajouter | ⚠️ Optionnel | Peut être overkill |
| Architecture nouvelle | ✅ Oui | Plusieurs décisions à prendre |
| Refactoring majeur | ✅ Oui | Besoin de validation étape par étape |
| Correction typo | ❌ Non | Trop simple pour ce pattern |

---

## MÉTRIQUES

| Métrique | Cible | Description |
|----------|-------|-------------|
| Iterations/Task | < 7 | Nombre moyen de cycles T-A-O |
| Success Rate | > 90% | Tâches complétées avec succès |
| Backtrack Rate | < 20% | % de fois où on revient en arrière |
| Time/Iteration | < 30s | Temps moyen par cycle |

---

## RÉFÉRENCES

- [ReAct Paper (Yao et al., 2022)](https://arxiv.org/abs/2210.03629)
- [LangChain ReAct Agent](https://python.langchain.com/docs/modules/agents/agent_types/react)
- [OpenHands Implementation](https://github.com/All-Hands-AI/OpenHands)

---

**Version:** 1.0
**Pattern Type:** Agentic Reasoning
**Compatibility:** All ULTRA-CREATE agents
