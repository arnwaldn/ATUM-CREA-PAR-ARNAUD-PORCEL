# Trading Brain IA - Architecture Reference

## Vue d'Ensemble

Trading Brain IA est une application desktop Electron permettant d'interagir avec un assistant IA pour le trading sur MetaTrader 5. L'architecture combine React/TypeScript côté frontend avec des serveurs MCP Python pour l'intégration MT5.

---

## Stack Technique

| Couche | Technologies |
|--------|-------------|
| **Desktop** | Electron 33.x |
| **Frontend** | React 18, TypeScript 5, TailwindCSS |
| **State** | Zustand avec persistence localStorage |
| **AI** | Anthropic Claude API (streaming) |
| **Trading** | MetaTrader 5 via Python MCP servers |
| **Build** | Vite, electron-builder |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        ELECTRON APP                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐    IPC    ┌──────────────────────────────┐   │
│  │   RENDERER   │◄────────►│        MAIN PROCESS           │   │
│  │   (React)    │           │                              │   │
│  │              │           │  ┌────────────────────────┐  │   │
│  │  - Chat UI   │           │  │   Anthropic Client     │  │   │
│  │  - Panels    │           │  │   (Claude API)         │  │   │
│  │  - Store     │           │  └──────────┬─────────────┘  │   │
│  │              │           │             │                │   │
│  └──────────────┘           │  ┌──────────▼─────────────┐  │   │
│                             │  │   MCP Client           │  │   │
│                             │  │   (Tool Execution)     │  │   │
│                             │  └──────────┬─────────────┘  │   │
│                             └─────────────┼────────────────┘   │
└───────────────────────────────────────────┼─────────────────────┘
                                            │
                    ┌───────────────────────┼───────────────────────┐
                    │                       │                       │
           ┌────────▼────────┐    ┌────────▼────────┐    ┌────────▼────────┐
           │  MCP MT5 Server │    │ MCP Account     │    │ MCP Technical   │
           │  (Python)       │    │ Actions (Py)    │    │ Analysis (Py)   │
           │                 │    │                 │    │                 │
           │ - Market Data   │    │ - Open Trade    │    │ - Indicators    │
           │ - Positions     │    │ - Close Trade   │    │ - Patterns      │
           │ - Orders        │    │ - Modify SL/TP  │    │ - Signals       │
           └────────┬────────┘    └────────┬────────┘    └────────┬────────┘
                    │                      │                      │
                    └──────────────────────┼──────────────────────┘
                                           │
                                  ┌────────▼────────┐
                                  │  MetaTrader 5   │
                                  │  (Terminal)     │
                                  └─────────────────┘
```

---

## Structure des Fichiers

```
Trading Brain developement/
├── src/
│   ├── main/                          # Process Electron principal
│   │   ├── main.ts                    # ~4500 lignes - Cœur de l'app
│   │   ├── preload.ts                 # Bridge IPC sécurisé
│   │   ├── price-alerts-tools.ts      # Outils alertes prix
│   │   ├── scheduled-tasks-tools.ts   # Outils tâches programmées
│   │   └── prompts/                   # System prompts AI
│   │       └── system-prompt.ts
│   │
│   └── renderer/                      # Interface React
│       ├── App.tsx                    # Point d'entrée, routing
│       ├── components/
│       │   ├── ChatInterface.tsx      # Interface chat principal
│       │   ├── Sidebar.tsx            # Navigation
│       │   ├── MarketWatch/           # Données marché temps réel
│       │   ├── JournalPanel.tsx       # Journal de trading
│       │   └── TachesProgrammeesPanel.tsx  # Tâches + Alertes
│       ├── hooks/
│       │   ├── useTachesScheduler.ts  # Scheduler tâches
│       │   └── usePriceAlertsChecker.ts  # Checker alertes prix
│       └── store/
│           └── useStore.ts            # Zustand store (~700 lignes)
│
├── mcp-server/                        # Serveurs MCP Python
│   ├── mcp-metatrader5-server/        # Connexion MT5
│   │   └── src/metatrader5_server/
│   │       └── server.py
│   ├── mcp-account-actions/           # Actions de trading
│   │   └── src/account_actions/
│   │       └── server.py
│   ├── mcp-technical-analysis/        # Analyse technique
│   │   └── src/technical_analysis/
│   │       └── server.py
│   ├── mcp-mt5-verification/          # Vérification ordres
│   │   └── src/mt5_verification/
│   │       └── server.py
│   └── mt5_ipc_lock.py               # Mutex inter-process MT5
│
├── dist/                              # Build output
├── package.json
├── vite.config.ts
└── electron-builder.yml
```

---

## Flux de Données

### 1. Message Utilisateur → Réponse AI

```
1. User tape message dans ChatInterface
2. ChatInterface → store.sendMessage()
3. store → window.electronAPI.streamMessage()
4. preload → ipcRenderer.invoke('stream-message')
5. main.ts → Anthropic API (streaming)
6. Chunks → mainWindow.send('message-chunk')
7. preload → renderer callback
8. ChatInterface met à jour le message en temps réel
9. Fin → 'message-complete' avec usage stats
```

### 2. Tool Call (ex: ouvrir position)

```
1. AI décide d'utiliser mt5_open_trade_safe
2. main.ts détecte tool_use block
3. main.ts → MCP Client → account_actions server
4. Python server → MT5 API → order_send
5. Résultat → main.ts
6. main.ts → tool_result → AI
7. AI formule réponse finale
```

### 3. Alerte Prix (création)

```
1. AI appelle create_price_alert
2. main.ts exécute l'outil
3. main.ts écrit DIRECTEMENT dans localStorage (via executeJavaScript)
4. main.ts envoie IPC 'price-alert-action'
5. App.tsx handler → store.loadAlertesPrix()
6. UI se met à jour
```

### 4. Alerte Prix (déclenchement)

```
1. usePriceAlertsChecker (toutes les 2s)
2. Récupère prix via mt5GetMarketWatch
3. Compare avec alertes actives
4. Si condition remplie:
   - Notification desktop
   - store.incrementDeclenchement()
   - Si non répétable: store.toggleAlertePrix(false)
