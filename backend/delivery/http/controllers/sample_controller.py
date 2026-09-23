"""
HTTP Controller for sample contracts catalog and direct loading.
"""

from fastapi import HTTPException
from backend.core.exceptions import SampleNotFoundError
from backend.use_cases.sample_contracts import SampleContractsUseCase
from backend.use_cases.ingest_document import IngestDocumentUseCase

ingest_use_case = IngestDocumentUseCase()


class SampleController:
    """Handles HTTP requests for sample contract management."""

    @staticmethod
    def list_sample_contracts():
        return SampleContractsUseCase.list_catalog()

    @staticmethod
    def load_sample_contract(sample_id: str):
        try:
            return ingest_use_case.execute_from_sample(sample_id)
        except SampleNotFoundError as e:
            raise HTTPException(status_code=404, detail=str(e))
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed loading sample contract: {str(e)}")
