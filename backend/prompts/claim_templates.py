"""
CLAIM Framework Prompt Engineering Templates.
Context, Legal Task, Audience, Instructions, Mode of Output.
Ensures zero-UPL compliance, accurate risk tagging (Red/Amber/Blue), and structured JSON.
"""

from typing import Dict, Any, Optional

CLAIM_SYSTEM_PROMPT = """You are AdjournAID, an educational legal co-pilot designed to help consumers, tenants, and small business owners understand complex contracts.
You must strictly follow the CLAIM framework (Context, Legal Task, Audience, Instructions, Mode of Output).

CRITICAL NON-UPL DIRECTIVE:
You are not an attorney and do not provide legal representation or binding legal advice.
All outputs are strictly informational and educational to prepare the user for consultations with licensed legal counsel.

RISK SEVERITY CLASSIFICATION:
- "RED" (High Risk / Unilateral Liability): Uncapped indemnity, one-sided termination for convenience, forfeiture of security deposit, extreme liquidated damages, non-mutual IP assignments, mandatory binding arbitration in far-flung jurisdictions.
- "AMBER" (Off-Market / Ambiguous): Automatic multi-year renewal without notice, unclear definition of net operating costs, subjective satisfaction clauses, unreasonable interest rates.
- "BLUE" (Standard Boilerplate): Standard severability, force majeure, counterpart execution, customary notice provisions.
"""


def build_risk_review_prompt(doc_fingerprint: str, context_text: str) -> str:
    """Builds CLAIM prompt for Contract Risk Review."""
    return f"""### [C] CONTEXT:
Document Fingerprint: {doc_fingerprint}
Retrieved Contract Clauses:
{context_text}

### [L] LEGAL TASK:
Identify every potential legal risk, predatory clause, unilateral liability, or ambiguous term in the retrieved clauses. Categorize each into RED, AMBER, or BLUE risk level.

### [A] AUDIENCE:
A non-lawyer consumer or business owner who needs plain-English explanations and actionable attorney discussion questions.

### [I] INSTRUCTIONS:
1. For each risk item, identify the exact source clause title or section number.
2. Provide a 1-sentence Plain-English Summary.
3. Detail the legal implication (e.g. why it creates financial or operational exposure).
4. Formulate a specific "Counter-Proposal / Question for Attorney" to help them negotiate.
5. Never invent facts not supported by the contract clauses.

### [M] MODE OF OUTPUT:
Output valid, parseable JSON conforming to this schema:
{{
  "document_summary": "High-level overview of agreement risks",
  "overall_risk_score": 78,
  "risk_items": [
    {{
      "clause_ref": "Section 4.2",
      "clause_title": "Indemnification",
      "risk_level": "RED",
      "summary": "Tenant must pay for all landlord legal fees even if landlord is partly at fault.",
      "implication": "Exposes tenant to uninsurable third-party liabilities and uncapped legal defense costs.",
      "counter_proposal": "Make indemnification strictly mutual and carve out landlord's gross negligence.",
      "target_clause_snippet": "exact snippet of source text"
    }}
  ]
}}
"""


def build_simplification_prompt(doc_fingerprint: str, context_text: str) -> str:
    """Builds CLAIM prompt for Plain-English Simplification."""
    return f"""### [C] CONTEXT:
Document Fingerprint: {doc_fingerprint}
Source Contract Text:
{context_text}

### [L] LEGAL TASK:
Translate dense legalese into clear, 8th-grade reading level plain-English without omitting legal consequences.

### [A] AUDIENCE:
Everyday consumer, tenant, or freelance contractor.

### [I] INSTRUCTIONS:
1. Break down archaic terms (e.g., 'indemnify and hold harmless', 'liquidated damages', 'time is of the essence').
2. Explain "What this means for you in simple terms".
3. Highlight what happens if you violate this section.

### [M] MODE OF OUTPUT:
Output valid JSON:
{{
  "document_type": "Agreement Type",
  "simplified_clauses": [
    {{
      "clause_ref": "Section 8.1",
      "clause_title": "Termination",
      "original_snippet": "...",
      "plain_english": "You can leave with 30 days notice, but the vendor can cancel immediately without reason.",
      "key_takeaway": "One-sided exit terms favor the vendor.",
      "actionable_tip": "Request equal 30-day notice for both parties."
    }}
  ]
}}
"""


def build_redline_prompt(doc_fingerprint: str, context_text: str) -> str:
    """Builds CLAIM prompt for Side-by-Side Redline Counter-Drafts."""
    return f"""### [C] CONTEXT:
Document Fingerprint: {doc_fingerprint}
Clauses for Redlining:
{context_text}

### [L] LEGAL TASK:
Draft balanced, market-standard redlines with strikethrough deletions and underlined additions to protect the non-lawyer party.

### [A] AUDIENCE:
Client negotiating directly or presenting redlines to their retained attorney.

### [I] INSTRUCTIONS:
1. Provide the exact original text.
2. Provide standard commercial counter-language (market standard).
3. Explain the strategic rationale for the change.

### [M] MODE OF OUTPUT:
Output valid JSON:
{{
  "redlines": [
    {{
      "clause_ref": "Section 12.3",
      "clause_title": "Limitation of Liability",
      "original_text": "Company's liability is capped at $50.",
      "proposed_redline": "Company's liability is capped at total fees paid during the preceding 12 months.",
      "rationale": "Replaces nominal $50 cap with industry-standard trailing 12-month fee cap."
    }}
  ]
}}
"""


def build_consultation_brief_prompt(doc_fingerprint: str, context_text: str) -> str:
    """Builds CLAIM prompt for Attorney Consultation Preparation Brief."""
    return f"""### [C] CONTEXT:
Document Fingerprint: {doc_fingerprint}
Contract Clauses:
{context_text}

### [L] LEGAL TASK:
Synthesize an Attorney Consultation Preparation Brief to maximize efficiency and minimize expensive billable hours during an attorney consultation.

### [A] AUDIENCE:
Licensed Attorney reviewing this contract on behalf of the client.

### [I] INSTRUCTIONS:
1. Provide Executive Summary of the Agreement.
2. List Top 3 Critical Red Flags (with clause citations).
3. Draft 5 precise, high-value questions for the client to ask their attorney.
4. Estimate billable hours saved by having this organized brief (e.g., 2.5 hours at $350/hr).
5. Identify negotiation leverage points.

### [M] MODE OF OUTPUT:
Output valid JSON:
{{
  "brief_title": "Attorney Consultation Preparation Brief",
  "client_summary": "Short client-friendly orientation",
  "estimated_hours_saved": "2.0 - 3.5 hours",
  "estimated_cost_savings": "$700 - $1,225 (based on $350/hr)",
  "top_red_flags": [
    {{
      "clause_ref": "Section 9.4",
      "issue": "Unilateral indemnification obligation with no reciprocal protection.",
      "severity": "HIGH",
      "counsel_talking_point": "Ask counsel to insist on standard mutual indemnity."
    }}
  ],
  "questions_for_attorney": [
    "Does the governing law clause (Delaware) create undue litigation burden if our operations are in California?",
    "Can the personal guarantee in Section 15 be limited to the first 12 months?"
  ],
  "client_leverage_points": [
    "Tenant is paying above-market base rent; landlord has incentive to concede boilerplate indemnity."
  ]
}}
"""
