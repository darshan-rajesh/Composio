"""
Human Audit Module for the Composio SaaS Research Pipeline.

Handles:
- Stratified random sampling of apps for manual review
- Tracking audit submissions (Correct / Incorrect / Needs Review)
- Computing accuracy metrics (first-pass, post-verification, error breakdown)
"""

import random
from collections import Counter
from typing import Optional

from loguru import logger

from backend.models import (
    AppResearchResult,
    AuditSubmission,
    AuditSample,
    AuditMetrics,
)
from backend import database as db


async def generate_audit_sample(
    sample_size: int = 12,
    stratified: bool = True,
) -> AuditSample:
    """
    Generate a sample of apps for human audit.

    Args:
        sample_size: Number of apps to sample (10-15 recommended)
        stratified: If True, ensures representation across categories

    Returns:
        AuditSample with selected apps
    """
    all_apps = await db.get_all_apps()
    eligible = [a for a in all_apps if a.status in ("researched", "verified") and a.audit_status == "Pending"]

    if not eligible:
        logger.warning("No eligible apps for audit sampling")
        return AuditSample(sample_size=0, apps=[], sampling_method="none")

    sample_size = min(sample_size, len(eligible))

    if stratified:
        sample = _stratified_sample(eligible, sample_size)
        method = "stratified_random"
    else:
        sample = random.sample(eligible, sample_size)
        method = "simple_random"

    logger.info(f"Generated audit sample: {len(sample)} apps ({method})")
    return AuditSample(
        sample_size=len(sample),
        apps=sample,
        sampling_method=method,
    )


def _stratified_sample(apps: list[AppResearchResult], n: int) -> list[AppResearchResult]:
    """Sample proportionally from each category."""
    by_category: dict[str, list[AppResearchResult]] = {}
    for app in apps:
        by_category.setdefault(app.category, []).append(app)

    # Calculate per-category allocation
    total = len(apps)
    sample = []
    remaining = n

    categories = sorted(by_category.keys())
    for i, cat in enumerate(categories):
        cat_apps = by_category[cat]
        # Proportional allocation, at least 1 per category
        if i == len(categories) - 1:
            cat_n = remaining
        else:
            cat_n = max(1, round(len(cat_apps) / total * n))
            cat_n = min(cat_n, remaining, len(cat_apps))

        sampled = random.sample(cat_apps, min(cat_n, len(cat_apps)))
        sample.extend(sampled)
        remaining -= len(sampled)

        if remaining <= 0:
            break

    return sample[:n]


async def submit_audit(submission: AuditSubmission) -> bool:
    """
    Submit a human audit result for an app.

    Args:
        submission: The audit submission with status and corrections

    Returns:
        True if successful
    """
    try:
        await db.update_audit(
            app_name=submission.app_name,
            audit_status=submission.audit_status.value,
            notes=submission.notes,
            corrections=submission.corrections if submission.corrections else None,
        )
        logger.info(f"Audit submitted for {submission.app_name}: {submission.audit_status.value}")
        return True
    except Exception as e:
        logger.error(f"Failed to submit audit for {submission.app_name}: {e}")
        return False


async def compute_audit_metrics() -> AuditMetrics:
    """
    Compute accuracy metrics from all audit submissions.

    Returns:
        AuditMetrics with accuracy rates and error breakdown
    """
    all_apps = await db.get_all_apps()
    audited = [a for a in all_apps if a.audit_status != "Pending"]

    if not audited:
        return AuditMetrics()

    total = len(audited)
    correct = sum(1 for a in audited if a.audit_status == "Correct")
    incorrect = sum(1 for a in audited if a.audit_status == "Incorrect")
    needs_review = sum(1 for a in audited if a.audit_status == "Needs Review")

    # First-pass accuracy: percentage marked correct out of total audited
    first_pass_accuracy = (correct / total * 100) if total > 0 else 0

    # Post-verification accuracy: consider "Needs Review" as partially correct
    post_verification_accuracy = ((correct + needs_review * 0.5) / total * 100) if total > 0 else 0

    # Error breakdown by category
    error_breakdown = Counter()
    for app in audited:
        if app.audit_status == "Incorrect":
            error_breakdown[app.category] += 1

    metrics = AuditMetrics(
        total_audited=total,
        correct_count=correct,
        incorrect_count=incorrect,
        needs_review_count=needs_review,
        first_pass_accuracy=round(first_pass_accuracy, 1),
        post_verification_accuracy=round(post_verification_accuracy, 1),
        error_breakdown=dict(error_breakdown),
    )

    logger.info(
        f"Audit metrics: {total} audited, "
        f"accuracy={first_pass_accuracy:.1f}% first-pass, "
        f"{post_verification_accuracy:.1f}% post-verification"
    )

    return metrics
