# Autonomous Agents Guide - Patterns & Best Practices

> Guide complet pour la création d'agents IA autonomes basé sur awesome-llm-apps
> et les meilleures pratiques de l'industrie 2025.

## Vue d'Ensemble

### Qu'est-ce qu'un Agent Autonome?

Un agent autonome est un système IA capable de:
- **Percevoir** son environnement (inputs, tools, APIs)
- **Raisonner** sur les actions à entreprendre
- **Agir** de manière autonome pour atteindre un objectif
- **Apprendre** de ses expériences (optionnel)

### Taxonomie des Agents

```
┌─────────────────────────────────────────────────────────────┐
│                    TYPES D'AGENTS IA                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   SIMPLE     │  │   AGENTIC    │  │ MULTI-AGENT  │      │
│  │   AGENT      │  │     RAG      │  │    SYSTEM    │      │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤      │
│  │ • 1 LLM      │  │ • LLM + KB   │  │ • N agents   │      │
│  │ • Tools      │  │ • Retrieval  │  │ • Roles      │      │
│  │ • No memory  │  │ • Context    │  │ • Delegation │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ SELF-HEALING │  │  STATEFUL    │  │  MIXTURE     │      │
│  │    AGENT     │  │   AGENT      │  │  OF AGENTS   │      │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤      │
│  │ • Auto-fix   │  │ • Sessions   │  │ • Multi-LLM  │      │
│  │ • Retry      │  │ • History    │  │ • Proposers  │      │
│  │ • Fallback   │  │ • Context    │  │ • Aggregator │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Frameworks Comparés

| Framework | Use Case | Complexité | Production-Ready |
|-----------|----------|------------|------------------|
| **Phidata** | Agents rapides, tools | Basse | ⭐⭐⭐⭐⭐ |
| **LangGraph** | Workflows complexes | Haute | ⭐⭐⭐⭐ |
| **CrewAI** | Équipes multi-agents | Moyenne | ⭐⭐⭐⭐ |
| **AutoGen** | Conversations | Haute | ⭐⭐⭐ |
| **OpenAI Swarm** | Handoffs simples | Basse | ⭐⭐⭐⭐⭐ |
| **LlamaIndex** | RAG avancé | Moyenne | ⭐⭐⭐⭐ |
| **Smolagents** | Léger, code-as-action | Très Basse | ⭐⭐⭐⭐ |
| **Google ADK** | Gemini-first, Google Cloud | Basse | ⭐⭐⭐⭐⭐ |
| **Cerebras** | Ultra-fast inference | Basse | ⭐⭐⭐⭐⭐ |

### Arbre de Décision

```
Besoin d'un agent?
│
├─ Simple (1 agent, tools) ──────────────────→ Phidata
│
├─ Workflow complexe (états, cycles) ────────→ LangGraph
│
├─ Équipe multi-agents (rôles définis) ──────→ CrewAI
│
├─ Conversations multi-parties ──────────────→ AutoGen
│
├─ RAG avancé (multi-index, routing) ────────→ LlamaIndex
│
├─ Handoffs légers (production) ─────────────→ OpenAI Swarm
│
├─ Edge/minimal (<100KB) ────────────────────→ Smolagents
│
├─ Gemini + Google Cloud ────────────────────→ Google ADK
│
└─ Speed-critical (10x faster) ──────────────→ Cerebras
```

---

## Pattern 1: Streaming Responses

> Source: `ai_agent_framework_crash_course/openai_sdk_crash_course/`

### Implémentation Phidata
```python
from phi.agent import Agent
from phi.model.openai import OpenAIChat

agent = Agent(
    model=OpenAIChat(id="gpt-4o"),
    markdown=True
)

# Streaming avec callback
for chunk in agent.run("Explain quantum computing", stream=True):
    print(chunk.content, end="", flush=True)

# Ou avec print_response
agent.print_response("Explain quantum computing", stream=True)
```

### Implémentation OpenAI SDK
```python
from openai import OpenAI

client = OpenAI()

stream = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Explain quantum computing"}],
    stream=True
)

for chunk in stream:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="", flush=True)
```

---

## Pattern 2: Sessions Persistantes

> Source: `ai_agent_framework_crash_course/openai_sdk_crash_course/7_sessions/`

### Avec SQLite Storage
```python
from phi.agent import Agent
from phi.storage.agent.sqlite import SqlAgentStorage

# Créer un agent avec persistence
agent = Agent(
    session_id="user_session_123",
    storage=SqlAgentStorage(
        table_name="agent_sessions",
        db_file="data/sessions.db"
    ),
    # Ajouter l'historique aux messages
    add_history_to_messages=True,
    num_history_responses=5,  # Garder 5 derniers échanges
)

# Session 1
agent.print_response("My name is Alice")

# Session 2 (même session_id) - l'agent se souvient
agent.print_response("What's my name?")  # → "Your name is Alice"
```

### Avec PostgreSQL
```python
from phi.storage.agent.postgres import PgAgentStorage

agent = Agent(
    session_id="user_123",
    storage=PgAgentStorage(
        table_name="agent_sessions",
        db_url="postgresql://user:pass@localhost:5432/agents"
    ),
    add_history_to_messages=True
)
```

### Pattern Session Manager
```python
class SessionManager:
    def __init__(self, db_url: str):
        self.storage = PgAgentStorage(table_name="sessions", db_url=db_url)
        self.active_sessions: dict[str, Agent] = {}

    def get_or_create_session(self, user_id: str) -> Agent:
        if user_id not in self.active_sessions:
            self.active_sessions[user_id] = Agent(
                session_id=user_id,
                storage=self.storage,
                add_history_to_messages=True
            )
        return self.active_sessions[user_id]

    def clear_session(self, user_id: str):
        if user_id in self.active_sessions:
            del self.active_sessions[user_id]
