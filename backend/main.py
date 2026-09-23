"""
AdjournAI FastAPI Server Entrypoint (📄 Pages: Application Root)
Clean, lightweight ASGI orchestration server mounting API routes,
security headers, CORS, and Zero-Data-Retention (ZDR) lifecycle hooks.
"""

import uuid
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.requests import Request
from starlette.responses import Response

from backend.infra.config.env import settings
from backend.delivery.http.routes.api_router import api_router
from backend.use_cases.purge_session import purge_session_use_case

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("AdjournAI")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="Democratized GenAI Legal Navigation & Contract Comprehension Platform",
)

# Cross-Origin Resource Sharing (CORS) for Vite frontend and client apps
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_security_and_audit_headers(request: Request, call_next):
    """
    Enforces enterprise correlation IDs, security headers, and non-UPL legal disclaimers.
    Also executes lazy Zero-Data-Retention (ZDR) TTL cleanup of expired sessions.
    """
    correlation_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
    purge_session_use_case.cleanup_expired(max_idle_seconds=1800)

    response: Response = await call_next(request)
    response.headers["X-Request-ID"] = correlation_id
    response.headers["X-Legal-Disclaimer"] = (
        "AdjournAI is an educational co-pilot and does not provide legal advice (Non-UPL)."
    )
    response.headers["X-Zero-Data-Retention"] = "enforced"
    response.headers["X-Content-Type-Options"] = "nosniff"
    return response


# Mount Delivery HTTP API routes
app.include_router(api_router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.HOST, port=settings.PORT)
