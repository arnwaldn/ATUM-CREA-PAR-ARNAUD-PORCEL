# Template: E-commerce Application

## Overview

Template complet pour créer une boutique en ligne avec catalogue produits, panier, checkout Stripe, gestion des commandes, et backoffice admin.

---

## STACK TECHNIQUE

| Couche | Technologie | Raison |
|--------|-------------|--------|
| **Framework** | Next.js 15 (App Router) | SSR pour SEO, RSC |
| **Auth** | Clerk (optionnel) | Guest checkout + compte |
| **Database** | Supabase (PostgreSQL) | RLS, Realtime |
| **ORM** | Prisma | Type-safe queries |
| **Payments** | Stripe | Checkout, webhooks |
| **UI** | shadcn/ui + TailwindCSS | E-commerce ready |
| **Images** | Cloudinary / Uploadthing | Optimisation images |
| **Search** | Algolia / Meilisearch | Recherche rapide |
| **Deploy** | Vercel | Edge, ISR |

---

## STRUCTURE PROJET

```
my-store/
├── src/
│   ├── app/
│   │   ├── (store)/                      # Storefront public
│   │   │   ├── page.tsx                  # Homepage
│   │   │   ├── products/
│   │   │   │   ├── page.tsx              # Product listing
│   │   │   │   └── [slug]/page.tsx       # Product detail
│   │   │   ├── categories/
│   │   │   │   └── [slug]/page.tsx       # Category page
│   │   │   ├── cart/page.tsx             # Cart page
│   │   │   ├── checkout/
│   │   │   │   ├── page.tsx              # Checkout form
│   │   │   │   └── success/page.tsx      # Order confirmation
│   │   │   ├── account/
│   │   │   │   ├── page.tsx              # Account overview
│   │   │   │   └── orders/page.tsx       # Order history
│   │   │   └── layout.tsx
│   │   │
│   │   ├── (admin)/                      # Admin backoffice
│   │   │   ├── admin/
│   │   │   │   ├── page.tsx              # Dashboard
│   │   │   │   ├── products/
│   │   │   │   │   ├── page.tsx          # Product list
│   │   │   │   │   ├── new/page.tsx      # Add product
│   │   │   │   │   └── [id]/page.tsx     # Edit product
│   │   │   │   ├── orders/
│   │   │   │   │   ├── page.tsx          # Order list
│   │   │   │   │   └── [id]/page.tsx     # Order detail
│   │   │   │   ├── customers/page.tsx
│   │   │   │   └── settings/page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── api/
│   │   │   ├── webhooks/stripe/route.ts
│   │   │   ├── checkout/route.ts
│   │   │   └── products/route.ts
│   │   │
│   │   ├── layout.tsx
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── ui/                           # shadcn/ui
│   │   ├── store/                        # Storefront
│   │   │   ├── header.tsx
│   │   │   ├── footer.tsx
│   │   │   ├── product-card.tsx
│   │   │   ├── product-gallery.tsx
│   │   │   ├── add-to-cart-button.tsx
│   │   │   ├── cart-sheet.tsx
│   │   │   ├── cart-item.tsx
│   │   │   ├── checkout-form.tsx
│   │   │   ├── category-nav.tsx
│   │   │   └── search-dialog.tsx
│   │   ├── admin/                        # Admin
│   │   │   ├── sidebar.tsx
│   │   │   ├── product-form.tsx
│   │   │   ├── order-status-badge.tsx
│   │   │   └── stats-cards.tsx
│   │   └── shared/
│   │       ├── currency.tsx
│   │       └── image-upload.tsx
│   │
│   ├── lib/
│   │   ├── db.ts
│   │   ├── stripe.ts
│   │   ├── utils.ts
│   │   └── validations/
│   │       ├── product.ts
│   │       └── checkout.ts
│   │
│   ├── hooks/
│   │   └── use-cart.ts
│   │
│   ├── store/
│   │   └── cart-store.ts                 # Zustand cart
│   │
│   └── types/
│       └── index.ts
│
├── prisma/
│   └── schema.prisma
│
├── public/
│   └── images/
│
└── package.json
```

