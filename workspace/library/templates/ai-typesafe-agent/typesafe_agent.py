"""
TypeSafe Agent Template - Agno 2.0
ULTRA-CREATE v27.3 Template

Features:
- Pydantic input/output schemas for type safety
- Structured, deterministic agent responses
- Parser model for JSON conversion
- Multiple tool integrations
- Observability with Traceloop (optional)

Stack: Agno 2.0, Pydantic, OpenAI, yfinance
"""

from typing import List, Optional
from dataclasses import dataclass
from pydantic import BaseModel, Field
from agno.agent import Agent
from agno.models.openai import OpenAIChat
from agno.models.anthropic import Claude  # Alternative: Claude
from agno.tools.yfinance import YFinanceTools
from agno.tools.duckduckgo import DuckDuckGoTools
from rich.pretty import pprint
from rich.console import Console
import os

# =============================================================================
# Configuration
# =============================================================================

@dataclass
class AgentConfig:
    """Agent configuration"""
    PRIMARY_MODEL: str = "gpt-4o-mini"
    PARSER_MODEL: str = "gpt-4o-mini"
    TEMPERATURE: float = 0.7
    MAX_TOKENS: int = 4096


config = AgentConfig()
console = Console()


# =============================================================================
# Input Schemas (Define what goes IN)
# =============================================================================

class StockAnalysisInput(BaseModel):
    """Input schema for stock market analysis"""
    stock_symbol: str = Field(..., description="Stock ticker symbol (e.g., AAPL, GOOGL)")
    days_required: int = Field(default=30, description="Number of days of historical data")
    include_news: bool = Field(default=True, description="Include recent news analysis")


class ResearchInput(BaseModel):
    """Input schema for research tasks"""
    topic: str = Field(..., description="Research topic or question")
    depth: str = Field(default="medium", description="Research depth: quick, medium, deep")
    max_sources: int = Field(default=5, description="Maximum number of sources to consult")


class ContentGenerationInput(BaseModel):
    """Input schema for content generation"""
    topic: str = Field(..., description="Content topic")
    format: str = Field(default="article", description="Output format: article, summary, bullet_points")
    tone: str = Field(default="professional", description="Writing tone")
    word_count: int = Field(default=500, description="Target word count")


# =============================================================================
# Output Schemas (Define what comes OUT)
# =============================================================================

class StockAnalysisOutput(BaseModel):
    """Structured output for stock analysis"""
    summary: str = Field(..., description="Executive summary of the analysis")
    current_price: float = Field(..., description="Current stock price")
    insights: List[str] = Field(..., description="Key insights from the analysis")
    recent_trends: List[str] = Field(..., description="Recent market trends")
    financial_metrics: List[str] = Field(..., description="Important financial metrics")
    recommendation: str = Field(..., description="Buy/Hold/Sell recommendation with reasoning")
    risk_factors: List[str] = Field(..., description="Identified risk factors")
    sources: List[str] = Field(..., description="Data sources used")


class ResearchOutput(BaseModel):
    """Structured output for research tasks"""
    summary: str = Field(..., description="Research summary")
    key_findings: List[str] = Field(..., description="Key findings from research")
    supporting_evidence: List[str] = Field(..., description="Evidence supporting findings")
    counterpoints: List[str] = Field(default=[], description="Opposing viewpoints")
    recommendations: List[str] = Field(..., description="Actionable recommendations")
    sources: List[str] = Field(..., description="Sources consulted")
    confidence_level: str = Field(..., description="Confidence level: low, medium, high")


class ContentOutput(BaseModel):
    """Structured output for content generation"""
    title: str = Field(..., description="Generated title")
    content: str = Field(..., description="Main content")
    key_points: List[str] = Field(..., description="Key points covered")
    word_count: int = Field(..., description="Actual word count")
    seo_keywords: List[str] = Field(default=[], description="Suggested SEO keywords")


# =============================================================================
# TypeSafe Agent Factory
# =============================================================================

