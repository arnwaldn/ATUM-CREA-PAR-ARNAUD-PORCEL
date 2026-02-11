"""
Configuration for AI Stripe Agent
ULTRA-CREATE v27.9

Pattern: Configuration-Driven Action Enablement
Source: github.com/stripe/ai
"""

import os
from dotenv import load_dotenv

load_dotenv()

# Stripe Configuration
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY")

# LLM Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
LLM_MODEL = os.getenv("LLM_MODEL", "gpt-4-turbo")

# Configuration-Driven Action Enablement
# Security-first: Only enable what you need
STRIPE_CONFIG = {
    "actions": {
        # Customer Management
        "customers": {
            "create": True,
            "list": True,
            "retrieve": True,
            "update": False,  # Read-only by default
            "delete": False   # Never delete automatically
        },

        # Payment Links
        "payment_links": {
            "create": True,
            "list": True
        },

        # Subscriptions
        "subscriptions": {
            "create": True,
            "list": True,
            "retrieve": True,
            "update": False,
            "cancel": True    # Allow cancellation
        },

        # Invoices
        "invoices": {
            "create": True,
            "list": True,
            "retrieve": True,
            "finalize": True,
            "pay": False,     # Manual payment only
            "void": False     # Dangerous action
        },

        # Prices & Products
        "prices": {
            "list": True,
            "retrieve": True,
            "create": False   # Use dashboard for price creation
        },
        "products": {
            "list": True,
            "retrieve": True,
            "create": False
        },

        # Balance & Payouts (read-only)
        "balance": {
            "retrieve": True
        },
        "payouts": {
            "list": True
        }
    },

    # Context for Stripe Connect (optional)
    # Uncomment and set if using connected accounts
    # "context": {
    #     "account": "acct_connected_123"
    # }
}

# Agent Configuration
AGENT_CONFIG = {
    "name": "Stripe Payment Agent",
    "description": "AI agent for managing Stripe payment operations",
    "temperature": 0.3,  # Lower for more deterministic responses
    "max_tokens": 1000,
    "verbose": True
}
