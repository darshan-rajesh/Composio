"""
Case Study HTML Generator for the Composio SaaS Research Pipeline.

Generates a single self-contained HTML page with:
- Embedded Chart.js visualizations
- Complete dataset table
- Methodology and accuracy sections
- Executive summary and insights
"""

import json
from pathlib import Path
from datetime import datetime

from jinja2 import Environment, FileSystemLoader
from loguru import logger

from backend.config import TEMPLATES_DIR, REPORTS_DIR
from backend.models import AnalyticsReport, AppResearchResult
from backend import database as db
from backend.services.analytics import compute_analytics


async def generate_case_study(output_filename: str = "final_report.html") -> str:
    """
    Generate the final HTML case study report.

    Returns:
        Path to the generated HTML file
    """
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    output_path = REPORTS_DIR / output_filename

    # Gather all data
    all_apps = await db.get_all_apps()
    analytics = await compute_analytics()

    # Prepare template context
    context = _build_template_context(all_apps, analytics)

    # Render template
    env = Environment(
        loader=FileSystemLoader(str(TEMPLATES_DIR)),
        autoescape=True,
    )
    template = env.get_template("case_study.html")
    html_content = template.render(**context)

    # Write output
    output_path.write_text(html_content, encoding="utf-8")
    logger.info(f"Case study generated: {output_path}")

    return str(output_path)


def _build_template_context(
    apps: list[AppResearchResult],
    analytics: AnalyticsReport,
) -> dict:
    """Build the template context with all required data."""

    researched = [a for a in apps if a.status in ("researched", "verified", "audited")]
    verified = [a for a in apps if a.status in ("verified", "audited")]
    audited = [a for a in apps if a.audit_status != "Pending"]

    # Serialize distributions for Chart.js
    def dist_to_chart(dist):
        return {
            "labels": [d.label for d in dist],
            "values": [d.count for d in dist],
            "percentages": [d.percentage for d in dist],
        }

    # Prepare app data for table
    table_data = []
    for app in researched:
        table_data.append({
            "name": app.app_name,
            "category": app.category,
            "website": app.website,
            "description": app.description,
            "auth_method": app.auth_method,
            "access_model": app.access_model,
            "api_type": app.api_type,
            "api_breadth": app.api_breadth,
            "mcp_availability": app.mcp_availability,
            "buildability": app.buildability_verdict,
            "main_blocker": app.main_blocker,
            "confidence": round(app.confidence_score, 1),
            "verification_status": app.verification_status,
            "audit_status": app.audit_status,
        })

    # Audit metrics
    audit_metrics = analytics.audit_metrics
    if audit_metrics is None:
        from backend.models import AuditMetrics
        audit_metrics = AuditMetrics()

    return {
        "generated_at": datetime.utcnow().strftime("%B %d, %Y at %H:%M UTC"),
        "total_apps": analytics.total_apps,
        "researched_count": len(researched),
        "verified_count": len(verified),
        "audited_count": len(audited),
        "avg_confidence": analytics.avg_confidence,
        "high_confidence_count": analytics.high_confidence_count,
        "low_confidence_count": analytics.low_confidence_count,

        # Chart data (JSON serialized)
        "auth_chart": json.dumps(dist_to_chart(analytics.auth_distribution)),
        "access_chart": json.dumps(dist_to_chart(analytics.access_distribution)),
        "category_chart": json.dumps(dist_to_chart(analytics.category_distribution)),
        "api_chart": json.dumps(dist_to_chart(analytics.api_type_distribution)),
        "buildability_chart": json.dumps(dist_to_chart(analytics.buildability_distribution)),
        "mcp_chart": json.dumps(dist_to_chart(analytics.mcp_distribution)),
        "blocker_chart": json.dumps(dist_to_chart(analytics.blocker_distribution)),

        # Insights
        "insights": [i.model_dump() for i in analytics.insights],

        # Audit
        "audit_metrics": audit_metrics.model_dump(),

        # Table data
        "table_data": json.dumps(table_data),
        "apps": table_data,
    }


async def export_results_json(output_filename: str = "results.json") -> str:
    """Export all results as JSON."""
    from backend.config import DATA_DIR

    all_apps = await db.get_all_apps()
    data = [a.model_dump(mode="json") for a in all_apps]

    output_path = DATA_DIR / output_filename
    output_path.write_text(
        json.dumps(data, indent=2, default=str),
        encoding="utf-8",
    )

    logger.info(f"Results exported: {output_path}")
    return str(output_path)
