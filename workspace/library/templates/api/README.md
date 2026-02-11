# {{PROJECT_NAME}} API

API REST production-ready avec Next.js 15, Prisma et JWT.

## Stack

- **Framework:** Next.js 15 (App Router)
- **ORM:** Prisma
- **Validation:** Zod
- **Auth:** JWT (jose)

## Endpoints

```
POST   /api/v1/auth        # Login
GET    /api/v1/users       # Liste (admin)
POST   /api/v1/users       # Créer
GET    /api/v1/users/:id   # Détail
PATCH  /api/v1/users/:id   # Modifier
DELETE /api/v1/users/:id   # Supprimer (admin)
```

## Installation

```bash
npm install
cp .env.example .env.local
npx prisma generate
npx prisma db push
npm run dev
```

## Auth

Headers: `Authorization: Bearer <token>`

## Response Format

```json
{
  "success": true,
  "data": {},
  "meta": { "page": 1, "limit": 20, "total": 100 }
}
```
