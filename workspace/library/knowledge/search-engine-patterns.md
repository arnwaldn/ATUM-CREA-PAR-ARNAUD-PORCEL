# Search Engine Patterns - Meilisearch

> **Version**: v1.0 | ATUM CREA
> **Package**: `meilisearch` + `@meilisearch/instant-meilisearch`
> **Performance**: < 50ms, typo-tolerant, recherche hybride

---

## Pourquoi Meilisearch

| Critere | Meilisearch | Algolia | Typesense |
|---------|------------|---------|-----------|
| **Licence** | MIT (open source) | SaaS proprietaire | GPLv3 |
| **Vitesse** | < 50ms | < 50ms | < 50ms |
| **Typo-tolerance** | Oui | Oui | Oui |
| **Recherche hybride** | Mot-cle + semantique | Oui (NeuralSearch) | Oui |
| **Self-hosted** | Oui | Non | Oui |
| **Prix** | Gratuit (self-hosted) | $$$$ | Gratuit (self-hosted) |
| **Runtime** | Rust | N/A | C++ |

---

## Installation

```bash
# Client JS
pnpm add meilisearch

# Integration React (InstantSearch)
pnpm add @meilisearch/instant-meilisearch react-instantsearch

# Docker (serveur)
docker run -d -p 7700:7700 -v meili_data:/meili_data getmeili/meilisearch:latest
```

---

## Configuration serveur

```typescript
// lib/search/client.ts
import { MeiliSearch } from 'meilisearch';

// Client admin (serveur uniquement, avec master key)
export const meiliAdmin = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST || 'http://localhost:7700',
  apiKey: process.env.MEILISEARCH_ADMIN_KEY,
});

// Client public (navigateur, avec search key)
export const meiliSearch = new MeiliSearch({
  host: process.env.NEXT_PUBLIC_MEILISEARCH_HOST || 'http://localhost:7700',
  apiKey: process.env.NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY,
});
```

### Initialisation des index

```typescript
// lib/search/setup.ts
import { meiliAdmin } from './client';

export async function setupSearchIndexes() {
  // Index produits
  const products = meiliAdmin.index('products');

  await products.updateSettings({
    searchableAttributes: ['name', 'description', 'category', 'tags'],
    filterableAttributes: ['category', 'price', 'inStock', 'rating'],
    sortableAttributes: ['price', 'createdAt', 'rating'],
    rankingRules: [
      'words',
      'typo',
      'proximity',
      'attribute',
      'sort',
      'exactness',
    ],
    typoTolerance: {
      minWordSizeForTypos: { oneTypo: 4, twoTypos: 8 },
    },
    pagination: { maxTotalHits: 1000 },
    faceting: { maxValuesPerFacet: 100 },
  });

  // Index articles
  const articles = meiliAdmin.index('articles');

  await articles.updateSettings({
    searchableAttributes: ['title', 'content', 'author', 'tags'],
    filterableAttributes: ['category', 'publishedAt', 'status'],
    sortableAttributes: ['publishedAt', 'title'],
  });
}
```

---

## Sync avec la base de donnees

### Via webhook (recommande)

```typescript
// app/api/webhooks/search-sync/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { meiliAdmin } from '@/lib/search/client';

export async function POST(request: NextRequest) {
  const { type, table, record, old_record } = await request.json();
  const index = meiliAdmin.index(table);

  switch (type) {
    case 'INSERT':
    case 'UPDATE':
      await index.addDocuments([record], { primaryKey: 'id' });
      break;
    case 'DELETE':
      if (old_record?.id) {
        await index.deleteDocument(old_record.id);
      }
      break;
  }

  return NextResponse.json({ ok: true });
}
```

### Sync initiale (bulk)

