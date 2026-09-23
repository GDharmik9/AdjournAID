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
    ) -> Dict[str, Any]:
        return InferenceEngine.generate(
            task_type=task_type,
            sections=sections,
            doc_fingerprint=doc_fingerprint,
            retrieved_contexts=retrieved_contexts,
        )
