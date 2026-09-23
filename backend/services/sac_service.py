import re
from typing import List, Dict, Any, Optional
from backend.infra.config.env import settings
from backend.core.entities.document import ParsedSection, SACChunk


class SummaryAugmentedChunker:
    """
    Executes SAC pipeline:
    1. Extracts/Synthesizes 150-char document fingerprint.
    2. Splits sections into ~500-char child chunks.
    3. Prepends '[DOC SUMMARY: ...] [SECTION: ...]' to eliminate DRM in vector space.
    """

    @classmethod
    def generate_document_fingerprint(cls, doc_title: str, full_text: str, max_chars: int = 150) -> str:
        """
        Synthesizes a dense, 150-char fingerprint describing party names,
        agreement type, and governing scope.
        """
        clean_text = " ".join(full_text.split())

        parties_match = re.search(
            r"between\s+([A-Z0-9., ]+?)(?:,\s*an?\s+[^,]+)?\s+and\s+([A-Z0-9., ]+)",
            clean_text,
            re.IGNORECASE
        )

        doc_type_match = re.search(
            r"(commercial lease|lease agreement|non-disclosure agreement|nda|master services agreement|msa|employment agreement|consulting agreement|software license|terms of service)",
            clean_text,
            re.IGNORECASE
        )

        parties = ""
        if parties_match:
            p1 = parties_match.group(1).strip()[:30]
            p2 = parties_match.group(2).strip()[:30]
            parties = f" ({p1} & {p2})"

        doc_type = doc_type_match.group(1).title() if doc_type_match else (doc_title[:40] or "Legal Contract")
        sample_snippet = clean_text[:120].strip()
        fingerprint = f"{doc_type}{parties}. Core terms: {sample_snippet}"

        if len(fingerprint) > max_chars:
            fingerprint = fingerprint[: max_chars - 3].rsplit(" ", 1)[0] + "..."

        return fingerprint

    @classmethod
    def chunk_section(
        cls,
        section: ParsedSection,
        doc_fingerprint: str,
        chunk_size: int = 500,
        chunk_overlap: int = 60
    ) -> List[SACChunk]:
        content = section.content.strip()
        if not content:
            return []

        chunks: List[SACChunk] = []
        total_len = len(content)
        idx = 0
        chunk_num = 1

        while idx < total_len:
            end_idx = min(idx + chunk_size, total_len)

            # Snap end_idx to sentence boundary if possible
            if end_idx < total_len:
                period_pos = content.rfind(". ", idx + 200, end_idx)
                newline_pos = content.rfind("\n", idx + 200, end_idx)
                best_cut = max(period_pos, newline_pos)
                if best_cut != -1 and best_cut > idx:
                    end_idx = best_cut + 1

            child_slice = content[idx:end_idx].strip()

            if child_slice:
                chunk_id = f"{section.section_id}-c{chunk_num}"
                prepended_text = (
                    f"[DOC SUMMARY: {doc_fingerprint}] "
                    f"[SECTION: {section.title}] "
                    f"{child_slice}"
                )

                chunk = SACChunk(
                    chunk_id=chunk_id,
                    parent_section_id=section.section_id,
                    parent_title=section.title,
                    doc_fingerprint=doc_fingerprint,
                    child_text=child_slice,
                    prepended_text=prepended_text,
                    page_number=section.page,
                    start_char=idx,
                    end_char=end_idx,
                )
                chunks.append(chunk)
                chunk_num += 1

            idx = end_idx
            if idx >= total_len:
                break

        return chunks

    @classmethod
    def process_document(
        cls,
        doc_title: str,
        sections: List[ParsedSection],
        max_fingerprint_chars: Optional[int] = None,
        chunk_size: Optional[int] = None,
        chunk_overlap: Optional[int] = None,
    ) -> Dict[str, Any]:
        max_fp = max_fingerprint_chars or settings.FINGERPRINT_MAX_CHARS
        c_size = chunk_size or settings.CHILD_CHUNK_SIZE
        c_overlap = chunk_overlap or settings.CHILD_CHUNK_OVERLAP

        full_doc_text = "\n\n".join(s.content for s in sections)
        doc_fingerprint = cls.generate_document_fingerprint(
            doc_title=doc_title,
            full_text=full_doc_text,
            max_chars=max_fp,
        )

        all_chunks: List[SACChunk] = []
        for sec in sections:
            sec_chunks = cls.chunk_section(
                section=sec,
                doc_fingerprint=doc_fingerprint,
                chunk_size=c_size,
                chunk_overlap=c_overlap,
            )
            all_chunks.extend(sec_chunks)

        return {
            "doc_fingerprint": doc_fingerprint,
            "chunks": all_chunks,
            "total_chunks": len(all_chunks),
            "total_sections": len(sections),
        }
