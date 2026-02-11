# Système de Mémoire Projet (Learnings)

## Structure des Learnings

Chaque projet terminé génère un fichier de learning :

```
knowledge/learnings/
├── system.md              # Ce fichier (documentation)
├── 2025-12-04-saas-example.md
├── 2025-12-05-ecommerce-client.md
└── ...
```

## Format d'un Learning

```markdown
# Learning: [Nom du Projet]

## Métadonnées
- Date: YYYY-MM-DD
- Type: [web|mobile|desktop|api|saas|ecommerce]
- Stack: [technologies utilisées]
- Durée: [temps de réalisation]
- Succès: [oui|partiel|non]

## Demande Initiale
[Description exacte de la demande utilisateur]

## Solution Implémentée
[Description de ce qui a été créé]

## Ce Qui A Bien Fonctionné
- [Point 1]
- [Point 2]

## Difficultés Rencontrées
- [Difficulté 1]: [Solution appliquée]
- [Difficulté 2]: [Solution appliquée]

## Patterns Réutilisables
```code
[Code snippet à sauvegarder]
```

## Améliorations Pour le Futur
- [ ] [Amélioration 1]
- [ ] [Amélioration 2]

## Score Final
- Build: ✅/❌
- Tests: X%
- Lighthouse: X
- Satisfaction: X/5
```

## Exemple de Learning

```markdown
# Learning: TaskManager SaaS

## Métadonnées
- Date: 2025-12-04
- Type: saas
- Stack: Next.js 15, Supabase, Stripe, shadcn/ui
- Durée: 28 minutes
- Succès: oui

## Demande Initiale
"Je veux une app de gestion de tâches avec authentification et abonnements"

## Solution Implémentée
SaaS complet avec:
- Auth (email + OAuth Google/GitHub)
- Dashboard avec stats
- CRUD tâches avec priorités et tags
- Abonnements Stripe (Free/Pro/Enterprise)
- Équipes (multi-tenant)

## Ce Qui A Bien Fonctionné
- Template auth-system réutilisé (gain 10min)
- Dashboard-layout appliqué directement
- Webhook Stripe copié du snippet

## Difficultés Rencontrées
- Supabase RLS policies complexes: Utilisé helper function
- Stripe webhook local testing: Utilisé stripe listen

## Patterns Réutilisables
```typescript
// Pattern pour RLS avec teams
CREATE POLICY "Users can view their team's tasks"
ON tasks FOR SELECT
USING (
  team_id IN (
    SELECT team_id FROM team_members
    WHERE user_id = auth.uid()
  )
);
```

## Améliorations Pour le Futur
- [ ] Ajouter template pour multi-tenant complet
- [ ] Créer helper pour RLS policies

## Score Final
- Build: ✅
- Tests: 85%
- Lighthouse: 94
- Satisfaction: 5/5
```

## Comment Utiliser les Learnings

### 1. Avant de Commencer un Projet
```
Rechercher dans learnings/:
- Projets similaires
- Patterns réutilisables
- Erreurs à éviter
```

### 2. Pendant le Développement
```
Consulter:
- Code snippets sauvegardés
- Solutions aux problèmes courants
```

### 3. Après Chaque Projet
```
Créer un nouveau learning:
- Documenter ce qui a fonctionné
- Sauvegarder les patterns utiles
- Noter les améliorations possibles
```

## Métriques Globales à Tracker

```markdown
# Métriques Cumulées (mise à jour automatique)

## Par Type de Projet
| Type | Nombre | Temps Moyen | Taux Succès |
|------|--------|-------------|-------------|
| saas | 0 | - | - |
| ecommerce | 0 | - | - |
| dashboard | 0 | - | - |
| mobile | 0 | - | - |
| desktop | 0 | - | - |
| api | 0 | - | - |

## Erreurs Fréquentes
| Erreur | Occurrences | Solution |
|--------|-------------|----------|
| - | - | - |

## Patterns Les Plus Réutilisés
1. -
2. -
3. -
```

## Automatisation

Après chaque projet, le système devrait:
1. Générer automatiquement le fichier de learning
2. Extraire les patterns réutilisables
3. Mettre à jour les métriques globales
4. Identifier les améliorations système

## Requête de Réflexion Post-Projet

```
/reflect

Questions à se poser:
1. Le projet a-t-il répondu à la demande?
2. Qu'est-ce qui a pris plus de temps que prévu?
3. Quel code devrait devenir un template?
4. Quelle erreur ne doit plus se reproduire?
5. Le système peut-il être amélioré?
```
