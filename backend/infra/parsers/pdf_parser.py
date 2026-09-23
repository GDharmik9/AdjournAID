import io
import logging
from typing import List, Dict, Any
from backend.services.utils.text_sanitizer import sanitize_document_text

logger = logging.getLogger("AdjournAI.PDFParser")


class PDFParser:
    """Parses PDF document bytes into structured page records."""

    @classmethod
    def parse(cls, file_bytes: bytes, scrub_pii: bool = True) -> List[Dict[str, Any]]:
        pages_data = []

        # Strategy 1: pypdf
        try:
            from pypdf import PdfReader
            reader = PdfReader(io.BytesIO(file_bytes))
            for idx, page in enumerate(reader.pages):
                text = page.extract_text() or ""
                cleaned = sanitize_document_text(text, scrub_pii=scrub_pii)
                if cleaned.strip():
                    pages_data.append({"page_number": idx + 1, "text": cleaned})
            if pages_data:
                return pages_data
        except ImportError:
            logger.info("pypdf not installed, attempting PyMuPDF / fitz fallback")
        except Exception as e:
            logger.warning(f"pypdf extraction failed: {e}")

        # Strategy 2: PyMuPDF (fitz) fallback
        try:
            import fitz
            doc = fitz.open(stream=file_bytes, filetype="pdf")
            for idx, page in enumerate(doc):
                text = page.get_text() or ""
                cleaned = sanitize_document_text(text, scrub_pii=scrub_pii)
                if cleaned.strip():
                    pages_data.append({"page_number": idx + 1, "text": cleaned})
            if pages_data:
                return pages_data
        except ImportError:
            logger.warning("Neither pypdf nor fitz available for PDF extraction.")
        except Exception as e:
            logger.warning(f"fitz extraction failed: {e}")

        return pages_data
