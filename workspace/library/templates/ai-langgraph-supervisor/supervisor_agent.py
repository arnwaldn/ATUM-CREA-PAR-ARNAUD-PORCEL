"""
LangGraph Supervisor Agent Template
ULTRA-CREATE v27.3 Template

Features:
- Hierarchical multi-agent orchestration
- Central supervisor coordinating specialized workers
- State management with TypedDict
- Dynamic task routing
- Checkpointing for recovery

Stack: LangGraph, LangChain, OpenAI
"""

from typing import Annotated, Literal, TypedDict, List, Optional
from dataclasses import dataclass
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage, BaseMessage
from langchain_core.tools import tool
from langgraph.graph import StateGraph, END, START
from langgraph.graph.message import add_messages
from langgraph.checkpoint.memory import MemorySaver
from langgraph.prebuilt import create_react_agent
import operator
import os

# =============================================================================
# Configuration
# =============================================================================

@dataclass
class SupervisorConfig:
    """Supervisor configuration"""
    MODEL_ID: str = "gpt-4o-mini"
    TEMPERATURE: float = 0.7
    MAX_ITERATIONS: int = 10
    CHECKPOINT_ENABLED: bool = True


config = SupervisorConfig()


# =============================================================================
# State Definition
# =============================================================================

class AgentState(TypedDict):
    """Shared state across all agents"""
    messages: Annotated[List[BaseMessage], add_messages]
    next_agent: str
    task: str
    results: dict
    iteration_count: int


# =============================================================================
# Worker Tools
# =============================================================================

@tool
def search_web(query: str) -> str:
    """Search the web for information.

    Args:
        query: Search query string

    Returns:
        Search results as string
    """
    # Placeholder - integrate with actual search API
    return f"Search results for: {query}\n- Result 1: Relevant information about {query}\n- Result 2: Additional details"


@tool
def analyze_data(data: str) -> str:
    """Analyze data and provide insights.

    Args:
        data: Data to analyze

    Returns:
        Analysis results
    """
    return f"Analysis of data:\n- Key insight 1: Pattern detected\n- Key insight 2: Trend identified\n- Recommendation: Based on analysis..."


@tool
def write_content(topic: str, style: str = "professional") -> str:
    """Write content on a given topic.

    Args:
        topic: Topic to write about
        style: Writing style (professional, casual, technical)

    Returns:
        Generated content
    """
    return f"# {topic}\n\nThis is generated content about {topic} in {style} style.\n\n## Key Points\n- Point 1\n- Point 2\n- Point 3"


@tool
def code_review(code: str) -> str:
    """Review code and provide feedback.

    Args:
        code: Code to review

    Returns:
        Code review feedback
    """
    return f"Code Review:\n✓ Good practices observed\n⚠ Suggestion: Consider adding type hints\n⚠ Suggestion: Add error handling"


# =============================================================================
# Worker Agents
# =============================================================================

class WorkerAgentFactory:
    """Factory for creating specialized worker agents"""

    @staticmethod
    def create_researcher(llm: ChatOpenAI) -> callable:
        """Create a research agent"""
        tools = [search_web]
        agent = create_react_agent(
            llm,
            tools,
            state_modifier="You are a research agent. Search for information and provide comprehensive findings."
        )
        return agent

    @staticmethod
    def create_analyst(llm: ChatOpenAI) -> callable:
        """Create an analysis agent"""
        tools = [analyze_data]
        agent = create_react_agent(
            llm,
            tools,
            state_modifier="You are a data analyst. Analyze information and provide insights."
        )
        return agent

    @staticmethod
    def create_writer(llm: ChatOpenAI) -> callable:
        """Create a content writing agent"""
        tools = [write_content]
        agent = create_react_agent(
            llm,
            tools,
            state_modifier="You are a content writer. Create well-structured, engaging content."
        )
        return agent

    @staticmethod
    def create_reviewer(llm: ChatOpenAI) -> callable:
        """Create a code review agent"""
        tools = [code_review]
        agent = create_react_agent(
            llm,
            tools,
            state_modifier="You are a code reviewer. Review code and provide constructive feedback."
        )
        return agent


# =============================================================================
# Supervisor Agent
# =============================================================================

