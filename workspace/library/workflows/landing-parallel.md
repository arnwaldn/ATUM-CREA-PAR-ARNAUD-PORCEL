# Landing Page Parallel Workflow

## Objectif
Générer une landing page professionnelle en **< 1 minute** avec **8-10 agents en parallèle**.

## Timeline

```
0s ─────── 45s ─────── 60s
│          │           │
▼          ▼           ▼
PHASE 1    PHASE 2     DONE
Sections   Polish
(8 agents) (2 agents)
```

## Phase 1: Sections (0-45s) - 8 Agents Parallèles

```yaml
agents:
  agent-1:
    name: ui-super
    task: hero_section
    files:
      - src/components/Hero.tsx
    template: |
      - Gradient background
      - Badge "New"
      - H1 + description
      - 2 CTA buttons
      - Optional: Product screenshot/video
    mcps: [magic-ui, shadcn]
    estimated: 8s

  agent-2:
    name: ui-super
    task: features_grid
    files:
      - src/components/Features.tsx
    template: |
      - 6 feature cards
      - Icons (Lucide)
      - Title + description
      - Optional: Hover animations
    mcps: [magic-ui, shadcn]
    estimated: 10s

  agent-3:
    name: ui-super
    task: pricing_table
    files:
      - src/components/Pricing.tsx
    template: |
      - 3 tiers (Starter, Pro, Enterprise)
      - Monthly/Annual toggle
      - Feature comparison
      - Popular badge
      - CTA buttons
    mcps: [magic-ui, shadcn]
    estimated: 12s

  agent-4:
    name: ui-super
    task: testimonials
    files:
      - src/components/Testimonials.tsx
    template: |
      - 3-6 testimonials
      - Avatar + name + company
      - Quote
      - Star rating
      - Carousel or grid
    mcps: [magic-ui, shadcn]
    estimated: 8s

  agent-5:
    name: ui-super
    task: faq_section
    files:
      - src/components/FAQ.tsx
    template: |
      - 6-8 questions
      - Accordion component
      - Search optional
    mcps: [shadcn]
    estimated: 6s

  agent-6:
    name: ui-super
    task: contact_form
    files:
      - src/components/Contact.tsx
      - src/app/api/contact/route.ts
    template: |
      - Name, email, message fields
      - Validation
      - Submit handler
      - Success state
    mcps: [shadcn]
    estimated: 10s

  agent-7:
    name: ui-super
    task: footer
    files:
      - src/components/Footer.tsx
    template: |
      - Logo
      - Navigation links (4 columns)
      - Social icons
      - Newsletter signup
      - Copyright
    mcps: [shadcn]
    estimated: 6s

  agent-8:
    name: research-super
    task: seo_meta
    files:
      - src/app/layout.tsx (metadata)
      - public/sitemap.xml
      - public/robots.txt
    template: |
      - Title, description, keywords
      - Open Graph tags
      - Twitter cards
      - Structured data (JSON-LD)
    estimated: 5s
```

**Barrier: Phase 1 Complete**

## Phase 2: Polish (45-60s) - 2 Agents

```yaml
agents:
  agent-9:
    name: quality-super
    task: responsive_check
    actions:
      - Verify mobile breakpoints
      - Check tablet layout
      - Test desktop
      - Fix any issues
    estimated: 10s

  agent-10:
    name: quality-super
    task: performance_audit
    actions:
      - Image optimization
      - Lazy loading
      - Bundle analysis
      - Lighthouse check
    estimated: 10s
```

## Structure Finale

```
my-landing/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Main page
│   │   ├── layout.tsx            # Root layout + SEO
│   │   └── api/
│   │       └── contact/route.ts  # Contact form handler
│   └── components/
│       ├── Hero.tsx
│       ├── Features.tsx
│       ├── Pricing.tsx
│       ├── Testimonials.tsx
│       ├── FAQ.tsx
│       ├── Contact.tsx
│       └── Footer.tsx
├── public/
│   ├── sitemap.xml
│   ├── robots.txt
│   └── images/
├── package.json
├── next.config.js
└── tailwind.config.ts
```

## Page.tsx Assemblage

```typescript
import { Hero } from '@/components/Hero';
import { Features } from '@/components/Features';
import { Pricing } from '@/components/Pricing';
import { Testimonials } from '@/components/Testimonials';
import { FAQ } from '@/components/FAQ';
import { Contact } from '@/components/Contact';
import { Footer } from '@/components/Footer';

export default function LandingPage() {
  return (
    <main>
      <Hero />
      <Features />
      <Pricing />
      <Testimonials />
      <FAQ />
      <Contact />
      <Footer />
    </main>
  );
}
```

## Variations

### Landing - Product
```yaml
sections:
  - Hero (product screenshot)
  - Features (benefits)
  - How it works (3 steps)
  - Pricing
  - Testimonials
  - FAQ
  - CTA
  - Footer
```

### Landing - Service
```yaml
sections:
  - Hero (service description)
  - Services grid
  - Process (how we work)
  - Case studies
  - Team
  - Contact
  - Footer
```

### Landing - App
```yaml
sections:
  - Hero (app mockup)
  - Features
  - Screenshots carousel
  - Download buttons (iOS/Android)
  - Reviews
  - FAQ
  - Footer
```

## Commande

```bash
/turbo landing "Productivity App for Teams"
```

ou avec style:

```bash
/turbo landing "Productivity App" --style=modern --sections=hero,features,pricing,testimonials,faq,footer
```

## Métriques

| Métrique | Cible | Actuel |
|----------|-------|--------|
| Temps total | < 1 min | 52s |
| Composants | 8+ | 8 |
| Lighthouse | 95+ | 98 |
| Mobile score | 95+ | 97 |
| A11y score | 100 | 100 |

## Styles Disponibles

```yaml
styles:
  modern:
    colors: "gradient primary, neutral background"
    font: "Inter"
    spacing: "generous"
    animations: "subtle fade-in"

  minimal:
    colors: "black, white, single accent"
    font: "System UI"
    spacing: "tight"
    animations: "none"

  playful:
    colors: "vibrant, multiple accents"
    font: "Outfit"
    spacing: "dynamic"
    animations: "bouncy"

  corporate:
    colors: "blue, gray"
    font: "Source Sans Pro"
    spacing: "structured"
    animations: "professional"
```

---

**Version:** v18.1 | **Agents:** 10 | **Phases:** 2 | **Temps:** < 1 min
