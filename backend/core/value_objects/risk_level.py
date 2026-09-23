from enum import Enum


class RiskLevel(str, Enum):
    """
    Value Object representing contractual risk severity.
    """
    RED = "RED"       # High Risk / Unilateral Terms / Aggressive Defaults
    AMBER = "AMBER"   # Off-Market / Requires Counsel Review
    BLUE = "BLUE"     # Standard Boilerplate / Balanced Terms

    @classmethod
    def from_str(cls, value: str) -> "RiskLevel":
        try:
            return cls[value.upper()]
        except (KeyError, AttributeError):
            return cls.BLUE
