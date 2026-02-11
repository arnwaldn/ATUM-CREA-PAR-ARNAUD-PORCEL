# AI Agent Workflow

## Objectif
Creer un agent IA autonome capable d'executer des taches complexes avec outils, memoire et raisonnement.

## Temps Realiste
- Agent simple (single tool) : 15-25 min
- Agent multi-tools avec RAG : 30-50 min
- Equipe multi-agents : 40-60 min

## Stack

```
Language    : Python 3.12+
Framework   : LangGraph / Phidata / CrewAI
LLM         : Claude API / OpenAI API / Ollama (local)
Vector DB   : Supabase pgvector / Pinecone / ChromaDB
Orchestrator: LangGraph (graphe d'etats)
API         : FastAPI / Hono
Deploy      : Railway / Modal / AWS Lambda
```

---

## Phase 1 : Research & Design (3 min)

### MCPs Utilises
- Context7 : doc LangGraph / Phidata a jour
- Memory MCP : patterns d'agents precedents

### Actions
1. Context7 : verifier API du framework agent
2. Definir le role et les capacites de l'agent :
   - Quel probleme resout-il ?
   - Quels outils a-t-il besoin ?
   - Quelle memoire (court/long terme) ?
   - Quel schema de raisonnement (ReAct, Plan-and-Execute, Tree of Thoughts) ?
3. Creer le projet Python :
   ```bash
   mkdir mon-agent && cd mon-agent
   python -m venv .venv
   source .venv/bin/activate  # ou .venv\Scripts\activate sur Windows
   pip install langchain langgraph langchain-anthropic python-dotenv
   ```
4. Configurer `.env` avec les cles API

### Output
- Architecture de l'agent definie
- Projet Python initialise

---

## Phase 2 : Tools & Knowledge (5-10 min)

### Actions
1. **Definir les outils** :
   ```python
   from langchain_core.tools import tool
   
   @tool
   def search_web(query: str) -> str:
       """Recherche sur le web."""
       # Implementation avec Tavily/Exa/SerpAPI
       pass
   
   @tool
   def query_database(sql: str) -> str:
       """Execute une requete SQL."""
       pass
   ```

2. **Categories d'outils courants** :
   - Recherche : web search, doc search
   - Donnees : SQL, API externes, scraping
   - Code : execution Python, shell commands
   - Communication : email, Slack, notifications
   - Fichiers : lecture, ecriture, parsing PDF/CSV

3. **Base de connaissances (RAG)** (si necessaire) :
   ```python
   from langchain_community.vectorstores import SupabaseVectorStore
   from langchain_community.embeddings import OpenAIEmbeddings
   
   vectorstore = SupabaseVectorStore(
       embedding=OpenAIEmbeddings(),
       client=supabase_client,
       table_name="documents",
       query_name="match_documents"
   )
   retriever = vectorstore.as_retriever(search_kwargs={"k": 5})
   ```

4. **Memoire** :
   - Court terme : `ConversationBufferMemory` / state dict
   - Long terme : Vector DB + summarization
   - Checkpointing : `MemorySaver` / `SqliteSaver`

### Output
- Outils implementes et testes individuellement
- Base de connaissances indexee (si RAG)

---

## Phase 3 : Agent Logic (10-20 min)

### Actions

#### Option A : LangGraph (recommande pour agents complexes)
```python
from langgraph.graph import StateGraph, MessagesState, START, END
from langgraph.prebuilt import ToolNode
from langchain_anthropic import ChatAnthropic

model = ChatAnthropic(model="claude-sonnet-4-20250514")
model_with_tools = model.bind_tools(tools)

def call_model(state: MessagesState):
    response = model_with_tools.invoke(state["messages"])
    return {"messages": [response]}

def should_continue(state: MessagesState):
    last = state["messages"][-1]
    return "tools" if last.tool_calls else END

graph = StateGraph(MessagesState)
graph.add_node("agent", call_model)
graph.add_node("tools", ToolNode(tools))
graph.add_edge(START, "agent")
graph.add_conditional_edges("agent", should_continue)
graph.add_edge("tools", "agent")

app = graph.compile(checkpointer=MemorySaver())
```

