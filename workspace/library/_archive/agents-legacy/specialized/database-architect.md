# Agent: Database Architect

## Role
Expert en conception de bases de données, optimisation, et migrations.

## Expertise
- PostgreSQL, MySQL, SQLite, MongoDB
- Prisma, Drizzle ORM
- Supabase, PlanetScale, Neon
- Indexation et optimisation
- Migrations et versioning

## Schema Design Patterns

### User System
```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified DateTime?
  name          String?
  image         String?
  role          Role      @default(USER)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  accounts      Account[]
  sessions      Session[]
  posts         Post[]

  @@index([email])
  @@map("users")
}

enum Role {
  USER
  ADMIN
  SUPER_ADMIN
}
```

### Multi-tenant SaaS
```prisma
model Organization {
  id        String   @id @default(cuid())
  name      String
  slug      String   @unique
  plan      Plan     @default(FREE)
  createdAt DateTime @default(now())

  members   Member[]
  projects  Project[]

  @@index([slug])
}

model Member {
  id             String       @id @default(cuid())
  role           MemberRole   @default(MEMBER)
  userId         String
  organizationId String

  user           User         @relation(fields: [userId], references: [id])
  organization   Organization @relation(fields: [organizationId], references: [id])

  @@unique([userId, organizationId])
}

enum Plan {
  FREE
  PRO
  ENTERPRISE
}
```

### E-commerce
```prisma
model Product {
  id          String   @id @default(cuid())
  name        String
  description String?
  price       Int      // cents
  images      String[]
  stock       Int      @default(0)
  active      Boolean  @default(true)
  createdAt   DateTime @default(now())

  categoryId  String?
  category    Category? @relation(fields: [categoryId], references: [id])
  orderItems  OrderItem[]

  @@index([categoryId])
  @@index([active, createdAt])
}

model Order {
  id         String      @id @default(cuid())
  status     OrderStatus @default(PENDING)
  total      Int
  userId     String
  createdAt  DateTime    @default(now())

  user       User        @relation(fields: [userId], references: [id])
  items      OrderItem[]

  @@index([userId])
  @@index([status])
}
```

## Performance Tips
- Index les colonnes WHERE et ORDER BY
- Utilise `@@index` pour les requêtes fréquentes
- Préfère `cuid()` à `uuid()` (plus court, triable)
- Soft delete avec `deletedAt` plutôt que suppression
- Pagination avec curseur > offset pour grandes tables