---

## MODÈLES DE DONNÉES

### Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Product {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  description String?  @db.Text
  price       Decimal  @db.Decimal(10, 2)
  comparePrice Decimal? @db.Decimal(10, 2) // Prix barré
  sku         String?  @unique
  stock       Int      @default(0)
  isActive    Boolean  @default(true)
  isFeatured  Boolean  @default(false)

  // SEO
  metaTitle       String?
  metaDescription String?

  // Relations
  categoryId String?
  category   Category? @relation(fields: [categoryId], references: [id])
  images     ProductImage[]
  variants   ProductVariant[]
  orderItems OrderItem[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([categoryId])
  @@index([isActive, isFeatured])
  @@map("products")
}

model ProductImage {
  id        String  @id @default(cuid())
  url       String
  alt       String?
  position  Int     @default(0)
  productId String
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@map("product_images")
}

model ProductVariant {
  id        String  @id @default(cuid())
  name      String  // e.g., "Red / Large"
  sku       String? @unique
  price     Decimal @db.Decimal(10, 2)
  stock     Int     @default(0)
  productId String
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  options VariantOption[]

  @@map("product_variants")
}

model VariantOption {
  id        String         @id @default(cuid())
  name      String         // e.g., "Color"
  value     String         // e.g., "Red"
  variantId String
  variant   ProductVariant @relation(fields: [variantId], references: [id], onDelete: Cascade)

  @@map("variant_options")
}

model Category {
  id          String  @id @default(cuid())
  name        String
  slug        String  @unique
  description String?
  imageUrl    String?
  parentId    String?
  parent      Category?  @relation("CategoryTree", fields: [parentId], references: [id])
  children    Category[] @relation("CategoryTree")
  products    Product[]

  @@map("categories")
}

model Customer {
  id        String   @id @default(cuid())
  clerkId   String?  @unique // Si auth Clerk
  email     String   @unique
  firstName String?
  lastName  String?
  phone     String?

  addresses Address[]
  orders    Order[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("customers")
}

model Address {
  id         String  @id @default(cuid())
  firstName  String
  lastName   String
  company    String?
  address1   String
  address2   String?
  city       String
  state      String?
  postalCode String
  country    String  @default("FR")
  phone      String?
  isDefault  Boolean @default(false)

  customerId String
  customer   Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)

  @@map("addresses")
}

model Order {
  id              String      @id @default(cuid())
  orderNumber     String      @unique
  status          OrderStatus @default(PENDING)

  // Stripe
  stripeSessionId String?     @unique
  stripePaymentId String?

  // Totals
  subtotal        Decimal     @db.Decimal(10, 2)
  shippingCost    Decimal     @db.Decimal(10, 2) @default(0)
  tax             Decimal     @db.Decimal(10, 2) @default(0)
  discount        Decimal     @db.Decimal(10, 2) @default(0)
  total           Decimal     @db.Decimal(10, 2)

  // Addresses (stored as JSON for history)
  shippingAddress Json
  billingAddress  Json?

  // Customer
  customerId String?
  customer   Customer? @relation(fields: [customerId], references: [id])
  email      String    // Guest checkout email

  // Items
  items OrderItem[]

  notes     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([status])
  @@index([customerId])
  @@map("orders")
}

model OrderItem {
  id        String @id @default(cuid())
  quantity  Int
  price     Decimal @db.Decimal(10, 2)

  // Product snapshot (au cas où produit supprimé)
  productName String
  productSku  String?
  variantName String?

  orderId   String
  order     Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId String?
  product   Product? @relation(fields: [productId], references: [id], onDelete: SetNull)

  @@map("order_items")
}

enum OrderStatus {
  PENDING
  PAID
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
  REFUNDED
}
```

---

## COMPOSANTS CLÉS

### 1. Cart Store (Zustand)

```typescript
// src/store/cart-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CartItem {
  id: string
  productId: string
  variantId?: string
  name: string
  price: number
  quantity: number
  image: string
  variant?: string
}

