# Smolagents Patterns
## ULTRA-CREATE v27.4 Knowledge File

> **Purpose**: Lightweight code-first AI agents with HuggingFace's Smolagents framework.

---

## Overview

Smolagents is a minimalist library from HuggingFace where agents "think in Python code" rather than JSON tool calls.

| Feature | Description |
|---------|-------------|
| **Code-as-Action** | LLM generates executable Python code |
| **Minimal Footprint** | <100KB, fast startup |
| **Hub Integration** | Share/reuse tools on HuggingFace Hub |
| **Multi-Agent** | ManagedAgent for orchestration |
| **CLI Support** | Run agents from terminal |

---

## Installation

```bash
# Basic
pip install smolagents

# With default tools (web search, etc.)
pip install 'smolagents[toolkit]'
```

---

## Core Concepts

### Agent Types

| Type | Output | Best For |
|------|--------|----------|
| `CodeAgent` | Executable Python | Complex reasoning, multi-step |
| `ToolCallingAgent` | JSON tool calls | Simple orchestration |

### Execution Flow

```
User Query
    │
    ▼
┌─────────────────────┐
│ LLM Reasoning       │
│ (Thought step)      │
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│ Code Generation     │
│ (Python snippet)    │
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│ Code Execution      │
│ (Sandboxed)         │
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│ Observation         │
│ (Result analysis)   │
└─────────────────────┘
    │
    ▼
Continue or Final Answer
```

---

## Basic Patterns

### Pattern 1: Simple CodeAgent

```python
from smolagents import CodeAgent, InferenceClientModel

model = InferenceClientModel(
    model_id="Qwen/Qwen2.5-Coder-32B-Instruct"
)

agent = CodeAgent(tools=[], model=model)
result = agent.run("Calculate primes up to 100")
```

### Pattern 2: Agent with Planning

```python
from smolagents import CodeAgent, InferenceClientModel, WebSearchTool

agent = CodeAgent(
    tools=[WebSearchTool()],
    model=InferenceClientModel(),
    planning_interval=3  # Plan every 3 steps
)

result = agent.run("Research and summarize AI trends")
```

### Pattern 3: Custom Tool

```python
from smolagents import tool

@tool
def get_stock_price(symbol: str) -> str:
    """Get current stock price.

    Args:
        symbol: Stock ticker symbol (e.g., AAPL)

    Returns:
        Current price as string
    """
    # Implementation here
    return f"{symbol}: $150.00"
```

---

## Multi-Agent Patterns

### Pattern 4: ManagedAgent Orchestration

```python
from smolagents import CodeAgent, InferenceClientModel, ManagedAgent, WebSearchTool

model = InferenceClientModel()

# Specialist agent
web_agent = CodeAgent(tools=[WebSearchTool()], model=model)

# Wrap as managed
managed_web = ManagedAgent(
    agent=web_agent,
    name="web_search",
    description="Searches the web. Give it a query."
)

# Manager orchestrates
manager = CodeAgent(
    tools=[],
    model=model,
    managed_agents=[managed_web],
    additional_authorized_imports=["pandas", "numpy"]
)

manager.run("Research AI trends and analyze data")
```

### Pattern 5: Multi-Specialist Team

```python
# Research specialist
research_agent = CodeAgent(tools=[WebSearchTool()], model=model)
managed_research = ManagedAgent(
    agent=research_agent,
    name="researcher",
    description="Deep web research"
)

# Analysis specialist
analysis_agent = CodeAgent(tools=[analysis_tools], model=model)
managed_analysis = ManagedAgent(
    agent=analysis_agent,
    name="analyst",
    description="Data analysis and calculations"
)

# Writing specialist
writing_agent = CodeAgent(tools=[], model=model)
managed_writer = ManagedAgent(
    agent=writing_agent,
    name="writer",
    description="Content creation and summarization"
)

# Orchestrator
orchestrator = CodeAgent(
    tools=[],
    model=model,
    managed_agents=[managed_research, managed_analysis, managed_writer]
)
```

---

## Hub Integration

### Load Tool from Hub

```python
from smolagents import load_tool

# Load community tool
image_gen = load_tool("m-ric/text-to-image", trust_remote_code=True)
```

### Push Tool to Hub

