import re
from typing import List, Dict, Any
from backend.core.entities.document import ParsedSection


class SectionExtractor:
    """
    Extracts semantic parent sections (e.g. Sections, Articles) from parsed document pages.
    """

    # Matches legal section headers like "SECTION 1. TERM", "ARTICLE IV - INDEMNIFICATION", "3.1 Payment"
    SECTION_HEADER_REGEX = re.compile(
        r"^(?:(?:ARTICLE|SECTION)\s+[0-9IVXLCDM]+(?:\.[0-9]+)*|^\d+\.\d*(?:\.\d+)*)\s*[:\-—.]*\s*([A-Za-z0-9 ,'\-/]+)?",
        re.MULTILINE | re.IGNORECASE
    )

    @classmethod
    def extract_sections(cls, pages: List[Dict[str, Any]]) -> List[ParsedSection]:
        sections: List[ParsedSection] = []
        current_sec_id = "preamble"
        current_title = "Preamble & Recitals"
        current_content: List[str] = []
        current_page = 1
        sec_counter = 1

        for page in pages:
            lines = page["text"].split("\n")
            for line in lines:
                stripped = line.strip()
                match = cls.SECTION_HEADER_REGEX.match(stripped)
                if match and len(stripped) < 100:
                    # Save accumulated section if not empty
                    if current_content:
                        sec_text = "\n".join(current_content).strip()
                        if sec_text:
                            sections.append(ParsedSection(
                                section_id=current_sec_id,
                                title=current_title,
                                content=sec_text,
                                page=current_page
                            ))
                        current_content = []

                    current_sec_id = f"sec-{sec_counter}"
                    current_title = stripped
                    current_page = page["page_number"]
                    sec_counter += 1
                else:
                    if stripped:
                        current_content.append(stripped)

        # Flush final accumulated section
        if current_content:
            sec_text = "\n".join(current_content).strip()
            if sec_text:
                sections.append(ParsedSection(
                    section_id=current_sec_id,
                    title=current_title,
                    content=sec_text,
                    page=current_page
                ))

        # Fallback if no formal section headers matched
        if not sections:
            all_text = "\n\n".join(p["text"] for p in pages)
            sections.append(ParsedSection(
                section_id="entire-agreement",
                title="Contract Provisions",
                content=all_text,
                page=1
            ))

        return sections
