# Expo Mobile Starter Template

## Stack
- Expo SDK 52+
- TypeScript
- Expo Router (file-based routing)
- NativeWind (TailwindCSS for React Native)
- Zustand (state management)
- React Query (data fetching)

## Structure
```
app/
├── (tabs)/
│   ├── index.tsx       # Home tab
│   ├── explore.tsx     # Explore tab
│   ├── profile.tsx     # Profile tab
│   └── _layout.tsx     # Tab navigator
├── (auth)/
│   ├── login.tsx
│   ├── register.tsx
│   └── _layout.tsx
├── (modals)/
│   └── settings.tsx
├── _layout.tsx         # Root layout
└── +not-found.tsx
components/
├── ui/
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   └── Text.tsx
├── features/
└── navigation/
lib/
├── api.ts
├── storage.ts
└── utils.ts
hooks/
├── useAuth.ts
└── useTheme.ts
stores/
├── authStore.ts
└── appStore.ts
```

## Features
- [x] File-based routing
- [x] Tab navigation
- [x] Stack navigation
- [x] Modal screens
- [x] Authentication flow
- [x] Dark mode
- [x] Push notifications ready
- [x] Offline storage

## Commands
```bash
npx expo start           # Development
npx expo start --ios     # iOS simulator
npx expo start --android # Android emulator
eas build --platform all # Build for stores
eas submit               # Submit to stores
```

## Publishing
1. Configure `eas.json`
2. Run `eas build --platform all`
3. Run `eas submit -p ios` for App Store
4. Run `eas submit -p android` for Play Store
