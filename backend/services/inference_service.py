"""
Inference Service Layer (Molecules)
Orchestrates CLAIM legal prompt execution through the underlying Inference Engine.
"""

from typing import Dict, Any, List, Optional
from backend.infra.llm.inference_engine import InferenceEngine


class InferenceService:
    """Facade for CLAIM prompt generation across AI providers."""

    @classmethod
    def get_active_provider(cls) -> str:
        return InferenceEngine.get_active_provider()

    @classmethod
    def generate_claim_analysis(
        cls,
        task_type: str,
        sections: List[Dict[str, Any]],
        doc_fingerprint: str,
        retrieved_contexts: Optional[List[Dict[str, Any]]] = None,
        custom_query: Optional[str] = None,
    ) -> Dict[str, Any]:
        return InferenceEngine.generate(
            task_type=task_type,
            sections=sections,
            doc_fingerprint=doc_fingerprint,
            retrieved_contexts=retrieved_contexts,
            custom_query=custom_query,
        )

    @classmethod
    def format_contexts(
        cls,
        retrieved_contexts: Optional[List[Dict[str, Any]]],
        sections: List[Dict[str, Any]],
        max_chars: int = 4000,
    ) -> str:
        """Enforces strict context window token budgeting (max 4,000 characters)."""
        return InferenceEngine._format_contexts(retrieved_contexts, sections, max_chars=max_chars)

