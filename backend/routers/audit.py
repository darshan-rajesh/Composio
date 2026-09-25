"""
Audit API endpoints for the Composio SaaS Research Pipeline.

Endpoints:
- POST /audit/generate-sample — Generate audit sample
- POST /audit/submit — Submit audit result
- GET  /audit/metrics — Get audit accuracy metrics
"""

from fastapi import APIRouter, Query
from loguru import logger

from backend.models import AuditSubmission, AuditSample, AuditMetrics, ApiResponse
from backend.services.audit import (
    generate_audit_sample,
    submit_audit,
    compute_audit_metrics,
)

router = APIRouter(prefix="/audit", tags=["audit"])


@router.post("/generate-sample", response_model=AuditSample)
@router.get("/sample", response_model=AuditSample)
@router.post("/sample", response_model=AuditSample)
async def create_audit_sample(
    sample_size: int = Query(12, ge=1, le=30),
    stratified: bool = Query(True),
):
    """Generate a random sample of apps for human audit."""
    return await generate_audit_sample(sample_size, stratified)


@router.post("/submit", response_model=ApiResponse)
@router.post("/submit/{app_id}", response_model=ApiResponse)
async def submit_audit_result(submission: AuditSubmission):
    """Submit a human audit result for an app."""
    success = await submit_audit(submission)
    if success:
        return ApiResponse(success=True, message=f"Audit submitted for {submission.app_name}")
    return ApiResponse(success=False, message="Failed to submit audit")


@router.get("/metrics", response_model=AuditMetrics)
async def get_audit_metrics():
    """Get accuracy metrics from human audit results."""
    return await compute_audit_metrics()
