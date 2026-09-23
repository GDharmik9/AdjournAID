from typing import Optional, Any


class AdjournAIDException(Exception):
    """Base domain exception for AdjournAID."""
    def __init__(self, message: str, status_code: int = 400):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


class SessionNotFoundError(AdjournAIDException):
    def __init__(self, message_or_id: str):
        if " " in message_or_id:
            msg = message_or_id
        else:
            msg = f"Document session '{message_or_id}' not found or has been purged."
        super().__init__(msg, status_code=404)


class DocumentParsingError(AdjournAIDException):
    def __init__(self, detail: str):
        if detail.startswith("Failed to parse document:"):
            msg = detail
        else:
            msg = f"Failed to parse document: {detail}"
        super().__init__(msg, status_code=400)


class FileTooLargeError(AdjournAIDException):
    def __init__(self, message_or_size: Any = "Uploaded file exceeds maximum security limit of 10 MB.", limit_mb: Optional[int] = None):
        if limit_mb is not None:
            msg = f"Uploaded content ({message_or_size} MB) exceeds maximum security limit of {limit_mb} MB."
        else:
            msg = str(message_or_size)
        super().__init__(msg, status_code=413)


class SampleNotFoundError(AdjournAIDException):
    def __init__(self, sample_id: str):
        if " " in sample_id:
            msg = sample_id
        else:
            msg = f"Sample contract '{sample_id}' not found."
        super().__init__(msg, status_code=404)
