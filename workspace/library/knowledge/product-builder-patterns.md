# Product Builder Patterns - ULTRA-CREATE v28.4

> **Source**: Best practices pour product builders
> **Date**: 18 Janvier 2026
> **Coverage**: Analytics, Email, SEO, Monitoring

---

## Vue d'ensemble

Ce document couvre les patterns essentiels pour les product builders:
- **Analytics**: Posthog, Mixpanel, GA4
- **Email**: Resend, React Email
- **SEO**: Next.js 15 Metadata API, JSON-LD, Sitemap
- **Monitoring**: Sentry, Error Boundaries

---

## 1. Analytics Patterns

### 1.1 Posthog (Open Source - Recommande)

```typescript
// Installation: npm install posthog-js
import posthog from 'posthog-js'

// === INITIALIZATION ===
// app/providers.tsx (Next.js App Router)
'use client'
import { useEffect } from 'react'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
      capture_pageview: true,
      capture_pageleave: true,
      persistence: 'localStorage',
      autocapture: true // Auto-capture clicks, inputs, etc.
    })
  }, [])

  return <>{children}</>
}

// === EVENT TRACKING ===
// Track custom events
posthog.capture('user_signed_up', {
  plan: 'pro',
  source: 'landing_page',
  referral: document.referrer
})

posthog.capture('purchase_completed', {
  amount: 99,
  currency: 'USD',
  product_id: 'prod_123',
  payment_method: 'stripe'
})

posthog.capture('feature_used', {
  feature: 'export_pdf',
  duration_ms: 1500
})

// === USER IDENTIFICATION ===
// After login/signup
posthog.identify(user.id, {
  email: user.email,
  name: user.name,
  plan: user.subscription?.plan,
  created_at: user.createdAt
})

// Reset on logout
posthog.reset()

// === FEATURE FLAGS ===
// Check if feature is enabled
if (posthog.isFeatureEnabled('new-dashboard')) {
  // Show new dashboard
}

// Get feature flag payload
const variant = posthog.getFeatureFlag('pricing-experiment')
if (variant === 'variant-a') {
  // Show variant A pricing
}

// === GROUP ANALYTICS (B2B) ===
posthog.group('company', company.id, {
  name: company.name,
  plan: company.plan,
  employee_count: company.size
})
```

### 1.2 Mixpanel (Enterprise)

```typescript
// Installation: npm install mixpanel-browser
import mixpanel from 'mixpanel-browser'

// Initialize
mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_TOKEN!, {
  track_pageview: true,
  persistence: 'localStorage'
})

// Track events
mixpanel.track('Button Clicked', {
  button_name: 'signup',
  page: 'landing'
})

// Identify users
mixpanel.identify(user.id)
mixpanel.people.set({
  $email: user.email,
  $name: user.name,
  plan: user.plan
})

// Time events (measure duration)
mixpanel.time_event('Checkout Flow')
// ... user completes checkout ...
mixpanel.track('Checkout Flow') // Automatically includes duration
```

### 1.3 Google Analytics 4

```typescript
// Installation: npm install @next/third-parties
// app/layout.tsx
import { GoogleAnalytics } from '@next/third-parties/google'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>{children}</body>
      <GoogleAnalytics gaId="G-XXXXXXXXXX" />
    </html>
  )
}

// Track events manually
declare global {
  interface Window {
    gtag: (...args: any[]) => void
  }
}

window.gtag('event', 'purchase', {
  transaction_id: 'T_12345',
  value: 99.99,
  currency: 'USD',
  items: [{ item_id: 'SKU_123', item_name: 'Product' }]
})
```

### 1.4 Analytics Best Practices

