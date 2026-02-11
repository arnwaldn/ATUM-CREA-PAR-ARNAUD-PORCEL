# Docling - Document Parsing Patterns pour ATUM CREA

> Ce fichier contient les patterns d'utilisation de Docling pour le parsing de documents.
> Charge automatiquement via knowledge-auto-load.js sur keywords: "docling", "pdf parsing", "document extraction", "ocr"

---

## Overview Docling

| Aspect | Detail |
|--------|--------|
| **Origine** | IBM Research Zurich |
| **License** | MIT |
| **Foundation** | LF AI & Data Foundation |
| **Paper** | ArXiv 2408.09869 |
| **MCP** | `docling-mcp-server` via uvx |

---

## Formats Supportes

### Documents
| Format | Extension | Capabilities |
|--------|-----------|--------------|
| **PDF** | .pdf | Layout, tables, formulas, code, images, OCR |
| **Word** | .docx | Structure, styles, tables |
| **PowerPoint** | .pptx | Slides, layout, images |
| **Excel** | .xlsx, .xls | Sheets, tables, formulas |
| **HTML** | .html | Structure, content |
| **Markdown** | .md | Direct support |

### Images
| Format | Extension | Capabilities |
|--------|-----------|--------------|
| **PNG** | .png | OCR, layout detection |
| **TIFF** | .tiff, .tif | Multi-page, OCR |
| **JPEG** | .jpg, .jpeg | OCR, image analysis |

### Audio (ASR)
| Format | Extension | Capabilities |
|--------|-----------|--------------|
| **WAV** | .wav | Transcription complete |
| **MP3** | .mp3 | Transcription avec conversion |
| **WebVTT** | .vtt | Sous-titres natifs |

---

## Capabilities Avancees PDF

### Layout Detection
```
┌────────────────────────────────────────┐
│  HEADER                                │
├─────────────────┬──────────────────────┤
│  COLUMN 1       │  COLUMN 2            │
│  Text block     │  Text block          │
│                 │                      │
│  ┌───────────┐  │  ┌────────────────┐  │
│  │  TABLE    │  │  │  IMAGE         │  │
│  │  ...      │  │  │  [classified]  │  │
│  └───────────┘  │  └────────────────┘  │
├─────────────────┴──────────────────────┤
│  FOOTER                                │
└────────────────────────────────────────┘
```

### Extraction Structure
- **Ordre de lecture** : Intelligent, multi-colonnes
- **Tables** : Structure preservee (rows, cols, headers)
- **Formules** : LaTeX output
- **Code blocks** : Detection et extraction
- **Images** : Classification (figure, diagram, photo)

---

## Integration MCP

### Configuration (settings.json)
```json
{
  "docling": {
    "command": "uvx",
    "args": ["--from=docling-mcp", "docling-mcp-server"]
  }
}
```

### Outils MCP Disponibles
| Tool | Description |
|------|-------------|
| `docling_convert` | Convertir document vers Markdown/JSON |
| `docling_extract_tables` | Extraire tables structurees |
| `docling_extract_images` | Extraire images avec metadata |
| `docling_ocr` | OCR pour documents scannes |

---

## Patterns d'Utilisation

### Pattern 1: Analyse PDF Complexe
```
AVANT (Desktop Commander read_file):
- Texte brut uniquement
- Perte structure tables
- Formules illisibles
- Ordre de lecture incorrect

APRES (Docling):
- Structure Markdown preservee
- Tables en format | col | col |
- Formules en LaTeX
- Ordre de lecture correct
```

### Pattern 2: Extraction Tables
```javascript
// Utiliser Docling pour extraire tables
docling_extract_tables({
  file_path: "/path/to/document.pdf",
  output_format: "markdown"  // ou "json" pour structure
})
// -> Retourne tables structurees
```

### Pattern 3: OCR Documents Scannes
```javascript
// Pour PDFs scannes (images)
docling_convert({
  file_path: "/path/to/scanned.pdf",
  enable_ocr: true,
  languages: ["fr", "en"]
})
```

### Pattern 4: Batch Processing
```javascript
// Traiter plusieurs documents
const files = ["doc1.pdf", "doc2.docx", "slides.pptx"];
for (const file of files) {
  const result = await docling_convert({
    file_path: file,
    output_format: "markdown"
  });
  // Sauvegarder dans Hindsight
  hindsight_retain({
    bank: 'documents',
    content: result.content,
    context: `Parsed: ${file}`
  });
}
```

