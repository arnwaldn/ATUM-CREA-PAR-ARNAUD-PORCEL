# Universal Commerce Protocol (UCP) - Patterns pour ATUM CREA

> **Source** : https://github.com/Universal-Commerce-Protocol/ucp | https://ucp.dev
> **Version spec** : 2026-01-11 (draft)
> **Licence** : Apache 2.0
> **Pertinence** : E-commerce, AI agents, SaaS marketplace, commerce agentique

---

## 1. Vue d'Ensemble

UCP est un protocole ouvert qui standardise les interactions commerciales entre
plateformes (agents IA, apps), commercants, prestataires de paiement (PSP) et
fournisseurs de credentials (CP). C'est le **HTTP du commerce agentique**.

### Quand utiliser UCP

| Contexte | UCP ? | Alternative |
|----------|-------|-------------|
| E-commerce classique (1 site, 1 PSP) | Non | Stripe direct (`stripe-patterns.md`) |
| Agent IA qui achete pour l'utilisateur | **Oui** | Rien d'equivalent |
| Marketplace multi-vendeurs | **Oui** | Stripe Connect seul |
| Commerce interoperable (multi-PSP, multi-plateforme) | **Oui** | Integrations custom |
| SaaS avec composante achat autonome | **Oui** | Stripe + custom |

### Constructs fondamentaux

```
Capabilities  = fonctionnalites qu'un business supporte (Checkout, Cart, Order)
Extensions    = modules optionnels qui augmentent une Capability (Discounts, Fulfillment)
Services      = couches de transport (REST, MCP, A2A, Embedded)
```

---

## 2. Architecture & Acteurs

```
┌─────────────────┐         ┌──────────────┐
│   Platform       │◄───────►│   Business    │
│ (Agent IA, App)  │         │ (Merchant)    │
│                  │         │ MoR (Merchant │
│ Decouvre,        │         │ of Record)    │
│ achete pour      │         │               │
│ l'utilisateur    │         │ Expose ses    │
└────────┬────────┘         │ capabilities  │
         │                   └──────┬───────┘
         │                          │
         ▼                          ▼
┌─────────────────┐         ┌──────────────┐
│ Credential       │         │ Payment       │
│ Provider (CP)    │         │ Service       │
│                  │         │ Provider (PSP)│
│ Google Pay,      │         │ Stripe,       │
│ Apple Pay,       │         │ Adyen,        │
│ Shop Pay         │         │ PayPal        │
└─────────────────┘         └──────────────┘
```

**Trust Triangle** :
1. Business <-> PSP : relation legale/technique preexistante (cles API, contrat)
2. Platform <-> CP : tokenise les credentials (jamais de donnees brutes)
3. Platform <-> Business : passe le token opaque, jamais de PAN brut

---

## 3. Discovery : .well-known/ucp

Chaque business expose un profil JSON a `/.well-known/ucp` :

```json
{
  "ucp": {
    "version": "2026-01-11",
    "services": {
      "dev.ucp.shopping": [
        {
          "version": "2026-01-11",
          "spec": "https://ucp.dev/specification/overview",
          "transport": "rest",
          "schema": "https://ucp.dev/services/shopping/rest.openapi.json",
          "endpoint": "https://mybusiness.com/ucp/v1"
        },
        {
          "version": "2026-01-11",
          "spec": "https://ucp.dev/specification/overview",
          "transport": "mcp",
          "schema": "https://ucp.dev/services/shopping/mcp.openrpc.json",
          "endpoint": "https://mybusiness.com/ucp/mcp"
        }
      ]
    },
    "capabilities": {
      "dev.ucp.shopping.checkout": [
        {
          "version": "2026-01-11",
          "spec": "https://ucp.dev/specification/checkout",
          "schema": "https://ucp.dev/schemas/shopping/checkout.json"
        }
      ],
      "dev.ucp.shopping.fulfillment": [
        {
          "version": "2026-01-11",
          "spec": "https://ucp.dev/specification/fulfillment",
          "schema": "https://ucp.dev/schemas/shopping/fulfillment.json",
          "extends": "dev.ucp.shopping.checkout"
        }
      ]
    },
    "payment_handlers": {
      "com.example.processor_tokenizer": [
        {
          "id": "processor_tokenizer",
          "version": "2026-01-11",
          "config": {
            "type": "CARD",
            "tokenization_specification": {
              "type": "PUSH",
              "parameters": {
                "token_retrieval_url": "https://api.psp.example.com/v1/tokens"
              }
            }
          }
        }
      ]
    }
  },
  "signing_keys": [
    {
      "kid": "business_2025",
      "kty": "EC",
      "crv": "P-256",
      "x": "WbbX...",
      "y": "sP4j...",
      "use": "sig",
      "alg": "ES256"
    }
  ]
}
```