```typescript
// === CENTRALIZED ANALYTICS SERVICE ===
// lib/analytics.ts
import posthog from 'posthog-js'

type EventName =
  | 'signup_started'
  | 'signup_completed'
  | 'purchase_initiated'
  | 'purchase_completed'
  | 'feature_used'

interface EventProperties {
  [key: string]: string | number | boolean | undefined
}

export const analytics = {
  track: (event: EventName, properties?: EventProperties) => {
    // Posthog
    posthog.capture(event, properties)

    // GA4 (if needed)
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event, properties)
    }
  },

  identify: (userId: string, traits?: Record<string, any>) => {
    posthog.identify(userId, traits)
  },

  page: (name: string, properties?: EventProperties) => {
    posthog.capture('$pageview', { page_name: name, ...properties })
  },

  reset: () => {
    posthog.reset()
  }
}

// === USAGE ===
import { analytics } from '@/lib/analytics'

analytics.track('signup_completed', { plan: 'pro', source: 'landing' })
analytics.identify(user.id, { email: user.email })
```

---

## 2. Email Patterns (Resend)

### 2.1 Setup Resend

```typescript
// Installation: npm install resend @react-email/components
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// === SEND TRANSACTIONAL EMAIL ===
// app/api/send-email/route.ts
import { NextResponse } from 'next/server'
import { WelcomeEmail } from '@/emails/welcome'

export async function POST(request: Request) {
  const { email, name } = await request.json()

  try {
    const { data, error } = await resend.emails.send({
      from: 'MyApp <hello@myapp.com>',
      to: email,
      subject: 'Welcome to MyApp!',
      react: WelcomeEmail({ userName: name })
    })

    if (error) {
      return NextResponse.json({ error }, { status: 400 })
    }

    return NextResponse.json({ id: data?.id })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
```

### 2.2 React Email Templates

```tsx
// emails/welcome.tsx
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Img,
  Hr,
  Link,
  Preview
} from '@react-email/components'

interface WelcomeEmailProps {
  userName: string
  loginUrl?: string
}

export const WelcomeEmail = ({
  userName,
  loginUrl = 'https://myapp.com/login'
}: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>Welcome to MyApp - Get started in minutes</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img
          src="https://myapp.com/logo.png"
          width="120"
          height="40"
          alt="MyApp"
        />
        <Section style={section}>
          <Text style={heading}>Welcome, {userName}!</Text>
          <Text style={text}>
            Thanks for signing up. We're excited to have you on board.
          </Text>
          <Button style={button} href={loginUrl}>
            Get Started
          </Button>
        </Section>
        <Hr style={hr} />
        <Text style={footer}>
          MyApp Inc, 123 Street, City
          <br />
          <Link href="https://myapp.com/unsubscribe" style={link}>
            Unsubscribe
          </Link>
        </Text>
      </Container>
    </Body>
  </Html>
)

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '560px'
}

const section = { padding: '24px 0' }

const heading = {
  fontSize: '24px',
  fontWeight: '600',
  color: '#1a1a1a',
  margin: '0 0 16px'
}

const text = {
  fontSize: '16px',
  color: '#4a4a4a',
  lineHeight: '24px',
  margin: '0 0 24px'
}

const button = {
  backgroundColor: '#000000',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  padding: '12px 24px'
}

const hr = { borderColor: '#e6e6e6', margin: '24px 0' }

const footer = {
  fontSize: '12px',
  color: '#8c8c8c',
  textAlign: 'center' as const
}

const link = { color: '#8c8c8c', textDecoration: 'underline' }

export default WelcomeEmail
```

### 2.3 Common Email Templates