```

---

## Pattern 3: Memory avec RAG

> Source: `advanced_llm_apps/llm_apps_with_memory_tutorials/`

### Local ChatGPT avec Mémoire
```python
from phi.agent import Agent
from phi.knowledge.text import TextKnowledgeBase
from phi.vectordb.lancedb import LanceDb
from phi.embedder.ollama import OllamaEmbedder

# Knowledge base locale
knowledge = TextKnowledgeBase(
    path="data/documents",
    vector_db=LanceDb(
        table_name="local_docs",
        uri="data/lancedb",
        embedder=OllamaEmbedder(model="nomic-embed-text")
    )
)

# Agent avec RAG local
agent = Agent(
    model=Ollama(id="llama3.2"),
    knowledge=knowledge,
    search_knowledge=True,
    instructions=[
        "Search your knowledge base for relevant information",
        "If not found, say you don't have that information"
    ]
)
```

### Hybrid Search RAG
```python
from phi.vectordb.pgvector import PgVector, SearchType

# Vector DB avec recherche hybride
vector_db = PgVector(
    table_name="documents",
    db_url=db_url,
    search_type=SearchType.hybrid,  # Combine BM25 + Vector
)

knowledge = PDFKnowledgeBase(
    path="data/pdfs",
    vector_db=vector_db
)

# L'agent utilise automatiquement la recherche hybride
agent = Agent(
    knowledge=knowledge,
    search_knowledge=True
)
```

---

## Pattern 4: Mixture of Agents

> Source: `starter_ai_agents/mixture_of_agents/`

### Architecture
```
                    ┌─────────────────┐
                    │   USER QUERY    │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
        ┌──────────┐  ┌──────────┐  ┌──────────┐
        │ GPT-4o   │  │ Claude   │  │ Gemini   │
        │ Proposer │  │ Proposer │  │ Proposer │
        └────┬─────┘  └────┬─────┘  └────┬─────┘
              │              │              │
              └──────────────┼──────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   AGGREGATOR    │
                    │   (Best of N)   │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  FINAL ANSWER   │
                    └─────────────────┘
```

### Implémentation
```python
from phi.agent import Agent
from phi.model.openai import OpenAIChat
from phi.model.anthropic import Claude
from phi.model.google import Gemini

# Agents proposeurs
proposers = [
    Agent(
        name="GPT-4o Proposer",
        model=OpenAIChat(id="gpt-4o"),
        instructions=["Provide creative solutions"]
    ),
    Agent(
        name="Claude Proposer",
        model=Claude(id="claude-3-5-sonnet-20241022"),
        instructions=["Provide analytical solutions"]
    ),
    Agent(
        name="Gemini Proposer",
        model=Gemini(id="gemini-2.0-flash-exp"),
        instructions=["Provide technical solutions"]
    )
]

# Agent agrégateur
aggregator = Agent(
    name="Aggregator",
    model=OpenAIChat(id="gpt-4o"),
    instructions=[
        "You receive multiple proposed solutions",
        "Analyze each proposal's strengths and weaknesses",
        "Synthesize the best answer combining the best elements"
    ]
)

async def mixture_of_agents(query: str) -> str:
    # Collecter les propositions
    proposals = []
    for proposer in proposers:
        response = proposer.run(query)
        proposals.append(f"{proposer.name}: {response.content}")

    # Agréger
    combined_input = f"Query: {query}\n\nProposals:\n" + "\n\n".join(proposals)
    final_response = aggregator.run(combined_input)

    return final_response.content
```

---

## Pattern 5: Self-Healing Agent

### Architecture
```
┌─────────────────────────────────────────────────────────┐
│                   SELF-HEALING LOOP                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│    ┌─────────┐      ┌─────────┐      ┌─────────┐       │
│    │ EXECUTE │──────│  CHECK  │──────│  HEAL   │       │
│    └────┬────┘      └────┬────┘      └────┬────┘       │
│         │                │                │             │
│         │                │   Error?       │             │
│         │                │   ┌────┐       │             │
│         │                └───│ Y  │───────┘             │
│         │                    └────┘                     │
│         │                    ┌────┐                     │
│         │                    │ N  │                     │
│         │                    └──┬─┘                     │
│         │                       │                       │
│         ▼                       ▼                       │
│    ┌─────────┐           ┌─────────┐                   │
│    │  RETRY  │           │ SUCCESS │                   │
│    │ (max 3) │           └─────────┘                   │
│    └─────────┘                                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Implémentation
```python
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
import structlog

logger = structlog.get_logger()

class SelfHealingAgent:
    def __init__(self, agent: Agent, max_retries: int = 3):
        self.agent = agent
        self.max_retries = max_retries
        self.error_history = []

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type((TimeoutError, ConnectionError))
    )
    def execute_with_healing(self, task: str) -> str:
        try:
            logger.info("executing_task", task=task)
            result = self.agent.run(task)
            return result.content

        except Exception as e:
            logger.error("task_failed", error=str(e))
            self.error_history.append({"task": task, "error": str(e)})

            # Tenter de corriger
            healing_prompt = f"""
            The previous task failed with error: {e}
            Original task: {task}

            Please analyze the error and suggest a corrected approach.
            Then execute the corrected approach.
            """

            healed_result = self.agent.run(healing_prompt)
            return healed_result.content

    def get_error_summary(self) -> list:
        return self.error_history
```

