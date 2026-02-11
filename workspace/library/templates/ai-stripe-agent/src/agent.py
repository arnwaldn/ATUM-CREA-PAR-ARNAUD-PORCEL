"""
AI Stripe Payment Agent
ULTRA-CREATE v27.9

Main agent implementation using Phidata + Stripe Agent Toolkit
"""

import os
from typing import Optional
from rich.console import Console
from rich.prompt import Prompt

from phi.agent import Agent
from phi.model.openai import OpenAIChat

try:
    from stripe_agent_toolkit import StripeAgentToolkit
    HAS_TOOLKIT = True
except ImportError:
    HAS_TOOLKIT = False
    print("Warning: stripe-agent-toolkit not installed. Using fallback tools.")

from .config import STRIPE_CONFIG, AGENT_CONFIG, STRIPE_SECRET_KEY, LLM_MODEL
from .tools import get_stripe_tools

console = Console()


class StripePaymentAgent:
    """AI Agent for Stripe Payment Operations."""

    def __init__(
        self,
        secret_key: Optional[str] = None,
        model: Optional[str] = None,
        config: Optional[dict] = None
    ):
        self.secret_key = secret_key or STRIPE_SECRET_KEY
        self.model = model or LLM_MODEL
        self.config = config or STRIPE_CONFIG

        if not self.secret_key:
            raise ValueError("STRIPE_SECRET_KEY is required")

        self._init_tools()
        self._init_agent()

    def _init_tools(self):
        """Initialize Stripe tools."""
        if HAS_TOOLKIT:
            self.toolkit = StripeAgentToolkit(
                secret_key=self.secret_key,
                configuration=self.config
            )
            self.tools = self.toolkit.get_tools()
        else:
            # Fallback to custom tools
            self.tools = get_stripe_tools(self.secret_key, self.config)

    def _init_agent(self):
        """Initialize Phidata agent."""
        self.agent = Agent(
            name=AGENT_CONFIG["name"],
            model=OpenAIChat(id=self.model),
            tools=self.tools,
            instructions=[
                "You are a Stripe payment management assistant.",
                "Help users with customer management, payments, and subscriptions.",
                "Always confirm before performing destructive actions.",
                "Never expose sensitive information like full API keys.",
                "Use appropriate Stripe tools based on user requests.",
            ],
            markdown=True,
            show_tool_calls=AGENT_CONFIG.get("verbose", True)
        )

    def run(self, message: str) -> str:
        """Process a natural language request."""
        response = self.agent.run(message)
        return response.content

    def chat(self, message: str) -> str:
        """Alias for run() - chat interface."""
        return self.run(message)

    # Direct tool access methods

    def create_customer(self, email: str, name: Optional[str] = None) -> dict:
        """Create a Stripe customer."""
        import stripe
        stripe.api_key = self.secret_key

        params = {"email": email}
        if name:
            params["name"] = name

        return stripe.Customer.create(**params)

    def list_customers(self, limit: int = 10) -> list:
        """List Stripe customers."""
        import stripe
        stripe.api_key = self.secret_key

        return stripe.Customer.list(limit=limit).data

    def create_payment_link(
        self,
        price_id: str,
        quantity: int = 1
    ) -> dict:
        """Create a payment link."""
        import stripe
        stripe.api_key = self.secret_key

        return stripe.PaymentLink.create(
            line_items=[{"price": price_id, "quantity": quantity}]
        )


def main():
    """CLI entry point."""
    console.print("[bold blue]AI Stripe Agent[/bold blue] v1.0.0")
    console.print("Type 'exit' to quit\n")

    try:
        agent = StripePaymentAgent()
    except ValueError as e:
        console.print(f"[red]Error: {e}[/red]")
        console.print("Please set STRIPE_SECRET_KEY in your .env file")
        return

    while True:
        try:
            user_input = Prompt.ask("\n[green]You[/green]")

            if user_input.lower() in ["exit", "quit", "q"]:
                console.print("[yellow]Goodbye![/yellow]")
                break

            if not user_input.strip():
                continue

            console.print("\n[blue]Agent[/blue]:")
            response = agent.run(user_input)
            console.print(response)

        except KeyboardInterrupt:
            console.print("\n[yellow]Interrupted. Goodbye![/yellow]")
            break
        except Exception as e:
            console.print(f"[red]Error: {e}[/red]")


if __name__ == "__main__":
    main()