```tsx
// emails/password-reset.tsx
export const PasswordResetEmail = ({ resetUrl }: { resetUrl: string }) => (
  <Html>
    <Head />
    <Preview>Reset your password</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={heading}>Reset Your Password</Text>
        <Text style={text}>
          Click the button below to reset your password. This link expires in 1 hour.
        </Text>
        <Button style={button} href={resetUrl}>
          Reset Password
        </Button>
        <Text style={smallText}>
          If you didn't request this, you can safely ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
)

// emails/invoice.tsx
export const InvoiceEmail = ({
  invoiceNumber,
  amount,
  downloadUrl
}: {
  invoiceNumber: string
  amount: string
  downloadUrl: string
}) => (
  <Html>
    <Head />
    <Preview>Invoice #{invoiceNumber}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={heading}>Invoice #{invoiceNumber}</Text>
        <Section style={invoiceBox}>
          <Text>Amount: <strong>{amount}</strong></Text>
        </Section>
        <Button style={button} href={downloadUrl}>
          Download Invoice
        </Button>
      </Container>
    </Body>
  </Html>
)
```

### 2.4 Email Service Layer

```typescript
// lib/email.ts
import { Resend } from 'resend'
import { WelcomeEmail } from '@/emails/welcome'
import { PasswordResetEmail } from '@/emails/password-reset'
import { InvoiceEmail } from '@/emails/invoice'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = 'MyApp <hello@myapp.com>'

export const emailService = {
  async sendWelcome(to: string, userName: string) {
    return resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Welcome to MyApp!',
      react: WelcomeEmail({ userName })
    })
  },

  async sendPasswordReset(to: string, resetUrl: string) {
    return resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Reset your password',
      react: PasswordResetEmail({ resetUrl })
    })
  },

  async sendInvoice(to: string, invoice: { number: string; amount: string; url: string }) {
    return resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Invoice #${invoice.number}`,
      react: InvoiceEmail({
        invoiceNumber: invoice.number,
        amount: invoice.amount,
        downloadUrl: invoice.url
      })
    })
  }
}
```

---

## 3. SEO Patterns (Next.js 15)

### 3.1 Static Metadata

```typescript
// app/layout.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL('https://myapp.com'),
  title: {
    default: 'MyApp - Your Tagline Here',
    template: '%s | MyApp'
  },
  description: 'Comprehensive description of your app for search engines. Keep it under 160 characters.',
  keywords: ['saas', 'productivity', 'app', 'your-keywords'],
  authors: [{ name: 'Your Name', url: 'https://yoursite.com' }],
  creator: 'Your Company',
  publisher: 'Your Company',
  formatDetection: {
    email: false,
    address: false,
    telephone: false
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://myapp.com',
    siteName: 'MyApp',
    title: 'MyApp - Your Tagline Here',
    description: 'Your app description for social sharing',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'MyApp Preview'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MyApp - Your Tagline Here',
    description: 'Your app description for Twitter',
    creator: '@yourhandle',
    images: ['/twitter-image.png']
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code'
  }
}
```

### 3.2 Dynamic Metadata

```typescript
// app/products/[id]/page.tsx
import type { Metadata, ResolvingMetadata } from 'next'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params
  const product = await getProduct(id)

  // Optionally access parent metadata
  const previousImages = (await parent).openGraph?.images || []

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [product.image, ...previousImages],
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description,
      images: [product.image]
    }
  }
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params
  const product = await getProduct(id)
  return <ProductDetails product={product} />
}
```

### 3.3 JSON-LD Structured Data

```typescript
// components/structured-data.tsx
export function WebsiteStructuredData() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'MyApp',
    url: 'https://myapp.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://myapp.com/search?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

export function SoftwareApplicationStructuredData() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'MyApp',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '9.99',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock'
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '1250'
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

export function OrganizationStructuredData() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'MyApp Inc',
    url: 'https://myapp.com',
    logo: 'https://myapp.com/logo.png',
    sameAs: [
      'https://twitter.com/myapp',
      'https://linkedin.com/company/myapp',
      'https://github.com/myapp'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'support@myapp.com'
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

// Usage in layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <WebsiteStructuredData />
        <OrganizationStructuredData />
        {children}
      </body>
    </html>
  )
}
```

### 3.4 Sitemap

```typescript
// app/sitemap.ts
import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://myapp.com'

  // Static pages
  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1 },
    { url: `${baseUrl}/pricing`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: `${baseUrl}/features`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.7 },
  ]

  // Dynamic pages (e.g., blog posts)
  const posts = await getBlogPosts()
  const blogPages = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.6
  }))

  // Dynamic pages (e.g., products)
  const products = await getProducts()
  const productPages = products.map((product) => ({
    url: `${baseUrl}/products/${product.id}`,
    lastModified: new Date(product.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.7
  }))

  return [...staticPages, ...blogPages, ...productPages]
}
```

### 3.5 Robots.txt

```typescript
// app/robots.ts
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://myapp.com'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/private/', '/_next/']
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/admin/']
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`
  }
}
```

