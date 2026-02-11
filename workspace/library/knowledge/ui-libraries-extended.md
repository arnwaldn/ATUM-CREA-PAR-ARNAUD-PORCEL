# UI Libraries Extended - Guide Complet

> Guide de référence pour les bibliothèques UI TailwindCSS étendues: Flowbite, DaisyUI, et leur intégration avec shadcn/ui.

## Vue d'Ensemble

| Library | Components | Approach | Best For |
|---------|------------|----------|----------|
| **shadcn/ui** | 50+ | Copy-paste, Radix primitives | Custom design systems |
| **Flowbite** | 450+ | Plugin Tailwind + React | Enterprise dashboards |
| **DaisyUI** | 65+ | CSS classes sémantiques | Rapid prototyping |
| **Tailwind UI** | 500+ | Official Tailwind, paid | Production-ready premium |

---

## Flowbite

### Installation
```bash
# React
npm install flowbite flowbite-react

# Configuration Tailwind
npx flowbite-react@latest init
```

### Configuration Tailwind
```javascript
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}',
    './node_modules/flowbite/**/*.js'
  ],
  plugins: [require('flowbite/plugin')]
}
```

### Composants Clés

#### Sidebar Navigation
```tsx
import { Sidebar } from 'flowbite-react';
import { HiChartPie, HiInbox, HiUser } from 'react-icons/hi';

<Sidebar aria-label="Navigation">
  <Sidebar.Items>
    <Sidebar.ItemGroup>
      <Sidebar.Item href="/dashboard" icon={HiChartPie}>
        Dashboard
      </Sidebar.Item>
      <Sidebar.Collapse icon={HiUser} label="Users">
        <Sidebar.Item href="/users/list">List</Sidebar.Item>
        <Sidebar.Item href="/users/add">Add User</Sidebar.Item>
      </Sidebar.Collapse>
    </Sidebar.ItemGroup>
  </Sidebar.Items>
</Sidebar>
```

#### Data Table avec Pagination
```tsx
import { Table, Pagination } from 'flowbite-react';

<Table striped hoverable>
  <Table.Head>
    <Table.HeadCell>Name</Table.HeadCell>
    <Table.HeadCell>Email</Table.HeadCell>
    <Table.HeadCell>Actions</Table.HeadCell>
  </Table.Head>
  <Table.Body>
    {data.map(row => (
      <Table.Row key={row.id}>
        <Table.Cell>{row.name}</Table.Cell>
        <Table.Cell>{row.email}</Table.Cell>
        <Table.Cell>
          <Button size="xs">Edit</Button>
        </Table.Cell>
      </Table.Row>
    ))}
  </Table.Body>
</Table>
<Pagination
  currentPage={page}
  totalPages={totalPages}
  onPageChange={setPage}
/>
```

#### Charts (ApexCharts)
```tsx
import { Chart } from 'flowbite-react';

<Chart
  type="area"
  height={300}
  series={[{ name: 'Revenue', data: [31, 40, 28, 51, 42, 109, 100] }]}
  options={{
    chart: { toolbar: { show: false } },
    xaxis: { categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
    colors: ['#1C64F2'],
    fill: { type: 'gradient', gradient: { opacityFrom: 0.55, opacityTo: 0 } }
  }}
/>
```

### Patterns Dashboard
- Layout: Sidebar + Topbar + Main content
- Cards: Stats, KPIs, summaries
- Tables: CRUD avec sorting/filtering
- Charts: Line, bar, pie, area
- Forms: Multi-step, validation

---

## DaisyUI

### Installation
```bash
npm install daisyui@latest
```

### Configuration Tailwind
```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  plugins: [require('daisyui')],
  daisyui: {
    themes: ['light', 'dark', 'cupcake', 'cyberpunk', 'valentine'],
    darkTheme: 'dark',
    base: true,
    styled: true,
    utils: true,
  }
}
```

### Système de Thèmes

