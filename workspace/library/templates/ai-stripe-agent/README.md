# AI Stripe Agent Template

> **ULTRA-CREATE v27.9** | AI Agent for Stripe Payment Operations
> **Source**: Patterns from github.com/stripe/ai

---

## Overview

Agent AI autonome pour gerer les operations de paiement Stripe via langage naturel.
Utilise Phidata + Stripe Agent Toolkit pour exposer les APIs Stripe aux LLMs.

## Features

- **Customer Management** - CRUD clients Stripe
- **Payment Links** - Creation de liens de paiement
- **Subscriptions** - Gestion abonnements
- **Invoices** - Creation et envoi factures
- **Configuration-Driven** - Actions explicitement autorisees

## Quick Start

### 1. Installation

```bash
# Creer environnement virtuel
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# ou
.venv\Scripts\activate  # Windows

# Installer dependances
pip install -r requirements.txt
```

### 2. Configuration

```bash
# Copier le fichier d'exemple
cp .env.example .env

# Editer avec vos cles
STRIPE_SECRET_KEY=sk_test_...
OPENAI_API_KEY=sk-...
```

### 3. Lancement

```bash
# Mode CLI
python -m src.agent

# Mode API (optionnel)
python -m src.api
```

## Usage

### CLI Interactive

```
$ python -m src.agent

> Create a customer with email john@example.com
Creating customer...
Customer created: cus_xxx (john@example.com)

> List all customers
Fetching customers...
1. cus_xxx - john@example.com
2. cus_yyy - jane@example.com

> Create a payment link for $50
Creating payment link...
Payment link: https://buy.stripe.com/xxx
```

### Programmatic

```python
from src.agent import StripePaymentAgent

agent = StripePaymentAgent()

# Natural language interaction
response = agent.run("Create a customer for bob@example.com")
print(response)

# Direct tool access
customer = agent.create_customer(email="alice@example.com")
```

## Configuration

### Actions Enablement

Par defaut, seules les actions de lecture sont activees.
Modifier `src/config.py` pour activer les actions d'ecriture:

```python
STRIPE_CONFIG = {
    "actions": {
        "customers": {
            "create": True,   # Activer
            "list": True,
            "retrieve": True,
            "update": False,  # Desactiver
            "delete": False
        },
        "payment_links": {
            "create": True
        },
        "subscriptions": {
            "create": True,
            "cancel": True
        }
    }
}
```

## Project Structure

```
ai-stripe-agent/
├── README.md
├── requirements.txt
├── pyproject.toml
├── .env.example
├── src/
│   ├── __init__.py
│   ├── agent.py          # Agent principal
│   ├── config.py         # Configuration
│   └── tools/
│       ├── __init__.py
│       ├── customers.py   # Customer tools
│       ├── payments.py    # Payment tools
│       ├── subscriptions.py
│       └── invoices.py
└── tests/
    └── test_agent.py
```

## Stack

| Component | Technology |
|-----------|------------|
| Agent Framework | Phidata |
| LLM | OpenAI GPT-4 / Claude |
| Payment SDK | stripe-agent-toolkit |
| Runtime | Python 3.12+ |

## Security

- **API Keys**: Jamais commiter les cles, utiliser `.env`
- **Actions**: Configuration-driven enablement
- **PCI**: Agent n'a jamais acces aux donnees carte

## License

MIT

---

*Template ULTRA-CREATE v27.9 | AI Stripe Agent*
