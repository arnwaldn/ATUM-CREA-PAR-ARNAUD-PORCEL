# Boilerplate Catalog - Guide de Référence

> Catalogue complet des boilerplates, starters et templates d'infrastructure pour accélérer le développement.

## Sources Principales

| Source | Type | Count | Spécialité |
|--------|------|-------|------------|
| BoilerplateList.com | SaaS starters | 195+ | Next.js, Payments, Auth |
| 0xbaha/boilerplate-collection | Architecture | 50+ | Microservices, DDD |
| ChristianLempa/boilerplates | Infrastructure | 30+ | Docker, K8s, Terraform |

---

## SaaS Boilerplates (BoilerplateList.com)

### Top Tier (Production-Ready)

| Name | Stack | Price | Features | URL |
|------|-------|-------|----------|-----|
| **Shipfast** | Next.js 14, Supabase, Stripe | $199 | Auth, Payments, SEO, Emails | shipfast.com |
| **Supastarter** | Next.js 14, Supabase | $299 | i18n, Teams, AI, Analytics | supastarter.dev |
| **Makerkit** | Next.js 14, Firebase/Supabase | $299 | Multi-tenant, Billing, Teams | makerkit.dev |
| **SaasRock** | Remix, Prisma | $149 | CRM, Workflows, i18n | saasrock.com |
| **Nextless.js** | Next.js 14, AWS | $299 | Serverless, Multi-tenant | nextlessjs.com |

### Mid Tier (Good Value)

| Name | Stack | Price | Focus |
|------|-------|-------|-------|
| **Bedrock** | Next.js, Prisma | $99 | Auth, Stripe basics |
| **Divjoy** | React, Firebase | $169 | Landing pages |
| **Gravity** | Next.js, Stripe | $149 | Simple SaaS |
| **LaunchFast** | Next.js, Supabase | $179 | AI integrations |

### Open Source

| Name | Stack | Stars | Features |
|------|-------|-------|----------|
| **Next-Saas-Stripe** | Next.js, Prisma, Stripe | 4.5k+ | Auth, Billing, Dashboard |
| **Taxonomy** | Next.js 13, Prisma | 16k+ | Docs, Blog, Auth |
| **create-t3-app** | Next.js, tRPC, Prisma | 23k+ | Full-stack type-safe |
| **Blitz.js** | Next.js-based | 13k+ | Zero-API layer |

### Par Catégorie

#### Auth-First
- **Clerk Templates**: Next.js + Clerk auth
- **NextAuth Starter**: Open source auth
- **Supabase Auth Kit**: Row-level security

#### AI-Focused
- **ChatGPT Clone**: OpenAI integration
- **AI SaaS Starter**: Multiple LLM support
- **RAG Template**: Vector DB + LLM

#### Multi-tenant
- **Makerkit**: Workspace management
- **Nextless.js**: Organization hierarchy
- **Saasfly**: Team permissions

---

## Architecture Patterns (0xbaha/boilerplate-collection)

### Clean Architecture
```
src/
├── domain/           # Entités, Value Objects
│   ├── entities/
│   └── value-objects/
├── application/      # Use cases, DTOs
│   ├── use-cases/
│   └── dtos/
├── infrastructure/   # Repos, External services
│   ├── repositories/
│   └── services/
└── presentation/     # Controllers, Views
    ├── controllers/
    └── views/
```

### Hexagonal Architecture (Ports & Adapters)
```
src/
├── core/             # Domain logic
│   ├── domain/
│   └── ports/        # Interfaces
├── adapters/         # Implementations
│   ├── inbound/      # REST, GraphQL, CLI
│   └── outbound/     # DB, APIs, Queue
└── config/           # DI, Config
```

### CQRS + Event Sourcing
```
src/
├── commands/         # Write operations
│   ├── handlers/
│   └── validators/
├── queries/          # Read operations
│   ├── handlers/
│   └── projections/
├── events/           # Domain events
│   ├── handlers/
│   └── store/
└── aggregates/       # Event-sourced entities
```

### Microservices Template
```
services/
├── api-gateway/
│   ├── src/
│   └── Dockerfile
├── user-service/
│   ├── src/
│   └── Dockerfile
├── order-service/
│   ├── src/
│   └── Dockerfile
└── shared/
    ├── proto/        # gRPC definitions
    └── events/       # Shared event schemas
```

---

## Infrastructure (ChristianLempa/boilerplates)

### Docker Compose Stacks

#### Full-Stack Development
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/app
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

  db:
    image: postgres:16-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: app
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  mailhog:
    image: mailhog/mailhog
    ports:
      - "1025:1025"
      - "8025:8025"

volumes:
  postgres_data:
