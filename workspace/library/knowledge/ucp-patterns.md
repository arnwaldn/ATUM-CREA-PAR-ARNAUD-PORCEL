# Universal Commerce Protocol (UCP) Patterns - ULTRA-CREATE v28.2

> **Source**: github.com/Universal-Commerce-Protocol/ucp (1.9k stars)
> **Spec**: ucp.dev/specification/
> **Status**: Google + Shopify + 20 partenaires (Jan 2026)
> **Charge automatiquement via**: `knowledge-auto-load.js` pour keywords: ucp, agentic commerce

---

## Overview

Universal Commerce Protocol (UCP) est un standard open-source de Google pour le commerce agentique permettant:
- Discovery automatique des capacites marchands via `/.well-known/ucp`
- Checkout sessions autonomes pour agents AI
- Paiements multi-providers (Stripe, Visa, Mastercard, Adyen, AmEx)
- Order tracking temps reel via webhooks

### Partenaires

Co-developpe par **Google + Shopify**, soutenu par:
- **Retailers**: Walmart, Target, Best Buy, Macy's, Home Depot, Wayfair, Etsy, Flipkart, Zalando
- **Paiements**: Stripe, Visa, Mastercard, Adyen, American Express

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    UCP ARCHITECTURE                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│  │ Platform │◄──►│   UCP    │◄──►│ Business │              │
│  │ (Agent)  │    │ Protocol │    │ (Merchant)│              │
│  └──────────┘    └──────────┘    └──────────┘              │
│       │              │                │                      │
│       ▼              ▼                ▼                      │
│  ┌──────────────────────────────────────────┐              │
│  │           TRANSPORT LAYER                 │              │
│  │  REST API | MCP | A2A | Embedded (EP)    │              │
│  └──────────────────────────────────────────┘              │
│       │                                                      │
│       ▼                                                      │
│  ┌──────────────────────────────────────────┐              │
│  │           CAPABILITIES                    │              │
│  │  Checkout | Identity Linking | Order     │              │
│  └──────────────────────────────────────────┘              │
│       │                                                      │
│       ▼                                                      │
│  ┌──────────────────────────────────────────┐              │
│  │           EXTENSIONS                      │              │
│  │  Discounts | Fulfillment | AP2 | Consent │              │
│  └──────────────────────────────────────────┘              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Profile Discovery

Chaque business expose ses capacites a `/.well-known/ucp`:

```json
{
  "version": "2026-01-11",
  "services": [
    {
      "transport": "rest",
      "endpoint": "https://api.merchant.com/ucp/v1",
      "spec": "https://api.merchant.com/ucp/openapi.json"
    },
    {
      "transport": "mcp",
      "endpoint": "https://mcp.merchant.com/ucp"
    }
  ],
  "capabilities": [
    {
      "name": "dev.ucp.shopping.checkout",
      "version": "2026-01-11",
      "spec": "https://ucp.dev/specs/checkout.json",
      "schema": "https://ucp.dev/schemas/checkout.json"
    }
  ],
  "payment": {
    "handlers": [
      {
        "type": "stripe",
        "config": { "publishable_key": "pk_..." }
      }
    ]
  },
  "signing_keys": [{ "kty": "EC", "crv": "P-256", ... }]
}
```

### Transport Bindings

| Transport | Description | Usage |
|-----------|-------------|-------|
| **REST API** | HTTP/JSON standard | Primary, most compatible |
| **MCP** | Model Context Protocol | Agents AI natifs |
| **A2A** | Agent-to-Agent | Multi-agent commerce |
| **EP** | Embedded Protocol | Checkout integre |

---

## Core Capabilities

### 1. Checkout (`dev.ucp.shopping.checkout`)

Gestion des sessions de paiement.

**Endpoints:**
```
POST /checkout-sessions        # Creer session
GET  /checkout-sessions/{id}   # Lire session
PUT  /checkout-sessions/{id}   # Modifier (ajouter items, discounts)
```

