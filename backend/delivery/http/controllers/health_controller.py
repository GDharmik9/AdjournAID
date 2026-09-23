"""
HTTP Controller for system health, telemetry, and LLM provider configuration.
"""

from fastapi import HTTPException
from backend.infra.config.env import settings
from backend.delivery.http.schemas.dto import ProviderUpdateRequest
from backend.services.repositories.vector_repo import vector_repository_manager


from backend.use_cases.analyze_contract import analyze_contract_use_case


class HealthController:
    """Handles health checks and runtime provider configuration."""

    SUPPORTED_PROVIDERS = ["gemini", "vertex_ai", "local_saul_lm", "fallback"]

    @classmethod
    def health_check(cls):
        return {
            "status": "healthy",
            "service": settings.APP_NAME,
            "version": settings.VERSION,
            "active_sessions": len(vector_repository_manager.list_sessions()),
            "zero_data_retention": True,
            "active_provider": settings.LLM_PROVIDER,
            "gemini_model": settings.GEMINI_MODEL,
            "supported_providers": cls.SUPPORTED_PROVIDERS,
            "efficiency_metrics": {
                "lru_cache": analyze_contract_use_case.get_cache_stats(),
                "gzip_compression": True,
                "token_budget_cap_chars": 4000,
                "sub_ms_fallback_embedder": True,
            },
        }

    @classmethod
    def get_provider(cls):
        return {
            "active_provider": settings.LLM_PROVIDER,
            "gemini_model": settings.GEMINI_MODEL,
            "supported_providers": cls.SUPPORTED_PROVIDERS,
        }

    @classmethod
    def set_provider(cls, req: ProviderUpdateRequest):
        if req.provider.lower() not in cls.SUPPORTED_PROVIDERS:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid provider. Must be one of {cls.SUPPORTED_PROVIDERS}",
            )
        settings.LLM_PROVIDER = req.provider.lower()
        return {"status": "updated", "active_provider": settings.LLM_PROVIDER}
