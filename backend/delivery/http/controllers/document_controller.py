"""
HTTP Controller for document upload and retrieval endpoints.
"""

from typing import Optional
from fastapi import UploadFile, File, Form, HTTPException

from backend.core.exceptions import FileTooLargeError, DocumentParsingError
from backend.services.repositories.document_repo import document_repository
from backend.use_cases.ingest_document import IngestDocumentUseCase

ingest_use_case = IngestDocumentUseCase()


class DocumentController:
    """Handles HTTP requests related to document ingestion and inspection."""

    @staticmethod
    async def upload_document(
        file: Optional[UploadFile] = File(None),
        raw_text: Optional[str] = Form(None),
        doc_title: Optional[str] = Form(None),
    ):
        if not file and not raw_text:
            raise HTTPException(status_code=400, detail="Must provide either a file or raw_text")

        try:
            if file:
                content = await file.read()
                return ingest_use_case.execute_from_bytes(
                    file_bytes=content,
                    filename=file.filename or "contract.txt",
                    doc_title=doc_title,
                )
            else:
                return ingest_use_case.execute_from_text(
                    raw_text=raw_text,
                    doc_title=doc_title,
                )
        except FileTooLargeError as e:
            raise HTTPException(status_code=413, detail=str(e))
        except DocumentParsingError as e:
            raise HTTPException(status_code=400, detail=str(e))
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Unexpected error processing document: {str(e)}")

    @staticmethod
    def get_document(session_id: str):
        doc = document_repository.get_raw(session_id)
        if not doc:
            raise HTTPException(status_code=404, detail="Document session not found or has been purged.")
        return doc
