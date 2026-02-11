# Plan : CreatorShell — Interface hello-halo pour non-codeurs

## Contexte

L'approche precedente (cacher des elements dans l'UI existante) ne suffit pas. L'interface reste trop complexe car le layout fondamental (Sidebar + Kanban + Content) est concu pour des developpeurs. L'utilisateur veut une **refonte complete du shell** en mode Creator, inspiree de [hello-halo](https://github.com/openkursar/hello-halo) : pas de sidebar, chat-first, 3 ecrans seulement, rail de progression des taches.

**Principe cle** : Quand `userMode === 'creator'`, App.tsx rend un composant `<CreatorShell>` entierement different qui remplace Sidebar + Kanban + tout le layout. Le mode Developer reste inchange.

---

## Architecture

```
App.tsx
  |
  ├── isCreator ? <CreatorShell />     ← NOUVEAU (3 vues internes)
  |                  ├── CreatorHome       (accueil + taches actives)
  |                  ├── CreatorChat       (chat IA + rail de taches)
  |                  └── CreatorSettings   (mode + langue + theme)
  |
  └── else: <Sidebar /> + <Content />  ← INCHANGE (layout actuel)
```

**Zero changement au pipeline d'execution** : IPC, task-store, insights-store, agent-process, agent-queue restent identiques. CreatorShell est une couche UI pure qui consomme les memes stores Zustand.

---

## Nouveaux fichiers

Tous dans `apps/frontend/src/renderer/components/creator/` :

| Fichier | Role |
|---------|------|
| `CreatorShell.tsx` | Shell principal, routeur de vues (home/chat/settings) |
| `CreatorHeader.tsx` | Header fin ~48px (back, titre, new chat, settings) |
| `CreatorHome.tsx` | Accueil : hero input + cartes taches actives |
| `CreatorChat.tsx` | Chat IA reusant `insights-store` + creation inline de taches |
| `CreatorTaskRail.tsx` | Rail droit (300px) avec progression temps reel des taches |
| `CreatorTaskCard.tsx` | Carte de tache avec barre de progression |
| `CreatorApplyChanges.tsx` | Modal simplifiee pour appliquer les changements (merge) |
| `CreatorSettings.tsx` | Settings minimalistes (mode, langue, theme) |
| `index.ts` | Barrel export |

---

## Fichier modifie

| Fichier | Changement |
|---------|-----------|
| `App.tsx` (ligne ~829) | Ajouter : `if (isCreator && selectedProject) return <CreatorShell .../>` avant le layout actuel. Les modales globales (RateLimit, Auth, Onboarding, Toaster) restent rendues pour les deux modes. |
| `en/common.json` | Ajouter section `"creator": { ... }` (~30 cles) |
| `fr/common.json` | Idem en francais |

---

## Specifications par composant

### 1. CreatorShell.tsx

```
State interne : creatorView: 'home' | 'chat' | 'settings'

Initialisation :
  - useIpcListeners()  (meme que App.tsx — ecoute task progress/status/logs)
  - loadTasks(projectId)
  - setupInsightsListeners()

Render :
  <div class="h-screen flex flex-col bg-background">
    <CreatorHeader ... />
    {creatorView === 'home' && <CreatorHome />}
    {creatorView === 'chat' && <div class="flex flex-1">
      <CreatorChat class="flex-1" />
      <CreatorTaskRail class="w-[300px]" />
    </div>}
    {creatorView === 'settings' && <CreatorSettings />}
  </div>
```

**Props** : `projectId`, `projectName`

### 2. CreatorHeader.tsx

```
Layout :
  [← Back]  [Nom du projet]                    [+ Nouvelle conversation]  [⚙ Settings]

- Back : visible seulement si creatorView !== 'home'
- Nom du projet : texte non-interactif
- + Nouvelle conversation : appelle newSession(projectId) et navigue vers 'chat'
- Settings : navigue vers 'settings'
```

**Props** : `projectName`, `creatorView`, `onNavigate`, `onNewChat`

### 3. CreatorHome.tsx

```
Layout :
  ┌───────────────────────────────────────────────┐
  │                                               │
  │        Que voulez-vous creer ?                │
  │   Decrivez votre idee et l'IA la construit   │
  │                                               │
  │   [  Decrivez ce que vous voulez creer...  ]  │ ← input qui navigue vers chat
  │                                               │
  │   ── En cours ──────────────────────────────  │
  │   [TaskCard] [TaskCard] [TaskCard]            │
  │                                               │
  │   ── A valider ─────────────────────────────  │
  │   [TaskCard + bouton Appliquer]               │
  │                                               │
  │   ── Termines ──────────────────────────────  │
  │   [TaskCard] [TaskCard]                       │
  └───────────────────────────────────────────────┘

- Input focus → navigue vers 'chat' avec le texte pre-rempli
- Sections filtrees depuis useTaskStore :
  - "En cours" : status in_progress | ai_review
  - "A valider" : status human_review
  - "Termines" : status done (5 derniers)
```

**Stores utilises** : `useTaskStore` (tasks), `useInsightsStore` (sessions pour "Resume")

### 4. CreatorChat.tsx

**Reutilise entierement `insights-store`** — appelle les memes fonctions exportees :
- `loadInsightsSession(projectId)`
- `sendMessage(projectId, message)`
- `newSession(projectId)`, `switchSession()`, `deleteSession()`
- `createTaskFromSuggestion(projectId, title, desc, metadata)`
- `setupInsightsListeners()`

**Stores** : `useInsightsStore` (session, streaming, status, currentTool)

**Differences par rapport a Insights.tsx** :
1. **Auto-start** : apres `createTaskFromSuggestion()`, appelle aussi `startTask(task.id)` — la tache demarre immediatement
2. **Pas de sidebar** : l'historique des conversations est dans un dropdown/popover dans le header
3. **Boutons simplifies** : "Construire ca" au lieu de "Create Task"
4. **Empty state** : suggestions halo-style (site web, todo app, landing page, portfolio)

```
Layout :
  ┌──────────────────────────────────────┐
  │  Messages (scroll)                   │
  │  [User bubble] [AI bubble]           │
  │  [Suggestion Task Card]              │
  │     → "Construire ca" (auto-start)   │
  │                                      │
  │  ───────────────────────────────     │
  │  [  Decrivez ce que vous voulez  📤] │
  └──────────────────────────────────────┘
```

### 5. CreatorTaskRail.tsx

Rail droit (300px) visible uniquement en vue `chat`. Affiche les taches en temps reel.

```
Layout :
  ┌──────────────┐
  │ En cours     │
  │ [TaskCard]   │  ← barre de progression animee
  │ [TaskCard]   │
  │              │
  │ A valider    │
  │ [TaskCard]   │  ← bouton "Appliquer"
  │              │
  │ Recents      │
  │ [TaskCard]   │
  └──────────────┘
```

**Store** : `useTaskStore` (subscribe aux tasks, re-render sur chaque update de progression)

Groupes :
- **En cours** : `['in_progress', 'ai_review'].includes(status)`
- **A valider** : `status === 'human_review'`
- **Recents** : `status === 'done'`, trie par date, max 5

### 6. CreatorTaskCard.tsx

Carte reutilisable (Home + Rail).

```
┌──────────────────────────┐
│ 🔵 Construire un site    │
│ ████████░░░░  62%        │
│ Construction...           │
│ 5 sur 8 etapes terminees │
└──────────────────────────┘
```

**Props** : `task: Task`, `onClick`, `showApplyButton?`, `onApplyChanges?`, `compact?`

Labels de phase (creator-friendly) :
| Phase backend | Label Creator |
|---|---|
| idle | En attente |
| spec_creation | Comprend votre idee |
| planning | Planifie le travail |
| coding | Construction |
| validation | Verifie tout |
| merging | Finalise |
| complete | Termine |
| failed | Quelque chose a mal tourne |

Utilise `getTaskProgress(task)` de task-store pour `completed/total/percentage`.

### 7. CreatorApplyChanges.tsx

Modal simplifiee pour le merge. Remplace WorktreeCleanupDialog + le flow TaskReview complet.

```
┌──────────────────────────────────┐
│  ✓ Les changements sont prets    │
│                                  │
│  5 fichiers modifies             │
│  +120 lignes ajoutees            │
│                                  │
│  [Appliquer]       [Annuler]     │
└──────────────────────────────────┘
```

**IPC reutilises** :
- `window.electronAPI.getWorktreeStatus(taskId)` → resume des fichiers
- `window.electronAPI.mergeWorktree(taskId, { noCommit: false })` → applique
- `persistTaskStatus(taskId, 'done')` sur succes

**Gestion des conflits** : message simple "Changements incompatibles. Passez en mode Developpeur pour resoudre."

### 8. CreatorSettings.tsx

4 sections seulement :

1. **Mode d'experience** — Creator / Developer / Advanced (reutilise les cartes de ExperienceSettings)
2. **Langue** — Dropdown FR/EN
3. **Apparence** — Light/Dark/System
4. **Theme couleur** — 7 themes existants

**Store** : `useSettingsStore` — `saveSettings({ userMode, language, theme, colorTheme })`

Quand l'utilisateur passe en Developer → App.tsx re-render le layout standard automatiquement.

---

## Integration dans App.tsx

**Point d'insertion** : ligne ~829, avant `return (<ViewStateProvider>...)` :

```tsx
// Early return for Creator mode — completely different shell
if (isCreator && selectedProject) {
  return (
    <ViewStateProvider>
      <TooltipProvider>
        <ProactiveSwapListener />
        <CreatorShell
          projectId={activeProjectId || selectedProjectId!}
          projectName={selectedProject.name}
        />
        {/* Global modals still needed in Creator mode */}
        <RateLimitModal />
        <SDKRateLimitModal />
        <AuthFailureModal onOpenSettings={handleOpenSettings} />
        <OnboardingWizard ... />
        <AppUpdateNotification />
        <GlobalDownloadIndicator />
        <Toaster />
      </TooltipProvider>
    </ViewStateProvider>
  );
}
```

Les hooks globaux (useEffect pour theme, i18n, keyboard shortcuts, etc.) restent avant ce return et s'executent dans les deux modes.

---

## Cles i18n a ajouter

Section `"creator"` dans `en/common.json` et `fr/common.json` (~30 cles) :

```
creator.home.title / subtitle / activeTasks / needsAttention / recentlyDone / noTasks
creator.header.back / newChat / settings
creator.task.applyChanges / startBuilding / building / applied / applyError / stepsComplete
creator.task.phase.idle / spec_creation / planning / coding / validation / merging / complete / failed
creator.settings.title / experienceMode / language / theme / colorTheme
creator.chat.placeholder / historyDropdown
```

---

## Ordre d'implementation

| Phase | Contenu | Dependances |
|-------|---------|------------|
| **1** | CreatorShell + CreatorHeader + integration App.tsx | Aucune |
| **2** | CreatorHome + CreatorTaskCard | Phase 1 |
| **3** | CreatorChat (reuse insights-store) | Phase 1 |
| **4** | CreatorTaskRail (wire au chat) | Phase 2 + 3 |
| **5** | CreatorApplyChanges (merge flow) | Phase 2 |
| **6** | CreatorSettings | Phase 1 |
| **7** | i18n (en + fr) + polish | Toutes phases |

---

## Verification

1. **Switch de mode** : Settings → Creator → l'UI change completement. Settings → Developer → le layout standard revient intact.
2. **Chat fonctionne** : En Creator mode, envoyer un message → reponse de l'IA via le meme pipeline IPC.
3. **Auto-start** : Cliquer "Construire ca" sur une suggestion → tache creee ET demarree. Visible dans le rail.
4. **Progression live** : Pendant l'execution, la barre de progression et les phases se mettent a jour en temps reel.
5. **Appliquer les changements** : Tache terminee → "Appliquer" → merge reussi → tache passe a "done".
6. **Modales globales** : Rate limit, auth failure, onboarding wizard fonctionnent toujours en Creator mode.
7. **TypeScript** : `npm run typecheck` → 0 erreurs.
8. **Tests** : `npm test` → aucune regression.
9. **i18n** : Toutes les chaines utilisent des cles de traduction, EN et FR complets.
