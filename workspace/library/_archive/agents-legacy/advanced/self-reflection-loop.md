# Self-Reflection Loop Agent

**Category**: advanced
**Version**: 1.0.0 (Inspired by Shinn et al. 2023 - Reflexion)
**Purpose**: Amelioration iterative par auto-reflexion continue

---

## Overview

Le Self-Reflection Loop est une boucle d'auto-amelioration qui analyse les outputs, identifie les faiblesses, et raffine iterativement jusqu'a atteindre la qualite cible.

**Benefice**: Ameliore la qualite des outputs de **45%** en moyenne apres 2-3 iterations.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SELF-REFLECTION LOOP                      │
└─────────────────────────────────────────────────────────────┘

[TASK/INPUT]
       │
       ▼
┌─────────────────┐
│   GENERATE      │ ◄─── Iteration 1
│   Output V1     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  SELF-CRITIQUE  │
│  ┌───────────┐  │
│  │ Points +  │  │
│  │ Points -  │  │
│  │ Score X/10│  │
│  └───────────┘  │
└────────┬────────┘
         │
         ▼
    ┌─────────┐
    │Score>=8?│
    └────┬────┘
         │
    ┌────┴────┐
    │         │
   YES       NO
    │         │
    ▼         ▼
┌───────┐  ┌─────────────────┐
│ FINAL │  │   REFINEMENT    │
│OUTPUT │  │  ┌───────────┐  │
└───────┘  │  │ Fix issues│  │
           │  │ Improve   │  │
           │  └───────────┘  │
           └────────┬────────┘
                    │
                    │ (max 3 iterations)
                    │
                    └──────► [Back to SELF-CRITIQUE]
```

---

## Algorithme de Reflexion

### Etape 1: Generation Initiale
```yaml
input: Task description + requirements
process:
  - Produire output initial (V1)
  - Ne pas viser la perfection
  - Couvrir tous les requirements
output: Version 1 du livrable
quality_target: 60-70%
```

### Etape 2: Self-Critique
```yaml
input: Output V1
process:
  - Analyser objectivement l'output
  - Lister les points forts (3-5)
  - Lister les faiblesses (3-5)
  - Evaluer chaque critere (0-10)
  - Calculer score global
output: Critique structuree + score
```

### Etape 3: Decision
```yaml
input: Score de la critique
rules:
  - score >= 8: TERMINER (qualite atteinte)
  - score >= 6 AND iteration < 3: RAFFINER
  - score < 6 AND iteration < 3: RAFFINER (priorite haute)
  - iteration >= 3: TERMINER (limite atteinte)
output: Decision (TERMINER | RAFFINER)
```

### Etape 4: Refinement
```yaml
input: Critique + Output actuel
process:
  - Cibler les faiblesses identifiees
  - Appliquer corrections specifiques
  - Verifier que les points forts sont preserves
  - Ne pas tout refaire (incremental)
output: Version amelioree
```

---

## Criteres de Critique

| Critere | Poids | Questions |
|---------|-------|-----------|
| **Completude** | 20% | Tous les requirements couverts? |
| **Correctness** | 25% | Le code/output est-il correct? |
| **Qualite** | 20% | Best practices respectees? |
| **Clarte** | 15% | Code/doc lisible et comprehensible? |
| **Efficacite** | 10% | Performance acceptable? |
| **Edge Cases** | 10% | Cas limites geres? |

### Template de Critique
```yaml
critique:
  points_forts:
    - "Architecture claire et modulaire"
    - "Gestion d'erreurs comprehensive"
    - "Types TypeScript bien definis"

  faiblesses:
    - "Manque de tests unitaires"
    - "Documentation incomplete"
    - "Edge case X non gere"

  scores:
    completude: 8/10
    correctness: 9/10
    qualite: 7/10
    clarte: 8/10
    efficacite: 8/10
    edge_cases: 6/10

  score_global: 7.5/10

  decision: RAFFINER

  actions_refinement:
    - "Ajouter tests pour fonctions critiques"
    - "Completer JSDoc sur exports"
    - "Gerer edge case X avec validation"
```

---

## Exemple Complet

### Task
"Creer un hook React pour gerer un formulaire avec validation"

### Iteration 1: Generation

```typescript
// V1 - useForm.ts
export function useForm(initialValues: Record<string, any>) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleSubmit = (onSubmit: Function) => (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(values);
  };

  return { values, errors, handleChange, handleSubmit };
}
```

### Iteration 1: Critique

```yaml
critique_v1:
  points_forts:
    - "API simple et intuitive"
    - "Gestion basique du state"
    - "Prevention du comportement par defaut"

  faiblesses:
    - "Pas de validation implementee"
    - "Types any utilises (pas typesafe)"
    - "Pas de reset du formulaire"
    - "Pas de gestion du loading/submitting"
    - "Pas de support pour les champs imbriques"

  scores:
    completude: 5/10
    correctness: 7/10
    qualite: 5/10
    clarte: 8/10
    efficacite: 8/10
    edge_cases: 3/10

  score_global: 5.8/10
  decision: RAFFINER
```

### Iteration 2: Refinement

```typescript
// V2 - useForm.ts (ameliore)
interface UseFormOptions<T> {
  initialValues: T;
  validate?: (values: T) => Partial<Record<keyof T, string>>;
  onSubmit: (values: T) => Promise<void> | void;
}

