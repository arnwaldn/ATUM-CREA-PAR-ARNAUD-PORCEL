# Notifications Patterns - Push, In-App, Multi-Canal

> **Version**: v1.0 | ATUM CREA
> **Stack**: Expo Notifications (mobile) + Web Push API + Supabase Realtime (in-app)
> **FCM**: v1 API (legacy deprecie juillet 2024)

---

## Architecture Multi-Canal

```
Evenement (DB trigger, action utilisateur, cron)
    │
    ▼
Notification Service (Edge Function / Server Action)
    │
    ├── Push Mobile (expo-notifications → FCM v1 / APNs)
    ├── Push Web (Web Push API + Service Worker)
    ├── In-App (Supabase Realtime Broadcast)
    └── Email (Resend - voir email-patterns.md)
```

---

## Push Mobile (Expo)

### Installation

```bash
npx expo install expo-notifications expo-device expo-constants
```

### Enregistrement du token

```typescript
// lib/notifications/register.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    console.warn('Push notifications require a physical device');
    return null;
  }

  // Verifier/demander les permissions
  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  // Configuration Android
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  // Obtenir le token Expo Push
  const projectId = Constants.expiConfig?.extra?.eas?.projectId;
  const { data: token } = await Notifications.getExpoPushTokenAsync({
    projectId,
  });

  return token; // Format: ExponentPushToken[xxxx]
}
```

### Envoi via Expo Push API

```typescript
// lib/notifications/send-push.ts
type ExpoPushMessage = {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: 'default' | null;
  badge?: number;
  channelId?: string;
};

export async function sendPushNotification(message: ExpoPushMessage) {
  const response = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(message),
  });

  const result = await response.json();

  // Gerer les erreurs de token
  if (result.data?.status === 'error') {
    if (result.data.details?.error === 'DeviceNotRegistered') {
      // Supprimer le token de la DB
      await removeInvalidToken(message.to);
    }
  }

  return result;
}

// Envoi batch (max 100 par requete)
export async function sendBatchNotifications(messages: ExpoPushMessage[]) {
  const chunks: ExpoPushMessage[][] = [];
  for (let i = 0; i < messages.length; i += 100) {
    chunks.push(messages.slice(i, i + 100));
  }

  const results = [];
  for (const chunk of chunks) {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(chunk),
    });
    results.push(await response.json());
  }

  return results;
}

async function removeInvalidToken(token: string) {
  // Supprimer de la DB
}
```

### Hook React Native

```typescript
// hooks/use-notifications.ts
import { useEffect, useRef, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { registerForPushNotifications } from '@/lib/notifications/register';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export function useNotifications() {
  const [token, setToken] = useState<string | null>(null);
  const notificationListener = useRef<Notifications.EventSubscription>();
  const responseListener = useRef<Notifications.EventSubscription>();

  useEffect(() => {
    registerForPushNotifications().then(setToken);

    // Notification recue pendant que l'app est ouverte
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log('Notification received:', notification);
      });

    // Utilisateur a tape sur la notification
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;
        // Navigation basee sur les data
        if (data.screen) {
          // router.push(data.screen);
        }
      });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  return { token };
}
```

---

## Push Web (Service Worker)

```typescript
// public/sw.js
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};

  event.waitUntil(
    self.registration.showNotification(data.title || 'Notification', {
      body: data.body,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      data: data.data,
      actions: data.actions || [],
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.url || '/';
  event.waitUntil(clients.openWindow(url));
});
```

```typescript
// lib/notifications/web-push.ts
export async function subscribeToWebPush(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return null;
  }

  const registration = await navigator.serviceWorker.register('/sw.js');

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return null;

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  });

  // Envoyer la subscription au serveur
  await fetch('/api/notifications/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscription),
  });

  return subscription;
}
```

---

## In-App (Supabase Realtime)

```typescript
// hooks/use-in-app-notifications.ts
'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

type InAppNotification = {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export function useInAppNotifications(userId: string) {
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    // Charger les existantes
    supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        if (data) {
          setNotifications(data as InAppNotification[]);
          setUnreadCount(data.filter((n) => !n.read).length);
        }
      });

    // Ecouter les nouvelles
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newNotif = payload.new as InAppNotification;
          setNotifications((prev) => [newNotif, ...prev]);
          setUnreadCount((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const markAsRead = async (id: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return { notifications, unreadCount, markAsRead, markAllAsRead };
}
```

---

## Coordination Multi-Canal

```typescript
// lib/notifications/dispatcher.ts
type NotificationPayload = {
  userId: string;
  title: string;
  body: string;
  type: 'info' | 'success' | 'warning' | 'error';
  data?: Record<string, unknown>;
  channels: ('push' | 'in-app' | 'email')[];
};

export async function dispatchNotification(payload: NotificationPayload) {
  const results: Record<string, boolean> = {};

  // In-app (toujours)
  if (payload.channels.includes('in-app')) {
    const { error } = await supabase.from('notifications').insert({
      user_id: payload.userId,
      type: payload.type,
      title: payload.title,
      message: payload.body,
      data: payload.data,
    });
    results['in-app'] = !error;
  }

  // Push
  if (payload.channels.includes('push')) {
    const tokens = await getUserPushTokens(payload.userId);
    for (const token of tokens) {
      try {
        await sendPushNotification({
          to: token,
          title: payload.title,
          body: payload.body,
          data: payload.data,
        });
        results['push'] = true;
      } catch {
        results['push'] = false;
      }
    }
  }

  // Email (voir email-patterns.md)
  if (payload.channels.includes('email')) {
    // Deleguer a emailService
  }

  return results;
}
```

---

## Checklist

- [ ] Expo Notifications configure (permissions, channels Android)
- [ ] Token enregistre en DB et mis a jour au lancement
- [ ] `DeviceNotRegistered` gere (suppression tokens invalides)
- [ ] Service Worker pour Web Push
- [ ] VAPID keys generees
- [ ] In-app via Supabase Realtime
- [ ] Dispatcher multi-canal centralise
- [ ] Preferences utilisateur (quels canaux activer)
- [ ] Rate limiting (pas de spam)
- [ ] Deduplication (meme notif sur 2 canaux = 1 seule in-app)

---

*Knowledge ATUM CREA | Sources: Expo Notifications docs, Web Push API, FCM v1*
