# Template: Mobile Application

## Overview

Template complet pour créer une application mobile cross-platform avec Expo SDK 52+, React Native, navigation, auth, push notifications, et déploiement stores.

---

## STACK TECHNIQUE

| Couche | Technologie | Raison |
|--------|-------------|--------|
| **Framework** | Expo SDK 52+ | Managed workflow, OTA updates |
| **UI** | React Native | Cross-platform |
| **Navigation** | Expo Router | File-based routing |
| **State** | Zustand / TanStack Query | Léger, performant |
| **Auth** | Clerk Expo | Auth native |
| **Backend** | Supabase | Realtime, Auth, Storage |
| **Push** | Expo Notifications | Cross-platform push |
| **Forms** | React Hook Form + Zod | Validation |
| **UI Kit** | Tamagui / NativeWind | Styling |

---

## ARCHITECTURE MOBILE

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         MOBILE APP ARCHITECTURE                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         UI LAYER                                     │   │
│  │                                                                      │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │   │
│  │  │   SCREENS    │  │  COMPONENTS  │  │   NAVIGATION │               │   │
│  │  │              │  │              │  │              │               │   │
│  │  │ • Auth       │  │ • UI Kit     │  │ • Tabs       │               │   │
│  │  │ • Home       │  │ • Forms      │  │ • Stack      │               │   │
│  │  │ • Profile    │  │ • Lists      │  │ • Modal      │               │   │
│  │  │ • Settings   │  │ • Cards      │  │ • Drawer     │               │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         STATE LAYER                                  │   │
│  │                                                                      │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │   │
│  │  │   ZUSTAND    │  │   TANSTACK   │  │    ASYNC     │               │   │
│  │  │   (Local)    │  │   QUERY      │  │   STORAGE    │               │   │
│  │  │              │  │              │  │              │               │   │
│  │  │ • User state │  │ • API cache  │  │ • Persist    │               │   │
│  │  │ • UI state   │  │ • Mutations  │  │ • Offline    │               │   │
│  │  │ • Settings   │  │ • Sync       │  │ • Secure     │               │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         NATIVE LAYER                                 │   │
│  │                                                                      │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │   │
│  │  │    CAMERA    │  │   LOCATION   │  │    PUSH      │               │   │
│  │  │              │  │              │  │              │               │   │
│  │  │ • Photos     │  │ • GPS        │  │ • Local      │               │   │
│  │  │ • Scanner    │  │ • Geofence   │  │ • Remote     │               │   │
│  │  │ • AR         │  │ • Maps       │  │ • Background │               │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## STRUCTURE PROJET

```
my-mobile-app/
├── app/                              # Expo Router (file-based routing)
│   ├── _layout.tsx                   # Root layout
│   ├── index.tsx                     # Landing/redirect
│   │
│   ├── (auth)/                       # Auth group
│   │   ├── _layout.tsx
│   │   ├── sign-in.tsx
│   │   ├── sign-up.tsx
│   │   └── forgot-password.tsx
│   │
│   ├── (tabs)/                       # Tab navigator
│   │   ├── _layout.tsx
│   │   ├── index.tsx                 # Home tab
│   │   ├── explore.tsx               # Explore tab
│   │   ├── notifications.tsx         # Notifications tab
│   │   └── profile.tsx               # Profile tab
│   │
│   ├── (stack)/                      # Stack screens
│   │   ├── _layout.tsx
│   │   ├── [id].tsx                  # Dynamic route
│   │   ├── settings/
│   │   │   ├── index.tsx
│   │   │   ├── account.tsx
│   │   │   └── notifications.tsx
│   │   └── modal.tsx                 # Modal screen
│   │
│   └── +not-found.tsx                # 404 screen
│
├── components/
│   ├── ui/                           # UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Avatar.tsx
│   │   └── index.ts
│   ├── forms/
│   │   ├── LoginForm.tsx
│   │   └── ProfileForm.tsx
│   └── layout/
│       ├── SafeArea.tsx
│       ├── Header.tsx
│       └── TabBar.tsx
│
├── hooks/
│   ├── useAuth.ts
│   ├── usePushNotifications.ts
│   ├── useLocation.ts
│   └── useCamera.ts
│
├── lib/
│   ├── supabase.ts                   # Supabase client
│   ├── api.ts                        # API client
│   ├── storage.ts                    # Async storage
│   └── notifications.ts              # Push setup
│
├── stores/
│   ├── auth.store.ts                 # Auth state
│   ├── ui.store.ts                   # UI state
│   └── settings.store.ts             # Settings
│
├── services/
│   ├── auth.service.ts
│   ├── user.service.ts
│   └── notification.service.ts
│
├── constants/
│   ├── colors.ts
│   ├── spacing.ts
│   └── typography.ts
│
├── types/
│   └── index.ts
│
├── assets/
│   ├── images/
│   ├── fonts/
│   └── icons/
│
├── app.json                          # Expo config
├── eas.json                          # EAS Build config
├── package.json
└── tsconfig.json
```