#### Option B : Phidata (recommande pour agents simples)
```python
from phi.agent import Agent
from phi.model.anthropic import Claude
from phi.tools.web import WebSearch

agent = Agent(
    model=Claude(id="claude-sonnet-4-20250514"),
    tools=[WebSearch()],
    instructions=["Toujours citer tes sources"],
    show_tool_calls=True,
    markdown=True,
)
```

#### Multi-agents (si necessaire)
```python
# Agent superviseur qui delegue aux sous-agents
researcher = Agent(name="Researcher", tools=[search_tool])
analyst = Agent(name="Analyst", tools=[data_tool])
writer = Agent(name="Writer", tools=[])

# Orchestration via LangGraph
supervisor_graph = create_supervisor_graph([researcher, analyst, writer])
```

### Output
- Agent fonctionnel avec boucle ReAct
- Tests manuels avec quelques prompts

---

## Phase 4 : API & Interface (5-10 min)

### Actions
1. **API FastAPI** :
   ```python
   from fastapi import FastAPI
   from pydantic import BaseModel
   
   app = FastAPI()
   
   class ChatRequest(BaseModel):
       message: str
       thread_id: str = "default"
   
   @app.post("/chat")
   async def chat(req: ChatRequest):
       config = {"configurable": {"thread_id": req.thread_id}}
       result = agent.invoke({"messages": [("user", req.message)]}, config)
       return {"response": result["messages"][-1].content}
   ```

2. **Interface** (optionnel) :
   - Chatbot web simple (React/Next.js)
   - CLI interactif
   - Integration Slack/Discord

3. **Streaming** (recommande) :
   ```python
   @app.post("/chat/stream")
   async def chat_stream(req: ChatRequest):
       async def generate():
           async for event in agent.astream_events(...):
               yield f"data: {json.dumps(event)}\n\n"
       return StreamingResponse(generate(), media_type="text/event-stream")
   ```

### Output
- API deployable avec endpoint /chat

---

## Phase 5 : Test & Deploy (3-5 min)

### Actions
1. **Tests** :
   - Test unitaire des outils
   - Test d'integration de l'agent (prompts de reference)
   - Test des edge cases (outil qui echoue, timeout, boucle infinie)

2. **Guardrails** :
   - Max iterations (eviter boucles infinies)
   - Token budget par requete
   - Output validation
   - Rate limiting

3. **Deploy** :
   ```bash
   # Railway
   railway up
   
   # Docker
   docker build -t mon-agent .
   docker run -p 8000:8000 mon-agent
   ```

4. **Monitoring** :
   - LangSmith / Langfuse pour tracing
   - Sentry pour erreurs
   - Logs structures

### Output
- Agent deploye et monitore

---

## Structure Finale

```
src/
├── agent.py                 # Agent principal (graph definition)
├── tools/
│   ├── __init__.py
│   ├── search.py            # Web search tool
│   ├── database.py          # SQL/data tools
│   └── code.py              # Code execution tool
├── knowledge/
│   ├── loader.py            # Document ingestion
│   ├── retriever.py         # Vector search
│   └── documents/           # Source documents
├── memory/
│   ├── checkpointer.py      # State persistence
│   └── summarizer.py        # Long-term memory
├── api/
│   ├── main.py              # FastAPI app
│   ├── routes.py            # API routes
│   └── schemas.py           # Pydantic models
├── config.py                # Settings + env vars
├── .env                     # API keys (gitignored)
├── requirements.txt
├── Dockerfile
└── tests/
    ├── test_tools.py
    ├── test_agent.py
    └── test_api.py
```

---

## Checklist
- [ ] Agent repond correctement aux prompts de base
- [ ] Outils fonctionnent individuellement
- [ ] Memoire persiste entre les requetes
- [ ] Max iterations configure (pas de boucle infinie)
- [ ] API accessible et streaming fonctionne
- [ ] Erreurs d'outils gerees gracieusement
- [ ] .env non commite (dans .gitignore)

---

**Workflow:** AI Agent | **Temps:** 15-60 min | **Stack:** Python + LangGraph/Phidata + Claude API
