"""
Pipeline Parser Compatibility Layer.
Re-exports DocumentParser, ParsedSection, and sanitizers from clean architecture layers.
"""

from backend.core.entities.document import ParsedSection
from backend.infra.parsers import DocumentParser
from backend.services.utils.pii_scrubber import scrub_pii_phi
from backend.services.utils.text_sanitizer import scrub_prompt_injections, sanitize_document_text

__all__ = [
    "ParsedSection",
    "DocumentParser",
    "scrub_pii_phi",
    "scrub_prompt_injections",
    "sanitize_document_text",
]
