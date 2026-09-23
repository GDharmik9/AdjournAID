"""
Use case for analyzing contracts using Hierarchical Auto-Merge Retrieval,
CLAIM Prompt Inference Engine, and LeMAJ Fact-Checking Verification.
"""

import logging
from typing import Dict, Any, Optional

from backend.core.exceptions import SessionNotFoundError
from backend.services.repositories.document_repo import document_repository, IDocumentRepository
from backend.services.repositories.vector_repo import vector_repository_manager, VectorRepositoryManager
from backend.services.inference_service import InferenceService
from backend.services.verifier_service import LeMAJVerifier

logger = logging.getLogger("AdjournAID.AnalyzeContract")

DEFAULT_QUERY_MAP = {
    "risk_review": "indemnification liability default termination penalty automatic renewal arbitration damages",
    "simplification": "payment obligations term covenants restrictions remedies",
    "redline": "limitation of liability indemnification termination for convenience",
    "consultation_brief": "unilateral obligations legal dispute risk warranty indemnification",
}


class AnalyzeContractUseCase:
    """Coordinates retrieval, generation, and verification for legal contract analysis."""

    def __init__(
        self,
        doc_repo: IDocumentRepository = document_repository,
        vector_mgr: VectorRepositoryManager = vector_repository_manager,
    ):
        self.doc_repo = doc_repo
        self.vector_mgr = vector_mgr
        self._analysis_cache: Dict[str, Dict[str, Any]] = {}

    def purge_session_cache(self, session_id: str) -> None:
        """Purges cached analysis entries belonging to a given session."""
        keys_to_remove = [k for k in self._analysis_cache if k.startswith(f"{session_id}:")]
        for k in keys_to_remove:
            self._analysis_cache.pop(k, None)

    def execute(
        self,
        document_id: str,
        task_type: str = "risk_review",
        custom_query: Optional[str] = None,
        force_refresh: bool = False,
    ) -> Dict[str, Any]:
        provider = InferenceService.get_active_provider()
        cache_key = f"{document_id}:{task_type}:{provider}:{custom_query or ''}"

        # Return cached result if available and not forced to refresh
        if not force_refresh and cache_key in self._analysis_cache:
            logger.info(f"Serving cached analysis for session '{document_id}', task '{task_type}', provider '{provider}'")
            cached_result = dict(self._analysis_cache[cache_key])
            cached_result["cached"] = True
            return cached_result

        doc_meta = self.doc_repo.get(document_id)
        if not doc_meta:
            raise SessionNotFoundError("Document session not found. Please upload or load contract first.")

        retriever = self.vector_mgr.get_or_create(document_id)

        # Hierarchical Auto-Merge Search Query
        search_query = custom_query or DEFAULT_QUERY_MAP.get(task_type, "contract clauses obligations liability")
        retrieved_contexts = retriever.auto_merge_retrieve(query=search_query, top_k=6)


        # Build context lookup dictionary for LeMAJ verification
        source_context_by_clause = {}
        for c in retrieved_contexts:
            source_context_by_clause[c["section_id"]] = c["content"]
            source_context_by_clause[c["title"]] = c["content"]

        # CLAIM Inference Generation
        analysis_raw = InferenceService.generate_claim_analysis(
            task_type=task_type,
            sections=doc_meta.sections,
            doc_fingerprint=doc_meta.doc_fingerprint,
            retrieved_contexts=retrieved_contexts,
        )

        # Verification Layer: LeMAJ Framework
        items_to_verify = []
        if task_type == "risk_review":
            items_to_verify = analysis_raw.get("risk_items", [])
        elif task_type == "simplification":
            items_to_verify = analysis_raw.get("simplified_clauses", [])
        elif task_type == "redline":
            items_to_verify = analysis_raw.get("redlines", [])
        else:
            items_to_verify = analysis_raw.get("top_red_flags", [])

        lemaj_result = LeMAJVerifier.verify_analysis(
            analysis_items=items_to_verify,
            source_context_by_clause=source_context_by_clause,
        )

        result = {
            "document_id": document_id,
            "task_type": task_type,
            "doc_fingerprint": doc_meta.doc_fingerprint,
            "analysis": analysis_raw,
            "lemaj_verification": lemaj_result,
            "retrieved_contexts_count": len(retrieved_contexts),
            "auto_merged_parents": sum(1 for c in retrieved_contexts if c.get("is_merged_parent")),
            "cached": False,
        }

        # Store in volatile in-memory session cache
        self._analysis_cache[cache_key] = result
        return result


# Global singleton instance
analyze_contract_use_case = AnalyzeContractUseCase()


