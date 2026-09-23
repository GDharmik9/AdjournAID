from typing import List, Dict, Any, Optional
from backend.core.value_objects.risk_level import RiskLevel


class RiskItem:
    """Core Domain Entity: Contract clause risk review analysis card."""

    def __init__(
        self,
        clause_ref: str,
        summary: str,
        risk_level: RiskLevel = RiskLevel.BLUE,
        clause_title: Optional[str] = None,
        implication: Optional[str] = None,
        counter_proposal: Optional[str] = None,
        section_id: Optional[str] = None,
        ldps: Optional[List[Dict[str, Any]]] = None,
    ):
        self.clause_ref = clause_ref
        self.clause_title = clause_title or clause_ref
        self.risk_level = risk_level
        self.summary = summary
        self.implication = implication
        self.counter_proposal = counter_proposal
        self.section_id = section_id
        self.ldps = ldps or []

    def to_dict(self) -> Dict[str, Any]:
        return {
            "clause_ref": self.clause_ref,
            "clause_title": self.clause_title,
            "risk_level": self.risk_level.value if isinstance(self.risk_level, RiskLevel) else str(self.risk_level),
            "summary": self.summary,
            "implication": self.implication,
            "counter_proposal": self.counter_proposal,
            "section_id": self.section_id,
            "ldps": self.ldps,
        }


class SimplifiedClause:
    """Core Domain Entity: Plain-English translation of a legal clause."""

    def __init__(
        self,
        clause_ref: str,
        plain_english: str,
        key_takeaway: Optional[str] = None,
        actionable_tip: Optional[str] = None,
        section_id: Optional[str] = None,
    ):
        self.clause_ref = clause_ref
        self.plain_english = plain_english
        self.key_takeaway = key_takeaway
        self.actionable_tip = actionable_tip
        self.section_id = section_id

    def to_dict(self) -> Dict[str, Any]:
        return {
            "clause_ref": self.clause_ref,
            "plain_english": self.plain_english,
            "key_takeaway": self.key_takeaway,
            "actionable_tip": self.actionable_tip,
            "section_id": self.section_id,
        }


class Redline:
    """Core Domain Entity: Side-by-side original clause vs recommended balanced redline."""

    def __init__(
        self,
        clause_ref: str,
        original_text: str,
        proposed_redline: str,
        rationale: str,
        section_id: Optional[str] = None,
    ):
        self.clause_ref = clause_ref
        self.original_text = original_text
        self.proposed_redline = proposed_redline
        self.rationale = rationale
        self.section_id = section_id

    def to_dict(self) -> Dict[str, Any]:
        return {
            "clause_ref": self.clause_ref,
            "original_text": self.original_text,
            "proposed_redline": self.proposed_redline,
            "rationale": self.rationale,
            "section_id": self.section_id,
        }


class ConsultationBrief:
    """Core Domain Entity: Attorney Consultation Preparation Brief."""

    def __init__(
        self,
        brief_title: str,
        client_summary: str,
        estimated_hours_saved: str,
        estimated_cost_savings: str,
        top_red_flags: List[Dict[str, Any]],
        questions_for_attorney: List[str],
        client_leverage_points: List[str],
    ):
        self.brief_title = brief_title
        self.client_summary = client_summary
        self.estimated_hours_saved = estimated_hours_saved
        self.estimated_cost_savings = estimated_cost_savings
        self.top_red_flags = top_red_flags
        self.questions_for_attorney = questions_for_attorney
        self.client_leverage_points = client_leverage_points

    def to_dict(self) -> Dict[str, Any]:
        return {
            "brief_title": self.brief_title,
            "client_summary": self.client_summary,
            "estimated_hours_saved": self.estimated_hours_saved,
            "estimated_cost_savings": self.estimated_cost_savings,
            "top_red_flags": self.top_red_flags,
            "questions_for_attorney": self.questions_for_attorney,
            "client_leverage_points": self.client_leverage_points,
        }
