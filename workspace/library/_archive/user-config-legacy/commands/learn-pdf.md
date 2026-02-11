---
description: Analyser PDF et sauvegarder dans Hindsight (user)
---

# /learn-pdf - Document Intelligence

## USAGE
```
/learn-pdf "C:\docs\architecture.pdf"
/learn-pdf "C:\docs\api-spec.pdf" --focus="endpoints"
```

## WORKFLOW

### 1. Validation fichier
```javascript
// Verifier que le fichier existe
Read(args.path)
```

### 2. Extraction contenu (E2B Python)
```python
import fitz  # PyMuPDF
doc = fitz.open(path)
content = ""
for page in doc:
    content += page.get_text()
    # Extraire aussi les tables
    tables = page.find_tables()
    for table in tables:
        content += table.to_markdown()
```

### 3. Analyse structuree
- Identifier sections principales
- Extraire figures/diagrammes references
- Resumer points cles
- Si --focus specifie, concentrer sur ce sujet

### 4. Sauvegarde Hindsight
```javascript
mcp__hindsight__hindsight_retain({
  bank: 'documents',
  content: `
## Document: ${filename}
### Resume
${summary}
### Sections Cles
${sections}
### Points Importants
${keyPoints}
### Applicabilite
${howToUse}
`,
  context: `PDF Analysis - ${filename}`
})
```

### 5. Output
Afficher:
- Resume executif (3-5 lignes)
- Sections identifiees
- Points cles extraits
- Confirmation sauvegarde Hindsight

## OPTIONS
| Option | Description |
|--------|-------------|
| --focus="X" | Concentrer analyse sur sujet X |
| --pages="1-10" | Analyser pages specifiques |
| --tables | Extraire uniquement les tableaux |

## MCP UTILISES
- E2B (execution Python PyMuPDF)
- Hindsight (sauvegarde bank=documents)
