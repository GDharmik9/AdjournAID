import io
import logging
from typing import List, Dict, Any
from backend.services.utils.text_sanitizer import sanitize_document_text

logger = logging.getLogger("AdjournAI.DocxParser")


class DocxParser:
    """Parses Microsoft Word DOCX document bytes into structured page records."""

    @classmethod
    def parse(cls, file_bytes: bytes, scrub_pii: bool = True) -> List[Dict[str, Any]]:
        pages_data = []
        try:
            import docx
            doc = docx.Document(io.BytesIO(file_bytes))
            paragraphs = [
                sanitize_document_text(p.text, scrub_pii=scrub_pii)
                for p in doc.paragraphs
                if p.text.strip()
            ]

            # Approximate ~350 word pages
            current_page_text = []
            page_counter = 1

            for p in paragraphs:
                current_page_text.append(p)
                if len(" ".join(current_page_text).split()) > 350:
                    pages_data.append({
                        "page_number": page_counter,
                        "text": "\n\n".join(current_page_text)
                    })
                    current_page_text = []
                    page_counter += 1

            if current_page_text:
                pages_data.append({
                    "page_number": page_counter,
                    "text": "\n\n".join(current_page_text)
                })

        except Exception as e:
            logger.error(f"DOCX parsing error: {e}")
            raise

        return pages_data