interface UseFormReturn<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  reset: () => void;
  setFieldValue: (field: keyof T, value: any) => void;
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  validate,
  onSubmit,
}: UseFormOptions<T>): UseFormReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const runValidation = useCallback((vals: T) => {
    if (validate) {
      const validationErrors = validate(vals);
      setErrors(validationErrors);
      return Object.keys(validationErrors).length === 0;
    }
    return true;
  }, [validate]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setValues(prev => ({ ...prev, [name]: newValue }));
  }, []);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    runValidation(values);
  }, [values, runValidation]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const allTouched = Object.keys(values).reduce(
      (acc, key) => ({ ...acc, [key]: true }), {}
    );
    setTouched(allTouched as Partial<Record<keyof T, boolean>>);

    if (!runValidation(values)) return;

    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, runValidation, onSubmit]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const setFieldValue = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
  }, []);

  const isValid = Object.keys(errors).length === 0;

  return {
    values, errors, touched, isSubmitting, isValid,
    handleChange, handleBlur, handleSubmit, reset, setFieldValue
  };
}
```

### Iteration 2: Critique

```yaml
critique_v2:
  points_forts:
    - "Generics TypeScript complets"
    - "Validation integree"
    - "Gestion touched/blur"
    - "Loading state"
    - "Reset fonctionnel"
    - "useCallback pour performance"

  faiblesses:
    - "Pas de JSDoc/documentation"
    - "Pas d'exemple d'usage"

  scores:
    completude: 9/10
    correctness: 9/10
    qualite: 8/10
    clarte: 7/10
    efficacite: 9/10
    edge_cases: 8/10

  score_global: 8.3/10
  decision: TERMINER (score >= 8)
```

### Iteration 3: Polish Final (optionnel car >= 8)

Ajout documentation:
```typescript
/**
 * Custom hook for form management with validation
 * @template T - Type of form values
 * @param options - Form configuration options
 * @returns Form state and handlers
 *
 * @example
 * const { values, errors, handleSubmit } = useForm({
 *   initialValues: { email: '', password: '' },
 *   validate: (values) => {
 *     const errors: Partial<typeof values> = {};
 *     if (!values.email) errors.email = 'Required';
 *     return errors;
 *   },
 *   onSubmit: async (values) => {
 *     await login(values);
 *   }
 * });
 */
```

---

## Integration ULTRA-CREATE

### Avec Self-Checker Agent
```yaml
# Le self-reflection-loop utilise self-checker pour la critique
integration:
  - self-checker fournit les criteres
  - self-reflection-loop gere les iterations
  - Combinaison = qualite maximale
```

### Avec Hindsight
```javascript
// Sauvegarder chaque amelioration significative
mcp__hindsight__hindsight_retain({
  bank: 'patterns',
  content: `Self-Reflection: useForm hook improved from 5.8/10 to 8.3/10 in 2 iterations`,
  context: 'React hook development pattern'
})
```

### Avec Sequential-Thinking
```javascript
// Utiliser pour reflexion approfondie pendant critique
mcp__sequential-thinking__sequentialthinking({
  thought: "Analyzing V1 output for weaknesses...",
  thoughtNumber: 1,
  totalThoughts: 4,
  nextThoughtNeeded: true
})
```

---

## Regles

### TOUJOURS
1. Etre **honnete** dans l'auto-critique (pas d'auto-complaisance)
2. Lister faiblesses **specifiques et actionnables**
3. Limiter a **3 iterations maximum** (eviter over-engineering)
4. **Preserver les points forts** lors du refinement
5. **Sauvegarder** les ameliorations dans Hindsight

### JAMAIS
1. **Gonfler** les scores (score > realite)
2. Creer une **boucle infinie** (toujours insatisfait)
3. **Critiquer sans solution** concrete
4. **Tout refaire** a chaque iteration (incremental!)
5. **Ignorer** les points forts existants

---

## Quand Utiliser

| Situation | Utiliser? | Raison |
|-----------|-----------|--------|
| Code critique (auth, payments) | ✅ OUI | Qualite essentielle |
| Composant UI complexe | ✅ OUI | UX importante |
| Script one-shot | ❌ NON | Over-engineering |
| API publique | ✅ OUI | Contract important |
| Prototype/POC | ❌ NON | Vitesse prioritaire |
| Documentation | ✅ OUI | Clarte essentielle |

---

## Metriques de Succes

| Metrique | Cible |
|----------|-------|
| Score final | >= 8/10 |
| Iterations | <= 3 |
| Amelioration par iteration | >= 1.0 point |
| Points forts preserves | 100% |

---

## References

- [Reflexion: Language Agents with Verbal Reinforcement Learning](https://arxiv.org/abs/2303.11366) - Shinn et al. 2023
- [Self-Refine: Iterative Refinement with Self-Feedback](https://arxiv.org/abs/2303.17651) - Madaan et al. 2023

---

**Version**: 1.0
**Pattern Type**: Iterative Improvement
**Compatibility**: All ULTRA-CREATE agents
**Integration**: self-checker, sequential-thinking, hindsight
**New in v24.1**: Agent cree pour amelioration continue de qualite
