# Desktop App Workflow

## Objectif
Creer une application desktop cross-platform avec Tauri 2.0 + React 19.

## Temps Realiste
- App simple (notes, timer) : 15-25 min
- App complexe (dashboard, file manager) : 30-45 min

## Stack

```
Framework : Tauri 2.0
Frontend  : React 19, TypeScript 5.7, TailwindCSS 4, shadcn/ui
State     : Zustand
Storage   : SQLite (via Tauri SQL plugin) ou fichiers locaux
Build     : Vite 6
Platforms : Windows, macOS, Linux
```

---

## Phase 1 : Research & Setup (3 min)

### MCPs Utilises
- Context7 : doc Tauri 2.0 a jour
- Memory MCP : patterns desktop precedents

### Actions
1. Context7 : verifier API Tauri 2.0 (commands, events, plugins)
2. Creer le projet : `npm create tauri-app@latest`
3. Configurer Tauri :
   ```toml
   # src-tauri/tauri.conf.json
   {
     "productName": "Mon App",
     "version": "0.1.0",
     "identifier": "com.atum.monapp",
     "build": { "frontendDist": "../dist" },
     "app": {
       "windows": [{ "title": "Mon App", "width": 1200, "height": 800 }]
     }
   }
   ```
4. Installer les plugins necessaires (sql, fs, dialog, notification, shell)

### Output
- Projet Tauri initialise, fenetre ouverte

---

## Phase 2 : Backend Rust (5-10 min)

### Actions
1. **Commandes Tauri** (src-tauri/src/lib.rs)
   ```rust
   #[tauri::command]
   fn greet(name: &str) -> String {
       format!("Hello, {}!", name)
   }
   ```

2. **Plugins Tauri** selon besoin :
   - `tauri-plugin-sql` : base SQLite locale
   - `tauri-plugin-fs` : acces fichiers
   - `tauri-plugin-dialog` : dialogs natifs (open, save)
   - `tauri-plugin-notification` : notifications systeme
   - `tauri-plugin-shell` : execution de commandes
   - `tauri-plugin-store` : key-value persistence

3. **Base de donnees** (si necessaire)
   - Schema SQLite avec migrations
   - CRUD operations via commandes Tauri

4. **Systeme de fichiers**
   - Chemins app data : `app_data_dir`, `app_config_dir`
   - Read/write fichiers avec `tauri-plugin-fs`

### Output
- Backend Rust fonctionnel avec commandes exposees

---

## Phase 3 : Frontend React (10-20 min)

### Actions
1. **Layout principal**
   - Sidebar navigation (si multi-pages)
   - Header avec window controls custom (optional)
   - Content area responsive

2. **Integration Tauri-React**
   ```typescript
   import { invoke } from '@tauri-apps/api/core';
   
   const result = await invoke<string>('greet', { name: 'World' });
   ```

3. **Components UI** (shadcn/ui)
   - Formulaires avec validation
   - Tables de donnees
   - Dialogs et modals
   - Toast notifications

4. **State Management** (Zustand)
   - Store principal
   - Persistence via tauri-plugin-store

5. **Tray & Menu** (si necessaire)
   - System tray icon
   - Context menu natif
   - Raccourcis clavier globaux

### Output
- Interface React connectee au backend Tauri

---

## Phase 4 : Polish & Test (5 min)

### MCPs Utilises
- AI Browser : impossible (app desktop), tester via `cargo tauri dev`

### Actions
1. Test en mode dev : `cargo tauri dev`
2. Verifier toutes les commandes Tauri
3. Tester les dialogs natifs
4. Verifier la persistence des donnees
5. Icons et splash screen :
   - `src-tauri/icons/` (png 32x32 a 1024x1024)
6. Metadata : version, description, auteur

### Output
- App fonctionnelle et polie

---

## Phase 5 : Build & Distribution (3 min)

### Actions
1. Build production : `cargo tauri build`
2. Artefacts generes :
   - Windows : `.msi` + `.exe` (NSIS)
   - macOS : `.dmg` + `.app`
   - Linux : `.deb` + `.AppImage`
3. Signature (optionnel) : configurer signing keys
4. Auto-update (optionnel) : `tauri-plugin-updater`

### Output
- Installeurs prets pour distribution

---

## Structure Finale

```
src/                         # Frontend React
├── App.tsx                  # Root component
├── main.tsx                 # Entry point
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── MainLayout.tsx
│   └── ui/                  # shadcn/ui components
├── pages/
│   ├── Home.tsx
│   ├── Settings.tsx
│   └── About.tsx
├── stores/
│   └── appStore.ts          # Zustand store
├── lib/
│   ├── tauri.ts             # Tauri invoke wrappers
│   └── utils.ts
├── styles/
│   └── globals.css          # TailwindCSS
├── index.html
├── vite.config.ts
└── tsconfig.json

src-tauri/                   # Backend Rust
├── src/
│   ├── lib.rs               # Commands + setup
│   └── main.rs              # Entry point
├── tauri.conf.json          # App config
├── Cargo.toml               # Rust dependencies
├── icons/                   # App icons
└── capabilities/            # Permission capabilities
```

---

## Checklist
- [ ] `cargo tauri dev` lance sans erreur
- [ ] Commandes Tauri fonctionnelles depuis React
- [ ] Persistence des donnees (SQLite ou store)
- [ ] Dialogs natifs fonctionnels
- [ ] Icons configures pour toutes les plateformes
- [ ] Build production genere les installeurs

---

**Workflow:** Desktop | **Temps:** 15-45 min | **Stack:** Tauri 2.0 + React 19 + TypeScript + Rust
