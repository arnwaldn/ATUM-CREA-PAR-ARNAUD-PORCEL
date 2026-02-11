# TypeSafe Agent Template

**Reliable, Deterministic AI Agents with Pydantic Schemas**

## Overview

TypeSafe Agents (introduced in Agno 2.0) take structured input and return structured output, making agentic software more reliable and deterministic.

## Key Features

- **Input Schema**: Pydantic model defining expected input structure
- **Output Schema**: Pydantic model defining guaranteed output structure
- **Parser Model**: Dedicated model for JSON conversion
- **Tool Integration**: YFinance, DuckDuckGo, and custom tools
- **Type Safety**: Full Python type hints throughout

## Quick Start

```python
from pydantic import BaseModel, Field
from agno.agent import Agent
from agno.models.openai import OpenAIChat

# Define Input Schema
class MyInput(BaseModel):
    query: str = Field(..., description="User query")
    options: list[str] = Field(default=[], description="Options")

# Define Output Schema
class MyOutput(BaseModel):
    answer: str = Field(..., description="The answer")
    confidence: float = Field(..., description="Confidence score 0-1")
    sources: list[str] = Field(..., description="Sources used")

# Create TypeSafe Agent
agent = Agent(
    model=OpenAIChat(id="gpt-4o-mini"),
    instructions="You are a helpful assistant.",
    input_schema=MyInput,
    output_schema=MyOutput,
    parser_model=OpenAIChat(id="gpt-4o-mini")
)

# Run with structured input
response = agent.run(input=MyInput(query="What is AI?"))
print(response.content)  # MyOutput object
```

## Included Agents

| Agent | Purpose | Input | Output |
|-------|---------|-------|--------|
| Stock Analyzer | Market analysis | StockAnalysisInput | StockAnalysisOutput |
| Researcher | Topic research | ResearchInput | ResearchOutput |
| Content Generator | Content creation | ContentGenerationInput | ContentOutput |

## Architecture

```
Input (Pydantic Model)
        │
        ▼
┌───────────────────┐
│   TypeSafe Agent  │
│  ┌─────────────┐  │
│  │ LLM Model   │  │
│  └─────────────┘  │
│  ┌─────────────┐  │
│  │   Tools     │  │
│  └─────────────┘  │
│  ┌─────────────┐  │
│  │Parser Model │  │
│  └─────────────┘  │
└───────────────────┘
        │
        ▼
Output (Pydantic Model)
```

## Benefits

1. **Predictable**: Know exactly what you'll get back
2. **Validated**: Pydantic validates all inputs/outputs
3. **IDE Support**: Full autocomplete and type checking
4. **Testing**: Easy to mock and test
5. **Documentation**: Self-documenting schemas

## Setup

```bash
pip install -r requirements.txt
export OPENAI_API_KEY="your-key"
python typesafe_agent.py
```

## Observability (Optional)

Add Traceloop for observability:

```python
from traceloop.sdk import Traceloop

Traceloop.init(app_name="my-agent")
```

## Creating Custom Agents

Use the factory pattern:

```python
from typesafe_agent import TypeSafeAgentFactory

agent = TypeSafeAgentFactory.create_custom_agent(
    name="My Agent",
    instructions="Do something specific...",
    input_schema=MyInputSchema,
    output_schema=MyOutputSchema,
    tools=[MyTool()]
)
```

## Credits

Based on Agno 2.0 TypeSafe Agents from [BuildFastWithAI/gen-ai-experiments](https://github.com/buildfastwithai/gen-ai-experiments)
