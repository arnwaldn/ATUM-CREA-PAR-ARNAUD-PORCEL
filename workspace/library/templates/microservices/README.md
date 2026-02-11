# Microservices Template

> ULTRA-CREATE Template - Architecture Microservices avec Docker Compose

## Stack

- **API Gateway**: Hono + TypeScript
- **Services**: Hono microservices indépendants
- **Database**: PostgreSQL (par service)
- **Cache**: Redis
- **Message Queue**: RabbitMQ (optionnel)
- **Containers**: Docker Compose
- **ORM**: Prisma 6

## Architecture

```
                    ┌─────────────────┐
                    │    Clients      │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │   API Gateway   │
                    │    (Hono)       │
                    │   Port: 3000    │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼───────┐   ┌───────▼───────┐   ┌───────▼───────┐
│ User Service  │   │ Order Service │   │ Notification  │
│  Port: 3001   │   │  Port: 3002   │   │  Port: 3003   │
└───────┬───────┘   └───────┬───────┘   └───────┬───────┘
        │                   │                   │
┌───────▼───────┐   ┌───────▼───────┐   ┌───────▼───────┐
│  PostgreSQL   │   │  PostgreSQL   │   │    Redis      │
│   users_db    │   │   orders_db   │   │   (cache)     │
└───────────────┘   └───────────────┘   └───────────────┘
```

## Installation

```bash
# 1. Démarrer tous les services
docker-compose up -d

# 2. Initialiser les bases de données
docker-compose exec user-service npx prisma db push
docker-compose exec order-service npx prisma db push

# 3. Voir les logs
docker-compose logs -f
```

## Structure

```
├── services/
│   ├── api-gateway/           # Point d'entrée unique
│   │   ├── src/index.ts
│   │   ├── Dockerfile
│   │   └── package.json
│   ├── user-service/          # Gestion utilisateurs
│   │   ├── src/
│   │   ├── prisma/
│   │   ├── Dockerfile
│   │   └── package.json
│   ├── order-service/         # Gestion commandes
│   │   ├── src/
│   │   ├── prisma/
│   │   └── Dockerfile
│   └── notification-service/  # Notifications
│       ├── src/
│       └── Dockerfile
├── shared/
│   └── types/                 # Types partagés
├── docker-compose.yml
└── README.md
```

## Services

### API Gateway (Port 3000)
- Routing vers les services
- Rate limiting
- Authentication middleware
- Request logging

### User Service (Port 3001)
- CRUD utilisateurs
- Authentication JWT
- Profils

### Order Service (Port 3002)
- CRUD commandes
- État des commandes
- Historique

### Notification Service (Port 3003)
- Emails
- Push notifications
- Webhooks

## Communication Inter-Services

### HTTP (Synchrone)
```typescript
// api-gateway → user-service
const user = await fetch('http://user-service:3001/users/123')
```

### Events (Asynchrone)
```typescript
// order-service → notification-service via Redis Pub/Sub
redis.publish('order:created', JSON.stringify(order))
```

## Commandes Utiles

```bash
# Rebuild un service
docker-compose build user-service
docker-compose up -d user-service

# Voir logs d'un service
docker-compose logs -f user-service

# Exec dans un container
docker-compose exec user-service sh

# Arrêter tout
docker-compose down

# Arrêter et supprimer volumes
docker-compose down -v
```

## Scaling

```bash
# Scale un service
docker-compose up -d --scale user-service=3
```

## Monitoring

- **Prometheus**: Métriques
- **Grafana**: Dashboards
- **Jaeger**: Tracing distribué

---

*Template ULTRA-CREATE v22.3*
