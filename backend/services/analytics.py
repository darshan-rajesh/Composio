"""
Analytics Engine for the Composio SaaS Research Pipeline.

Computes:
- Distribution breakdowns (auth, access, API, MCP, buildability, blockers)
- Category-level analysis
- Strategic insights via LLM or rule-based fallback
"""

import json
from collections import Counter
from typing import Optional

from openai import AsyncOpenAI
from loguru import logger

from backend.config import get_settings
from backend.models import (
    AppResearchResult,
    AnalyticsReport,
    DistributionItem,
    InsightItem,
    AuditMetrics,
)
from backend.agents.prompts import INSIGHTS_SYSTEM_PROMPT, INSIGHTS_USER_PROMPT
from backend import database as db
from backend.services.audit import compute_audit_metrics


def _compute_distribution(values: list[str]) -> list[DistributionItem]:
    """Compute a frequency distribution from a list of values."""
    counter = Counter(values)
    total = len(values) if values else 1
    return sorted(
        [
            DistributionItem(
                label=label,
                count=count,
                percentage=round(count / total * 100, 1),
            )
            for label, count in counter.items()
        ],
        key=lambda x: x.count,
        reverse=True,
    )


async def compute_analytics() -> AnalyticsReport:
    """
    Compute full analytics from all research results.

    Returns:
        AnalyticsReport with distributions and insights
    """
    all_apps = await db.get_all_apps()

    if not all_apps:
        return AnalyticsReport()

    # Filter to researched apps
    apps = [a for a in all_apps if a.status in ("researched", "verified", "audited")]

    if not apps:
        return AnalyticsReport(total_apps=len(all_apps))

    total = len(apps)
    confidences = [a.confidence_score for a in apps]
    avg_confidence = sum(confidences) / len(confidences) if confidences else 0

    report = AnalyticsReport(
        total_apps=total,
        avg_confidence=round(avg_confidence, 1),
        high_confidence_count=sum(1 for c in confidences if c >= 70),
        low_confidence_count=sum(1 for c in confidences if c < 40),
        auth_distribution=_compute_distribution([a.auth_method for a in apps]),
        access_distribution=_compute_distribution([a.access_model for a in apps]),
        category_distribution=_compute_distribution([a.category for a in apps]),
        api_type_distribution=_compute_distribution([a.api_type for a in apps]),
        buildability_distribution=_compute_distribution([a.buildability_verdict for a in apps]),
        mcp_distribution=_compute_distribution([a.mcp_availability for a in apps]),
        blocker_distribution=_compute_distribution([a.main_blocker for a in apps if a.main_blocker != "None identified"]),
    )

    # Compute audit metrics if available
    try:
        report.audit_metrics = await compute_audit_metrics()
    except Exception as e:
        logger.warning(f"Failed to compute audit metrics: {e}")

    # Generate insights
    report.insights = await _generate_insights(report, apps)

    return report


async def _generate_insights(
    report: AnalyticsReport,
    apps: list[AppResearchResult],
) -> list[InsightItem]:
    """
    Generate strategic insights.
    Uses LLM in live mode, rule-based fallback in mock mode.
    """
    settings = get_settings()

    if settings.is_mock_mode:
        return _generate_rule_based_insights(report, apps)

    try:
        return await _generate_llm_insights(report)
    except Exception as e:
        logger.warning(f"LLM insights failed, falling back to rules: {e}")
        return _generate_rule_based_insights(report, apps)


async def _generate_llm_insights(report: AnalyticsReport) -> list[InsightItem]:
    """Generate insights via LLM."""
    settings = get_settings()
    client = AsyncOpenAI(
        api_key=settings.llm_api_key,
        base_url=settings.llm_base_url,
    )

    def _dist_to_str(dist: list[DistributionItem]) -> str:
        return ", ".join(f"{d.label}: {d.count} ({d.percentage}%)" for d in dist[:8])

    prompt = INSIGHTS_USER_PROMPT.format(
        total_apps=report.total_apps,
        auth_dist=_dist_to_str(report.auth_distribution),
        access_dist=_dist_to_str(report.access_distribution),
        api_dist=_dist_to_str(report.api_type_distribution),
        build_dist=_dist_to_str(report.buildability_distribution),
        mcp_dist=_dist_to_str(report.mcp_distribution),
        category_dist=_dist_to_str(report.category_distribution),
        blocker_dist=_dist_to_str(report.blocker_distribution),
        avg_confidence=report.avg_confidence,
        high_conf=report.high_confidence_count,
        low_conf=report.low_confidence_count,
    )

    response = await client.chat.completions.create(
        model=settings.llm_model,
        messages=[
            {"role": "system", "content": INSIGHTS_SYSTEM_PROMPT},
            {"role": "user", "content": prompt},
        ],
        temperature=0.3,
        max_tokens=3000,
    )

    content = response.choices[0].message.content.strip()
    if content.startswith("```"):
        content = content.split("```")[1]
        if content.startswith("json"):
            content = content[4:]
        content = content.strip()

    data = json.loads(content)
    return [InsightItem(**i) for i in data.get("insights", [])]


