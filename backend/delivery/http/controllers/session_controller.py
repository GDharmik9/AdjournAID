"""
HTTP Controller for session management and Zero-Data-Retention (ZDR) purging.
"""

from fastapi import HTTPException
from backend.core.exceptions import SessionNotFoundError
from backend.use_cases.purge_session import purge_session_use_case


class SessionController:
    """Handles HTTP requests for session termination and data erasure."""

    @staticmethod
    def purge_session(session_id: str):
        try:
            return purge_session_use_case.purge_session(session_id)
        except SessionNotFoundError as e:
            raise HTTPException(status_code=404, detail=str(e))
