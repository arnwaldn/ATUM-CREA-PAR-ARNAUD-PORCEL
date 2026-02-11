# Electron App Template

> ULTRA-CREATE Template - Application Desktop avec Electron

## Stack

- **Framework**: Electron 33
- **Renderer**: React 18 + Vite
- **Styling**: TailwindCSS 4
- **Storage**: electron-store (persistance locale)
- **Updates**: electron-updater (auto-update)
- **Build**: electron-builder (multi-platform)

## Installation

```bash
# Installer les dépendances
npm install

# Lancer en développement
npm run dev

# Build pour production
npm run package
```

## Structure

```
├── src/
│   ├── main/                    # Process principal Electron
│   │   ├── index.ts             # Entry point main process
│   │   └── preload.ts           # Preload script (bridge IPC)
│   ├── renderer/                # Interface React
│   │   ├── App.tsx              # Composant principal
│   │   ├── main.tsx             # Entry point renderer
│   │   └── components/          # Composants UI
│   └── shared/                  # Types partagés
│       └── types.ts
├── dist/                        # Build output
├── release/                     # Packages installeurs
└── package.json
```

## Architecture Electron

```
┌─────────────────────────────────────────────────────┐
│                   Main Process                      │
│  - Gère les fenêtres (BrowserWindow)               │
│  - Accès système (fs, os, path)                    │
│  - IPC handlers                                     │
└───────────────────────┬─────────────────────────────┘
                        │ IPC (contextBridge)
┌───────────────────────▼─────────────────────────────┐
│                 Renderer Process                    │
│  - React UI                                         │
│  - window.electronAPI                               │
│  - Pas d'accès direct au système                   │
└─────────────────────────────────────────────────────┘
```

## Communication IPC

### Main → Renderer
```typescript
// main/index.ts
mainWindow.webContents.send('update-available', version)

// renderer/App.tsx
window.electronAPI.onUpdateAvailable((version) => {
  console.log('Update:', version)
})
```

### Renderer → Main
```typescript
// renderer/App.tsx
const result = await window.electronAPI.readFile(path)

// main/index.ts
ipcMain.handle('read-file', async (event, path) => {
  return fs.readFileSync(path, 'utf-8')
})
```

## Build Multi-Platform

```bash
# Windows (.exe)
npm run package:win

# macOS (.dmg)
npm run package:mac

# Linux (.AppImage)
npm run package:linux

# Tous
npm run package
```

## Features Incluses

- ✅ Hot reload en développement
- ✅ IPC sécurisé avec contextBridge
- ✅ Persistance locale (electron-store)
- ✅ Auto-updates (electron-updater)
- ✅ Build multi-platform
- ✅ TypeScript strict

## Configuration

### electron-store
```typescript
import Store from 'electron-store'

const store = new Store({
  defaults: {
    theme: 'system',
    windowBounds: { width: 1200, height: 800 }
  }
})
```

### Auto-updates
```typescript
import { autoUpdater } from 'electron-updater'

autoUpdater.checkForUpdatesAndNotify()
```

---

*Template ULTRA-CREATE v22.3*
