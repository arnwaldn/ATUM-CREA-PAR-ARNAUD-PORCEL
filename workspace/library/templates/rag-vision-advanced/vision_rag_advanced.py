"""
Vision RAG Advanced - Multimodal Retrieval with Persistence
ULTRA-CREATE v27.3 Template

Features:
- Cohere Embed v4 for multimodal embeddings (image + text)
- ChromaDB for persistent vector storage
- Cohere Rerank for improved retrieval
- Gemini Flash for vision-based QA
- Multi-PDF batch processing
- Session management

Stack: Cohere Embed v4, Gemini Flash, ChromaDB, Streamlit
"""

import streamlit as st
import cohere
import google.generativeai as genai
import chromadb
from chromadb.config import Settings
import fitz  # PyMuPDF
from PIL import Image
import numpy as np
import base64
import io
import os
import hashlib
from pathlib import Path
from typing import Optional
from dataclasses import dataclass
from tqdm import tqdm

# =============================================================================
# Configuration
# =============================================================================

@dataclass
class Config:
    """Configuration for Vision RAG Advanced"""
    # Models
    EMBED_MODEL: str = "embed-v4.0"
    RERANK_MODEL: str = "rerank-v3.5"
    VISION_MODEL: str = "gemini-2.5-flash"

    # Processing
    IMAGE_MAX_SIZE: int = 1024
    BATCH_SIZE: int = 10
    TOP_K_RETRIEVAL: int = 10
    TOP_K_RERANK: int = 5

    # Storage
    CHROMA_PERSIST_DIR: str = "./chroma_vision_db"
    COLLECTION_PREFIX: str = "vision_rag_"


config = Config()

# =============================================================================
# Clients
# =============================================================================

@st.cache_resource
def get_cohere_client() -> cohere.Client:
    """Initialize Cohere client"""
    api_key = os.getenv("COHERE_API_KEY") or st.secrets.get("COHERE_API_KEY")
    if not api_key:
        st.error("COHERE_API_KEY not found in environment or secrets")
        st.stop()
    return cohere.Client(api_key)


@st.cache_resource
def get_gemini_model():
    """Initialize Gemini model"""
    api_key = os.getenv("GOOGLE_API_KEY") or st.secrets.get("GOOGLE_API_KEY")
    if not api_key:
        st.error("GOOGLE_API_KEY not found in environment or secrets")
        st.stop()
    genai.configure(api_key=api_key)
    return genai.GenerativeModel(config.VISION_MODEL)


@st.cache_resource
def get_chroma_client() -> chromadb.PersistentClient:
    """Initialize ChromaDB persistent client"""
    Path(config.CHROMA_PERSIST_DIR).mkdir(parents=True, exist_ok=True)
    return chromadb.PersistentClient(
        path=config.CHROMA_PERSIST_DIR,
        settings=Settings(anonymized_telemetry=False)
    )


# =============================================================================
# Image Processing
# =============================================================================

def resize_image(image: Image.Image, max_size: int = None) -> Image.Image:
    """Resize image while maintaining aspect ratio"""
    max_size = max_size or config.IMAGE_MAX_SIZE

    if max(image.size) <= max_size:
        return image

    ratio = max_size / max(image.size)
    new_size = tuple(int(dim * ratio) for dim in image.size)
    return image.resize(new_size, Image.Resampling.LANCZOS)


def image_to_base64(image: Image.Image, format: str = "PNG") -> str:
    """Convert PIL Image to base64 string"""
    buffer = io.BytesIO()
    image.save(buffer, format=format)
    return base64.b64encode(buffer.getvalue()).decode("utf-8")


def base64_to_image(b64_string: str) -> Image.Image:
    """Convert base64 string to PIL Image"""
    image_data = base64.b64decode(b64_string)
    return Image.open(io.BytesIO(image_data))


def compute_image_hash(image: Image.Image) -> str:
    """Compute hash for image deduplication"""
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    return hashlib.md5(buffer.getvalue()).hexdigest()


# =============================================================================
# PDF Processing
# =============================================================================

def extract_pages_from_pdf(pdf_path: str) -> list[dict]:
    """Extract pages from PDF as images with metadata"""
    doc = fitz.open(pdf_path)
    pages = []

    for page_num in range(len(doc)):
        page = doc[page_num]

        # Render page to image
        mat = fitz.Matrix(2.0, 2.0)  # 2x zoom for quality
        pix = page.get_pixmap(matrix=mat)

        # Convert to PIL Image
        image = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
        image = resize_image(image)

        # Extract text for hybrid search
        text = page.get_text()

        pages.append({
            "page_num": page_num + 1,
            "image": image,
            "text": text[:1000] if text else "",  # Limit text length
            "source": os.path.basename(pdf_path)
        })

    doc.close()
    return pages