---

## Pattern 6: Tool-Augmented Agents

### Outils Courants Phidata
```python
from phi.tools.duckduckgo import DuckDuckGo
from phi.tools.newspaper4k import Newspaper4k
from phi.tools.calculator import Calculator
from phi.tools.file import FileTools
from phi.tools.shell import ShellTools
from phi.tools.python import PythonTools

# Agent de recherche
research_agent = Agent(
    tools=[
        DuckDuckGo(),      # Recherche web
        Newspaper4k(),     # Lecture articles
    ],
    instructions=["Search and read articles to answer questions"]
)

# Agent développeur
dev_agent = Agent(
    tools=[
        FileTools(),       # Lecture/écriture fichiers
        ShellTools(),      # Commandes shell
        PythonTools(),     # Exécution Python
    ],
    instructions=["You can read/write files and execute code"]
)
```

### Créer des Outils Custom
```python
from phi.tools import Toolkit
from phi.utils.log import logger

class WeatherTool(Toolkit):
    def __init__(self, api_key: str):
        super().__init__(name="weather")
        self.api_key = api_key
        self.register(self.get_weather)

    def get_weather(self, city: str) -> str:
        """Get current weather for a city.

        Args:
            city: The city name to get weather for.

        Returns:
            str: Weather information for the city.
        """
        # Appel API météo
        response = requests.get(
            f"https://api.weather.com/v1/current",
            params={"city": city, "key": self.api_key}
        )
        data = response.json()
        return f"Weather in {city}: {data['temp']}°C, {data['condition']}"

# Utilisation
agent = Agent(
    tools=[WeatherTool(api_key="...")],
    instructions=["Use the weather tool to answer weather questions"]
)
```

---

## Pattern 7: Multi-Agent Teams (CrewAI)

### Structure d'Équipe
```python
from crewai import Agent, Task, Crew, Process

# Définir les rôles
researcher = Agent(
    role="Senior Research Analyst",
    goal="Conduct thorough research on topics",
    backstory="You're an expert researcher with 20 years experience",
    tools=[search_tool, scrape_tool],
    verbose=True
)

analyst = Agent(
    role="Data Analyst",
    goal="Analyze data and extract insights",
    backstory="You're a data scientist specializing in pattern recognition",
    tools=[python_tool],
    verbose=True
)

writer = Agent(
    role="Content Writer",
    goal="Create engaging content from analysis",
    backstory="Award-winning journalist who transforms data into stories",
    verbose=True
)

# Définir les tâches
research_task = Task(
    description="Research {topic} comprehensively",
    agent=researcher,
    expected_output="Detailed research findings"
)

analysis_task = Task(
    description="Analyze the research findings",
    agent=analyst,
    expected_output="Key insights and patterns",
    context=[research_task]  # Dépend de research_task
)

writing_task = Task(
    description="Write an article based on analysis",
    agent=writer,
    expected_output="Polished article ready for publication",
    context=[research_task, analysis_task]
)

# Créer l'équipe
crew = Crew(
    agents=[researcher, analyst, writer],
    tasks=[research_task, analysis_task, writing_task],
    process=Process.sequential,  # Ou Process.hierarchical
    verbose=True
)

# Exécuter
result = crew.kickoff(inputs={"topic": "AI Agents in 2025"})
```

---

## Pattern 8: LangGraph Workflows

### Workflow avec États
```python
from langgraph.graph import StateGraph, END
from typing import TypedDict, Annotated, Literal
import operator

# Définir l'état
class AgentState(TypedDict):
    messages: Annotated[list, operator.add]
    current_step: str
    results: dict

# Définir les noeuds
def research_node(state: AgentState) -> AgentState:
    """Noeud de recherche"""
    query = state["messages"][-1]
    # ... logique de recherche ...
    return {
        "messages": [f"Research results for: {query}"],
        "current_step": "analyze",
        "results": {"research": "..."}
    }

def analyze_node(state: AgentState) -> AgentState:
    """Noeud d'analyse"""
    research = state["results"].get("research", "")
    # ... logique d'analyse ...
    return {
        "messages": [f"Analysis of: {research}"],
        "current_step": "decide",
        "results": {**state["results"], "analysis": "..."}
    }

def decide_next(state: AgentState) -> Literal["write", "research"]:
    """Décider la prochaine étape"""
    if "needs_more_research" in state["results"].get("analysis", ""):
        return "research"
    return "write"

def write_node(state: AgentState) -> AgentState:
    """Noeud d'écriture"""
    return {
        "messages": ["Final output written"],
        "current_step": "end",
        "results": {**state["results"], "output": "..."}
    }

# Construire le graphe
workflow = StateGraph(AgentState)

# Ajouter les noeuds
workflow.add_node("research", research_node)
workflow.add_node("analyze", analyze_node)
workflow.add_node("write", write_node)

# Définir les transitions
workflow.set_entry_point("research")
workflow.add_edge("research", "analyze")
workflow.add_conditional_edges("analyze", decide_next)
workflow.add_edge("write", END)

# Compiler
app = workflow.compile()

# Exécuter
result = app.invoke({"messages": ["Research AI agents"], "current_step": "start", "results": {}})
```

---

## Pattern 9: Beam AI Enterprise Templates

> **200+ templates production-ready** pour agents IA d'entreprise.
> Source: https://beam.ai/agentic-insights

### Catégories de Templates Beam AI