#### Liste des 29 Thèmes
```
light, dark, cupcake, bumblebee, emerald, corporate,
synthwave, retro, cyberpunk, valentine, halloween,
garden, forest, aqua, lofi, pastel, fantasy,
wireframe, black, luxury, dracula, cmyk, autumn,
business, acid, lemonade, night, coffee, winter
```

#### Theme Switcher
```tsx
const themes = ['light', 'dark', 'cupcake', 'cyberpunk'];

function ThemeSwitcher() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <select
      className="select select-bordered select-sm"
      value={theme}
      onChange={(e) => setTheme(e.target.value)}
    >
      {themes.map(t => <option key={t} value={t}>{t}</option>)}
    </select>
  );
}
```

#### Custom Theme
```javascript
// tailwind.config.js
daisyui: {
  themes: [
    {
      brand: {
        "primary": "#6366f1",
        "secondary": "#ec4899",
        "accent": "#14b8a6",
        "neutral": "#1f2937",
        "base-100": "#ffffff",
        "info": "#3b82f6",
        "success": "#22c55e",
        "warning": "#f59e0b",
        "error": "#ef4444",
      },
    },
  ],
}
```

### Composants Essentiels

#### Navigation
```html
<!-- Navbar -->
<div class="navbar bg-base-100 shadow-lg">
  <div class="flex-1">
    <a class="btn btn-ghost text-xl">MyApp</a>
  </div>
  <div class="flex-none gap-2">
    <div class="dropdown dropdown-end">
      <label tabindex="0" class="btn btn-ghost btn-circle avatar">
        <div class="w-10 rounded-full">
          <img src="/avatar.jpg" />
        </div>
      </label>
      <ul class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
        <li><a>Profile</a></li>
        <li><a>Settings</a></li>
        <li><a>Logout</a></li>
      </ul>
    </div>
  </div>
</div>
```

#### Cards
```html
<div class="card bg-base-100 shadow-xl">
  <figure><img src="/image.jpg" alt="Product" /></figure>
  <div class="card-body">
    <h2 class="card-title">
      Product Name
      <div class="badge badge-secondary">NEW</div>
    </h2>
    <p>Description of the product</p>
    <div class="card-actions justify-end">
      <div class="badge badge-outline">Fashion</div>
      <div class="badge badge-outline">Products</div>
    </div>
  </div>
</div>
```

#### Hero Section
```html
<div class="hero min-h-screen bg-base-200">
  <div class="hero-content flex-col lg:flex-row-reverse">
    <img src="/hero.jpg" class="max-w-sm rounded-lg shadow-2xl" />
    <div>
      <h1 class="text-5xl font-bold">Box Office News!</h1>
      <p class="py-6">Provident cupiditate voluptatem et in.</p>
      <button class="btn btn-primary">Get Started</button>
    </div>
  </div>
</div>
```

---

## Tailwind UI (Plus)

> **Bibliothèque officielle payante** créée par les créateurs de Tailwind CSS.
> 500+ composants professionnels, production-ready.

### Catégories de Composants

| Catégorie | Composants | Description |
|-----------|------------|-------------|
| **Marketing** | 150+ | Landing pages, hero sections, features, pricing, testimonials |
| **Application UI** | 250+ | Dashboards, forms, tables, navigation, modals, notifications |
| **Ecommerce** | 100+ | Product pages, carts, checkouts, storefronts, filters |

### Caractéristiques

| Feature | Description |
|---------|-------------|
| **React/Vue/HTML** | Tous les composants en 3 formats |
| **Responsive** | Mobile-first, toutes tailles d'écran |
| **Dark Mode** | Support natif dark mode |
| **Accessibility** | WCAG 2.1 AA compliant |
| **Figma Kit** | Templates Figma inclus |
| **Lifetime Access** | Achat unique, mises à jour à vie |

### Exemples de Composants Premium

