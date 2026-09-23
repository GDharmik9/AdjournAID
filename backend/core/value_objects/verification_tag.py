from enum import Enum


class VerificationTag(str, Enum):
    """
    Value Object representing LeMAJ Atomic Legal Data Point fact-checking tags.
    """
    CORRECT = "<Correct>"       # Statement is directly grounded and verified by source text
    INCORRECT = "<Incorrect>"   # Statement contradicts or misrepresents source text
    IRRELEVANT = "<Irrelevant>" # Statement cannot be supported by any retrieved clause
