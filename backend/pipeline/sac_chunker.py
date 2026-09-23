"""
Pipeline SAC Chunker Compatibility Layer.
Re-exports SummaryAugmentedChunker and SACChunk from clean architecture layers.
"""

from backend.core.entities.document import SACChunk
from backend.services.sac_service import SummaryAugmentedChunker

__all__ = ["SACChunk", "SummaryAugmentedChunker"]