---

## EXPO CONFIGURATION

### app.json

```json
{
  "expo": {
    "name": "My App",
    "slug": "my-app",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "myapp",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/images/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.mycompany.myapp",
      "infoPlist": {
        "NSCameraUsageDescription": "This app needs camera access",
        "NSLocationWhenInUseUsageDescription": "This app needs location access"
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.mycompany.myapp",
      "permissions": [
        "CAMERA",
        "ACCESS_FINE_LOCATION"
      ]
    },
    "plugins": [
      "expo-router",
      "expo-secure-store",
      [
        "expo-notifications",
        {
          "icon": "./assets/images/notification-icon.png",
          "color": "#ffffff"
        }
      ],
      [
        "expo-camera",
        {
          "cameraPermission": "Allow $(PRODUCT_NAME) to access camera"
        }
      ]
    ],
    "experiments": {
      "typedRoutes": true
    }
  }
}
```

### eas.json (EAS Build)

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your@email.com",
        "ascAppId": "1234567890"
      },
      "android": {
        "serviceAccountKeyPath": "./google-services.json"
      }
    }
  }
}
```

---

## NAVIGATION (Expo Router)

### Root Layout

```typescript
// app/_layout.tsx
import { Stack } from 'expo-router'
import { ClerkProvider, useAuth } from '@clerk/clerk-expo'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'

SplashScreen.preventAutoHideAsync()

const queryClient = new QueryClient()

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Inter-Regular': require('../assets/fonts/Inter-Regular.ttf'),
    'Inter-Bold': require('../assets/fonts/Inter-Bold.ttf'),
  })

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded])

  if (!fontsLoaded) return null

  return (
    <ClerkProvider publishableKey={process.env.EXPO_PUBLIC_CLERK_KEY!}>
      <QueryClientProvider client={queryClient}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(stack)" />
          <Stack.Screen name="+not-found" />
        </Stack>
      </QueryClientProvider>
    </ClerkProvider>
  )
}
```

### Tab Layout

```typescript
// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router'
import { Home, Search, Bell, User } from 'lucide-react-native'
import { useTheme } from '@/hooks/useTheme'

export default function TabLayout() {
  const { colors } = useTheme()

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          borderTopColor: colors.border,
          backgroundColor: colors.background,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, size }) => <Search size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Notifications',
          tabBarIcon: ({ color, size }) => <Bell size={size} color={color} />,
          tabBarBadge: 3,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  )
}
```

---

## AUTHENTICATION

### Auth Hook with Clerk

```typescript
// hooks/useAuth.ts
import { useAuth as useClerkAuth, useUser } from '@clerk/clerk-expo'
import { useRouter } from 'expo-router'
import * as SecureStore from 'expo-secure-store'

export function useAuth() {
  const { isLoaded, isSignedIn, signOut } = useClerkAuth()
  const { user } = useUser()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    await SecureStore.deleteItemAsync('userToken')
    router.replace('/(auth)/sign-in')
  }

  return {
    isLoaded,
    isSignedIn,
    user: user ? {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress,
      name: user.fullName,
      avatar: user.imageUrl,
    } : null,
    signOut: handleSignOut,
  }
}
```

### Sign In Screen

```typescript
// app/(auth)/sign-in.tsx
import { useState } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { useSignIn } from '@clerk/clerk-expo'
import { useRouter, Link } from 'expo-router'
import { Button, Input } from '@/components/ui'
import { SafeArea } from '@/components/layout'

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSignIn = async () => {
    if (!isLoaded) return

    setLoading(true)
    setError('')

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      })

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        router.replace('/(tabs)')
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message ?? 'Sign in failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeArea className="flex-1 px-6">
      <View className="flex-1 justify-center">
        <Text className="text-3xl font-bold mb-8">Welcome back</Text>

        {error && (
          <Text className="text-red-500 mb-4">{error}</Text>
        )}

        <Input
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          className="mb-4"
        />

        <Input
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          className="mb-6"
        />

        <Button
          onPress={handleSignIn}
          loading={loading}
          className="mb-4"
        >
          Sign In
        </Button>

        <View className="flex-row justify-center">
          <Text>Don't have an account? </Text>
          <Link href="/(auth)/sign-up" asChild>
            <TouchableOpacity>
              <Text className="text-primary font-semibold">Sign Up</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </SafeArea>
  )
}
```

---

## PUSH NOTIFICATIONS

```typescript
// hooks/usePushNotifications.ts
import { useState, useEffect, useRef } from 'react'
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import { Platform } from 'react-native'
import { useRouter } from 'expo-router'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