```

---

## Points Critiques

### IPC Timing
**Problème:** Race condition entre IPC et listeners React
**Solution:** Pattern Persist-Then-Notify (PTN)

```typescript
// main.ts - Écrire AVANT d'envoyer IPC
await mainWindow.webContents.executeJavaScript(`
  localStorage.setItem("alertesPrix", ${JSON.stringify(JSON.stringify(alerts))})
`)
mainWindow.webContents.send('price-alert-action', { action: 'create' })

// App.tsx - Recharger depuis localStorage
store.loadAlertesPrix()
```

### MCP IPC Lock
**Problème:** MT5 API non thread-safe
**Solution:** Mutex partagé entre tous les serveurs MCP

```python
# mt5_ipc_lock.py
class MT5IPCLock:
    def __init__(self):
        self.lock = threading.Lock()
        self.lock_file = Path(tempfile.gettempdir()) / "mt5_ipc.lock"

    def acquire(self, timeout=30):
        # File-based lock pour inter-process
        ...
```

### Triple Protection Anti-Boucle (Tâches Programmées)
**Problème:** Une tâche IA pourrait créer une autre tâche, créant une boucle infinie

```
Niveau 1 (main.ts):
  if (!isScheduledTaskExecution) tools.push(...SCHEDULED_TASKS_TOOLS)

Niveau 2 (useTachesScheduler):
  executionContext: 'scheduled_task'

Niveau 3 (System Prompt):
  "⛔ create_scheduled_task DOES NOT EXIST in this context"
```

---

## State Management

### Zustand Store Structure

```typescript
interface Store {
  // Conversations
  conversations: Conversation[]
  currentConversationId: string | null

  // UI State
  showSettings: boolean
  showJournal: boolean
  showMarketWatch: boolean
  // ...

  // Tâches Programmées
  tachesProgrammees: TacheProgrammee[]
  addTacheProgrammee: (tache) => void
  // ...

  // Alertes Prix
  alertesPrix: AlertePrix[]
  alertesPrixVersion: number  // Force re-render
  addAlertePrix: (alerte) => void
  // ...

  // Settings
  settings: Settings
  loadSettings: () => Promise<void>
  saveSettings: (settings) => Promise<void>
}
```

### Persistence Pattern
```typescript
// Toutes les mutations écrivent immédiatement dans localStorage
addAlertePrix: (alerte) => {
  set(state => {
    const newAlerte = {
      ...alerte,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    }
    const updated = [...state.alertesPrix, newAlerte]
    localStorage.setItem('alertesPrix', JSON.stringify(updated))
    return {
      alertesPrix: updated,
      alertesPrixVersion: state.alertesPrixVersion + 1
    }
  })
}
```

---

## Serveurs MCP

### mcp-metatrader5-server
- **Outils:** mt5_initialize, mt5_get_positions, mt5_get_symbol_info, mt5_copy_rates, etc.
- **Rôle:** Lecture données MT5, pas d'actions de trading

### mcp-account-actions
- **Outils:** mt5_open_trade_safe, mt5_close_position_safe, mt5_modify_sltp_safe, etc.
- **Rôle:** Actions de trading avec vérification

### mcp-technical-analysis
- **Outils:** calculate_indicator, detect_pattern, multi_timeframe_analysis
- **Rôle:** Calculs techniques avancés

### mcp-mt5-verification
- **Outils:** verify_position, verify_order
- **Rôle:** Double vérification des opérations

---

## Debugging

### Logs par couche
```
[Renderer] console.log dans DevTools
[Main] console.log dans terminal Electron
[MCP] stderr des serveurs Python
[MT5] mt5.last_error()
```

### Emojis de debug
```
📥 Réception IPC/données
📤 Envoi IPC/données
✅ Succès
❌ Erreur
🔄 Rechargement/mise à jour
⚠️ Warning
🔌 Connexion
```

---

## Fichiers Clés pour Debugging

| Problème | Fichiers à vérifier |
|----------|---------------------|
| IPC ne fonctionne pas | preload.ts, main.ts (handlers) |
| State pas mis à jour | useStore.ts, App.tsx (handlers) |
| Tool call échoue | main.ts (MCP client), server.py concerné |
| Alerte non créée | main.ts:1790-1830, App.tsx:117-225 |
| Tâche non exécutée | useTachesScheduler.ts |
| MT5 timeout | mt5_ipc_lock.py, server.py (acquire lock) |

---

## Checklist Maintenance

- [ ] Vérifier les logs console pour erreurs
- [ ] Tester les IPC après modifications main.ts
- [ ] Valider localStorage après modifications store
- [ ] Tester le scheduler après modifications tâches
- [ ] Vérifier le lock MT5 si timeout
- [ ] Build et test après modifications TypeScript
