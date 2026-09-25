"""
Export API endpoints for the Composio SaaS Research Pipeline.

Endpoints:
- POST /export/case-study — Generate HTML case study
- POST /export/json — Export results as JSON
- GET  /export/download/{filename} — Download generated reports
"""

from pathlib import Path

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from loguru import logger

from backend.config import REPORTS_DIR, DATA_DIR
from backend.models import ApiResponse
from backend.services.case_study import generate_case_study, export_results_json

router = APIRouter(prefix="/export", tags=["export"])


@router.post("/case-study", response_model=ApiResponse)
async def create_case_study():
    """Generate the HTML case study report."""
    try:
        path = await generate_case_study()
        return ApiResponse(
            success=True,
            message=f"Case study generated at {path}",
            data={"path": path},
        )
    except Exception as e:
        logger.error(f"Case study generation failed: {e}")
        return ApiResponse(success=False, message=f"Failed: {str(e)}")


@router.post("/json", response_model=ApiResponse)
async def export_json():
    """Export all results as JSON."""
    try:
        path = await export_results_json()
        return ApiResponse(
            success=True,
            message=f"Results exported to {path}",
            data={"path": path},
        )
    except Exception as e:
        logger.error(f"JSON export failed: {e}")
        return ApiResponse(success=False, message=f"Failed: {str(e)}")


@router.get("/download/report")
async def download_report():
    """Download the generated case study HTML."""
    path = REPORTS_DIR / "final_report.html"
    if not path.exists():
        raise HTTPException(404, "Report not generated yet. Use POST /export/case-study first.")
    return FileResponse(path, filename="composio_case_study.html", media_type="text/html")


@router.get("/download/results")
async def download_results():
    """Download the results JSON."""
    path = DATA_DIR / "results.json"
    if not path.exists():
        raise HTTPException(404, "Results not exported yet. Use POST /export/json first.")
    return FileResponse(path, filename="results.json", media_type="application/json")
