import time
import logging
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List
from backend.core.entities.document import DocumentMetadata

logger = logging.getLogger("AdjournAID.DocumentRepo")


class IDocumentRepository(ABC):
    """Abstract repository interface for contract document persistence."""

    @abstractmethod
    def save(self, session_id: str, document: DocumentMetadata) -> None:
        pass

    @abstractmethod
    def get(self, session_id: str) -> Optional[DocumentMetadata]:
        pass

    @abstractmethod
    def delete(self, session_id: str) -> bool:
        pass

    @abstractmethod
    def cleanup_expired(self, max_idle_seconds: int = 1800) -> List[str]:
        pass


class MemoryDocumentRepository(IDocumentRepository):
    """
    Ephemeral In-Memory Document Repository enforcing Zero-Data-Retention (ZDR).
    Stores documents temporarily during active user session and purges them on session end
    or when TTL (30 minutes) expires.
    """

    def __init__(self):
        self._store: Dict[str, Dict[str, Any]] = {}
        self._last_accessed: Dict[str, float] = {}

    def save(self, session_id: str, document: DocumentMetadata) -> None:
        self._store[session_id] = document.to_dict()
        self._last_accessed[session_id] = time.time()

    def get(self, session_id: str) -> Optional[DocumentMetadata]:
        if session_id not in self._store:
            return None
        self._last_accessed[session_id] = time.time()
        data = self._store[session_id]
        return DocumentMetadata(
            document_id=data["document_id"],
            doc_title=data["doc_title"],
            doc_fingerprint=data["doc_fingerprint"],
            total_pages=data["total_pages"],
            total_sections=data["total_sections"],
            total_chunks=data["total_chunks"],
            pages=data["pages"],
            sections=data["sections"],
            created_at=data.get("created_at"),
        )

    def get_raw(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Returns dictionary representation directly."""
        if session_id not in self._store:
            return None
        self._last_accessed[session_id] = time.time()
        return self._store[session_id]

    def delete(self, session_id: str) -> bool:
        doc_existed = self._store.pop(session_id, None) is not None
        self._last_accessed.pop(session_id, None)
        return doc_existed

    def cleanup_expired(self, max_idle_seconds: int = 1800) -> List[str]:
        now = time.time()
        expired_sessions = [
            sid for sid, last_time in self._last_accessed.items()
            if now - last_time > max_idle_seconds
        ]
        for sid in expired_sessions:
            self.delete(sid)
            logger.info(f"ZDR Purged idle session from memory: {sid}")
        return expired_sessions

    def exists(self, session_id: str) -> bool:
        return session_id in self._store


# Global singleton instance for app lifecycle
document_repository = MemoryDocumentRepository()
