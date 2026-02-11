# Advanced Authentication Patterns - Passkeys, WebAuthn, MFA

> **Version**: v1.0 | ATUM CREA
> **Packages**: `@simplewebauthn/server` + `@simplewebauthn/browser` (MasterKale/SimpleWebAuthn)
> **Standard**: FIDO2/WebAuthn, NIST 2025 AAL2

---

## Table des Matieres

1. [Pourquoi les Passkeys](#pourquoi-les-passkeys)
2. [Architecture](#architecture)
3. [Installation](#installation)
4. [Registration Flow](#registration-flow)
5. [Authentication Flow](#authentication-flow)
6. [Session Management](#session-management)
7. [Integration Supabase](#integration-supabase)
8. [Integration Clerk](#integration-clerk)
9. [MFA (Multi-Factor Authentication)](#mfa)
10. [Checklist](#checklist)

---

## Pourquoi les Passkeys

| Critere | Mots de passe | Passkeys |
|---------|--------------|----------|
| Phishing | Vulnerable | Resistant (domaine lie) |
| Reutilisation | Frequent | Impossible |
| UX | Friction elevee | Biometrie native |
| Stockage serveur | Hash a proteger | Cle publique (non sensible) |
| NIST 2025 | AAL1 | AAL2 (authentificateur fort) |

> **TOUJOURS garder un fallback** (email/password ou magic link) car les passkeys ne sont pas supportes sur tous les appareils.

---

## Architecture

```
Registration:
Browser                          Server                          DB
  │ 1. /api/auth/register/begin   │                              │
  │ ──────────────────────────────>│  2. generateRegistration()   │
  │                                │     challenge + options      │
  │  3. options                    │<─────────────────────────────│
  │<───────────────────────────────│                              │
  │                                │                              │
  │  4. navigator.credentials.create()                            │
  │     (biometrie/PIN)                                           │
  │                                │                              │
  │  5. /api/auth/register/verify  │                              │
  │ ──────────────────────────────>│  6. verifyRegistration()     │
  │                                │  7. Stocker credential       │
  │                                │ ─────────────────────────────>│
  │  8. Success + session          │                              │
  │<───────────────────────────────│                              │

Authentication:
Browser                          Server                          DB
  │ 1. /api/auth/login/begin      │                              │
  │ ──────────────────────────────>│  2. generateAuthentication() │
  │                                │     challenge                │
  │  3. options                    │<─────────────────────────────│
  │<───────────────────────────────│                              │
  │                                │                              │
  │  4. navigator.credentials.get()                               │
  │     (biometrie/PIN)                                           │
  │                                │                              │
  │  5. /api/auth/login/verify     │                              │
  │ ──────────────────────────────>│  6. verifyAuthentication()   │
  │                                │  7. Verifier en DB           │
  │                                │ ─────────────────────────────>│
  │  8. Session cookie             │                              │
  │<───────────────────────────────│                              │
```

---

## Installation

```bash
# Server
pnpm add @simplewebauthn/server

# Client (browser)
pnpm add @simplewebauthn/browser

# Session
pnpm add iron-session
```

---

## Registration Flow

### API Route - Begin Registration

```typescript
// app/api/auth/passkey/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {
  generateRegistrationOptions,
  type GenerateRegistrationOptionsOpts,
} from '@simplewebauthn/server';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';

const rpName = 'Mon Application';
const rpID = process.env.NEXT_PUBLIC_RP_ID || 'localhost';

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Recuperer les credentials existants
  const existingCredentials = await db.credential.findMany({
    where: { userId: session.userId },
    select: { credentialId: true, transports: true },
  });

  const opts: GenerateRegistrationOptionsOpts = {
    rpName,
    rpID,
    userName: session.email,
    userDisplayName: session.name,
    attestationType: 'none',
    excludeCredentials: existingCredentials.map((c) => ({
      id: c.credentialId,
      transports: c.transports as AuthenticatorTransport[],
    })),
    authenticatorSelection: {
      residentKey: 'preferred',
      userVerification: 'preferred',
      authenticatorAttachment: 'platform', // Biometrie de l'appareil
    },
  };

  const options = await generateRegistrationOptions(opts);

  // Stocker le challenge en session pour verification
  session.currentChallenge = options.challenge;
  await session.save();

  return NextResponse.json(options);
}
```

### API Route - Verify Registration

```typescript
// app/api/auth/passkey/register/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {
  verifyRegistrationResponse,
  type VerifiedRegistrationResponse,
} from '@simplewebauthn/server';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';

const rpID = process.env.NEXT_PUBLIC_RP_ID || 'localhost';
const origin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session.userId || !session.currentChallenge) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 400 });
  }

  const body = await request.json();

  let verification: VerifiedRegistrationResponse;
  try {
    verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge: session.currentChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 400 }
    );
  }

  if (!verification.verified || !verification.registrationInfo) {
    return NextResponse.json({ error: 'Not verified' }, { status: 400 });
  }

  const { credential, credentialDeviceType, credentialBackedUp } =
    verification.registrationInfo;

  // Stocker le credential en DB
  await db.credential.create({
    data: {
      userId: session.userId,
      credentialId: Buffer.from(credential.id).toString('base64url'),
      publicKey: Buffer.from(credential.publicKey),
      counter: credential.counter,
      transports: body.response.transports || [],
      deviceType: credentialDeviceType,
      backedUp: credentialBackedUp,
    },
  });

  // Nettoyer le challenge
  session.currentChallenge = undefined;
  await session.save();

  return NextResponse.json({ verified: true });
}
```

### Client - Registration

```typescript
// lib/auth/passkey-client.ts
import {
  startRegistration,
  startAuthentication,
} from '@simplewebauthn/browser';

export async function registerPasskey(): Promise<boolean> {
  // 1. Obtenir les options du serveur
  const optionsRes = await fetch('/api/auth/passkey/register', {
    method: 'POST',
  });
  const options = await optionsRes.json();

  // 2. Creer le credential (declenche la biometrie)
  let attestation;
  try {
    attestation = await startRegistration({ optionsJSON: options });
  } catch (error) {
    if ((error as Error).name === 'NotAllowedError') {
      throw new Error('Registration cancelled by user');
    }
    throw error;
  }

  // 3. Envoyer la reponse au serveur pour verification
  const verifyRes = await fetch('/api/auth/passkey/register/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(attestation),
  });

  const result = await verifyRes.json();
  return result.verified === true;
}
```

---

## Authentication Flow

### API Route - Begin Authentication

```typescript
// app/api/auth/passkey/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generateAuthenticationOptions } from '@simplewebauthn/server';
import { getSession } from '@/lib/session';

const rpID = process.env.NEXT_PUBLIC_RP_ID || 'localhost';

export async function POST(request: NextRequest) {
  const options = await generateAuthenticationOptions({
    rpID,
    userVerification: 'preferred',
    // Si pas d'allowCredentials, le navigateur propose tous les passkeys
  });

  const session = await getSession();
  session.currentChallenge = options.challenge;
  await session.save();

  return NextResponse.json(options);
}
```

### API Route - Verify Authentication

```typescript
// app/api/auth/passkey/login/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthenticationResponse } from '@simplewebauthn/server';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';

const rpID = process.env.NEXT_PUBLIC_RP_ID || 'localhost';
const origin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session.currentChallenge) {
    return NextResponse.json({ error: 'No challenge' }, { status: 400 });
  }

  const body = await request.json();

  // Trouver le credential en DB
  const credentialId = Buffer.from(body.id, 'base64url').toString('base64url');
  const credential = await db.credential.findUnique({
    where: { credentialId },
    include: { user: true },
  });

  if (!credential) {
    return NextResponse.json({ error: 'Unknown credential' }, { status: 400 });
  }

  const verification = await verifyAuthenticationResponse({
    response: body,
    expectedChallenge: session.currentChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    credential: {
      id: credential.credentialId,
      publicKey: credential.publicKey,
      counter: credential.counter,
      transports: credential.transports as AuthenticatorTransport[],
    },
  });

  if (!verification.verified) {
    return NextResponse.json({ error: 'Not verified' }, { status: 400 });
  }

  // Mettre a jour le counter (protection replay)
  await db.credential.update({
    where: { credentialId },
    data: { counter: verification.authenticationInfo.newCounter },
  });

  // Creer la session
  session.userId = credential.userId;
  session.email = credential.user.email;
  session.currentChallenge = undefined;
  await session.save();

  return NextResponse.json({ verified: true, userId: credential.userId });
}
```

### Client - Authentication

```typescript
export async function loginWithPasskey(): Promise<boolean> {
  // 1. Obtenir les options
  const optionsRes = await fetch('/api/auth/passkey/login', { method: 'POST' });
  const options = await optionsRes.json();

  // 2. Signer le challenge (biometrie)
  let assertion;
  try {
    assertion = await startAuthentication({ optionsJSON: options });
  } catch (error) {
    if ((error as Error).name === 'NotAllowedError') {
      throw new Error('Authentication cancelled');
    }
    throw error;
  }

  // 3. Verifier
  const verifyRes = await fetch('/api/auth/passkey/login/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(assertion),
  });

  const result = await verifyRes.json();
  return result.verified === true;
}
```

---

## Session Management

```typescript
// lib/session.ts
import { getIronSession, type SessionOptions } from 'iron-session';
import { cookies } from 'next/headers';

export type SessionData = {
  userId?: string;
  email?: string;
  name?: string;
  currentChallenge?: string;
};

const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET!, // 32+ caracteres
  cookieName: 'app-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 jours
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}
```

---

## Integration Supabase

Pour les projets utilisant Supabase Auth nativement :

```typescript
// Supabase supporte les passkeys via son SDK auth
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(url, anonKey);

// Supabase gere les passkeys en interne si active dans le dashboard
// Dashboard > Authentication > Providers > WebAuthn
```

---

## Integration Clerk

Pour les projets utilisant Clerk :

```typescript
// Clerk supporte les passkeys nativement
// Activer dans le Clerk Dashboard > User & Authentication > Multi-factor

// Cote client, Clerk gere tout via son composant
import { UserProfile } from '@clerk/nextjs';

// Le composant UserProfile inclut la gestion des passkeys
export function SettingsPage() {
  return <UserProfile />;
}
```

---

## MFA

### TOTP (Google Authenticator)

```typescript
// lib/auth/totp.ts
import { createTOTPKeyURI, verifyTOTP } from '@oslojs/otp'; // Alternative: otpauth

export function generateTOTPSecret(): { secret: Uint8Array; uri: string } {
  const secret = crypto.getRandomValues(new Uint8Array(20));
  const uri = createTOTPKeyURI('MonApp', userEmail, secret);
  return { secret, uri };
}

export function verifyTOTPCode(secret: Uint8Array, code: string): boolean {
  return verifyTOTP(secret, 30, 6, code);
}
```

### Strategie MFA recommandee

```
Niveau 1 (Base)     : Email + Password
Niveau 2 (Standard) : + Passkey OU TOTP
Niveau 3 (Eleve)    : + Passkey ET TOTP
Niveau 4 (Maximum)  : + Hardware key (YubiKey)
```

---

## Schema DB (Prisma)

```prisma
model User {
  id          String       @id @default(uuid())
  email       String       @unique
  name        String?
  password    String?      // Nullable si passkey-only
  credentials Credential[]
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
}

model Credential {
  id           String   @id @default(uuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  credentialId String   @unique
  publicKey    Bytes
  counter      Int      @default(0)
  transports   String[] // ["internal", "hybrid"]
  deviceType   String   // "singleDevice" | "multiDevice"
  backedUp     Boolean  @default(false)
  name         String?  // Nom donne par l'utilisateur
  createdAt    DateTime @default(now())
  lastUsedAt   DateTime?

  @@index([userId])
}
```

---

## Checklist

### Setup
- [ ] `@simplewebauthn/server` + `@simplewebauthn/browser` installes
- [ ] `iron-session` pour les sessions
- [ ] Variable `RP_ID` configuree (domaine en production)
- [ ] Variable `SESSION_SECRET` (32+ caracteres)
- [ ] Table `credentials` en DB

### Implementation
- [ ] Registration flow (begin + verify)
- [ ] Authentication flow (begin + verify)
- [ ] Counter update apres chaque authentification
- [ ] Fallback email/password toujours disponible
- [ ] UI pour gerer ses passkeys (ajouter, supprimer, renommer)

### Securite
- [ ] Challenges a usage unique (supprimes apres verification)
- [ ] `expectedOrigin` verifie (protection phishing)
- [ ] `expectedRPID` verifie
- [ ] Rate limiting sur les endpoints d'auth
- [ ] Cookies `httpOnly`, `secure`, `sameSite`

### Production
- [ ] `RP_ID` = domaine de production (pas localhost)
- [ ] HTTPS obligatoire (WebAuthn refuse HTTP sauf localhost)
- [ ] Monitoring des echecs d'authentification
- [ ] Recovery flow si tous les passkeys sont perdus

---

*Knowledge ATUM CREA | Sources: MasterKale/SimpleWebAuthn, corbado/passkey-tutorial, NIST SP 800-63B-4*
