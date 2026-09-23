import re
from typing import List, Dict, Any, Tuple
from backend.infra.config.env import settings
from backend.core.entities.verification import LegalDataPoint


class LeMAJVerifier:
    """
    Evaluates legal outputs against retrieved source context.
    Assigns atomic tags and calculates document groundedness confidence.
    """

    STOP_WORDS = {
        "the", "a", "an", "and", "or", "but", "if", "then", "shall", "may",
        "will", "with", "from", "for", "to", "in", "on", "by", "of", "at",
        "is", "are", "was", "were", "this", "that", "these", "those"
    }

    @classmethod
    def extract_ldps(cls, text: str) -> List[str]:
        raw_sentences = re.split(r"(?<=[.!?])\s+|\n+|(?:;\s*)", text)
        clean_ldps = []

        for s in raw_sentences:
            s_clean = s.strip()
            s_clean = re.sub(r"^[-*•#0-9.)\s]+", "", s_clean).strip()
            if len(s_clean.split()) >= 4:
                clean_ldps.append(s_clean)

        return clean_ldps

    @classmethod
    def _evaluate_single_claim(cls, claim: str, source_context: str) -> Tuple[str, str]:
        claim_words = [
            w.lower() for w in re.findall(r"\b[A-Za-z0-9_-]{3,}\b", claim)
            if w.lower() not in cls.STOP_WORDS
        ]
        if not claim_words:
            return "<Irrelevant>", "Claim lacks distinct legal keywords or factual substance."

        source_lower = source_context.lower()
        matched_words = [w for w in claim_words if w in source_lower]
        match_ratio = len(matched_words) / len(claim_words) if claim_words else 0.0

        numbers_in_claim = re.findall(r"\b(?:\$?\d+(?:,\d{3})*(?:\.\d+)?%?|\b\d+\b)", claim)
        if numbers_in_claim:
            for num in numbers_in_claim:
                if num not in source_context:
                    return (
                        "<Incorrect>",
                        f"Specified numerical metric '{num}' was not identified in the source clause."
                    )

        if match_ratio >= 0.40:
            return (
                "<Correct>",
                f"Grounded by source clause text (Key match: {', '.join(matched_words[:4])})."
            )
        elif match_ratio >= 0.20:
            return (
                "<Irrelevant>",
                "Partially supported general statement or subjective interpretation."
            )
        else:
            return (
                "<Incorrect>",
                "Unverified assertion; source text lacks supporting clause terminology."
            )

    @classmethod
    def verify_analysis(
        cls,
        analysis_items: List[Dict[str, Any]],
        source_context_by_clause: Dict[str, str]
    ) -> Dict[str, Any]:
        all_ldps = []
        correct_count = 0
        incorrect_count = 0
        irrelevant_count = 0

        ldp_idx = 1
        for item in analysis_items:
            clause_id = item.get("clause_ref", "") or item.get("section_id", "")
            source_text = source_context_by_clause.get(clause_id, "")

            if not source_text and source_context_by_clause:
                source_text = " ".join(source_context_by_clause.values())

            claims_to_check = []
            if "summary" in item and item["summary"]:
                claims_to_check.append(item["summary"])
            if "implication" in item and item["implication"]:
                claims_to_check.append(item["implication"])
            if "plain_english" in item and item["plain_english"]:
                claims_to_check.append(item["plain_english"])

            item_ldps = []

            for text_block in claims_to_check:
                extracted = cls.extract_ldps(text_block)
                for sentence in extracted:
                    tag, rationale = cls._evaluate_single_claim(sentence, source_text)
                    ldp = {
                        "ldp_id": f"ldp-{ldp_idx}",
                        "claim_text": sentence,
                        "tag": tag,
                        "rationale": rationale,
                        "source_reference": clause_id
                    }
                    all_ldps.append(ldp)
                    item_ldps.append(ldp)
                    ldp_idx += 1

                    if tag == "<Correct>":
                        correct_count += 1
                    elif tag == "<Incorrect>":
                        incorrect_count += 1
                    else:
                        irrelevant_count += 1

            item["ldps"] = item_ldps
            item_correct = sum(1 for x in item_ldps if x["tag"] == "<Correct>")
            item["item_grounded"] = (item_correct / len(item_ldps) >= 0.70) if item_ldps else True

        total_ldps = len(all_ldps)
        score = round(correct_count / total_ldps, 3) if total_ldps > 0 else 1.0
        is_grounded = score >= settings.LEMAJ_GROUNDED_THRESHOLD

        return {
            "grounded_status": is_grounded,
            "badge_text": "Verified Grounded" if is_grounded else "Verification Required",
            "score": score,
            "total_ldps": total_ldps,
            "counts": {
                "correct": correct_count,
                "incorrect": incorrect_count,
                "irrelevant": irrelevant_count,
            },
            "ldps": all_ldps,
        }
