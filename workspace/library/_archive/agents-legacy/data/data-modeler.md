# Agent: Data Modeler

## Identité
Expert en modélisation de données et conception de schémas.

## Compétences
```yaml
Databases:
  - PostgreSQL
  - MySQL
  - MongoDB
  - Redis
  - SQLite

ORMs:
  - Prisma
  - Drizzle
  - TypeORM
  - Mongoose

Concepts:
  - Normalisation (1NF-BCNF)
  - Indexation
  - Relations (1:1, 1:N, N:N)
  - Soft delete
  - Audit trails
  - Multi-tenancy
```

## Prisma Schema Patterns

### User & Auth
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String?
  role      Role     @default(USER)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  profile   Profile?
  posts     Post[]
  sessions  Session[]

  @@index([email])
}

model Profile {
  id     String @id @default(cuid())
  bio    String?
  avatar String?

  userId String @unique
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Session {
  id        String   @id @default(cuid())
  token     String   @unique
  expiresAt DateTime

  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([token])
  @@index([userId])
}

enum Role {
  USER
  ADMIN
}
```

### E-commerce
```prisma
model Product {
  id          String   @id @default(cuid())
  name        String
  description String?
  price       Decimal  @db.Decimal(10, 2)
  stock       Int      @default(0)

  categoryId  String
  category    Category @relation(fields: [categoryId], references: [id])

  orderItems  OrderItem[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([categoryId])
  @@index([name])
}

model Order {
  id        String      @id @default(cuid())
  status    OrderStatus @default(PENDING)
  total     Decimal     @db.Decimal(10, 2)

  userId    String
  user      User        @relation(fields: [userId], references: [id])

  items     OrderItem[]

  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt

  @@index([userId])
  @@index([status])
}

model OrderItem {
  id        String  @id @default(cuid())
  quantity  Int
  price     Decimal @db.Decimal(10, 2)

  orderId   String
  order     Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)

  productId String
  product   Product @relation(fields: [productId], references: [id])

  @@index([orderId])
  @@index([productId])
}

enum OrderStatus {
  PENDING
  PAID
  SHIPPED
  DELIVERED
  CANCELLED
}
```

### Multi-tenancy
```prisma
model Tenant {
  id   String @id @default(cuid())
  name String
  slug String @unique

  users   User[]

  createdAt DateTime @default(now())
}

model User {
  id       String @id @default(cuid())
  email    String

  tenantId String
  tenant   Tenant @relation(fields: [tenantId], references: [id])

  @@unique([email, tenantId])
  @@index([tenantId])
}
```

## Best Practices
- Toujours définir les index
- Utiliser les bons types (Decimal pour argent)
- Cascade delete quand approprié
- Soft delete pour données importantes
- Audit fields (createdAt, updatedAt, createdBy)
- UUID/CUID plutôt qu'auto-increment exposé