interface CartStore {
  items: CartItem[]
  isOpen: boolean

  // Actions
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void

  // Computed
  itemCount: () => number
  subtotal: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) => set((state) => {
        const existingIndex = state.items.findIndex(
          (i) => i.productId === item.productId && i.variantId === item.variantId
        )

        if (existingIndex > -1) {
          const newItems = [...state.items]
          newItems[existingIndex].quantity += 1
          return { items: newItems, isOpen: true }
        }

        return {
          items: [...state.items, { ...item, quantity: 1 }],
          isOpen: true,
        }
      }),

      removeItem: (id) => set((state) => ({
        items: state.items.filter((item) => item.id !== id),
      })),

      updateQuantity: (id, quantity) => set((state) => ({
        items: quantity > 0
          ? state.items.map((item) =>
              item.id === id ? { ...item, quantity } : item
            )
          : state.items.filter((item) => item.id !== id),
      })),

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      itemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: () =>
        get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    }),
    {
      name: 'cart-storage',
    }
  )
)
```

### 2. Product Card

```tsx
// src/components/store/product-card.tsx
import Image from "next/image"
import Link from "next/link"
import { formatPrice } from "@/lib/utils"
import { AddToCartButton } from "./add-to-cart-button"

interface ProductCardProps {
  product: {
    id: string
    slug: string
    name: string
    price: number
    comparePrice?: number | null
    images: { url: string; alt?: string }[]
    stock: number
  }
}

export function ProductCard({ product }: ProductCardProps) {
  const isOnSale = product.comparePrice && product.comparePrice > product.price
  const isOutOfStock = product.stock === 0

  return (
    <div className="group relative">
      {/* Image */}
      <Link href={`/products/${product.slug}`}>
        <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
          <Image
            src={product.images[0]?.url || "/placeholder.png"}
            alt={product.images[0]?.alt || product.name}
            width={400}
            height={400}
            className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </Link>

      {/* Badges */}
      <div className="absolute top-2 left-2 flex flex-col gap-1">
        {isOnSale && (
          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
            Sale
          </span>
        )}
        {isOutOfStock && (
          <span className="bg-gray-800 text-white text-xs px-2 py-1 rounded">
            Out of Stock
          </span>
        )}
      </div>

      {/* Info */}
      <div className="mt-4 space-y-1">
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-sm font-medium text-gray-900 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold">
            {formatPrice(product.price)}
          </span>
          {isOnSale && (
            <span className="text-sm text-gray-500 line-through">
              {formatPrice(product.comparePrice!)}
            </span>
          )}
        </div>
      </div>

      {/* Quick Add */}
      <div className="mt-3">
        <AddToCartButton
          product={{
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.images[0]?.url || "",
          }}
          disabled={isOutOfStock}
        />
      </div>
    </div>
  )
}
```

### 3. Checkout API Route

```typescript
// src/app/api/checkout/route.ts
import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { db } from "@/lib/db"
import { z } from "zod"

const checkoutSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    variantId: z.string().optional(),
    quantity: z.number().min(1),
  })),
  email: z.string().email(),
  shippingAddress: z.object({
    firstName: z.string(),
    lastName: z.string(),
    address1: z.string(),
    city: z.string(),
    postalCode: z.string(),
    country: z.string(),
  }),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = checkoutSchema.parse(body)

    // Récupérer les produits
    const products = await db.product.findMany({
      where: {
        id: { in: data.items.map((i) => i.productId) },
        isActive: true,
      },
      include: { images: true },
    })

    // Vérifier stock et construire line items
    const lineItems: any[] = []
    let subtotal = 0

    for (const item of data.items) {
      const product = products.find((p) => p.id === item.productId)
      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.productId} not found` },
          { status: 400 }
        )
      }
      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `${product.name} is out of stock` },
          { status: 400 }
        )
      }

      const price = Number(product.price)
      subtotal += price * item.quantity

      lineItems.push({
        price_data: {
          currency: "eur",
          product_data: {
            name: product.name,
            images: product.images.slice(0, 1).map((i) => i.url),
          },
          unit_amount: Math.round(price * 100), // Stripe en centimes
        },
        quantity: item.quantity,
      })
    }

    // Créer session Stripe
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      customer_email: data.email,
      shipping_address_collection: {
        allowed_countries: ["FR", "BE", "CH", "CA"],
      },
      metadata: {
        items: JSON.stringify(data.items),
        email: data.email,
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Checkout error:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Checkout failed" },
      { status: 500 }
    )
  }
}
```

