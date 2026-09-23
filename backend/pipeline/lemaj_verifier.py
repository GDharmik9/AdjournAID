"""
Pipeline LeMAJ Verifier Compatibility Layer.
Re-exports LeMAJVerifier and LegalDataPoint from clean architecture layers.
"""

from backend.core.entities.verification import LegalDataPoint
from backend.services.verifier_service import LeMAJVerifier

__all__ = ["LegalDataPoint", "LeMAJVerifier"]