| Catégorie | Templates | Description |
|-----------|-----------|-------------|
| **Financial Services** | 40+ | Invoice processing, expense management, fraud detection |
| **HR & Recruitment** | 35+ | Resume screening, onboarding, employee analytics |
| **Healthcare** | 30+ | Patient scheduling, claims processing, clinical docs |
| **Legal** | 25+ | Contract analysis, compliance checking, document review |
| **Customer Support** | 45+ | Ticket routing, response generation, sentiment analysis |
| **Sales & Marketing** | 30+ | Lead scoring, email campaigns, market research |

### Templates Phares Beam AI

#### 1. Invoice Processing Agent
```python
# Pattern Beam AI: Invoice automation
class InvoiceProcessingAgent:
    """
    Capabilities:
    - Extract data from PDF/image invoices (OCR)
    - Validate against PO/contracts
    - Route for approval based on amount
    - Auto-book to accounting system
    """

    def __init__(self):
        self.ocr_model = "gpt-4-vision"
        self.approval_thresholds = {
            "auto": 1000,      # Auto-approve < $1000
            "manager": 10000,  # Manager approval < $10000
            "director": 50000  # Director approval < $50000
        }

    async def process_invoice(self, invoice_file: bytes) -> dict:
        # 1. Extract data via vision
        extracted = await self.extract_invoice_data(invoice_file)

        # 2. Validate
        validation = await self.validate_invoice(extracted)

        # 3. Route for approval
        approval_route = self.determine_approval_route(extracted["amount"])

        # 4. Book if auto-approved
        if approval_route == "auto":
            await self.book_to_accounting(extracted)

        return {
            "data": extracted,
            "validation": validation,
            "approval_route": approval_route
        }
```

#### 2. Customer Support Escalation Agent
```python
# Pattern Beam AI: Intelligent ticket routing
class SupportEscalationAgent:
    """
    Capabilities:
    - Analyze ticket sentiment and urgency
    - Classify issue type
    - Route to appropriate team/tier
    - Suggest response templates
    """

    def __init__(self):
        self.sentiment_model = Agent(model=OpenAIChat(id="gpt-4o"))
        self.routing_rules = self.load_routing_rules()

    async def process_ticket(self, ticket: dict) -> dict:
        # Analyze
        analysis = await self.analyze_ticket(ticket)

        # Determine routing
        routing = self.determine_routing(
            sentiment=analysis["sentiment"],
            urgency=analysis["urgency"],
            category=analysis["category"]
        )

        # Generate suggested response
        suggestion = await self.generate_response_suggestion(
            ticket=ticket,
            analysis=analysis
        )

        return {
            "analysis": analysis,
            "routing": routing,
            "suggested_response": suggestion
        }

    def determine_routing(self, sentiment: str, urgency: int, category: str) -> dict:
        # High urgency + negative sentiment = Tier 3
        if urgency >= 8 and sentiment == "negative":
            return {"tier": 3, "priority": "critical", "sla_hours": 1}

        # VIP customers
        if category == "enterprise":
            return {"tier": 2, "priority": "high", "sla_hours": 4}

        # Standard routing
        return {"tier": 1, "priority": "normal", "sla_hours": 24}
```

#### 3. Contract Analysis Agent
```python
# Pattern Beam AI: Legal document analysis
class ContractAnalysisAgent:
    """
    Capabilities:
    - Extract key terms and clauses
    - Identify risks and obligations
    - Compare against standard templates
    - Flag unusual provisions
    """

    CLAUSE_TYPES = [
        "termination", "liability", "indemnification",
        "confidentiality", "payment_terms", "warranty"
    ]

    async def analyze_contract(self, contract_pdf: bytes) -> dict:
        # Extract text
        text = await self.extract_text(contract_pdf)

        # Identify clauses
        clauses = await self.identify_clauses(text)

        # Analyze risks
        risks = await self.analyze_risks(clauses)

        # Compare to standard
        deviations = await self.compare_to_standard(clauses)

        return {
            "clauses": clauses,
            "risks": risks,
            "deviations": deviations,
            "summary": await self.generate_summary(clauses, risks)
        }
```

### Beam AI Best Practices

| Practice | Description |
|----------|-------------|
| **Modular Architecture** | Chaque agent = 1 responsabilité |
| **Human-in-the-Loop** | Escalation pour décisions critiques |
| **Audit Trail** | Logger toutes les décisions |
| **Fallback Handling** | Toujours prévoir un fallback humain |
| **Confidence Thresholds** | Ne pas agir si confidence < 85% |

---

## Pattern 10: Autonoly No-Code AI Agents

> **Templates agents IA no-code** pour automatisation business.
> Source: https://autonoly.com/templates

### Catégories Autonoly

| Catégorie | Templates | Use Cases |
|-----------|-----------|-----------|
| **Business Intelligence** | 15+ | Reports, dashboards, KPI monitoring |
| **Document Intelligence** | 20+ | OCR, extraction, classification |
| **Sales & Marketing** | 25+ | Lead gen, email automation, social |
| **Web Automation** | 20+ | Scraping, form filling, monitoring |
| **Data Integration** | 15+ | ETL, API sync, data transformation |

### Templates Phares Autonoly

#### 1. Business Intelligence Report Agent
```python
# Pattern Autonoly: Automated BI reporting
class BIReportAgent:
    """
    No-code workflow pattern pour rapports automatisés.
    """

    def __init__(self, data_sources: list[str]):
        self.sources = data_sources
        self.schedule = "daily"

    async def generate_report(self) -> dict:
        # 1. Collecter données multi-sources
        data = await self.collect_data()

        # 2. Transformer et agréger
        aggregated = self.aggregate_data(data)

        # 3. Générer insights avec LLM
        insights = await self.generate_insights(aggregated)

        # 4. Créer visualisations
        charts = self.create_charts(aggregated)

        # 5. Compiler rapport
        report = self.compile_report(aggregated, insights, charts)

        return report
```

