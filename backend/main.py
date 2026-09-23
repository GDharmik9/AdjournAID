"""
AdjournAID FastAPI Server Entrypoint (📄 Pages: Application Root)
Clean, lightweight ASGI orchestration server mounting API routes,
security headers, CORS, and Zero-Data-Retention (ZDR) lifecycle hooks.
"""

import uuid
import logging
from pathlib import Path
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from starlette.requests import Request
from starlette.responses import Response, FileResponse

from backend.infra.config.env import settings
from backend.delivery.http.routes.api_router import api_router
from backend.use_cases.purge_session import purge_session_use_case

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("AdjournAID")

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

# GZip compression middleware for payload transfer efficiency
app.add_middleware(GZipMiddleware, minimum_size=1000)


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
        "AdjournAID is an educational co-pilot and does not provide legal advice (Non-UPL)."
    )
    response.headers["X-Zero-Data-Retention"] = "enforced"
    response.headers["X-Content-Type-Options"] = "nosniff"
    return response


# Mount Delivery HTTP API routes
app.include_router(api_router)

# Mount static assets and SPA fallback if frontend build exists
dist_candidates = [
    Path(__file__).resolve().parent.parent / "frontend" / "dist",
    Path("/app/frontend/dist"),
    Path("frontend/dist"),
]
frontend_dist = next((p for p in dist_candidates if p.exists() and (p / "index.html").exists()), None)

if frontend_dist:
    assets_dir = frontend_dist / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if full_path.startswith("api/") or full_path in ("docs", "redoc", "openapi.json"):
            return Response(status_code=404)
        file_path = frontend_dist / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(frontend_dist / "index.html")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.HOST, port=settings.PORT)

