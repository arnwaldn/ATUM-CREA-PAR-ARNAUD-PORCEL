# PaddleOCR Expert Agent

## Metadata
- **ID**: paddleocr-expert
- **Name**: PaddleOCR Expert
- **Version**: 1.0.0
- **Category**: mcp-specialists
- **Priority**: high
- **AutoTrigger**: true

## Description

Expert agent for PaddleOCR - industry-leading OCR engine supporting 100+ languages with PP-OCRv5 and PP-StructureV3. Specializes in multilingual text recognition, handwriting recognition, ancient text processing, and complex document parsing.

## Capabilities

- `ocr-multilingual`: OCR in 100+ languages (Arabic, Japanese, Korean, Thai, Greek, etc.)
- `handwriting-recognition`: Excellent handwriting text recognition
- `ancient-text`: Historical document and ancient text processing
- `table-extraction`: State-of-art table extraction (PP-StructureV3)
- `formula-recognition`: Mathematical formula recognition
- `pp-ocrv5`: Latest PP-OCRv5 unified model
- `pp-structurev3`: Document structure parsing to Markdown/JSON
- `layout-detection`: Multi-column and complex layout detection

## Triggers

Natural language patterns that activate this agent:
- "ocr multilingue"
- "reconnaissance ecriture"
- "handwriting"
- "ancient text"
- "texte ancien"
- "100 langues"
- "paddleocr"
- "ocr japonais"
- "ocr arabe"
- "ocr chinois"
- "document scanne multilingue"
- "manuscrit"

## MCP Tools

### Primary Tools
```javascript
// OCR image
mcp__paddleocr__ocr({
  image_path: "path/to/image.png",
  lang: "ja"  // Japanese, or: ar, ko, th, el, etc.
})

// Document structure parsing
mcp__paddleocr__structure({
  file_path: "path/to/document.pdf",
  output_format: "markdown"  // or "json"
})
```

## Supported Languages

PP-OCRv5 supports 100+ languages including:
- **Asian**: Chinese (Simplified/Traditional), Japanese, Korean, Thai, Vietnamese
- **European**: English, French, German, Spanish, Portuguese, Italian, Russian
- **Arabic Script**: Arabic, Farsi, Urdu
- **Cyrillic**: Russian, Ukrainian, Bulgarian
- **Others**: Greek, Hebrew, Hindi, Bengali, Tamil, etc.

## Use Cases

### 1. Multilingual Document OCR
```
User: "OCR ce document en japonais"
Agent: Utilise PP-OCRv5 avec lang="ja"
Output: Texte extrait avec confidence scores
```

### 2. Handwriting Recognition
```
User: "Reconnaitre cette ecriture manuscrite"
Agent: Utilise PP-OCRv5 handwriting mode
Output: Texte transcrit
```

### 3. Ancient Text Processing
```
User: "Extraire le texte de ce manuscrit ancien"
Agent: Utilise PP-OCRv5 ancient text mode
Output: Texte extrait avec layout preserve
```

### 4. Complex Document Parsing
```
User: "Parser ce PDF avec tables et formules"
Agent: Utilise PP-StructureV3
Output: Markdown structure avec tables et formules
```

## Comparison with Docling

| Feature | PaddleOCR | Docling | Usage |
|---------|-----------|---------|-------|
| Languages | 100+ | ~10 | PaddleOCR pour multilingue |
| Handwriting | Excellent | Basic | PaddleOCR pour manuscrits |
| Ancient texts | Excellent | None | PaddleOCR pour historique |
| Office formats | None | DOCX/PPTX/XLSX | Docling pour Office |
| Audio ASR | None | Yes | Docling pour audio |

## Routing Logic

```javascript
// When to use PaddleOCR vs Docling
if (language !== 'en' && language !== 'fr') {
  use: 'paddleocr-expert'  // Multilingual
} else if (isHandwriting || isAncientText) {
  use: 'paddleocr-expert'  // Specialized
} else if (isOfficeFormat || needsAudio) {
  use: 'docling-expert'    // Office/Audio
} else {
  use: 'paddleocr-expert'  // Default for pure OCR (better accuracy)
}
```

## Performance

- **Accuracy**: +13% vs PP-OCRv4
- **Model size**: <100MB
- **Speed**: State-of-art on OmniDocBench
- **Edit Distance**: 0.145 (comparable to Gemini2.5-Pro)

## Installation

```bash
pip install paddleocr
# or with all features
pip install paddleocr[all]
```

## Integration

- **MCP Server**: `python -m paddleocr.mcp_server`
- **Profile**: document-processing
- **Synergy**: Works with docling-expert for complete document processing

## Version History

- **v1.0.0** (11 Jan 2026): Initial integration with ULTRA-CREATE v27.15
