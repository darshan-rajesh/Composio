"""
Research API endpoints for the Composio SaaS Research Pipeline.

Endpoints:
- POST /research/start — Start the research pipeline
- POST /research/start-batch — Start research for a specific batch
- GET  /research/status — Get pipeline status
- GET  /research/results — Get all results
- GET  /research/results/{app_name} — Get single app result
- POST /research/load-csv — Load apps from CSV
- POST /research/reset — Reset the database
"""

import csv
import json
import asyncio
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, HTTPException, BackgroundTasks, Query
from loguru import logger

from backend.config import get_settings, DATA_DIR
from backend.models import AppResearchResult, PipelineStatus, ApiResponse
from backend import database as db
from backend.agents.research_agent import get_research_agent
from backend.agents.verification_agent import get_verification_agent
from backend.services.confidence import compute_confidence

router = APIRouter(prefix="/research", tags=["research"])

# Pipeline state (in-memory for simplicity)
_pipeline_state = {
    "phase": "idle",
    "current_app": "",
    "progress": 0,
    "total": 0,
    "errors": [],
}


def _reset_pipeline_state():
    _pipeline_state.update({
        "phase": "idle",
        "current_app": "",
        "progress": 0,
        "total": 0,
        "errors": [],
    })


# ===========================
# Load CSV
# ===========================

