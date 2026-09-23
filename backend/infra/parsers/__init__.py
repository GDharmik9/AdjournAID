from typing import List, Dict, Any
from backend.core.entities.document import ParsedSection
from backend.infra.parsers.text_parser import TextParser
from backend.infra.parsers.pdf_parser import PDFParser
from backend.infra.parsers.docx_parser import DocxParser
from backend.infra.parsers.section_extractor import SectionExtractor


class DocumentParser:
    """Facade for document parsing and section extraction."""

    @classmethod
    def parse_text(cls, raw_text: str, scrub_pii: bool = True) -> List[Dict[str, Any]]:
        return TextParser.parse(raw_text, scrub_pii=scrub_pii)

    @classmethod
    def parse_pdf(cls, file_bytes: bytes, scrub_pii: bool = True) -> List[Dict[str, Any]]:
        return PDFParser.parse(file_bytes, scrub_pii=scrub_pii)

    @classmethod
    def parse_docx(cls, file_bytes: bytes, scrub_pii: bool = True) -> List[Dict[str, Any]]:
        return DocxParser.parse(file_bytes, scrub_pii=scrub_pii)

    @classmethod
    def extract_sections(cls, pages: List[Dict[str, Any]]) -> List[ParsedSection]:
        return SectionExtractor.extract_sections(pages)


__all__ = ["DocumentParser", "TextParser", "PDFParser", "DocxParser", "SectionExtractor"]
