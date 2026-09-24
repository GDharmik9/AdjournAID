"""
Delivery HTTP DTO schemas (Pydantic models).
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class AnalyzeRequest(BaseModel):
    document_id: str = Field(..., description="Active session ID of uploaded/loaded contract")
    task_type: str = Field("risk_review", description="Analysis mode: risk_review, simplification, redline, or consultation_brief")
    custom_query: Optional[str] = Field(None, description="Optional custom search query")
    force_refresh: bool = Field(False, description="Bypass cache and force re-analysis with LLM")


class ProviderUpdateRequest(BaseModel):
    provider: str = Field(..., description="LLM provider name: gemini, vertex_ai, local_saul_lm, fallback")


class SampleContractSummary(BaseModel):
    id: str
    title: str
    description: str


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    active_sessions: int
    zero_data_retention: bool
    active_provider: str
    gemini_model: str
    supported_providers: List[str]


class ProviderInfoResponse(BaseModel):
    active_provider: str
    gemini_model: str
    supported_providers: List[str]
