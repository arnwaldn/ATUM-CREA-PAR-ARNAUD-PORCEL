# Vision RAG Advanced

**Multimodal Document Retrieval with Persistent Storage**

## Overview

Vision RAG Advanced uses pure vision-based retrieval to search and answer questions about PDF documents. Unlike traditional RAG that relies on text extraction, this approach:

- **Embeds pages as images** using Cohere Embed v4 multimodal model
- **Persists embeddings** in ChromaDB for fast retrieval across sessions
- **Reranks results** using Cohere Rerank for improved accuracy
- **Answers questions** using Gemini Flash vision capabilities

## Features

- **Multimodal Embeddings**: Cohere Embed v4 understands both text and visual elements
- **Persistent Storage**: ChromaDB stores embeddings for instant retrieval
- **Reranking**: Cohere Rerank v3.5 improves result quality
- **Multi-PDF Support**: Process multiple documents in batch
- **Vision-based QA**: Gemini Flash analyzes images directly

## Stack

| Component | Technology |
|-----------|------------|
| Embeddings | Cohere Embed v4 |
| Reranking | Cohere Rerank v3.5 |
| Vision LLM | Gemini 2.5 Flash |
| Vector DB | ChromaDB |
| PDF Processing | PyMuPDF |
| Frontend | Streamlit |

## Setup

1. **Install dependencies**:
```bash
pip install -r requirements.txt
```

2. **Set API keys**:
```bash
export COHERE_API_KEY="your-cohere-key"
export GOOGLE_API_KEY="your-google-key"
```

Or use Streamlit secrets (`.streamlit/secrets.toml`):
```toml
COHERE_API_KEY = "your-cohere-key"
GOOGLE_API_KEY = "your-google-key"
```

3. **Run the app**:
```bash
streamlit run vision_rag_advanced.py
```

## Usage

1. **Upload PDFs**: Drag and drop PDF files in the Upload tab
2. **Index Documents**: Click "Process & Index" to embed and store pages
3. **Search**: Ask questions in natural language
4. **Get Answers**: Receive vision-grounded answers with source citations

## Configuration

```python
@dataclass
class Config:
    EMBED_MODEL: str = "embed-v4.0"      # Cohere embedding model
    RERANK_MODEL: str = "rerank-v3.5"    # Cohere reranking model
    VISION_MODEL: str = "gemini-2.5-flash" # Gemini vision model
    IMAGE_MAX_SIZE: int = 1024           # Max image dimension
    BATCH_SIZE: int = 10                 # Embedding batch size
    TOP_K_RETRIEVAL: int = 10            # Initial retrieval count
    TOP_K_RERANK: int = 5                # Final reranked results
    CHROMA_PERSIST_DIR: str = "./chroma_vision_db"
```

## When to Use

Best for:
- Documents with complex visual layouts (infographics, charts, diagrams)
- Scanned documents where OCR quality is poor
- Technical documents with formulas and figures
- Multi-language documents

## Architecture

```
PDF Upload → Page Extraction → Image Resize → Cohere Embed v4
                                                    ↓
                                              ChromaDB Store
                                                    ↓
Query → Query Embedding → Vector Search → Cohere Rerank → Gemini Answer
```

## Credits

Based on patterns from [BuildFastWithAI/gen-ai-experiments](https://github.com/buildfastwithai/gen-ai-experiments)
