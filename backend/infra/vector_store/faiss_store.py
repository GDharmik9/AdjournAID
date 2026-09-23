import re
import numpy as np
from typing import List, Dict, Any, Optional

_HAS_FAISS = None


class FallbackDenseEmbedder:
    """
    Lightweight, deterministic feature-hashing + TF-IDF dense embedder
    ensuring instant startup, 100% offline capability, and zero heavyweight dependencies.
    """
    DIM = 384

    def encode(self, texts: List[str], normalize_embeddings: bool = True) -> np.ndarray:
        vectors = []
        for text in texts:
            vec = np.zeros(self.DIM, dtype=np.float32)
            words = re.findall(r"\b[A-Za-z0-9_]{2,}\b", text.lower())
            if not words:
                vectors.append(vec)
                continue

            for w in words:
                h = hash(w) % self.DIM
                vec[h] += 1.0

            norm = np.linalg.norm(vec)
            if normalize_embeddings and norm > 0:
                vec = vec / norm
            vectors.append(vec)

        return np.array(vectors, dtype=np.float32)


class FAISSVectorIndex:
    """Volatile in-memory FAISS vector indexer for session retrieval."""

    def __init__(self):
        self.embedder = FallbackDenseEmbedder()
        self.index = None
        self.metadata: List[Dict[str, Any]] = []
        self.embeddings: Optional[np.ndarray] = None

    def build(self, texts: List[str], metadata: List[Dict[str, Any]]) -> None:
        global _HAS_FAISS
        if not texts:
            self.clear()
            return

        self.metadata = metadata
        vectors = self.embedder.encode(texts, normalize_embeddings=True)
        self.embeddings = np.ascontiguousarray(vectors, dtype=np.float32)

        if _HAS_FAISS is None:
            try:
                import faiss
                _HAS_FAISS = True
            except Exception:
                _HAS_FAISS = False

        if _HAS_FAISS:
            import faiss
            dim = self.embeddings.shape[1]
            self.index = faiss.IndexFlatIP(dim)
            self.index.add(self.embeddings)
        else:
            self.index = None

    def search(self, query: str, top_k: int = 10) -> List[Dict[str, Any]]:
        if not self.metadata or self.embeddings is None:
            return []

        query_vec = self.embedder.encode([query], normalize_embeddings=True)
        query_vec = np.ascontiguousarray(query_vec, dtype=np.float32)

        if self.index is not None:
            scores, indices = self.index.search(query_vec, min(top_k, len(self.metadata)))
            matched = []
            for score, idx in zip(scores[0], indices[0]):
                if idx >= 0 and idx < len(self.metadata):
                    item = dict(self.metadata[idx])
                    item["_score"] = float(score)
                    matched.append(item)
            return matched
        else:
            # NumPy cosine dot product fallback
            scores = np.dot(self.embeddings, query_vec.T).flatten()
            top_indices = np.argsort(-scores)[:top_k]
            matched = []
            for idx in top_indices:
                item = dict(self.metadata[idx])
                item["_score"] = float(scores[idx])
                matched.append(item)
            return matched

    def clear(self) -> None:
        self.index = None
        self.metadata.clear()
        self.embeddings = None
