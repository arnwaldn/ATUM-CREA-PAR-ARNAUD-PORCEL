# Electron Development Patterns

## Vue d'Ensemble

Ce document centralise les patterns éprouvés pour le développement d'applications Electron, particulièrement pour les projets complexes avec communication IPC, state management, et intégration de services externes.

---

## 1. Architecture Multi-Process

### Structure Recommandée
```
src/
├── main/                    # Process principal (Node.js)
│   ├── main.ts             # Point d'entrée, création fenêtre
│   ├── preload.ts          # Bridge sécurisé Main↔Renderer
│   ├── ipc-handlers/       # Handlers IPC organisés par domaine
│   │   ├── api.ts
│   │   ├── storage.ts
│   │   └── trading.ts
│   └── services/           # Services backend
│       ├── database.ts
│       └── external-api.ts
├── renderer/               # Process renderer (React/Vue)
│   ├── App.tsx
│   ├── components/
│   ├── hooks/
│   └── store/              # State management (Zustand/Redux)
└── shared/                 # Types et constantes partagés
    ├── types.ts
    └── constants.ts
```

### Flux de Données
```
User Input → Renderer → IPC → Main Process → External Service
                ↑                    ↓
            State Update ← IPC ← Result
```

---

## 2. Communication IPC

### Pattern: Persist-Then-Notify (PTN)
**Problème:** Race condition entre IPC et configuration des listeners React.

**Solution:**
```typescript
// main.ts
async function handleCreateData(data: MyData) {
  // 1. PERSIST: Écrire directement dans localStorage du renderer
  await mainWindow.webContents.executeJavaScript(`
    localStorage.setItem("myData", ${JSON.stringify(JSON.stringify(data))})
  `)

  // 2. NOTIFY: Informer le renderer de recharger
  mainWindow.webContents.send('data-updated', { action: 'reload' })

  return { success: true }
}

// App.tsx
useEffect(() => {
  const handleDataUpdated = ({ action }) => {
    if (action === 'reload') {
      // 3. RELOAD: Charger depuis localStorage (source de vérité)
      store.loadFromLocalStorage()
    }
  }
  window.electronAPI.onDataUpdated(handleDataUpdated)
  return () => window.electronAPI.removeListener('data-updated')
}, [])
```

### Pattern: Request-Response avec invoke/handle
**Utilisation:** Opérations synchrones nécessitant une réponse.

```typescript
// main.ts
ipcMain.handle('fetch-data', async (event, params) => {
  try {
    const result = await fetchData(params)
    return { success: true, data: result }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

// preload.ts
fetchData: (params) => ipcRenderer.invoke('fetch-data', params)

// renderer
const result = await window.electronAPI.fetchData(params)
if (result.success) {
  setData(result.data)
}
```

### Pattern: Event Stream
**Utilisation:** Données en temps réel, streaming.

```typescript
// main.ts - Streaming de messages AI
ipcMain.handle('stream-message', async (event, message) => {
  for await (const chunk of streamAPI(message)) {
    mainWindow.webContents.send('message-chunk', chunk)
  }
  mainWindow.webContents.send('message-complete', { usage })
})

// App.tsx
useEffect(() => {
  window.electronAPI.onMessageChunk((chunk) => {
    setContent(prev => prev + chunk)
  })
  window.electronAPI.onMessageComplete(({ usage }) => {
    setLoading(false)
    updateUsageStats(usage)
  })
}, [])
```

---

## 3. State Management

### Source de Vérité: localStorage
```typescript
// useStore.ts (Zustand)
interface Store {
  data: MyData[]
  loadFromLocalStorage: () => void
  saveToLocalStorage: () => void
  addData: (item: MyData) => void
}

const useStore = create<Store>((set, get) => ({
  data: [],

  loadFromLocalStorage: () => {
    const saved = localStorage.getItem('myData')
    if (saved) {
      set({ data: JSON.parse(saved) })
    }
  },

  saveToLocalStorage: () => {
    localStorage.setItem('myData', JSON.stringify(get().data))
  },

  addData: (item) => {
    set(state => {
      const newData = [...state.data, item]
      localStorage.setItem('myData', JSON.stringify(newData))
      return { data: newData }
    })
  }
}))
```

### Version Counter pour forcer les re-renders
```typescript
interface Store {
  data: MyData[]
  dataVersion: number  // Incrémenté à chaque modification

  updateData: (id: string, updates: Partial<MyData>) => void
}

// Dans les composants
const data = useStore(state => state.data)
const version = useStore(state => state.dataVersion)

useEffect(() => {
  // Se déclenche à chaque changement de version
}, [version])
```

