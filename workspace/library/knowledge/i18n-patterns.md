# Internationalisation (i18n) - Patterns Next.js

> **Version**: v1.0 | ATUM CREA
> **Package**: `next-intl` (amannn/next-intl)
> **Stack**: Next.js 15 App Router + TypeScript

---

## Table des Matieres

1. [Architecture](#architecture)
2. [Installation](#installation)
3. [Configuration du Routing](#configuration-du-routing)
4. [Middleware](#middleware)
5. [Messages & Traductions](#messages--traductions)
6. [Composants Serveur](#composants-serveur)
7. [Composants Client](#composants-client)
8. [TypeScript Strict](#typescript-strict)
9. [Patterns Avances](#patterns-avances)
10. [Checklist](#checklist)

---

## Architecture

```
src/
├── app/
│   └── [locale]/            # Segment dynamique pour la locale
│       ├── layout.tsx        # Layout avec NextIntlClientProvider
│       ├── page.tsx          # Page d'accueil localisee
│       └── dashboard/
│           └── page.tsx
├── i18n/
│   ├── routing.ts           # Configuration du routing
│   ├── request.ts           # Configuration request-scope
│   └── navigation.ts        # Helpers de navigation types
├── messages/
│   ├── en.json              # Messages anglais
│   ├── fr.json              # Messages francais
│   └── es.json              # Messages espagnol
├── middleware.ts             # Middleware i18n
└── global.d.ts              # Types pour les messages
```

---

## Installation

```bash
pnpm add next-intl
```

---

## Configuration du Routing

```typescript
// src/i18n/routing.ts
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'fr', 'es', 'de', 'ja'] as const,
  defaultLocale: 'fr',
  localePrefix: 'as-needed',  // Pas de prefixe pour la locale par defaut
  pathnames: {
    '/': '/',
    '/about': {
      en: '/about',
      fr: '/a-propos',
      es: '/acerca-de',
      de: '/ueber-uns',
      ja: '/about',
    },
    '/dashboard': '/dashboard',
    '/blog/[slug]': '/blog/[slug]',
  },
});

export type Locale = (typeof routing.locales)[number];
export type Pathnames = keyof typeof routing.pathnames;
```

```typescript
// src/i18n/navigation.ts
import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
```

```typescript
// src/i18n/request.ts
import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
```

---

## Middleware

```typescript
// src/middleware.ts
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Matcher: toutes les routes sauf assets statiques et API
  matcher: [
    '/((?!api|_next|_vercel|.*\\..*).*)',
    // Activer les redirections sur /
    '/',
  ],
};
```

---

## Messages & Traductions

### Structure des fichiers JSON

```json
// messages/fr.json
{
  "common": {
    "loading": "Chargement...",
    "error": "Une erreur est survenue",
    "save": "Enregistrer",
    "cancel": "Annuler",
    "delete": "Supprimer",
    "confirm": "Confirmer"
  },
  "navigation": {
    "home": "Accueil",
    "dashboard": "Tableau de bord",
    "settings": "Parametres",
    "logout": "Deconnexion"
  },
  "auth": {
    "login": "Se connecter",
    "register": "Creer un compte",
    "email": "Adresse email",
    "password": "Mot de passe",
    "forgotPassword": "Mot de passe oublie ?"
  },
  "dashboard": {
    "title": "Tableau de bord",
    "welcome": "Bienvenue, {name} !",
    "stats": {
      "users": "{count, plural, =0 {Aucun utilisateur} one {# utilisateur} other {# utilisateurs}}",
      "revenue": "Chiffre d'affaires : {amount, number, ::currency/EUR}"
    }
  },
  "metadata": {
    "home": {
      "title": "Accueil - Mon Application",
      "description": "Description de l'application en francais"
    }
  }
}
```

### ICU Message Syntax

```json
{
  "plurals": "{count, plural, =0 {Aucun element} one {# element} other {# elements}}",
  "select": "{gender, select, male {Il a} female {Elle a} other {La personne a}} {count} messages",
  "number": "Prix : {price, number, ::currency/EUR}",
  "date": "Cree le {date, date, long}",
  "time": "A {time, time, short}",
  "rich": "Veuillez <link>accepter les conditions</link> pour continuer"
}
```

---

## Composants Serveur

```typescript
// src/app/[locale]/layout.tsx
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  // Valider la locale
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Activer le rendu statique
  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

```typescript
// src/app/[locale]/page.tsx
import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = useTranslations('dashboard');

  return (
    <main>
      <h1>{t('title')}</h1>
      <p>{t('welcome', { name: 'Arnaud' })}</p>
      <p>{t('stats.users', { count: 42 })}</p>
      <Link href="/dashboard">
        {t('title')}
      </Link>
    </main>
  );
}
```

### Metadata localisee

```typescript
// src/app/[locale]/layout.tsx
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.home' });

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: `/${locale}`,
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, `/${l}`])
      ),
    },
  };
}
```

---

## Composants Client

```typescript
// src/components/language-switcher.tsx
'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';

const localeNames: Record<Locale, string> = {
  en: 'English',
  fr: 'Francais',
  es: 'Espanol',
  de: 'Deutsch',
  ja: '日本語',
};

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function onLocaleChange(newLocale: string) {
    router.replace(pathname, { locale: newLocale as Locale });
  }

  return (
    <select
      value={locale}
      onChange={(e) => onLocaleChange(e.target.value)}
      aria-label="Language"
    >
      {routing.locales.map((l) => (
        <option key={l} value={l}>
          {localeNames[l]}
        </option>
      ))}
    </select>
  );
}
```

```typescript
// src/components/rich-text.tsx
'use client';

import { useTranslations } from 'next-intl';

export function TermsMessage() {
  const t = useTranslations();

  return (
    <p>
      {t.rich('rich', {
        link: (chunks) => (
          <a href="/terms" className="text-blue-600 underline">
            {chunks}
          </a>
        ),
      })}
    </p>
  );
}
```

---

## TypeScript Strict

```typescript
// src/global.d.ts
import fr from './messages/fr.json';

type Messages = typeof fr;

declare module 'next-intl' {
  interface AppConfig {
    Messages: Messages;
  }
}
```

> Cela active l'autocompletion et la verification de type pour toutes les cles de traduction.

---

## Patterns Avances

### Nombre et monnaie formattes

```typescript
import { useFormatter, useLocale } from 'next-intl';

export function PriceDisplay({ amount }: { amount: number }) {
  const format = useFormatter();
  const locale = useLocale();

  const currency = locale === 'en' ? 'USD' : 'EUR';

  return (
    <span>
      {format.number(amount, { style: 'currency', currency })}
    </span>
  );
}
```

### Dates relatives

```typescript
import { useFormatter } from 'next-intl';

export function TimeAgo({ date }: { date: Date }) {
  const format = useFormatter();

  return (
    <time dateTime={date.toISOString()}>
      {format.relativeTime(date)}
    </time>
  );
}
```

### Listes formatees

```typescript
import { useFormatter } from 'next-intl';

export function AuthorList({ authors }: { authors: string[] }) {
  const format = useFormatter();

  return (
    <span>
      {format.list(authors, { type: 'conjunction' })}
    </span>
  );
}
// fr: "Alice, Bob et Charlie"
// en: "Alice, Bob, and Charlie"
```

### Server Actions avec i18n

```typescript
// src/app/[locale]/actions.ts
'use server';

import { getTranslations } from 'next-intl/server';

export async function submitForm(formData: FormData) {
  const t = await getTranslations('forms.validation');

  const email = formData.get('email') as string;
  if (!email) {
    return { error: t('emailRequired') };
  }

  // ... traitement
  return { success: t('formSubmitted') };
}
```

---

## Checklist

### Setup Initial
- [ ] `pnpm add next-intl`
- [ ] `src/i18n/routing.ts` avec `defineRouting`
- [ ] `src/i18n/request.ts` avec `getRequestConfig`
- [ ] `src/i18n/navigation.ts` avec `createNavigation`
- [ ] `src/middleware.ts` avec `createMiddleware`
- [ ] `src/app/[locale]/layout.tsx` avec `NextIntlClientProvider`
- [ ] `src/global.d.ts` pour le typage strict
- [ ] `messages/` avec au moins 2 locales

### Par Page
- [ ] `setRequestLocale(locale)` dans chaque page/layout (rendu statique)
- [ ] `generateStaticParams` dans le layout racine locale
- [ ] Metadata localisee avec `getTranslations`
- [ ] `hreflang` dans les alternates

### Composants
- [ ] `useTranslations` pour les textes
- [ ] `useFormatter` pour nombres/dates/listes
- [ ] `Link` de `@/i18n/navigation` (pas de `next/link`)
- [ ] `LanguageSwitcher` accessible

### Production
- [ ] Toutes les cles presentes dans chaque locale
- [ ] ICU syntax pour pluriels et genres
- [ ] Tests avec chaque locale
- [ ] Schema.org `inLanguage` pour le SEO

---

## Caveats

1. **`setRequestLocale`** est OBLIGATOIRE dans chaque `page.tsx` et `layout.tsx` pour activer le rendu statique. Sans ca, toutes les pages sont dynamiques.

2. **Navigation** : Toujours utiliser `Link`, `useRouter`, `usePathname` de `@/i18n/navigation`, jamais les imports directs de `next/navigation`.

3. **Middleware** : Le matcher doit exclure `/api`, `/_next`, et les fichiers statiques.

4. **Messages imbriques** : Utiliser le namespace pour eviter de charger tous les messages dans les composants client : `useTranslations('dashboard.stats')`.

---

*Knowledge ATUM CREA | Source: amannn/next-intl, recherche web 2025*
