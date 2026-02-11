# Lovable - Patterns pour ULTRA-CREATE v28.5

> Ce fichier contient les patterns d'analyse et debugging de projets Lovable.
> Charge automatiquement via knowledge-auto-load.js sur keywords: "lovable", "lovable project", "debug lovable"

---

## Overview Lovable

| Aspect | Detail |
|--------|--------|
| **Type** | Plateforme de developpement AI-assisted |
| **URL** | https://lovable.dev |
| **Stack** | React, TypeScript, Tailwind, Supabase |
| **MCP** | Limited (read-only analysis via hiromima/lovable-mcp-server) |

---

## Configuration MCP

```json
{
  "mcpServers": {
    "lovable": {
      "command": "npx",
      "args": ["-y", "@hiromima/lovable-mcp-server"],
      "env": {}
    }
  }
}
```

**Note**: Le MCP Lovable est en mode read-only. Pour modifications, exporter vers GitHub.

---

## Architecture Typique Lovable

### Structure Projet
```
src/
  components/
    ui/              # shadcn/ui components
    [feature]/       # Feature components
  pages/             # Route components (React Router)
  hooks/             # Custom React hooks
  lib/               # Utilities, helpers
  integrations/      # API integrations
    supabase/        # Supabase client config
  styles/            # Global styles
  types/             # TypeScript types

public/              # Static assets
```

### Stack par Defaut
| Layer | Technology | Version |
|-------|------------|---------|
| Frontend | React | 18.x |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 3.x |
| UI Components | shadcn/ui | Latest |
| Routing | React Router | 6.x |
| State (client) | Zustand | 4.x |
| State (server) | React Query | 5.x |
| Backend | Supabase | Latest |
| Auth | Supabase Auth | Built-in |
| Database | PostgreSQL | Via Supabase |

---

## Problemes Courants et Solutions

### 1. Performance Issues

**Symptomes**: Lenteur, freeze, lag sur interactions

**Causes communes**:
- Re-renders excessifs
- Large lists sans virtualisation
- Images non optimisees
- Bundle trop lourd

**Solutions**:
```typescript
// PROBLEME: Re-renders a chaque parent update
const ItemList = ({ items }) => {
  return items.map(item => <Item key={item.id} {...item} />);
};

// SOLUTION: Memoization
const MemoizedItem = React.memo(Item);
const ItemList = ({ items }) => {
  return items.map(item => <MemoizedItem key={item.id} {...item} />);
};
```

```typescript
// PROBLEME: Calculs couteux a chaque render
const Component = ({ data }) => {
  const processed = expensiveCalculation(data); // Recalcule toujours
  return <div>{processed}</div>;
};

// SOLUTION: useMemo
const Component = ({ data }) => {
  const processed = useMemo(() => expensiveCalculation(data), [data]);
  return <div>{processed}</div>;
};
```

### 2. State Management

**Symptomes**: State inconsistant, props drilling, state perdu

**Solutions**:
```typescript
// Zustand pour state global (client)
import { create } from 'zustand';

const useStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}));

// React Query pour state serveur
const { data, isLoading, error } = useQuery({
  queryKey: ['users', userId],
  queryFn: () => fetchUser(userId),
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

### 3. API Integration Issues

**Symptomes**: Erreurs non gerees, loading infini, data stale

**Solutions**:
```typescript
// Pattern complet avec error handling
const UserProfile = ({ userId }) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => supabase.from('users').select('*').eq('id', userId).single(),
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorMessage error={error} onRetry={refetch} />;
  if (!data) return <NotFound />;

  return <Profile user={data} />;
};
```

### 4. Styling Issues

**Symptomes**: CSS inline partout, styles non coherents, theming absent

**Solutions**:
```typescript
// PROBLEME: Inline styles
<div style={{ padding: '16px', backgroundColor: '#f0f0f0' }}>

// SOLUTION: Tailwind classes
<div className="p-4 bg-gray-100">

// SOLUTION: Variables CSS pour theming
// globals.css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
}
```

### 5. Auth Problems

**Symptomes**: Auth client-side only, session perdue, redirects broken

**Solutions**:
```typescript
// Pattern Supabase Auth avec protection routes
// hooks/useAuth.ts
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading, isAuthenticated: !!user };
};

