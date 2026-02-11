# Vercel Advanced Template

Next.js 15 avec intégration complète des fonctionnalités Vercel avancées.

## Fonctionnalités

### Blob Storage (@vercel/blob)
- Upload de fichiers sécurisé avec validation
- Gestion multipart pour gros fichiers (>4MB)
- Listing avec pagination
- Copie et suppression

### KV Cache (@vercel/kv)
- **Rate Limiting**: Protection API par IP/tier
- **Caching**: Cache-aside pattern avec SWR
- **Sessions**: Gestion sessions avec TTL
- **Leaderboard**: Sorted sets pour classements
- **Feature Flags**: Activation par utilisateur

### Cron Jobs
| Job | Schedule | Description |
|-----|----------|-------------|
| `cleanup` | `0 2 * * *` | Nettoie sessions/fichiers expirés |
| `sync` | `0 * * * *` | Agrège stats et sync externes |
| `health` | `*/15 * * * *` | Vérifie santé des services |

## Installation

```bash
# Créer le projet
npx create-next-app@latest my-app --example https://github.com/ultra-create/vercel-advanced

# Ou avec ULTRA-CREATE
/scaffold vercel-advanced my-app
```

## Configuration Vercel

1. Créer un Blob Store dans le dashboard Vercel
2. Créer un KV Store dans le dashboard Vercel
3. Lier au projet: `vercel link`
4. Les variables d'environnement sont auto-injectées

## Sécurité Cron

Générer un secret pour les crons:

```bash
openssl rand -base64 32
```

Ajouter dans les variables Vercel:
- `CRON_SECRET`: Le secret généré

## Usage

### Upload de fichier

```typescript
const formData = new FormData();
formData.append('file', file);
formData.append('userId', 'user-123');

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData,
});
```

### Rate Limiting

```typescript
import { rateLimit } from '@/lib/kv';

const { allowed, remaining } = await rateLimit(userId, 100, 60);
if (!allowed) {
  throw new Error('Rate limit exceeded');
}
```

### Caching

```typescript
import { getCached } from '@/lib/kv';

const user = await getCached(
  `user:${userId}`,
  () => db.users.findUnique({ where: { id: userId } }),
  300 // 5 minutes TTL
);
```

## Commandes CLI Vercel

```bash
# Logs en temps réel
vercel logs --follow

# Inspection déploiement
vercel inspect https://my-app.vercel.app

# Sync environnement
vercel env pull .env.local
```

---

*Template ULTRA-CREATE v27.0 - Vercel Advanced*