class SupervisorAgent:
    """Central supervisor that orchestrates worker agents"""

    WORKER_NAMES = ["researcher", "analyst", "writer", "reviewer"]

    def __init__(self, llm: ChatOpenAI):
        self.llm = llm
        self.system_prompt = """You are a supervisor managing a team of specialized agents:

- researcher: Searches for information and gathers data
- analyst: Analyzes data and provides insights
- writer: Creates content and documentation
- reviewer: Reviews code and provides feedback

Based on the user's request, decide which agent should act next.
When the task is complete, respond with FINISH.

Consider the conversation history and current progress when making decisions.
Delegate tasks efficiently and ensure quality output."""

    def route(self, state: AgentState) -> str:
        """Decide which agent should handle the next step"""
        messages = state["messages"]
        iteration = state.get("iteration_count", 0)

        # Prevent infinite loops
        if iteration >= config.MAX_ITERATIONS:
            return "FINISH"

        # Build context for decision
        context = f"""
Current task: {state.get('task', 'Not specified')}
Iteration: {iteration}/{config.MAX_ITERATIONS}
Previous results: {state.get('results', {})}

Based on the conversation and task progress, which agent should act next?
Options: {', '.join(self.WORKER_NAMES)}, FINISH
"""

        response = self.llm.invoke([
            {"role": "system", "content": self.system_prompt},
            {"role": "user", "content": context + f"\n\nConversation:\n{self._format_messages(messages)}"}
        ])

        # Parse response to get next agent
        content = response.content.upper()
        for worker in self.WORKER_NAMES:
            if worker.upper() in content:
                return worker

        return "FINISH"

    def _format_messages(self, messages: List[BaseMessage]) -> str:
        """Format messages for context"""
        formatted = []
        for msg in messages[-5:]:  # Last 5 messages for context
            role = "User" if isinstance(msg, HumanMessage) else "Agent"
            formatted.append(f"{role}: {msg.content[:200]}...")
        return "\n".join(formatted)


# =============================================================================
# Graph Builder
# =============================================================================

class SupervisorGraphBuilder:
    """Builds the LangGraph supervisor workflow"""

    def __init__(self, config: SupervisorConfig = SupervisorConfig()):
        self.config = config
        self.llm = ChatOpenAI(model=config.MODEL_ID, temperature=config.TEMPERATURE)
        self.supervisor = SupervisorAgent(self.llm)
        self.workers = self._create_workers()

    def _create_workers(self) -> dict:
        """Create all worker agents"""
        factory = WorkerAgentFactory()
        return {
            "researcher": factory.create_researcher(self.llm),
            "analyst": factory.create_analyst(self.llm),
            "writer": factory.create_writer(self.llm),
            "reviewer": factory.create_reviewer(self.llm)
        }

    def _create_worker_node(self, name: str):
        """Create a node function for a worker agent"""
        worker = self.workers[name]

        def node(state: AgentState) -> AgentState:
            # Invoke worker agent
            result = worker.invoke(state)

            # Update state
            return {
                "messages": result["messages"],
                "results": {**state.get("results", {}), name: result["messages"][-1].content},
                "iteration_count": state.get("iteration_count", 0) + 1
            }

        return node

    def _supervisor_node(self, state: AgentState) -> AgentState:
        """Supervisor decision node"""
        next_agent = self.supervisor.route(state)
        return {"next_agent": next_agent}

    def _route_to_agent(self, state: AgentState) -> str:
        """Route to the appropriate agent or end"""
        next_agent = state.get("next_agent", "FINISH")
        if next_agent == "FINISH":
            return END
        return next_agent

    def build(self) -> StateGraph:
        """Build and compile the supervisor graph"""
        # Create graph
        graph = StateGraph(AgentState)

        # Add supervisor node
        graph.add_node("supervisor", self._supervisor_node)

        # Add worker nodes
        for name in self.supervisor.WORKER_NAMES:
            graph.add_node(name, self._create_worker_node(name))

        # Add edges from START to supervisor
        graph.add_edge(START, "supervisor")

        # Add conditional edges from supervisor to workers or END
        graph.add_conditional_edges(
            "supervisor",
            self._route_to_agent,
            {
                **{name: name for name in self.supervisor.WORKER_NAMES},
                END: END
            }
        )

        # Add edges from workers back to supervisor
        for name in self.supervisor.WORKER_NAMES:
            graph.add_edge(name, "supervisor")

        # Compile with checkpointing if enabled
        if self.config.CHECKPOINT_ENABLED:
            memory = MemorySaver()
            return graph.compile(checkpointer=memory)

        return graph.compile()


