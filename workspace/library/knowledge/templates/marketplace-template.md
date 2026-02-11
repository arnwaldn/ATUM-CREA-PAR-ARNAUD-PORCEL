# Template: Marketplace Application

## Overview

Template complet pour créer une marketplace multi-vendeurs avec Stripe Connect, système d'avis, escrow, et gestion des commissions.

---

## STACK TECHNIQUE

| Couche | Technologie | Raison |
|--------|-------------|--------|
| **Framework** | Next.js 15 (App Router) | SSR, RSC, API Routes |
| **Auth** | Clerk | Multi-tenant, vendeur/acheteur |
| **Database** | Supabase (PostgreSQL) | Realtime, Row Level Security |
| **ORM** | Prisma | Type-safe queries |
| **Payments** | Stripe Connect | Multi-party payments |
| **Storage** | Supabase Storage | Product images |
| **Search** | Algolia / Meilisearch | Product search |
| **UI** | shadcn/ui + TailwindCSS | Composants accessibles |

---

## ARCHITECTURE MARKETPLACE

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         MARKETPLACE ARCHITECTURE                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         USERS                                        │   │
│  │                                                                      │   │
│  │   ┌───────────┐      ┌───────────┐      ┌───────────┐              │   │
│  │   │  BUYERS   │      │  SELLERS  │      │   ADMIN   │              │   │
│  │   │           │      │           │      │           │              │   │
│  │   │ • Browse  │      │ • List    │      │ • Manage  │              │   │
│  │   │ • Buy     │      │ • Sell    │      │ • Moderate│              │   │
│  │   │ • Review  │      │ • Fulfill │      │ • Analytics│             │   │
│  │   └───────────┘      └───────────┘      └───────────┘              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                         │
│                                    ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    CORE FEATURES                                     │   │
│  │                                                                      │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │   │
│  │  │   PRODUCT    │  │    ORDER     │  │   PAYMENT    │               │   │
│  │  │   CATALOG    │  │   SYSTEM     │  │   FLOW       │               │   │
│  │  │              │  │              │  │              │               │   │
│  │  │ • Listings   │  │ • Cart       │  │ • Checkout   │               │   │
│  │  │ • Search     │  │ • Checkout   │  │ • Escrow     │               │   │
│  │  │ • Categories │  │ • Tracking   │  │ • Payouts    │               │   │
│  │  │ • Filters    │  │ • Returns    │  │ • Refunds    │               │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘               │   │
│  │                                                                      │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │   │
│  │  │   REVIEWS    │  │   MESSAGES   │  │  DASHBOARD   │               │   │
│  │  │   & RATINGS  │  │   SYSTEM     │  │  (Seller)    │               │   │
│  │  │              │  │              │  │              │               │   │
│  │  │ • Product    │  │ • Buyer-     │  │ • Sales      │               │   │
│  │  │ • Seller     │  │   Seller     │  │ • Products   │               │   │
│  │  │ • Verified   │  │ • Support    │  │ • Orders     │               │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## STRUCTURE PROJET

