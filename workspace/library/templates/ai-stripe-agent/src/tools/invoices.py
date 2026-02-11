"""
Invoice Tools for Stripe Agent
ULTRA-CREATE v27.9
"""

import stripe
from typing import Optional


def create_invoice(
    customer_id: str,
    description: Optional[str] = None,
    auto_advance: bool = False
) -> dict:
    """
    Create a draft invoice for a customer.

    Args:
        customer_id: The customer ID (cus_xxx)
        description: Invoice description (optional)
        auto_advance: If True, finalize and send automatically

    Returns:
        Created invoice object
    """
    params = {
        "customer": customer_id,
        "auto_advance": auto_advance
    }

    if description:
        params["description"] = description

    invoice = stripe.Invoice.create(**params)

    return {
        "id": invoice.id,
        "status": invoice.status,
        "customer": invoice.customer,
        "amount_due": invoice.amount_due,
        "currency": invoice.currency,
        "created": invoice.created
    }


def add_invoice_item(
    customer_id: str,
    amount: int,
    currency: str = "usd",
    description: str = "Item"
) -> dict:
    """
    Add an item to a customer's next invoice.

    Args:
        customer_id: The customer ID
        amount: Amount in cents
        currency: Currency code
        description: Item description

    Returns:
        Created invoice item object
    """
    item = stripe.InvoiceItem.create(
        customer=customer_id,
        amount=amount,
        currency=currency,
        description=description
    )

    return {
        "id": item.id,
        "amount": item.amount,
        "currency": item.currency,
        "description": item.description
    }


def finalize_invoice(invoice_id: str) -> dict:
    """
    Finalize a draft invoice.

    Args:
        invoice_id: The invoice ID (in_xxx)

    Returns:
        Finalized invoice object
    """
    invoice = stripe.Invoice.finalize_invoice(invoice_id)

    return {
        "id": invoice.id,
        "status": invoice.status,
        "amount_due": invoice.amount_due,
        "hosted_invoice_url": invoice.hosted_invoice_url,
        "invoice_pdf": invoice.invoice_pdf
    }


def send_invoice(invoice_id: str) -> dict:
    """
    Send a finalized invoice to the customer.

    Args:
        invoice_id: The invoice ID

    Returns:
        Sent invoice object
    """
    invoice = stripe.Invoice.send_invoice(invoice_id)

    return {
        "id": invoice.id,
        "status": invoice.status,
        "sent_at": invoice.status_transitions.get("sent_at")
    }


def list_invoices(
    customer_id: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 10
) -> list:
    """
    List invoices.

    Args:
        customer_id: Filter by customer (optional)
        status: Filter by status ('draft', 'open', 'paid', 'void')
        limit: Maximum number to return

    Returns:
        List of invoice objects
    """
    params = {"limit": limit}

    if customer_id:
        params["customer"] = customer_id
    if status:
        params["status"] = status

    invoices = stripe.Invoice.list(**params)

    return [
        {
            "id": i.id,
            "status": i.status,
            "customer": i.customer,
            "amount_due": i.amount_due,
            "currency": i.currency
        }
        for i in invoices.data
    ]