### Namespace Governance

Format : `{reverse-domain}.{service}.{capability}`

| Nom | Autorite | Service | Capability |
|-----|----------|---------|------------|
| `dev.ucp.shopping.checkout` | ucp.dev | shopping | checkout |
| `dev.ucp.common.identity_linking` | ucp.dev | common | identity_linking |
| `com.stripe.payments.installments` | stripe.com | payments | installments |

---

## 4. Negotiation de Capabilities

### Algorithme d'intersection

```text
1. POUR CHAQUE capability du business:
   SI la platform a une capability avec le meme nom → inclure

2. ELAGUER les extensions orphelines:
   SI extends pointe vers une capability absente de l'intersection → retirer
   (multi-parent: au moins 1 parent doit etre present)

3. REPETER etape 2 jusqu'a stabilite (chaines transitives)
```

### Header de requete Platform

```http
POST /checkout-sessions HTTP/1.1
UCP-Agent: profile="https://agent.example/profiles/shopping-agent.json"
Content-Type: application/json
```

### Codes d'erreur negotiation

| Code | Description | REST | MCP |
|------|-------------|------|-----|
| `invalid_profile_url` | URL profil malformee | 400 | -32001 |
| `profile_unreachable` | Fetch echoue | 424 | -32001 |
| `profile_malformed` | JSON invalide | 422 | -32001 |
| `capabilities_incompatible` | Intersection vide | 200 | result |
| `version_unsupported` | Version non supportee | 200 | result |

### Fallback : continue_url

Quand la negotiation echoue, le business fournit `continue_url` pour rediriger
vers l'interface web classique. Degradation gracieuse.

---

## 5. Checkout Lifecycle

### Machine a etats

```
incomplete ◄──► requires_escalation
    │                    │
    │                    │ (continue_url → buyer handoff)
    ▼                    │
ready_for_complete       │
    │                    │
    │ complete_checkout  │
    ▼                    │
complete_in_progress ────┘
    │
    ▼
completed

canceled  (depuis n'importe quel etat non-terminal)
```

### Operations REST

| Operation | Methode | Path | Description |
|-----------|---------|------|-------------|
| Create Checkout | POST | `/checkout-sessions` | Initie session |
| Get Checkout | GET | `/checkout-sessions/{id}` | Etat courant |
| Update Checkout | PUT | `/checkout-sessions/{id}` | Remplacement complet |
| Complete Checkout | POST | `/checkout-sessions/{id}/complete` | Place la commande |
| Cancel Checkout | POST | `/checkout-sessions/{id}/cancel` | Annule |

### Gestion des erreurs (messages array)

```json
{
  "status": "requires_escalation",
  "messages": [
    {
      "type": "error",
      "code": "invalid_phone",
      "severity": "recoverable",
      "content": "Phone number format is invalid"
    },
    {
      "type": "error",
      "code": "schedule_delivery",
      "severity": "requires_buyer_input",
      "content": "Select delivery window"
    }
  ],
  "continue_url": "https://merchant.com/checkout/abc123"
}
```

**Severites** :
- `recoverable` → Platform corrige via Update Checkout
- `requires_buyer_input` → Checkout incomplet, handoff buyer via continue_url
- `requires_buyer_review` → Checkout complet mais autorisation buyer requise

### Algorithme de traitement erreurs

