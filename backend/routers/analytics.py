"""
Analytics API endpoints for the Composio SaaS Research Pipeline.
"""

from fastapi import APIRouter
from loguru import logger

from backend.models import AnalyticsReport
from backend.services.analytics import compute_analytics

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/report", response_model=AnalyticsReport)
async def get_analytics_report():
    """Get the full analytics report with distributions and insights."""
    return await compute_analytics()


@router.get("/overview")
async def get_overview():
    """Get high-level summary overview metrics for the dashboard KPI cards."""
    report = await compute_analytics()
    return {
        "total_apps": report.total_apps,
        "completed_count": report.total_apps - report.low_confidence_count if report.total_apps else 0,
        "verified_count": report.high_confidence_count,
        "avg_confidence": report.avg_confidence,
        "high_confidence_count": report.high_confidence_count,
        "low_confidence_count": report.low_confidence_count,
    }


@router.get("/auth-distribution")
async def get_auth_distribution():
    """Get authentication method frequency distribution."""
    report = await compute_analytics()
    return [d.model_dump() for d in report.auth_distribution]


@router.get("/mcp-stats")
async def get_mcp_stats():
    """Get MCP readiness and availability stats."""
    report = await compute_analytics()
    return [d.model_dump() for d in report.mcp_distribution]


@router.get("/categories")
async def get_categories():
    """Get category distribution."""
    report = await compute_analytics()
    return [d.model_dump() for d in report.category_distribution]


@router.get("/confidence-distribution")
async def get_confidence_distribution():
    """Get confidence breakdown distribution."""
    report = await compute_analytics()
    return {
        "avg_confidence": report.avg_confidence,
        "high_confidence_count": report.high_confidence_count,
        "low_confidence_count": report.low_confidence_count,
    }


@router.get("/distributions")
async def get_distributions():
    """Get distribution data for charts."""
    report = await compute_analytics()
    return {
        "auth": [d.model_dump() for d in report.auth_distribution],
        "access": [d.model_dump() for d in report.access_distribution],
        "category": [d.model_dump() for d in report.category_distribution],
        "api_type": [d.model_dump() for d in report.api_type_distribution],
        "buildability": [d.model_dump() for d in report.buildability_distribution],
        "mcp": [d.model_dump() for d in report.mcp_distribution],
        "blockers": [d.model_dump() for d in report.blocker_distribution],
    }


@router.get("/insights")
async def get_insights():
    """Get generated insights only."""
    report = await compute_analytics()
    return {
        "insights": [i.model_dump() for i in report.insights],
        "total_apps": report.total_apps,
        "avg_confidence": report.avg_confidence,
    }
