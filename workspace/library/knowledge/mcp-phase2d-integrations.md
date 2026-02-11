# Phase 2D: MCPs Additionnels pour ULTRA-CREATE v24.0

> **Objectif**: Compléter l'écosystème MCP pour atteindre 100% de couverture

---

## STATUS DES MCPS PHASE 2D

| MCP | Package | Status | Variable d'Env |
|-----|---------|--------|----------------|
| **Stripe** | `@stripe/mcp` | ✅ Déjà installé | `STRIPE_SECRET_KEY` |
| **SendGrid** | `@sendgrid/mcp-server` | 📝 À configurer | `SENDGRID_API_KEY` |
| **Analytics (PostHog)** | `posthog-mcp-server` | 📝 À configurer | `POSTHOG_API_KEY` |
| **OpenAI** | `@openai/mcp-server` | 📝 À configurer | `OPENAI_API_KEY` |

---

## 1. STRIPE MCP (✅ INSTALLÉ)

### Configuration Existante
```json
{
  "stripe": {
    "type": "stdio",
    "command": "npx",
    "args": ["-y", "@stripe/mcp"],
    "env": {
      "STRIPE_SECRET_KEY": "${STRIPE_SECRET_KEY}"
    }
  }
}
```

### Outils Disponibles
| Outil | Description |
|-------|-------------|
| `stripe_create_customer` | Créer un client Stripe |
| `stripe_create_product` | Créer un produit |
| `stripe_create_price` | Créer un prix |
| `stripe_create_checkout_session` | Créer une session de paiement |
| `stripe_create_subscription` | Créer un abonnement |
| `stripe_list_invoices` | Lister les factures |
| `stripe_create_refund` | Créer un remboursement |

### Cas d'Usage
```javascript
// Créer un checkout pour un SaaS
mcp__stripe__create_checkout_session({
  mode: 'subscription',
  line_items: [{
    price: 'price_xxx',
    quantity: 1
  }],
  success_url: 'https://example.com/success',
  cancel_url: 'https://example.com/cancel'
})
```

---

## 2. SENDGRID MCP (À CONFIGURER)

### Installation
```json
{
  "sendgrid": {
    "type": "stdio",
    "command": "npx",
    "args": ["-y", "@sendgrid/mcp-server"],
    "env": {
      "SENDGRID_API_KEY": "${SENDGRID_API_KEY}"
    }
  }
}
```

### Obtenir une API Key
1. Aller sur https://sendgrid.com
2. Settings → API Keys → Create API Key
3. Choisir "Full Access" ou permissions spécifiques
4. Ajouter `SENDGRID_API_KEY` dans variables d'environnement

### Outils Disponibles
| Outil | Description |
|-------|-------------|
| `sendgrid_send_email` | Envoyer un email transactionnel |
| `sendgrid_send_template` | Envoyer avec template |
| `sendgrid_create_contact` | Ajouter un contact |
| `sendgrid_create_list` | Créer une liste de contacts |
| `sendgrid_get_stats` | Statistiques d'envoi |

### Cas d'Usage
```javascript
// Email de bienvenue
mcp__sendgrid__send_email({
  to: 'user@example.com',
  from: 'noreply@myapp.com',
  subject: 'Bienvenue sur MyApp!',
  html: '<h1>Bienvenue!</h1><p>Merci pour votre inscription.</p>'
})

// Email avec template
mcp__sendgrid__send_template({
  to: 'user@example.com',
  template_id: 'd-xxx',
  dynamic_template_data: {
    name: 'John',
    action_url: 'https://myapp.com/activate'
  }
})
```

---

## 3. POSTHOG MCP (ANALYTICS)

### Installation
```json
{
  "posthog": {
    "type": "stdio",
    "command": "npx",
    "args": ["-y", "posthog-mcp-server"],
    "env": {
      "POSTHOG_API_KEY": "${POSTHOG_API_KEY}",
      "POSTHOG_HOST": "https://app.posthog.com"
    }
  }
}
```

### Obtenir une API Key
1. Aller sur https://posthog.com (ou self-hosted)
2. Project Settings → Project API Key
3. Ajouter `POSTHOG_API_KEY` et `POSTHOG_HOST` dans env

### Outils Disponibles
| Outil | Description |
|-------|-------------|
| `posthog_capture` | Enregistrer un événement |
| `posthog_identify` | Identifier un utilisateur |
| `posthog_get_events` | Récupérer les événements |
| `posthog_get_insights` | Obtenir les insights |
| `posthog_create_feature_flag` | Créer un feature flag |
| `posthog_check_feature_flag` | Vérifier un flag |