```text
FILTRER errors DEPUIS messages OU type = "error"

PARTITIONNER errors EN
  recoverable           OU severity = "recoverable"
  requires_buyer_input  OU severity = "requires_buyer_input"
  requires_buyer_review OU severity = "requires_buyer_review"

SI recoverable non vide
  POUR CHAQUE error DANS recoverable
    TENTER correction (ex: reformater telephone)
  APPELER Update Checkout
  RETOURNER et re-evaluer

SI requires_buyer_input non vide
  handoff = "incomplete, input additionnel requis"
SINON SI requires_buyer_review non vide
  handoff = "pret pour review finale du buyer"
```

---

## 6. Cart Capability

Panier leger AVANT l'intention d'achat. CRUD simple sans payment handlers.

| Aspect | Cart | Checkout |
|--------|------|----------|
| But | Exploration pre-achat | Finalisation achat |
| Payment | Aucun | Requis |
| Status | Binaire (existe/pas) | Lifecycle complet |
| Totaux | Estimations | Prix finaux |

### Conversion Cart → Checkout

```json
POST /checkout-sessions
{
  "cart_id": "cart_abc123",
  "line_items": []
}
```

Le business utilise le contenu du cart et ignore les champs overlapping du payload checkout.
Conversion idempotente : si un checkout existe deja pour ce cart_id, retourne l'existant.

---

## 7. Payment Architecture

### Cycle de paiement en 3 etapes

```
1. NEGOCIATION (Business → Platform)
   Business annonce ses payment handlers dans le profil UCP

2. ACQUISITION (Platform ↔ Credential Provider)
   Platform tokenise les credentials cote client
   Le business n'est PAS implique (PCI scope minimise)

3. COMPLETION (Platform → Business)
   Platform envoie le token opaque au business
   Business charge via son PSP backend
```

### Stripe comme Payment Handler UCP

```json
{
  "ucp": {
    "payment_handlers": {
      "com.stripe.checkout": [
        {
          "id": "stripe_handler_1",
          "version": "2026-01-11",
          "config": {
            "publishable_key": "pk_live_xxx",
            "payment_method_types": ["card", "sepa_debit"],
            "environment": "production"
          }
        }
      ]
    }
  }
}
```

### Google Pay comme Payment Handler

```json
{
  "ucp": {
    "payment_handlers": {
      "com.google.pay": [
        {
          "id": "gpay_handler",
          "version": "2026-01-11",
          "config": {
            "api_version": 2,
            "environment": "PRODUCTION",
            "merchant_info": {
              "merchant_name": "Mon Commerce",
              "merchant_id": "01234567890"
            },
            "allowed_payment_methods": [
              {
                "type": "CARD",
                "parameters": {
                  "allowed_auth_methods": ["PAN_ONLY", "CRYPTOGRAM_3DS"],
                  "allowed_card_networks": ["VISA", "MASTERCARD"]
                },
                "tokenization_specification": {
                  "type": "PAYMENT_GATEWAY",
                  "parameters": {
                    "gateway": "stripe",
                    "gatewayMerchantId": "acct_xxx"
                  }
                }
              }
            ]
          }
        }
      ]
    }
  }
}
```

### Complete Checkout avec payment instrument

```json
POST /checkout-sessions/{id}/complete
{
  "payment": {
    "instruments": [
      {
        "id": "pm_1234567890abc",
        "handler_id": "gpay_handler",
        "type": "card",
        "selected": true,
        "display": {
          "brand": "visa",
          "last_digits": "4242"
        },
        "billing_address": {
          "street_address": "123 Main Street",
          "address_locality": "Paris",
          "postal_code": "75001",
          "address_country": "FR",
          "first_name": "Jean",
          "last_name": "Dupont"
        },
        "credential": {
          "type": "PAYMENT_GATEWAY",
          "token": "{\"signature\":\"...\",\"protocolVersion\":\"ECv2\"...}"
        }
      }
    ]
  },
  "risk_signals": {
    "session_id": "abc_123_xyz",
    "score": 0.95
  }
}
```

### PCI-DSS Scope

| Role | Scope PCI | Comment |
|------|-----------|---------|
| Platform | Evitable | Utilise tokens opaques, jamais de PAN |
| Business | Minimise | Tokenisation PSP, credentials chiffrees |
| CP/PSP | Level 1 | Gere les credentials brutes |

---

## 8. MCP Transport Binding (Agent IA)

**Section la plus critique pour ATUM CREA.** Les capabilities UCP mappent 1:1 vers des MCP Tools.

