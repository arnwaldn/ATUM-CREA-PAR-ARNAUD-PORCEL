"""
Cerebras Ultra-Fast Search - Perplexity-Style Assistant
ULTRA-CREATE v27.4

This demo showcases Cerebras' lightning-fast inference for real-time
AI search applications with up to 10x faster response times.

Features:
1. Basic completion (ultra-fast)
2. Streaming responses
3. Web search integration (Perplexity-style)
4. Tool calling
5. Structured outputs
"""

import os
import json
from dotenv import load_dotenv

load_dotenv()

# =============================================================================
# CONFIGURATION
# =============================================================================

CEREBRAS_API_KEY = os.getenv("CEREBRAS_API_KEY")
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")  # Optional: for web search

# Supported models
MODELS = {
    "fast": "llama-3.3-70b",      # Best for general purpose, search
    "ultra_fast": "llama-3.1-8b", # Best for quick tasks, chat
}


# =============================================================================
# DEMO 1: BASIC COMPLETION (ULTRA-FAST)
# =============================================================================

def demo_basic_completion():
    """Demonstrate basic ultra-fast completion."""
    print("\n" + "=" * 60)
    print("DEMO 1: Basic Completion (Ultra-Fast)")
    print("=" * 60)

    from cerebras.cloud.sdk import Cerebras

    client = Cerebras(api_key=CEREBRAS_API_KEY)

    response = client.chat.completions.create(
        model=MODELS["fast"],
        messages=[
            {"role": "user", "content": "What is quantum computing in one paragraph?"}
        ]
    )

    print(f"Response: {response.choices[0].message.content}")
    print(f"\nUsage: {response.usage.total_tokens} tokens")


# =============================================================================
# DEMO 2: STREAMING RESPONSE
# =============================================================================

def demo_streaming():
    """Demonstrate real-time streaming responses."""
    print("\n" + "=" * 60)
    print("DEMO 2: Streaming Response")
    print("=" * 60)

    from cerebras.cloud.sdk import Cerebras

    client = Cerebras(api_key=CEREBRAS_API_KEY)

    stream = client.chat.completions.create(
        model=MODELS["fast"],
        messages=[
            {"role": "user", "content": "Explain machine learning in 3 bullet points"}
        ],
        stream=True
    )

    print("Streaming: ", end="", flush=True)
    for chunk in stream:
        if chunk.choices[0].delta.content:
            print(chunk.choices[0].delta.content, end="", flush=True)
    print("\n")


# =============================================================================
# DEMO 3: WEB SEARCH INTEGRATION (PERPLEXITY-STYLE)
# =============================================================================

def demo_web_search():
    """Demonstrate Perplexity-style search with Cerebras speed."""
    print("\n" + "=" * 60)
    print("DEMO 3: Web Search Integration (Perplexity-Style)")
    print("=" * 60)

    if not TAVILY_API_KEY:
        print("Skipping: TAVILY_API_KEY not set")
        print("Set it with: export TAVILY_API_KEY='your-key'")
        return

    from cerebras.cloud.sdk import Cerebras
    from tavily import TavilyClient

    cerebras = Cerebras(api_key=CEREBRAS_API_KEY)
    tavily = TavilyClient(api_key=TAVILY_API_KEY)

    query = "What are the latest developments in AI in 2025?"

    # Step 1: Search the web
    print(f"Searching for: {query}")
    search_results = tavily.search(query, max_results=5)

    # Step 2: Format context from search results
    context = "\n\n".join([
        f"Source: {r['url']}\n{r['content']}"
        for r in search_results['results']
    ])

    # Step 3: Generate answer with Cerebras (ultra-fast)
    response = cerebras.chat.completions.create(
        model=MODELS["fast"],
        messages=[
            {
                "role": "system",
                "content": """You are a helpful search assistant. Answer based on the
provided sources. Be concise and cite sources when relevant using [Source: URL] format."""
            },
            {
                "role": "user",
                "content": f"Sources:\n{context}\n\nQuestion: {query}"
            }
        ]
    )

    print(f"\nAnswer:\n{response.choices[0].message.content}")


# =============================================================================
# DEMO 4: TOOL CALLING
# =============================================================================