### Cas d'Usage
```javascript
// Tracker une action utilisateur
mcp__posthog__capture({
  distinct_id: 'user_123',
  event: 'subscription_created',
  properties: {
    plan: 'pro',
    price: 29.99
  }
})

// Vérifier un feature flag
mcp__posthog__check_feature_flag({
  key: 'new-checkout-flow',
  distinct_id: 'user_123'
})
```

---

## 4. OPENAI MCP

### Installation
```json
{
  "openai": {
    "type": "stdio",
    "command": "npx",
    "args": ["-y", "@openai/mcp-server"],
    "env": {
      "OPENAI_API_KEY": "${OPENAI_API_KEY}"
    }
  }
}
```

### Obtenir une API Key
1. Aller sur https://platform.openai.com
2. API Keys → Create new secret key
3. Ajouter `OPENAI_API_KEY` dans variables d'environnement

### Outils Disponibles
| Outil | Description |
|-------|-------------|
| `openai_chat` | Chat completion (GPT-4, GPT-4o) |
| `openai_embeddings` | Créer des embeddings |
| `openai_images` | Générer des images (DALL-E) |
| `openai_speech` | Text-to-Speech |
| `openai_transcription` | Speech-to-Text (Whisper) |
| `openai_moderation` | Modération de contenu |

### Cas d'Usage
```javascript
// Générer du texte avec GPT-4o
mcp__openai__chat({
  model: 'gpt-4o',
  messages: [
    { role: 'system', content: 'Tu es un assistant utile.' },
    { role: 'user', content: 'Explique les hooks React.' }
  ]
})

// Créer des embeddings
mcp__openai__embeddings({
  model: 'text-embedding-3-small',
  input: 'Texte à vectoriser pour RAG'
})

// Générer une image
mcp__openai__images({
  model: 'dall-e-3',
  prompt: 'Un logo moderne pour une startup tech',
  size: '1024x1024'
})
```

---

## CONFIGURATION COMPLÈTE RECOMMANDÉE

Ajouter dans `~/.claude.json` section `mcpServers`:

```json
{
  "mcpServers": {
    "stripe": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@stripe/mcp"],
      "env": {
        "STRIPE_SECRET_KEY": "${STRIPE_SECRET_KEY}"
      }
    },
    "sendgrid": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@sendgrid/mcp-server"],
      "env": {
        "SENDGRID_API_KEY": "${SENDGRID_API_KEY}"
      }
    },
    "posthog": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "posthog-mcp-server"],
      "env": {
        "POSTHOG_API_KEY": "${POSTHOG_API_KEY}",
        "POSTHOG_HOST": "https://app.posthog.com"
      }
    },
    "openai": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@openai/mcp-server"],
      "env": {
        "OPENAI_API_KEY": "${OPENAI_API_KEY}"
      }
    }
  }
}
```

---

## VARIABLES D'ENVIRONNEMENT REQUISES

Ajouter dans `.env` ou variables système:

```bash
# Stripe (Paiements)
STRIPE_SECRET_KEY=sk_test_xxx

# SendGrid (Email)
SENDGRID_API_KEY=SG.xxx

# PostHog (Analytics)
POSTHOG_API_KEY=phc_xxx
POSTHOG_HOST=https://app.posthog.com

# OpenAI (GPT/DALL-E)
OPENAI_API_KEY=sk-xxx
```

---

## INTÉGRATION AVEC LES TEMPLATES

### Template SaaS
- **Stripe**: Checkout, abonnements, webhooks
- **SendGrid**: Emails transactionnels, welcome, billing
- **PostHog**: Analytics produit, feature flags

### Template E-commerce
- **Stripe**: Paiements, remboursements
- **SendGrid**: Confirmations commande, shipping
- **PostHog**: Funnel conversion, A/B tests

### Template AI-Assistant
- **OpenAI**: Fallback GPT-4o si Ollama indisponible
- **PostHog**: Usage tracking

---

## ALTERNATIVES

| Service | Alternative Gratuite |
|---------|---------------------|
| SendGrid | Resend, Mailgun (tier gratuit) |
| PostHog | Plausible, Umami (self-hosted) |
| OpenAI | Ollama (local), Claude API |
| Stripe | LemonSqueezy, Paddle |

---

*Phase 2D MCPs - ULTRA-CREATE v24.0 - Décembre 2025*