// Route protection
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" />;

  return children;
};
```

---

## Debugging Workflow

### 1. Identification
```
1. Reproduire le bug (steps to reproduce)
2. Identifier le composant concerne
3. Verifier console errors (browser DevTools)
4. Inspecter network tab (API calls)
5. Check React DevTools (state, props)
```

### 2. Analyse
```
1. Review du code genere par Lovable
2. Check des dependencies (versions, conflicts)
3. Verification du state flow
4. Test des edge cases
5. Performance profiling si necessaire
```

### 3. Resolution
```
1. Isoler le probleme (component minimal)
2. Proposer fix minimal
3. Tester la correction
4. Documenter la solution
5. Sauvegarder pattern dans Hindsight
```

---

## Integration Backend

### Avec Supabase (natif)
```typescript
// Deja configure dans projets Lovable
import { supabase } from '@/integrations/supabase';

// CRUD operations
const { data, error } = await supabase
  .from('items')
  .select('*')
  .eq('status', 'active')
  .order('created_at', { ascending: false });

// Realtime subscriptions
const subscription = supabase
  .channel('items')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'items' },
    (payload) => console.log('Change:', payload)
  )
  .subscribe();
```

### Avec Airtable (custom)
```typescript
// Via API directe ou Make webhook
const fetchFromAirtable = async (tableId: string) => {
  const response = await fetch(
    `https://api.airtable.com/v0/${BASE_ID}/${tableId}`,
    {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.json();
};

// Ou via Make scenario
const triggerMakeScenario = async (data: any) => {
  await fetch(MAKE_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
};
```

---

## Limitations MCP Lovable

| Aspect | Limitation | Workaround |
|--------|------------|------------|
| **Write** | Read-only | Export vers GitHub, edit manuellement |
| **Realtime** | Pas de sync live | Re-analyse periodique |
| **History** | Version courante only | Git history apres export |
| **Build** | Pas de build via MCP | Build via Lovable UI ou export |

---

## Migration depuis Lovable

### Export vers Code Propre
1. **Export**: Lovable > Settings > Export to GitHub
2. **Clone**: `git clone <repo-url>`
3. **Install**: `npm install`
4. **Audit**: Verifier dependencies obsoletes
5. **Cleanup**: Refactor code genere
6. **Tests**: Ajouter tests unitaires
7. **CI/CD**: Setup GitHub Actions

### Points d'Attention
- [ ] Dependencies a jour (npm audit)
- [ ] TypeScript strict mode
- [ ] ESLint/Prettier config
- [ ] Environment variables (.env)
- [ ] Remove inline styles
- [ ] Extract magic numbers/strings
- [ ] Add error boundaries
- [ ] Setup monitoring (Sentry)

---

## Best Practices Projets Lovable

### 1. Structure
- Organiser composants par feature (pas par type)
- Separer logique (hooks) et presentation (components)
- Utiliser custom hooks pour logique reutilisable
- Index files pour exports propres

### 2. Performance
- Lazy loading pour routes
- Image optimization (next/image ou similaire)
- Bundle splitting (dynamic imports)
- Memoization strategique

### 3. Maintenabilite
- Types TypeScript stricts (no any)
- Tests unitaires pour logique critique
- Documentation inline (JSDoc)
- Conventional commits

### 4. Security
- Valider inputs cote serveur (RLS Supabase)
- Sanitize user content
- HTTPS only
- Secure headers

---

## Checklist Debug Lovable

- [ ] Console errors verifies?
- [ ] Network requests OK?
- [ ] State correctement initialise?
- [ ] Props passees correctement?
- [ ] Dependencies a jour?
- [ ] Environment variables configurees?
- [ ] Supabase RLS policies OK?
- [ ] Auth session valide?

---

## Keywords Auto-Discovery

```
lovable, lovable.dev, lovable project, debug lovable,
analyse lovable, lovable code, lovable app, lovable issue,
probleme lovable, lovable react, lovable supabase, lovable export
```

---

*ULTRA-CREATE v28.5 | Lovable Analysis Patterns*
*MCP: hiromima/lovable-mcp-server (read-only)*
*Reference: https://docs.lovable.dev*
