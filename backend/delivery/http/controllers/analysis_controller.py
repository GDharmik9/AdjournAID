"""
HTTP Controller for contract analysis and verification endpoints.
"""

from fastapi import HTTPException
from backend.delivery.http.schemas.dto import AnalyzeRequest
from backend.core.exceptions import SessionNotFoundError
from backend.use_cases.analyze_contract import analyze_contract_use_case

analyze_use_case = analyze_contract_use_case



class AnalysisController:
    """Handles HTTP requests for contract risk review, simplification, redlining, and consultation brief."""

    @staticmethod
    def analyze_document(request: AnalyzeRequest):
        try:
            return analyze_use_case.execute(
                document_id=request.document_id,
                task_type=request.task_type,
                custom_query=request.custom_query,
                force_refresh=request.force_refresh,
            )

        except SessionNotFoundError as e:
            raise HTTPException(status_code=404, detail=str(e))
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Contract analysis failed: {str(e)}")