#### 2. Lead Generation Agent
```python
# Pattern Autonoly: Automated lead generation
class LeadGenAgent:
    """
    Multi-source lead generation with enrichment.
    """

    SOURCES = ["linkedin", "crunchbase", "google_search", "directories"]

    async def find_leads(self, criteria: dict) -> list[dict]:
        leads = []

        # Search across sources
        for source in self.SOURCES:
            source_leads = await self.search_source(source, criteria)
            leads.extend(source_leads)

        # Deduplicate
        leads = self.deduplicate(leads)

        # Enrich with additional data
        enriched = await self.enrich_leads(leads)

        # Score leads
        scored = self.score_leads(enriched, criteria)

        return sorted(scored, key=lambda x: x["score"], reverse=True)
```

#### 3. Document Classification Agent
```python
# Pattern Autonoly: Document auto-classification
class DocumentClassifierAgent:
    """
    Classify and route documents automatically.
    """

    CATEGORIES = {
        "invoice": {"route": "accounts_payable", "priority": "high"},
        "contract": {"route": "legal", "priority": "high"},
        "resume": {"route": "hr", "priority": "normal"},
        "report": {"route": "analytics", "priority": "low"}
    }

    async def classify_and_route(self, document: bytes) -> dict:
        # Extract content
        content = await self.extract_content(document)

        # Classify
        category = await self.classify(content)

        # Get routing
        routing = self.CATEGORIES.get(category, {"route": "general", "priority": "low"})

        # Extract key metadata
        metadata = await self.extract_metadata(content, category)

        return {
            "category": category,
            "routing": routing,
            "metadata": metadata,
            "confidence": await self.get_confidence(content, category)
        }
```

### Autonoly vs Code-First

| Aspect | Autonoly (No-Code) | Code-First (Phidata) |
|--------|-------------------|----------------------|
| **Setup Time** | Minutes | Hours |
| **Customization** | Limited | Unlimited |
| **Maintenance** | Low | Higher |
| **Scalability** | Platform-dependent | Full control |
| **Cost** | Subscription | Infrastructure |
| **Best For** | Business users | Developers |

### Intégration ULTRA-CREATE

```python
# Convertir workflow Autonoly en code Phidata
def autonoly_to_phidata(workflow_config: dict) -> Agent:
    """
    Importer un workflow Autonoly comme agent Phidata.
    """
    tools = []

    for step in workflow_config["steps"]:
        if step["type"] == "api_call":
            tools.append(create_api_tool(step))
        elif step["type"] == "llm_prompt":
            tools.append(create_llm_tool(step))
        elif step["type"] == "data_transform":
            tools.append(create_transform_tool(step))

    return Agent(
        name=workflow_config["name"],
        tools=tools,
        instructions=workflow_config.get("instructions", [])
    )
```

---

## Bonnes Pratiques

### 1. Observabilité
```python
import structlog
from opentelemetry import trace

logger = structlog.get_logger()
tracer = trace.get_tracer(__name__)

class ObservableAgent:
    def run(self, task: str):
        with tracer.start_as_current_span("agent_run") as span:
            span.set_attribute("task", task)
            logger.info("agent_start", task=task)

            try:
                result = self._execute(task)
                span.set_attribute("status", "success")
                logger.info("agent_success")
                return result
            except Exception as e:
                span.set_attribute("status", "error")
                span.record_exception(e)
                logger.error("agent_error", error=str(e))
                raise
```

### 2. Sécurité
```python
# Limiter les actions dangereuses
ALLOWED_ACTIONS = {"search", "read", "analyze", "write"}
BLOCKED_PATTERNS = ["rm -rf", "DROP TABLE", "DELETE FROM"]

def validate_action(action: str, content: str) -> bool:
    if action not in ALLOWED_ACTIONS:
        return False

    for pattern in BLOCKED_PATTERNS:
        if pattern.lower() in content.lower():
            return False

    return True
```

### 3. Rate Limiting
```python
from ratelimit import limits, sleep_and_retry

class RateLimitedAgent:
    @sleep_and_retry
    @limits(calls=10, period=60)  # 10 calls per minute
    def run(self, task: str):
        return self.agent.run(task)
```

### 4. Fallback Chains
```python
class FallbackAgent:
    def __init__(self, agents: list[Agent]):
        self.agents = agents

    def run(self, task: str) -> str:
        for i, agent in enumerate(self.agents):
            try:
                return agent.run(task).content
            except Exception as e:
                logger.warning(f"Agent {i} failed, trying next", error=str(e))
                continue

        raise Exception("All agents failed")
```

---

## Pattern 7: TypeSafe Agents (Agno 2.0)

> Source: `ai-agents/Agno_TypeSafe_Agents.ipynb` + `knowledge/agno-typesafe-patterns.md`
> Template: `ai-typesafe-agent`

### Concept
Agents avec schemas Pydantic garantissant inputs/outputs typés et validés.

