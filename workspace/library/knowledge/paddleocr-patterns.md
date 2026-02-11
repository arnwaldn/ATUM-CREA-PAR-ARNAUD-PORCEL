# PaddleOCR Patterns - ATUM CREA

> Guide d'utilisation de PaddleOCR pour OCR multilingue et traitement de documents

## Overview

PaddleOCR est un moteur OCR de niveau industriel supportant 100+ langues avec:
- **PP-OCRv5**: +13% accuracy, 5 types de texte unifies
- **PP-StructureV3**: State-of-art sur OmniDocBench (0.145 Edit Distance)
- **PP-ChatOCRv4**: Integration ERNIE 4.5 pour extraction intelligente

## Installation

```bash
# Installation basique
pip install paddleocr

# Installation complete (toutes features)
pip install paddleocr[all]

# Verification
python -c "from paddleocr import PaddleOCR; print('OK')"
```

## Usage Python

### OCR Basique
```python
from paddleocr import PaddleOCR

# Initialiser (telecharge modeles automatiquement)
ocr = PaddleOCR(use_angle_cls=True, lang='en')

# OCR sur image
result = ocr.ocr('image.png', cls=True)

# Afficher resultats
for line in result[0]:
    box, (text, confidence) = line
    print(f"{text} ({confidence:.2%})")
```

### OCR Multilingue
```python
# Japonais
ocr_ja = PaddleOCR(lang='japan')
result = ocr_ja.ocr('japanese_doc.png')

# Arabe
ocr_ar = PaddleOCR(lang='ar')
result = ocr_ar.ocr('arabic_doc.png')

# Chinois simplifie
ocr_ch = PaddleOCR(lang='ch')
result = ocr_ch.ocr('chinese_doc.png')

# Coreen
ocr_ko = PaddleOCR(lang='korean')
result = ocr_ko.ocr('korean_doc.png')
```

### Codes Langues
```yaml
# Asiatiques
ch: Chinois simplifie
cht: Chinois traditionnel
japan: Japonais
korean: Coreen
ta: Tamil
te: Telugu
ka: Kannada
hi: Hindi

# Europeennes
en: Anglais
french: Francais
german: Allemand
it: Italien
es: Espagnol
pt: Portugais
ru: Russe

# Arabes
ar: Arabe
fa: Farsi/Persan
ug: Ouighour

# Autres
latin: Latin generique (pour langues europeennes)
cyrillic: Cyrillique generique
devanagari: Devanagari generique
```

## PP-StructureV3 (Document Parsing)

### PDF vers Markdown
```python
from paddleocr import PPStructure

# Initialiser
structure = PPStructure(recovery=True, lang='en')

# Parser document
result = structure('document.pdf')

# Extraire Markdown
for page in result:
    for region in page:
        if region['type'] == 'table':
            print(region['res']['html'])
        elif region['type'] == 'text':
            print(region['res']['text'])
        elif region['type'] == 'formula':
            print(region['res']['latex'])
```

### Options Structure
```python
PPStructure(
    table=True,          # Extraction tables
    ocr=True,            # OCR pour texte
    recovery=True,       # Recuperation layout
    show_log=False,      # Logs silencieux
    lang='en',           # Langue
    layout_model='picodet',  # Modele layout
    table_model='tablemaster' # Modele tables
)
```

## MCP Server

### Configuration
```json
{
  "mcpServers": {
    "paddleocr": {
      "command": "python",
      "args": ["-m", "paddleocr.mcp_server"]
    }
  }
}
```

### Outils Disponibles
```javascript
// OCR simple
mcp__paddleocr__ocr({
  image_path: "path/to/image.png",
  lang: "en"
})

// Structure parsing
mcp__paddleocr__structure({
  file_path: "path/to/document.pdf",
  output_format: "markdown"
})
```

## Comparaison avec Docling

| Use Case | Outil Recommande |
|----------|------------------|
| OCR multilingue (100+ langues) | **PaddleOCR** |
| Handwriting recognition | **PaddleOCR** |
| Ancient texts / manuscrits | **PaddleOCR** |
| Documents scannes | **PaddleOCR** |
| Formats Office (DOCX/PPTX) | **Docling** |
| Audio transcription | **Docling** |
| VLM GraniteDocling | **Docling** |

## Patterns de Routing

### Decision Tree
```
Document a traiter
    |
    +-- Langue non-FR/EN? --> PaddleOCR
    |
    +-- Handwriting? --> PaddleOCR
    |
    +-- Ancient text? --> PaddleOCR
    |
    +-- Format Office? --> Docling
    |
    +-- Audio? --> Docling
    |
    +-- PDF/Image standard --> PaddleOCR (meilleure accuracy)
```

### Code Routing
```javascript
function selectOCRTool(document) {
  const { language, type, format } = document;

  // PaddleOCR pour multilingue
  if (!['en', 'fr'].includes(language)) {
    return 'paddleocr-expert';
  }

  // PaddleOCR pour handwriting/ancient
  if (type === 'handwriting' || type === 'ancient') {
    return 'paddleocr-expert';
  }

  // Docling pour Office/audio
  if (['docx', 'pptx', 'xlsx', 'wav', 'mp3'].includes(format)) {
    return 'docling-expert';
  }

  // PaddleOCR par defaut (meilleure accuracy)
  return 'paddleocr-expert';
}
```

## Performance Benchmarks

| Metrique | PP-OCRv5 | PP-StructureV3 |
|----------|----------|----------------|
| Accuracy | +13% vs v4 | State-of-art |
| Edit Distance | - | 0.145 |
| Model Size | <100MB | <100MB |
| Languages | 100+ | - |
| vs Gemini2.5 | Comparable | 1/1000 params |

## Troubleshooting

### Erreur: Module not found
```bash
pip install paddleocr[all]
```

### Erreur: CUDA not found
```python
# Utiliser CPU
ocr = PaddleOCR(use_gpu=False)
```

### Erreur: Model download failed
```python
# Specifier chemin local
ocr = PaddleOCR(det_model_dir='./models/det')
```

## Integration Hindsight

```javascript
// Sauvegarder resultats OCR dans Hindsight
hindsight_retain({
  bank: 'documents',
  content: `OCR Result: ${ocrText}
Source: ${imagePath}
Language: ${language}
Confidence: ${avgConfidence}%
Tool: PaddleOCR PP-OCRv5`
})
```

## Version

- **PaddleOCR**: 3.0+ (PP-OCRv5)
- **ATUM CREA**: (migrated from ULTRA-CREATE v27.15)
- **Integration Date**: 11 Jan 2026