def demo_tool_calling():
    """Demonstrate native function/tool calling."""
    print("\n" + "=" * 60)
    print("DEMO 4: Tool Calling")
    print("=" * 60)

    from cerebras.cloud.sdk import Cerebras

    client = Cerebras(api_key=CEREBRAS_API_KEY)

    # Define tools
    tools = [
        {
            "type": "function",
            "function": {
                "name": "get_weather",
                "description": "Get the current weather for a location",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "location": {
                            "type": "string",
                            "description": "City name (e.g., Paris, New York)"
                        },
                        "unit": {
                            "type": "string",
                            "enum": ["celsius", "fahrenheit"],
                            "description": "Temperature unit"
                        }
                    },
                    "required": ["location"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "search_web",
                "description": "Search the web for information",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "query": {
                            "type": "string",
                            "description": "Search query"
                        }
                    },
                    "required": ["query"]
                }
            }
        }
    ]

    response = client.chat.completions.create(
        model=MODELS["fast"],
        messages=[
            {"role": "user", "content": "What's the weather like in Tokyo?"}
        ],
        tools=tools,
        tool_choice="auto"
    )

    # Check for tool calls
    message = response.choices[0].message
    if message.tool_calls:
        for tool_call in message.tool_calls:
            print(f"Tool Called: {tool_call.function.name}")
            print(f"Arguments: {tool_call.function.arguments}")
    else:
        print(f"Response: {message.content}")


# =============================================================================
# DEMO 5: STRUCTURED OUTPUTS (JSON SCHEMA)
# =============================================================================

def demo_structured_output():
    """Demonstrate structured JSON outputs with schema enforcement."""
    print("\n" + "=" * 60)
    print("DEMO 5: Structured Outputs (JSON Schema)")
    print("=" * 60)

    from cerebras.cloud.sdk import Cerebras

    client = Cerebras(api_key=CEREBRAS_API_KEY)

    # Define JSON schema for response
    schema = {
        "type": "object",
        "properties": {
            "answer": {
                "type": "string",
                "description": "The answer to the question"
            },
            "sources": {
                "type": "array",
                "items": {"type": "string"},
                "description": "List of source references"
            },
            "confidence": {
                "type": "number",
                "minimum": 0,
                "maximum": 1,
                "description": "Confidence score between 0 and 1"
            },
            "related_topics": {
                "type": "array",
                "items": {"type": "string"},
                "description": "Related topics for further exploration"
            }
        },
        "required": ["answer", "confidence"]
    }

    response = client.chat.completions.create(
        model=MODELS["fast"],
        messages=[
            {"role": "user", "content": "What is the capital of France?"}
        ],
        response_format={
            "type": "json_schema",
            "json_schema": {
                "name": "search_result",
                "strict": True,
                "schema": schema
            }
        }
    )

    # Parse and display structured response
    result = json.loads(response.choices[0].message.content)
    print(f"Answer: {result.get('answer')}")
    print(f"Confidence: {result.get('confidence', 'N/A')}")
    if result.get('sources'):
        print(f"Sources: {', '.join(result['sources'])}")
    if result.get('related_topics'):
        print(f"Related: {', '.join(result['related_topics'])}")


# =============================================================================
# DEMO 6: OPENAI COMPATIBILITY (MIGRATION)
# =============================================================================

def demo_openai_compatibility():
    """Demonstrate OpenAI SDK compatibility for easy migration."""
    print("\n" + "=" * 60)
    print("DEMO 6: OpenAI SDK Compatibility")
    print("=" * 60)

    from openai import OpenAI

    # Use OpenAI SDK with Cerebras endpoint
    client = OpenAI(
        base_url="https://api.cerebras.ai/v1",
        api_key=CEREBRAS_API_KEY
    )

    # Same code as OpenAI!
    response = client.chat.completions.create(
        model="llama-3.3-70b",
        messages=[
            {"role": "user", "content": "Hello, Cerebras via OpenAI SDK!"}
        ]
    )

    print(f"Response: {response.choices[0].message.content}")
    print("\nMigration from OpenAI: Just change base_url and api_key!")


# =============================================================================
# DEMO 7: REAL-TIME SEARCH ASSISTANT CLASS
# =============================================================================

