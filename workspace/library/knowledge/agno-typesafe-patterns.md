# Agno TypeSafe Agent Patterns
## ULTRA-CREATE v27.3 Knowledge File

> **Purpose**: Build reliable, deterministic AI agents with Pydantic schemas using Agno 2.0 framework.

---

## Overview

TypeSafe Agents (Agno 2.0) provide:

| Feature | Benefit |
|---------|---------|
| **Input Schema** | Pydantic model defining expected input structure |
| **Output Schema** | Pydantic model defining guaranteed output structure |
| **Parser Model** | Dedicated LLM for JSON conversion |
| **Validation** | Automatic Pydantic validation on I/O |
| **Type Safety** | Full IDE autocomplete and type checking |

---

## Core Architecture

```
Input (Pydantic Model)
        │
        ▼
┌───────────────────┐
│   TypeSafe Agent  │
│  ┌─────────────┐  │
│  │ LLM Model   │  │  ← Primary reasoning model
│  └─────────────┘  │
│  ┌─────────────┐  │
│  │   Tools     │  │  ← Optional tool integrations
│  └─────────────┘  │
│  ┌─────────────┐  │
│  │Parser Model │  │  ← Converts output to schema
│  └─────────────┘  │
└───────────────────┘
        │
        ▼
Output (Pydantic Model)
```

---

## Installation

```bash
pip install agno>=2.0.0 pydantic>=2.0.0
```

---

## Basic Pattern

### 1. Define Input Schema

```python
from pydantic import BaseModel, Field
from typing import List, Optional

class ResearchInput(BaseModel):
    """What goes INTO the agent"""
    topic: str = Field(..., description="Research topic or question")
    depth: str = Field(default="medium", description="quick, medium, deep")
    max_sources: int = Field(default=5, ge=1, le=20)
    language: str = Field(default="en", description="Output language")
```

### 2. Define Output Schema

```python
class ResearchOutput(BaseModel):
    """What comes OUT of the agent - GUARANTEED structure"""
    summary: str = Field(..., description="Research summary")
    key_findings: List[str] = Field(..., min_length=1)
    supporting_evidence: List[str] = Field(...)
    counterpoints: List[str] = Field(default=[])
    recommendations: List[str] = Field(...)
    sources: List[str] = Field(...)
    confidence_level: str = Field(..., description="low, medium, high")
```

### 3. Create TypeSafe Agent

```python
from agno.agent import Agent
from agno.models.openai import OpenAIChat

agent = Agent(
    name="Research Agent",
    model=OpenAIChat(id="gpt-4o-mini"),
    instructions="""
    You are a thorough research agent.
    Evaluate source credibility and provide balanced viewpoints.
    Rate confidence based on source quality and consensus.
    """,
    input_schema=ResearchInput,
    output_schema=ResearchOutput,
    parser_model=OpenAIChat(id="gpt-4o-mini")  # Dedicated parser
)
```

### 4. Run with Structured Input

```python
# Create typed input
input_data = ResearchInput(
    topic="Impact of AI on software development",
    depth="medium",
    max_sources=5
)

# Run agent - returns typed output
response = agent.run(input=input_data)

# Access typed output
output: ResearchOutput = response.content
print(output.summary)
print(output.key_findings)
print(output.confidence_level)
```

---

## Advanced Patterns

### Factory Pattern

```python
from dataclasses import dataclass

@dataclass
class AgentConfig:
    PRIMARY_MODEL: str = "gpt-4o-mini"
    PARSER_MODEL: str = "gpt-4o-mini"
    TEMPERATURE: float = 0.7

class TypeSafeAgentFactory:
    """Factory for creating type-safe agents"""

    @staticmethod
    def create_agent(
        name: str,
        instructions: str,
        input_schema: type[BaseModel],
        output_schema: type[BaseModel],
        tools: list = None,
        config: AgentConfig = AgentConfig()
    ) -> Agent:
        return Agent(
            name=name,
            model=OpenAIChat(id=config.PRIMARY_MODEL),
            tools=tools or [],
            instructions=instructions,
            input_schema=input_schema,
            output_schema=output_schema,
            parser_model=OpenAIChat(id=config.PARSER_MODEL)
        )
```

### Tool Integration

```python
from agno.tools.yfinance import YFinanceTools
from agno.tools.duckduckgo import DuckDuckGoTools

class StockInput(BaseModel):
    symbol: str = Field(..., description="Stock ticker (e.g., AAPL)")
    include_news: bool = Field(default=True)

class StockOutput(BaseModel):
    summary: str
    current_price: float
    recommendation: str  # Buy/Hold/Sell
    risk_factors: List[str]

agent = Agent(
    name="Stock Analyzer",
    model=OpenAIChat(id="gpt-4o"),
    tools=[YFinanceTools(), DuckDuckGoTools()],  # Multiple tools
    instructions="Analyze stocks using market data...",
    input_schema=StockInput,
    output_schema=StockOutput,
    parser_model=OpenAIChat(id="gpt-4o-mini")
)
```

### Multi-Provider Support

