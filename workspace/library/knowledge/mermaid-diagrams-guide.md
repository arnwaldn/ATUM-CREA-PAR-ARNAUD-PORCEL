# Mermaid Diagrams Guide

> **Usage** : Generer des diagrammes visuels dans les docs projet pour documenter l'architecture, les flux et les schemas de donnees.
> **Quand** : Phase PLANIFIER (avant implementation) et VERIFIER (documentation finale).

---

## Types de Diagrammes

| Type | Syntaxe | Usage |
|------|---------|-------|
| Architecture / Flux | `graph TD` ou `graph LR` | Composants, flux de donnees, dependances |
| Sequence | `sequenceDiagram` | Interactions entre services, requetes API |
| Base de donnees | `erDiagram` | Schemas relationnels, entites |
| Machine a etats | `stateDiagram-v2` | Cycle de vie, workflows |
| Timeline | `timeline` | Chronologie de projet, phases |
| Gantt | `gantt` | Planification de taches |

---

## Template 1 : Architecture Composants

```mermaid
graph TD
    A[Client Browser] -->|HTTPS| B[Next.js Frontend]
    B -->|API Routes| C[Backend API]
    C -->|Query| D[(PostgreSQL)]
    C -->|Cache| E[(Redis)]
    C -->|Auth| F[Clerk / Supabase Auth]
    B -->|Static| G[CDN / Vercel Edge]

    style A fill:#e1f5fe
    style D fill:#fff3e0
    style E fill:#fff3e0
    style F fill:#f3e5f5
```

### Variantes courantes

**Microservices :**
```mermaid
graph LR
    GW[API Gateway] --> S1[Auth Service]
    GW --> S2[User Service]
    GW --> S3[Payment Service]
    S1 --> DB1[(Auth DB)]
    S2 --> DB2[(User DB)]
    S3 --> DB3[(Payment DB)]
    S3 --> EXT[Stripe API]
```

**Monorepo :**
```mermaid
graph TD
    ROOT[Monorepo Root] --> PKG1[packages/ui]
    ROOT --> PKG2[packages/shared]
    ROOT --> APP1[apps/web]
    ROOT --> APP2[apps/mobile]
    ROOT --> APP3[apps/api]
    APP1 --> PKG1
    APP1 --> PKG2
    APP2 --> PKG1
    APP2 --> PKG2
    APP3 --> PKG2
```

---

## Template 2 : Diagramme de Sequence

```mermaid
sequenceDiagram
    actor U as User
    participant F as Frontend
    participant A as API
    participant DB as Database
    participant S as Stripe

    U->>F: Click "Subscribe"
    F->>A: POST /api/checkout
    A->>S: Create Checkout Session
    S-->>A: Session URL
    A-->>F: Redirect URL
    F->>S: Redirect to Stripe
    S-->>F: Payment Complete
    F->>A: POST /api/webhook
    A->>DB: Update subscription
    A-->>F: 200 OK
```

### Variantes

**Auth Flow :**
```mermaid
sequenceDiagram
    actor U as User
    participant C as Client
    participant A as Auth Provider
    participant API as Backend

    U->>C: Login (email/password)
    C->>A: Authenticate
    A-->>C: JWT Token
    C->>API: Request + Bearer Token
    API->>A: Verify Token
    A-->>API: Valid
    API-->>C: Protected Data
```

**WebSocket :**
```mermaid
sequenceDiagram
    participant C as Client
    participant WS as WebSocket Server
    participant DB as Database

    C->>WS: Connect (upgrade)
    WS-->>C: Connected
    C->>WS: Subscribe channel:room-123
    WS->>DB: Listen for changes
    DB-->>WS: Row inserted
    WS-->>C: Push update (realtime)
```

---

## Template 3 : Schema de Base de Donnees (ER)

```mermaid
erDiagram
    USER {
        uuid id PK
        string email UK
        string name
        timestamp created_at
    }
    ORGANIZATION {
        uuid id PK
        string name
        string slug UK
        enum plan
    }
    MEMBERSHIP {
        uuid id PK
        uuid user_id FK
        uuid org_id FK
        enum role
    }
    PROJECT {
        uuid id PK
        uuid org_id FK
        string name
        jsonb settings
    }

    USER ||--o{ MEMBERSHIP : "has"
    ORGANIZATION ||--o{ MEMBERSHIP : "has"
    ORGANIZATION ||--o{ PROJECT : "owns"
```

### Variantes

**E-commerce :**
```mermaid
erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ ORDER_LINE : contains
    ORDER_LINE }|--|| PRODUCT : references
    PRODUCT }|--|| CATEGORY : "belongs to"
    ORDER ||--o| PAYMENT : "paid by"
    CUSTOMER ||--o{ ADDRESS : "has"
```

