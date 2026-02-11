"""
Subscription Tools for Stripe Agent
ULTRA-CREATE v27.9
"""

import stripe
from typing import Optional


def create_subscription(
    customer_id: str,
    price_id: str,
    trial_period_days: Optional[int] = None
) -> dict:
    """
    Create a new subscription for a customer.

    Args:
        customer_id: The customer ID (cus_xxx)
        price_id: The price ID for the subscription
        trial_period_days: Number of trial days (optional)

    Returns:
        Created subscription object
    """
    params = {
        "customer": customer_id,
        "items": [{"price": price_id}],
        "payment_behavior": "default_incomplete",
        "expand": ["latest_invoice.payment_intent"]
    }

    if trial_period_days:
        params["trial_period_days"] = trial_period_days

    subscription = stripe.Subscription.create(**params)

    return {
        "id": subscription.id,
        "status": subscription.status,
        "current_period_start": subscription.current_period_start,
        "current_period_end": subscription.current_period_end,
        "customer": subscription.customer,
        "trial_end": subscription.trial_end
    }


def cancel_subscription(
    subscription_id: str,
    cancel_at_period_end: bool = True
) -> dict:
    """
    Cancel a subscription.

    Args:
        subscription_id: The subscription ID (sub_xxx)
        cancel_at_period_end: If True, cancel at end of period

    Returns:
        Updated subscription object
    """
    if cancel_at_period_end:
        subscription = stripe.Subscription.modify(
            subscription_id,
            cancel_at_period_end=True
        )
    else:
        subscription = stripe.Subscription.cancel(subscription_id)

    return {
        "id": subscription.id,
        "status": subscription.status,
        "cancel_at_period_end": subscription.cancel_at_period_end,
        "canceled_at": subscription.canceled_at
    }


def list_subscriptions(
    customer_id: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 10
) -> list:
    """
    List subscriptions.

    Args:
        customer_id: Filter by customer (optional)
        status: Filter by status ('active', 'canceled', etc.)
        limit: Maximum number to return

    Returns:
        List of subscription objects
    """
    params = {"limit": limit}

    if customer_id:
        params["customer"] = customer_id
    if status:
        params["status"] = status

    subscriptions = stripe.Subscription.list(**params)

    return [
        {
            "id": s.id,
            "status": s.status,
            "customer": s.customer,
            "current_period_end": s.current_period_end
        }
        for s in subscriptions.data
    ]


def update_subscription(
    subscription_id: str,
    new_price_id: str,
    proration_behavior: str = "create_prorations"
) -> dict:
    """
    Update a subscription (upgrade/downgrade).

    Args:
        subscription_id: The subscription ID
        new_price_id: The new price ID
        proration_behavior: 'create_prorations', 'none', or 'always_invoice'

    Returns:
        Updated subscription object
    """
    # Get current subscription
    subscription = stripe.Subscription.retrieve(subscription_id)

    # Update to new price
    updated = stripe.Subscription.modify(
        subscription_id,
        items=[{
            "id": subscription["items"]["data"][0]["id"],
            "price": new_price_id
        }],
        proration_behavior=proration_behavior
    )

    return {
        "id": updated.id,
        "status": updated.status,
        "items": [
            {"price": item.price.id}
            for item in updated["items"]["data"]
        ]
    }
