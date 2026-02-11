"""
Payment Tools for Stripe Agent
ULTRA-CREATE v27.9
"""

import stripe
from typing import Optional


def create_payment_link(
    price_id: str,
    quantity: int = 1,
    after_completion_type: str = "redirect",
    after_completion_url: Optional[str] = None
) -> dict:
    """
    Create a Stripe Payment Link.

    Args:
        price_id: The price ID to use (price_xxx)
        quantity: Number of items
        after_completion_type: 'redirect' or 'hosted_confirmation'
        after_completion_url: URL to redirect after payment

    Returns:
        Payment link object with URL
    """
    params = {
        "line_items": [{"price": price_id, "quantity": quantity}]
    }

    if after_completion_type == "redirect" and after_completion_url:
        params["after_completion"] = {
            "type": "redirect",
            "redirect": {"url": after_completion_url}
        }

    link = stripe.PaymentLink.create(**params)

    return {
        "id": link.id,
        "url": link.url,
        "active": link.active,
        "created": link.created
    }


def list_payment_links(
    limit: int = 10,
    active: Optional[bool] = None
) -> list:
    """
    List Stripe Payment Links.

    Args:
        limit: Maximum number of links to return
        active: Filter by active status

    Returns:
        List of payment link objects
    """
    params = {"limit": limit}

    if active is not None:
        params["active"] = active

    links = stripe.PaymentLink.list(**params)

    return [
        {
            "id": l.id,
            "url": l.url,
            "active": l.active,
            "created": l.created
        }
        for l in links.data
    ]


def create_checkout_session(
    price_id: str,
    success_url: str,
    cancel_url: str,
    mode: str = "payment",
    customer_email: Optional[str] = None
) -> dict:
    """
    Create a Stripe Checkout Session.

    Args:
        price_id: The price ID to use
        success_url: URL to redirect on success
        cancel_url: URL to redirect on cancel
        mode: 'payment', 'subscription', or 'setup'
        customer_email: Pre-fill customer email

    Returns:
        Checkout session with URL
    """
    params = {
        "mode": mode,
        "line_items": [{"price": price_id, "quantity": 1}],
        "success_url": success_url + "?session_id={CHECKOUT_SESSION_ID}",
        "cancel_url": cancel_url
    }

    if customer_email:
        params["customer_email"] = customer_email

    session = stripe.checkout.Session.create(**params)

    return {
        "id": session.id,
        "url": session.url,
        "status": session.status,
        "mode": session.mode
    }