---

## 4. Monitoring Patterns (Sentry)

### 4.1 Sentry Setup (Next.js)

```bash
# Installation
npx @sentry/wizard@latest -i nextjs
```

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Session Replay
  replaysSessionSampleRate: 0.1, // 10% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% on error

  // Environment
  environment: process.env.NODE_ENV,

  // Release tracking
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,

  // Filter out noise
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured'
  ],

  // Add user context on every event
  beforeSend(event) {
    // Don't send events in development
    if (process.env.NODE_ENV === 'development') {
      return null
    }
    return event
  },

  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true
    })
  ]
})
```

```typescript
// sentry.server.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  environment: process.env.NODE_ENV
})
```

### 4.2 Error Boundary Component

```tsx
// components/error-boundary.tsx
'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

interface ErrorBoundaryProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    // Log error to Sentry
    Sentry.captureException(error, {
      tags: { location: 'error-boundary' }
    })
  }, [error])

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
      <h2 className="text-xl font-semibold">Something went wrong!</h2>
      <p className="text-muted-foreground">
        We've been notified and are working on a fix.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  )
}

// app/error.tsx (Next.js error page)
export { default } from '@/components/error-boundary'
```

### 4.3 Manual Error Capture

```typescript
// lib/sentry.ts
import * as Sentry from '@sentry/nextjs'

// Capture exception with context
export function captureError(
  error: Error,
  context?: {
    tags?: Record<string, string>
    extra?: Record<string, any>
    user?: { id: string; email?: string }
  }
) {
  Sentry.captureException(error, {
    tags: context?.tags,
    extra: context?.extra,
    user: context?.user
  })
}

// Capture message (non-error)
export function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info'
) {
  Sentry.captureMessage(message, level)
}

// Set user context
export function setUser(user: { id: string; email?: string; name?: string } | null) {
  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.name
    })
  } else {
    Sentry.setUser(null)
  }
}

// Add breadcrumb
export function addBreadcrumb(
  message: string,
  category: string,
  data?: Record<string, any>
) {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: 'info'
  })
}
```

### 4.4 API Route Error Handling

```typescript
// app/api/example/route.ts
import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'