### Tools MCP pour Checkout

| Tool | Operation | Description |
|------|-----------|-------------|
| `create_checkout` | Create Checkout | Cree une session |
| `get_checkout` | Get Checkout | Recupere l'etat |
| `update_checkout` | Update Checkout | Met a jour |
| `complete_checkout` | Complete Checkout | Place la commande |
| `cancel_checkout` | Cancel Checkout | Annule |

### Requete MCP create_checkout

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "create_checkout",
    "arguments": {
      "meta": {
        "ucp-agent": {
          "profile": "https://myagent.com/profiles/shopping-agent.json"
        }
      },
      "checkout": {
        "buyer": {
          "email": "user@example.com",
          "first_name": "Jean",
          "last_name": "Dupont"
        },
        "line_items": [
          {
            "item": { "id": "item_123" },
            "quantity": 1
          }
        ],
        "currency": "EUR",
        "fulfillment": {
          "methods": [
            {
              "type": "shipping",
              "destinations": [
                {
                  "street_address": "42 Rue de Rivoli",
                  "address_locality": "Paris",
                  "postal_code": "75001",
                  "address_country": "FR"
                }
              ]
            }
          ]
        }
      }
    }
  }
}
```

### Reponse MCP (dual output pattern)

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "structuredContent": {
      "checkout": {
        "ucp": {
          "version": "2026-01-11",
          "capabilities": {
            "dev.ucp.shopping.checkout": [{"version": "2026-01-11"}],
            "dev.ucp.shopping.fulfillment": [{"version": "2026-01-11"}]
          },
          "payment_handlers": {
            "com.stripe.checkout": [
              {"id": "stripe_handler_1", "version": "2026-01-11", "config": {}}
            ]
          }
        },
        "id": "checkout_abc123",
        "status": "incomplete",
        "buyer": {"email": "user@example.com"},
        "line_items": [...],
        "totals": [
          {"type": "subtotal", "amount": 5000},
          {"type": "fulfillment", "amount": 500},
          {"type": "total", "amount": 5500}
        ],
        "continue_url": "https://business.com/checkout/checkout_abc123",
        "expires_at": "2026-01-11T18:30:00Z"
      }
    },
    "content": [
      {"type": "text", "text": "{\"checkout\":{...}}"}
    ]
  }
}
```

### Requete MCP complete_checkout (avec idempotency)

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "complete_checkout",
    "arguments": {
      "meta": {
        "ucp-agent": {"profile": "https://myagent.com/profiles/agent.json"},
        "idempotency-key": "550e8400-e29b-41d4-a716-446655440000"
      },
      "id": "checkout_abc123",
      "checkout": {
        "payment": {
          "instruments": [
            {
              "handler_id": "stripe_handler_1",
              "type": "card",
              "selected": true,
              "credential": {"token": "tok_visa_xxx"}
            }
          ]
        }
      }
    }
  }
}
```

### Tools MCP pour Cart

| Tool | Operation |
|------|-----------|
| `create_cart` | Create Cart |
| `get_cart` | Get Cart |
| `update_cart` | Update Cart |
| `cancel_cart` | Cancel Cart |

---

## 9. Identity Linking (OAuth 2.0)

Permet a une Platform d'agir au nom de l'utilisateur chez un Business.

### Discovery OAuth

Business expose `/.well-known/oauth-authorization-server` (RFC 8414) :

```json
{
  "issuer": "https://merchant.example.com",
  "authorization_endpoint": "https://merchant.example.com/oauth2/authorize",
  "token_endpoint": "https://merchant.example.com/oauth2/token",
  "revocation_endpoint": "https://merchant.example.com/oauth2/revoke",
  "scopes_supported": [
    "ucp:scopes:checkout_session"
  ],
  "response_types_supported": ["code"],
  "grant_types_supported": ["authorization_code", "refresh_token"],
  "token_endpoint_auth_methods_supported": ["client_secret_basic"]
}
```

### Scopes UCP

| Resource | Scope | Operations |
|----------|-------|------------|
| CheckoutSession | `ucp:scopes:checkout_session` | Get, Create, Update, Delete, Cancel, Complete |

Un scope par capability couvre TOUTES les operations de cette capability.

### Flow

```
1. Platform redirige user vers authorization_endpoint du Business
2. User se connecte/cree un compte chez le Business
3. Business redirige vers Platform avec authorization_code
4. Platform echange code → access_token + refresh_token
5. Platform utilise Bearer token dans les requetes UCP
```

---

## 10. Implementation Business (Next.js + Stripe)

### API Route : .well-known/ucp

```typescript
// app/.well-known/ucp/route.ts
import { NextResponse } from 'next/server';

