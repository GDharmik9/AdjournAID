import re
from backend.services.utils.pii_scrubber import scrub_pii_phi

# Adversarial Prompt Injection Defense Patterns
PROMPT_INJECTION_PATTERNS = [
    re.compile(r"(?i)\b(?:ignore|disregard|forget|bypass)\s+(?:all\s+)?(?:prior|previous|above|system)\s+(?:instructions|rules|prompts|directives)\b"),
    re.compile(r"(?i)\[\s*(?:system|assistant|instruction|override)\s*:[^\]]*\]"),
    re.compile(r"(?i)<\s*(?:system|instruction|admin)\s*>.*?<\s*/\s*(?:system|instruction|admin)\s*>"),
    re.compile(r"(?i)\b(?:you\s+are\s+now|act\s+as)\s+(?:an?\s+unrestricted|a\s+different|a\s+hacked)\b"),
]


def scrub_prompt_injections(text: str) -> str:
    """
    Neutralizes indirect prompt injection attempts embedded in legal contracts
    to ensure safe AI execution without overriding system instructions.
    """
    sanitized = text
    for pattern in PROMPT_INJECTION_PATTERNS:
        sanitized = pattern.sub("[NEUTRALIZED_PROMPT_INJECTION_ATTEMPT]", sanitized)
    return sanitized


def sanitize_document_text(text: str, scrub_pii: bool = True) -> str:
    """Combines prompt injection defense and HIPAA Safe Harbor de-identification."""
    cleaned = scrub_prompt_injections(text)
    if scrub_pii:
        cleaned = scrub_pii_phi(cleaned)
    return cleaned