```

#### Production avec Traefik
```yaml
version: '3.8'
services:
  traefik:
    image: traefik:v3.0
    command:
      - "--api.dashboard=true"
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.le.acme.httpchallenge=true"
      - "--certificatesresolvers.le.acme.email=admin@example.com"
      - "--certificatesresolvers.le.acme.storage=/letsencrypt/acme.json"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - traefik_certs:/letsencrypt
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.dashboard.rule=Host(`traefik.example.com`)"
      - "traefik.http.routers.dashboard.service=api@internal"
      - "traefik.http.routers.dashboard.tls.certresolver=le"

  app:
    image: myapp:latest
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.app.rule=Host(`app.example.com`)"
      - "traefik.http.routers.app.tls.certresolver=le"
      - "traefik.http.services.app.loadbalancer.server.port=3000"

volumes:
  traefik_certs:
```

#### Monitoring Stack
```yaml
version: '3.8'
services:
  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana:latest
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana/dashboards:/etc/grafana/provisioning/dashboards
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin

  loki:
    image: grafana/loki:latest
    ports:
      - "3100:3100"

  promtail:
    image: grafana/promtail:latest
    volumes:
      - /var/log:/var/log:ro
      - ./promtail.yml:/etc/promtail/config.yml

volumes:
  prometheus_data:
  grafana_data:
```

### Kubernetes Manifests

#### Basic Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app
  labels:
    app: myapp
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
      - name: app
        image: myapp:latest
        ports:
        - containerPort: 3000
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: database-url
---
apiVersion: v1
kind: Service
metadata:
  name: app-service
spec:
  selector:
    app: myapp
  ports:
  - port: 80
    targetPort: 3000
  type: ClusterIP
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
  - hosts:
    - app.example.com
    secretName: app-tls
  rules:
  - host: app.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: app-service
            port:
              number: 80
```

#### Helm Values Template
```yaml
# values.yaml
replicaCount: 3

image:
  repository: myapp
  tag: latest
  pullPolicy: IfNotPresent

service:
  type: ClusterIP
  port: 80

ingress:
  enabled: true
  className: nginx
  hosts:
    - host: app.example.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: app-tls
      hosts:
        - app.example.com

resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 250m
    memory: 256Mi

autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 10
  targetCPUUtilizationPercentage: 80

env:
  - name: NODE_ENV
    value: production
```

### Terraform Modules

#### AWS VPC
```hcl
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.0.0"

  name = var.project_name
  cidr = "10.0.0.0/16"

  azs             = ["eu-west-1a", "eu-west-1b", "eu-west-1c"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]

  enable_nat_gateway = true
  single_nat_gateway = true

  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Environment = var.environment
    Project     = var.project_name
    Terraform   = "true"
  }
}
```

#### EKS Cluster
```hcl
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "19.0.0"

  cluster_name    = "${var.project_name}-eks"
  cluster_version = "1.28"

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  eks_managed_node_groups = {
    default = {
      min_size     = 2
      max_size     = 10
      desired_size = 3

      instance_types = ["t3.medium"]
      capacity_type  = "ON_DEMAND"
    }
  }

  tags = {
    Environment = var.environment
  }
}
```

---

## GitHub Actions Templates

### CI/CD Pipeline
```yaml
name: CI/CD
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3

  build:
    needs: test
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - uses: docker/build-push-action@v5
        with:
          context: .
          push: ${{ github.event_name != 'pull_request' }}
          tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Kubernetes
        run: |
          kubectl set image deployment/app app=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}
```

---

## Critères de Sélection

### Pour SaaS Boilerplate
| Critère | Poids | Questions |
|---------|-------|-----------|
| Stack | 25% | Compatible avec l'équipe? |
| Maintenance | 20% | Commits récents? Issues résolues? |
| Documentation | 20% | Complète et à jour? |
| Features | 20% | Auth, Payments inclus? |
| Prix | 15% | ROI sur temps gagné? |

### Pour Infrastructure
| Critère | Poids | Questions |
|---------|-------|-----------|
| Scalabilité | 25% | Supporte la croissance? |
| Coût | 20% | Budget ops prévisible? |
| Complexité | 20% | Équipe peut maintenir? |
| Sécurité | 20% | Compliance requise? |
| Vendor lock-in | 15% | Portabilité possible? |

---

## Ressources

- **BoilerplateList.com**: https://boilerplatelist.com/
- **0xbaha/boilerplate-collection**: https://github.com/0xbaha/boilerplate-collection
- **ChristianLempa/boilerplates**: https://github.com/ChristianLempa/boilerplates
- **Awesome Docker**: https://github.com/veggiemonk/awesome-docker
- **Awesome Kubernetes**: https://github.com/ramitsurana/awesome-kubernetes
- **Terraform Registry**: https://registry.terraform.io/

---

*Dernière mise à jour: Janvier 2026 | ULTRA-CREATE v27.1*
