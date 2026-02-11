# {{APP_NAME}}

Application desktop créée avec ULTRA-CREATE.

## Stack

- **Tauri 2.0** - Framework desktop natif
- **React 19** - UI
- **TypeScript 5.7** - Typage statique
- **Vite 6** - Build tool
- **TailwindCSS** - Styling

## Prérequis

- Node.js 20+
- Rust (via rustup)
- Tauri CLI: `cargo install tauri-cli`

## Installation

```bash
npm install
```

## Développement

```bash
npm run tauri:dev
```

## Build

```bash
npm run tauri:build
```

Les executables sont dans `src-tauri/target/release/`.

## Structure

```
src/                 # Frontend React
├── App.tsx
├── main.tsx
└── index.css
src-tauri/           # Backend Rust
├── src/lib.rs
├── Cargo.toml
└── tauri.conf.json
```

---

Généré par ULTRA-CREATE v19.0
