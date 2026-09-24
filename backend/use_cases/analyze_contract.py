"""
Use case for analyzing contracts using Hierarchical Auto-Merge Retrieval,
CLAIM Prompt Inference Engine, and LeMAJ Fact-Checking Verification.
"""

import logging
from collections import OrderedDict
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
    "comparison": "indemnification term renewal liability termination governing law",
    "qa_query": "contract obligations rights liabilities remedies",
}


class AnalyzeContractUseCase:
    """Coordinates retrieval, generation, and verification for legal contract analysis with LRU caching."""

    MAX_CACHE_ENTRIES = 256

    def __init__(
        self,
        doc_repo: IDocumentRepository = document_repository,
        vector_mgr: VectorRepositoryManager = vector_repository_manager,
    ):
        self.doc_repo = doc_repo
        self.vector_mgr = vector_mgr
        self._analysis_cache: OrderedDict[str, Dict[str, Any]] = OrderedDict()
        self.cache_hits: int = 0
        self.cache_misses: int = 0

    def purge_session_cache(self, session_id: str) -> None:
        """Purges cached analysis entries belonging to a given session."""
        keys_to_remove = [k for k in list(self._analysis_cache.keys()) if k.startswith(f"{session_id}:")]
        for k in keys_to_remove:
            self._analysis_cache.pop(k, None)

    def get_cache_stats(self) -> Dict[str, Any]:
        """Returns LRU cache efficiency metrics."""
        total = self.cache_hits + self.cache_misses
        hit_ratio = round((self.cache_hits / total * 100), 2) if total > 0 else 0.0
        return {
            "entries": len(self._analysis_cache),
            "max_entries": self.MAX_CACHE_ENTRIES,
            "hits": self.cache_hits,
            "misses": self.cache_misses,
            "hit_ratio_pct": hit_ratio,
        }

    @staticmethod
    def _extract_items_to_verify(task_type: str, analysis_raw: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Maps CLAIM task outputs to standardized verification tuples."""
        if task_type == "risk_review":
            return analysis_raw.get("risk_items", [])
        if task_type == "simplification":
            return analysis_raw.get("simplified_clauses", [])
        if task_type == "redline":
            return analysis_raw.get("redlines", [])
        if task_type == "comparison":
            return [
                {
                    "clause_ref": c.get("clause_ref", c.get("term_category", "")),
                    "summary": c.get("this_contract_term", ""),
                    "implication": c.get("negotiation_tip", ""),
                }
                for c in analysis_raw.get("comparison_items", [])
            ]
        if task_type == "qa_query":
            return [
                {
                    "clause_ref": analysis_raw.get("primary_clause_ref", "Source Excerpt"),
                    "summary": analysis_raw.get("direct_answer", ""),
                    "implication": analysis_raw.get("practical_advice", ""),
                }
            ]
        return analysis_raw.get("top_red_flags", [])

    def _run_analysis_pipeline(
        self,
        doc_meta: Any,
        document_id: str,
        task_type: str,
        custom_query: Optional[str],
    ) -> Dict[str, Any]:
        """Executes retrieval, inference, and verification pipeline."""
        retriever = self.vector_mgr.get_or_create(document_id)
        search_query = custom_query or DEFAULT_QUERY_MAP.get(task_type, "contract clauses obligations liability")
        retrieved_contexts = retriever.auto_merge_retrieve(query=search_query, top_k=6)

        source_context_by_clause = {c["section_id"]: c["content"] for c in retrieved_contexts}
        for c in retrieved_contexts:
            source_context_by_clause[c["title"]] = c["content"]

        analysis_raw = InferenceService.generate_claim_analysis(
            task_type=task_type,
            sections=doc_meta.sections,
            doc_fingerprint=doc_meta.doc_fingerprint,
            retrieved_contexts=retrieved_contexts,
            custom_query=custom_query,
        )

        items_to_verify = self._extract_items_to_verify(task_type, analysis_raw)
        lemaj_result = LeMAJVerifier.verify_analysis(
            analysis_items=items_to_verify,
            source_context_by_clause=source_context_by_clause,
        )

        return {
            "document_id": document_id,
            "task_type": task_type,
            "doc_fingerprint": doc_meta.doc_fingerprint,
            "analysis": analysis_raw,
            "lemaj_verification": lemaj_result,
            "retrieved_contexts_count": len(retrieved_contexts),
            "auto_merged_parents": sum(1 for c in retrieved_contexts if c.get("is_merged_parent")),
            "cached": False,
        }

    def execute(
        self,
        document_id: str,
        task_type: str = "risk_review",
        custom_query: Optional[str] = None,
        force_refresh: bool = False,
    ) -> Dict[str, Any]:
        provider = InferenceService.get_active_provider()
        cache_key = f"{document_id}:{task_type}:{provider}:{custom_query or ''}"

        if not force_refresh and cache_key in self._analysis_cache:
            self.cache_hits += 1
            self._analysis_cache.move_to_end(cache_key)
            logger.info(f"Serving cached analysis for session '{document_id}', task '{task_type}' (Cache Hit #{self.cache_hits})")
            cached_result = dict(self._analysis_cache[cache_key])
            cached_result["cached"] = True
            cached_result["cache_hit"] = True
            return cached_result

        self.cache_misses += 1
        doc_meta = self.doc_repo.get(document_id)
        if not doc_meta:
            raise SessionNotFoundError("Document session not found. Please upload or load contract first.")

        result = self._run_analysis_pipeline(doc_meta, document_id, task_type, custom_query)

        if len(self._analysis_cache) >= self.MAX_CACHE_ENTRIES:
            self._analysis_cache.popitem(last=False)
        self._analysis_cache[cache_key] = result
        return result


# Global singleton instance
analyze_contract_use_case = AnalyzeContractUseCase()