```python
from pydantic import BaseModel, Field
from agno.agent import Agent
from agno.models.openai import OpenAIChat

# Schema d'entrée typé
class ResearchInput(BaseModel):
    topic: str = Field(..., description="Research topic")
    depth: str = Field(default="medium")
    max_sources: int = Field(default=5, ge=1, le=20)

# Schema de sortie typé
class ResearchOutput(BaseModel):
    summary: str
    key_findings: list[str]
    confidence: float = Field(ge=0, le=1)

# Agent TypeSafe
agent = Agent(
    model=OpenAIChat(id="gpt-4o-mini"),
    input_schema=ResearchInput,
    output_schema=ResearchOutput,
    parser_model=OpenAIChat(id="gpt-4o-mini")  # Dédié au parsing
)

# Exécution typée
result = agent.run(input=ResearchInput(topic="AI agents"))
print(result.content.summary)  # Autocomplete IDE
```

### Avantages
- **Validation automatique** des inputs/outputs
- **Autocomplete IDE** complet
- **Tests simplifiés** (mock facile)
- **Documentation auto** via schemas

---

## Pattern 8: LangGraph Supervisor

> Source: `ai-agents/LangGraph_Supervisor.ipynb` + Template: `ai-langgraph-supervisor`

### Architecture
```
                    ┌─────────────┐
                    │  SUPERVISOR │ ← Décide quel agent agit
                    │  (Router)   │
                    └──────┬──────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
   ┌──────────┐     ┌──────────┐     ┌──────────┐
   │RESEARCHER│     │ ANALYST  │     │  WRITER  │
   └────┬─────┘     └────┬─────┘     └────┬─────┘
         └───────────────┴───────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │   RESULT    │
                    └─────────────┘
```

### Implémentation
```python
from langgraph.graph import StateGraph, END, START
from langgraph.prebuilt import create_react_agent
from langchain_openai import ChatOpenAI

class AgentState(TypedDict):
    messages: list
    next_agent: str
    results: dict

# Workers spécialisés
workers = {
    "researcher": create_react_agent(llm, [search_tool]),
    "analyst": create_react_agent(llm, [analyze_tool]),
    "writer": create_react_agent(llm, [write_tool])
}

# Supervisor routing
def supervisor_route(state):
    # Décide dynamiquement le prochain agent
    return {"next_agent": decide_next(state)}

# Graph
graph = StateGraph(AgentState)
graph.add_node("supervisor", supervisor_route)
for name, worker in workers.items():
    graph.add_node(name, worker)

# Edges
graph.add_edge(START, "supervisor")
graph.add_conditional_edges("supervisor", route_to_agent)

compiled = graph.compile(checkpointer=MemorySaver())
```

### Use Cases
- **Recherche collaborative**: Researcher → Analyst → Writer
- **Code Review**: Multiple reviewers en parallèle
- **Content Pipeline**: Draft → Edit → Publish

---

## Pattern 9: Guardrails + Instructor

> Source: `experiment/Guardrails_intro.ipynb` + `knowledge/guardrails-instructor-patterns.md`

### Defense in Depth
```
User Input → [PII Guard] → LLM → [Instructor Schema] → [Toxicity Guard] → Output
```

### Guardrails (Validation)
```python
from guardrails import Guard
from guardrails.hub import ToxicLanguage, PII, ValidJSON

guard = Guard().use_many(
    PII(on_fail="fix"),           # Masquer infos personnelles
    ToxicLanguage(on_fail="filter"),  # Filtrer contenu toxique
    ValidJSON(on_fail="reask")    # Réessayer si JSON invalide
)

result = guard(
    model="gpt-4o",
    messages=[{"role": "user", "content": prompt}]
)
```

### Instructor (Structured Output)
```python
import instructor
from pydantic import BaseModel

class SafeResponse(BaseModel):
    answer: str
    confidence: float
    sources: list[str]

client = instructor.from_openai(OpenAI())
response = client.chat.completions.create(
    model="gpt-4o",
    response_model=SafeResponse,
    max_retries=3,  # Auto-retry on validation failure
    messages=[{"role": "user", "content": query}]
)
```

---

## Pattern 10: Vision RAG Avancé

> Source: `rag/Vision_RAG_Cohere_Embed_V4_Gemini_Flash.ipynb`
> Template: `rag-vision-advanced`

### Pipeline
```
PDF → Page Images → Cohere Embed V4 → ChromaDB → Rerank → Gemini Flash QA
```

### Implémentation
```python
import cohere
import chromadb
import google.generativeai as genai

# Embeddings multimodaux
co = cohere.Client()
embeddings = co.embed(
    model="embed-v4.0",
    input_type="image",
    embedding_types=["float"],
    images=[image_base64]
).embeddings.float

# Storage persistant
client = chromadb.PersistentClient(path="./chroma_db")
collection = client.get_or_create_collection("vision_rag")
collection.add(
    ids=[f"page_{i}"],
    embeddings=[embeddings],
    metadatas=[{"source": pdf_name, "page": i}]
)

# Reranking
results = co.rerank(
    model="rerank-v3.5",
    query=question,
    documents=retrieved_docs
)

# Vision QA
model = genai.GenerativeModel("gemini-2.5-flash")
response = model.generate_content([question, top_image])
```

### Avantages
- **Pas d'OCR** - Analyse directe des images
- **Persistant** - ChromaDB stocke les embeddings
- **Reranking** - Améliore la précision de 30%+

---

## Pattern 11: Google ADK (Agent Development Kit)

> Source: `google-adk-course` template
> Framework officiel Google pour agents IA avec Gemini

### Concept

Google ADK est le kit de développement officiel pour créer des agents IA avec Gemini. Il offre une intégration native avec l'écosystème Google Cloud et les modèles Gemini.

### Architecture ADK