export async function POST(request: Request) {
  const transaction = Sentry.startSpan({
    name: 'API: /api/example',
    op: 'http.server'
  }, () => {})

  try {
    const body = await request.json()

    // Add breadcrumb
    Sentry.addBreadcrumb({
      message: 'Processing request',
      category: 'api',
      data: { endpoint: '/api/example' }
    })

    const result = await processData(body)

    return NextResponse.json(result)
  } catch (error) {
    // Capture with context
    Sentry.captureException(error, {
      tags: { endpoint: '/api/example' },
      extra: { requestBody: 'sanitized' }
    })

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### 4.5 Performance Monitoring

```typescript
// lib/performance.ts
import * as Sentry from '@sentry/nextjs'

// Measure custom operation
export async function measureOperation<T>(
  name: string,
  operation: () => Promise<T>
): Promise<T> {
  return Sentry.startSpan(
    { name, op: 'function' },
    async () => {
      return await operation()
    }
  )
}

// Usage
const result = await measureOperation('fetchUserData', async () => {
  return await db.user.findUnique({ where: { id } })
})
```

---

## 5. Launch Checklist

### 5.1 Analytics Checklist

```markdown
## Analytics

### Setup
- [ ] Analytics provider initialized (Posthog/Mixpanel)
- [ ] Environment variables configured
- [ ] Privacy-compliant (GDPR banner if needed)

### Events
- [ ] Signup events tracked
- [ ] Login events tracked
- [ ] Purchase/conversion events tracked
- [ ] Key feature usage tracked
- [ ] Error events tracked

### User Identification
- [ ] Users identified after login
- [ ] User properties set (plan, created_at, etc.)
- [ ] Reset on logout

### Analysis
- [ ] Conversion funnels defined
- [ ] Retention cohorts configured
- [ ] Key metrics dashboard created
```

### 5.2 Email Checklist

```markdown
## Email

### Setup
- [ ] Resend account created
- [ ] Domain verified (DNS records)
- [ ] API key secured in env vars
- [ ] From email configured

### Templates
- [ ] Welcome email template
- [ ] Password reset email template
- [ ] Email verification template
- [ ] Invoice/receipt template
- [ ] Notification templates

### Testing
- [ ] Emails render correctly
- [ ] Links work properly
- [ ] Unsubscribe works
- [ ] Spam score checked
```

### 5.3 SEO Checklist

```markdown
## SEO

### Technical
- [ ] Metadata on all pages
- [ ] Dynamic metadata for dynamic pages
- [ ] Open Graph images (1200x630)
- [ ] Twitter card images
- [ ] Sitemap.xml generated
- [ ] Robots.txt configured
- [ ] Canonical URLs set

### Structured Data
- [ ] Organization schema
- [ ] Website schema
- [ ] Product/Service schema (if applicable)
- [ ] FAQ schema (if applicable)
- [ ] Breadcrumb schema

### Performance
- [ ] Core Web Vitals passing
- [ ] Images optimized (next/image)
- [ ] Fonts optimized
- [ ] No render-blocking resources
```

### 5.4 Monitoring Checklist

```markdown
## Monitoring

### Setup
- [ ] Sentry integrated
- [ ] Environment configured
- [ ] Release tracking enabled
- [ ] Source maps uploaded

### Error Handling
- [ ] Error boundaries in place
- [ ] API error handling
- [ ] User context set
- [ ] Breadcrumbs added

### Alerts
- [ ] Error rate alerts configured
- [ ] Performance alerts configured
- [ ] Team notifications set up

### Performance
- [ ] Transaction tracing enabled
- [ ] Key operations measured
- [ ] Performance baselines set
```

### 5.5 Pre-Launch Final Checklist

```markdown
## Pre-Launch

### Security
- [ ] SSL certificate active
- [ ] Environment variables secured
- [ ] API keys rotated
- [ ] CORS configured
- [ ] Rate limiting enabled
- [ ] Input validation in place

### Data
- [ ] Database backups configured
- [ ] Data retention policy set
- [ ] GDPR/privacy compliance

### Infrastructure
- [ ] CDN configured
- [ ] Caching strategy implemented
- [ ] Auto-scaling configured (if needed)
- [ ] Health checks in place

### Legal
- [ ] Privacy policy
- [ ] Terms of service
- [ ] Cookie consent (if needed)
```

---

## Quick Reference

### Package Installation

```bash
# Analytics
npm install posthog-js
# or
npm install mixpanel-browser

# Email
npm install resend @react-email/components

# Monitoring
npx @sentry/wizard@latest -i nextjs
```

### Environment Variables

```env
# Analytics
NEXT_PUBLIC_POSTHOG_KEY=phc_xxx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Email
RESEND_API_KEY=re_xxx

# Monitoring
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
SENTRY_DSN=https://xxx@sentry.io/xxx
SENTRY_AUTH_TOKEN=xxx
```

---

*v28.4 "PRODUCT BUILDER" | Analytics + Email + SEO + Monitoring | CMP 9.2*