#### Hero Section (Marketing)
```tsx
// Pattern: Hero with app screenshot
<div className="relative isolate overflow-hidden bg-gradient-to-b from-indigo-100/20">
  <div className="mx-auto max-w-7xl pb-24 pt-10 sm:pb-32 lg:grid lg:grid-cols-2 lg:gap-x-8 lg:px-8 lg:py-40">
    <div className="px-6 lg:px-0 lg:pt-4">
      <div className="mx-auto max-w-2xl">
        <h1 className="mt-10 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          Deploy to the cloud with confidence
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600">
          Anim aute id magna aliqua ad ad non deserunt sunt.
        </p>
        <div className="mt-10 flex items-center gap-x-6">
          <a href="#" className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
            Get started
          </a>
          <a href="#" className="text-sm font-semibold leading-6 text-gray-900">
            Learn more <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </div>
    <div className="mt-20 sm:mt-24 md:mx-auto md:max-w-2xl lg:mx-0 lg:mt-0 lg:w-screen">
      <img src="/screenshot.png" alt="App screenshot" className="w-[57rem] max-w-none rounded-md bg-white/5 shadow-2xl ring-1 ring-white/10" />
    </div>
  </div>
</div>
```

#### Stacked List (Application UI)
```tsx
// Pattern: Stacked list with actions
<ul role="list" className="divide-y divide-gray-100">
  {people.map((person) => (
    <li key={person.email} className="flex justify-between gap-x-6 py-5">
      <div className="flex min-w-0 gap-x-4">
        <img className="h-12 w-12 flex-none rounded-full bg-gray-50" src={person.imageUrl} alt="" />
        <div className="min-w-0 flex-auto">
          <p className="text-sm font-semibold leading-6 text-gray-900">{person.name}</p>
          <p className="mt-1 truncate text-xs leading-5 text-gray-500">{person.email}</p>
        </div>
      </div>
      <div className="hidden shrink-0 sm:flex sm:flex-col sm:items-end">
        <p className="text-sm leading-6 text-gray-900">{person.role}</p>
        <p className="mt-1 text-xs leading-5 text-gray-500">
          Last seen <time dateTime={person.lastSeenDateTime}>{person.lastSeen}</time>
        </p>
      </div>
    </li>
  ))}
</ul>
```

#### Product Card (Ecommerce)
```tsx
// Pattern: Product card with quick actions
<div className="group relative">
  <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg bg-gray-200">
    <img
      src={product.imageSrc}
      alt={product.imageAlt}
      className="h-full w-full object-cover object-center group-hover:opacity-75"
    />
    <div className="absolute inset-x-0 bottom-0 flex items-end p-4 opacity-0 group-hover:opacity-100">
      <button className="w-full rounded-md bg-white/75 px-4 py-2 text-sm font-medium text-gray-900 backdrop-blur-sm hover:bg-white">
        Quick view
      </button>
    </div>
  </div>
  <div className="mt-4 flex items-center justify-between text-base font-medium text-gray-900">
    <h3>{product.name}</h3>
    <p>{product.price}</p>
  </div>
  <p className="mt-1 text-sm text-gray-500">{product.color}</p>
</div>
```

### Page Templates Complets

| Template | Pages | Usage |
|----------|-------|-------|
| **SaaS Landing** | 5 | Homepage, pricing, features, about, contact |
| **E-commerce Store** | 8 | Home, product list, product detail, cart, checkout |
| **Admin Dashboard** | 10 | Overview, users, analytics, settings, notifications |
| **Blog/CMS** | 4 | Home, article list, article, author page |
| **Portfolio** | 3 | Home, projects, project detail |

### Pricing

| Plan | Prix | Contenu |
|------|------|---------|
| **All-Access** | $299 one-time | 500+ components, templates, Figma, lifetime updates |
| **Marketing** | $149 | Marketing components only |
| **Application UI** | $149 | Application UI components only |
| **Ecommerce** | $149 | Ecommerce components only |

### Intégration ULTRA-CREATE

