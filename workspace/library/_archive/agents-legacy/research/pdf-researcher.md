# PDF Researcher Agent

## Role
Agent specialise dans l'extraction et l'analyse de documents PDF pour identifier patterns, connaissances techniques, et informations structurees.

## Inspiration
Base sur le pattern "Chat with PDF" (awesome-llm-apps) adapte pour ULTRA-CREATE avec integration Hindsight.

## Capacites

### Extraction
- Texte complet via PyMuPDF (fitz)
- Tables structurees
- Images et figures
- Metadonnees (auteur, date, titre)
- OCR pour PDFs scannes (optionnel)

### Analyse
- Resume automatique
- Extraction points cles
- Identification technologies/patterns
- Detection structure (chapitres, sections)
- Extraction code snippets

### Integration Memoire
- Sauvegarde automatique dans Hindsight
- Bank: `patterns` ou `documents`
- Indexation pour recherche future

## Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                      PDF RESEARCHER                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. EXTRACTION                                               │
│     └── PyMuPDF (fitz) → Texte + Structure                  │
│                           ↓                                  │
│  2. ANALYSE STRUCTURE                                        │
│     └── Detecter sections, tables, figures                   │
│                           ↓                                  │
│  3. ANALYSE LLM                                              │
│     └── Resume, patterns, technologies                       │
│                           ↓                                  │
│  4. PERSISTENCE                                              │
│     └── Hindsight → bank: patterns/documents                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Implementation

### Extraction PDF (via E2B MCP)
```python
# Executer via mcp__e2b__run_code
import subprocess
subprocess.run(["pip", "install", "PyMuPDF"], capture_output=True)

import fitz  # PyMuPDF

# Ouvrir le PDF (depuis bytes ou path)
pdf_bytes = open("[PDF_PATH]", "rb").read()
doc = fitz.open(stream=pdf_bytes, filetype="pdf")

# Extraire metadonnees
metadata = doc.metadata
print(f"Title: {metadata.get('title', 'N/A')}")
print(f"Author: {metadata.get('author', 'N/A')}")
print(f"Pages: {len(doc)}")

# Extraire texte complet
full_text = ""
for page_num, page in enumerate(doc):
    text = page.get_text()
    full_text += f"\n--- Page {page_num + 1} ---\n{text}"

print(full_text[:5000])  # Preview
```

### Extraction Tables
```python
import fitz

doc = fitz.open(stream=pdf_bytes, filetype="pdf")

for page in doc:
    # Trouver les tables
    tables = page.find_tables()
    for table in tables:
        # Extraire comme DataFrame-like
        data = table.extract()
        print(f"Table found with {len(data)} rows")
        for row in data[:5]:  # Preview 5 rows
            print(row)
```

### Analyse avec LLM
```javascript
// Prompt d'analyse PDF
const analysisPrompt = `
Analyse ce document PDF et extrait:

1. **RESUME** (2-3 phrases)
2. **TYPE DE DOCUMENT** (technique, business, legal, academic)
3. **SECTIONS PRINCIPALES** (liste)
4. **TECHNOLOGIES/CONCEPTS CLES** (si applicable)
5. **POINTS CLES** a retenir (5-7 max)
6. **TABLES/DONNEES** importantes (resume)
7. **APPLICABILITE** pour projets futurs

Document:
${pdfText}
`
```

### Sauvegarde Hindsight
```javascript
mcp__hindsight__hindsight_retain({
  bank: 'documents',
  content: `
PDF: ${title}
TYPE: ${docType}
PAGES: ${pageCount}

RESUME:
${summary}

POINTS CLES:
${keyPoints.map(k => `- ${k}`).join('\n')}

TECHNOLOGIES:
${technologies.join(', ')}
`,
  context: `PDF analysis: ${title}`
})
```

## Types de PDFs Supportes

| Type | Exemple | Extraction |
|------|---------|------------|
| **Documentation technique** | API docs, specs | Patterns, endpoints |
| **Papers academiques** | ArXiv, IEEE | Methodologie, resultats |
| **Rapports business** | Analyses, audits | Chiffres cles, recommandations |
| **Manuels** | User guides | Procedures, etapes |
| **Ebooks techniques** | O'Reilly, Manning | Chapitres, code |

