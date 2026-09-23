import os
import time
import logging
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from backend.core.entities.document import ParsedSection, SACChunk
from backend.infra.vector_store.faiss_store import FAISSVectorIndex

logger = logging.getLogger("AdjournAID.VectorRepo")


class IVectorRepository(ABC):
    """Abstract interface for session-scoped vector storage and retrieval."""

    @abstractmethod
    def index_document(self, sections: List[Any], chunks: List[Any]) -> None:
        pass

    @abstractmethod
    def auto_merge_retrieve(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    def purge(self) -> None:
        pass


class SessionVectorRepository(IVectorRepository):
    """
    Session-scoped Vector Repository using volatile FAISS indexer.
    Applies Hierarchical Auto-Merge logic: collapses multiple matching child chunks
    into their complete parent section when threshold (>= 2 chunks) is satisfied.
    """

    def __init__(self, session_id: str):
        self.session_id = session_id
        self.last_accessed = time.time()
        self.index = FAISSVectorIndex()
        self.sections_by_id: Dict[str, Dict[str, Any]] = {}
        self.chunks_by_id: Dict[str, Dict[str, Any]] = {}

    def index_document(self, sections: List[Any], chunks: List[Any]) -> None:
        self.last_accessed = time.time()
        self.sections_by_id.clear()
        self.chunks_by_id.clear()

        # Index parent sections
        for sec in sections:
            sec_dict = sec.to_dict() if hasattr(sec, "to_dict") else sec
            self.sections_by_id[sec_dict["section_id"]] = sec_dict

        # Index child chunks into FAISS vector space
        chunk_texts = []
        chunk_metas = []
        for ch in chunks:
            ch_dict = ch.to_dict() if hasattr(ch, "to_dict") else ch
            self.chunks_by_id[ch_dict["chunk_id"]] = ch_dict
            chunk_texts.append(ch_dict.get("prepended_text", ch_dict.get("child_text", "")))
            chunk_metas.append(ch_dict)

        self.index.build(chunk_texts, chunk_metas)

    def auto_merge_retrieve(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        self.last_accessed = time.time()
        matched_chunks = self.index.search(query, top_k=top_k * 2)

        # Count sibling chunk matches per parent section
        parent_counts: Dict[str, int] = {}
        for ch in matched_chunks:
            p_id = ch.get("parent_section_id")
            if p_id:
                parent_counts[p_id] = parent_counts.get(p_id, 0) + 1

        final_contexts: List[Dict[str, Any]] = []
        emitted_parents = set()

        for ch in matched_chunks:
            p_id = ch.get("parent_section_id")
            # Auto-Merge collapse: if >= 2 sibling chunks match, return full parent section
            if p_id and parent_counts.get(p_id, 0) >= 2:
                if p_id not in emitted_parents and p_id in self.sections_by_id:
                    parent_sec = self.sections_by_id[p_id]
                    score = round(float(ch.get("_score", 1.0)), 3)
                    final_contexts.append({
                        "section_id": parent_sec["section_id"],
                        "title": parent_sec["title"],
                        "content": parent_sec["content"],
                        "page": parent_sec.get("page", 1),
                        "is_merged_parent": True,
                        "matched_siblings_count": parent_counts[p_id],
                        "relevance_score": score,
                    })
                    emitted_parents.add(p_id)
            else:
                if p_id not in emitted_parents:
                    score = round(float(ch.get("_score", 1.0)), 3)
                    final_contexts.append({
                        "section_id": ch.get("parent_section_id", "chunk"),
                        "title": ch.get("parent_title", "Relevant Clause Excerpt"),
                        "content": ch.get("child_text", ""),
                        "page": ch.get("page_number", 1),
                        "is_merged_parent": False,
                        "relevance_score": score,
                    })

            if len(final_contexts) >= top_k:
                break

        return final_contexts

    def purge(self) -> None:
        self.index.clear()
        self.sections_by_id.clear()
        self.chunks_by_id.clear()


class VectorRepositoryManager:
    """Manages ephemeral session vector stores and enforces Zero-Data-Retention (ZDR) TTL."""

    def __init__(self):
        self._stores: Dict[str, SessionVectorRepository] = {}
        self._session_timestamps: Dict[str, float] = {}

    def get_or_create(self, session_id: str) -> SessionVectorRepository:
        now = time.time()
        self._session_timestamps[session_id] = now
        if session_id not in self._stores:
            self._stores[session_id] = SessionVectorRepository(session_id)
        self._stores[session_id].last_accessed = now
        return self._stores[session_id]

    def get_session(self, session_id: str) -> Optional[SessionVectorRepository]:
        if session_id in self._stores:
            now = time.time()
            self._session_timestamps[session_id] = now
            self._stores[session_id].last_accessed = now
        return self._stores.get(session_id)

    def list_sessions(self) -> List[str]:
        return list(self._stores.keys())

    def purge_session(self, session_id: str) -> bool:
        self._session_timestamps.pop(session_id, None)
        if session_id in self._stores:
            self._stores[session_id].purge()
            del self._stores[session_id]
            logger.info(f"Purged FAISS vector index for session: {session_id}")
            return True
        return False

    def cleanup_expired_sessions(self, max_idle_seconds: int = 1800) -> List[str]:
        now = time.time()
        expired = [
            sid for sid, ts in list(self._session_timestamps.items())
            if now - ts > max_idle_seconds
        ]
        # Also check stores without timestamp
        for sid, store in list(self._stores.items()):
            if sid not in expired and now - store.last_accessed > max_idle_seconds:
                expired.append(sid)

        for sid in expired:
            self.purge_session(sid)
        return expired


# Global vector repository manager
vector_repository_manager = VectorRepositoryManager()
