# {{APP_NAME}}

Application mobile créée avec ULTRA-CREATE.

## Stack

- **Expo SDK 52** - Framework React Native
- **React Native 0.76** - UI native
- **TypeScript 5.7** - Typage statique
- **NativeWind 4** - TailwindCSS pour React Native
- **Supabase** - Backend (Auth + Database)
- **Zustand** - State management

## Installation

```bash
npm install
```

## Développement

```bash
# Démarrer le serveur de développement
npm start

# iOS
npm run ios

# Android
npm run android
```

## Configuration

1. Copier `.env.example` vers `.env`
2. Configurer les variables Supabase

## Structure

```
app/
├── _layout.tsx      # Layout racine
├── index.tsx        # Écran d'accueil
├── (auth)/          # Écrans d'authentification
└── (tabs)/          # Navigation principale
components/          # Composants réutilisables
lib/                 # Utilitaires (Supabase, etc.)
stores/              # State management Zustand
```

---

Généré par ULTRA-CREATE v19.0