---

## Integration ATUM CREA

### Ameliorations Commandes

| Commande | Avant | Apres (avec Docling) |
|----------|-------|----------------------|
| `/learn-pdf` | Texte brut basique | Structure complete, tables, formules |
| `/papers` | ArXiv texte simple | LaTeX formules preservees |
| `/deep-research` | Parsing basique | Extraction complete multi-format |

### Workflow Document Analysis
```
Document (PDF/DOCX/PPTX/XLSX)
        │
        ▼
┌─────────────────────────────────┐
│ DOCLING MCP                     │
│ ├─ Layout detection             │
│ ├─ Table extraction             │
│ ├─ Formula recognition          │
│ └─ Image classification         │
└─────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────┐
│ OUTPUT (Markdown/JSON)          │
│ Structure preservee             │
└─────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────┐
│ HINDSIGHT                       │
│ bank: 'documents'               │
│ Stockage vectoriel              │
└─────────────────────────────────┘
```

---

## Comparaison Outils

| Outil | PDF Tables | Formulas | OCR | Multi-format | Local |
|-------|------------|----------|-----|--------------|-------|
| **Docling** | ✅ Excellent | ✅ LaTeX | ✅ | ✅ 8+ formats | ✅ |
| Desktop Commander | ❌ Perdue | ❌ | ❌ | ❌ PDF seul | ✅ |
| Firecrawl | N/A (web) | N/A | N/A | N/A | ❌ |

---

## Visual Language Models (VLM)

### GraniteDocling
Docling supporte les Visual Language Models pour:
- Analyse visuelle de documents complexes
- Comprehension layout avancee
- Classification images contextuelle

```javascript
docling_convert({
  file_path: "/path/to/complex.pdf",
  use_vlm: true,
  vlm_model: "granite-docling"  // ou autre VLM
})
```

---

## Integrations Framework

### LangChain
```python
from docling.document_converter import DocumentConverter
from langchain.document_loaders import DoclingLoader

loader = DoclingLoader(file_path="document.pdf")
docs = loader.load()
# -> Documents LangChain avec metadata
```

### LlamaIndex
```python
from llama_index.readers.docling import DoclingReader

reader = DoclingReader()
documents = reader.load_data(file_path="document.pdf")
```

### CrewAI
Compatible avec les templates ATUM CREA:
- `ai-deep-research`
- `multi-agent-researcher`
- `team-*` (tous les teams)

---

## Audio Transcription (ASR)

### Utilisation
```javascript
docling_convert({
  file_path: "/path/to/audio.wav",
  output_format: "markdown"
})
// -> Transcription complete en Markdown
```

### Formats Audio
- WAV (natif)
- MP3 (avec conversion)
- VTT (sous-titres WebVTT)

---

## Best Practices

### 1. Choisir le bon format output
| Use Case | Format Recommande |
|----------|-------------------|
| LLM processing | Markdown |
| Data extraction | JSON |
| Archive | DocTags (lossless) |

### 2. OCR optimal
- Specifier les langues attendues
- Utiliser resolution >= 300 DPI
- Pre-processing si qualite basse

### 3. Batch efficace
- Grouper documents similaires
- Utiliser async si disponible
- Sauvegarder incrementalement dans Hindsight

### 4. Integration Hindsight
```javascript
// Pattern recommande
const parsed = await docling_convert({file_path: doc});
await hindsight_retain({
  bank: 'documents',
  content: `# ${doc}\n\n${parsed.content}`,
  context: `Type: ${parsed.format}, Pages: ${parsed.pages}`
});
```

---

## Troubleshooting

### Erreur: "uvx not found"
```bash
pip install uv
# ou
pipx install uv
```

### Erreur: "docling-mcp not found"
```bash
uvx --from=docling-mcp docling-mcp-server
# Premiere execution installe automatiquement
```

### PDF scanne non reconnu
- Activer OCR explicitement
- Verifier resolution image
- Specifier langues

---

*Reference: https://docling-project.github.io/docling/*
*MCP: https://docling-project.github.io/docling/usage/mcp/*
