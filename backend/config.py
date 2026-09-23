"""
AdjournAID Backend Configuration Compatibility Shim.
Re-exports from backend.infra.config.env
"""

from backend.infra.config.env import Settings, settings

__all__ = ["Settings", "settings"]