def _generate_rule_based_insights(
    report: AnalyticsReport,
    apps: list[AppResearchResult],
) -> list[InsightItem]:
    """Generate insights using deterministic rules when LLM is unavailable."""
    insights = []

    # 1. Auth dominance
    if report.auth_distribution:
        top_auth = report.auth_distribution[0]
        insights.append(InsightItem(
            title=f"{top_auth.label} Dominates Authentication",
            description=f"{top_auth.label} is the most common authentication method, used by {top_auth.percentage}% of apps ({top_auth.count}/{report.total_apps}). This suggests integration toolkits should prioritize {top_auth.label} support above all other auth methods.",
            category="auth",
            data_point=f"{top_auth.percentage}%",
        ))

    # 2. Self-serve accessibility
    if report.access_distribution:
        self_serve = next((d for d in report.access_distribution if d.label == "Self-Serve"), None)
        if self_serve:
            insights.append(InsightItem(
                title="Majority of APIs are Self-Serve Accessible",
                description=f"{self_serve.percentage}% of apps offer self-serve API access, meaning integration builders can start immediately without sales processes. This represents a large addressable surface for automated integration tools.",
                category="access",
                data_point=f"{self_serve.count} apps",
            ))

    # 3. API type landscape
    if report.api_type_distribution:
        rest_apis = next((d for d in report.api_type_distribution if d.label == "REST"), None)
        if rest_apis:
            insights.append(InsightItem(
                title="REST APIs are the Universal Standard",
                description=f"{rest_apis.percentage}% of apps use REST APIs, confirming that any integration toolkit must prioritize REST support. GraphQL adoption remains niche but growing.",
                category="trend",
                data_point=f"{rest_apis.percentage}%",
            ))

    # 4. MCP gaps
    if report.mcp_distribution:
        mcp_no = next((d for d in report.mcp_distribution if d.label == "No"), None)
        mcp_unknown = next((d for d in report.mcp_distribution if d.label == "Unknown"), None)
        no_mcp_count = (mcp_no.count if mcp_no else 0) + (mcp_unknown.count if mcp_unknown else 0)
        insights.append(InsightItem(
            title="MCP Adoption Remains Early Stage",
            description=f"{no_mcp_count} out of {report.total_apps} apps lack confirmed MCP support, representing a massive opportunity for platforms like Composio to bridge this gap and provide MCP servers for popular tools.",
            category="mcp",
            data_point=f"{no_mcp_count} apps without MCP",
        ))

    # 5. Buildability
    if report.buildability_distribution:
        high_build = next((d for d in report.buildability_distribution if d.label == "High"), None)
        if high_build:
            insights.append(InsightItem(
                title="Significant Integration Opportunity",
                description=f"{high_build.count} apps ({high_build.percentage}%) are rated with High buildability, indicating well-documented APIs and accessible authentication. These are the low-hanging fruit for expanding integration coverage.",
                category="buildability",
                data_point=f"{high_build.count} apps",
            ))

    # 6. Category analysis
    category_buildability = {}
    for app in apps:
        cat = app.category
        if cat not in category_buildability:
            category_buildability[cat] = {"high": 0, "total": 0}
        category_buildability[cat]["total"] += 1
        if app.buildability_verdict == "High":
            category_buildability[cat]["high"] += 1

    easiest_cat = max(
        category_buildability.items(),
        key=lambda x: x[1]["high"] / max(x[1]["total"], 1),
        default=None,
    )
    if easiest_cat:
        cat_name, stats = easiest_cat
        pct = round(stats["high"] / max(stats["total"], 1) * 100)
        insights.append(InsightItem(
            title=f"{cat_name} is the Easiest Category to Integrate",
            description=f"{pct}% of {cat_name} apps have High buildability. This category should be prioritized for quick integration wins and demonstrating platform value.",
            category="opportunity",
            data_point=f"{pct}% high buildability",
        ))

    # 7. Common blockers
    if report.blocker_distribution:
        top_blocker = report.blocker_distribution[0]
        insights.append(InsightItem(
            title=f"Top Blocker: {top_blocker.label}",
            description=f"The most common integration blocker is '{top_blocker.label}', affecting {top_blocker.count} apps. Addressing this systematically could unlock significant integration coverage.",
            category="risk",
            data_point=f"{top_blocker.count} apps affected",
        ))

    # 8. Confidence assessment
    insights.append(InsightItem(
        title=f"Research Confidence at {report.avg_confidence:.0f}%",
        description=f"Average confidence across all apps is {report.avg_confidence:.0f}%. {report.high_confidence_count} apps have high confidence (≥70) while {report.low_confidence_count} have low confidence (<40). Low-confidence apps should be prioritized for manual verification.",
        category="risk",
        data_point=f"{report.avg_confidence:.0f}% average",
    ))

    # 9. Gated patterns
    gated_categories = {}
    for app in apps:
        if app.access_model in ("Contact Sales", "Partnership Required", "Admin Approval"):
            gated_categories[app.category] = gated_categories.get(app.category, 0) + 1

    if gated_categories:
        most_gated = max(gated_categories.items(), key=lambda x: x[1])
        insights.append(InsightItem(
            title=f"{most_gated[0]} Has the Most Gated APIs",
            description=f"The {most_gated[0]} category has {most_gated[1]} gated apps requiring sales or admin approval. Enterprise-focused categories tend to restrict API access, making them harder targets for self-serve integration platforms.",
            category="access",
            data_point=f"{most_gated[1]} gated apps",
        ))

    return insights
