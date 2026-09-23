from typing import List, Dict, Any
from backend.core.value_objects.verification_tag import VerificationTag


class LegalDataPoint:
    """Core Domain Entity: Atomic legal fact decomposed from AI-generated claim."""

    def __init__(
        self,
        statement: str,
        tag: VerificationTag = VerificationTag.CORRECT,
        rationale: str = "",
        clause_ref: str = "",
    ):
        self.statement = statement
        self.tag = tag
        self.rationale = rationale
        self.clause_ref = clause_ref

    def to_dict(self) -> Dict[str, Any]:
        return {
            "statement": self.statement,
            "tag": self.tag.value if isinstance(self.tag, VerificationTag) else str(self.tag),
            "rationale": self.rationale,
            "clause_ref": self.clause_ref,
        }


class LeMAJReport:
    """Core Domain Entity: Aggregate LeMAJ Fact-Checking Verification Report."""

    def __init__(
        self,
        status: str,
        grounded_ratio: float,
        total_ldps: int,
        correct_count: int,
        incorrect_count: int,
        irrelevant_count: int,
        verified_items: List[Dict[str, Any]],
    ):
        self.status = status
        self.grounded_ratio = grounded_ratio
        self.total_ldps = total_ldps
        self.correct_count = correct_count
        self.incorrect_count = incorrect_count
        self.irrelevant_count = irrelevant_count
        self.verified_items = verified_items

    def to_dict(self) -> Dict[str, Any]:
        return {
            "status": self.status,
            "grounded_ratio": self.grounded_ratio,
            "total_ldps": self.total_ldps,
            "correct_count": self.correct_count,
            "incorrect_count": self.incorrect_count,
            "irrelevant_count": self.irrelevant_count,
            "verified_items": self.verified_items,
        }