def process_uploaded_pdfs(uploaded_files: list) -> list[dict]:
    """Process multiple uploaded PDF files"""
    all_pages = []

    for uploaded_file in uploaded_files:
        # Save temporarily
        temp_path = f"/tmp/{uploaded_file.name}"
        with open(temp_path, "wb") as f:
            f.write(uploaded_file.getvalue())

        # Extract pages
        pages = extract_pages_from_pdf(temp_path)
        all_pages.extend(pages)

        # Cleanup
        os.remove(temp_path)

    return all_pages


# =============================================================================
# Embedding & Vector Store
# =============================================================================

def compute_embeddings_batch(
    co: cohere.Client,
    pages: list[dict],
    progress_callback=None
) -> list[dict]:
    """Compute embeddings for pages in batches"""

    results = []
    total_batches = (len(pages) + config.BATCH_SIZE - 1) // config.BATCH_SIZE

    for batch_idx in range(total_batches):
        start_idx = batch_idx * config.BATCH_SIZE
        end_idx = min(start_idx + config.BATCH_SIZE, len(pages))
        batch = pages[start_idx:end_idx]

        # Prepare images for embedding
        images = []
        for page in batch:
            b64 = image_to_base64(page["image"])
            images.append({"image": b64})

        # Get embeddings
        response = co.embed(
            model=config.EMBED_MODEL,
            input_type="image",
            images=images,
            embedding_types=["float"]
        )

        # Combine with metadata
        for i, page in enumerate(batch):
            page["embedding"] = response.embeddings.float_[i]
            page["image_b64"] = image_to_base64(page["image"])
            results.append(page)

        if progress_callback:
            progress_callback((batch_idx + 1) / total_batches)

    return results


def get_or_create_collection(
    chroma_client: chromadb.PersistentClient,
    collection_name: str
) -> chromadb.Collection:
    """Get or create a ChromaDB collection"""
    return chroma_client.get_or_create_collection(
        name=collection_name,
        metadata={"hnsw:space": "cosine"}
    )


def store_pages_in_chroma(
    collection: chromadb.Collection,
    pages: list[dict]
) -> int:
    """Store embedded pages in ChromaDB"""

    ids = []
    embeddings = []
    metadatas = []
    documents = []

    for page in pages:
        page_id = f"{page['source']}_{page['page_num']}_{compute_image_hash(page['image'])[:8]}"

        ids.append(page_id)
        embeddings.append(page["embedding"])
        metadatas.append({
            "source": page["source"],
            "page_num": page["page_num"],
            "image_b64": page["image_b64"]
        })
        documents.append(page.get("text", ""))

    # Upsert to handle duplicates
    collection.upsert(
        ids=ids,
        embeddings=embeddings,
        metadatas=metadatas,
        documents=documents
    )

    return len(ids)


# =============================================================================
# Search & Retrieval
# =============================================================================

def search_similar_pages(
    co: cohere.Client,
    collection: chromadb.Collection,
    query: str,
    top_k: int = None
) -> list[dict]:
    """Search for similar pages using text query"""
    top_k = top_k or config.TOP_K_RETRIEVAL

    # Embed query
    response = co.embed(
        model=config.EMBED_MODEL,
        input_type="search_query",
        texts=[query],
        embedding_types=["float"]
    )
    query_embedding = response.embeddings.float_[0]

    # Query ChromaDB
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k,
        include=["metadatas", "documents", "distances"]
    )

    # Format results
    pages = []
    for i in range(len(results["ids"][0])):
        pages.append({
            "id": results["ids"][0][i],
            "source": results["metadatas"][0][i]["source"],
            "page_num": results["metadatas"][0][i]["page_num"],
            "image_b64": results["metadatas"][0][i]["image_b64"],
            "text": results["documents"][0][i] if results["documents"] else "",
            "distance": results["distances"][0][i] if results["distances"] else 0,
            "score": 1 - results["distances"][0][i] if results["distances"] else 1
        })

    return pages


def rerank_results(
    co: cohere.Client,
    query: str,
    pages: list[dict],
    top_k: int = None
) -> list[dict]:
    """Rerank search results using Cohere Rerank"""
    top_k = top_k or config.TOP_K_RERANK

    if not pages:
        return []

    # Prepare documents for reranking
    documents = []
    for page in pages:
        doc_text = f"Source: {page['source']}, Page {page['page_num']}. {page.get('text', '')}"
        documents.append(doc_text)

    # Rerank
    response = co.rerank(
        model=config.RERANK_MODEL,
        query=query,
        documents=documents,
        top_n=min(top_k, len(documents))
    )

    # Reorder pages based on rerank scores
    reranked = []
    for result in response.results:
        page = pages[result.index].copy()
        page["rerank_score"] = result.relevance_score
        reranked.append(page)

    return reranked


# =============================================================================
# Answer Generation
# =============================================================================

