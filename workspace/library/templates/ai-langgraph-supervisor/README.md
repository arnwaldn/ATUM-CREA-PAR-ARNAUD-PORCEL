# LangGraph Supervisor Agent Template

**Hierarchical Multi-Agent Orchestration with Central Supervisor**

## Overview

This template implements the Supervisor pattern for multi-agent systems using LangGraph. A central supervisor agent coordinates specialized worker agents, dynamically routing tasks based on requirements.

## Key Features

- **Central Supervisor**: Orchestrates all worker agents
- **Specialized Workers**: Researcher, Analyst, Writer, Reviewer
- **State Management**: TypedDict with message history
- **Checkpointing**: Recovery from interruptions
- **Dynamic Routing**: Supervisor decides next agent
- **Iteration Limits**: Prevents infinite loops

## Architecture

```
                    ┌─────────────┐
                    │  SUPERVISOR │
                    │  (Router)   │
                    └──────┬──────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
   ┌──────────┐     ┌──────────┐     ┌──────────┐
   │RESEARCHER│     │ ANALYST  │     │  WRITER  │
   └──────────┘     └──────────┘     └──────────┘
         │                 │                 │
         └─────────────────┼─────────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │   RESULT    │
                    └─────────────┘
```

## Quick Start

```python
from supervisor_agent import SupervisorTeam

# Create team
team = SupervisorTeam()

# Run a task
result = team.run(
    task="Research AI trends and write a summary",
    thread_id="task-001"
)

# Get results
final = team.get_results(result)
print(final["results"])
```

## Worker Agents

| Agent | Purpose | Tools |
|-------|---------|-------|
| Researcher | Information gathering | search_web |
| Analyst | Data analysis | analyze_data |
| Writer | Content creation | write_content |
| Reviewer | Code review | code_review |

## Configuration

```python
@dataclass
class SupervisorConfig:
    MODEL_ID: str = "gpt-4o-mini"      # LLM model
    TEMPERATURE: float = 0.7           # Response creativity
    MAX_ITERATIONS: int = 10           # Prevent infinite loops
    CHECKPOINT_ENABLED: bool = True    # Enable state recovery
```

## State Schema

```python
class AgentState(TypedDict):
    messages: List[BaseMessage]  # Conversation history
    next_agent: str              # Next agent to act
    task: str                    # Current task
    results: dict                # Results from each agent
    iteration_count: int         # Loop counter
```

## Custom Workers

Add new specialized workers:

```python
@tool
def my_custom_tool(input: str) -> str:
    """Your custom tool description"""
    return f"Processed: {input}"

class WorkerAgentFactory:
    @staticmethod
    def create_my_worker(llm: ChatOpenAI) -> callable:
        tools = [my_custom_tool]
        agent = create_react_agent(
            llm,
            tools,
            state_modifier="You are a specialized agent for..."
        )
        return agent
```

## Setup

1. **Install dependencies**:
```bash
pip install -r requirements.txt
```

2. **Set API key**:
```bash
export OPENAI_API_KEY="your-key"
```

3. **Run**:
```bash
python supervisor_agent.py
```

## Use Cases

- **Research Projects**: Researcher → Analyst → Writer flow
- **Code Reviews**: Reviewer with multi-pass analysis
- **Content Pipelines**: Research → Draft → Review → Publish
- **Data Analysis**: Gather → Analyze → Report

## Comparison with Other Patterns

| Pattern | Use When |
|---------|----------|
| **Supervisor** | Need central coordination, dynamic routing |
| **Swarm** | Peer-to-peer, no hierarchy needed |
| **Pipeline** | Fixed sequential flow |
| **Hierarchical** | Multiple supervisor levels |

## Credits

Based on LangGraph multi-agent patterns from [BuildFastWithAI/gen-ai-experiments](https://github.com/buildfastwithai/gen-ai-experiments)
