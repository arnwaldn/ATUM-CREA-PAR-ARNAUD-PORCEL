# Headless CMS Patterns

> **Version**: v1.0 | ATUM CREA
> **Recommandation**: Payload CMS (Next.js-natif) > Sanity > Strapi
> **Stack**: Next.js 15 + TypeScript

---

## Comparatif

| Critere | Payload CMS | Sanity | Strapi |
|---------|------------|--------|--------|
| **Runtime** | Next.js (meme process) | SaaS + Studio | Node.js separe |
| **Schemas** | TypeScript code-first | GROQ + Studio | JSON/Admin UI |
| **Hebergement** | Meme serveur que l'app | Cloud Sanity | Self-hosted |
| **Admin UI** | Generee automatiquement | Sanity Studio | Admin Panel |
| **Requetes** | Local (meme process) | API GROQ | REST/GraphQL |
| **Prix** | Open source (MIT) | Freemium | Open source |
| **DX TypeScript** | Natif, schemas = types | Moyen | Moyen |

> **Decision ATUM CREA** : Payload CMS si Next.js (meme runtime). Sanity si contenu editorial complexe. Strapi si equipe habituee.

---

## Payload CMS (Recommande)

### Installation dans un projet Next.js existant

```bash
pnpm add payload @payloadcms/next @payloadcms/db-postgres @payloadcms/richtext-lexical
```

### Configuration

```typescript
// payload.config.ts
import { buildConfig } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { Pages } from './collections/Pages';
import { Posts } from './collections/Posts';
import { Media } from './collections/Media';
import { Users } from './collections/Users';

export default buildConfig({
  editor: lexicalEditor(),
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL! },
  }),
  collections: [Pages, Posts, Media, Users],
  admin: {
    user: Users.slug,
  },
  typescript: {
    outputFile: 'src/payload-types.ts',
  },
});
```

### Collections (Schemas TypeScript)

```typescript
// collections/Posts.ts
import type { CollectionConfig } from 'payload';

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'publishedAt'],
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'content',
      type: 'richText',
    },
    {
      name: 'excerpt',
      type: 'textarea',
      maxLength: 300,
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'Actualites', value: 'news' },
        { label: 'Tutoriel', value: 'tutorial' },
        { label: 'Annonce', value: 'announcement' },
      ],
    },
    {
      name: 'tags',
      type: 'array',
      fields: [{ name: 'tag', type: 'text' }],
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      options: [
        { label: 'Brouillon', value: 'draft' },
        { label: 'Publie', value: 'published' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: { position: 'sidebar' },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      admin: { position: 'sidebar' },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Auto-generate slug
        if (data.title && !data.slug) {
          data.slug = data.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        }
        return data;
      },
    ],
  },
};
```

```typescript
// collections/Media.ts
import type { CollectionConfig } from 'payload';

export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    staticDir: 'public/media',
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 300, position: 'centre' },
      { name: 'card', width: 768, height: 512, position: 'centre' },
      { name: 'hero', width: 1920, height: 1080, position: 'centre' },
    ],
  },
  fields: [
    { name: 'alt', type: 'text', required: true },
    { name: 'caption', type: 'text' },
  ],
};
```

### Requetes (Local API)

```typescript
// lib/payload.ts
import { getPayload } from 'payload';
import config from '@/payload.config';

export async function getPosts(limit = 10) {
  const payload = await getPayload({ config });

  const { docs } = await payload.find({
    collection: 'posts',
    where: { status: { equals: 'published' } },
    sort: '-publishedAt',
    limit,
    depth: 1, // Resout les relations (author, coverImage)
  });

  return docs;
}

export async function getPostBySlug(slug: string) {
  const payload = await getPayload({ config });

  const { docs } = await payload.find({
    collection: 'posts',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2,
  });

  return docs[0] ?? null;
}
```

### Pages Next.js

```typescript
// app/blog/page.tsx
import { getPosts } from '@/lib/payload';

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
        </article>
      ))}
    </div>
  );
}
```

---

## Sanity (Alternative)

```bash
pnpm add next-sanity @sanity/image-url
```

```typescript
// sanity/client.ts
import { createClient } from 'next-sanity';

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  useCdn: process.env.NODE_ENV === 'production',
});

// Requete GROQ
export async function getPosts() {
  return client.fetch(`
    *[_type == "post" && !(_id in path("drafts.**"))] | order(publishedAt desc) {
      _id,
      title,
      slug,
      excerpt,
      publishedAt,
      "coverImage": coverImage.asset->url,
      "author": author->{ name, image }
    }
  `);
}
```

---

## Checklist

### Payload CMS
- [ ] Collections definies en TypeScript
- [ ] `payload-types.ts` genere (`pnpm payload generate:types`)
- [ ] Upload/Media avec tailles d'image definies
- [ ] Access control par collection
- [ ] Admin UI accessible sur `/admin`
- [ ] Hooks pour auto-generation (slugs, dates)

### General
- [ ] Preview mode pour les brouillons
- [ ] Revalidation on-demand apres publication
- [ ] SEO metadata par page/post
- [ ] Sitemap dynamique

---

*Knowledge ATUM CREA | Sources: payloadcms/payload, next-sanity, Strapi docs*