```
┌─────────────────────────────────────────────────────────────┐
│                     GOOGLE ADK AGENT                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌───────────┐     ┌───────────┐     ┌───────────┐        │
│   │   MODEL   │     │   TOOLS   │     │  MEMORY   │        │
│   │  Gemini   │     │  Custom   │     │  Session  │        │
│   └─────┬─────┘     └─────┬─────┘     └─────┬─────┘        │
│         └─────────────────┼─────────────────┘              │
│                           │                                 │
│                           ▼                                 │
│                  ┌─────────────────┐                       │
│                  │   AGENT CORE    │                       │
│                  │   Orchestrator  │                       │
│                  └────────┬────────┘                       │
│                           │                                 │
│         ┌─────────────────┼─────────────────┐              │
│         ▼                 ▼                 ▼              │
│   ┌──────────┐     ┌──────────┐     ┌──────────┐          │
│   │ Web UI   │     │   CLI    │     │   API    │          │
│   └──────────┘     └──────────┘     └──────────┘          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Implémentation de Base

```python
import google.generativeai as genai
from google.adk import Agent, Tool

# Configuration
genai.configure(api_key=os.environ["GOOGLE_API_KEY"])

# Définir un outil custom
@Tool.register
def search_database(query: str) -> str:
    """Search the internal database for information.

    Args:
        query: The search query string

    Returns:
        Search results as formatted string
    """
    # Implémentation
    return f"Results for: {query}"

# Créer l'agent
agent = Agent(
    model="gemini-2.0-flash",
    tools=[search_database],
    system_instruction="""You are a helpful assistant that can search
    the company database to answer questions."""
)

# Exécution
response = agent.run("Find all employees in the engineering department")
print(response.text)
```

### Multi-Tool Agent

```python
from google.adk import Agent, Tool

@Tool.register
def get_weather(city: str) -> str:
    """Get current weather for a city."""
    # Implementation
    return f"Weather in {city}: 22°C, Sunny"

@Tool.register
def get_calendar(date: str) -> str:
    """Get calendar events for a specific date."""
    # Implementation
    return f"Events for {date}: Meeting at 10am"

@Tool.register
def send_email(to: str, subject: str, body: str) -> str:
    """Send an email to a recipient."""
    # Implementation
    return f"Email sent to {to}"

# Agent multi-outils
assistant = Agent(
    model="gemini-2.0-flash",
    tools=[get_weather, get_calendar, send_email],
    system_instruction="""You are a personal assistant that can:
    - Check weather conditions
    - Manage calendar events
    - Send emails on behalf of the user"""
)

# L'agent choisit automatiquement les bons outils
response = assistant.run(
    "What's the weather in Paris? Also, what meetings do I have tomorrow?"
)
```

### Streaming Responses

```python
from google.adk import Agent

agent = Agent(
    model="gemini-2.0-flash",
    stream=True
)

# Streaming response
for chunk in agent.run_stream("Explain quantum computing"):
    print(chunk.text, end="", flush=True)
```

### Session Memory

```python
from google.adk import Agent, SessionMemory

# Agent avec mémoire de session
agent = Agent(
    model="gemini-2.0-flash",
    memory=SessionMemory(
        max_history=10,  # Garder 10 derniers échanges
        persist_path="./sessions"  # Persistance optionnelle
    )
)

# Conversation avec contexte
agent.run("My name is Alice")
response = agent.run("What's my name?")  # → "Your name is Alice"
```

### Google ADK vs Autres Frameworks

| Aspect | Google ADK | Phidata | LangGraph |
|--------|-----------|---------|-----------|
| **Modèle principal** | Gemini | OpenAI, multi | Multi-provider |
| **Integration Google** | Native | Plugin | Plugin |
| **Complexité** | Basse | Basse | Haute |
| **Production** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Use Case** | Gemini-first | Général | Workflows |

### Quand Utiliser Google ADK

**Idéal pour:**
- Applications Gemini-first
- Intégration Google Cloud (Vertex AI, Firebase)
- Agents avec grounding web (Search API)
- Vision + multimodal natif

**Éviter si:**
- Multi-provider requis (OpenAI + Anthropic + Gemini)
- Workflows complexes avec cycles (utiliser LangGraph)
- Équipes multi-agents avec rôles (utiliser CrewAI)

---

## Pattern 12: Smolagents (HuggingFace)

> Source: `ai-smolagent` template + `knowledge/smolagents-patterns.md`
> Framework minimaliste "code-as-action"

### Concept

Smolagents est un framework léger (<100KB) où les agents "pensent en Python" - le LLM génère du code Python exécutable plutôt que des appels d'outils JSON.

### Architecture Code-as-Action

```
┌─────────────────────────────────────────────────────────────┐
│                  SMOLAGENTS CODE AGENT                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  User Query                                                 │
│       │                                                     │
│       ▼                                                     │
│  ┌─────────────────────┐                                   │
│  │ LLM Reasoning       │                                   │
│  │ (Thought step)      │                                   │
│  └──────────┬──────────┘                                   │
│             │                                               │
│             ▼                                               │
│  ┌─────────────────────┐                                   │
│  │ Code Generation     │ ← Génère Python, pas JSON         │
│  │ ```python           │                                   │
│  │ result = tool(x)    │                                   │
│  │ ```                 │                                   │
│  └──────────┬──────────┘                                   │
│             │                                               │
│             ▼                                               │
│  ┌─────────────────────┐                                   │
│  │ Code Execution      │ ← Exécution sandboxée             │
│  │ (Sandboxed)         │                                   │
│  └──────────┬──────────┘                                   │
│             │                                               │
│             ▼                                               │
│  Continue or Final Answer                                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Implémentation de Base