**SaaS Multi-tenant :**
```mermaid
erDiagram
    TENANT ||--o{ USER : "has"
    TENANT ||--o{ SUBSCRIPTION : "has"
    SUBSCRIPTION }|--|| PLAN : "uses"
    PLAN ||--o{ FEATURE : "includes"
    USER ||--o{ API_KEY : "owns"
    USER ||--o{ AUDIT_LOG : "generates"
```

---

## Template 4 : Machine a Etats

```mermaid
stateDiagram-v2
    [*] --> Draft
    Draft --> Review : submit
    Review --> Approved : approve
    Review --> Draft : request_changes
    Approved --> Published : publish
    Published --> Archived : archive
    Archived --> Draft : restore
    Published --> Draft : unpublish
```

### Variantes

**Order Lifecycle :**
```mermaid
stateDiagram-v2
    [*] --> Pending
    Pending --> Processing : payment_confirmed
    Pending --> Cancelled : cancel
    Processing --> Shipped : ship
    Processing --> Cancelled : cancel
    Shipped --> Delivered : deliver
    Delivered --> Returned : return_request
    Returned --> Refunded : process_refund
    Delivered --> [*]
    Refunded --> [*]
    Cancelled --> [*]
```

**CI/CD Pipeline :**
```mermaid
stateDiagram-v2
    [*] --> Build
    Build --> Test : build_success
    Build --> Failed : build_error
    Test --> Lint : tests_pass
    Test --> Failed : tests_fail
    Lint --> Deploy_Staging : lint_pass
    Lint --> Failed : lint_fail
    Deploy_Staging --> E2E : deploy_success
    E2E --> Deploy_Prod : e2e_pass
    E2E --> Failed : e2e_fail
    Deploy_Prod --> [*] : deploy_success
    Failed --> [*]
```

---

## Template 5 : Flux ATUM CREA (Wave Pattern)

```mermaid
graph TD
    START([Demande]) --> RESEARCH[Wave 1: Recherche]
    RESEARCH -->|parallel| R1[Memory Recall]
    RESEARCH -->|parallel| R2[Context7 Docs]
    RESEARCH -->|parallel| R3[Explore Codebase]

    R1 --> CP1{Checkpoint 1}
    R2 --> CP1
    R3 --> CP1

    CP1 --> PLAN[Planifier: TodoWrite]
    PLAN --> BUILD[Wave 2: Construire]

    BUILD -->|parallel si fichiers differents| B1[Task Agent A]
    BUILD -->|parallel si fichiers differents| B2[Task Agent B]
    BUILD -->|sequentiel si meme fichier| B3[Task Agent C]

    B1 --> CP2{Checkpoint 2}
    B2 --> CP2
    B3 --> CP2

    CP2 --> VERIFY[Wave 3: Verifier]
    VERIFY -->|Gate A| V1[Build + Tests + Review]
    VERIFY -->|Gate B| V2[AI Browser + Screenshots]

    V1 --> SYNC{Sync: Both Pass?}
    V2 --> SYNC

    SYNC -->|oui| MEMO[Memoriser: Hindsight]
    SYNC -->|non| FIX[Corriger] --> VERIFY
    MEMO --> DONE([Termine])
```

---

## Bonnes Pratiques

### Style et Lisibilite
- Limiter a **15-20 noeuds** par diagramme (au-dela, decouper)
- Utiliser des **couleurs** pour distinguer les couches (`style` ou `classDef`)
- Nommer les **fleches** pour clarifier les transitions
- Preferer `graph TD` (top-down) pour les architectures, `graph LR` (left-right) pour les pipelines

### Couleurs par Convention
```
Frontend  : #e1f5fe (bleu clair)
Backend   : #e8f5e9 (vert clair)
Database  : #fff3e0 (orange clair)
External  : #f3e5f5 (violet clair)
Error     : #ffebee (rouge clair)
```

### Ou Placer les Diagrammes
- `docs/architecture.md` : architecture globale du projet
- `README.md` : diagramme simplifie pour onboarding
- `docs/api-flow.md` : sequences d'interaction API
- `docs/database.md` : schema ER complet

### Integration dans le Cycle ATUM CREA
1. **PLANIFIER** : Generer `graph TD` de l'architecture cible avant de coder
2. **CONSTRUIRE** : Mettre a jour les sequences si le flux change
3. **VERIFIER** : Valider que le diagramme correspond a l'implementation
4. **MEMORISER** : Stocker le pattern dans Hindsight si reutilisable

---

*Mermaid Diagrams Guide - ATUM CREA Knowledge Library*