**Exemple - Creer Checkout Session:**
```typescript
const session = await ucp.checkout.create({
  buyer: {
    email: "customer@example.com",
    shipping_address: { ... }
  },
  items: [
    { product_id: "prod_123", quantity: 2, price: 2999 }
  ],
  currency: "USD"
});
// Returns: { id: "cs_xxx", total: 5998, status: "pending" }
```

### 2. Identity Linking (`dev.ucp.shopping.identity`)

OAuth 2.0 pour autoriser agents a agir au nom d'utilisateurs.

**Flow:**
1. Agent demande autorisation via OAuth
2. User consent sur merchant UI
3. Agent recoit token avec scopes
4. Agent peut checkout au nom de user

**Scopes disponibles:**
- `checkout:create` - Creer des paniers
- `checkout:complete` - Finaliser paiements
- `orders:read` - Lire historique commandes

### 3. Order (`dev.ucp.shopping.order`)

Webhooks pour lifecycle des commandes.

**Events:**
```typescript
interface OrderWebhook {
  event: 'order.created' | 'order.shipped' | 'order.delivered' | 'order.returned';
  order_id: string;
  timestamp: string;
  data: {
    tracking_number?: string;
    carrier?: string;
    estimated_delivery?: string;
  };
}
```

---

## Extensions

| Extension | Namespace | Description |
|-----------|-----------|-------------|
| **Discounts** | `dev.ucp.shopping.discount` | Coupons et promotions |
| **Fulfillment** | `dev.ucp.shopping.fulfillment` | Livraison et tracking |
| **AP2 Mandate** | `dev.ucp.shopping.ap2_mandate` | Autorisation crypto agents |
| **Buyer Consent** | `dev.ucp.shopping.buyer_consent` | Consentement explicite |

### Extension: Discounts

```typescript
// Appliquer un code promo
await ucp.checkout.update(sessionId, {
  discount: {
    code: "SAVE20",
    type: "percentage",
    value: 20
  }
});
```

### Extension: AP2 Mandate

Autorisation cryptographique pour agents autonomes:

```typescript
const mandate = await ucp.ap2.create({
  agent_id: "agent_xxx",
  max_amount: 10000, // cents
  currency: "USD",
  expiry: "2026-02-01",
  merchant_categories: ["retail", "electronics"]
});
// Agent peut maintenant acheter jusqu'a $100 sans confirmation user
```

---

## Integration Patterns

### Pattern 1: Agent Discovery

```typescript
// 1. Discover merchant capabilities
const profile = await fetch('https://merchant.com/.well-known/ucp')
  .then(r => r.json());

// 2. Check supported capabilities
const hasCheckout = profile.capabilities
  .some(c => c.name === 'dev.ucp.shopping.checkout');

// 3. Get payment handlers
const stripeHandler = profile.payment.handlers
  .find(h => h.type === 'stripe');

// 4. Start interaction
if (hasCheckout && stripeHandler) {
  const session = await createCheckout(profile.services[0].endpoint);
}
```

### Pattern 2: Autonomous Checkout

```typescript
async function autonomousCheckout(merchantUrl: string, items: Item[]) {
  // 1. Discover
  const profile = await discoverUCP(merchantUrl);

  // 2. Create session
  const session = await ucp.checkout.create({
    items,
    buyer: await getBuyerFromIdentityLink()
  });

  // 3. Apply discounts if available
  if (profile.capabilities.includes('dev.ucp.shopping.discount')) {
    await ucp.checkout.applyDiscount(session.id, 'AGENT10');
  }

  // 4. Execute payment via handler
  const handler = profile.payment.handlers[0];
  const paymentResult = await executePayment(handler, session);

  // 5. Confirm order
  return await ucp.checkout.complete(session.id, paymentResult);
}
```

### Pattern 3: MCP Transport

UCP capabilities mappent directement aux MCP tools:

