"""
Delivery HTTP Route definitions for AdjournAID API.
Maps external HTTP routes to controller methods.
"""

from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form

from backend.delivery.http.schemas.dto import AnalyzeRequest, ProviderUpdateRequest
from backend.delivery.http.controllers import (
    DocumentController,
    AnalysisController,
    SampleController,
    SessionController,
    HealthController,
)

api_router = APIRouter(prefix="/api")

# System & LLM Provider routes
api_router.add_api_route("/health", HealthController.health_check, methods=["GET"])
api_router.add_api_route("/provider", HealthController.get_provider, methods=["GET"])
api_router.add_api_route("/provider", HealthController.set_provider, methods=["POST"])

# Sample contracts routes
api_router.add_api_route("/sample-contracts", SampleController.list_sample_contracts, methods=["GET"])
api_router.add_api_route("/sample-contracts/{sample_id}/load", SampleController.load_sample_contract, methods=["POST"])

# Document ingestion and inspection routes
api_router.add_api_route("/upload", DocumentController.upload_document, methods=["POST"])
api_router.add_api_route("/document/{session_id}", DocumentController.get_document, methods=["GET"])

# Session management & Zero-Data-Retention (ZDR) purging
api_router.add_api_route("/session/{session_id}", SessionController.purge_session, methods=["DELETE"])

# Analysis & LeMAJ Verification route
api_router.add_api_route("/analyze", AnalysisController.analyze_document, methods=["POST"])
