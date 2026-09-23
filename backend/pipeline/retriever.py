"""
Pipeline Retriever Compatibility Layer.
Re-exports SessionRetriever and SessionStoreManager from services/repositories.
"""

from backend.services.repositories.vector_repo import (
    SessionVectorRepository as SessionRetriever,
    VectorRepositoryManager as SessionStoreManagerClass,
    vector_repository_manager as SessionStoreManager,
)
from backend.infra.vector_store.faiss_store import FallbackDenseEmbedder

__all__ = ["SessionRetriever", "SessionStoreManager", "FallbackDenseEmbedder"]