### 4. Stripe Webhook

```typescript
// src/app/api/webhooks/stripe/route.ts
import { headers } from "next/headers"
import { NextResponse } from "next/server"
import Stripe from "stripe"
import { db } from "@/lib/db"
import { stripe } from "@/lib/stripe"
import { generateOrderNumber } from "@/lib/utils"

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get("Stripe-Signature")!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    console.error("Webhook signature verification failed:", error)
    return new NextResponse("Webhook Error", { status: 400 })
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session

    // Parse items from metadata
    const items = JSON.parse(session.metadata?.items || "[]")
    const email = session.metadata?.email || session.customer_email!

    // Récupérer les produits pour les détails
    const products = await db.product.findMany({
      where: { id: { in: items.map((i: any) => i.productId) } },
    })

    // Calculer totaux
    let subtotal = 0
    const orderItems = items.map((item: any) => {
      const product = products.find((p) => p.id === item.productId)!
      const price = Number(product.price)
      subtotal += price * item.quantity

      return {
        quantity: item.quantity,
        price: price,
        productName: product.name,
        productSku: product.sku,
        productId: product.id,
      }
    })

    // Créer la commande
    const order = await db.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        status: "PAID",
        stripeSessionId: session.id,
        stripePaymentId: session.payment_intent as string,
        email,
        subtotal,
        total: session.amount_total! / 100,
        shippingAddress: session.shipping_details?.address as any || {},
        items: {
          create: orderItems,
        },
      },
    })

    // Décrémenter le stock
    for (const item of items) {
      await db.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      })
    }

    // TODO: Envoyer email de confirmation

    console.log(`Order ${order.orderNumber} created`)
  }

  return new NextResponse(null, { status: 200 })
}
```

---

## FEATURES INCLUSES

### MVP (Phase 1)
- [x] Catalogue produits avec listing et détail
- [x] Catégories et navigation
- [x] Panier persistant (localStorage)
- [x] Checkout Stripe (guest)
- [x] Page confirmation commande
- [x] Webhooks paiement

### Phase 2
- [ ] Compte client avec historique
- [ ] Recherche produits (Algolia)
- [ ] Filtres et tri avancés
- [ ] Variants produits (taille, couleur)
- [ ] Wishlist

### Phase 3 (Admin)
- [ ] Dashboard admin avec stats
- [ ] CRUD produits avec images
- [ ] Gestion commandes
- [ ] Gestion stock
- [ ] Exports CSV

### Phase 4
- [ ] Codes promo
- [ ] Avis produits
- [ ] Recommandations
- [ ] Multi-devise
- [ ] Inventory alerts

---

## CONFIGURATION

### Environment Variables

```env
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_STORE_NAME="My Store"

# Database
DATABASE_URL=postgresql://...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Cloudinary (images)
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Optional: Search
ALGOLIA_APP_ID=...
ALGOLIA_SEARCH_KEY=...
ALGOLIA_ADMIN_KEY=...
```

---

## COMMANDES DE GÉNÉRATION

```bash
# Créer une boutique e-commerce
/create ecommerce MaBoutique

# Avec options
/create ecommerce MaBoutique --with-admin --with-search

# Ajouter features
/generate feature product-variants
/generate feature reviews
/generate feature promo-codes
```

---

**Version:** 1.0
**Stack:** Next.js 15 + Stripe + Supabase
**Temps estimé:** 3-5 heures pour MVP
