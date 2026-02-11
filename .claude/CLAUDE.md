# ATUM CREA -- Systeme Autonome de Vibe Coding (v3.1)

Systeme de vibe coding autonome propulse par Claude Opus 4.6 avec extended thinking (32K tokens). Cree des projets complets de niveau professionnel, prets pour la production, en toute autonomie.

**Extended thinking** : utiliser pour decisions architecturales, debugging multi-fichiers, analyse de securite, choix entre approches concurrentes. Ne PAS utiliser pour edits simples ou commandes directes.

Agents : @AGENTS.md | Rules : auto-chargees depuis `~/.claude/rules/`

---

## CYCLE OBLIGATOIRE

```
RECHERCHER -> PLANIFIER -> CONSTRUIRE -> VERIFIER -> MEMORISER
```

### 1. RECHERCHER
- `hindsight_recall` banks: `errors`, `patterns`, `development` (voir rule-02)
- Context7 : verifier la doc a jour de TOUT framework avant de coder (voir rule-06)
- `Task(Explore)` si codebase existant (parallele sur 3-5 zones)
- `WebSearch` si besoin d'information a jour

### 2. PLANIFIER
- `TodoWrite` : decouper en taches atomiques avec dependances
- Identifier taches parallelisables vs sequentielles
- `/interview` si projet complexe (> 5 features ou ambiguite)
- Consulter `library/knowledge/design-intelligence.md` pour UI
- Consulter `library/knowledge/mermaid-diagrams-guide.md` pour architecture

### 3. CONSTRUIRE
- Agents Task en parallele pour fichiers differents (batch 3-5)
- Meme fichier = sequentiel, fichiers differents = parallele
- TDD obligatoire : tests AVANT le code (voir rule-04)

### 4. VERIFIER (Dual Quality Gates - EN PARALLELE)
- **Gate A (Code)** : Build + Tests (80%+ coverage) + Type-check + Lint + code-reviewer si > 50 lignes
- **Gate B (UX)** : AI Browser apres tout changement UI (3 viewports : 375px, 768px, 1440px)
- Les DEUX gates doivent PASSER. Si echec -> corriger -> re-verifier

### 5. MEMORISER
- `hindsight_retain` pour patterns, erreurs resolues, decisions architecturales (voir rule-02)

---

## CONTEXTE MANAGEMENT

- Utiliser `/clear` entre taches non-liees pour nettoyer le contexte
- Deleguer les recherches lourdes a des sub-agents (Explore) pour preserver le contexte principal
- Apres 2+ corrections echouees sur le meme probleme : `/clear` et reformuler

---

## ORCHESTRATION DES AGENTS

### Matrice de selection automatique

| Situation | Agent(s) |
|-----------|----------|
| Explorer un codebase | `Explore` (haiku, rapide) |
| Recherche web complexe | `general-purpose` |
| Planifier une feature | `Plan` ou `planner` |
| Architecture systeme | `architect` |
| Ecrire du code avec tests | `tdd-guide` |
| Review de code (> 50 lignes) | `code-reviewer` |
| Erreurs de build/types | `build-error-resolver` |
| Erreurs de build Go | `go-build-resolver` |
| Tests end-to-end | `e2e-runner` |
| Nettoyage code mort | `refactor-cleaner` |
| Review securite (auth/paiement) | `security-reviewer` |
| Review code Go | `go-reviewer` |
| Review code Python | `python-reviewer` |
| Review base de donnees | `database-reviewer` |
| Mettre a jour la doc | `doc-updater` |

### Parallelisation
```
EXPLORATION : Explore x3-5 zones en parallele
CONSTRUCTION : tdd-guide (fichier A) || tdd-guide (fichier B) || tdd-guide (fichier C)
VERIFICATION : code-reviewer || security-reviewer || e2e-runner (simultanes)
```

---

## STACK 2025

Frontend: Next.js 15, React 19, TypeScript 5.7, TailwindCSS 4, shadcn/ui | Backend: Supabase, Prisma 6, Hono | Auth: Clerk (SaaS) / Supabase Auth (simple) | Tests: Vitest, Playwright | Mobile: Expo SDK 52+ | Desktop: Tauri 2.0 | Games: Phaser 3, Three.js | AI/ML: Python + Phidata/LangGraph

---

## CREATION DE PROJET

### Dossier de projet (OBLIGATOIRE)
TOUJOURS creer chaque projet dans un sous-dossier dedie :
```
C:\Users\arnau\Desktop\ATUM CREA\{nom-du-projet}\
```
JAMAIS dans `temp\artifacts\`. Respecter le choix de l'utilisateur pour un autre emplacement.

### Workflow standard
1. Creer le dossier du projet dans le workspace ATUM CREA
2. Skill `project-routing` pour identifier le stack
3. Skill `library-navigator` pour trouver templates et knowledge
4. Lire `library/knowledge/INDEX.md` pour les fichiers pertinents
5. Copier le template et personnaliser
6. Appliquer le workflow depuis `library/workflows/`

---

## COMPACTION

Lors de la compaction automatique, TOUJOURS preserver :
- Le cycle ATUM CREA et la phase en cours
- La todo list complete avec statuts
- La liste des fichiers modifies dans cette session
- Les decisions architecturales prises
- Les erreurs rencontrees et leurs solutions
- Les SESSION_IDs des agents actifs

---

## WORKAROUNDS CONNUS

- **Write tool** : exige un Read dans le meme contexte. Contournement : Bash heredoc
- **Sub-agents** : ne voient pas les fichiers de la conversation. Reviews directement, pas via Task
- **Chemins avec espaces** : guillemets dans Bash (`"path with spaces"`)
- **Config modifiee en parallele** : Node.js lecture-ecriture atomique si Edit echoue
- **Windows paths** : utiliser `\\` ou `/`, pas de commandes Unix pures (tail, head)
- **Credentials MCP** : stockees en clair dans `config.json`. Ne JAMAIS afficher/logger les valeurs de tokens/API keys. Traiter config.json comme fichier sensible

## WORKSPACE

- Projets : `C:\Users\arnau\Desktop\ATUM CREA\`
- Library : `C:\Users\arnau\Desktop\ATUM CREA\library\` (165 templates, 175+ knowledge files, 11 workflows)
- Config MCP : `C:\Users\arnau\.halo-dev\config.json`
- Rules : `C:\Users\arnau\.claude\rules\` (6 regles auto-chargees)
- Skills : `C:\Users\arnau\.claude\skills\` (37 skills)
- Commands : `C:\Users\arnau\.claude\commands\` (33 commands)
- Agents : `C:\Users\arnau\.claude\agents\` (16 agents specialises)

---

## PRINCIPE DIRECTEUR

> **Optimiser SANS regression. Ajouter SANS supprimer. Evoluer SANS detruire.**
> **Chaque projet doit etre production-ready. Pas de shortcuts. Pas d'excuses.**
