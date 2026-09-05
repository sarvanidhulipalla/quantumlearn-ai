from typing import List, Dict, Any
from app.services.ai.knowledge_base import get_all_knowledge_documents
from app.services.ai.embeddings import embedding_engine

_is_initialized = False


def _ensure_knowledge_indexed():
    global _is_initialized
    if not _is_initialized:
        docs = get_all_knowledge_documents()
        embedding_engine.fit_and_index(docs)
        _is_initialized = True


def retrieve_relevant_knowledge(query: str, top_k: int = 3, threshold: float = 0.08) -> List[Dict[str, Any]]:
    """
    RAG vector retriever searching verified quantum knowledge documents.
    Returns ranked relevant documents with source titles and relevance scores.
    """
    _ensure_knowledge_indexed()

    raw_matches = embedding_engine.compute_similarity(query, top_k=top_k, min_score=threshold)

    results: List[Dict[str, Any]] = []
    for doc, score in raw_matches:
        results.append({
            "id": doc.get("id"),
            "title": doc.get("title"),
            "module": doc.get("module"),
            "category": doc.get("category"),
            "content": doc.get("content"),
            "relevance_score": score,
        })

    return results
