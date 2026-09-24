"""
AdjournAID Infrastructure Configuration (The Plugs)
Manages environment variables, constants, and Zero-Data-Retention (ZDR) directories.
"""

import os
from pathlib import Path
from pydantic import BaseModel

try:
    from dotenv import load_dotenv
    # Load .env from backend directory or project root
    load_dotenv(Path(__file__).resolve().parent.parent.parent / ".env")
    load_dotenv(Path(__file__).resolve().parent.parent.parent.parent / ".env")
except ImportError:
    pass

BASE_DIR = Path(__file__).resolve().parent.parent.parent
PROJECT_ROOT = BASE_DIR.parent


class Settings(BaseModel):
    # App Information
    APP_NAME: str = "AdjournAID"
    VERSION: str = "1.0.0"
    DEBUG: bool = os.getenv("DEBUG", "False").lower() in ("true", "1")

    # Server Settings (Docker/Cloud Run container standard binding)
    HOST: str = os.getenv("HOST", "0.0.0.0")  # nosec B104
    PORT: int = int(os.getenv("PORT", "8000"))

    # Summary-Augmented Chunking (SAC) Parameters
    FINGERPRINT_MAX_CHARS: int = 150  # 150-char document fingerprint
    CHILD_CHUNK_SIZE: int = 500       # 500-char child chunk target size
    CHILD_CHUNK_OVERLAP: int = 60     # Character overlap for continuity
    AUTO_MERGE_SIBLING_THRESHOLD: int = 2  # Merge into parent section if >= 2 chunks match

    # Verification (LeMAJ) Parameters
    LEMAJ_GROUNDED_THRESHOLD: float = 0.85  # >= 85% LDP support -> "Verified Grounded"

    # Hybrid Inference Configuration
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "fallback")
    
    # Google Cloud & Vertex AI Settings (Concept B)
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GOOGLE_CLOUD_PROJECT: str = os.getenv("GOOGLE_CLOUD_PROJECT", "")
    GOOGLE_CLOUD_LOCATION: str = os.getenv("GOOGLE_CLOUD_LOCATION", "us-central1")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

    # Local Air-Gapped SaulLM-7B Settings (Concept A)
    SAULLM_API_URL: str = os.getenv("SAULLM_API_URL", "http://localhost:8000/v1")
    SAULLM_MODEL_NAME: str = os.getenv("SAULLM_MODEL_NAME", "Equall/Saul-7B-Instruct-v1")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")

    # Security & Zero-Data-Retention (ZDR)
    ENABLE_PII_SCRUBBING: bool = True
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10 MB limit
    ZDR_IDLE_TTL_SECONDS: int = 1800         # 30-minute session expiration
    EPHEMERAL_STORAGE_DIR: Path = BASE_DIR / "ephemeral_sessions"


settings = Settings()
settings.EPHEMERAL_STORAGE_DIR.mkdir(parents=True, exist_ok=True)