```javascript
// Tailwind UI est copy-paste ready
// Pattern recommandé:
1. Copier le composant depuis tailwindui.com
2. Adapter les couleurs au design system
3. Remplacer les données statiques par props
4. Ajouter les types TypeScript si besoin
```

### Quand utiliser Tailwind UI?

| Situation | Recommandation |
|-----------|----------------|
| Projet client premium | ✅ Excellent |
| MVP rapide | ✅ Excellent |
| Design system existant | ⚠️ Adapter les styles |
| Budget limité | ❌ Utiliser Flowbite/shadcn |
| Open source | ❌ Licence non compatible |

---

## Comparaison: Quand Utiliser Quoi?

### Utiliser shadcn/ui quand:
- Design system 100% custom requis
- Besoin de composants headless (Radix)
- Projet long-terme avec évolution du design
- Équipe design dédiée
- Maximum de contrôle sur chaque composant

### Utiliser Flowbite quand:
- Dashboard admin/enterprise rapidement
- Besoin de data tables complexes
- Charts et visualisations requises
- Projet corporate/business
- Design standard acceptable

### Utiliser DaisyUI quand:
- Prototypage très rapide
- Multiple thèmes requis
- Projet personnel/side project
- Zero JavaScript acceptable
- Landing pages marketing

### Utiliser Tailwind UI quand:
- Budget pour composants premium
- Qualité production immédiate requise
- Projet client/commercial
- Besoin de templates Figma
- Équipe veut patterns officiels Tailwind

### Combinaisons Recommandées

#### Option 1: shadcn/ui + DaisyUI themes
```javascript
// Utiliser les couleurs DaisyUI avec shadcn
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: 'hsl(var(--p))',
        secondary: 'hsl(var(--s))',
        accent: 'hsl(var(--a))',
      }
    }
  }
}
```

#### Option 2: Flowbite data + shadcn/ui forms
```tsx
// Tables Flowbite pour data display
<Table striped>...</Table>

// Forms shadcn pour inputs (plus accessibles)
<Form><Input /><Select /></Form>
```

---

## Intégration avec TailwindCSS 4

### Nouveautés Tailwind 4
- CSS-first configuration
- Lightning CSS (10x faster)
- Container queries
- 3D transforms
- @starting-style support

### Configuration Unifiée
```css
/* app.css */
@import "tailwindcss";
@plugin "flowbite/plugin";
@plugin "daisyui";

@theme {
  --color-primary: #6366f1;
  --font-display: "Inter", sans-serif;
}
```

---

## Bonnes Pratiques

### Performance
1. **Tree-shaking** - Importer uniquement les composants utilisés
2. **Lazy loading** - Dynamic imports pour composants lourds
3. **CSS purging** - Content array précis dans config

### Accessibilité
1. **ARIA labels** - Flowbite les inclut automatiquement
2. **Focus management** - Tester navigation clavier
3. **Color contrast** - Vérifier ratios avec les thèmes

### Maintenance
1. **Versions lockées** - package-lock.json committé
2. **Upgrade progressif** - Tester chaque mise à jour
3. **Documentation** - Commenter les customizations

---

## Ressources

### Flowbite
- Docs: https://flowbite.com/docs/
- React: https://flowbite-react.com/
- Blocks: https://flowbite.com/blocks/

### DaisyUI
- Docs: https://daisyui.com/
- Themes: https://daisyui.com/docs/themes/
- Components: https://daisyui.com/components/

### Tailwind
- Docs: https://tailwindcss.com/docs
- Play: https://play.tailwindcss.com/

### Tailwind UI (Official Premium)
- Store: https://tailwindui.com/
- Components: https://tailwindui.com/components
- Templates: https://tailwindui.com/templates
- Preview: https://tailwindui.com/preview (500+ composants)

---

*Dernière mise à jour: Janvier 2026 | ULTRA-CREATE v27.1 - Enrichi avec Tailwind UI Plus*