def generate_answer(
    model,
    query: str,
    pages: list[dict],
    include_sources: bool = True
) -> str:
    """Generate answer using Gemini Vision"""

    if not pages:
        return "No relevant pages found to answer your question."

    # Build prompt with images
    prompt_parts = [
        "You are analyzing document pages to answer a question.\n\n",
        f"Question: {query}\n\n",
        "Analyze the following pages and provide a comprehensive answer:\n\n"
    ]

    # Add images
    for i, page in enumerate(pages[:5]):  # Limit to top 5 for context
        prompt_parts.append(f"--- Page {i+1} (from {page['source']}, page {page['page_num']}) ---\n")

        # Convert base64 to PIL Image for Gemini
        image = base64_to_image(page["image_b64"])
        prompt_parts.append(image)
        prompt_parts.append("\n\n")

    prompt_parts.append(
        "\nBased on these pages, provide a detailed answer to the question. "
        "If the answer is not found in the pages, say so clearly. "
        "Reference specific pages when citing information."
    )

    # Generate response
    response = model.generate_content(prompt_parts)
    answer = response.text

    # Add sources if requested
    if include_sources:
        sources = "\n\n**Sources:**\n"
        for page in pages[:5]:
            score = page.get("rerank_score", page.get("score", 0))
            sources += f"- {page['source']}, Page {page['page_num']} (relevance: {score:.2f})\n"
        answer += sources

    return answer


# =============================================================================
# Streamlit App
# =============================================================================

def main():
    st.set_page_config(
        page_title="Vision RAG Advanced",
        page_icon="🔍",
        layout="wide"
    )

    st.title("🔍 Vision RAG Advanced")
    st.markdown("""
    **Multimodal Document Search with Persistent Storage**

    Upload PDFs and ask questions about their visual content.
    Uses Cohere Embed v4 for multimodal embeddings and Gemini Flash for vision-based QA.
    """)

    # Initialize clients
    co = get_cohere_client()
    gemini = get_gemini_model()
    chroma = get_chroma_client()

    # Sidebar for configuration
    with st.sidebar:
        st.header("⚙️ Configuration")

        collection_name = st.text_input(
            "Collection Name",
            value="default",
            help="Name for the vector store collection"
        )
        collection_name = f"{config.COLLECTION_PREFIX}{collection_name}"

        top_k = st.slider("Results to retrieve", 3, 20, config.TOP_K_RETRIEVAL)
        use_rerank = st.checkbox("Use Reranking", value=True)

        st.divider()
        st.header("📊 Collection Stats")

        try:
            collection = get_or_create_collection(chroma, collection_name)
            count = collection.count()
            st.metric("Indexed Pages", count)
        except Exception as e:
            st.error(f"Error: {e}")
            count = 0

    # Main tabs
    tab1, tab2 = st.tabs(["📤 Upload & Index", "🔎 Search & Ask"])

    # Tab 1: Upload and Index
    with tab1:
        st.header("Upload Documents")

        uploaded_files = st.file_uploader(
            "Upload PDF files",
            type=["pdf"],
            accept_multiple_files=True
        )

        if uploaded_files and st.button("Process & Index", type="primary"):
            collection = get_or_create_collection(chroma, collection_name)

            with st.status("Processing documents...", expanded=True) as status:
                # Extract pages
                st.write("📄 Extracting pages from PDFs...")
                pages = process_uploaded_pdfs(uploaded_files)
                st.write(f"Found {len(pages)} pages")

                # Compute embeddings
                st.write("🧮 Computing embeddings...")
                progress_bar = st.progress(0)

                def update_progress(p):
                    progress_bar.progress(p)

                pages_with_embeddings = compute_embeddings_batch(
                    co, pages, progress_callback=update_progress
                )

                # Store in ChromaDB
                st.write("💾 Storing in vector database...")
                stored = store_pages_in_chroma(collection, pages_with_embeddings)

                status.update(label=f"✅ Indexed {stored} pages!", state="complete")

            st.success(f"Successfully indexed {stored} pages from {len(uploaded_files)} PDF(s)")
            st.rerun()

    # Tab 2: Search and Ask
    with tab2:
        st.header("Search Documents")

        if count == 0:
            st.info("👆 Upload and index some documents first!")
            return

        query = st.text_input("Ask a question about your documents")

        if query:
            collection = get_or_create_collection(chroma, collection_name)

            with st.spinner("Searching..."):
                # Search
                results = search_similar_pages(co, collection, query, top_k=top_k)

                # Rerank if enabled
                if use_rerank and results:
                    results = rerank_results(co, query, results)

            if results:
                # Generate answer
                with st.spinner("Generating answer..."):
                    answer = generate_answer(gemini, query, results)

                st.markdown("### 💡 Answer")
                st.markdown(answer)

                st.divider()
                st.markdown("### 📑 Retrieved Pages")

                cols = st.columns(min(len(results), 3))
                for i, page in enumerate(results[:6]):
                    with cols[i % 3]:
                        image = base64_to_image(page["image_b64"])
                        st.image(image, caption=f"{page['source']} - Page {page['page_num']}")
                        score = page.get("rerank_score", page.get("score", 0))
                        st.caption(f"Score: {score:.3f}")
            else:
                st.warning("No relevant pages found.")


if __name__ == "__main__":
    main()
