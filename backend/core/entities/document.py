from typing import Dict, Any, List, Optional


class ParsedSection:
    """
    Core Domain Entity: Semantic parent section of a legal contract
    (e.g., Section 4: Indemnification and Liability).
    """

    def __init__(self, section_id: str, title: str, content: str, page: int = 1):
        self.section_id = section_id
        self.title = title
        self.content = content
        self.page = page

    def to_dict(self) -> Dict[str, Any]:
        return {
            "section_id": self.section_id,
            "title": self.title,
            "content": self.content,
            "page": self.page,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "ParsedSection":
        return cls(
            section_id=data.get("section_id", "sec-0"),
            title=data.get("title", "Untitled Section"),
            content=data.get("content", ""),
            page=data.get("page", 1),
        )


class SACChunk:
    """
    Core Domain Entity: Summary-Augmented child chunk.
    Prepends a 150-char document fingerprint and parent section header to
    500-char child text to eliminate Document-Level Retrieval Mismatch (DRM).
    """

    def __init__(
        self,
        chunk_id: str,
        parent_section_id: str,
        parent_title: str,
        doc_fingerprint: str,
        child_text: str,
        prepended_text: str,
        page_number: int,
        start_char: int = 0,
        end_char: int = 0,
    ):
        self.chunk_id = chunk_id
        self.parent_section_id = parent_section_id
        self.parent_title = parent_title
        self.doc_fingerprint = doc_fingerprint
        self.child_text = child_text
        self.prepended_text = prepended_text
        self.page_number = page_number
        self.start_char = start_char
        self.end_char = end_char

    def to_dict(self) -> Dict[str, Any]:
        return {
            "chunk_id": self.chunk_id,
            "parent_section_id": self.parent_section_id,
            "parent_title": self.parent_title,
            "doc_fingerprint": self.doc_fingerprint,
            "child_text": self.child_text,
            "prepended_text": self.prepended_text,
            "page_number": self.page_number,
            "start_char": self.start_char,
            "end_char": self.end_char,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "SACChunk":
        return cls(
            chunk_id=data["chunk_id"],
            parent_section_id=data["parent_section_id"],
            parent_title=data["parent_title"],
            doc_fingerprint=data["doc_fingerprint"],
            child_text=data["child_text"],
            prepended_text=data["prepended_text"],
            page_number=data.get("page_number", 1),
            start_char=data.get("start_char", 0),
            end_char=data.get("end_char", 0),
        )


class DocumentMetadata:
    """
    Core Domain Entity: Full ephemeral document record under Zero-Data-Retention.
    """

    def __init__(
        self,
        document_id: str,
        doc_title: str,
        doc_fingerprint: str,
        total_pages: int,
        total_sections: int,
        total_chunks: int,
        pages: List[Dict[str, Any]],
        sections: List[Dict[str, Any]],
        created_at: Optional[str] = None,
    ):
        self.document_id = document_id
        self.doc_title = doc_title
        self.doc_fingerprint = doc_fingerprint
        self.total_pages = total_pages
        self.total_sections = total_sections
        self.total_chunks = total_chunks
        self.pages = pages
        self.sections = sections
        self.created_at = created_at or "active"

    def to_dict(self) -> Dict[str, Any]:
        return {
            "document_id": self.document_id,
            "doc_title": self.doc_title,
            "doc_fingerprint": self.doc_fingerprint,
            "total_pages": self.total_pages,
            "total_sections": self.total_sections,
            "total_chunks": self.total_chunks,
            "pages": self.pages,
            "sections": self.sections,
            "created_at": self.created_at,
        }
