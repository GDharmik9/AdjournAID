"""
Use case for ingesting, parsing, chunking, and indexing legal documents.
Enforces Zero-Data-Retention (ZDR) and input sanitization boundaries.
"""

import uuid
import logging
from typing import Optional, Dict, Any, List

from backend.infra.config.env import settings
from backend.core.exceptions import (
    FileTooLargeError,
    DocumentParsingError,
    SampleNotFoundError,
)
from backend.core.entities.document import DocumentMetadata, ParsedSection
from backend.infra.parsers import DocumentParser
from backend.services.sac_service import SummaryAugmentedChunker
from backend.services.repositories.document_repo import document_repository, IDocumentRepository
from backend.services.repositories.vector_repo import vector_repository_manager, VectorRepositoryManager
from backend.use_cases.sample_contracts import SampleContractsUseCase

logger = logging.getLogger("AdjournAID.IngestDocument")


class IngestDocumentUseCase:
    """Orchestrates document parsing, HIPAA PII scrubbing, SAC chunking, and FAISS indexing."""

    def __init__(
        self,
        doc_repo: IDocumentRepository = document_repository,
        vector_mgr: VectorRepositoryManager = vector_repository_manager,
    ):
        self.doc_repo = doc_repo
        self.vector_mgr = vector_mgr

    def execute_from_bytes(
        self,
        file_bytes: bytes,
        filename: str,
        doc_title: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Ingests a document from raw bytes (PDF, DOCX, or text)."""
        if len(file_bytes) > settings.MAX_UPLOAD_SIZE:
            raise FileTooLargeError(
                f"Uploaded file exceeds maximum security limit of {settings.MAX_UPLOAD_SIZE // (1024 * 1024)} MB."
            )

        clean_title = doc_title or filename.rsplit(".", 1)[0].replace("_", " ").title()
        lower_name = filename.lower()

        try:
            if lower_name.endswith(".pdf"):
                pages = DocumentParser.parse_pdf(file_bytes, scrub_pii=settings.ENABLE_PII_SCRUBBING)
            elif lower_name.endswith(".docx"):
                pages = DocumentParser.parse_docx(file_bytes, scrub_pii=settings.ENABLE_PII_SCRUBBING)
            else:
                text_str = file_bytes.decode("utf-8", errors="ignore")
                pages = DocumentParser.parse_text(text_str, scrub_pii=settings.ENABLE_PII_SCRUBBING)
        except Exception as e:
            logger.error(f"Failed parsing file {filename}: {e}")
            raise DocumentParsingError(f"Failed to parse document: {str(e)}")

        return self._process_and_store(pages=pages, doc_title=clean_title)

    def execute_from_text(
        self,
        raw_text: str,
        doc_title: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Ingests a document provided as plain text."""
        raw_bytes = raw_text.encode("utf-8")
        if len(raw_bytes) > settings.MAX_UPLOAD_SIZE:
            raise FileTooLargeError(
                f"Submitted text exceeds maximum security limit of {settings.MAX_UPLOAD_SIZE // (1024 * 1024)} MB."
            )

        clean_title = doc_title or "Uploaded Contract"
        try:
            pages = DocumentParser.parse_text(raw_text, scrub_pii=settings.ENABLE_PII_SCRUBBING)
        except Exception as e:
            logger.error(f"Failed parsing raw text: {e}")
            raise DocumentParsingError(f"Failed to parse text: {str(e)}")

        return self._process_and_store(pages=pages, doc_title=clean_title)

    def execute_from_sample(self, sample_id: str) -> Dict[str, Any]:
        """Ingests a pre-configured sample contract."""
        sample = SampleContractsUseCase.get_sample(sample_id)
        return self.execute_from_text(raw_text=sample["text"], doc_title=sample["title"])

    def _process_and_store(
        self,
        pages: List[Dict[str, Any]],
        doc_title: str,
    ) -> Dict[str, Any]:
        """Common pipeline processing: extract sections, SAC chunking, index, and save."""
        if not pages or not any(p.get("text", "").strip() for p in pages):
            raise DocumentParsingError("Document contains no readable text or is an image-only scanned PDF.")

        session_id = str(uuid.uuid4())

        # Semantic parent section extraction
        sections = DocumentParser.extract_sections(pages)

        # Summary-Augmented Chunking (SAC)
        sac_result = SummaryAugmentedChunker.process_document(
            doc_title=doc_title,
            sections=sections,
        )

        # Volatile session vector store indexing
        retriever = self.vector_mgr.get_or_create(session_id)
        retriever.index_document(sections=sections, chunks=sac_result["chunks"])

        # Persist ephemeral document metadata
        doc_meta = DocumentMetadata(
            document_id=session_id,
            doc_title=doc_title,
            doc_fingerprint=sac_result["doc_fingerprint"],
            total_pages=len(pages),
            total_sections=len(sections),
            total_chunks=len(sac_result["chunks"]),
            pages=pages,
            sections=[s.to_dict() for s in sections],
        )
        self.doc_repo.save(session_id, doc_meta)

        return {
            "session_id": session_id,
            "document_id": session_id,
            "title": doc_title,
            "doc_title": doc_title,
            "doc_fingerprint": sac_result["doc_fingerprint"],
            "total_pages": len(pages),
            "total_sections": len(sections),
            "total_chunks": len(sac_result["chunks"]),
            "sections": [s.to_dict() for s in sections],
            "pages": pages,
        }
