# Guide Web Vitals - ULTRA-CREATE v24.1

> **Objectif**: Intégrer les Core Web Vitals dans tous les projets web pour optimiser
> les performances et le SEO Google.

---

## Table des Matières

1. [Core Web Vitals 2025](#core-web-vitals-2025)
2. [Installation](#installation)
3. [Intégration Next.js](#intégration-nextjs)
4. [Envoi Analytics](#envoi-analytics)
5. [Mode Attribution](#mode-attribution)
6. [Seuils et Optimisation](#seuils-et-optimisation)
7. [Patterns ULTRA-CREATE](#patterns-ultra-create)

---

## Core Web Vitals 2025

### Métriques Principales (Google Ranking)

| Métrique | Nom | Mesure | Seuil Bon |
|----------|-----|--------|-----------|
| **LCP** | Largest Contentful Paint | Chargement visuel | < 2.5s |
| **INP** | Interaction to Next Paint | Réactivité | < 200ms |
| **CLS** | Cumulative Layout Shift | Stabilité visuelle | < 0.1 |

### Métriques Secondaires

| Métrique | Nom | Mesure | Seuil Bon |
|----------|-----|--------|-----------|
| **FCP** | First Contentful Paint | Premier contenu | < 1.8s |
| **TTFB** | Time to First Byte | Réponse serveur | < 800ms |

### Changement Important 2024

> **INP remplace FID** depuis mars 2024. Toujours utiliser `onINP()` au lieu de `onFID()`.

---

## Installation

```bash
# npm
npm install web-vitals

# pnpm (recommandé)
pnpm add web-vitals

# yarn
yarn add web-vitals
```

**Version actuelle**: 5.x (TypeScript natif)

---

## Intégration Next.js

### App Router (Next.js 13+)

```typescript
// lib/web-vitals.ts
import { onCLS, onINP, onLCP, onFCP, onTTFB } from 'web-vitals';
import type { Metric } from 'web-vitals';

type ReportHandler = (metric: Metric) => void;

export function reportWebVitals(onReport: ReportHandler = console.log) {
  // Core Web Vitals (Google Ranking)
  onCLS(onReport);
  onINP(onReport);  // Remplace FID depuis mars 2024
  onLCP(onReport);

  // Métriques secondaires
  onFCP(onReport);
  onTTFB(onReport);
}

// Envoi vers endpoint personnalisé
export function sendToAnalytics(metric: Metric) {
  const body = JSON.stringify({
    id: metric.id,
    name: metric.name,
    value: metric.value,
    rating: metric.rating, // 'good' | 'needs-improvement' | 'poor'
    delta: metric.delta,
    navigationType: metric.navigationType,
  });

  // Utiliser sendBeacon pour fiabilité
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/analytics/vitals', body);
  } else {
    fetch('/api/analytics/vitals', { body, method: 'POST', keepalive: true });
  }
}
```

```typescript
// app/layout.tsx
'use client';

import { useEffect } from 'react';
import { reportWebVitals, sendToAnalytics } from '@/lib/web-vitals';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    reportWebVitals(sendToAnalytics);
  }, []);

  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
```

### Pages Router (Legacy)

```typescript
// pages/_app.tsx
import type { AppProps } from 'next/app';
import type { NextWebVitalsMetric } from 'next/app';

export function reportWebVitals(metric: NextWebVitalsMetric) {
  console.log(metric);

  // Envoi vers analytics
  const body = JSON.stringify({
    id: metric.id,
    name: metric.name,
    value: metric.value,
    label: metric.label,
  });

  navigator.sendBeacon?.('/api/analytics/vitals', body);
}

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
```

---

## Envoi Analytics

### Google Analytics 4

```typescript
// lib/web-vitals-ga4.ts
import { onCLS, onINP, onLCP, onFCP, onTTFB } from 'web-vitals';
import type { Metric } from 'web-vitals';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

function sendToGA4(metric: Metric) {
  window.gtag?.('event', metric.name, {
    event_category: 'Web Vitals',
    event_label: metric.id,
    value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    non_interaction: true,
    // Dimensions personnalisées
    metric_id: metric.id,
    metric_value: metric.value,
    metric_rating: metric.rating,
  });
}

export function initWebVitalsGA4() {
  onCLS(sendToGA4);
  onINP(sendToGA4);
  onLCP(sendToGA4);
  onFCP(sendToGA4);
  onTTFB(sendToGA4);
}
```

### Endpoint API (Supabase)

```typescript
// app/api/analytics/vitals/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const metric = await request.json();

    await supabase.from('web_vitals').insert({
      metric_id: metric.id,
      metric_name: metric.name,
      metric_value: metric.value,
      metric_rating: metric.rating,
      navigation_type: metric.navigationType,
      url: request.headers.get('referer'),
      user_agent: request.headers.get('user-agent'),
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to log metric' }, { status: 500 });
  }
}
```

### Table Supabase

```sql
-- Migration: create_web_vitals_table
CREATE TABLE web_vitals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_id TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_rating TEXT CHECK (metric_rating IN ('good', 'needs-improvement', 'poor')),
  navigation_type TEXT,
  url TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les requêtes fréquentes
CREATE INDEX idx_web_vitals_name ON web_vitals(metric_name);
CREATE INDEX idx_web_vitals_created_at ON web_vitals(created_at);

-- RLS
ALTER TABLE web_vitals ENABLE ROW LEVEL SECURITY;

-- Policy: insérer depuis l'API
CREATE POLICY "Allow insert from API" ON web_vitals
  FOR INSERT WITH CHECK (true);

-- Policy: lecture pour admins
CREATE POLICY "Allow read for admins" ON web_vitals
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');
```

---

## Mode Attribution

Pour débugger les problèmes de performance, utilisez le build `attribution`:

```typescript
// lib/web-vitals-debug.ts
import { onCLS, onINP, onLCP } from 'web-vitals/attribution';
import type { CLSMetricWithAttribution, INPMetricWithAttribution, LCPMetricWithAttribution } from 'web-vitals/attribution';

export function debugWebVitals() {
  onCLS((metric: CLSMetricWithAttribution) => {
    console.log('CLS Debug:', {
      value: metric.value,
      largestShiftEntry: metric.attribution.largestShiftEntry,
      largestShiftTarget: metric.attribution.largestShiftTarget,
      loadState: metric.attribution.loadState,
    });
  });

  onINP((metric: INPMetricWithAttribution) => {
    console.log('INP Debug:', {
      value: metric.value,
      eventTarget: metric.attribution.eventTarget,
      eventType: metric.attribution.eventType,
      eventTime: metric.attribution.eventTime,
      loadState: metric.attribution.loadState,
    });
  });

  onLCP((metric: LCPMetricWithAttribution) => {
    console.log('LCP Debug:', {
      value: metric.value,
      element: metric.attribution.element,
      url: metric.attribution.url,
      timeToFirstByte: metric.attribution.timeToFirstByte,
      resourceLoadDelay: metric.attribution.resourceLoadDelay,
      resourceLoadDuration: metric.attribution.resourceLoadDuration,
    });
  });
}
```

### Activer en développement

```typescript
// app/layout.tsx
'use client';

import { useEffect } from 'react';
import { reportWebVitals } from '@/lib/web-vitals';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      import('@/lib/web-vitals-debug').then(({ debugWebVitals }) => {
        debugWebVitals();
      });
    } else {
      reportWebVitals();
    }
  }, []);

  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
```

---

## Seuils et Optimisation

### Tableau des Seuils

| Métrique | Bon | À améliorer | Mauvais |
|----------|-----|-------------|---------|
| **LCP** | < 2.5s | 2.5s - 4s | > 4s |
| **INP** | < 200ms | 200ms - 500ms | > 500ms |
| **CLS** | < 0.1 | 0.1 - 0.25 | > 0.25 |
| **FCP** | < 1.8s | 1.8s - 3s | > 3s |
| **TTFB** | < 800ms | 800ms - 1800ms | > 1800ms |

### Optimisations par Métrique

#### LCP (Largest Contentful Paint)

```tsx
// Prioritiser l'image hero
import Image from 'next/image';

export function Hero() {
  return (
    <Image
      src="/hero.webp"
      alt="Hero"
      width={1200}
      height={600}
      priority  // Précharge l'image LCP
      sizes="100vw"
    />
  );
}
```

```typescript
// next.config.ts - Optimisation images
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  },
};
```

#### INP (Interaction to Next Paint)

```tsx
// Éviter les handlers lourds
'use client';

import { useTransition } from 'react';

export function SearchButton() {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(() => {
      // Opération lourde en transition
      performHeavySearch();
    });
  };

  return (
    <button onClick={handleClick} disabled={isPending}>
      {isPending ? 'Recherche...' : 'Rechercher'}
    </button>
  );
}
```

#### CLS (Cumulative Layout Shift)

```tsx
// Réserver l'espace pour les images
<Image
  src="/product.jpg"
  alt="Product"
  width={400}
  height={300}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>

// Réserver l'espace pour les embeds
<div style={{ aspectRatio: '16/9', width: '100%' }}>
  <iframe src="..." />
</div>

// Fonts avec display swap
// app/layout.tsx
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',  // Évite FOIT
});
```

---

## Patterns ULTRA-CREATE

### Pattern SaaS

```typescript
// templates/saas/lib/web-vitals.ts
import { onCLS, onINP, onLCP, onFCP, onTTFB } from 'web-vitals';
import type { Metric } from 'web-vitals';
import { analytics } from '@/lib/analytics';

export function initWebVitals() {
  const reportMetric = (metric: Metric) => {
    // Console en dev
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Web Vital] ${metric.name}:`, metric.value, metric.rating);
    }

    // Envoyer à l'analytics
    analytics.track('Web Vital', {
      metric: metric.name,
      value: metric.value,
      rating: metric.rating,
      id: metric.id,
    });
  };

  onCLS(reportMetric);
  onINP(reportMetric);
  onLCP(reportMetric);
  onFCP(reportMetric);
  onTTFB(reportMetric);
}
```

### Pattern Landing Page

```typescript
// templates/landing/lib/web-vitals.ts
import { onCLS, onINP, onLCP } from 'web-vitals';
import type { Metric } from 'web-vitals';

// Landing pages: focus sur les Core Web Vitals uniquement
export function initWebVitals() {
  const sendToGA = (metric: Metric) => {
    window.gtag?.('event', metric.name, {
      event_category: 'Web Vitals',
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      event_label: metric.rating,
      non_interaction: true,
    });
  };

  onCLS(sendToGA);
  onINP(sendToGA);
  onLCP(sendToGA);
}
```

### Pattern E-commerce

```typescript
// templates/ecommerce/lib/web-vitals.ts
import { onCLS, onINP, onLCP, onFCP, onTTFB } from 'web-vitals';
import type { Metric } from 'web-vitals';

// E-commerce: toutes les métriques + alertes
export function initWebVitals() {
  const reportMetric = (metric: Metric) => {
    // Alerte si performance critique
    if (metric.rating === 'poor') {
      console.error(`[PERF ALERT] ${metric.name} is ${metric.rating}:`, metric.value);

      // Envoyer alerte à Sentry/monitoring
      if (typeof window !== 'undefined' && window.Sentry) {
        window.Sentry.captureMessage(`Poor ${metric.name}: ${metric.value}`, 'warning');
      }
    }

    // GA4 tracking
    window.gtag?.('event', metric.name, {
      event_category: 'Web Vitals',
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      event_label: metric.rating,
    });
  };

  onCLS(reportMetric);
  onINP(reportMetric);
  onLCP(reportMetric);
  onFCP(reportMetric);
  onTTFB(reportMetric);
}
```

---

## Checklist Performance

### Avant Deploy

- [ ] web-vitals v5+ installé
- [ ] `onINP` utilisé (pas `onFID`)
- [ ] Images LCP avec `priority`
- [ ] Fonts avec `display: swap`
- [ ] Dimensions images définies
- [ ] Analytics configuré

### Monitoring Continu

- [ ] Dashboard GA4 ou Supabase
- [ ] Alertes sur métriques "poor"
- [ ] Review mensuelle des tendances
- [ ] Tests Lighthouse en CI

---

---

## Bundle Analysis

### @next/bundle-analyzer
```bash
pnpm add -D @next/bundle-analyzer
```

```typescript
// next.config.ts
import withBundleAnalyzer from '@next/bundle-analyzer';
const config = withBundleAnalyzer({ enabled: process.env.ANALYZE === 'true' })({});
export default config;
```

```bash
ANALYZE=true pnpm build
```

### Budgets CI (size-limit)
```bash
pnpm add -D size-limit @size-limit/preset-app
```

```json
{ "size-limit": [{ "path": ".next/static/**/*.js", "limit": "300 KB", "gzip": true }] }
```

---

## Code Splitting Avance

```typescript
// IMPORTANT: next/dynamic avec ssr: false DOIT etre dans un fichier 'use client' (Next.js 15+)
'use client';
import dynamic from 'next/dynamic';

const RichTextEditor = dynamic(() => import('@/components/editor'), { ssr: false });
const Chart = dynamic(() => import('@/components/chart'), { ssr: false });
const MapView = dynamic(() => import('@/components/map'), { ssr: false });
```

| Composant | Technique | Raison |
|-----------|-----------|--------|
| Editeur riche | `dynamic({ ssr: false })` | > 100KB, pas besoin SSR |
| Graphiques | `dynamic({ ssr: false })` | Besoin du DOM |
| Carte | `dynamic({ ssr: false })` | > 200KB, DOM requis |
| Modal complexe | `React.lazy + Suspense` | Charge si ouvert |
| Pages admin | Route-based (auto) | App Router split par route |

---

## SEO Structured Data (Schema.org)

### JSON-LD
```typescript
// components/seo/json-ld.tsx
export function JsonLd({ data }: { data: Record<string, any> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
```

### Schemas courants
```typescript
// Organization, Product, Article, FAQ, BreadcrumbList
export function productSchema(p: { name: string; price: number; currency: string }) {
  return {
    '@context': 'https://schema.org', '@type': 'Product',
    name: p.name,
    offers: { '@type': 'Offer', price: p.price, priceCurrency: p.currency },
  };
}

export function faqSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question', name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}
```

### Metadata API (Next.js 15)
```typescript
export const metadata: Metadata = {
  metadataBase: new URL('https://monapp.com'),
  title: { default: 'MonApp', template: '%s | MonApp' },
  openGraph: { type: 'website', locale: 'fr_FR' },
  robots: { index: true, follow: true },
};
```

---

## Ressources

- [web-vitals GitHub](https://github.com/GoogleChrome/web-vitals)
- [Core Web Vitals Google](https://web.dev/vitals/)
- [INP Documentation](https://web.dev/inp/)
- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Schema.org](https://schema.org)

---

*Guide ATUM CREA v2.0 | web-vitals v5 | Bundle Analysis | SEO | Code Splitting*
