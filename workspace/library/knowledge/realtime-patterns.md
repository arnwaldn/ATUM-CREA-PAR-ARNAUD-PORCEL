# Real-time Web Patterns - Supabase Realtime

> **Version**: v1.0 | ATUM CREA
> **Package**: `@supabase/supabase-js` (Realtime integre)
> **Stack**: Next.js 15 + Supabase + TypeScript

---

## Table des Matieres

1. [Architecture](#architecture)
2. [3 Modes Realtime](#3-modes-realtime)
3. [Broadcast](#broadcast)
4. [Presence](#presence)
5. [Postgres Changes](#postgres-changes)
6. [Patterns Next.js](#patterns-nextjs)
7. [Securite & RLS](#securite--rls)
8. [Limites & Performance](#limites--performance)
9. [Alternatives (SSE)](#alternatives-sse)
10. [Checklist](#checklist)

---

## Architecture

```
Client (Browser)
    │
    │  WebSocket (wss://)
    │
    ▼
Supabase Realtime Server (Elixir/Phoenix)
    │
    ├── Broadcast   → Ephemere, entre clients
    ├── Presence    → Etat partage, synchronise
    └── Postgres Changes → Ecoute les changements DB
                              │
                              ▼
                         PostgreSQL (WAL)
```

**Architecture interne** : Elixir/Phoenix Channels, multiplexage WebSocket (1 connexion = N canaux).

---

## 3 Modes Realtime

| Mode | Usage | Persistence | Scalabilite |
|------|-------|-------------|-------------|
| **Broadcast** | Messages ephemeres entre clients | Non | Horizontale |
| **Presence** | Etat partage (qui est en ligne, curseurs) | En memoire | Par canal |
| **Postgres Changes** | Ecoute INSERT/UPDATE/DELETE en DB | Oui (DB) | Single-threaded |

---

## Broadcast

Le plus performant. Messages ephemeres entre clients sans passer par la DB.

### Chat en temps reel

```typescript
// lib/realtime/broadcast.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type ChatMessage = {
  userId: string;
  username: string;
  content: string;
  timestamp: string;
};

export function createChatChannel(roomId: string) {
  const channel = supabase.channel(`chat:${roomId}`, {
    config: {
      broadcast: { self: true }, // Recevoir ses propres messages
    },
  });

  return {
    subscribe(onMessage: (msg: ChatMessage) => void) {
      channel
        .on('broadcast', { event: 'message' }, ({ payload }) => {
          onMessage(payload as ChatMessage);
        })
        .subscribe();
    },

    send(message: Omit<ChatMessage, 'timestamp'>) {
      channel.send({
        type: 'broadcast',
        event: 'message',
        payload: { ...message, timestamp: new Date().toISOString() },
      });
    },

    unsubscribe() {
      supabase.removeChannel(channel);
    },
  };
}
```

### Hook React

```typescript
// hooks/use-chat.ts
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createChatChannel } from '@/lib/realtime/broadcast';

type ChatMessage = {
  userId: string;
  username: string;
  content: string;
  timestamp: string;
};

export function useChat(roomId: string, currentUser: { id: string; name: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const channelRef = useRef<ReturnType<typeof createChatChannel> | null>(null);

  useEffect(() => {
    const channel = createChatChannel(roomId);
    channelRef.current = channel;

    channel.subscribe((msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      channel.unsubscribe();
    };
  }, [roomId]);

  const sendMessage = useCallback(
    (content: string) => {
      channelRef.current?.send({
        userId: currentUser.id,
        username: currentUser.name,
        content,
      });
    },
    [currentUser]
  );

  return { messages, sendMessage };
}
```

---

## Presence

Etat partage entre clients. Ideal pour : utilisateurs en ligne, curseurs collaboratifs, indicateurs de frappe.

```typescript
// lib/realtime/presence.ts
import { createClient, type RealtimeChannel } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type UserPresence = {
  userId: string;
  username: string;
  avatar: string;
  cursor?: { x: number; y: number };
  lastSeen: string;
};

export function createPresenceChannel(roomId: string) {
  const channel = supabase.channel(`presence:${roomId}`);

  return {
    track(user: UserPresence) {
      channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track(user);
        }
      });
    },

    onSync(callback: (users: UserPresence[]) => void) {
      channel.on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<UserPresence>();
        const users = Object.values(state).flat();
        callback(users);
      });
    },

    onJoin(callback: (user: UserPresence) => void) {
      channel.on('presence', { event: 'join' }, ({ newPresences }) => {
        newPresences.forEach((p) => callback(p as unknown as UserPresence));
      });
    },

    onLeave(callback: (user: UserPresence) => void) {
      channel.on('presence', { event: 'leave' }, ({ leftPresences }) => {
        leftPresences.forEach((p) => callback(p as unknown as UserPresence));
      });
    },

    updateCursor(cursor: { x: number; y: number }) {
      channel.track({ cursor } as any);
    },

    unsubscribe() {
      supabase.removeChannel(channel);
    },
  };
}
```

### Hook Presence

```typescript
// hooks/use-presence.ts
'use client';

import { useEffect, useState } from 'react';
import { createPresenceChannel } from '@/lib/realtime/presence';

type UserPresence = {
  userId: string;
  username: string;
  avatar: string;
  cursor?: { x: number; y: number };
  lastSeen: string;
};

export function usePresence(roomId: string, currentUser: Omit<UserPresence, 'lastSeen'>) {
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);

  useEffect(() => {
    const channel = createPresenceChannel(roomId);

    channel.onSync((users) => {
      setOnlineUsers(users);
    });

    channel.track({
      ...currentUser,
      lastSeen: new Date().toISOString(),
    });

    return () => channel.unsubscribe();
  }, [roomId, currentUser.userId]);

  return { onlineUsers, count: onlineUsers.length };
}
```

---

## Postgres Changes

Ecoute les changements en base de donnees via le WAL (Write-Ahead Log).

```typescript
// lib/realtime/db-changes.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type ChangeEvent = 'INSERT' | 'UPDATE' | 'DELETE';

export function listenToTable<T extends Record<string, any>>(
  table: string,
  events: ChangeEvent[],
  callback: (payload: {
    eventType: ChangeEvent;
    new: T;
    old: Partial<T>;
  }) => void,
  filter?: string // ex: 'project_id=eq.123'
) {
  const channelConfig: any = {
    event: events.length === 1 ? events[0] : '*',
    schema: 'public',
    table,
  };

  if (filter) {
    channelConfig.filter = filter;
  }

  const channel = supabase
    .channel(`db:${table}`)
    .on('postgres_changes', channelConfig, (payload) => {
      callback({
        eventType: payload.eventType as ChangeEvent,
        new: payload.new as T,
        old: payload.old as Partial<T>,
      });
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
```

### Hook Postgres Changes

```typescript
// hooks/use-realtime-query.ts
'use client';

import { useEffect, useState, useCallback } from 'react';
import { listenToTable } from '@/lib/realtime/db-changes';

export function useRealtimeQuery<T extends { id: string }>(
  table: string,
  initialData: T[],
  filter?: string
) {
  const [data, setData] = useState<T[]>(initialData);

  useEffect(() => {
    const unsubscribe = listenToTable<T>(
      table,
      ['INSERT', 'UPDATE', 'DELETE'],
      ({ eventType, new: newRecord, old: oldRecord }) => {
        setData((prev) => {
          switch (eventType) {
            case 'INSERT':
              return [...prev, newRecord];
            case 'UPDATE':
              return prev.map((item) =>
                item.id === newRecord.id ? newRecord : item
              );
            case 'DELETE':
              return prev.filter((item) => item.id !== oldRecord.id);
            default:
              return prev;
          }
        });
      },
      filter
    );

    return unsubscribe;
  }, [table, filter]);

  return { data };
}
```

---

## Patterns Next.js

### Initialisation SSR-safe

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';

export function createSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

### Composant Realtime avec fallback

```typescript
// components/realtime-notifications.tsx
'use client';

import { useEffect, useState } from 'react';
import { createSupabaseClient } from '@/lib/supabase/client';

type Notification = {
  id: string;
  message: string;
  read: boolean;
  created_at: string;
};

export function RealtimeNotifications({
  userId,
  initial,
}: {
  userId: string;
  initial: Notification[];
}) {
  const [notifications, setNotifications] = useState(initial);
  const supabase = createSupabaseClient();

  useEffect(() => {
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
          setNotifications((prev) => [payload.new as Notification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return (
    <div>
      {notifications.map((n) => (
        <div key={n.id} className={n.read ? 'opacity-50' : ''}>
          {n.message}
        </div>
      ))}
    </div>
  );
}
```

### Debouncing des updates

```typescript
// lib/realtime/debounce.ts
export function createDebouncedSender<T>(
  sendFn: (data: T) => void,
  delay: number = 50
) {
  let timeoutId: ReturnType<typeof setTimeout>;
  let latestData: T;

  return (data: T) => {
    latestData = data;
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      sendFn(latestData);
    }, delay);
  };
}

// Usage avec curseur collaboratif
const debouncedCursorUpdate = createDebouncedSender(
  (cursor: { x: number; y: number }) => {
    channel.track({ cursor });
  },
  50 // 50ms = 20fps max
);
```

---

## Securite & RLS

### Activer Realtime sur une table

```sql
-- Dashboard Supabase > Database > Publications
-- Ou via SQL :
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
```

### RLS obligatoire

```sql
-- Les policies RLS s'appliquent aussi au Realtime
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only listen to their notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can only see messages in their rooms"
  ON messages FOR SELECT
  USING (
    room_id IN (
      SELECT room_id FROM room_members
      WHERE user_id = auth.uid()
    )
  );
```

> **IMPORTANT** : Garder les policies RLS SIMPLES pour Realtime. Les jointures complexes ralentissent la propagation des events.

---

## Limites & Performance

### Limites par defaut (plan gratuit)

| Parametre | Limite |
|-----------|--------|
| Canaux par projet | 100 |
| Utilisateurs par canal | 200 |
| Events par seconde | 100 |
| Taille message | 1MB (Broadcast), 256KB (Presence) |
| Connexions simultanees | 200 |

### Best practices performance

1. **Preferer Broadcast** pour les messages ephemeres (chat, curseurs, notifications live). Scale horizontal.

2. **Postgres Changes est single-threaded** : il ne peut traiter qu'un event a la fois. Pour du volume important, utiliser Broadcast + logique applicative.

3. **Filtrer au maximum** : utiliser le parametre `filter` pour reduire les events recus. `filter: 'project_id=eq.123'` au lieu d'ecouter toute la table.

4. **Debouncer les updates client** : ne pas envoyer plus de 20 updates/seconde pour les curseurs/positions.

5. **Nettoyer les channels** : toujours appeler `supabase.removeChannel(channel)` dans le cleanup des effets React.

6. **1 connexion WebSocket = N canaux** : pas besoin de s'inquieter du nombre de canaux souscrits, ils sont multiplexes.

---

## Alternatives (SSE)

Pour des flux unidirectionnels (serveur → client), les Server-Sent Events sont plus simples :

```typescript
// app/api/events/route.ts
export async function GET(request: Request) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const send = (data: any) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
        );
      };

      // Envoyer un heartbeat toutes les 30s
      const heartbeat = setInterval(() => {
        send({ type: 'heartbeat' });
      }, 30000);

      // Ecouter les changements DB et relayer via SSE
      const supabase = createServerClient();
      const channel = supabase
        .channel('sse-relay')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, (payload) => {
          send({ type: payload.eventType, data: payload.new });
        })
        .subscribe();

      // Cleanup quand le client se deconnecte
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeat);
        supabase.removeChannel(channel);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

```typescript
// Hook client SSE
'use client';

import { useEffect, useState } from 'react';

export function useSSE<T>(url: string) {
  const [data, setData] = useState<T | null>(null);

  useEffect(() => {
    const eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
      const parsed = JSON.parse(event.data);
      if (parsed.type !== 'heartbeat') {
        setData(parsed);
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
      // Reconnexion automatique apres 5s
      setTimeout(() => {
        // Re-creer la connexion
      }, 5000);
    };

    return () => eventSource.close();
  }, [url]);

  return data;
}
```

---

## Checklist

### Setup
- [ ] `@supabase/supabase-js` installe
- [ ] `@supabase/ssr` pour le client SSR-safe
- [ ] Tables ajoutees a la publication `supabase_realtime`
- [ ] RLS active sur les tables ecoutees

### Implementation
- [ ] Channels nettoyes dans `useEffect` cleanup
- [ ] Debouncing sur les updates haute-frequence (curseurs, positions)
- [ ] Filtres sur les `postgres_changes` pour limiter le traffic
- [ ] Gestion des erreurs de connexion et reconnexion

### Production
- [ ] Limites de canaux verifiees pour le plan choisi
- [ ] Monitoring des connexions WebSocket
- [ ] Fallback SSE pour les clients sans WebSocket
- [ ] Tests de charge avec le nombre d'utilisateurs attendu

---

*Knowledge ATUM CREA | Sources: Supabase Realtime docs, trymoto/supachat-starter, rossbrandon/next-chat*
