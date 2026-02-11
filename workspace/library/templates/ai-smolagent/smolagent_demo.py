"""
Smolagents Demo - Lightweight Code-First AI Agents
ULTRA-CREATE v27.4

This demo showcases the core patterns of HuggingFace's Smolagents:
1. Basic CodeAgent
2. Tool integration
3. Multi-agent orchestration
"""

from smolagents import (
    CodeAgent,
    ToolCallingAgent,
    InferenceClientModel,
    WebSearchTool,
    ManagedAgent,
    tool,
    load_tool
)
import os
from dotenv import load_dotenv

load_dotenv()


# =============================================================================
# CUSTOM TOOLS
# =============================================================================

@tool
def calculate_compound_interest(
    principal: float,
    rate: float,
    years: int
) -> str:
    """Calculate compound interest on an investment.

    Args:
        principal: Initial investment amount
        rate: Annual interest rate (as decimal, e.g., 0.05 for 5%)
        years: Number of years

    Returns:
        Formatted string with calculation results
    """
    final_amount = principal * (1 + rate) ** years
    interest_earned = final_amount - principal
    return f"""
    Principal: ${principal:,.2f}
    Rate: {rate * 100}% annually
    Duration: {years} years
    Final Amount: ${final_amount:,.2f}
    Interest Earned: ${interest_earned:,.2f}
    """


@tool
def analyze_text_sentiment(text: str) -> str:
    """Analyze the sentiment of a given text.

    Args:
        text: The text to analyze

    Returns:
        Sentiment analysis result
    """
    # Simple keyword-based sentiment (replace with actual model in production)
    positive_words = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'love']
    negative_words = ['bad', 'terrible', 'awful', 'hate', 'worst', 'disappointing']

    text_lower = text.lower()
    positive_count = sum(1 for word in positive_words if word in text_lower)
    negative_count = sum(1 for word in negative_words if word in text_lower)

    if positive_count > negative_count:
        return f"Positive sentiment (score: +{positive_count - negative_count})"
    elif negative_count > positive_count:
        return f"Negative sentiment (score: {positive_count - negative_count})"
    else:
        return "Neutral sentiment (score: 0)"


# =============================================================================
# BASIC CODE AGENT
# =============================================================================

def demo_basic_agent():
    """Demonstrate basic CodeAgent usage."""
    print("\n" + "=" * 60)
    print("DEMO 1: Basic CodeAgent")
    print("=" * 60)

    # Initialize model (uses HuggingFace Inference API)
    model = InferenceClientModel(
        model_id="Qwen/Qwen2.5-Coder-32B-Instruct"
    )

    # Create agent
    agent = CodeAgent(
        tools=[],
        model=model
    )

    # Run a computation task
    result = agent.run(
        "Calculate the first 10 prime numbers and return them as a list"
    )
    print(f"Result: {result}")


# =============================================================================
# AGENT WITH CUSTOM TOOLS
# =============================================================================

def demo_agent_with_tools():
    """Demonstrate agent with custom tools."""
    print("\n" + "=" * 60)
    print("DEMO 2: Agent with Custom Tools")
    print("=" * 60)

    model = InferenceClientModel()

    # Create agent with custom tools
    agent = CodeAgent(
        tools=[calculate_compound_interest, analyze_text_sentiment],
        model=model
    )

    # Financial calculation
    result = agent.run(
        "If I invest $10,000 at 7% annual interest for 20 years, "
        "how much will I have?"
    )
    print(f"Investment Result: {result}")

    # Sentiment analysis
    result = agent.run(
        "Analyze the sentiment of: 'This product is absolutely amazing! "
        "Best purchase I ever made.'"
    )
    print(f"Sentiment Result: {result}")


# =============================================================================
# WEB SEARCH AGENT
# =============================================================================

def demo_web_search_agent():
    """Demonstrate agent with web search capability."""
    print("\n" + "=" * 60)
    print("DEMO 3: Web Search Agent")
    print("=" * 60)

    model = InferenceClientModel()
    search_tool = WebSearchTool()

    agent = CodeAgent(
        tools=[search_tool],
        model=model,
        planning_interval=3  # Enable planning every 3 steps
    )

    result = agent.run(
        "What are the top 3 programming languages in 2025?"
    )
    print(f"Search Result: {result}")


# =============================================================================
# MULTI-AGENT SYSTEM
# =============================================================================

def demo_multi_agent():
    """Demonstrate multi-agent orchestration with ManagedAgent."""
    print("\n" + "=" * 60)
    print("DEMO 4: Multi-Agent System")
    print("=" * 60)

    model = InferenceClientModel()

    # Create specialized research agent
    research_agent = CodeAgent(
        tools=[WebSearchTool()],
        model=model
    )

    # Wrap as managed agent
    managed_research = ManagedAgent(
        agent=research_agent,
        name="researcher",
        description="Searches the web for information. Give it a research query."
    )

    # Create specialized analysis agent
    analysis_agent = CodeAgent(
        tools=[analyze_text_sentiment, calculate_compound_interest],
        model=model
    )

    managed_analysis = ManagedAgent(
        agent=analysis_agent,
        name="analyst",
        description="Analyzes data and performs calculations. Give it analysis tasks."
    )

    # Create manager agent that orchestrates both
    manager = CodeAgent(
        tools=[],
        model=model,
        managed_agents=[managed_research, managed_analysis],
        additional_authorized_imports=["pandas", "numpy", "json"]
    )

    # Run complex task requiring multiple agents
    result = manager.run(
        "Research the current state of renewable energy investments, "
        "then calculate how much a $50,000 investment at 8% would grow in 15 years."
    )
    print(f"Multi-Agent Result: {result}")


# =============================================================================
# TOOL CALLING AGENT (Alternative to CodeAgent)
# =============================================================================

def demo_tool_calling_agent():
    """Demonstrate ToolCallingAgent for structured tool outputs."""
    print("\n" + "=" * 60)
    print("DEMO 5: ToolCallingAgent (JSON Output)")
    print("=" * 60)

    model = InferenceClientModel()

    # ToolCallingAgent outputs JSON instead of executing code
    agent = ToolCallingAgent(
        tools=[calculate_compound_interest],
        model=model
    )

    result = agent.run(
        "Calculate compound interest on $5,000 at 6% for 10 years"
    )
    print(f"Tool Calling Result: {result}")


# =============================================================================
# MAIN
# =============================================================================

def main():
    """Run all demos."""
    print("\n" + "=" * 60)
    print("SMOLAGENTS DEMO - HuggingFace Lightweight Agents")
    print("ULTRA-CREATE v27.4")
    print("=" * 60)

    # Check for HuggingFace token
    if not os.getenv("HF_TOKEN"):
        print("\nWARNING: HF_TOKEN not set. Some features may be limited.")
        print("Set it with: export HF_TOKEN='your-token'")

    try:
        # Run demos (comment out as needed)
        demo_basic_agent()
        demo_agent_with_tools()
        demo_web_search_agent()
        demo_multi_agent()
        demo_tool_calling_agent()

    except Exception as e:
        print(f"\nError: {e}")
        print("Make sure you have a valid HF_TOKEN for InferenceClientModel")


if __name__ == "__main__":
    main()