```
my-marketplace/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   │   ├── sign-up/[[...sign-up]]/page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── (marketplace)/
│   │   │   ├── page.tsx                    # Homepage
│   │   │   ├── products/
│   │   │   │   ├── page.tsx                # Product listing
│   │   │   │   ├── [slug]/page.tsx         # Product detail
│   │   │   │   └── search/page.tsx         # Search results
│   │   │   ├── categories/
│   │   │   │   └── [slug]/page.tsx         # Category page
│   │   │   ├── sellers/
│   │   │   │   └── [id]/page.tsx           # Seller storefront
│   │   │   ├── cart/page.tsx               # Shopping cart
│   │   │   └── checkout/page.tsx           # Checkout
│   │   │
│   │   ├── (seller)/
│   │   │   ├── seller/
│   │   │   │   ├── dashboard/page.tsx      # Seller dashboard
│   │   │   │   ├── products/
│   │   │   │   │   ├── page.tsx            # My products
│   │   │   │   │   ├── new/page.tsx        # Add product
│   │   │   │   │   └── [id]/edit/page.tsx  # Edit product
│   │   │   │   ├── orders/page.tsx         # Orders to fulfill
│   │   │   │   ├── payouts/page.tsx        # Earnings & payouts
│   │   │   │   └── settings/page.tsx       # Store settings
│   │   │   └── become-seller/page.tsx      # Seller onboarding
│   │   │
│   │   ├── (buyer)/
│   │   │   ├── orders/page.tsx             # My orders
│   │   │   ├── orders/[id]/page.tsx        # Order detail
│   │   │   ├── reviews/page.tsx            # My reviews
│   │   │   └── wishlist/page.tsx           # Wishlist
│   │   │
│   │   ├── (admin)/
│   │   │   ├── admin/
│   │   │   │   ├── dashboard/page.tsx      # Admin dashboard
│   │   │   │   ├── products/page.tsx       # All products
│   │   │   │   ├── sellers/page.tsx        # Manage sellers
│   │   │   │   ├── orders/page.tsx         # All orders
│   │   │   │   ├── disputes/page.tsx       # Disputes
│   │   │   │   └── settings/page.tsx       # Platform settings
│   │   │
│   │   ├── api/
│   │   │   ├── webhooks/
│   │   │   │   ├── stripe/route.ts         # Stripe webhooks
│   │   │   │   └── stripe-connect/route.ts # Connect webhooks
│   │   │   ├── products/route.ts
│   │   │   ├── orders/route.ts
│   │   │   └── search/route.ts
│   │   │
│   │   └── layout.tsx
│   │
│   ├── components/
│   │   ├── marketplace/
│   │   │   ├── product-card.tsx
│   │   │   ├── product-grid.tsx
│   │   │   ├── search-bar.tsx
│   │   │   ├── category-nav.tsx
│   │   │   ├── filter-sidebar.tsx
│   │   │   └── price-range-slider.tsx
│   │   ├── cart/
│   │   │   ├── cart-item.tsx
│   │   │   ├── cart-summary.tsx
│   │   │   └── cart-drawer.tsx
│   │   ├── seller/
│   │   │   ├── seller-card.tsx
│   │   │   ├── seller-stats.tsx
│   │   │   └── product-form.tsx
│   │   ├── reviews/
│   │   │   ├── review-card.tsx
│   │   │   ├── review-form.tsx
│   │   │   └── star-rating.tsx
│   │   └── ui/
│   │
│   └── lib/
│       ├── stripe-connect.ts
│       ├── algolia.ts
│       └── commission.ts
│
├── prisma/
│   └── schema.prisma
└── ...
```

---

## MODÈLES DE DONNÉES