@router.post("/load-csv", response_model=ApiResponse)
async def load_csv():
    """Load apps from the CSV file into the database."""
    csv_path = DATA_DIR / "apps.csv"
    if not csv_path.exists():
        raise HTTPException(404, f"CSV not found at {csv_path}")

    with open(csv_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        apps = [
            {"name": row["name"].strip(), "category": row["category"].strip(), "website": row.get("website", "").strip()}
            for row in reader
            if row.get("name", "").strip()
        ]

    count = await db.bulk_insert_apps(apps)
    return ApiResponse(
        success=True,
        message=f"Loaded {count} new apps from CSV ({len(apps)} total in file)",
        data={"loaded": count, "total_in_file": len(apps)},
    )


# ===========================
# Start Research Pipeline
# ===========================

@router.post("/start", response_model=ApiResponse)
async def start_research(
    background_tasks: BackgroundTasks,
    limit: Optional[int] = Query(None, description="Max apps to research (for testing)"),
):
    """Start the full research + verification pipeline."""
    if _pipeline_state["phase"] != "idle":
        raise HTTPException(409, "Pipeline is already running")

    background_tasks.add_task(_run_full_pipeline, limit)
    return ApiResponse(
        success=True,
        message=f"Research pipeline started" + (f" (limit: {limit})" if limit else ""),
    )


@router.post("/start-batch", response_model=ApiResponse)
async def start_batch_research(
    background_tasks: BackgroundTasks,
    batch_size: int = Query(5, description="Number of apps to research"),
    skip_verified: bool = Query(True, description="Skip already verified apps"),
):
    """Start research for a specific batch of pending apps."""
    if _pipeline_state["phase"] != "idle":
        raise HTTPException(409, "Pipeline is already running")

    background_tasks.add_task(_run_batch_pipeline, batch_size, skip_verified)
    return ApiResponse(
        success=True,
        message=f"Batch research started (size: {batch_size})",
    )


async def _run_full_pipeline(limit: Optional[int] = None):
    """Run the complete research + verification pipeline."""
    try:
        _pipeline_state["phase"] = "researching"

        # Get pending apps
        pending = await db.get_apps_by_status("pending")
        if limit:
            pending = pending[:limit]

        if not pending:
            logger.info("No pending apps to research")
            _reset_pipeline_state()
            return

        _pipeline_state["total"] = len(pending)
        apps_list = [{"name": a.app_name, "category": a.category, "website": a.website} for a in pending]

        # Phase 1: Research
        logger.info(f"Starting research for {len(apps_list)} apps")
        agent = get_research_agent()

        async def on_research_progress(app_name, status, current, total):
            _pipeline_state["current_app"] = app_name
            _pipeline_state["progress"] = current

        findings_list = await agent.research_batch(apps_list, on_progress=on_research_progress)

        # Store research results + compute confidence
        for findings in findings_list:
            try:
                findings_dict = findings.model_dump(mode="json")
                await db.update_research(findings.app_name, findings_dict)

                # Compute initial confidence
                breakdown = compute_confidence(findings)
                await db.update_confidence(
                    findings.app_name,
                    breakdown.total,
                    breakdown.model_dump(),
                )
            except Exception as e:
                logger.error(f"Failed to store results for {findings.app_name}: {e}")
                await db.update_status(findings.app_name, "error", str(e))
                _pipeline_state["errors"].append({"app": findings.app_name, "error": str(e)})

        # Phase 2: Verification
        _pipeline_state["phase"] = "verifying"
        logger.info("Starting verification phase")

        researched_apps = await db.get_apps_by_status("researched")
        verification_agent = get_verification_agent()

        apps_with_findings = []
        for app in researched_apps:
            apps_with_findings.append((
                app.app_name,
                {
                    "auth_method": app.auth_method,
                    "access_model": app.access_model,
                    "api_type": app.api_type,
                    "api_breadth": app.api_breadth,
                    "mcp_availability": app.mcp_availability,
                    "buildability_verdict": app.buildability_verdict,
                    "description": app.description,
                },
            ))

        async def on_verify_progress(app_name, status, current, total):
            _pipeline_state["current_app"] = f"Verifying: {app_name}"
            _pipeline_state["progress"] = current

        verifications = await verification_agent.verify_batch(
            apps_with_findings, on_progress=on_verify_progress
        )

        # Store verification results + recompute confidence
        for verification in verifications:
            try:
                corrections = {}
                for fv in verification.field_verifications:
                    if not fv.verified and fv.corrected_value:
                        corrections[fv.field_name] = fv.corrected_value

                await db.update_verification(
                    verification.app_name,
                    {
                        "verification_status": verification.verification_status,
                        "verification_notes": verification.verification_notes,
                        "corrections_made": verification.corrections_made,
                        "corrections": corrections,
                    },
                )

                # Recompute confidence with verification data
                app = await db.get_app(verification.app_name)
                if app:
                    from backend.models import ResearchFindings
                    findings = ResearchFindings(
                        app_name=app.app_name,
                        category=app.category,
                        website=app.website,
                        auth_method=app.auth_method,
                        access_model=app.access_model,
                        api_type=app.api_type,
                        api_breadth=app.api_breadth,
                        mcp_availability=app.mcp_availability,
                        buildability_verdict=app.buildability_verdict,
                        evidence_urls=app.evidence_urls,
                    )
                    breakdown = compute_confidence(findings, verification)
                    await db.update_confidence(
                        app.app_name,
                        breakdown.total,
                        breakdown.model_dump(),
                    )
            except Exception as e:
                logger.error(f"Failed to store verification for {verification.app_name}: {e}")

        _pipeline_state["phase"] = "complete"
        logger.info("Pipeline complete!")

    except Exception as e:
        logger.error(f"Pipeline failed: {e}")
        _pipeline_state["phase"] = "error"
        _pipeline_state["errors"].append({"app": "pipeline", "error": str(e)})
    finally:
        await asyncio.sleep(2)
        _reset_pipeline_state()


async def _run_batch_pipeline(batch_size: int, skip_verified: bool):
    """Run research for a batch of pending apps."""
    try:
        _pipeline_state["phase"] = "researching"

        if skip_verified:
            pending = await db.get_apps_by_status("pending")
        else:
            pending = await db.get_all_apps()
            pending = [a for a in pending if a.status != "verified"]

        batch = pending[:batch_size]
        if not batch:
            logger.info("No apps to process in batch")
            _reset_pipeline_state()
            return

        _pipeline_state["total"] = len(batch)
        apps_list = [{"name": a.app_name, "category": a.category, "website": a.website} for a in batch]

        agent = get_research_agent()

        async def on_progress(app_name, status, current, total):
            _pipeline_state["current_app"] = app_name
            _pipeline_state["progress"] = current

        findings_list = await agent.research_batch(apps_list, on_progress=on_progress)

        for findings in findings_list:
            try:
                findings_dict = findings.model_dump(mode="json")
                await db.update_research(findings.app_name, findings_dict)
                breakdown = compute_confidence(findings)
                await db.update_confidence(findings.app_name, breakdown.total, breakdown.model_dump())
            except Exception as e:
                logger.error(f"Failed to store: {findings.app_name}: {e}")
                await db.update_status(findings.app_name, "error", str(e))

        _pipeline_state["phase"] = "complete"

    except Exception as e:
        logger.error(f"Batch pipeline failed: {e}")
        _pipeline_state["phase"] = "error"
    finally:
        await asyncio.sleep(2)
        _reset_pipeline_state()


# ===========================
# Status & Results
# ===========================

@router.get("/status", response_model=PipelineStatus)
@router.get("/progress", response_model=PipelineStatus)
async def get_status():
    """Get current pipeline status."""
    stats = await db.get_pipeline_stats()
    return PipelineStatus(
        total_apps=stats["total"],
        researched=stats["researched"],
        verified=stats["verified"],
        audited=stats["audited"],
        errors=stats["errors"],
        in_progress=stats["in_progress"],
        current_app=_pipeline_state.get("current_app", ""),
        phase=_pipeline_state.get("phase", "idle"),
    )


@router.get("/results", response_model=list[AppResearchResult])
@router.get("/apps", response_model=list[AppResearchResult])
async def get_results(
    status: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
):
    """Get research results, optionally filtered."""
    if status:
        return await db.get_apps_by_status(status)
    if category:
        return await db.get_apps_by_category(category)
    return await db.get_all_apps()


@router.get("/results/{app_name}", response_model=AppResearchResult)
@router.get("/apps/{app_name}", response_model=AppResearchResult)
async def get_result(app_name: str):
    """Get result for a single app."""
    app = await db.get_app(app_name)
    if not app:
        raise HTTPException(404, f"App '{app_name}' not found")
    return app


@router.post("/reset", response_model=ApiResponse)
async def reset():
    """Reset the database and reload from CSV."""
    await db.reset_database()
    _reset_pipeline_state()
    return ApiResponse(success=True, message="Database reset. Use /load-csv to reload apps.")
