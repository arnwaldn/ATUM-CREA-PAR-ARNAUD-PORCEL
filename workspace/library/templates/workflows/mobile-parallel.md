# Mobile App Parallel Workflow

## Objectif
Générer une application mobile (iOS + Android) en **< 4 minutes** avec **15-18 agents en parallèle**.

## Timeline

```
0s ──── 75s ──── 150s ──── 200s ──── 240s
│        │        │         │         │
▼        ▼        ▼         ▼         ▼
PHASE 1  PHASE 2  PHASE 3   PHASE 4   DONE
Foundation Screens Quality  Build
(6 agents)(7 agents)(3 agents)(2 agents)
```

## Phase 1: Foundation (0-75s) - 6 Agents Parallèles

```yaml
agents:
  agent-1:
    name: ui-super
    task: navigation_setup
    files:
      - app/_layout.tsx
      - app/(tabs)/_layout.tsx
      - app/(auth)/_layout.tsx
      - components/navigation/TabBar.tsx
    template: |
      - Tab navigation (bottom)
      - Stack navigation
      - Auth flow navigation
      - Deep linking setup
    mcps: [context7]
    estimated: 18s

  agent-2:
    name: backend-super
    task: api_client
    files:
      - lib/api.ts
      - lib/auth.ts
      - stores/authStore.ts
      - types/api.ts
    template: |
      - Axios/Fetch client
      - Auth token management
      - Request/Response interceptors
      - Error handling
    estimated: 15s

  agent-3:
    name: backend-super
    task: state_management
    files:
      - stores/index.ts
      - stores/userStore.ts
      - stores/appStore.ts
      - lib/storage.ts
    template: |
      - Zustand stores
      - Async storage persistence
      - State hydration
    estimated: 12s

  agent-4:
    name: ui-super
    task: theme_system
    files:
      - constants/Colors.ts
      - constants/Layout.ts
      - constants/Typography.ts
      - components/ui/ThemedView.tsx
      - components/ui/ThemedText.tsx
    template: |
      - Light/Dark mode
      - Custom colors
      - Typography scale
      - Spacing system
    estimated: 10s

  agent-5:
    name: backend-super
    task: push_notifications
    files:
      - lib/notifications.ts
      - app.json (expo config)
    template: |
      - Expo notifications setup
      - Permission handling
      - Token registration
      - Notification handlers
    mcps: [expo]
    estimated: 15s

  agent-6:
    name: research-super
    task: app_config
    files:
      - app.json
      - eas.json
      - metro.config.js
    template: |
      - App name, icons, splash
      - EAS build config
      - Environment variables
    estimated: 10s
```

**Barrier: Phase 1 Complete**

## Phase 2: Screens (75-150s) - 7 Agents

```yaml
agents:
  agent-7:
    name: ui-super
    task: auth_screens
    dependencies: [agent-1, agent-2]
    files:
      - app/(auth)/sign-in.tsx
      - app/(auth)/sign-up.tsx
      - app/(auth)/forgot-password.tsx
      - components/auth/AuthForm.tsx
    estimated: 20s

  agent-8:
    name: ui-super
    task: home_screen
    dependencies: [agent-1, agent-3]
    files:
      - app/(tabs)/index.tsx
      - components/home/Header.tsx
      - components/home/FeaturedSection.tsx
      - components/home/QuickActions.tsx
    estimated: 18s

  agent-9:
    name: ui-super
    task: list_screen
    dependencies: [agent-1, agent-2]
    files:
      - app/(tabs)/list.tsx
      - components/list/ListItem.tsx
      - components/list/ListHeader.tsx
      - components/list/EmptyState.tsx
    template: |
      - FlashList for performance
      - Pull to refresh
      - Infinite scroll
      - Search/Filter
    estimated: 20s

  agent-10:
    name: ui-super
    task: detail_screen
    dependencies: [agent-1]
    files:
      - app/[id].tsx
      - components/detail/DetailHeader.tsx
      - components/detail/DetailContent.tsx
      - components/detail/ActionButtons.tsx
    estimated: 18s

  agent-11:
    name: ui-super
    task: profile_screen
    dependencies: [agent-1, agent-3]
    files:
      - app/(tabs)/profile.tsx
      - components/profile/ProfileHeader.tsx
      - components/profile/SettingsList.tsx
    estimated: 15s

  agent-12:
    name: ui-super
    task: settings_screen
    dependencies: [agent-1]
    files:
      - app/settings/index.tsx
      - app/settings/notifications.tsx
      - app/settings/appearance.tsx
      - components/settings/SettingRow.tsx
    estimated: 15s

  agent-13:
    name: ui-super
    task: shared_components
    files:
      - components/ui/Button.tsx
      - components/ui/Input.tsx
      - components/ui/Card.tsx
      - components/ui/Avatar.tsx
      - components/ui/Badge.tsx
      - components/ui/Modal.tsx
    estimated: 20s
```

