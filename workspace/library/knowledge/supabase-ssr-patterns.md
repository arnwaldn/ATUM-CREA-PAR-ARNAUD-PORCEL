# Supabase SSR Patterns - Next.js 15

> **Version**: 27.0
> **Contexte**: Patterns @supabase/ssr pour Next.js 15 App Router

---

## Vue d'Ensemble

La bibliothèque `@supabase/ssr` permet une intégration correcte de Supabase Auth avec Next.js 15, en gérant les cookies pour maintenir les sessions côté serveur.

### Problème Résolu

Le client basique `@supabase/supabase-js` ne gère pas les cookies en SSR:
- Sessions perdues entre les refreshes
- Auth state désynchronisé client/serveur
- Middleware non fonctionnel

### Solution: @supabase/ssr

```bash
npm install @supabase/ssr @supabase/supabase-js
```

---

## Pattern 1: Server Client (SSR)

Pour les Server Components et Route Handlers:

```typescript
// src/lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from './database.types'

export async function createSSRClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component - ignore
          }
        },
      },
    }
  )
}
```

**Usage dans un Server Component:**
```typescript
// src/app/dashboard/page.tsx
import { createSSRClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createSSRClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single()

  return <div>Bienvenue {profile?.full_name}</div>
}
```

---

## Pattern 2: Browser Client

Pour les Client Components:

```typescript
// src/lib/supabase/client.ts
'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './database.types'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Singleton pour éviter multiples instances
let browserClient: ReturnType<typeof createClient> | null = null

export function getClient() {
  if (!browserClient) {
    browserClient = createClient()
  }
  return browserClient
}
```

**Usage dans un Client Component:**
```typescript
'use client'
import { getClient } from '@/lib/supabase/client'

export function LoginForm() {
  async function handleLogin(email: string, password: string) {
    const supabase = getClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
  }
  // ...
}
```

---

## Pattern 3: Middleware (Session Refresh)

**CRITIQUE**: Le middleware maintient les sessions actives.

```typescript
// src/lib/supabase/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Ne pas ajouter de logique avant getUser()
  const { data: { user } } = await supabase.auth.getUser()

  // Protection des routes
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return supabaseResponse
}
```

```typescript
// src/middleware.ts
import { updateSession } from '@/lib/supabase/middleware'
import { type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
```

---

## Pattern 4: MFA avec Fonction SQL

### Créer la fonction helper

```sql
-- supabase/migrations/001_mfa_function.sql
create schema if not exists "authenticative";

CREATE OR REPLACE FUNCTION authenticative.is_user_authenticated()
 RETURNS boolean
 LANGUAGE sql
 STABLE
 SECURITY DEFINER
AS $$
  SELECT array[(select auth.jwt()->>'aal')] <@ (
    SELECT
      CASE
        WHEN count(id) > 0 THEN array['aal2']
        ELSE array['aal1', 'aal2']
      END as aal
    FROM auth.mfa_factors
    WHERE (auth.uid() = user_id)
    AND status = 'verified'
  );
$$;
```

### Utilisation dans les RLS Policies

```sql
-- Exiger MFA pour accéder aux données sensibles
create policy "Users with MFA can view sensitive data"
on public.sensitive_data for select
to authenticated
using (
  auth.uid() = user_id
  AND authenticative.is_user_authenticated()
);
```

### Enrollment MFA côté client

```typescript
async function enrollMFA() {
  const supabase = getClient()

  // 1. Enroll
  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: 'totp',
    friendlyName: 'Authenticator App',
  })

  // 2. Afficher QR code
  console.log(data.totp.qr_code) // SVG data URL
  console.log(data.totp.secret)  // Manual entry backup

  return data
}

async function verifyMFA(factorId: string, code: string) {
  const supabase = getClient()

  // 1. Create challenge
  const { data: challenge } = await supabase.auth.mfa.challenge({ factorId })

  // 2. Verify
  const { error } = await supabase.auth.mfa.verify({
    factorId,
    challengeId: challenge.id,
    code,
  })

  return !error
}
```

---

## Pattern 5: Row Level Security (RLS)

### Template de base

```sql
-- 1. Activer RLS
alter table public.my_table enable row level security;

-- 2. Policy SELECT
create policy "Users can view own data"
on public.my_table for select
to authenticated
using (auth.uid() = user_id);

-- 3. Policy INSERT
create policy "Users can insert own data"
on public.my_table for insert
to authenticated
with check (auth.uid() = user_id);

-- 4. Policy UPDATE
create policy "Users can update own data"
on public.my_table for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- 5. Policy DELETE
create policy "Users can delete own data"
on public.my_table for delete
to authenticated
using (auth.uid() = user_id);

-- 6. Service role bypass (pour webhooks)
create policy "Service role full access"
on public.my_table
to service_role
using (true)
with check (true);
```

### Storage RLS

```sql
-- Bucket privé avec isolation par user
create policy "Users can upload to own folder"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'files'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can view own files"
on storage.objects for select
to authenticated
using (
  bucket_id = 'files'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

---

## Pattern 6: Unified Client Abstraction

```typescript
// src/lib/supabase/unified.ts
import { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

export class SupabaseUnifiedClient {
  constructor(
    private client: SupabaseClient<Database>,
    private clientType: 'browser' | 'server'
  ) {}

  // Auth
  async signIn(email: string, password: string) {
    return this.client.auth.signInWithPassword({ email, password })
  }

  // Storage avec namespacing automatique
  async uploadFile(userId: string, filename: string, file: File) {
    const path = `${userId}/${filename}`
    return this.client.storage.from('files').upload(path, file)
  }

  async getSignedUrl(userId: string, filename: string, expiresIn = 3600) {
    const path = `${userId}/${filename}`
    return this.client.storage.from('files').createSignedUrl(path, expiresIn)
  }

  // Database type-safe
  from<T extends keyof Database['public']['Tables']>(table: T) {
    return this.client.from(table)
  }
}
```

---

## Checklist Sécurité

- [ ] `@supabase/ssr` installé (pas client basique)
- [ ] Middleware avec `updateSession()` actif
- [ ] RLS activé sur toutes les tables
- [ ] Policies par utilisateur (`auth.uid() = user_id`)
- [ ] Service role key **jamais exposée côté client**
- [ ] MFA activé pour actions sensibles
- [ ] Storage avec folders par user

---

## Différences: saas vs supabase-native

| Aspect | Template `saas` | Template `supabase-native` |
|--------|-----------------|---------------------------|
| Auth Provider | Clerk | Supabase Auth |
| SSR | Client basique | @supabase/ssr |
| MFA | Via Clerk | TOTP natif |
| RLS | Non | Migrations SQL |
| Storage | Vercel Blob | Supabase Storage |
| ORM | Prisma | Direct Supabase |

**Quand utiliser `supabase-native`:**
- Self-hosting souhaité
- Tout-en-un Supabase
- RLS requis
- MFA natif

**Quand utiliser `saas`:**
- Multi-provider auth (social logins via Clerk)
- Prisma pour typage ORM
- Vercel Blob pour fichiers

---

*Knowledge ULTRA-CREATE v27.0 - Supabase SSR Patterns*