export function usePushNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string>()
  const [notification, setNotification] = useState<Notifications.Notification>()
  const notificationListener = useRef<Notifications.Subscription>()
  const responseListener = useRef<Notifications.Subscription>()
  const router = useRouter()

  useEffect(() => {
    registerForPushNotifications().then(token => {
      if (token) setExpoPushToken(token)
    })

    // Listen for incoming notifications
    notificationListener.current = Notifications.addNotificationReceivedListener(
      notification => {
        setNotification(notification)
      }
    )

    // Handle notification taps
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      response => {
        const data = response.notification.request.content.data
        if (data.url) {
          router.push(data.url as string)
        }
      }
    )

    return () => {
      notificationListener.current?.remove()
      responseListener.current?.remove()
    }
  }, [])

  return { expoPushToken, notification }
}

async function registerForPushNotifications() {
  if (!Device.isDevice) {
    console.log('Push notifications require a physical device')
    return
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync()
  let finalStatus = existingStatus

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }

  if (finalStatus !== 'granted') {
    console.log('Failed to get push token')
    return
  }

  const token = await Notifications.getExpoPushTokenAsync({
    projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
  })

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    })
  }

  return token.data
}
```

---

## UI COMPONENTS

### Button Component

```typescript
// components/ui/Button.tsx
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle, TextStyle } from 'react-native'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'flex-row items-center justify-center rounded-xl',
  {
    variants: {
      variant: {
        default: 'bg-primary',
        secondary: 'bg-secondary',
        outline: 'border border-border bg-transparent',
        ghost: 'bg-transparent',
        destructive: 'bg-destructive',
      },
      size: {
        default: 'h-12 px-6',
        sm: 'h-9 px-4',
        lg: 'h-14 px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

const textVariants = cva('font-semibold', {
  variants: {
    variant: {
      default: 'text-primary-foreground',
      secondary: 'text-secondary-foreground',
      outline: 'text-foreground',
      ghost: 'text-foreground',
      destructive: 'text-destructive-foreground',
    },
    size: {
      default: 'text-base',
      sm: 'text-sm',
      lg: 'text-lg',
      icon: 'text-base',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
})

interface ButtonProps extends VariantProps<typeof buttonVariants> {
  children: React.ReactNode
  onPress?: () => void
  disabled?: boolean
  loading?: boolean
  className?: string
}

export function Button({
  children,
  variant,
  size,
  onPress,
  disabled,
  loading,
  className,
}: ButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={cn(
        buttonVariants({ variant, size }),
        disabled && 'opacity-50',
        className
      )}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color="white" />
      ) : (
        <Text className={textVariants({ variant, size })}>{children}</Text>
      )}
    </TouchableOpacity>
  )
}
```

### Input Component

```typescript
// components/ui/Input.tsx
import { TextInput, View, Text, TextInputProps } from 'react-native'
import { cn } from '@/lib/utils'

interface InputProps extends TextInputProps {
  label?: string
  error?: string
  className?: string
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <View className="w-full">
      {label && (
        <Text className="text-foreground font-medium mb-2">{label}</Text>
      )}
      <TextInput
        className={cn(
          'h-12 px-4 rounded-xl bg-muted border border-border',
          'text-foreground placeholder:text-muted-foreground',
          error && 'border-destructive',
          className
        )}
        placeholderTextColor="#9CA3AF"
        {...props}
      />
      {error && (
        <Text className="text-destructive text-sm mt-1">{error}</Text>
      )}
    </View>
  )
}
```

---

## STORE (Zustand)

```typescript
// stores/auth.store.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

interface User {
  id: string
  email: string
  name: string
  avatar?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => set({ token }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)
```

---

## DEPLOYMENT

### Build & Submit

```bash
# Development build
eas build --profile development --platform all

# Preview build (internal testing)
eas build --profile preview --platform all

# Production build
eas build --profile production --platform all

# Submit to stores
eas submit --platform ios
eas submit --platform android

# OTA update
eas update --branch production --message "Bug fixes"
```

---

## FEATURES INCLUSES

### MVP
- [x] Expo SDK 52+ setup
- [x] Expo Router navigation
- [x] Authentication (Clerk)
- [x] Push notifications
- [x] UI components (NativeWind)
- [x] State management (Zustand)

### Phase 2
- [ ] Offline support
- [ ] Biometric auth
- [ ] Deep linking
- [ ] Analytics
- [ ] Crash reporting

### Phase 3
- [ ] In-app purchases
- [ ] Camera/Gallery
- [ ] Maps
- [ ] Background tasks

---

## COMMANDES

```bash
# Create mobile app
/create mobile MyApp

# With options
/create mobile MyApp --with-auth --with-push

# Add features
/generate feature push-notifications
/generate feature camera
```

---

**Version:** 1.0
**Stack:** Expo SDK 52 + React Native + Clerk + Supabase
**Platforms:** iOS + Android
**Temps estimé:** 3-5 heures pour MVP
