import re
import math
from typing import List, Dict, Any, Tuple


class VectorEmbeddingEngine:
    """
    Lightweight, deterministic vector embedding and cosine similarity engine.
    Supports n-gram tokenization, keyword weighting, and fast vector search.
    """

    def __init__(self):
        self._vocabulary: Dict[str, int] = {}
        self._idf: Dict[str, float] = {}
        self._documents: List[Dict[str, Any]] = []
        self._doc_vectors: List[Dict[int, float]] = []

    def _tokenize(self, text: str) -> List[str]:
        cleaned = re.sub(r"[^a-zA-Z0-9_\+\-\|]", " ", text.lower())
        tokens = [t.strip() for t in cleaned.split() if len(t.strip()) > 1]
        
        # Add bigrams for key quantum terms like "bell state", "bloch sphere", "cnot gate"
        bigrams = [f"{tokens[i]}_{tokens[i+1]}" for i in range(len(tokens) - 1)]
        return tokens + bigrams

    def fit_and_index(self, documents: List[Dict[str, Any]]) -> None:
        """
        Builds the TF-IDF vocabulary and indices all documents into normalized vectors.
        """
        self._documents = documents
        self._doc_vectors = []
        doc_count = len(documents)
        if doc_count == 0:
            return

        doc_tokens_list: List[List[str]] = []
        doc_freq: Dict[str, int] = {}

        for doc in documents:
            text = f"{doc.get('title', '')} {doc.get('category', '')} {doc.get('content', '')} {' '.join(doc.get('keywords', []))}"
            tokens = self._tokenize(text)
            doc_tokens_list.append(tokens)

            unique_tokens = set(tokens)
            for t in unique_tokens:
                doc_freq[t] = doc_freq.get(t, 0) + 1

        # Calculate IDF
        self._vocabulary = {term: idx for idx, term in enumerate(doc_freq.keys())}
        self._idf = {
            term: math.log((doc_count + 1.0) / (df + 1.0)) + 1.0
            for term, df in doc_freq.items()
        }

        # Calculate vector for each document
        for tokens in doc_tokens_list:
            vec = self._vectorize_tokens(tokens)
            self._doc_vectors.append(vec)

    def _vectorize_tokens(self, tokens: List[str]) -> Dict[int, float]:
        tf: Dict[str, float] = {}
        for t in tokens:
            tf[t] = tf.get(t, 0.0) + 1.0

        vec: Dict[int, float] = {}
        sq_sum = 0.0

        for term, count in tf.items():
            if term in self._vocabulary:
                dim_idx = self._vocabulary[term]
                weight = count * self._idf.get(term, 1.0)
                vec[dim_idx] = weight
                sq_sum += weight * weight

        # Normalize to unit length
        if sq_sum > 0:
            norm = math.sqrt(sq_sum)
            for k in vec:
                vec[k] /= norm

        return vec

    def compute_similarity(self, query: str, top_k: int = 3, min_score: float = 0.05) -> List[Tuple[Dict[str, Any], float]]:
        """
        Calculates cosine similarity between the query and indexed documents.
        Returns top_k matching documents with their similarity score.
        """
        if not self._doc_vectors:
            return []

        q_tokens = self._tokenize(query)
        q_vec = self._vectorize_tokens(q_tokens)

        if not q_vec:
            return []

        scored_results: List[Tuple[Dict[str, Any], float]] = []

        for idx, d_vec in enumerate(self._doc_vectors):
            # Cosine dot product
            dot_product = 0.0
            for dim, weight in q_vec.items():
                if dim in d_vec:
                    dot_product += weight * d_vec[dim]

            # Bonus score if document keywords or title explicitly match query tokens
            doc = self._documents[idx]
            doc_title_lower = doc.get("title", "").lower()
            if any(qt in doc_title_lower for qt in q_tokens if len(qt) > 2):
                dot_product += 0.15

            if dot_product >= min_score:
                scored_results.append((doc, round(min(1.0, dot_product), 4)))

        # Sort descending by score
        scored_results.sort(key=lambda x: x[1], reverse=True)
        return scored_results[:top_k]


# Singleton index instance
embedding_engine = VectorEmbeddingEngine()
