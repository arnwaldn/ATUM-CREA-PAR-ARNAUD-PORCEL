"""
Stripe Tools for AI Agent
ULTRA-CREATE v27.9

Fallback tools when stripe-agent-toolkit is not available
"""

from .customers import (
    create_customer,
    list_customers,
    retrieve_customer
)
from .payments import (
    create_payment_link,
    list_payment_links
)
from .subscriptions import (
    create_subscription,
    cancel_subscription,
    list_subscriptions
)
from .invoices import (
    create_invoice,
    finalize_invoice,
    list_invoices
)


def get_stripe_tools(secret_key: str, config: dict) -> list:
    """Get list of enabled Stripe tools based on configuration."""
    import stripe
    stripe.api_key = secret_key

    tools = []
    actions = config.get("actions", {})

    # Customers
    if actions.get("customers", {}).get("create"):
        tools.append(create_customer)
    if actions.get("customers", {}).get("list"):
        tools.append(list_customers)
    if actions.get("customers", {}).get("retrieve"):
        tools.append(retrieve_customer)

    # Payment Links
    if actions.get("payment_links", {}).get("create"):
        tools.append(create_payment_link)
    if actions.get("payment_links", {}).get("list"):
        tools.append(list_payment_links)

    # Subscriptions
    if actions.get("subscriptions", {}).get("create"):
        tools.append(create_subscription)
    if actions.get("subscriptions", {}).get("cancel"):
        tools.append(cancel_subscription)
    if actions.get("subscriptions", {}).get("list"):
        tools.append(list_subscriptions)

    # Invoices
    if actions.get("invoices", {}).get("create"):
        tools.append(create_invoice)
    if actions.get("invoices", {}).get("finalize"):
        tools.append(finalize_invoice)
    if actions.get("invoices", {}).get("list"):
        tools.append(list_invoices)

    return tools


__all__ = [
    "get_stripe_tools",
    "create_customer",
    "list_customers",
    "retrieve_customer",
    "create_payment_link",
    "list_payment_links",
    "create_subscription",
    "cancel_subscription",
    "list_subscriptions",
    "create_invoice",
    "finalize_invoice",
    "list_invoices",
]