const UCP_VERSION = '2026-01-11';

export async function GET() {
  return NextResponse.json({
    ucp: {
      version: UCP_VERSION,
      services: {
        'dev.ucp.shopping': [
          {
            version: UCP_VERSION,
            spec: 'https://ucp.dev/specification/overview',
            transport: 'rest',
            schema: 'https://ucp.dev/services/shopping/rest.openapi.json',
            endpoint: `${process.env.NEXT_PUBLIC_APP_URL}/api/ucp/v1`,
          },
        ],
      },
      capabilities: {
        'dev.ucp.shopping.checkout': [
          {
            version: UCP_VERSION,
            spec: 'https://ucp.dev/specification/checkout',
            schema: 'https://ucp.dev/schemas/shopping/checkout.json',
          },
        ],
      },
      payment_handlers: {
        'com.stripe.checkout': [
          {
            id: 'stripe_main',
            version: UCP_VERSION,
            config: {
              publishable_key: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
              payment_method_types: ['card'],
            },
          },
        ],
      },
    },
  });
}
```

### API Route : Checkout Session CRUD

```typescript
// app/api/ucp/v1/checkout-sessions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const UCP_VERSION = '2026-01-11';

// Valider le profil platform
async function validatePlatformProfile(request: NextRequest) {
  const ucpAgent = request.headers.get('UCP-Agent');
  if (!ucpAgent) return null;

  const profileMatch = ucpAgent.match(/profile="([^"]+)"/);
  if (!profileMatch) return null;

  try {
    const response = await fetch(profileMatch[1]);
    return await response.json();
  } catch {
    return null;
  }
}