```python
from agno.models.openai import OpenAIChat
from agno.models.anthropic import Claude
from agno.models.google import Gemini

# OpenAI
agent_openai = Agent(
    model=OpenAIChat(id="gpt-4o"),
    parser_model=OpenAIChat(id="gpt-4o-mini"),
    ...
)

# Anthropic Claude
agent_claude = Agent(
    model=Claude(id="claude-3-5-sonnet-20241022"),
    parser_model=Claude(id="claude-3-haiku-20240307"),
    ...
)

# Google Gemini
agent_gemini = Agent(
    model=Gemini(id="gemini-2.0-flash"),
    parser_model=Gemini(id="gemini-2.0-flash"),
    ...
)
```

### Nested Schemas

```python
class Location(BaseModel):
    city: str
    country: str
    coordinates: Optional[tuple[float, float]] = None

class WeatherData(BaseModel):
    temperature: float
    humidity: float
    conditions: str

class TravelInput(BaseModel):
    destination: Location
    dates: tuple[str, str]  # start, end
    preferences: List[str]

class TravelOutput(BaseModel):
    itinerary: List[dict]
    weather_forecast: List[WeatherData]
    estimated_cost: float
    recommendations: List[str]
```

---

## Observability with Traceloop

```python
from traceloop.sdk import Traceloop

# Initialize before creating agents
Traceloop.init(
    app_name="my-typesafe-agent",
    api_key="your-traceloop-key"  # Optional for local
)

# Agents automatically traced
agent = Agent(...)
response = agent.run(input=input_data)  # Traced!
```

---

## Schema Design Best Practices

### 1. Use Descriptive Field Descriptions

```python
# Good
class OrderInput(BaseModel):
    product_id: str = Field(..., description="SKU or product identifier")
    quantity: int = Field(..., ge=1, description="Number of items to order")

# Bad
class OrderInput(BaseModel):
    product_id: str
    quantity: int
```

### 2. Add Constraints

```python
class ReviewInput(BaseModel):
    rating: int = Field(..., ge=1, le=5, description="1-5 star rating")
    text: str = Field(..., min_length=10, max_length=1000)
    verified_purchase: bool = Field(default=False)
```

### 3. Use Enums for Fixed Options

```python
from enum import Enum

class Priority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class TaskInput(BaseModel):
    title: str
    priority: Priority  # Type-safe enum
```

### 4. Optional vs Required

```python
class FlexibleInput(BaseModel):
    required_field: str = Field(...)  # Required
    optional_field: Optional[str] = Field(None)  # Optional
    default_field: str = Field(default="default")  # Has default
```

---

## Common Agent Types

### Content Generator

```python
class ContentInput(BaseModel):
    topic: str
    format: Literal["article", "summary", "bullets"]
    tone: Literal["professional", "casual", "technical"]
    word_count: int = Field(default=500, ge=100, le=5000)

class ContentOutput(BaseModel):
    title: str
    content: str
    key_points: List[str]
    word_count: int
    seo_keywords: List[str] = Field(default=[])
```

### Data Extractor

```python
class ExtractionInput(BaseModel):
    text: str = Field(..., description="Raw text to extract from")
    entities: List[str] = Field(..., description="Entity types to extract")

class ExtractedEntity(BaseModel):
    type: str
    value: str
    confidence: float = Field(ge=0, le=1)

class ExtractionOutput(BaseModel):
    entities: List[ExtractedEntity]
    raw_text: str
    processing_notes: Optional[str] = None
```

### Decision Maker

```python
class DecisionInput(BaseModel):
    question: str
    options: List[str]
    criteria: List[str] = Field(default=[])
    context: Optional[str] = None

class DecisionOutput(BaseModel):
    recommendation: str
    reasoning: str
    pros_cons: dict[str, List[str]]
    confidence: float = Field(ge=0, le=1)
    alternatives: List[str] = Field(default=[])
```

---

## Error Handling

```python
from pydantic import ValidationError

try:
    response = agent.run(input=input_data)
    output = response.content
except ValidationError as e:
    print(f"Input/Output validation failed: {e}")
except Exception as e:
    print(f"Agent execution failed: {e}")
```

---

## Integration with ULTRA-CREATE

### Auto-Loading

This knowledge is auto-loaded when intents match:
- `agno`, `typesafe`, `type-safe`, `pydantic agent`, `structured agent`

### Related Templates

| Template | Description |
|----------|-------------|
| `ai-typesafe-agent` | Complete TypeSafe Agent starter |
| `ai-data-analysis` | Data analysis with typed outputs |
| `ai-research-agent` | Research with structured results |

### Agent Integration

| Agent | Uses |
|-------|------|
| `llm-integration-expert` | TypeSafe patterns for production |
| `api-designer` | Schema design for agent I/O |
| `prompt-engineer` | Instructions optimization |

---

## Comparison with Other Approaches

| Approach | Type Safety | Validation | IDE Support |
|----------|-------------|------------|-------------|
| **Agno TypeSafe** | Full | Automatic | Full |
| Raw LLM calls | None | Manual | None |
| LangChain | Partial | Optional | Partial |
| Instructor | Full | Automatic | Full |

**When to use Agno TypeSafe**:
- Need guaranteed output structure
- Building production pipelines
- Want IDE autocomplete
- Need automatic validation
- Integrating with typed codebases

---

## Resources

- [Agno Documentation](https://docs.agno.dev/)
- [Pydantic V2 Docs](https://docs.pydantic.dev/)
- [Traceloop Observability](https://traceloop.dev/)
- [BuildFastWithAI Examples](https://github.com/buildfastwithai/gen-ai-experiments)

---

*ULTRA-CREATE v27.3 | Agno TypeSafe Agent Patterns*