# =============================================================================
# High-Level API
# =============================================================================

class SupervisorTeam:
    """High-level API for running supervisor-managed teams"""

    def __init__(self, config: SupervisorConfig = SupervisorConfig()):
        builder = SupervisorGraphBuilder(config)
        self.graph = builder.build()
        self.config = config

    def run(self, task: str, thread_id: str = "default") -> dict:
        """Run a task through the supervisor team

        Args:
            task: Task description
            thread_id: Thread ID for checkpointing

        Returns:
            Final state with results
        """
        initial_state = {
            "messages": [HumanMessage(content=task)],
            "task": task,
            "results": {},
            "iteration_count": 0,
            "next_agent": ""
        }

        config = {"configurable": {"thread_id": thread_id}}

        # Run graph
        final_state = None
        for state in self.graph.stream(initial_state, config):
            final_state = state
            # Print progress
            for key, value in state.items():
                if key in ["researcher", "analyst", "writer", "reviewer"]:
                    print(f"\n[{key.upper()}] Working...")
                elif key == "supervisor":
                    next_agent = value.get("next_agent", "")
                    if next_agent and next_agent != "FINISH":
                        print(f"\n[SUPERVISOR] Delegating to: {next_agent}")

        return final_state

    def get_results(self, state: dict) -> dict:
        """Extract results from final state"""
        if state is None:
            return {}

        # Get the last value from the stream
        last_key = list(state.keys())[-1]
        last_state = state[last_key]

        return {
            "task": last_state.get("task", ""),
            "results": last_state.get("results", {}),
            "iterations": last_state.get("iteration_count", 0),
            "messages": [msg.content for msg in last_state.get("messages", [])]
        }


# =============================================================================
# Usage Examples
# =============================================================================

def example_research_task():
    """Example: Research task requiring multiple agents"""
    print("\n" + "="*60)
    print("EXAMPLE: Research Task")
    print("="*60)

    team = SupervisorTeam()

    task = """
    Research the latest trends in AI agents and provide:
    1. Key findings from recent developments
    2. Analysis of the most promising approaches
    3. A brief summary document
    """

    result = team.run(task, thread_id="research-001")
    final_results = team.get_results(result)

    print("\n" + "-"*40)
    print("FINAL RESULTS:")
    print("-"*40)
    print(f"Task: {final_results.get('task', 'N/A')}")
    print(f"Iterations: {final_results.get('iterations', 0)}")
    print(f"Agents involved: {list(final_results.get('results', {}).keys())}")

    return final_results


def example_code_review_task():
    """Example: Code review task"""
    print("\n" + "="*60)
    print("EXAMPLE: Code Review Task")
    print("="*60)

    team = SupervisorTeam()

    task = """
    Review the following code and provide feedback:

    def calculate_total(items):
        total = 0
        for item in items:
            total = total + item.price
        return total
    """

    result = team.run(task, thread_id="review-001")
    final_results = team.get_results(result)

    print("\n" + "-"*40)
    print("FINAL RESULTS:")
    print("-"*40)
    for agent, output in final_results.get("results", {}).items():
        print(f"\n[{agent.upper()}]:")
        print(output[:500] if output else "No output")

    return final_results


def example_content_creation():
    """Example: Content creation with research"""
    print("\n" + "="*60)
    print("EXAMPLE: Content Creation")
    print("="*60)

    team = SupervisorTeam()

    task = """
    Create a technical blog post about LangGraph multi-agent systems.
    1. Research the topic
    2. Analyze key patterns
    3. Write the article
    """

    result = team.run(task, thread_id="content-001")
    return team.get_results(result)


# =============================================================================
# Main Entry Point
# =============================================================================

def main():
    """Run examples"""
    print("LangGraph Supervisor Agent - ULTRA-CREATE v27.3")
    print("="*60)

    # Check API key
    if not os.getenv("OPENAI_API_KEY"):
        print("Error: OPENAI_API_KEY not set")
        print("Set it with: export OPENAI_API_KEY='your-key'")
        return

    try:
        # Run research example
        example_research_task()

        # Run code review example
        # example_code_review_task()

        # Run content creation example
        # example_content_creation()

    except Exception as e:
        print(f"Error: {e}")
        raise


if __name__ == "__main__":
    main()