// POST /api/ucp/v1/checkout-sessions
export async function POST(request: NextRequest) {
  const platformProfile = await validatePlatformProfile(request);
  if (!platformProfile) {
    return NextResponse.json(
      { code: 'invalid_profile_url', content: 'Missing or invalid UCP-Agent header' },
      { status: 400 }
    );
  }

  const body = await request.json();
  const { line_items, buyer, currency, fulfillment } = body;

  // Creer session en DB
  const { data: checkout, error } = await supabase
    .from('ucp_checkouts')
    .insert({
      status: 'incomplete',
      buyer,
      line_items,
      currency: currency || 'EUR',
      fulfillment,
      platform_profile: platformProfile,
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30min
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Calculer totaux
  const totals = calculateTotals(checkout.line_items, checkout.fulfillment);

  return NextResponse.json({
    ucp: {
      version: UCP_VERSION,
      capabilities: {
        'dev.ucp.shopping.checkout': [{ version: UCP_VERSION }],
      },
      payment_handlers: {
        'com.stripe.checkout': [
          {
            id: 'stripe_main',
            version: UCP_VERSION,
            config: {
              publishable_key: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
            },
          },
        ],
      },
    },
    id: checkout.id,
    status: checkout.status,
    buyer: checkout.buyer,
    line_items: checkout.line_items,
    currency: checkout.currency,
    totals,
    continue_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/${checkout.id}`,
    expires_at: checkout.expires_at,
  }, { status: 201 });
}

function calculateTotals(lineItems: any[], fulfillment?: any) {
  const subtotal = lineItems.reduce(
    (sum: number, item: any) => sum + (item.item?.price || 0) * (item.quantity || 1),
    0
  );
  const shipping = fulfillment ? 500 : 0; // 5.00 EUR par defaut
  return [
    { type: 'subtotal', amount: subtotal },
    ...(shipping > 0 ? [{ type: 'fulfillment', display_text: 'Livraison', amount: shipping }] : []),
    { type: 'total', amount: subtotal + shipping },
  ];
}
```

### Schema Supabase pour UCP

```sql
-- Migration: create_ucp_checkouts
CREATE TABLE ucp_checkouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'incomplete'
    CHECK (status IN ('incomplete', 'requires_escalation', 'ready_for_complete',
                      'complete_in_progress', 'completed', 'canceled')),
  buyer JSONB,
  line_items JSONB NOT NULL DEFAULT '[]',
  currency TEXT NOT NULL DEFAULT 'EUR',
  fulfillment JSONB,
  payment JSONB,
  totals JSONB,
  order_confirmation JSONB,
  platform_profile JSONB,
  messages JSONB DEFAULT '[]',
  continue_url TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ucp_checkouts_status ON ucp_checkouts(status);
CREATE INDEX idx_ucp_checkouts_expires ON ucp_checkouts(expires_at);

ALTER TABLE ucp_checkouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow API insert" ON ucp_checkouts
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow API select" ON ucp_checkouts
  FOR SELECT USING (true);
CREATE POLICY "Allow API update" ON ucp_checkouts
  FOR UPDATE USING (true);
```

---

## 11. Implementation Agent (AI Commerce via MCP)

### Flow complet agent IA

```
1. DISCOVERY
   Agent fetch /.well-known/ucp du business
   Agent identifie les capabilities supportees

2. NEGOTIATION
   Agent inclut son profil dans chaque requete
   Business calcule l'intersection des capabilities

3. CART BUILDING (optionnel)
   Agent appelle create_cart, update_cart
   Exploration, comparaison de prix

4. CHECKOUT
   Agent appelle create_checkout avec line_items
   Agent traite les messages d'erreur (severity: recoverable)
   Agent appelle update_checkout si corrections necessaires

5. PAYMENT
   Agent identifie le payment handler dans la reponse
   Agent obtient un token via le Credential Provider
   Agent appelle complete_checkout avec le token

6. HANDOFF (si requis)
   Si status = requires_escalation → ouvrir continue_url pour le buyer
   Le buyer complete dans l'interface business

7. ORDER
   Agent recoit order_confirmation avec id et permalink_url
   Agent notifie l'utilisateur
```

### Agent Platform Profile

```json
{
  "ucp": {
    "version": "2026-01-11",
    "services": {
      "dev.ucp.shopping": [
        {
          "version": "2026-01-11",
          "spec": "https://ucp.dev/specification/overview",
          "transport": "mcp",
          "schema": "https://ucp.dev/services/shopping/mcp.openrpc.json"
        }
      ]
    },
    "capabilities": {
      "dev.ucp.shopping.checkout": [
        {
          "version": "2026-01-11",
          "spec": "https://ucp.dev/specification/checkout",
          "schema": "https://ucp.dev/schemas/shopping/checkout.json"
        }
      ],
      "dev.ucp.shopping.cart": [
        {
          "version": "2026-01-11",
          "spec": "https://ucp.dev/specification/cart",
          "schema": "https://ucp.dev/schemas/shopping/cart.json"
        }
      ],
      "dev.ucp.shopping.order": [
        {
          "version": "2026-01-11",
          "spec": "https://ucp.dev/specification/order",
          "schema": "https://ucp.dev/schemas/shopping/order.json",
          "config": {
            "webhook_url": "https://myagent.com/webhooks/ucp/orders"
          }
        }
      ]
    },
    "payment_handlers": {
      "com.google.pay": [
        {
          "id": "gpay_1234",
          "version": "2026-01-11",
          "spec": "https://developers.google.com/merchant/ucp/guides/gpay-payment-handler"
        }
      ]
    }
  }
}
```

### Challenge 3DS (SCA)

Si le business retourne un challenge :

```json
{
  "status": "requires_escalation",
  "messages": [{
    "type": "error",
    "code": "requires_3ds",
    "content": "Bank requires verification.",
    "severity": "requires_buyer_input"
  }],
  "continue_url": "https://psp.com/challenge/123"
}
```

L'agent DOIT ouvrir `continue_url` dans une WebView pour que le buyer complete la verification, puis re-tenter complete_checkout.

---

## 12. AP2 Mandates (Commerce Autonome)

Pour les agents 100% autonomes qui achetent SANS intervention humaine :

```json
POST /checkout-sessions/{id}/complete
{
  "payment": {
    "instruments": [
      {
        "handler_id": "ap2_handler",
        "credential": {
          "type": "card",
          "token": "eyJhbGciOiJ..."
        }
      }
    ]
  },
  "ap2": {
    "checkout_mandate": "eyJhbGciOiJ..."
  },
  "risk_signals": {
    "session_id": "abc_123_xyz",
    "score": 0.95
  }
}
```

Le `checkout_mandate` est signe cryptographiquement avec la cle privee de l'utilisateur.
Fournit une preuve non-repudiable que l'utilisateur a autorise cette transaction.

---

## 13. Securite

### Best Practices Business

1. Valider `handler_id` avant traitement (doit etre dans le set annonce)
2. Credentials TEST vs PRODUCTION separees
3. Idempotency pour le traitement des paiements
4. Logger les events sans logger les credentials
5. Timeout sur les credentials
6. HTTPS obligatoire sur toutes les communications

### Best Practices Platform/Agent

1. Toujours HTTPS pour les appels API
2. Valider les configs handler avant execution
3. Timeout handling pour l'acquisition de credentials
4. Nettoyer les credentials de la memoire apres soumission
5. Gerer l'expiration des credentials (re-acquerir si necessaire)

### Versioning

Format date : `YYYY-MM-DD`. Backwards-compatible par defaut.
- Platform version <= Business version → Business DOIT traiter
- Platform version > Business version → `version_unsupported` error

---

## 14. Mapping Type Projet ATUM CREA → UCP

| Type Projet | Role UCP | Capabilities a implementer | Priorite |
|-------------|----------|---------------------------|----------|
| E-commerce (template ecommerce/) | **Business** | Checkout, Cart, Order, Fulfillment | HAUTE |
| SaaS Marketplace | **Business** | Checkout, Identity Linking | HAUTE |
| AI Agent Shopping | **Platform/Agent** | Checkout (MCP), Cart (MCP), Order | HAUTE |
| AI Assistant General | **Platform/Agent** | Checkout (MCP) | MOYENNE |
| Landing Page | Aucun | - | BASSE |
| Dashboard | Aucun (sauf admin UCP) | - | BASSE |
| Mobile E-commerce | **Business** (REST) | Checkout, Cart | MOYENNE |

### Integration avec patterns existants

| Pattern ATUM CREA | Integration UCP |
|-------------------|-----------------|
| `stripe-patterns.md` | Stripe devient un Payment Handler dans UCP |
| `templates/ai-*` | Agents IA peuvent decouvrir et acheter via MCP tools |
| `templates/ecommerce/` | Exposer .well-known/ucp + API routes UCP |
| `supabase-ssr-patterns.md` | Supabase stocke les ucp_checkouts |
| `security-taxonomy.md` | UCP ajoute PCI scope management + AP2 mandates |

---

## 15. Reference

### URLs Spec

| Resource | URL |
|----------|-----|
| Spec principale | https://ucp.dev/specification/overview |
| Checkout | https://ucp.dev/specification/checkout |
| Cart | https://ucp.dev/specification/cart |
| Identity Linking | https://ucp.dev/specification/identity-linking |
| Order | https://ucp.dev/specification/order |
| Payment Handlers | https://ucp.dev/specification/payment-handler-guide |
| AP2 Mandates | https://ucp.dev/specification/ap2-mandates |
| Schema Reference | https://ucp.dev/specification/reference |
| GitHub | https://github.com/Universal-Commerce-Protocol/ucp |
| Samples | https://github.com/Universal-Commerce-Protocol/samples |
| Conformance | https://github.com/Universal-Commerce-Protocol/conformance |

### JSON Schemas

| Schema | URL |
|--------|-----|
| Checkout | `https://ucp.dev/schemas/shopping/checkout.json` |
| Cart | `https://ucp.dev/schemas/shopping/cart.json` |
| Fulfillment | `https://ucp.dev/schemas/shopping/fulfillment.json` |
| Discount | `https://ucp.dev/schemas/shopping/discount.json` |
| Order | `https://ucp.dev/schemas/shopping/order.json` |

---

*Knowledge ATUM CREA | UCP v2026-01-11 (draft) | Apache 2.0*
