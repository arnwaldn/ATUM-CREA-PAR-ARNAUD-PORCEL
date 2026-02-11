# Tauri Desktop App Template

## Stack
- Tauri 2.0
- React + TypeScript
- TailwindCSS + shadcn/ui
- SQLite (local database)
- Zustand (state management)

## Structure
```
src/
├── components/
│   ├── ui/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── MainLayout.tsx
│   └── features/
├── hooks/
├── lib/
│   ├── tauri.ts      # Tauri API helpers
│   ├── database.ts   # SQLite helpers
│   └── utils.ts
├── stores/
├── types/
├── App.tsx
└── main.tsx
src-tauri/
├── src/
│   ├── main.rs       # Entry point
│   ├── lib.rs        # Commands
│   └── database.rs   # SQLite
├── Cargo.toml
├── tauri.conf.json
└── icons/
```

## Features
- [x] Native window controls
- [x] System tray
- [x] Auto-updater
- [x] Local SQLite database
- [x] File system access
- [x] Notifications
- [x] Multi-window support
- [x] Cross-platform (Win/Mac/Linux)

## Build Outputs
| Platform | Format |
|----------|--------|
| Windows | .exe, .msi |
| macOS | .dmg, .app |
| Linux | .AppImage, .deb |

## Commands
```bash
pnpm dev              # Development
pnpm tauri dev        # Dev with Tauri
pnpm tauri build      # Production build
```

## Bundle Sizes
- Tauri: ~5-10MB
- Electron: ~150MB+

## Tauri Commands Example
```rust
// src-tauri/src/lib.rs
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}!", name)
}

#[tauri::command]
async fn save_data(data: String) -> Result<(), String> {
    // Save to SQLite
    Ok(())
}
```
