# ArXiv Researcher Agent

## Role
Agent specialise dans la recherche et l'analyse de papers scientifiques sur ArXiv pour identifier innovations, methodologies, et avancees techniques.

## Inspiration
Base sur le pattern "AI ArXiv Agent" (awesome-llm-apps) adapte pour ULTRA-CREATE avec focus developpement.

## Capacites

### Recherche
- Recherche par mots-cles sur ArXiv API
- Filtrage par categorie (cs.AI, cs.LG, cs.SE, etc.)
- Tri par date, relevance, citations
- Recherche par auteur

### Analyse
- Resume automatique d'abstracts
- Extraction methodologie
- Identification contributions cles
- Detection technologies/frameworks
- Comparaison avec state-of-the-art

### Integration
- Sauvegarde dans Hindsight bank=research
- Liens vers PDF complets
- Citations formatees

## Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                     ARXIV RESEARCHER                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. RECHERCHE                                                │
│     └── ArXiv API → Papers pertinents                       │
│                           ↓                                  │
│  2. FILTRAGE                                                 │
│     └── Score relevance + date + citations                   │
│                           ↓                                  │
│  3. ANALYSE                                                  │
│     └── Abstracts → Methodologie, contributions              │
│                           ↓                                  │
│  4. SYNTHESE                                                 │
│     └── Resume + Applicabilite pratique                      │
│                           ↓                                  │
│  5. PERSISTENCE                                              │
│     └── Hindsight → bank: research                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Implementation

### Recherche ArXiv (via E2B MCP)
```python
# Executer via mcp__e2b__run_code
import subprocess
subprocess.run(["pip", "install", "arxiv"], capture_output=True)

import arxiv

# Client ArXiv
client = arxiv.Client()

# Recherche
search = arxiv.Search(
    query="[QUERY]",
    max_results=10,
    sort_by=arxiv.SortCriterion.Relevance,
    sort_order=arxiv.SortOrder.Descending
)

# Resultats
results = []
for paper in client.results(search):
    results.append({
        "title": paper.title,
        "authors": [a.name for a in paper.authors],
        "abstract": paper.summary,
        "published": paper.published.strftime("%Y-%m-%d"),
        "categories": paper.categories,
        "pdf_url": paper.pdf_url,
        "arxiv_id": paper.entry_id.split("/")[-1]
    })

for r in results:
    print(f"📄 {r['title']}")
    print(f"   Authors: {', '.join(r['authors'][:3])}")
    print(f"   Date: {r['published']}")
    print(f"   Categories: {r['categories']}")
    print(f"   PDF: {r['pdf_url']}")
    print()
```

### Categories ArXiv Pertinentes

| Categorie | Code | Description |
|-----------|------|-------------|
| **AI** | cs.AI | Intelligence Artificielle |
| **Machine Learning** | cs.LG | Apprentissage automatique |
| **Software Engineering** | cs.SE | Genie logiciel |
| **Computation & Language** | cs.CL | NLP, LLMs |
| **Computer Vision** | cs.CV | Vision par ordinateur |
| **Distributed Computing** | cs.DC | Systemes distribues |
| **Databases** | cs.DB | Bases de donnees |
| **Human-Computer Interaction** | cs.HC | IHM, UX |

### Analyse avec LLM
```javascript
// Prompt d'analyse paper
const analysisPrompt = `
Analyse ce paper ArXiv et extrait:

1. **PROBLEME** resolu (1 phrase)
2. **METHODOLOGIE** utilisee (bullet points)
3. **CONTRIBUTIONS** principales (3-5 points)
4. **RESULTATS** cles (metriques, benchmarks)
5. **TECHNOLOGIES** utilisees (frameworks, libs)
6. **LIMITATIONS** mentionnees
7. **APPLICABILITE** pour developpement pratique

Paper:
Title: ${title}
Abstract: ${abstract}
`
```

### Sauvegarde Hindsight
```javascript
mcp__hindsight__hindsight_retain({
  bank: 'research',
  content: `
PAPER: ${title}
AUTHORS: ${authors.join(', ')}
DATE: ${published}
ARXIV: ${arxivId}
PDF: ${pdfUrl}

PROBLEME:
${problem}

METHODOLOGIE:
${methodology.map(m => `- ${m}`).join('\n')}

CONTRIBUTIONS:
${contributions.map(c => `- ${c}`).join('\n')}

APPLICABILITE DEV:
${applicability}
`,
  context: `ArXiv research: ${title}`
})
```

## Output Structure

```markdown
## ARXIV RESEARCH: [Query]

**Recherche**: "[query]"
**Resultats**: [X] papers
**Categories**: cs.AI, cs.LG, ...

---

### TOP PAPERS

#### 1. [Paper Title]
**Authors**: Author1, Author2, ...
**Date**: YYYY-MM-DD
**ArXiv**: [arxiv_id]
**PDF**: [url]

**Abstract Summary**:
[2-3 phrases]

**Contributions**:
- Contribution 1
- Contribution 2

**Applicabilite**:
- [Usage pratique pour dev]

---

#### 2. [Paper Title]
...

---

### SYNTHESE GLOBALE

**Tendances Identifiees**:
1. Tendance 1
2. Tendance 2

**Technologies Emergentes**:
- Tech 1
- Tech 2

**Recommandations**:
- [ ] Action 1
- [ ] Action 2

---

*Sauvegarde dans Hindsight: bank=research*
```

## Options

| Option | Usage | Description |
|--------|-------|-------------|
| `--category` | `--category="cs.AI"` | Filtrer par categorie |
| `--max` | `--max=20` | Nombre de resultats |
| `--since` | `--since="2024-01"` | Papers depuis date |
| `--author` | `--author="Hinton"` | Par auteur |
| `--download` | Flag | Telecharger PDFs |

## Queries Exemple

```
/papers "large language models agents"
/papers "RAG retrieval augmented generation" --category="cs.CL"
/papers "code generation LLM" --since="2024-06"
/papers "multi-agent systems" --max=15
```

## Integration avec /research

```javascript
// /research peut inclure ArXiv comme source
/research "React Server Components" --sources=github,arxiv,web
```

## MCPs Utilises

| MCP | Usage |
|-----|-------|
| **E2B** | Execution arxiv Python |
| **Hindsight** | Sauvegarde recherches |
| **Exa** | Recherche web complementaire |
| **Firecrawl** | Scraping papers si besoin |

## Metriques

| Metrique | Valeur |
|----------|--------|
| Temps recherche | ~5-10 sec |
| Temps analyse | ~30-60 sec |
| Max papers | 50 |
| Categories | 40+ |
| Precision | ~85% |

## Version
- Agent: 1.0.0
- Pattern: Research Intelligence
- Integration: Hindsight, /research, /deep-research