```typescript
// MCP Server exposant UCP
const ucpMcpServer = {
  tools: [
    {
      name: "ucp_checkout_create",
      description: "Create UCP checkout session",
      inputSchema: { /* UCP Checkout Schema */ }
    },
    {
      name: "ucp_checkout_update",
      description: "Update checkout (add items, apply discounts)"
    },
    {
      name: "ucp_checkout_complete",
      description: "Complete checkout with payment"
    },
    {
      name: "ucp_order_status",
      description: "Get order status and tracking"
    }
  ]
};
```

---

## Security

### Authentication

**HTTP Header:**
```
UCP-Agent: profile="https://agent.example.com/.well-known/ucp"
Authorization: Bearer <token>
request-signature: <HMAC-SHA256>
idempotency-key: <uuid>
```

**MCP Metadata:**
```json
{
  "jsonrpc": "2.0",
  "method": "ucp_checkout_create",
  "params": {
    "_meta": {
      "ucp": {
        "profile": "https://agent.example.com/.well-known/ucp"
      }
    },
    "items": [...]
  }
}
```

### Payment Security

1. **Tokenized Payments**: Jamais de credentials brutes
2. **Cryptographic Proof**: Chaque autorisation signee
3. **AP2 Mandates**: Limites pre-approuvees pour agents
4. **Webhook Verification**: Signatures asymetriques (JWK)

---

## SDKs

### Python SDK

```bash
pip install ucp-sdk
```

```python
from ucp_sdk import UCPClient, CheckoutSession

client = UCPClient(merchant_url="https://merchant.com")

# Create checkout
session = await client.checkout.create(
    items=[{"product_id": "prod_123", "quantity": 1}],
    buyer={"email": "customer@example.com"}
)

# Complete with Stripe
result = await client.checkout.complete(
    session_id=session.id,
    payment_handler="stripe",
    payment_token="tok_xxx"
)
```

### TypeScript SDK

```bash
npm install @ucp/sdk
```

```typescript
import { UCPClient } from '@ucp/sdk';

const client = new UCPClient({
  merchantUrl: 'https://merchant.com'
});

// Create checkout
const session = await client.checkout.create({
  items: [{ productId: 'prod_123', quantity: 1 }],
  buyer: { email: 'customer@example.com' }
});

// Complete with payment
const order = await client.checkout.complete(session.id, {
  handler: 'stripe',
  token: 'tok_xxx'
});
```

---

## Integration avec ULTRA-CREATE

### Agents Recommandes

| Agent | Role |
|-------|------|
| `ucp-commerce-expert` | Expert UCP, checkout, identity |
| `stripe-payment-expert` | Handler paiements Stripe |
| `fullstack-super` | Integration complete |
| `security-auditor` | Audit securite transactions |

### Synergie

```json
{
  "agentic-commerce": {
    "primary": ["ucp-commerce-expert", "stripe-payment-expert", "fullstack-super"],
    "mcpsRequired": ["context7", "supabase", "github"]
  }
}
```

### MCPs

| MCP | Usage UCP |
|-----|-----------|
| context7 | Documentation UCP/SDKs |
| supabase | Stockage sessions/orders |
| github | Reference implementations |

---

## Ressources

- **Spec officielle**: https://ucp.dev/specification/
- **GitHub**: https://github.com/Universal-Commerce-Protocol/ucp
- **Python SDK**: https://github.com/Universal-Commerce-Protocol/python-sdk
- **JS SDK**: https://github.com/Universal-Commerce-Protocol/js-sdk
- **Samples**: https://github.com/Universal-Commerce-Protocol/samples
- **Google Guide**: https://developers.google.com/merchant/ucp

---

*v28.2 AGENTIC COMMERCE | UCP Integration | 1.9k GitHub stars | Google + Shopify*
*Charge auto via knowledge-auto-load.js | Synergie: agentic-commerce*
