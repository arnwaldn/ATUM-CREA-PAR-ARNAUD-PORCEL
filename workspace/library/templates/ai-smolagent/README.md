# Smolagents - Lightweight AI Agents

**HuggingFace's minimalist framework for code-first agents**

## Overview

Smolagents is a barebones library for building agents that "think in Python code". Unlike traditional tool-calling agents that output JSON, Smolagents uses **code-as-action** - the LLM generates Python code that gets executed directly.

## Key Features

| Feature | Description |
|---------|-------------|
| **Code-as-Action** | LLM generates executable Python, not JSON |
| **Minimal Dependencies** | <100KB footprint, fast startup |
| **Hub Integration** | Share/reuse tools on HuggingFace Hub |
| **Multi-Agent** | ManagedAgent for hierarchical orchestration |
| **Planning** | Optional planning intervals for complex tasks |
| **CLI Support** | Run agents directly from terminal |

## Quick Start

### Installation

```bash
# Basic installation
pip install smolagents

# With default tools (web search, etc.)
pip install 'smolagents[toolkit]'
```

### Basic Agent

```python
from smolagents import CodeAgent, InferenceClientModel

# Initialize agent with HuggingFace model
agent = CodeAgent(
    tools=[],
    model=InferenceClientModel(model_id="Qwen/Qwen2.5-Coder-32B-Instruct")
)

# Run a task
result = agent.run("Calculate the fibonacci sequence up to 100")
print(result)
```

### With Tools

```python
from smolagents import CodeAgent, InferenceClientModel, WebSearchTool, load_tool

# Load tools
search_tool = WebSearchTool()
image_tool = load_tool("m-ric/text-to-image", trust_remote_code=True)

# Create agent with tools
agent = CodeAgent(
    tools=[search_tool, image_tool],
    model=InferenceClientModel(model_id="Qwen/Qwen2.5-72B-Instruct"),
    planning_interval=3  # Enable planning every 3 steps
)

result = agent.run("Find the tallest building in the world and generate an image of it")
```

### Multi-Agent System

```python
from smolagents import CodeAgent, InferenceClientModel, WebSearchTool, ManagedAgent

model = InferenceClientModel()

# Create specialized web agent
web_agent = CodeAgent(tools=[WebSearchTool()], model=model)

# Wrap as managed agent
managed_web_agent = ManagedAgent(
    agent=web_agent,
    name="web_search",
    description="Runs web searches. Give it your query as an argument."
)

# Create manager agent that orchestrates
manager_agent = CodeAgent(
    tools=[],
    model=model,
    managed_agents=[managed_web_agent],
    additional_authorized_imports=["time", "numpy", "pandas"]
)

manager_agent.run("Research the latest AI trends and summarize them")
```

### CLI Usage

```bash
# General purpose agent
smolagent "Plan a trip to Tokyo" \
  --model-type "InferenceClientModel" \
  --model-id "Qwen/Qwen2.5-Coder-32B-Instruct" \
  --tools "web_search"

# Web browsing agent
webagent "Go to example.com and extract the main content" \
  --model-type "LiteLLMModel" \
  --model-id "gpt-4o"
```

## Agent Types

| Type | Output Format | Best For |
|------|---------------|----------|
| `CodeAgent` | Executable Python code | Complex reasoning, multi-step tasks |
| `ToolCallingAgent` | JSON tool calls | Simple tool orchestration |

## Custom Tools

```python
from smolagents import tool

@tool
def get_weather(city: str) -> str:
    """Get current weather for a city.

    Args:
        city: Name of the city

    Returns:
        Weather information string
    """
    # Your implementation
    return f"Weather in {city}: Sunny, 22C"

# Use in agent
agent = CodeAgent(tools=[get_weather], model=model)
```

## When to Use Smolagents

**Best For:**
- Edge deployment (minimal footprint)
- Rapid prototyping
- Resource-constrained environments
- When you need code execution, not just tool calling
- HuggingFace ecosystem integration

**Consider Alternatives For:**
- Complex multi-provider orchestration (use LangGraph)
- Type-safe structured outputs (use Agno TypeSafe)
- Heavy tool integrations (use Phidata)

## Comparison

| Framework | Size | Paradigm | Best Use Case |
|-----------|------|----------|---------------|
| **Smolagents** | <100KB | Code-as-action | Lightweight, edge |
| Phidata | Medium | Tool-calling | Production agents |
| LangGraph | Large | Graph-based | Complex workflows |
| CrewAI | Medium | Role-based | Team collaboration |

## Resources

- [HuggingFace Smolagents](https://huggingface.co/docs/smolagents)
- [GitHub Repository](https://github.com/huggingface/smolagents)
- [Tool Hub](https://huggingface.co/tools)

---

*ULTRA-CREATE v27.4 | Smolagents Template*
