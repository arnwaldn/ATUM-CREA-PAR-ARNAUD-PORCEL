# Cerebras Ultra-Fast Search

**Lightning-fast inference for real-time AI search applications**

## Overview

Cerebras Inference delivers up to **10x faster inference** compared to traditional GPU-based solutions. This template implements a Perplexity-style search assistant using Cerebras' ultra-fast API.

## Key Features

| Feature | Benefit |
|---------|---------|
| **Ultra-Fast Inference** | Sub-second response times |
| **Streaming Native** | Real-time token streaming |
| **OpenAI Compatible** | Drop-in replacement for OpenAI SDK |
| **Tool Calling** | Native function calling support |
| **Structured Outputs** | JSON schema enforcement |
| **Prompt Caching** | Reduced latency for repeated contexts |

## Supported Models

| Model | Context | Speed | Use Case |
|-------|---------|-------|----------|
| `llama-3.3-70b` | 128K | Fastest | General purpose, search |
| `llama-3.1-8b` | 128K | Ultra-fast | Quick tasks, chat |
| `llama3.1-8b` | Legacy | Fast | Backward compatibility |

## Quick Start

### Installation

```bash
pip install cerebras_cloud_sdk
```

### Environment Setup

```bash
export CEREBRAS_API_KEY="your-api-key-here"
```

Get your free API key at [cloud.cerebras.ai](https://cloud.cerebras.ai)

### Basic Usage

```python
import os
from cerebras.cloud.sdk import Cerebras

client = Cerebras(
    api_key=os.environ.get("CEREBRAS_API_KEY")
)

# Simple completion
response = client.chat.completions.create(
    model="llama-3.3-70b",
    messages=[
        {"role": "user", "content": "What is quantum computing?"}
    ]
)

print(response.choices[0].message.content)
```

### Streaming Response

```python
stream = client.chat.completions.create(
    model="llama-3.3-70b",
    messages=[{"role": "user", "content": "Explain machine learning"}],
    stream=True
)

for chunk in stream:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="", flush=True)
```

### Web Search Integration

```python
from cerebras.cloud.sdk import Cerebras
from tavily import TavilyClient
import os

# Initialize clients
cerebras = Cerebras()
tavily = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))

def search_and_answer(query: str) -> str:
    """Perplexity-style search with Cerebras speed."""

    # 1. Search the web
    search_results = tavily.search(query, max_results=5)

    # 2. Format context
    context = "\n\n".join([
        f"Source: {r['url']}\n{r['content']}"
        for r in search_results['results']
    ])

    # 3. Generate answer with Cerebras (ultra-fast)
    response = cerebras.chat.completions.create(
        model="llama-3.3-70b",
        messages=[
            {
                "role": "system",
                "content": "You are a helpful search assistant. Answer based on the provided sources. Cite sources when relevant."
            },
            {
                "role": "user",
                "content": f"Sources:\n{context}\n\nQuestion: {query}"
            }
        ]
    )

    return response.choices[0].message.content

# Usage
answer = search_and_answer("What are the latest developments in AI?")
print(answer)
```

### Tool Calling

```python
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get current weather for a location",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {"type": "string", "description": "City name"},
                    "unit": {"type": "string", "enum": ["celsius", "fahrenheit"]}
                },
                "required": ["location"]
            }
        }
    }
]

response = client.chat.completions.create(
    model="llama-3.3-70b",
    messages=[{"role": "user", "content": "What's the weather in Paris?"}],
    tools=tools,
    tool_choice="auto"
)

# Handle tool calls
if response.choices[0].message.tool_calls:
    tool_call = response.choices[0].message.tool_calls[0]
    print(f"Tool: {tool_call.function.name}")
    print(f"Args: {tool_call.function.arguments}")
```

### Structured Outputs

```python
from pydantic import BaseModel

class SearchResult(BaseModel):
    answer: str
    sources: list[str]
    confidence: float

response = client.chat.completions.create(
    model="llama-3.3-70b",
    messages=[{"role": "user", "content": "What is the capital of France?"}],
    response_format={
        "type": "json_schema",
        "json_schema": {
            "name": "search_result",
            "strict": True,
            "schema": SearchResult.model_json_schema()
        }
    }
)
```

## Performance Comparison

| Provider | Tokens/sec | TTFT | Best For |
|----------|-----------|------|----------|
| **Cerebras** | 2000+ | <100ms | Speed-critical |
| OpenAI | 100-200 | 200-500ms | General use |
| Anthropic | 80-150 | 300-600ms | Quality focus |
| Groq | 500+ | <200ms | Fast alternative |

*TTFT = Time To First Token*

## Use Cases

### Real-Time Search Assistant
```python
# Perplexity-style instant answers
async def instant_search(query: str):
    # Web search + Cerebras = sub-second answers
    pass
```

### Live Chat Support
```python
# Customer support with instant responses
async def support_chat(message: str, history: list):
    # Streaming responses for great UX
    pass
```

### Code Generation
```python
# Fast code completion
async def code_complete(context: str, cursor: str):
    # Llama 3.3 + Cerebras speed for coding
    pass
```

## Comparison with Other Templates

| Template | Speed | Use Case |
|----------|-------|----------|
| **ai-cerebras-search** | 10x faster | Speed-critical, real-time |
| `rag-chatbot` | Standard | Document Q&A |
| `ai-assistant` | Standard | General chat |
| `openai-research-agent` | Standard | Deep research |

## OpenAI Compatibility

Cerebras API is OpenAI-compatible. Migrate easily:

```python
# Before (OpenAI)
from openai import OpenAI
client = OpenAI()

# After (Cerebras)
from openai import OpenAI
client = OpenAI(
    base_url="https://api.cerebras.ai/v1",
    api_key=os.getenv("CEREBRAS_API_KEY")
)
# Same code works!
```

## Resources

- [Cerebras Inference Docs](https://inference-docs.cerebras.ai/)
- [API Reference](https://inference-docs.cerebras.ai/api-reference/authentication)
- [Python SDK](https://github.com/Cerebras/cerebras-cloud-sdk-python)
- [Free API Key](https://cloud.cerebras.ai)

---

*ULTRA-CREATE v27.4 | Cerebras Ultra-Fast Search*
