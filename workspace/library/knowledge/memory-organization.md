# Memory Organization Patterns - ULTRA-CREATE v28.5

> Patterns d'organisation de la mémoire Claude Code.
> Source: Analyse AIBlueprint (Melvynx) + Best Practices Anthropic.

---

## 1. Hiérarchie de Chargement des Fichiers Mémoire

Claude Code charge les fichiers mémoire dans cet ordre (priorité croissante):

```
1. Enterprise Policy    → /Library/Application Support/ClaudeCode/CLAUDE.md (macOS)
2. Project Memory       → ./CLAUDE.md ou ./.claude/CLAUDE.md
3. Project Rules        → ./.claude/rules/*.md
4. User Preferences     → ~/.claude/CLAUDE.md
5. User Rules           → ~/.claude/rules/*.md
6. Local Preferences    → ./CLAUDE.local.md (gitignored, surcharge tout)
```

**Important**: Les fichiers chargés plus tard SURCHARGENT les précédents.

---

## 2. Pattern CLAUDE.local.md (NOUVEAU v28.5)

### Concept
Fichier de préférences locales automatiquement gitignored pour:
- Tokens et secrets spécifiques à la machine
- Chemins de fichiers locaux
- Préférences utilisateur personnelles
- Workflows dev-specific

### Emplacement
```
C:\Users\arnau\.claude\CLAUDE.local.md
```

### Template
```markdown
# CLAUDE.local.md - Préférences Locales

## Chemins Machine
PROJECTS_DIR: C:\Users\xxx\projets
DOWNLOADS_DIR: C:\Users\xxx\Downloads

## Tokens (NE PAS COMMITTER)
# NOTION_TOKEN: ntn_xxxxx

## Préférences
- Langue: Français
- Style: Concis
```

### Avantages
- Séparation config partageable vs locale
- Pas de risque de commit secrets
- Override facile sans modifier CLAUDE.md principal

---

## 3. Framework WHAT-WHY-HOW

### Structure Recommandée pour CLAUDE.md

```markdown
# WHAT - Contexte Projet
- Stack technique (Next.js 15, React 19, etc.)
- Architecture (monorepo, microservices, etc.)
- Fichiers clés et leur rôle

# WHY - Décisions & Patterns
- Pourquoi ces choix techniques
- Trade-offs considérés
- Patterns adoptés et leurs raisons

# HOW - Workflows & Commandes
- Commandes slash disponibles
- Workflows de développement
- Processus de déploiement
```

### Avantages
- Instructions plus claires et actionnables
- Meilleure compréhension du contexte
- Réponses Claude plus pertinentes

---

## 4. Pattern @import (Conceptuel)

### Concept
Syntaxe d'import pour modulariser CLAUDE.md:

```markdown
# CLAUDE.md
@knowledge/reference/agents-detailed.md
@knowledge/reference/hooks-detailed.md
@config/mcp-profiles.json
```

### Statut
**Non implémenté nativement** dans Claude Code.
Alternatives:
- Utiliser `.claude/rules/*.md` (natif)
- Hook preprocessor personnalisé

### Workaround Actuel
Utiliser le dossier `.claude/rules/` pour modulariser:
```
.claude/
├── CLAUDE.md           # Instructions principales
└── rules/
    ├── security.md     # Règles sécurité
    ├── testing.md      # Règles tests
    └── frontend.md     # Règles frontend
```

---

## 5. Techniques d'Emphase

### Mots-Clés par Sévérité

| Mot-Clé | Usage | Exemple |
|---------|-------|---------|
| **CRITICAL** | Non-négociable | "CRITICAL: Toujours vérifier..." |
| **NEVER** | Prohibition absolue | "NEVER commit des secrets" |
| **ALWAYS** | Comportement obligatoire | "ALWAYS utiliser Context7" |
| **IMPORTANT** | Guidance significative | "IMPORTANT: Préférer la qualité" |
| **YOU MUST** | Exigence explicite | "YOU MUST sauvegarder dans Hindsight" |

### Placement Stratégique
1. Placer les règles critiques EN PREMIER dans chaque section
2. Répéter les règles importantes dans les contextes pertinents
3. Utiliser le formatage markdown (gras, headers) pour visibilité

---

## 6. Anti-Patterns à Éviter

### NE PAS inclure dans CLAUDE.md:

| Anti-Pattern | Raison | Alternative |
|--------------|--------|-------------|
| Règles de style code | Utiliser linters | .eslintrc, .prettierrc |
| Secrets/API keys | Risque sécurité | Variables d'environnement |
| +500 lignes | Dépasse limites tokens | Modulariser avec rules/ |
| Exemples de code longs | Gaspillage tokens | Liens vers fichiers |
| Instructions vagues | Ambiguïté | Être spécifique |

---

## 7. Contraintes de Taille

### Recommandations

| Type Fichier | Taille Idéale | Maximum | Action si dépassé |
|--------------|---------------|---------|-------------------|
| CLAUDE.md | 100-200 lignes | 300 lignes | Split vers rules/ |
| rules/*.md | 50-100 lignes | 150 lignes | Subdiviser |
| CLAUDE.local.md | 20-50 lignes | 100 lignes | Garder minimal |

### Calcul Tokens
- ~200 lignes ≈ 2000-3000 tokens
- Context window: 200k tokens
- Réserve Claude Code: ~50k tokens
- **Disponible pour mémoire**: ~100-150k tokens

---

## 8. Path-Scoped Rules

### Concept
Appliquer des règles uniquement à certains fichiers via frontmatter YAML:

```markdown
---
globs: ["src/components/**/*.tsx", "src/ui/**/*.tsx"]
---

# Règles Composants React

- Utiliser shadcn/ui pour tous les composants
- TypeScript strict obligatoire
- Tests avec React Testing Library
```

### Avantages
- Règles contextuelles (frontend vs backend)
- Moins de bruit dans le contexte
- Instructions plus ciblées

---

## 9. Integration ULTRA-CREATE

### Fichiers Mémoire Existants

| Fichier | Rôle | Lignes |
|---------|------|--------|
| `~/.claude/CLAUDE.md` | Config principale ULTRA-CREATE | ~600 |
| `~/.claude/CLAUDE.local.md` | Préférences locales (NOUVEAU) | ~50 |
| `knowledge/reference/*.md` | Détails agents, hooks, templates | Variable |

### Hooks Associés
- `smart-context-loader.js` - Injection contexte intelligent
- `knowledge-auto-load.js` - Chargement auto knowledge files

---

## 10. Checklist Maintenance

### Révision Trimestrielle
- [ ] Supprimer instructions obsolètes
- [ ] Vérifier taille < 300 lignes
- [ ] Mettre à jour stack versions
- [ ] Valider cohérence règles
- [ ] Tester avec session fraîche

### Signaux d'Amélioration
- Claude demande souvent les mêmes clarifications → Ajouter instruction
- Erreurs répétées sur même sujet → Ajouter règle explicite
- Instructions ignorées → Reformuler ou déplacer en haut

---

## Sources

- [AIBlueprint - Melvynx](https://github.com/Melvynx/aiblueprint)
- [Claude Code Docs - Memory](https://docs.anthropic.com/claude-code/memory)
- [Claude-mem Patterns](https://github.com/thedotmack/claude-mem)

---

*ULTRA-CREATE v28.5 | Pattern: memory-organization | CMP: 7.5/10*