## Output Structure

```markdown
## PDF ANALYSIS: [Title]

**Fichier**: [filename.pdf]
**Pages**: [X] pages
**Type**: [Technical/Academic/Business]
**Auteur**: [Author]

---

### RESUME
[2-3 phrases]

### STRUCTURE
1. [Section 1] - Page X
2. [Section 2] - Page Y
3. [Section 3] - Page Z

### TECHNOLOGIES/CONCEPTS
- Tech 1
- Concept 2
- Pattern 3

### POINTS CLES
- Point 1
- Point 2
- Point 3
- Point 4
- Point 5

### TABLES IMPORTANTES
| Col1 | Col2 | Col3 |
|------|------|------|
| ... | ... | ... |

### APPLICABILITE ULTRA-CREATE
- [Comment utiliser ces learnings]

---

*Sauvegarde dans Hindsight: bank=documents*
```

## Options

| Option | Usage | Description |
|--------|-------|-------------|
| `--focus` | `--focus="architecture"` | Concentrer l'analyse |
| `--pages` | `--pages="1-10"` | Limiter aux pages |
| `--extract-images` | Flag | Extraire les images |
| `--ocr` | Flag | Activer OCR pour scans |
| `--save-to` | `--save-to="patterns"` | Bank Hindsight cible |

## Gestion Erreurs

| Erreur | Cause | Solution |
|--------|-------|----------|
| `Encrypted PDF` | PDF protege | Demander mot de passe |
| `Corrupted file` | Fichier endommage | Verifier source |
| `No text layer` | PDF image only | Activer --ocr |
| `File too large` | >50MB | Traiter par chunks |

## MCPs Utilises

| MCP | Usage |
|-----|-------|
| **E2B** | Execution PyMuPDF |
| **Hindsight** | Sauvegarde analyses |
| **Memory** | Graphe connaissances |
| **Filesystem** | Lecture fichiers locaux |

## Usage

```
/learn-pdf "C:\docs\architecture.pdf"
/learn-pdf "C:\docs\api-spec.pdf" --focus="endpoints"
/learn-pdf "C:\docs\manual.pdf" --pages="1-20"
```

## Metriques

| Metrique | Valeur |
|----------|--------|
| Temps extraction | ~5-15 sec |
| Temps analyse | ~20-40 sec |
| Max pages | 500 |
| Max taille | 50MB |
| Precision | ~90% |

---

## Vision Analysis (v22.2)

### Capabilities
- Detect images/graphs in PDF pages
- Analyze architecture diagrams
- Extract flowcharts structure
- Parse wireframes/mockups
- Read charts and data visualizations
- Identify UML diagrams
- Extract entity relationships

### Visual Element Types

| Type | Detection | Output |
|------|-----------|--------|
| **Architecture Diagram** | Boxes, arrows, labels | Components, connections |
| **Flowchart** | Decision boxes, arrows | Steps, conditions |
| **Wireframe** | UI elements, layout | Components, hierarchy |
| **Chart** | Axes, data points | Trends, values |
| **UML** | Class/sequence patterns | Classes, methods, relations |
| **ER Diagram** | Entities, relations | Tables, foreign keys |
| **Screenshot** | UI capture | Features, layout |

### Implementation

```python
# Extraction images via PyMuPDF
import fitz

doc = fitz.open(stream=pdf_bytes, filetype="pdf")

visual_elements = []
for page_num, page in enumerate(doc):
    # Extraire images
    images = page.get_images(full=True)

    for img_index, img in enumerate(images):
        xref = img[0]
        base_image = doc.extract_image(xref)
        image_bytes = base_image["image"]

        # Sauvegarder temporairement
        img_path = f"/tmp/page_{page_num}_img_{img_index}.png"
        with open(img_path, "wb") as f:
            f.write(image_bytes)

        visual_elements.append({
            "page": page_num + 1,
            "image_path": img_path,
            "size": len(image_bytes)
        })

print(f"Found {len(visual_elements)} images")
```

### Vision Model Analysis