```typescript
// scripts/sync-search.ts
import { meiliAdmin } from '@/lib/search/client';
import { db } from '@/lib/db';

async function syncProducts() {
  const products = await db.product.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      category: true,
      price: true,
      inStock: true,
      rating: true,
      tags: true,
      createdAt: true,
    },
  });

  const index = meiliAdmin.index('products');

  // Batch de 1000 documents
  for (let i = 0; i < products.length; i += 1000) {
    const batch = products.slice(i, i + 1000);
    await index.addDocuments(batch, { primaryKey: 'id' });
  }

  console.log(`Synced ${products.length} products`);
}

syncProducts();
```

---

## Composant React (InstantSearch)

```typescript
// components/search/search-interface.tsx
'use client';

import { instantMeiliSearch } from '@meilisearch/instant-meilisearch';
import {
  InstantSearch,
  SearchBox,
  Hits,
  RefinementList,
  Pagination,
  Stats,
  SortBy,
  ClearRefinements,
  Highlight,
} from 'react-instantsearch';

const { searchClient } = instantMeiliSearch(
  process.env.NEXT_PUBLIC_MEILISEARCH_HOST!,
  process.env.NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY!
);

type ProductHit = {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  rating: number;
};

function ProductCard({ hit }: { hit: ProductHit }) {
  return (
    <div className="rounded-lg border p-4">
      <h3 className="font-semibold">
        <Highlight attribute="name" hit={hit} />
      </h3>
      <p className="text-sm text-gray-600">
        <Highlight attribute="description" hit={hit} />
      </p>
      <div className="mt-2 flex justify-between">
        <span className="font-bold">{hit.price} EUR</span>
        <span className="text-yellow-500">{'*'.repeat(Math.round(hit.rating))}</span>
      </div>
    </div>
  );
}

export function SearchInterface() {
  return (
    <InstantSearch indexName="products" searchClient={searchClient}>
      <div className="flex gap-8">
        {/* Filtres */}
        <aside className="w-64 shrink-0">
          <ClearRefinements />
          <h3 className="mb-2 font-semibold">Categorie</h3>
          <RefinementList attribute="category" />
        </aside>

        {/* Resultats */}
        <main className="flex-1">
          <SearchBox
            placeholder="Rechercher..."
            classNames={{
              input: 'w-full rounded-lg border p-3',
            }}
          />
          <div className="my-4 flex items-center justify-between">
            <Stats />
            <SortBy
              items={[
                { value: 'products', label: 'Pertinence' },
                { value: 'products:price:asc', label: 'Prix croissant' },
                { value: 'products:price:desc', label: 'Prix decroissant' },
                { value: 'products:rating:desc', label: 'Meilleures notes' },
              ]}
            />
          </div>
          <Hits hitComponent={ProductCard} />
          <Pagination className="mt-6" />
        </main>
      </div>
    </InstantSearch>
  );
}
```

---

## Server-side Search (API Route)

```typescript
// app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { meiliSearch } from '@/lib/search/client';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q') || '';
  const category = request.nextUrl.searchParams.get('category');
  const page = parseInt(request.nextUrl.searchParams.get('page') || '1');

  const filters: string[] = [];
  if (category) filters.push(`category = "${category}"`);
  filters.push('inStock = true');

  const results = await meiliSearch.index('products').search(query, {
    filter: filters.join(' AND '),
    limit: 20,
    offset: (page - 1) * 20,
    attributesToHighlight: ['name', 'description'],
  });

  return NextResponse.json(results);
}
```

---

## Checklist

- [ ] Meilisearch deploye (Docker ou Meilisearch Cloud)
- [ ] Index crees avec settings (searchable, filterable, sortable)
- [ ] Sync initiale depuis la DB
- [ ] Webhook ou cron pour sync incrementale
- [ ] Client admin (serveur) et client search (navigateur) separes
- [ ] Composant InstantSearch avec filtres et pagination
- [ ] API Route pour le search server-side (SEO)
- [ ] Monitoring des performances de recherche

---

*Knowledge ATUM CREA | Sources: Meilisearch docs, @meilisearch/instant-meilisearch*