```prisma
// prisma/schema.prisma

// User (synced from Clerk)
model User {
  id        String   @id // Clerk user ID
  email     String   @unique
  name      String?
  imageUrl  String?
  role      UserRole @default(BUYER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  seller    Seller?
  orders    Order[]
  reviews   Review[]
  cart      CartItem[]
  wishlist  WishlistItem[]
  addresses Address[]

  @@map("users")
}

enum UserRole {
  BUYER
  SELLER
  ADMIN
}

// Seller profile
model Seller {
  id                    String   @id @default(cuid())
  userId                String   @unique
  user                  User     @relation(fields: [userId], references: [id])

  // Store info
  storeName             String
  slug                  String   @unique
  description           String?
  logoUrl               String?
  bannerUrl             String?

  // Stripe Connect
  stripeConnectId       String?  @unique
  stripeOnboardingComplete Boolean @default(false)
  commissionRate        Decimal  @default(0.10) // 10% default

  // Stats
  rating                Decimal  @default(0)
  totalSales            Int      @default(0)
  totalRevenue          Decimal  @default(0)

  // Status
  status                SellerStatus @default(PENDING)
  verifiedAt            DateTime?

  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  // Relations
  products              Product[]
  orders                OrderItem[]
  payouts               Payout[]

  @@map("sellers")
}

enum SellerStatus {
  PENDING
  ACTIVE
  SUSPENDED
  BANNED
}

// Product
model Product {
  id          String   @id @default(cuid())
  sellerId    String
  seller      Seller   @relation(fields: [sellerId], references: [id])

  // Basic info
  name        String
  slug        String   @unique
  description String
  price       Decimal
  comparePrice Decimal?

  // Inventory
  sku         String?
  quantity    Int      @default(0)
  trackInventory Boolean @default(true)

  // Media
  images      ProductImage[]

  // Categorization
  categoryId  String
  category    Category @relation(fields: [categoryId], references: [id])
  tags        String[]

  // Stats
  rating      Decimal  @default(0)
  reviewCount Int      @default(0)
  salesCount  Int      @default(0)

  // Status
  status      ProductStatus @default(DRAFT)
  publishedAt DateTime?

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  reviews     Review[]
  orderItems  OrderItem[]
  cartItems   CartItem[]
  wishlistItems WishlistItem[]

  @@index([sellerId])
  @@index([categoryId])
  @@map("products")
}

enum ProductStatus {
  DRAFT
  ACTIVE
  OUT_OF_STOCK
  ARCHIVED
}

// Category
model Category {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  description String?
  imageUrl    String?
  parentId    String?
  parent      Category? @relation("CategoryHierarchy", fields: [parentId], references: [id])
  children    Category[] @relation("CategoryHierarchy")
  products    Product[]

  @@map("categories")
}

// Order
model Order {
  id              String   @id @default(cuid())
  orderNumber     String   @unique
  userId          String
  user            User     @relation(fields: [userId], references: [id])

  // Totals
  subtotal        Decimal
  shippingCost    Decimal  @default(0)
  tax             Decimal  @default(0)
  total           Decimal

  // Stripe
  stripePaymentIntentId String? @unique
  paymentStatus   PaymentStatus @default(PENDING)

  // Shipping
  shippingAddressId String
  shippingAddress Address @relation(fields: [shippingAddressId], references: [id])

  // Status
  status          OrderStatus @default(PENDING)

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations
  items           OrderItem[]

  @@map("orders")
}

enum OrderStatus {
  PENDING
  CONFIRMED
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
  REFUNDED
}

enum PaymentStatus {
  PENDING
  PROCESSING
  SUCCEEDED
  FAILED
  REFUNDED
}

// Order Item (per seller)
model OrderItem {
  id          String   @id @default(cuid())
  orderId     String
  order       Order    @relation(fields: [orderId], references: [id])
  productId   String
  product     Product  @relation(fields: [productId], references: [id])
  sellerId    String
  seller      Seller   @relation(fields: [sellerId], references: [id])

  // Details
  quantity    Int
  price       Decimal
  total       Decimal

  // Commission
  commissionRate Decimal
  commissionAmount Decimal
  sellerAmount Decimal

  // Fulfillment
  status      FulfillmentStatus @default(PENDING)
  trackingNumber String?
  shippedAt   DateTime?
  deliveredAt DateTime?

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("order_items")
}

enum FulfillmentStatus {
  PENDING
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
  REFUNDED
}

// Review
model Review {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  productId   String
  product     Product  @relation(fields: [productId], references: [id])

  rating      Int      // 1-5
  title       String?
  content     String
  images      String[]

  verified    Boolean  @default(false) // Verified purchase
  helpful     Int      @default(0)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([userId, productId])
  @@map("reviews")
}

// Payout
model Payout {
  id              String   @id @default(cuid())
  sellerId        String
  seller          Seller   @relation(fields: [sellerId], references: [id])

  amount          Decimal
  currency        String   @default("usd")
  stripeTransferId String? @unique

  status          PayoutStatus @default(PENDING)
  paidAt          DateTime?

  createdAt       DateTime @default(now())

  @@map("payouts")
}

enum PayoutStatus {
  PENDING
  PROCESSING
  PAID
  FAILED
}
```

---

## STRIPE CONNECT INTEGRATION

### Seller Onboarding

```typescript
// src/lib/stripe-connect.ts
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function createConnectAccount(sellerId: string, email: string) {
  const account = await stripe.accounts.create({
    type: 'express',
    email,
    metadata: { sellerId },
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
  })

  return account.id
}

export async function createOnboardingLink(accountId: string, returnUrl: string) {
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${returnUrl}?refresh=true`,
    return_url: `${returnUrl}?success=true`,
    type: 'account_onboarding',
  })

  return accountLink.url
}