class CerebrasSearchAssistant:
    """Production-ready Perplexity-style search assistant."""

    def __init__(self, cerebras_key: str, tavily_key: str = None):
        from cerebras.cloud.sdk import Cerebras

        self.client = Cerebras(api_key=cerebras_key)
        self.tavily = None

        if tavily_key:
            from tavily import TavilyClient
            self.tavily = TavilyClient(api_key=tavily_key)

        self.system_prompt = """You are a helpful AI search assistant powered by
Cerebras ultra-fast inference. Provide accurate, well-sourced answers.
When citing sources, use [1], [2], etc. and list full URLs at the end.
Be concise but comprehensive."""

    def search(self, query: str, max_results: int = 5) -> dict:
        """Search the web and return structured results."""
        if not self.tavily:
            return {"error": "Tavily not configured"}

        return self.tavily.search(query, max_results=max_results)

    def answer(self, query: str, context: str = None) -> str:
        """Generate an answer, optionally with search context."""
        messages = [{"role": "system", "content": self.system_prompt}]

        if context:
            messages.append({
                "role": "user",
                "content": f"Context:\n{context}\n\nQuestion: {query}"
            })
        else:
            messages.append({"role": "user", "content": query})

        response = self.client.chat.completions.create(
            model="llama-3.3-70b",
            messages=messages
        )

        return response.choices[0].message.content

    def search_and_answer(self, query: str) -> dict:
        """Full Perplexity-style search + answer pipeline."""
        result = {
            "query": query,
            "sources": [],
            "answer": ""
        }

        # Search if Tavily available
        if self.tavily:
            search_results = self.search(query)

            # Build context and sources
            context_parts = []
            for i, r in enumerate(search_results.get('results', [])[:5]):
                result["sources"].append({
                    "index": i + 1,
                    "title": r.get('title', ''),
                    "url": r.get('url', ''),
                    "snippet": r.get('content', '')[:200]
                })
                context_parts.append(f"[{i+1}] {r.get('url')}\n{r.get('content')}")

            context = "\n\n".join(context_parts)
            result["answer"] = self.answer(query, context)
        else:
            # Direct answer without search
            result["answer"] = self.answer(query)

        return result

    def stream_answer(self, query: str):
        """Stream answer in real-time."""
        response = self.client.chat.completions.create(
            model="llama-3.3-70b",
            messages=[
                {"role": "system", "content": self.system_prompt},
                {"role": "user", "content": query}
            ],
            stream=True
        )

        for chunk in response:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content


def demo_search_assistant():
    """Demonstrate the full search assistant class."""
    print("\n" + "=" * 60)
    print("DEMO 7: CerebrasSearchAssistant Class")
    print("=" * 60)

    assistant = CerebrasSearchAssistant(
        cerebras_key=CEREBRAS_API_KEY,
        tavily_key=TAVILY_API_KEY
    )

    # Simple question
    print("\nDirect Answer:")
    answer = assistant.answer("What is Python?")
    print(answer[:300] + "...")

    # Full search (if Tavily configured)
    if TAVILY_API_KEY:
        print("\nSearch + Answer:")
        result = assistant.search_and_answer("Latest Python 3.13 features")
        print(f"Answer: {result['answer'][:300]}...")
        print(f"\nSources ({len(result['sources'])}):")
        for src in result['sources'][:3]:
            print(f"  [{src['index']}] {src['url']}")


# =============================================================================
# MAIN
# =============================================================================

def main():
    """Run all demos."""
    print("\n" + "=" * 60)
    print("CEREBRAS ULTRA-FAST SEARCH DEMO")
    print("ULTRA-CREATE v27.4")
    print("=" * 60)

    # Check API key
    if not CEREBRAS_API_KEY:
        print("\nERROR: CEREBRAS_API_KEY not set")
        print("Get your free key at: https://cloud.cerebras.ai")
        print("Set it with: export CEREBRAS_API_KEY='your-key'")
        return

    try:
        # Run demos (comment out as needed)
        demo_basic_completion()
        demo_streaming()
        demo_web_search()
        demo_tool_calling()
        demo_structured_output()
        demo_openai_compatibility()
        demo_search_assistant()

        print("\n" + "=" * 60)
        print("All demos completed successfully!")
        print("=" * 60)

    except Exception as e:
        print(f"\nError: {e}")
        print("Make sure your CEREBRAS_API_KEY is valid")


if __name__ == "__main__":
    main()
