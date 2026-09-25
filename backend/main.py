"""
FastAPI Application Entry Point for the Composio SaaS Research Pipeline.

Assembles all routers, configures CORS, initializes database on startup.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger

from backend.config import get_settings, ensure_directories
from backend.database import init_database
from backend.routers import research, audit, analytics, export


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan — setup and teardown."""
    # Startup
    settings = get_settings()
    logger.info(f"Starting Composio Research Pipeline (mode={settings.agent_mode})")
    logger.info(f"Gemini configured: {settings.is_gemini_configured}")
    logger.info(f"Tavily configured: {settings.is_tavily_configured}")

    if not settings.is_gemini_configured and not settings.is_mock_mode:
        logger.error("CRITICAL: GEMINI_API_KEY is not configured in .env file!")
    if not settings.is_tavily_configured and not settings.is_mock_mode:
        logger.error("CRITICAL: TAVILY_API_KEY is not configured in .env file!")

    ensure_directories()
    await init_database()
    logger.info("Application startup complete")
    yield
    # Shutdown
    logger.info("Application shutting down")


app = FastAPI(
    title="Composio SaaS Research Pipeline",
    description=(
        "AI-powered research pipeline that automatically investigates SaaS applications, "
        "verifies findings, and generates analytics with a professional case study."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers (support both root and /api/v1 paths)
app.include_router(research.router)
app.include_router(audit.router)
app.include_router(analytics.router)
app.include_router(export.router)

app.include_router(research.router, prefix="/api/v1")
app.include_router(audit.router, prefix="/api/v1")
app.include_router(analytics.router, prefix="/api/v1")
app.include_router(export.router, prefix="/api/v1")


@app.get("/")
async def root():
    """Root endpoint."""
    settings = get_settings()
    return {
        "status": "ok",
        "project": "Composio SaaS Research Pipeline",
        "mode": settings.agent_mode,
        "docs": "/docs",
    }


@app.get("/health")
async def health():
    """Detailed health check reporting Gemini and Tavily status."""
    settings = get_settings()
    from backend.database import get_pipeline_stats
    stats = await get_pipeline_stats()
    return {
        "status": "healthy",
        "mode": settings.agent_mode,
        "gemini_configured": settings.is_gemini_configured,
        "tavily_configured": settings.is_tavily_configured,
        "database": stats,
    }