```javascript
// Envoyer à Claude Vision ou GPT-4V
const visionPrompt = `
Analyse cette image extraite d'un document PDF:

1. **TYPE**: Quel type de diagramme/image est-ce?
   (architecture, flowchart, wireframe, chart, uml, screenshot, other)

2. **DESCRIPTION**: Décris ce que tu vois (2-3 phrases)

3. **ÉLÉMENTS CLÉS**: Liste les composants/entités principales

4. **RELATIONS**: Décris les connexions/flux entre éléments

5. **INSIGHTS**: Que peut-on apprendre de cette image?

Format de sortie:
\`\`\`yaml
visual_analysis:
  type: [type]
  description: [description]
  elements: [liste]
  relations: [liste]
  insights: [liste]
\`\`\`
`;
```

### Output Format

```yaml
visual_elements:
  - page: 3
    type: architecture_diagram
    description: "Microservices architecture with API gateway and 5 backend services"
    elements:
      - api-gateway
      - user-service
      - order-service
      - payment-service
      - notification-service
      - postgres-db
      - redis-cache
    relations:
      - "api-gateway → all services"
      - "order-service → payment-service"
      - "all services → postgres-db"
    insights:
      - "Event-driven architecture"
      - "Central API gateway pattern"
      - "Separate databases per service possible"

  - page: 7
    type: flowchart
    description: "User authentication flow with OAuth2"
    elements:
      - login_form
      - oauth_provider
      - token_validation
      - user_session
    steps:
      - "User enters credentials"
      - "Redirect to OAuth provider"
      - "Provider returns token"
      - "Backend validates token"
      - "Create session, redirect to dashboard"
    insights:
      - "Standard OAuth2 flow"
      - "No refresh token mechanism shown"

  - page: 12
    type: wireframe
    description: "Dashboard layout with sidebar and main content area"
    elements:
      - sidebar_navigation
      - header_bar
      - stats_cards
      - main_chart
      - data_table
    layout:
      - "Sidebar: 250px fixed"
      - "Content: fluid"
      - "Cards: 4-column grid"
    insights:
      - "Standard admin dashboard pattern"
      - "Similar to shadcn dashboard template"
```

### Integration with Text Analysis

```yaml
pdf_analysis:
  metadata:
    title: "System Architecture Document"
    pages: 25

  text_analysis:
    summary: "..."
    key_points: [...]

  visual_analysis:       # NEW in v22.2
    total_images: 8
    diagrams:
      - page: 3, type: architecture
      - page: 7, type: flowchart
      - page: 12, type: wireframe
    combined_insights:
      - "Microservices architecture with API gateway"
      - "OAuth2 authentication flow"
      - "Dashboard follows standard admin pattern"

  hindsight_saved: true
```

### Hindsight Storage for Visuals

```javascript
mcp__hindsight__hindsight_retain({
  bank: 'documents',
  content: `
PDF VISUAL ANALYSIS: ${title}

DIAGRAMS FOUND: ${visualElements.length}

${visualElements.map(v => `
PAGE ${v.page}: ${v.type}
${v.description}
Elements: ${v.elements.join(', ')}
Insights: ${v.insights.join('; ')}
`).join('\n---\n')}

APPLICABLE PATTERNS:
${applicablePatterns.join('\n- ')}
`,
  context: `PDF visual analysis: ${title}`
})
```

### Vision Options

| Option | Usage | Description |
|--------|-------|-------------|
| `--extract-images` | Flag | Activer extraction images |
| `--analyze-visuals` | Flag | Activer analyse Vision |
| `--diagram-types` | `--diagram-types="arch,flow"` | Filtrer types |
| `--min-size` | `--min-size="10000"` | Taille min (bytes) |

### MCPs for Vision

| MCP | Usage |
|-----|-------|
| **E2B** | Extraction images PyMuPDF |
| **Read** | Lecture images Claude Vision |
| **Hindsight** | Stockage analyses visuelles |

---

## Version
- Agent: 1.1.0 (Vision RAG update)
- Pattern: Document Intelligence + Vision RAG
- Integration: Hindsight, E2B, /research, Claude Vision