```python
from smolagents import CodeAgent, InferenceClientModel

# Modèle via HuggingFace Inference API
model = InferenceClientModel(
    model_id="Qwen/Qwen2.5-Coder-32B-Instruct"
)

# Agent basique
agent = CodeAgent(tools=[], model=model)

# Exécute du code directement
result = agent.run("Calculate primes up to 100")
print(result)  # Liste des nombres premiers
```

### Custom Tools

```python
from smolagents import tool

@tool
def calculate_compound_interest(
    principal: float,
    rate: float,
    years: int
) -> str:
    """Calculate compound interest on an investment.

    Args:
        principal: Initial investment amount
        rate: Annual interest rate (e.g., 0.05 for 5%)
        years: Number of years

    Returns:
        Calculation results as formatted string
    """
    final_amount = principal * (1 + rate) ** years
    return f"Final: ${final_amount:,.2f} (Interest: ${final_amount - principal:,.2f})"

# Agent avec outils
agent = CodeAgent(
    tools=[calculate_compound_interest],
    model=model
)

agent.run("If I invest $10,000 at 7% for 20 years, how much will I have?")
```

### Multi-Agent avec ManagedAgent

```python
from smolagents import CodeAgent, ManagedAgent, WebSearchTool

model = InferenceClientModel()

# Agent spécialisé recherche
web_agent = CodeAgent(tools=[WebSearchTool()], model=model)
managed_web = ManagedAgent(
    agent=web_agent,
    name="researcher",
    description="Searches the web. Give it a research query."
)

# Agent spécialisé analyse
analysis_agent = CodeAgent(tools=[calculate_compound_interest], model=model)
managed_analysis = ManagedAgent(
    agent=analysis_agent,
    name="analyst",
    description="Analyzes data and performs calculations."
)

# Manager orchestrateur
manager = CodeAgent(
    tools=[],
    model=model,
    managed_agents=[managed_web, managed_analysis],
    additional_authorized_imports=["pandas", "numpy"]
)

# Tâche complexe multi-agents
result = manager.run(
    "Research AI trends, then calculate 8% growth on $50,000 over 15 years"
)
```

### Planning Interval

```python
# Agent avec planification périodique
agent = CodeAgent(
    tools=[WebSearchTool()],
    model=model,
    planning_interval=3  # Révise le plan tous les 3 steps
)

# Utile pour tâches complexes nécessitant adaptation
result = agent.run("Research and compare top 5 AI frameworks in 2025")
```

### Comparaison avec Autres Frameworks

| Aspect | Smolagents | Phidata | LangGraph |
|--------|------------|---------|-----------|
| **Taille** | <100KB | Medium | Large |
| **Paradigme** | Code-as-action | Tool-calling | Graph-based |
| **Output** | Python exécutable | JSON | States |
| **Courbe** | Très basse | Basse | Haute |
| **Use Case** | Edge, prototyping | Production | Workflows |

### Quand Utiliser Smolagents

**Idéal pour:**
- Edge deployment (footprint minimal)
- Rapid prototyping
- Environnements resource-constrained
- Besoin d'exécution de code, pas juste tool-calling
- Intégration HuggingFace Hub (partage/réutilisation tools)

**Éviter si:**
- Outputs JSON structurés requis (utiliser Agno TypeSafe)
- Workflows complexes avec cycles (utiliser LangGraph)
- Features entreprise (utiliser Phidata)
- Role-playing multi-agents (utiliser CrewAI)

---

## Templates ULTRA-CREATE Associés

| Template | Pattern | Framework |
|----------|---------|-----------|
| `mixture-of-agents` | Mixture of Agents | Phidata |
| `ai-self-evolving` | Self-Healing | Custom |
| `multi-agent-researcher` | Multi-Agent Teams | CrewAI |
| `ai-reasoning-agent` | Chain-of-Thought | Phidata |
| `rag-agentic-reasoning` | Agentic RAG | Phidata |
| `memory-stateful-chat` | Stateful Sessions | Phidata |
| `memory-local-chatgpt` | Local Memory | Ollama + LanceDB |
| `ai-typesafe-agent` | TypeSafe I/O | Agno 2.0 |
| `ai-langgraph-supervisor` | Supervisor-Worker | LangGraph |
| `rag-vision-advanced` | Vision RAG | Cohere + Gemini |

---

## Ressources

### Documentation Officielle
- [Phidata Docs](https://docs.phidata.com)
- [LangGraph](https://langchain-ai.github.io/langgraph/)
- [CrewAI](https://docs.crewai.com)
- [AutoGen](https://microsoft.github.io/autogen/)

### Repositories
- [awesome-llm-apps](https://github.com/Shubhamsaboo/awesome-llm-apps)
- [OpenAI Swarm](https://github.com/openai/swarm)
- [Phidata](https://github.com/phidatahq/phidata)

### Enterprise Agent Platforms
- [Beam AI](https://beam.ai) - 200+ production-ready enterprise templates
- [Beam AI Templates](https://beam.ai/agentic-insights/5-ready-to-use-ai-agent-templates)
- [Autonoly](https://autonoly.com) - No-code AI agent builder
- [Autonoly Templates](https://autonoly.com/templates)

### Articles
- [Building AI Agents](https://www.anthropic.com/research/building-effective-agents)
- [Agent Architectures](https://blog.langchain.dev/langgraph-multi-agent-workflows/)
- [Enterprise AI Agents](https://beam.ai/blog)

---

*Guide créé pour ULTRA-CREATE v27.1 | Janvier 2026 - Enrichi avec Beam AI (200+ templates) et Autonoly*
