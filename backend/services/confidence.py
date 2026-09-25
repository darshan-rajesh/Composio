"""
Confidence Scoring Engine for the Composio SaaS Research Pipeline.

Computes a 0-100 confidence score based on:
- Evidence quality (official docs, multiple sources)
- Field verification status
- Penalties for unknowns and contradictions

Scoring breakdown:
  +30  Official docs found
  +20  Auth method verified
  +20  API type verified
  +15  MCP status verified
  +15  Multiple corroborating sources
  -10  per "Unknown" field
  -15  no official docs
  -10  per contradicted field
"""

from loguru import logger

from backend.models import (
    ResearchFindings,
    VerificationResult,
    ConfidenceBreakdown,
)


def compute_confidence(
    findings: ResearchFindings,
    verification: VerificationResult = None,
) -> ConfidenceBreakdown:
    """
    Compute confidence score for research findings.

    Args:
        findings: The research findings to score
        verification: Optional verification results to factor in

    Returns:
        ConfidenceBreakdown with itemized scoring
    """
    breakdown = ConfidenceBreakdown()

    # ---- Evidence quality ----

    # +30 for official documentation found
    evidence_urls = findings.evidence_urls or []
    has_official_docs = any(
        _is_official_doc(url, findings.app_name) for url in evidence_urls
    )
    if has_official_docs:
        breakdown.official_docs_found = 30.0
    elif len(evidence_urls) > 0:
        breakdown.official_docs_found = 15.0  # Some docs, but not official
    else:
        breakdown.official_docs_found = 0.0

    # +15 for multiple corroborating sources
    if len(evidence_urls) >= 3:
        breakdown.multiple_sources = 15.0
    elif len(evidence_urls) >= 2:
        breakdown.multiple_sources = 10.0
    elif len(evidence_urls) == 1:
        breakdown.multiple_sources = 5.0

    # ---- Field verification ----

    # +20 for auth verified
    if findings.auth_method != "Unknown":
        breakdown.auth_verified = 15.0
        if verification and _is_field_verified(verification, "auth_method"):
            breakdown.auth_verified = 20.0
    else:
        breakdown.auth_verified = 0.0

    # +20 for API verified
    if findings.api_type != "Unknown":
        breakdown.api_verified = 15.0
        if verification and _is_field_verified(verification, "api_type"):
            breakdown.api_verified = 20.0
    else:
        breakdown.api_verified = 0.0

    # +15 for MCP verified
    if findings.mcp_availability != "Unknown":
        breakdown.mcp_verified = 10.0
        if verification and _is_field_verified(verification, "mcp_availability"):
            breakdown.mcp_verified = 15.0
    else:
        breakdown.mcp_verified = 0.0

    # ---- Penalties ----

    penalties = 0.0

    # Count unknown fields
    unknown_count = _count_unknowns(findings)
    penalties -= unknown_count * 5.0  # -5 per unknown field

    # No official docs penalty
    if not has_official_docs and len(evidence_urls) == 0:
        penalties -= 15.0

    # Verification contradictions
    if verification:
        contradicted = sum(
            1 for fv in verification.field_verifications
            if not fv.verified and fv.corrected_value is not None
        )
        penalties -= contradicted * 8.0

    breakdown.penalties = penalties

    # ---- Total ----
    raw_total = (
        breakdown.official_docs_found
        + breakdown.auth_verified
        + breakdown.api_verified
        + breakdown.mcp_verified
        + breakdown.multiple_sources
        + breakdown.penalties
    )

    breakdown.total = max(0.0, min(100.0, raw_total))

    logger.debug(
        f"Confidence for {findings.app_name}: {breakdown.total:.0f} "
        f"(docs={breakdown.official_docs_found}, auth={breakdown.auth_verified}, "
        f"api={breakdown.api_verified}, mcp={breakdown.mcp_verified}, "
        f"sources={breakdown.multiple_sources}, penalties={breakdown.penalties})"
    )

    return breakdown


def _is_official_doc(url: str, app_name: str) -> bool:
    """Check if a URL looks like an official documentation page."""
    url_lower = url.lower()
    app_lower = app_name.lower().replace(" ", "")

    # Check for official doc patterns
    official_patterns = [
        f"developer.{app_lower}",
        f"docs.{app_lower}",
        f"api.{app_lower}",
        f"{app_lower}.com/docs",
        f"{app_lower}.com/api",
        f"{app_lower}.com/developer",
        f"{app_lower}.io/docs",
        f"{app_lower}.io/api",
    ]

    return any(pattern in url_lower for pattern in official_patterns)


def _is_field_verified(verification: VerificationResult, field_name: str) -> bool:
    """Check if a specific field was verified by the verification agent."""
    for fv in verification.field_verifications:
        if fv.field_name == field_name:
            return fv.verified
    return False


def _count_unknowns(findings: ResearchFindings) -> int:
    """Count the number of fields set to 'Unknown'."""
    count = 0
    fields = [
        findings.auth_method, findings.access_model, findings.api_type,
        findings.api_breadth, findings.mcp_availability, findings.buildability_verdict,
    ]
    for field in fields:
        if str(field).lower() == "unknown":
            count += 1
    return count
