"""
Use case for enforcing Zero-Data-Retention (ZDR) policy.
Purges volatile session vectors and document in-memory representations.
"""

import logging
from typing import Dict, Any, List

from backend.core.exceptions import SessionNotFoundError
from backend.services.repositories.document_repo import document_repository, IDocumentRepository
from backend.services.repositories.vector_repo import vector_repository_manager, VectorRepositoryManager

logger = logging.getLogger("AdjournAID.PurgeSession")


class PurgeSessionUseCase:
    """Enforces immediate or idle-TTL purging of ephemeral session state."""

    def __init__(
        self,
        doc_repo: IDocumentRepository = document_repository,
        vector_mgr: VectorRepositoryManager = vector_repository_manager,
    ):
        self.doc_repo = doc_repo
        self.vector_mgr = vector_mgr

    def purge_session(self, session_id: str) -> Dict[str, str]:
        from backend.use_cases.analyze_contract import analyze_contract_use_case
        purged_retriever = self.vector_mgr.purge_session(session_id)
        purged_doc = self.doc_repo.delete(session_id)
        analyze_contract_use_case.purge_session_cache(session_id)

        if not purged_retriever and not purged_doc:
            raise SessionNotFoundError(f"Session '{session_id}' does not exist")


        return {
            "session_id": session_id,
            "status": "purged",
            "message": "Session memory and vector indices completely erased under Zero-Data-Retention policy.",
        }

    def cleanup_expired(self, max_idle_seconds: int = 1800) -> List[str]:
        """Lazy TTL session cleaner."""
        try:
            expired_vectors = self.vector_mgr.cleanup_expired_sessions(max_idle_seconds=max_idle_seconds)
            expired_docs = self.doc_repo.cleanup_expired(max_idle_seconds=max_idle_seconds)
            return list(set(expired_vectors + expired_docs))
        except Exception as e:
            logger.warning(f"Error during ZDR session cleanup: {e}")
            return []


# Global convenience instance
purge_session_use_case = PurgeSessionUseCase()