export async function createDashboardLink(accountId: string) {
  const loginLink = await stripe.accounts.createLoginLink(accountId)
  return loginLink.url
}
```

### Checkout with Split Payment

```typescript
// src/app/api/checkout/route.ts
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { db } from '@/lib/db'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const { items, shippingAddressId } = await req.json()

  // Group items by seller
  const itemsBySeller = groupBySeller(items)

  // Calculate totals
  const subtotal = calculateSubtotal(items)
  const shipping = calculateShipping(items)
  const total = subtotal + shipping

  // Create order
  const order = await db.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      userId: req.userId,
      subtotal,
      shippingCost: shipping,
      total,
      shippingAddressId,
      items: {
        create: items.map(item => ({
          productId: item.productId,
          sellerId: item.sellerId,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity,
          commissionRate: item.commissionRate,
          commissionAmount: item.price * item.quantity * item.commissionRate,
          sellerAmount: item.price * item.quantity * (1 - item.commissionRate),
        }))
      }
    }
  })

  // Create PaymentIntent with transfers
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(total * 100),
    currency: 'usd',
    metadata: {
      orderId: order.id
    },
    // Create transfers to sellers after payment succeeds
    transfer_group: order.id,
  })

  return NextResponse.json({
    clientSecret: paymentIntent.client_secret,
    orderId: order.id
  })
}
```

### Webhook Handler

```typescript
// src/app/api/webhooks/stripe-connect/route.ts
export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get('Stripe-Signature')!

  const event = stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_CONNECT_WEBHOOK_SECRET!
  )

  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentSuccess(event.data.object)
      break

    case 'account.updated':
      await handleAccountUpdate(event.data.object)
      break

    case 'transfer.created':
      await handleTransferCreated(event.data.object)
      break
  }

  return new NextResponse(null, { status: 200 })
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata.orderId

  // Update order status
  await db.order.update({
    where: { id: orderId },
    data: {
      paymentStatus: 'SUCCEEDED',
      status: 'CONFIRMED'
    }
  })

  // Get order items grouped by seller
  const orderItems = await db.orderItem.findMany({
    where: { orderId },
    include: { seller: true }
  })

  // Create transfers to each seller
  for (const item of orderItems) {
    if (item.seller.stripeConnectId) {
      await stripe.transfers.create({
        amount: Math.round(item.sellerAmount * 100),
        currency: 'usd',
        destination: item.seller.stripeConnectId,
        transfer_group: orderId,
        metadata: {
          orderId,
          orderItemId: item.id,
          sellerId: item.sellerId
        }
      })
    }
  }
}
```

---

## PRODUCT SEARCH

### Algolia Integration

```typescript
// src/lib/algolia.ts
import algoliasearch from 'algoliasearch'

const client = algoliasearch(
  process.env.ALGOLIA_APP_ID!,
  process.env.ALGOLIA_ADMIN_KEY!
)

const productsIndex = client.initIndex('products')

export async function indexProduct(product: Product) {
  await productsIndex.saveObject({
    objectID: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    category: product.category.name,
    seller: product.seller.storeName,
    rating: product.rating,
    images: product.images.map(i => i.url),
    tags: product.tags,
  })
}

export async function searchProducts(query: string, filters?: SearchFilters) {
  const results = await productsIndex.search(query, {
    filters: buildFilters(filters),
    facets: ['category', 'price', 'rating'],
    hitsPerPage: 20,
  })

  return results
}
```

---

## COMMISSION SYSTEM

```typescript
// src/lib/commission.ts

interface CommissionConfig {
  defaultRate: number        // 10%
  categoryRates: Record<string, number>
  sellerTiers: {
    bronze: { salesThreshold: 0, rate: 0.10 }
    silver: { salesThreshold: 1000, rate: 0.08 }
    gold: { salesThreshold: 10000, rate: 0.06 }
    platinum: { salesThreshold: 100000, rate: 0.05 }
  }
}

export function calculateCommission(
  price: number,
  seller: Seller,
  category?: Category
): { commission: number; sellerAmount: number } {
  // Get rate based on seller tier
  let rate = config.defaultRate

  if (seller.totalRevenue >= 100000) {
    rate = config.sellerTiers.platinum.rate
  } else if (seller.totalRevenue >= 10000) {
    rate = config.sellerTiers.gold.rate
  } else if (seller.totalRevenue >= 1000) {
    rate = config.sellerTiers.silver.rate
  }

  // Override with category rate if higher
  if (category && config.categoryRates[category.slug]) {
    rate = Math.max(rate, config.categoryRates[category.slug])
  }

  const commission = price * rate
  const sellerAmount = price - commission

  return { commission, sellerAmount }
}
```

---

## FEATURES INCLUSES

### MVP (Phase 1)
- [x] User authentication (buyer/seller roles)
- [x] Seller onboarding with Stripe Connect
- [x] Product listing and management
- [x] Product search and filtering
- [x] Shopping cart
- [x] Checkout with split payments
- [x] Order management
- [x] Basic reviews

### Phase 2
- [ ] Advanced search (Algolia)
- [ ] Seller dashboard with analytics
- [ ] Automatic payouts
- [ ] Dispute resolution
- [ ] Wishlist
- [ ] Product variants

### Phase 3
- [ ] Seller verification
- [ ] Promoted listings
- [ ] Bulk upload
- [ ] API for sellers
- [ ] Mobile app

---

## COMMANDES DE GÉNÉRATION

```bash
# Créer marketplace
/create marketplace MyMarket

# Avec options
/create marketplace MyMarket --with-stripe-connect --with-algolia

# Ajouter features
/generate feature seller-dashboard
/generate feature reviews
/generate feature disputes
```

---

**Version:** 1.0
**Stack:** Next.js 15 + Stripe Connect + Supabase + Algolia
**Temps estimé:** 4-6 heures pour MVP