```python
from smolagents import Tool

class MyTool(Tool):
    name = "my_custom_tool"
    description = "Does something useful"
    inputs = {"query": {"type": "string", "description": "Input query"}}
    output_type = "string"

    def forward(self, query: str) -> str:
        return f"Processed: {query}"

# Push to Hub
my_tool = MyTool()
my_tool.push_to_hub("username/my-tool")
```

---

## CLI Usage

```bash
# General agent
smolagent "Plan a trip to Paris" \
  --model-type "InferenceClientModel" \
  --model-id "Qwen/Qwen2.5-Coder-32B-Instruct" \
  --tools "web_search"

# Web browsing agent
webagent "Go to example.com and get the title" \
  --model-type "LiteLLMModel" \
  --model-id "gpt-4o"
```

---

## Model Providers

### HuggingFace Inference API

```python
from smolagents import InferenceClientModel

model = InferenceClientModel(
    model_id="Qwen/Qwen2.5-Coder-32B-Instruct"
)
```

### LiteLLM (Multi-Provider)

```python
from smolagents import LiteLLMModel

# OpenAI
model = LiteLLMModel(model_id="gpt-4o")

# Anthropic
model = LiteLLMModel(model_id="claude-3-5-sonnet")

# Local via Ollama
model = LiteLLMModel(model_id="ollama/llama3")
```

### Azure OpenAI

```python
from smolagents import AzureOpenAIServerModel

model = AzureOpenAIServerModel(
    model_id="gpt-4",
    azure_endpoint="https://your-resource.openai.azure.com",
    api_version="2024-02-15-preview"
)
```

---

## Best Practices

### 1. Tool Design

```python
# Good: Specific, typed, documented
@tool
def search_database(
    query: str,
    limit: int = 10
) -> str:
    """Search the product database.

    Args:
        query: Search query string
        limit: Maximum results to return (default: 10)

    Returns:
        JSON string with matching products
    """
    # Implementation
    return json.dumps(results)

# Bad: Vague, untyped
@tool
def do_stuff(x):
    return str(x)
```

### 2. Planning for Complex Tasks

```python
# Enable planning for multi-step reasoning
agent = CodeAgent(
    tools=[...],
    model=model,
    planning_interval=3  # Review plan every 3 steps
)
```

### 3. Authorized Imports

```python
# Whitelist additional Python packages
agent = CodeAgent(
    tools=[],
    model=model,
    additional_authorized_imports=[
        "pandas",
        "numpy",
        "requests",
        "json"
    ]
)
```

---

## Comparison with Other Frameworks

| Aspect | Smolagents | Phidata | LangGraph | CrewAI |
|--------|------------|---------|-----------|--------|
| **Size** | <100KB | Medium | Large | Medium |
| **Paradigm** | Code-as-action | Tool-calling | Graph-based | Role-based |
| **Learning Curve** | Low | Medium | High | Medium |
| **Best For** | Edge, prototyping | Production | Complex workflows | Teams |
| **Multi-agent** | ManagedAgent | Teams | StateGraph | Crews |

---

## When to Use Smolagents

**Use When:**
- Minimal dependencies required
- Edge/embedded deployment
- Need code execution, not just tool calls
- HuggingFace ecosystem integration
- Rapid prototyping

**Avoid When:**
- Need structured JSON outputs (use Agno TypeSafe)
- Complex graph workflows (use LangGraph)
- Heavy enterprise features (use Phidata)
- Team role-playing (use CrewAI)

---

## Integration with ULTRA-CREATE

### Auto-Loading

This knowledge is auto-loaded when intents match:
- `smolagents`, `smol agent`, `lightweight agent`, `code agent`, `huggingface agent`

### Related Templates

| Template | Description |
|----------|-------------|
| `ai-smolagent` | Basic Smolagents starter |
| `ai-typesafe-agent` | For structured outputs (Agno) |
| `ai-langgraph-supervisor` | For complex workflows |

### Agent Integration

| Agent | Uses |
|-------|------|
| `autonomous-agent-expert` | Smolagents patterns |
| `llm-integration-expert` | Multi-provider setup |

---

## Resources

- [HuggingFace Smolagents Docs](https://huggingface.co/docs/smolagents)
- [GitHub Repository](https://github.com/huggingface/smolagents)
- [Tool Hub](https://huggingface.co/tools)
- [Community Examples](https://huggingface.co/collections/smolagents)

---

*ULTRA-CREATE v27.4 | Smolagents Patterns*