**Barrier: Phase 2 Complete**

## Phase 3: Quality (150-200s) - 3 Agents

```yaml
agents:
  agent-14:
    name: quality-super
    task: unit_tests
    files:
      - __tests__/stores.test.ts
      - __tests__/api.test.ts
      - __tests__/components.test.tsx
    estimated: 25s

  agent-15:
    name: quality-super
    task: e2e_tests
    files:
      - e2e/auth.e2e.ts
      - e2e/navigation.e2e.ts
    template: |
      - Detox for E2E
      - Critical user flows
    estimated: 25s

  agent-16:
    name: quality-super
    task: performance
    actions:
      - Bundle size analysis
      - Memory profiling
      - Render performance
    estimated: 15s
```

**Barrier: Phase 3 Complete**

## Phase 4: Build (200-240s) - 2 Agents

```yaml
agents:
  agent-17:
    name: deploy-super
    task: build_ios
    commands:
      - eas build --platform ios --profile preview
    mcps: [expo]
    estimated: 20s (config only, actual build async)

  agent-18:
    name: deploy-super
    task: build_android
    commands:
      - eas build --platform android --profile preview
    mcps: [expo]
    estimated: 20s (config only, actual build async)
```

## Structure Finale

```
my-app/
├── app/
│   ├── _layout.tsx              # Root layout
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── sign-in.tsx
│   │   ├── sign-up.tsx
│   │   └── forgot-password.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx          # Tab layout
│   │   ├── index.tsx            # Home
│   │   ├── list.tsx             # List
│   │   └── profile.tsx          # Profile
│   ├── [id].tsx                 # Detail screen
│   └── settings/
│       ├── index.tsx
│       ├── notifications.tsx
│       └── appearance.tsx
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   └── ...
│   ├── navigation/
│   ├── auth/
│   ├── home/
│   ├── list/
│   ├── detail/
│   ├── profile/
│   └── settings/
├── stores/
│   ├── index.ts
│   ├── authStore.ts
│   ├── userStore.ts
│   └── appStore.ts
├── lib/
│   ├── api.ts
│   ├── auth.ts
│   ├── notifications.ts
│   └── storage.ts
├── constants/
│   ├── Colors.ts
│   ├── Layout.ts
│   └── Typography.ts
├── types/
│   └── api.ts
├── __tests__/
├── e2e/
├── app.json
├── eas.json
├── package.json
└── tsconfig.json
```

## Stack Technique

```yaml
framework: Expo SDK 52+
navigation: Expo Router
state: Zustand
styling: NativeWind (TailwindCSS)
list: FlashList
storage: Expo SecureStore + AsyncStorage
notifications: Expo Notifications
build: EAS Build
```

## Commande

```bash
/turbo mobile "Mon Application Mobile"
```

Options:
```bash
/turbo mobile "Task App" --tabs=3 --auth=supabase --notifications=expo
```

## Métriques

| Métrique | Cible | Actuel |
|----------|-------|--------|
| Temps génération | < 4 min | 3m 45s |
| Screens | 10+ | 12 |
| Components | 30+ | 35 |
| iOS build | Ready | ✅ |
| Android build | Ready | ✅ |
| Bundle size | < 10MB | 8.2MB |

---

**Version:** v18.1 | **Agents:** 18 | **Phases:** 4 | **Temps:** < 4 min
