# Stripe Integration Patterns - ULTRA-CREATE v27.9

> **Source**: Analyse du repository [github.com/stripe/ai](https://github.com/stripe/ai)
> **Version**: 27.9 "STRIPE INTEGRATION"
> **Date**: Janvier 2026

---

## Table des Matieres

1. [Architecture Generale](#architecture-generale)
2. [Configuration-Driven Action Enablement](#configuration-driven-action-enablement)
3. [Stripe SDK Setup](#stripe-sdk-setup)
4. [Payment Flows](#payment-flows)
5. [Webhook Security](#webhook-security)
6. [Subscription Lifecycle](#subscription-lifecycle)
7. [Stripe Connect Multi-Tenant](#stripe-connect-multi-tenant)
8. [Error Handling](#error-handling)
9. [PCI Compliance](#pci-compliance)
10. [Next.js 15 Integration](#nextjs-15-integration)
11. [Agent Toolkit Patterns](#agent-toolkit-patterns)
12. [MCP Server Integration](#mcp-server-integration)
13. [Best Practices](#best-practices)
14. [Anti-Patterns](#anti-patterns)
15. [Migration Guide](#migration-guide)

---

## Architecture Generale

### Vue d'ensemble Stripe AI

```
┌─────────────────────────────────────────────────────────────┐
│                     STRIPE AI ECOSYSTEM                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │  Agent Toolkit  │  │   MCP Server    │  │Token Meter  │ │
│  │  Python/TS SDK  │  │  mcp.stripe.com │  │  Billing    │ │
│  └────────┬────────┘  └────────┬────────┘  └──────┬──────┘ │
│           │                    │                   │        │
│           ▼                    ▼                   ▼        │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                    STRIPE API                           ││
│  │  Payments │ Customers │ Subscriptions │ Connect         ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Composants Principaux

| Composant | Description | Usage |
|-----------|-------------|-------|
| **Agent Toolkit** | SDKs pour LLM frameworks | OpenAI, LangChain, CrewAI |
| **MCP Server** | Model Context Protocol | Claude, agents MCP-compatible |
| **Token Meter** | Billing usage LLM | Facturation par tokens |
| **Skills/Prompts** | Best practices agents | Guidance pour AI |

---

## Configuration-Driven Action Enablement

### Principe de Securite-First

Le pattern **Configuration-Driven Action Enablement** est central dans Stripe AI.
Il permet d'activer explicitement uniquement les actions necessaires, reduisant la surface d'attaque.

### Pattern Python

```python
from stripe_agent_toolkit import StripeAgentToolkit

# Configuration explicite des actions autorisees
configuration = {
    "actions": {
        # Payments
        "payment_links": {
            "create": True,    # Activer creation
            "list": False      # Desactiver listage
        },
        # Customers
        "customers": {
            "create": True,
            "list": True,
            "retrieve": True,
            "update": False,   # Lecture seule
            "delete": False    # Jamais supprimer
        },
        # Subscriptions
        "subscriptions": {
            "create": True,
            "cancel": True,
            "update": False
        },
        # Invoices
        "invoices": {
            "create": True,
            "finalize": True,
            "pay": True,
            "void": False      # Dangereux
        }
    }
}

# Initialisation avec configuration
toolkit = StripeAgentToolkit(
    secret_key="sk_live_...",
    configuration=configuration
)
```

### Pattern TypeScript

```typescript
import { StripeAgentToolkit } from '@stripe/agent-toolkit';

const configuration = {
  actions: {
    payment_links: { create: true },
    customers: {
      create: true,
      list: true,
      retrieve: true
    },
    subscriptions: {
      create: true,
      cancel: true
    }
  }
};

const toolkit = new StripeAgentToolkit({
  secretKey: process.env.STRIPE_SECRET_KEY!,
  configuration
});
```

### Contexte pour Stripe Connect

```python
configuration = {
    "actions": {
        "payment_links": {"create": True}
    },
    # Contexte pour multi-tenant
    "context": {
        "account": "acct_connected_123"  # Connected account ID
    }
}
```

### Avantages du Pattern

1. **Securite**: Actions explicitement autorisees
2. **Auditabilite**: Configuration tracable
3. **Flexibilite**: Ajustement par use case
4. **Least Privilege**: Principe du moindre privilege

---

## Stripe SDK Setup

### Installation Python

```bash
pip install stripe stripe-agent-toolkit
```

### Installation TypeScript/Node.js

```bash
npm install stripe @stripe/agent-toolkit
# ou
pnpm add stripe @stripe/agent-toolkit
```

### Configuration Environnement

```bash
# Variables d'environnement requises
STRIPE_SECRET_KEY=sk_live_... # ou sk_test_... pour dev
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Initialisation SDK Standard

```python
import stripe

# Configuration globale
stripe.api_key = os.environ["STRIPE_SECRET_KEY"]
stripe.api_version = "2024-12-18.acacia"  # Version API explicite

# Options avancees
stripe.max_network_retries = 2
stripe.proxy = None  # Si proxy requis
```

```typescript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
  maxNetworkRetries: 2,
});
```

---

## Payment Flows

### Hierarchie des APIs (Priorite)

```
1. Checkout Sessions (RECOMMANDE)
   └─ Stripe-hosted, PCI compliant, conversion optimisee

2. Payment Intents
   └─ Custom UI, controle total, Elements requis

3. Setup Intents
   └─ Sauvegarder payment method sans payer

4. Charges API (DEPRECIE)
   └─ Ne plus utiliser, migrer vers Payment Intents
```

### Checkout Session (Recommande)

```python
import stripe

def create_checkout_session(
    price_id: str,
    success_url: str,
    cancel_url: str,
    customer_email: str = None
) -> stripe.checkout.Session:
    """Creer une session Checkout Stripe-hosted."""

    session = stripe.checkout.Session.create(
        mode="payment",  # ou "subscription" ou "setup"
        line_items=[{
            "price": price_id,
            "quantity": 1
        }],
        success_url=success_url + "?session_id={CHECKOUT_SESSION_ID}",
        cancel_url=cancel_url,
        customer_email=customer_email,
        # Options recommandees
        payment_method_types=["card"],  # ou ["card", "sepa_debit", "ideal"]
        allow_promotion_codes=True,
        billing_address_collection="required",
        # Metadata pour tracking
        metadata={
            "order_id": "order_123",
            "source": "web_checkout"
        }
    )
    return session
```

```typescript
async function createCheckoutSession(
  priceId: string,
  successUrl: string,
  cancelUrl: string
): Promise<Stripe.Checkout.Session> {
  return stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl,
    payment_method_types: ['card'],
    allow_promotion_codes: true,
    billing_address_collection: 'required',
  });
}
```

### Payment Intent (Custom UI)

```python
def create_payment_intent(
    amount: int,  # En centimes (1000 = 10.00 EUR)
    currency: str = "eur",
    customer_id: str = None,
    metadata: dict = None
) -> stripe.PaymentIntent:
    """Creer un Payment Intent pour UI custom."""

    params = {
        "amount": amount,
        "currency": currency,
        "automatic_payment_methods": {"enabled": True},
        "metadata": metadata or {}
    }

    if customer_id:
        params["customer"] = customer_id

    return stripe.PaymentIntent.create(**params)


def confirm_payment_intent(
    payment_intent_id: str,
    payment_method_id: str
) -> stripe.PaymentIntent:
    """Confirmer un Payment Intent."""

    return stripe.PaymentIntent.confirm(
        payment_intent_id,
        payment_method=payment_method_id,
        return_url="https://example.com/payment/complete"
    )
```

### Setup Intent (Sauvegarder sans payer)

```python
def create_setup_intent(
    customer_id: str,
    usage: str = "off_session"  # ou "on_session"
) -> stripe.SetupIntent:
    """Creer un Setup Intent pour sauvegarder payment method."""

    return stripe.SetupIntent.create(
        customer=customer_id,
        usage=usage,
        automatic_payment_methods={"enabled": True}
    )
```

---

## Webhook Security

### Verification de Signature (CRITIQUE)

```python
import stripe
from flask import Flask, request, jsonify

app = Flask(__name__)
endpoint_secret = os.environ["STRIPE_WEBHOOK_SECRET"]

@app.route("/webhook", methods=["POST"])
def stripe_webhook():
    payload = request.data
    sig_header = request.headers.get("Stripe-Signature")

    try:
        # TOUJOURS verifier la signature
        event = stripe.Webhook.construct_event(
            payload, sig_header, endpoint_secret
        )
    except ValueError as e:
        # Payload invalide
        return jsonify({"error": "Invalid payload"}), 400
    except stripe.error.SignatureVerificationError as e:
        # Signature invalide
        return jsonify({"error": "Invalid signature"}), 400

    # Traiter l'evenement
    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        handle_checkout_completed(session)
    elif event["type"] == "payment_intent.succeeded":
        payment_intent = event["data"]["object"]
        handle_payment_succeeded(payment_intent)
    elif event["type"] == "customer.subscription.updated":
        subscription = event["data"]["object"]
        handle_subscription_updated(subscription)

    return jsonify({"status": "success"}), 200
```

### Handlers Recommandes

```python
def handle_checkout_completed(session: dict):
    """Handler pour checkout.session.completed."""

    # Recuperer les details
    customer_email = session.get("customer_email")
    customer_id = session.get("customer")
    payment_status = session.get("payment_status")

    if payment_status == "paid":
        # Activer l'acces, envoyer email, etc.
        activate_user_access(customer_id)
        send_confirmation_email(customer_email)

    # Logger pour audit
    log_event("checkout_completed", {
        "session_id": session["id"],
        "customer": customer_id,
        "amount": session.get("amount_total")
    })


def handle_subscription_updated(subscription: dict):
    """Handler pour subscription updates."""

    status = subscription["status"]
    customer_id = subscription["customer"]

    if status == "active":
        update_user_subscription_status(customer_id, "active")
    elif status == "past_due":
        send_payment_reminder(customer_id)
    elif status == "canceled":
        revoke_user_access(customer_id)
```

### Events Critiques a Gerer

| Event | Description | Action |
|-------|-------------|--------|
| `checkout.session.completed` | Checkout termine | Activer acces |
| `payment_intent.succeeded` | Paiement reussi | Confirmer commande |
| `payment_intent.payment_failed` | Paiement echoue | Notifier client |
| `customer.subscription.created` | Abo cree | Setup compte |
| `customer.subscription.updated` | Abo modifie | Sync status |
| `customer.subscription.deleted` | Abo annule | Revoquer acces |
| `invoice.payment_succeeded` | Facture payee | Renouveler acces |
| `invoice.payment_failed` | Facture echouee | Relance |

---

## Subscription Lifecycle

### Creation d'Abonnement

```python
def create_subscription(
    customer_id: str,
    price_id: str,
    trial_days: int = None
) -> stripe.Subscription:
    """Creer un abonnement."""

    params = {
        "customer": customer_id,
        "items": [{"price": price_id}],
        "payment_behavior": "default_incomplete",
        "payment_settings": {
            "save_default_payment_method": "on_subscription"
        },
        "expand": ["latest_invoice.payment_intent"]
    }

    if trial_days:
        params["trial_period_days"] = trial_days

    return stripe.Subscription.create(**params)
```

### Mise a Jour (Upgrade/Downgrade)

```python
def update_subscription(
    subscription_id: str,
    new_price_id: str,
    proration_behavior: str = "create_prorations"
) -> stripe.Subscription:
    """Mettre a jour un abonnement (upgrade/downgrade)."""

    subscription = stripe.Subscription.retrieve(subscription_id)

    return stripe.Subscription.modify(
        subscription_id,
        items=[{
            "id": subscription["items"]["data"][0]["id"],
            "price": new_price_id
        }],
        proration_behavior=proration_behavior
        # Options: "create_prorations", "none", "always_invoice"
    )
```

### Annulation

```python
def cancel_subscription(
    subscription_id: str,
    cancel_at_period_end: bool = True
) -> stripe.Subscription:
    """Annuler un abonnement."""

    if cancel_at_period_end:
        # Annuler a la fin de la periode (recommande)
        return stripe.Subscription.modify(
            subscription_id,
            cancel_at_period_end=True
        )
    else:
        # Annulation immediate
        return stripe.Subscription.cancel(subscription_id)
```

### Pause/Resume

```python
def pause_subscription(subscription_id: str) -> stripe.Subscription:
    """Mettre en pause un abonnement."""

    return stripe.Subscription.modify(
        subscription_id,
        pause_collection={"behavior": "mark_uncollectible"}
        # ou "keep_as_draft" ou "void"
    )


def resume_subscription(subscription_id: str) -> stripe.Subscription:
    """Reprendre un abonnement en pause."""

    return stripe.Subscription.modify(
        subscription_id,
        pause_collection=""  # Vide pour reprendre
    )
```

---

## Stripe Connect Multi-Tenant

### Types de Comptes Connect

| Type | Description | Use Case |
|------|-------------|----------|
| **Standard** | Compte Stripe complet | Marketplace haut niveau |
| **Express** | Onboarding simplifie | Marketplace standard |
| **Custom** | Controle total | Platforme custom |

### Creation Compte Express

```python
def create_connected_account(
    email: str,
    country: str = "FR"
) -> stripe.Account:
    """Creer un compte Connect Express."""

    return stripe.Account.create(
        type="express",
        country=country,
        email=email,
        capabilities={
            "card_payments": {"requested": True},
            "transfers": {"requested": True}
        }
    )


def create_account_link(
    account_id: str,
    refresh_url: str,
    return_url: str
) -> stripe.AccountLink:
    """Creer un lien d'onboarding."""

    return stripe.AccountLink.create(
        account=account_id,
        refresh_url=refresh_url,
        return_url=return_url,
        type="account_onboarding"
    )
```

### Paiements avec Connected Account

```python
def create_payment_with_destination(
    amount: int,
    connected_account_id: str,
    application_fee: int = None
) -> stripe.PaymentIntent:
    """Paiement avec destination (plateforme recoit, transfert auto)."""

    params = {
        "amount": amount,
        "currency": "eur",
        "transfer_data": {
            "destination": connected_account_id
        }
    }

    if application_fee:
        params["application_fee_amount"] = application_fee

    return stripe.PaymentIntent.create(**params)


def create_direct_charge(
    amount: int,
    connected_account_id: str,
    application_fee: int = None
) -> stripe.PaymentIntent:
    """Charge direct sur compte connecte."""

    params = {
        "amount": amount,
        "currency": "eur"
    }

    if application_fee:
        params["application_fee_amount"] = application_fee

    return stripe.PaymentIntent.create(
        **params,
        stripe_account=connected_account_id  # Agir au nom du compte
    )
```

---

## Error Handling

### Hierarchie des Erreurs Stripe

```python
import stripe

try:
    # Operation Stripe
    payment_intent = stripe.PaymentIntent.create(...)

except stripe.error.CardError as e:
    # Erreur carte (decline, fonds insuffisants)
    error = e.error
    print(f"Card error: {error.code} - {error.message}")
    # Afficher message user-friendly

except stripe.error.RateLimitError as e:
    # Trop de requetes
    print("Rate limited, retrying...")
    time.sleep(1)
    # Retry avec backoff

except stripe.error.InvalidRequestError as e:
    # Parametres invalides
    print(f"Invalid request: {e.user_message}")

except stripe.error.AuthenticationError as e:
    # Cle API invalide
    print("Authentication failed - check API key")

except stripe.error.APIConnectionError as e:
    # Probleme reseau
    print("Network error, retrying...")

except stripe.error.StripeError as e:
    # Erreur generique Stripe
    print(f"Stripe error: {e.user_message}")

except Exception as e:
    # Erreur inattendue
    print(f"Unexpected error: {str(e)}")
```

### Codes d'Erreur Carte Courants

| Code | Description | Action Recommandee |
|------|-------------|-------------------|
| `card_declined` | Carte refusee | Demander autre carte |
| `insufficient_funds` | Fonds insuffisants | Suggerer montant inferieur |
| `expired_card` | Carte expiree | Mettre a jour carte |
| `incorrect_cvc` | CVC incorrect | Re-saisir CVC |
| `processing_error` | Erreur temporaire | Reessayer |
| `fraudulent` | Fraude detectee | Contacter banque |

### Retry avec Backoff Exponentiel

```python
import time
from functools import wraps

def stripe_retry(max_retries=3, base_delay=1):
    """Decorateur pour retry avec backoff."""

    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(max_retries):
                try:
                    return func(*args, **kwargs)
                except (stripe.error.RateLimitError,
                        stripe.error.APIConnectionError) as e:
                    if attempt == max_retries - 1:
                        raise
                    delay = base_delay * (2 ** attempt)
                    print(f"Retry {attempt + 1}/{max_retries} in {delay}s")
                    time.sleep(delay)
            return None
        return wrapper
    return decorator


@stripe_retry(max_retries=3)
def safe_create_payment(amount: int, currency: str):
    return stripe.PaymentIntent.create(
        amount=amount,
        currency=currency
    )
```

---

## PCI Compliance

### Niveaux de Conformite

| Niveau | Description | Exigences |
|--------|-------------|-----------|
| **SAQ A** | Stripe-hosted | Checkout Sessions uniquement |
| **SAQ A-EP** | Elements + API | Stripe.js + Elements |
| **SAQ D** | Donnees carte | Infrastructure securisee |

### Bonnes Pratiques PCI

```python
# BIEN: Utiliser payment_method_data (jamais stocker les donnees carte)
payment_intent = stripe.PaymentIntent.create(
    amount=1000,
    currency="eur",
    payment_method_data={
        "type": "card",
        "card": {
            "token": "tok_visa"  # Token genere cote client
        }
    }
)

# MAL: Ne jamais faire ca
# payment_intent = stripe.PaymentIntent.create(
#     amount=1000,
#     currency="eur",
#     card_number="4242424242424242",  # JAMAIS!
#     card_exp="12/25",
#     card_cvc="123"
# )
```

### Checklist Securite

- [ ] Utiliser HTTPS partout
- [ ] Ne jamais logger les donnees carte
- [ ] Verifier les webhooks avec signature
- [ ] Utiliser Stripe.js cote client
- [ ] Stocker uniquement les IDs (customer, payment_method)
- [ ] Activer 3D Secure
- [ ] Implementer idempotency keys

---

## Next.js 15 Integration

### Server Actions avec Stripe

```typescript
// app/actions/stripe.ts
'use server';

import Stripe from 'stripe';
import { redirect } from 'next/navigation';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function createCheckoutAction(priceId: string) {
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/pricing`,
  });

  redirect(session.url!);
}

export async function getSubscriptionStatus(customerId: string) {
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: 'active',
    limit: 1,
  });

  return subscriptions.data[0] ?? null;
}
```

### Webhook Route Handler

```typescript
// app/api/webhooks/stripe/route.ts
import { headers } from 'next/headers';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  const body = await request.text();
  const signature = headers().get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return new Response('Webhook signature verification failed', { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object);
      break;
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object);
      break;
    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object);
      break;
  }

  return new Response('OK', { status: 200 });
}
```

### Client Component avec Stripe Elements

```tsx
// components/CheckoutForm.tsx
'use client';

import { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

export function CheckoutForm({ clientSecret }: { clientSecret: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment/complete`,
      },
    });

    if (submitError) {
      setError(submitError.message ?? 'Payment failed');
    }

    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      {error && <p className="text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="btn btn-primary mt-4"
      >
        {loading ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
}
```

### Provider Setup

```tsx
// app/providers.tsx
'use client';

import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export function StripeProvider({
  children,
  clientSecret
}: {
  children: React.ReactNode;
  clientSecret: string;
}) {
  return (
    <Elements
      stripe={stripePromise}
      options={{ clientSecret }}
    >
      {children}
    </Elements>
  );
}
```

---

## Agent Toolkit Patterns

### Multi-Framework Adapter Pattern

Le Stripe Agent Toolkit utilise un pattern d'adaptateur pour supporter plusieurs frameworks AI.

```
StripeAgentToolkit (Core)
  │
  ├── OpenAI Adapter
  │   └── Function calling format
  │
  ├── LangChain Adapter
  │   └── Tool/Agent format
  │
  ├── CrewAI Adapter
  │   └── Agent/Task format
  │
  └── Vercel AI SDK Adapter
      └── AI functions format
```

### OpenAI Agent SDK

```python
from stripe_agent_toolkit import StripeAgentToolkit
from openai import OpenAI

client = OpenAI()
toolkit = StripeAgentToolkit(
    secret_key="sk_...",
    configuration={
        "actions": {
            "customers": {"create": True, "list": True},
            "payment_links": {"create": True}
        }
    }
)

# Obtenir les tools au format OpenAI
tools = toolkit.get_tools()

response = client.chat.completions.create(
    model="gpt-4-turbo",
    messages=[
        {"role": "user", "content": "Create a customer with email test@example.com"}
    ],
    tools=tools,
    tool_choice="auto"
)

# Executer le tool call
if response.choices[0].message.tool_calls:
    tool_call = response.choices[0].message.tool_calls[0]
    result = toolkit.run_tool(
        tool_call.function.name,
        tool_call.function.arguments
    )
```

### LangChain Integration

```python
from stripe_agent_toolkit.langchain import StripeToolkit
from langchain.agents import create_openai_functions_agent
from langchain_openai import ChatOpenAI

toolkit = StripeToolkit(
    secret_key="sk_...",
    configuration={
        "actions": {
            "customers": {"create": True},
            "invoices": {"create": True, "finalize": True}
        }
    }
)

llm = ChatOpenAI(model="gpt-4-turbo")
tools = toolkit.get_tools()

agent = create_openai_functions_agent(llm, tools, prompt)
```

### CrewAI Integration

```python
from stripe_agent_toolkit.crewai import StripeTool
from crewai import Agent, Task, Crew

stripe_tool = StripeTool(
    secret_key="sk_...",
    configuration={
        "actions": {
            "customers": {"create": True, "list": True}
        }
    }
)

billing_agent = Agent(
    role="Billing Manager",
    goal="Handle customer billing operations",
    tools=[stripe_tool],
    llm="gpt-4-turbo"
)

task = Task(
    description="Create a new customer for john@example.com",
    agent=billing_agent
)

crew = Crew(agents=[billing_agent], tasks=[task])
result = crew.kickoff()
```

### Method Dispatch Pattern

```python
# Pattern interne du toolkit
class StripeAgentToolkit:
    _method_dispatch = {
        "create_customer": create_customer,
        "list_customers": list_customers,
        "create_payment_link": create_payment_link,
        "create_invoice": create_invoice,
        "finalize_invoice": finalize_invoice,
        # ... autres methodes
    }

    def run_tool(self, name: str, arguments: str) -> str:
        """Execute un tool par nom."""
        if name not in self._method_dispatch:
            raise ValueError(f"Unknown tool: {name}")

        args = json.loads(arguments)
        method = self._method_dispatch[name]

        # Verifier si action autorisee
        if not self._is_action_enabled(name):
            raise PermissionError(f"Action {name} not enabled")

        return method(**args)
```

---

## MCP Server Integration

### Configuration MCP

```json
{
  "mcpServers": {
    "stripe": {
      "command": "npx",
      "args": ["-y", "@stripe/mcp-server"],
      "env": {
        "STRIPE_SECRET_KEY": "${STRIPE_SECRET_KEY}"
      }
    }
  }
}
```

### Utilisation avec Claude

Le MCP Stripe expose:

1. **Tools** - Operations CRUD sur Stripe
2. **Resources** - Documentation Stripe searchable
3. **Prompts** - Best practices pour agents

### Tools Disponibles

| Tool | Description |
|------|-------------|
| `create_customer` | Creer un client |
| `list_customers` | Lister les clients |
| `create_payment_link` | Creer un lien de paiement |
| `create_invoice` | Creer une facture |
| `create_subscription` | Creer un abonnement |
| `search_documentation` | Rechercher dans docs Stripe |

### Exemple d'Interaction

```
User: "Cree un client avec l'email bob@example.com"

Claude (via MCP):
1. Detecte intent: creation client
2. Appelle tool create_customer
3. Parametres: {"email": "bob@example.com"}
4. Retourne: {"id": "cus_xxx", "email": "bob@example.com"}
```

---

## Best Practices

### DO (Faire)

1. **Checkout Sessions** - Preferer pour tous les paiements simples
2. **Webhook verification** - Toujours verifier la signature
3. **Idempotency keys** - Pour operations critiques
4. **Error handling** - Gerer tous les types d'erreurs Stripe
5. **API versioning** - Specifier la version explicitement
6. **Metadata** - Utiliser pour tracking et reconciliation
7. **Stripe Elements** - Pour UI custom PCI-compliant
8. **3D Secure** - Activer pour reduire fraude
9. **Test mode** - Developper avec `sk_test_`

### DON'T (Ne pas faire)

1. **Sources API** - Deprecie, ne plus utiliser
2. **Tokens API** - Deprecie pour nouveaux projets
3. **Card Element legacy** - Preferer Payment Element
4. **Stockage carte** - Ne jamais stocker les donnees carte
5. **Skip webhook verification** - Toujours verifier
6. **Hardcode keys** - Utiliser variables d'environnement

### Idempotency Keys

```python
import uuid

def create_payment_idempotent(amount: int, customer_id: str):
    """Paiement avec idempotency key."""

    idempotency_key = str(uuid.uuid4())

    return stripe.PaymentIntent.create(
        amount=amount,
        currency="eur",
        customer=customer_id,
        idempotency_key=idempotency_key
    )
```

---

## Anti-Patterns

### 1. Checkout sans verification webhook

```python
# MAL: Faire confiance au redirect success
@app.route("/success")
def success():
    session_id = request.args.get("session_id")
    # DANGER: Un user peut forger cette URL!
    activate_access(session_id)  # Risque de fraude

# BIEN: Activer uniquement via webhook
@app.route("/webhook")
def webhook():
    event = verify_and_construct_event(...)
    if event["type"] == "checkout.session.completed":
        activate_access(event["data"]["object"]["id"])
```

### 2. Ignorer les erreurs carte

```python
# MAL
try:
    stripe.PaymentIntent.create(...)
except:
    pass  # Silencieux = danger

# BIEN
try:
    stripe.PaymentIntent.create(...)
except stripe.error.CardError as e:
    return {"error": e.user_message, "code": e.code}
```

### 3. Stocker des donnees sensibles

```python
# MAL
customer = stripe.Customer.create(
    email=email,
    metadata={
        "card_number": "4242..."  # JAMAIS!
    }
)

# BIEN
customer = stripe.Customer.create(
    email=email,
    metadata={
        "internal_user_id": "user_123"  # Reference interne OK
    }
)
```

### 4. Webhooks non-idempotents

```python
# MAL: Double-process possible
def handle_checkout(session):
    send_email(session["customer_email"])  # Peut envoyer 2x!

# BIEN: Verifier avant traitement
def handle_checkout(session):
    if already_processed(session["id"]):
        return
    mark_as_processed(session["id"])
    send_email(session["customer_email"])
```

---

## Migration Guide

### De Charges vers Payment Intents

```python
# AVANT (Charges API - deprecie)
charge = stripe.Charge.create(
    amount=1000,
    currency="eur",
    source="tok_visa"
)

# APRES (Payment Intents - recommande)
payment_intent = stripe.PaymentIntent.create(
    amount=1000,
    currency="eur",
    payment_method="pm_card_visa",
    confirm=True
)
```

### De Sources vers Payment Methods

```python
# AVANT (Sources - deprecie)
source = stripe.Source.create(
    type="card",
    token="tok_visa"
)

# APRES (Payment Methods - recommande)
payment_method = stripe.PaymentMethod.create(
    type="card",
    card={"token": "tok_visa"}
)
```

### Checklist Migration

- [ ] Remplacer Charges par Payment Intents
- [ ] Remplacer Sources par Payment Methods
- [ ] Mettre a jour vers Payment Element
- [ ] Implementer webhooks si manquants
- [ ] Activer 3D Secure
- [ ] Tester en mode test
- [ ] Deployer progressivement

---

## API Reference (docs.stripe.com)

> **Source**: Documentation officielle Stripe API
> **Base URL**: `https://api.stripe.com`
> **Format**: REST avec JSON responses

### Customers API

Les Customers permettent de sauvegarder les informations de paiement et de contact, et de suivre les paiements d'un même client.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/v1/customers` | Créer un customer |
| GET | `/v1/customers/:id` | Récupérer un customer |
| POST | `/v1/customers/:id` | Mettre à jour un customer |
| DELETE | `/v1/customers/:id` | Supprimer un customer |
| GET | `/v1/customers` | Lister tous les customers |
| GET | `/v1/customers/search` | Rechercher des customers |

```typescript
// Créer un customer
const customer = await stripe.customers.create({
  email: 'user@example.com',
  name: 'John Doe',
  metadata: { userId: 'user_123' }
});

// Rechercher
const results = await stripe.customers.search({
  query: 'email:"user@example.com"'
});
```

### PaymentIntents API

Un PaymentIntent guide le processus de collecte de paiement. Créer un PaymentIntent par commande/session.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/v1/payment_intents` | Créer un PaymentIntent |
| GET | `/v1/payment_intents/:id` | Récupérer |
| POST | `/v1/payment_intents/:id` | Mettre à jour |
| GET | `/v1/payment_intents` | Lister |
| POST | `/v1/payment_intents/:id/confirm` | Confirmer le paiement |
| POST | `/v1/payment_intents/:id/capture` | Capturer (si manual capture) |
| POST | `/v1/payment_intents/:id/cancel` | Annuler |

**Lifecycle Status:**
```
requires_payment_method → requires_confirmation → requires_action → processing → succeeded
                                                                              ↓
                                                                          canceled
```

```typescript
// Créer avec confirmation automatique
const paymentIntent = await stripe.paymentIntents.create({
  amount: 2000, // en centimes
  currency: 'eur',
  customer: 'cus_xxx',
  payment_method: 'pm_xxx',
  confirm: true,
  return_url: 'https://example.com/return'
});

// Manual capture (autorisation puis capture)
const pi = await stripe.paymentIntents.create({
  amount: 5000,
  currency: 'eur',
  capture_method: 'manual'
});
// Plus tard...
await stripe.paymentIntents.capture(pi.id);
```

### Subscriptions API

Les Subscriptions permettent de facturer un client de manière récurrente.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/v1/subscriptions` | Créer une subscription |
| GET | `/v1/subscriptions/:id` | Récupérer |
| POST | `/v1/subscriptions/:id` | Mettre à jour |
| DELETE | `/v1/subscriptions/:id` | Annuler |
| GET | `/v1/subscriptions` | Lister |
| POST | `/v1/subscriptions/:id/resume` | Reprendre (après pause) |
| GET | `/v1/subscriptions/search` | Rechercher |

```typescript
// Créer une subscription
const subscription = await stripe.subscriptions.create({
  customer: 'cus_xxx',
  items: [{ price: 'price_xxx' }],
  trial_period_days: 14,
  payment_behavior: 'default_incomplete',
  expand: ['latest_invoice.payment_intent']
});

// Annuler à la fin de la période
await stripe.subscriptions.update('sub_xxx', {
  cancel_at_period_end: true
});

// Annulation immédiate
await stripe.subscriptions.cancel('sub_xxx');
```

### Checkout Sessions API

Une Checkout Session représente la session de paiement d'un client (one-time ou subscription).

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/v1/checkout/sessions` | Créer une session |
| GET | `/v1/checkout/sessions/:id` | Récupérer |
| POST | `/v1/checkout/sessions/:id` | Mettre à jour |
| GET | `/v1/checkout/sessions` | Lister |
| POST | `/v1/checkout/sessions/:id/expire` | Expirer la session |
| GET | `/v1/checkout/sessions/:id/line_items` | Récupérer les line items |

**Modes disponibles:**
- `payment` - Paiement one-time
- `subscription` - Abonnement récurrent
- `setup` - Enregistrer un moyen de paiement

```typescript
// Mode subscription
const session = await stripe.checkout.sessions.create({
  mode: 'subscription',
  customer: 'cus_xxx',
  line_items: [{
    price: 'price_xxx',
    quantity: 1
  }],
  success_url: 'https://example.com/success?session_id={CHECKOUT_SESSION_ID}',
  cancel_url: 'https://example.com/cancel'
});

// Redirect vers session.url
```

### Webhooks - Advanced Security

#### Signature Verification (HMAC-SHA256)

Stripe signe tous les webhooks avec HMAC-SHA256. Le header `Stripe-Signature` contient:
- `t=` - Timestamp Unix
- `v1=` - Signature HMAC-SHA256 (production)
- `v0=` - Signature test uniquement

**Processus de vérification:**
```
signed_payload = timestamp + "." + JSON_payload
expected_signature = HMAC_SHA256(webhook_secret, signed_payload)
compare(expected_signature, received_signature)
```

```typescript
// Vérification avec SDK (RECOMMANDÉ)
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed');
    return new Response('Invalid signature', { status: 400 });
  }

  // Traiter l'événement...
  return new Response('OK', { status: 200 });
}
```

#### Retry Behavior

| Environnement | Comportement |
|---------------|--------------|
| **Production** | Retries jusqu'à 3 jours avec exponential backoff |
| **Test** | 3 retries en quelques heures |

**Important:** Stripe ne garantit PAS l'ordre de livraison des événements.

```typescript
// Gestion des événements out-of-order
async function handleSubscriptionUpdate(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;

  // Vérifier que l'événement est plus récent que notre état
  const existing = await db.subscription.findUnique({
    where: { stripeId: subscription.id }
  });

  if (existing && existing.updatedAt > new Date(event.created * 1000)) {
    // Event plus ancien, ignorer
    return;
  }

  // Traiter l'update...
}
```

#### IP Verification

Stripe envoie les webhooks depuis une liste d'IPs définie. Vérifier l'origine en plus de la signature.

```typescript
// Liste IPs Stripe (à mettre à jour régulièrement)
const STRIPE_WEBHOOK_IPS = [
  '3.18.12.63',
  '3.130.192.231',
  '13.235.14.237',
  '13.235.122.149',
  '18.211.135.69',
  '35.154.171.200',
  '52.15.183.38',
  '54.88.130.119',
  '54.88.130.237',
  '54.187.174.169',
  '54.187.205.235',
  '54.187.216.72'
];

function verifyStripeIP(request: Request): boolean {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const ip = forwardedFor?.split(',')[0].trim();
  return ip ? STRIPE_WEBHOOK_IPS.includes(ip) : false;
}
```

#### Secret Rotation

Lors de la rotation des secrets webhook:
- L'ancien secret reste actif **24 heures**
- Vérifier avec les deux secrets pendant la transition

```typescript
const WEBHOOK_SECRETS = [
  process.env.STRIPE_WEBHOOK_SECRET_NEW!,
  process.env.STRIPE_WEBHOOK_SECRET_OLD! // Actif 24h après rotation
].filter(Boolean);

function verifyWithMultipleSecrets(body: string, signature: string): Stripe.Event | null {
  for (const secret of WEBHOOK_SECRETS) {
    try {
      return stripe.webhooks.constructEvent(body, signature, secret);
    } catch {
      continue;
    }
  }
  return null;
}
```

#### Best Practices Webhooks

1. **Return 2xx immédiatement** avant traitement lourd
2. **Dedupe** avec l'event ID stocké
3. **Exempter du CSRF** les routes webhook
4. **HTTPS obligatoire** (TLS 1.2+)
5. **Timestamp tolerance** de 5 minutes (anti-replay)
6. **Traitement async** via queue (Redis, SQS, etc.)

```typescript
// Pattern production avec queue
export async function POST(request: Request) {
  const event = await verifyWebhook(request);
  if (!event) {
    return new Response('Invalid', { status: 400 });
  }

  // Dedupe check
  const processed = await redis.get(`stripe:event:${event.id}`);
  if (processed) {
    return new Response('Already processed', { status: 200 });
  }

  // Mark as processing
  await redis.set(`stripe:event:${event.id}`, 'processing', 'EX', 86400);

  // Queue for async processing
  await queue.add('stripe-webhook', {
    eventId: event.id,
    type: event.type,
    data: event.data.object
  });

  // Return 200 IMMEDIATELY
  return new Response('Queued', { status: 200 });
}
```

### Event Types (Principaux)

| Event | Description |
|-------|-------------|
| `payment_intent.succeeded` | Paiement réussi |
| `payment_intent.payment_failed` | Paiement échoué |
| `checkout.session.completed` | Checkout terminé |
| `customer.subscription.created` | Nouvelle subscription |
| `customer.subscription.updated` | Subscription modifiée |
| `customer.subscription.deleted` | Subscription annulée |
| `invoice.paid` | Facture payée |
| `invoice.payment_failed` | Paiement facture échoué |
| `customer.created` | Nouveau customer |
| `customer.updated` | Customer modifié |

---

## Integration UCP (Universal Commerce Protocol) - v28.2

### Vue d'ensemble

Stripe est un **Payment Handler** supporte nativement par UCP (Universal Commerce Protocol).
UCP est le standard open-source de Google + Shopify (Jan 2026) pour le commerce agentique.

L'integration permet d'utiliser Stripe via le protocole UCP standard, offrant:
- **Interoperabilite**: Meme code pour tous merchants UCP
- **Multi-provider**: Peut switcher entre Stripe, Adyen, etc.
- **Commerce agentique**: Agents peuvent checkout autonomement

### Configuration Payment Handler UCP

```json
{
  "payment": {
    "handlers": [
      {
        "type": "stripe",
        "config": {
          "publishable_key": "pk_...",
          "payment_methods": ["card", "apple_pay", "google_pay"],
          "capture_method": "automatic"
        }
      }
    ]
  }
}
```

### Flow UCP + Stripe

```
1. Business expose Stripe handler dans /.well-known/ucp
2. Platform/Agent cree checkout session via UCP API
3. UCP retourne instructions handler Stripe
4. Agent execute Stripe payment (Payment Intent)
5. UCP notifie business via webhook
6. Order confirmation retournee
```

### Exemple Integration

```typescript
import { UCPClient } from '@ucp/sdk';
import Stripe from 'stripe';

async function ucpStripeCheckout(merchantUrl: string, items: Item[]) {
  const ucp = new UCPClient({ merchantUrl });

  // 1. Create UCP checkout session
  const session = await ucp.checkout.create({ items });

  // 2. Get Stripe handler config from UCP
  const stripeHandler = session.payment_options
    .find(h => h.type === 'stripe');

  // 3. Execute Stripe payment
  const stripe = new Stripe(stripeHandler.config.secret_key);
  const paymentIntent = await stripe.paymentIntents.create({
    amount: session.total,
    currency: session.currency,
    metadata: { ucp_session_id: session.id }
  });

  // 4. Complete UCP checkout
  return await ucp.checkout.complete(session.id, {
    handler: 'stripe',
    payment_intent_id: paymentIntent.id
  });
}
```

### Avantages UCP + Stripe

| Aspect | Stripe seul | UCP + Stripe |
|--------|-------------|--------------|
| Integration | Custom par merchant | Standard universel |
| Discovery | Manual | Automatique via /.well-known/ucp |
| Multi-provider | Non | Oui (Stripe, Adyen, etc.) |
| Agents AI | Limited | Commerce agentique natif |

### Ressources UCP

- [UCP Specification](https://ucp.dev/)
- [UCP GitHub](https://github.com/Universal-Commerce-Protocol/ucp)
- [Google Developer Guide](https://developers.google.com/merchant/ucp)

---

## Ressources

### Documentation Officielle
- [Stripe Docs](https://docs.stripe.com/)
- [API Reference](https://docs.stripe.com/api)
- [Stripe Agent Toolkit](https://github.com/stripe/agent-toolkit)

### MCP
- [MCP Stripe](https://mcp.stripe.com/)
- [Model Context Protocol](https://modelcontextprotocol.com/)

### SDKs
- [stripe-python](https://github.com/stripe/stripe-python)
- [stripe-node](https://github.com/stripe/stripe-node)
- [@stripe/stripe-js](https://github.com/stripe/stripe-js)

---

## Keywords Auto-Discovery

```
stripe, payment, checkout, subscription, webhook, invoice, customer,
payment_intent, setup_intent, payment_method, connect, platform,
billing, recurring, pci, card, refund, dispute, transfer,
ucp, commerce protocol, agentic commerce, payment handler, ai agent shopping
```

---

*ULTRA-CREATE v27.10 | Stripe Integration Patterns | Sources: github.com/stripe/ai + docs.stripe.com/api*
