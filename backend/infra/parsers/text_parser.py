from typing import List, Dict, Any
from backend.services.utils.text_sanitizer import sanitize_document_text


class TextParser:
    """Parses raw text strings into structured page records."""

    @classmethod
    def parse(cls, raw_text: str, scrub_pii: bool = True) -> List[Dict[str, Any]]:
        sanitized = sanitize_document_text(raw_text, scrub_pii=scrub_pii)
        # Break into ~1600 char pages for coherent legal reading
        chunks = [sanitized[i:i + 1600] for i in range(0, len(sanitized), 1600)]
        return [{"page_number": idx + 1, "text": chunk} for idx, chunk in enumerate(chunks)] or [{"page_number": 1, "text": sanitized}]