---

## 4. Sécurité

### Preload Script Sécurisé
```typescript
// preload.ts
import { contextBridge, ipcRenderer } from 'electron'

// ✅ Exposer uniquement les fonctions nécessaires
const electronAPI = {
  // Utiliser invoke pour les opérations avec réponse
  fetchData: (params: Params) => ipcRenderer.invoke('fetch-data', params),

  // Listeners avec cleanup
  onDataUpdated: (callback: (data: any) => void) => {
    ipcRenderer.removeAllListeners('data-updated')
    ipcRenderer.on('data-updated', (_, data) => callback(data))
  }
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)

// ❌ NE JAMAIS exposer ipcRenderer directement
// contextBridge.exposeInMainWorld('ipcRenderer', ipcRenderer)
```

### Configuration Sécurisée
```typescript
// main.ts
const mainWindow = new BrowserWindow({
  webPreferences: {
    nodeIntegration: false,      // ✅ Désactiver Node dans renderer
    contextIsolation: true,      // ✅ Isoler les contextes
    sandbox: true,               // ✅ Activer le sandbox
    preload: path.join(__dirname, 'preload.js')
  }
})
```

---

## 5. Performance

### Batching des IPC
```typescript
// ❌ Multiple IPC calls
for (const item of items) {
  await window.electronAPI.saveItem(item)
}

// ✅ Un seul appel batch
await window.electronAPI.saveItems(items)
```

### Throttling des événements fréquents
```typescript
// Limiter les mises à jour de prix (ex: toutes les 100ms)
const throttledPriceUpdate = throttle((prices) => {
  mainWindow.webContents.send('prices-updated', prices)
}, 100)
```

### Lazy Loading des modules
```typescript
// main.ts - Charger les modules lourds uniquement si nécessaire
ipcMain.handle('complex-operation', async () => {
  const heavyModule = await import('./heavy-module')
  return heavyModule.process()
})
```

---

## 6. Error Handling

### Pattern: Error Boundary Global
```typescript
// main.ts
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error)
  // Notification à l'utilisateur, logs, etc.
})

// App.tsx
<ErrorBoundary fallback={<ErrorScreen />}>
  <App />
</ErrorBoundary>
```

### IPC Error Propagation
```typescript
// main.ts
ipcMain.handle('risky-operation', async (event, params) => {
  try {
    return { success: true, data: await riskyOperation(params) }
  } catch (error) {
    console.error('[IPC] risky-operation failed:', error)
    return {
      success: false,
      error: error.message,
      code: error.code || 'UNKNOWN'
    }
  }
})

// renderer
const result = await window.electronAPI.riskyOperation(params)
if (!result.success) {
  toast.error(`Erreur: ${result.error}`)
  return
}
```

---

## 7. Testing

### Tests IPC
```typescript
// __tests__/ipc.test.ts
describe('IPC Handlers', () => {
  it('should handle fetch-data', async () => {
    const mockEvent = {} as IpcMainInvokeEvent
    const result = await handleFetchData(mockEvent, { id: '123' })
    expect(result.success).toBe(true)
  })
})
```

### Mocking electronAPI
```typescript
// __mocks__/electronAPI.ts
export const mockElectronAPI = {
  fetchData: jest.fn().mockResolvedValue({ success: true, data: [] }),
  onDataUpdated: jest.fn()
}

// Dans les tests
window.electronAPI = mockElectronAPI
```

---

## 8. Checklist Production

### Avant Release
- [ ] `nodeIntegration: false`
- [ ] `contextIsolation: true`
- [ ] Tous les IPC utilisent invoke/handle ou ont des handlers
- [ ] Error boundaries en place
- [ ] Logs structurés (pas de console.log en prod)
- [ ] localStorage validé et nettoyé
- [ ] Tests IPC passent
- [ ] Performance: pas de memory leaks

### Monitoring
- [ ] Crash reports configurés
- [ ] Analytics des erreurs
- [ ] Métriques de performance

---

## Références

- [Electron Security Checklist](https://www.electronjs.org/docs/latest/tutorial/security)
- [IPC Best Practices](https://www.electronjs.org/docs/latest/tutorial/ipc)
- [Performance Tips](https://www.electronjs.org/docs/latest/tutorial/performance)
