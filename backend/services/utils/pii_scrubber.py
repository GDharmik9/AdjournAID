import re

# HIPAA Safe Harbor 18 Identifiers Regex Matchers
REGEX_PATTERNS = {
    "SSN": re.compile(r"\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b"),
    "PHONE": re.compile(r"\b(?:\+?1[-.\s]?)?\(?[2-9]\d{2}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b"),
    "EMAIL": re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b"),
    "DATE_OF_BIRTH": re.compile(r"\b(?:DOB|Date of Birth|born)[:\s]+(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b", re.IGNORECASE),
    "CREDIT_CARD": re.compile(r"\b(?:\d{4}[- ]?){3}\d{4}\b"),
    "MEDICAL_RECORD": re.compile(r"\b(?:MRN|Patient ID|Medical Record)[:\s]+[A-Z0-9-]+\b", re.IGNORECASE),
}


def scrub_pii_phi(text: str) -> str:
    """
    Applies HIPAA Safe Harbor de-identification to scrub identifiers
    before indexing in ephemeral vector storage.
    """
    scrubbed = text
    scrubbed = REGEX_PATTERNS["SSN"].sub("[REDACTED_SSN]", scrubbed)
    scrubbed = REGEX_PATTERNS["PHONE"].sub("[REDACTED_PHONE]", scrubbed)
    scrubbed = REGEX_PATTERNS["EMAIL"].sub("[REDACTED_EMAIL]", scrubbed)
    scrubbed = REGEX_PATTERNS["DATE_OF_BIRTH"].sub("[REDACTED_DOB]", scrubbed)
    scrubbed = REGEX_PATTERNS["CREDIT_CARD"].sub("[REDACTED_FINANCIAL_ID]", scrubbed)
    scrubbed = REGEX_PATTERNS["MEDICAL_RECORD"].sub("[REDACTED_MRN]", scrubbed)
    return scrubbed