class TypeSafeAgentFactory:
    """Factory for creating type-safe agents"""

    @staticmethod
    def create_stock_analyzer() -> Agent:
        """Create a stock market analyzer agent"""
        return Agent(
            name="Stock Market Analyzer",
            model=OpenAIChat(id=config.PRIMARY_MODEL),
            tools=[YFinanceTools()],
            instructions="""
            You are an expert stock market analyst. Analyze the given stock symbol
            using available market data. Provide comprehensive insights including
            financial metrics, trends, and actionable recommendations.

            Be objective and data-driven in your analysis.
            Always cite your data sources.
            """,
            input_schema=StockAnalysisInput,
            output_schema=StockAnalysisOutput,
            parser_model=OpenAIChat(id=config.PARSER_MODEL)
        )

    @staticmethod
    def create_researcher() -> Agent:
        """Create a research agent"""
        return Agent(
            name="Research Agent",
            model=OpenAIChat(id=config.PRIMARY_MODEL),
            tools=[DuckDuckGoTools()],
            instructions="""
            You are a thorough research agent. Investigate the given topic
            by searching for relevant information from multiple sources.

            Evaluate source credibility and provide balanced viewpoints.
            Include both supporting evidence and counterpoints.
            Rate your confidence based on source quality and consensus.
            """,
            input_schema=ResearchInput,
            output_schema=ResearchOutput,
            parser_model=OpenAIChat(id=config.PARSER_MODEL)
        )

    @staticmethod
    def create_content_generator() -> Agent:
        """Create a content generation agent"""
        return Agent(
            name="Content Generator",
            model=OpenAIChat(id=config.PRIMARY_MODEL),
            tools=[DuckDuckGoTools()],
            instructions="""
            You are an expert content creator. Generate high-quality content
            based on the provided topic, format, and tone requirements.

            Research the topic to ensure accuracy and depth.
            Match the requested word count as closely as possible.
            Suggest relevant SEO keywords for discoverability.
            """,
            input_schema=ContentGenerationInput,
            output_schema=ContentOutput,
            parser_model=OpenAIChat(id=config.PARSER_MODEL)
        )

    @staticmethod
    def create_custom_agent(
        name: str,
        instructions: str,
        input_schema: type[BaseModel],
        output_schema: type[BaseModel],
        tools: list = None,
        model_id: str = None
    ) -> Agent:
        """Create a custom type-safe agent"""
        return Agent(
            name=name,
            model=OpenAIChat(id=model_id or config.PRIMARY_MODEL),
            tools=tools or [],
            instructions=instructions,
            input_schema=input_schema,
            output_schema=output_schema,
            parser_model=OpenAIChat(id=config.PARSER_MODEL)
        )


# =============================================================================
# Usage Examples
# =============================================================================

def example_stock_analysis():
    """Example: Analyze a stock"""
    console.print("\n[bold blue]Stock Analysis Example[/bold blue]")

    agent = TypeSafeAgentFactory.create_stock_analyzer()

    input_data = StockAnalysisInput(
        stock_symbol="AAPL",
        days_required=30,
        include_news=True
    )

    response = agent.run(input=input_data)

    console.print("\n[bold green]Response:[/bold green]")
    pprint(response.content)

    return response.content


def example_research():
    """Example: Research a topic"""
    console.print("\n[bold blue]Research Example[/bold blue]")

    agent = TypeSafeAgentFactory.create_researcher()

    input_data = ResearchInput(
        topic="Impact of AI on software development productivity",
        depth="medium",
        max_sources=5
    )

    response = agent.run(input=input_data)

    console.print("\n[bold green]Response:[/bold green]")
    pprint(response.content)

    return response.content


def example_content_generation():
    """Example: Generate content"""
    console.print("\n[bold blue]Content Generation Example[/bold blue]")

    agent = TypeSafeAgentFactory.create_content_generator()

    input_data = ContentGenerationInput(
        topic="Best practices for building AI agents",
        format="article",
        tone="professional",
        word_count=800
    )

    response = agent.run(input=input_data)

    console.print("\n[bold green]Response:[/bold green]")
    pprint(response.content)

    return response.content


def example_custom_agent():
    """Example: Create a custom type-safe agent"""
    console.print("\n[bold blue]Custom Agent Example[/bold blue]")

    # Define custom schemas
    class TaskInput(BaseModel):
        task_description: str = Field(..., description="Description of the task")
        priority: str = Field(default="medium", description="Task priority")

    class TaskOutput(BaseModel):
        subtasks: List[str] = Field(..., description="Breakdown of subtasks")
        estimated_hours: float = Field(..., description="Estimated time in hours")
        dependencies: List[str] = Field(default=[], description="Task dependencies")
        suggestions: List[str] = Field(..., description="Implementation suggestions")

    # Create custom agent
    agent = TypeSafeAgentFactory.create_custom_agent(
        name="Task Planner",
        instructions="""
        You are a project planning expert. Break down tasks into
        actionable subtasks with time estimates and dependencies.
        Provide practical implementation suggestions.
        """,
        input_schema=TaskInput,
        output_schema=TaskOutput
    )

    input_data = TaskInput(
        task_description="Build a user authentication system with OAuth2",
        priority="high"
    )

    response = agent.run(input=input_data)

    console.print("\n[bold green]Response:[/bold green]")
    pprint(response.content)

    return response.content


# =============================================================================
# Main Entry Point
# =============================================================================

def main():
    """Run all examples"""
    console.print("[bold magenta]TypeSafe Agent Template - Agno 2.0[/bold magenta]")
    console.print("=" * 50)

    # Check API key
    if not os.getenv("OPENAI_API_KEY"):
        console.print("[bold red]Error: OPENAI_API_KEY not set[/bold red]")
        console.print("Set it with: export OPENAI_API_KEY='your-key'")
        return

    # Run examples
    try:
        # Uncomment the examples you want to run

        # example_stock_analysis()
        # example_research()
        # example_content_generation()
        example_custom_agent()

    except Exception as e:
        console.print(f"[bold red]Error: {e}[/bold red]")
        raise


if __name__ == "__main__":
    main()
