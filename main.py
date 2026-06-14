"""SimpleTunning Backend - FastAPI entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path

from app.api import pipeline as pipeline_api
from app.ws import pipeline_ws
from app.core.config import settings

app = FastAPI(
    title="SimpleTunning API",
    version="0.1.0",
    description="ISP Algorithm Tuning Platform Backend",
)

# CORS - allow local frontend dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# REST API routes
app.include_router(pipeline_api.router, prefix="/api/pipeline", tags=["pipeline"])
app.include_router(pipeline_api.router_nodes, prefix="/api/nodes", tags=["nodes"])

# WebSocket routes
app.include_router(pipeline_ws.router, tags=["websocket"])


@app.get("/api/health")
async def health():
    return {"status": "ok", "mode": settings.mode}


# Serve static frontend in production/local mode
frontend_path = Path(__file__).parent.parent / "frontend" / "dist"
if frontend_path.exists():
    app.mount("/assets", StaticFiles(directory=frontend_path / "assets"), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        """Serve React SPA for all non-API routes."""
        file_path = frontend_path / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(frontend_path / "index.html")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
