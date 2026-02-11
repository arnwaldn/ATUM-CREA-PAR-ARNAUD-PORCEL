"""
Customer Tools for Stripe Agent
ULTRA-CREATE v27.9
"""

import stripe
from typing import Optional


def create_customer(
    email: str,
    name: Optional[str] = None,
    metadata: Optional[dict] = None
) -> dict:
    """
    Create a new Stripe customer.

    Args:
        email: Customer email address
        name: Customer name (optional)
        metadata: Additional metadata (optional)

    Returns:
        Created customer object
    """
    params = {"email": email}

    if name:
        params["name"] = name
    if metadata:
        params["metadata"] = metadata

    customer = stripe.Customer.create(**params)

    return {
        "id": customer.id,
        "email": customer.email,
        "name": customer.name,
        "created": customer.created
    }


def list_customers(
    limit: int = 10,
    email: Optional[str] = None
) -> list:
    """
    List Stripe customers.

    Args:
        limit: Maximum number of customers to return
        email: Filter by email (optional)

    Returns:
        List of customer objects
    """
    params = {"limit": limit}

    if email:
        params["email"] = email

    customers = stripe.Customer.list(**params)

    return [
        {
            "id": c.id,
            "email": c.email,
            "name": c.name,
            "created": c.created
        }
        for c in customers.data
    ]


def retrieve_customer(customer_id: str) -> dict:
    """
    Retrieve a Stripe customer by ID.

    Args:
        customer_id: The customer ID (cus_xxx)

    Returns:
        Customer object
    """
    customer = stripe.Customer.retrieve(customer_id)

    return {
        "id": customer.id,
        "email": customer.email,
        "name": customer.name,
        "created": customer.created,
        "balance": customer.balance,
        "currency": customer.currency,
        "default_source": customer.default_source
    }
