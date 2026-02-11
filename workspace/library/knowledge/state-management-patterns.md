# State Management Patterns - Zustand + TanStack Query

> **Version**: v1.0 | ATUM CREA
> **Packages**: `zustand` v5+ (pmndrs/zustand), `@tanstack/react-query` v5
> **Regle d'or**: "80% du state management elimine par TanStack Query"

---

## Table des Matieres

1. [Philosophie](#philosophie)
2. [Separation Server State / UI State](#separation-server-state--ui-state)
3. [Zustand - Fondamentaux](#zustand---fondamentaux)
4. [Slice Pattern](#slice-pattern)
5. [Middlewares](#middlewares)
6. [TanStack Query - Server State](#tanstack-query---server-state)
7. [Patterns Combines](#patterns-combines)
8. [Anti-patterns](#anti-patterns)
9. [Checklist](#checklist)

---

## Philosophie

```
┌──────────────────────────────────────────────┐
│              State Application               │
├───────────────────────┬──────────────────────┤
│   Server State (80%)  │   UI State (20%)     │
│   TanStack Query      │   Zustand            │
│                       │                      │
│  - Donnees DB/API     │  - Theme clair/sombre│
│  - Cache, pagination  │  - Sidebar ouverte   │
│  - Mutations          │  - Modal active      │
│  - Optimistic updates │  - Filtres UI        │
│  - Prefetching        │  - Formulaire temp   │
│  - Background refresh │  - Etat navigation   │
└───────────────────────┴──────────────────────┘
```

> **NE PAS stocker le server state dans Zustand.** Utiliser TanStack Query pour tout ce qui vient du serveur.

---

## Separation Server State / UI State

| | Server State | UI State |
|---|---|---|
| **Source** | Base de donnees, API | Interactions utilisateur |
| **Persistence** | Oui (serveur) | Non (session) |
| **Partage** | Entre utilisateurs | Local a l'utilisateur |
| **Invalidation** | Mutations, revalidation | Actions utilisateur |
| **Outil** | TanStack Query | Zustand |
| **Exemples** | Users, posts, products | Theme, sidebar, modals |

---

## Zustand - Fondamentaux

### Store minimal

```typescript
// stores/ui-store.ts
import { create } from 'zustand';

type UIState = {
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  activeModal: string | null;
};

type UIActions = {
  toggleSidebar: () => void;
  setTheme: (theme: UIState['theme']) => void;
  openModal: (id: string) => void;
  closeModal: () => void;
};

export const useUIStore = create<UIState & UIActions>()((set) => ({
  // State
  sidebarOpen: true,
  theme: 'system',
  activeModal: null,

  // Actions (IMMUTABLES - spread operator)
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setTheme: (theme) => set({ theme }),
  openModal: (id) => set({ activeModal: id }),
  closeModal: () => set({ activeModal: null }),
}));
```

### Selecteurs (CRITIQUE pour la performance)

```typescript
// BIEN : selecteur specifique, re-render minimal
const sidebarOpen = useUIStore((s) => s.sidebarOpen);
const theme = useUIStore((s) => s.theme);

// MAL : re-render a CHAQUE changement du store
const store = useUIStore(); // NE JAMAIS FAIRE CA
```

### Selecteurs derives

```typescript
// stores/selectors.ts
import { useUIStore } from './ui-store';
import { useShallow } from 'zustand/react/shallow';

// Selecteur derive avec shallow comparison
export function useThemeConfig() {
  return useUIStore(
    useShallow((s) => ({
      theme: s.theme,
      isDark: s.theme === 'dark',
    }))
  );
}
```

---

## Slice Pattern

Architecture modulaire pour les stores complexes.

```typescript
// stores/slices/sidebar-slice.ts
import type { StateCreator } from 'zustand';

export type SidebarSlice = {
  sidebarOpen: boolean;
  sidebarWidth: number;
  toggleSidebar: () => void;
  setSidebarWidth: (width: number) => void;
};

export const createSidebarSlice: StateCreator<
  SidebarSlice,
  [],
  [],
  SidebarSlice
> = (set) => ({
  sidebarOpen: true,
  sidebarWidth: 280,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarWidth: (width) => set({ sidebarWidth: width }),
});
```

```typescript
// stores/slices/modal-slice.ts
import type { StateCreator } from 'zustand';

export type ModalSlice = {
  activeModal: string | null;
  modalData: Record<string, unknown>;
  openModal: (id: string, data?: Record<string, unknown>) => void;
  closeModal: () => void;
};

export const createModalSlice: StateCreator<
  ModalSlice,
  [],
  [],
  ModalSlice
> = (set) => ({
  activeModal: null,
  modalData: {},
  openModal: (id, data = {}) => set({ activeModal: id, modalData: data }),
  closeModal: () => set({ activeModal: null, modalData: {} }),
});
```

```typescript
// stores/app-store.ts
import { create } from 'zustand';
import { createSidebarSlice, type SidebarSlice } from './slices/sidebar-slice';
import { createModalSlice, type ModalSlice } from './slices/modal-slice';

type AppStore = SidebarSlice & ModalSlice;

export const useAppStore = create<AppStore>()((...args) => ({
  ...createSidebarSlice(...args),
  ...createModalSlice(...args),
}));
```

---

## Middlewares

### Persist (localStorage)

```typescript
// stores/settings-store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type SettingsState = {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: boolean;
  setTheme: (theme: SettingsState['theme']) => void;
  setLanguage: (lang: string) => void;
  toggleNotifications: () => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'system',
      language: 'fr',
      notifications: true,
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      toggleNotifications: () =>
        set((s) => ({ notifications: !s.notifications })),
    }),
    {
      name: 'app-settings',
      storage: createJSONStorage(() => localStorage),
      // Persister seulement certains champs
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
        notifications: state.notifications,
      }),
      version: 1,
      migrate: (persisted, version) => {
        // Migration entre versions
        if (version === 0) {
          return { ...persisted, notifications: true };
        }
        return persisted as SettingsState;
      },
    }
  )
);
```

### Devtools

```typescript
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export const useStore = create<StoreState>()(
  devtools(
    (set) => ({
      // ... state et actions
    }),
    {
      name: 'AppStore',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);
```

### Immer (mutations immutables)

```typescript
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

type TodoState = {
  todos: Array<{ id: string; text: string; done: boolean }>;
  toggleTodo: (id: string) => void;
  addTodo: (text: string) => void;
};

export const useTodoStore = create<TodoState>()(
  immer((set) => ({
    todos: [],
    toggleTodo: (id) =>
      set((state) => {
        const todo = state.todos.find((t) => t.id === id);
        if (todo) todo.done = !todo.done; // Mutation directe OK avec immer
      }),
    addTodo: (text) =>
      set((state) => {
        state.todos.push({ id: crypto.randomUUID(), text, done: false });
      }),
  }))
);
```

### Combine plusieurs middlewares

```typescript
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// Ordre : devtools > persist > immer > store
export const useStore = create<State>()(
  devtools(
    persist(
      immer((set) => ({
        // ...
      })),
      { name: 'store' }
    ),
    { name: 'Store' }
  )
);
```

---

## TanStack Query - Server State

```typescript
// lib/queries/users.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Query keys factory
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: Record<string, string>) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

// Fetch function
async function fetchUsers(filters: Record<string, string>) {
  const params = new URLSearchParams(filters);
  const res = await fetch(`/api/users?${params}`);
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
}

// Hook query
export function useUsers(filters: Record<string, string> = {}) {
  return useQuery({
    queryKey: userKeys.list(filters),
    queryFn: () => fetchUsers(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook mutation avec optimistic update
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<User> }) => {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update');
      return res.json();
    },
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: userKeys.detail(id) });

      // Snapshot previous value
      const previous = queryClient.getQueryData(userKeys.detail(id));

      // Optimistic update
      queryClient.setQueryData(userKeys.detail(id), (old: User) => ({
        ...old,
        ...data,
      }));

      return { previous };
    },
    onError: (_err, { id }, context) => {
      // Rollback on error
      queryClient.setQueryData(userKeys.detail(id), context?.previous);
    },
    onSettled: (_data, _error, { id }) => {
      // Revalidate
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}
```

---

## Patterns Combines

### Zustand + TanStack Query = Filtres + Donnees

```typescript
// stores/filter-store.ts
import { create } from 'zustand';

type FilterState = {
  search: string;
  category: string;
  sortBy: string;
  setSearch: (search: string) => void;
  setCategory: (category: string) => void;
  setSortBy: (sortBy: string) => void;
  reset: () => void;
};

const initialFilters = {
  search: '',
  category: 'all',
  sortBy: 'newest',
};

export const useFilterStore = create<FilterState>()((set) => ({
  ...initialFilters,
  setSearch: (search) => set({ search }),
  setCategory: (category) => set({ category }),
  setSortBy: (sortBy) => set({ sortBy }),
  reset: () => set(initialFilters),
}));
```

```typescript
// components/product-list.tsx
'use client';

import { useFilterStore } from '@/stores/filter-store';
import { useProducts } from '@/lib/queries/products';

export function ProductList() {
  // UI state depuis Zustand
  const search = useFilterStore((s) => s.search);
  const category = useFilterStore((s) => s.category);
  const sortBy = useFilterStore((s) => s.sortBy);

  // Server state depuis TanStack Query
  const { data: products, isLoading } = useProducts({ search, category, sortBy });

  if (isLoading) return <Skeleton />;

  return (
    <div>
      {products?.map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}
```

---

## Anti-patterns

### NE PAS faire

```typescript
// MAL: Server state dans Zustand
const useStore = create((set) => ({
  users: [],                    // Ca c'est du server state!
  fetchUsers: async () => {     // Ca c'est TanStack Query!
    const res = await fetch('/api/users');
    set({ users: await res.json() });
  },
}));

// MAL: Store sans selecteur
function Component() {
  const store = useStore();     // Re-render a CHAQUE changement
  return <div>{store.count}</div>;
}

// MAL: Actions qui mutent directement
set((state) => {
  state.items.push(item);       // MUTATION! Sauf si immer middleware
  return state;
});

// MAL: Store unique monolithique
const useGodStore = create((set) => ({
  // 50+ proprietes melangees...
}));
```

### FAIRE

```typescript
// BIEN: Selecteurs specifiques
const count = useStore((s) => s.count);

// BIEN: Actions immutables
set((state) => ({ items: [...state.items, item] }));

// BIEN: Stores separes par domaine (slice pattern)
const useUIStore = create(/* UI state */);
const useSettingsStore = create(/* Settings */);

// BIEN: Server state dans TanStack Query
const { data: users } = useUsers();
```

---

## Checklist

### Architecture
- [ ] Server state dans TanStack Query (pas Zustand)
- [ ] UI state dans Zustand (theme, sidebar, modals, filtres)
- [ ] Query key factory pour chaque entite
- [ ] Selecteurs specifiques (jamais `useStore()` sans selecteur)

### Zustand
- [ ] Slice pattern pour stores > 10 proprietes
- [ ] `persist` middleware pour les preferences utilisateur
- [ ] `devtools` middleware en developpement
- [ ] `immer` middleware si mutations complexes
- [ ] Actions immutables (spread operator ou immer)

### TanStack Query
- [ ] `staleTime` configure par type de donnee
- [ ] Optimistic updates pour les mutations critiques
- [ ] Invalidation apres mutation
- [ ] Prefetching pour la navigation anticipee
- [ ] Error boundaries pour les erreurs de fetch

---

*Knowledge ATUM CREA | Sources: pmndrs/zustand, tanstack.com/query, udecode/zustand-x*
