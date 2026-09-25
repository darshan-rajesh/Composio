"""
SQLite database layer for the Composio SaaS Research Pipeline.

Async operations via aiosqlite. Single table design with JSON columns
for complex fields (evidence_urls, confidence_breakdown).

Lifecycle: insert → research → verify → audit
"""

import json
import aiosqlite
from pathlib import Path
from datetime import datetime
from typing import Optional

from loguru import logger

from backend.config import get_settings, DATABASE_DIR
from backend.models import AppResearchResult, ConfidenceBreakdown


# ===========================
# Database Path
# ===========================

def get_db_path() -> str:
    """Get the SQLite database file path."""
    DATABASE_DIR.mkdir(parents=True, exist_ok=True)
    return str(DATABASE_DIR / "research.db")


# ===========================
# Schema
# ===========================

CREATE_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS app_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Core fields
    app_name TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL DEFAULT '',
    website TEXT DEFAULT '',
    description TEXT DEFAULT '',
    
    -- Research findings
    auth_method TEXT DEFAULT 'Unknown',
    access_model TEXT DEFAULT 'Unknown',
    api_type TEXT DEFAULT 'Unknown',
    api_breadth TEXT DEFAULT 'Unknown',
    mcp_availability TEXT DEFAULT 'Unknown',
    buildability_verdict TEXT DEFAULT 'Unknown',
    main_blocker TEXT DEFAULT 'None identified',
    evidence_urls TEXT DEFAULT '[]',
    
    -- Confidence
    confidence_score REAL DEFAULT 0.0,
    confidence_breakdown TEXT DEFAULT '{}',
    
    -- Verification
    verification_status TEXT DEFAULT 'Unverified',
    verification_notes TEXT DEFAULT '',
    corrections_made INTEGER DEFAULT 0,
    
    -- Audit
    audit_status TEXT DEFAULT 'Pending',
    audit_notes TEXT DEFAULT '',
    
    -- Timestamps
    researched_at TEXT,
    verified_at TEXT,
    audited_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    
    -- Status tracking
    status TEXT DEFAULT 'pending',
    error_message TEXT DEFAULT ''
);
"""

CREATE_INDEXES_SQL = [
    "CREATE INDEX IF NOT EXISTS idx_category ON app_results(category);",
    "CREATE INDEX IF NOT EXISTS idx_status ON app_results(status);",
    "CREATE INDEX IF NOT EXISTS idx_audit_status ON app_results(audit_status);",
    "CREATE INDEX IF NOT EXISTS idx_confidence ON app_results(confidence_score);",
]


# ===========================
# Database Operations
# ===========================

async def init_database():
    """Initialize the database and create tables."""
    db_path = get_db_path()
    logger.info(f"Initializing database at {db_path}")

    async with aiosqlite.connect(db_path) as db:
        await db.execute(CREATE_TABLE_SQL)
        for index_sql in CREATE_INDEXES_SQL:
            await db.execute(index_sql)
        await db.commit()

    logger.info("Database initialized successfully")


async def insert_app(app_name: str, category: str, website: str = "") -> int:
    """Insert a new app into the database. Returns the row ID."""
    db_path = get_db_path()
    async with aiosqlite.connect(db_path) as db:
        try:
            cursor = await db.execute(
                """INSERT INTO app_results (app_name, category, website)
                   VALUES (?, ?, ?)""",
                (app_name, category, website),
            )
            await db.commit()
            return cursor.lastrowid
        except aiosqlite.IntegrityError:
            logger.warning(f"App '{app_name}' already exists, skipping insert")
            # Return existing ID
            cursor = await db.execute(
                "SELECT id FROM app_results WHERE app_name = ?", (app_name,)
            )
            row = await cursor.fetchone()
            return row[0] if row else -1


async def bulk_insert_apps(apps: list[dict]) -> int:
    """Insert multiple apps. Returns count of newly inserted apps."""
    db_path = get_db_path()
    inserted = 0
    async with aiosqlite.connect(db_path) as db:
        for app in apps:
            try:
                await db.execute(
                    """INSERT INTO app_results (app_name, category, website)
                       VALUES (?, ?, ?)""",
                    (app["name"], app.get("category", ""), app.get("website", "")),
                )
                inserted += 1
            except aiosqlite.IntegrityError:
                continue
        await db.commit()
    logger.info(f"Bulk inserted {inserted}/{len(apps)} apps")
    return inserted


async def update_research(app_name: str, findings: dict):
    """Update an app with research findings."""
    db_path = get_db_path()
    async with aiosqlite.connect(db_path) as db:
        await db.execute(
            """UPDATE app_results SET
                description = ?,
                website = COALESCE(NULLIF(?, ''), website),
                auth_method = ?,
                access_model = ?,
                api_type = ?,
                api_breadth = ?,
                mcp_availability = ?,
                buildability_verdict = ?,
                main_blocker = ?,
                evidence_urls = ?,
                status = 'researched',
                researched_at = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE app_name = ?""",
            (
                findings.get("description", ""),
                findings.get("website", ""),
                findings.get("auth_method", "Unknown"),
                findings.get("access_model", "Unknown"),
                findings.get("api_type", "Unknown"),
                findings.get("api_breadth", "Unknown"),
                findings.get("mcp_availability", "Unknown"),
                findings.get("buildability_verdict", "Unknown"),
                findings.get("main_blocker", "None identified"),
                json.dumps(findings.get("evidence_urls", [])),
                datetime.utcnow().isoformat(),
                app_name,
            ),
        )
        await db.commit()


async def update_confidence(app_name: str, score: float, breakdown: dict):
    """Update confidence score for an app."""
    db_path = get_db_path()
    async with aiosqlite.connect(db_path) as db:
        await db.execute(
            """UPDATE app_results SET
                confidence_score = ?,
                confidence_breakdown = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE app_name = ?""",
            (score, json.dumps(breakdown), app_name),
        )
        await db.commit()


async def update_verification(app_name: str, verification: dict):
    """Update an app with verification results."""
    db_path = get_db_path()
    async with aiosqlite.connect(db_path) as db:
        # Apply any corrections
        corrections = verification.get("corrections", {})
        if corrections:
            for field, value in corrections.items():
                if field in (
                    "auth_method", "access_model", "api_type", "api_breadth",
                    "mcp_availability", "buildability_verdict", "main_blocker",
                    "description",
                ):
                    await db.execute(
                        f"UPDATE app_results SET {field} = ? WHERE app_name = ?",
                        (value, app_name),
                    )

        await db.execute(
            """UPDATE app_results SET
                verification_status = ?,
                verification_notes = ?,
                corrections_made = ?,
                status = 'verified',
                verified_at = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE app_name = ?""",
            (
                verification.get("verification_status", "Unverified"),
                verification.get("verification_notes", ""),
                verification.get("corrections_made", 0),
                datetime.utcnow().isoformat(),
                app_name,
            ),
        )
        await db.commit()


async def update_audit(app_name: str, audit_status: str, notes: str = "", corrections: dict = None):
    """Update an app with human audit results."""
    db_path = get_db_path()
    async with aiosqlite.connect(db_path) as db:
        # Apply corrections if provided
        if corrections:
            for field, value in corrections.items():
                if field in (
                    "auth_method", "access_model", "api_type", "api_breadth",
                    "mcp_availability", "buildability_verdict", "main_blocker",
                    "description",
                ):
                    await db.execute(
                        f"UPDATE app_results SET {field} = ? WHERE app_name = ?",
                        (value, app_name),
                    )

        await db.execute(
            """UPDATE app_results SET
                audit_status = ?,
                audit_notes = ?,
                status = 'audited',
                audited_at = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE app_name = ?""",
            (audit_status, notes, datetime.utcnow().isoformat(), app_name),
        )
        await db.commit()


async def update_status(app_name: str, status: str, error_message: str = ""):
    """Update the processing status of an app."""
    db_path = get_db_path()
    async with aiosqlite.connect(db_path) as db:
        await db.execute(
            """UPDATE app_results SET
                status = ?,
                error_message = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE app_name = ?""",
            (status, error_message, app_name),
        )
        await db.commit()


# ===========================
# Query Operations
# ===========================

def _row_to_result(row: aiosqlite.Row, columns: list[str]) -> AppResearchResult:
    """Convert a database row to an AppResearchResult."""
    data = dict(zip(columns, row))

    # Parse JSON fields
    try:
        data["evidence_urls"] = json.loads(data.get("evidence_urls", "[]"))
    except (json.JSONDecodeError, TypeError):
        data["evidence_urls"] = []

    try:
        breakdown_data = json.loads(data.get("confidence_breakdown", "{}"))
        data["confidence_breakdown"] = ConfidenceBreakdown(**breakdown_data) if breakdown_data else None
    except (json.JSONDecodeError, TypeError):
        data["confidence_breakdown"] = None

    # Remove non-model fields
    data.pop("created_at", None)
    data.pop("updated_at", None)

    return AppResearchResult(**data)


async def get_all_apps() -> list[AppResearchResult]:
    """Get all apps from the database."""
    db_path = get_db_path()
    async with aiosqlite.connect(db_path) as db:
        db.row_factory = None
        cursor = await db.execute("SELECT * FROM app_results ORDER BY app_name")
        columns = [desc[0] for desc in cursor.description]
        rows = await cursor.fetchall()
        return [_row_to_result(row, columns) for row in rows]


async def get_app(app_name: str) -> Optional[AppResearchResult]:
    """Get a single app by name."""
    db_path = get_db_path()
    async with aiosqlite.connect(db_path) as db:
        cursor = await db.execute(
            "SELECT * FROM app_results WHERE app_name = ?", (app_name,)
        )
        columns = [desc[0] for desc in cursor.description]
        row = await cursor.fetchone()
        if row:
            return _row_to_result(row, columns)
        return None


async def get_apps_by_status(status: str) -> list[AppResearchResult]:
    """Get apps filtered by processing status."""
    db_path = get_db_path()
    async with aiosqlite.connect(db_path) as db:
        cursor = await db.execute(
            "SELECT * FROM app_results WHERE status = ? ORDER BY app_name",
            (status,),
        )
        columns = [desc[0] for desc in cursor.description]
        rows = await cursor.fetchall()
        return [_row_to_result(row, columns) for row in rows]


async def get_apps_by_category(category: str) -> list[AppResearchResult]:
    """Get apps filtered by category."""
    db_path = get_db_path()
    async with aiosqlite.connect(db_path) as db:
        cursor = await db.execute(
            "SELECT * FROM app_results WHERE category = ? ORDER BY app_name",
            (category,),
        )
        columns = [desc[0] for desc in cursor.description]
        rows = await cursor.fetchall()
        return [_row_to_result(row, columns) for row in rows]


async def get_pipeline_stats() -> dict:
    """Get aggregate statistics about the pipeline."""
    db_path = get_db_path()
    async with aiosqlite.connect(db_path) as db:
        cursor = await db.execute("""
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN status IN ('researched','verified','audited') THEN 1 ELSE 0 END) as researched,
                SUM(CASE WHEN status IN ('verified','audited') THEN 1 ELSE 0 END) as verified,
                SUM(CASE WHEN status = 'audited' THEN 1 ELSE 0 END) as audited,
                SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as errors,
                SUM(CASE WHEN status = 'researching' THEN 1 ELSE 0 END) as in_progress,
                AVG(confidence_score) as avg_confidence
            FROM app_results
        """)
        row = await cursor.fetchone()
        return {
            "total": row[0] or 0,
            "researched": row[1] or 0,
            "verified": row[2] or 0,
            "audited": row[3] or 0,
            "errors": row[4] or 0,
            "in_progress": row[5] or 0,
            "avg_confidence": round(row[6] or 0, 1),
        }


async def get_random_sample(n: int = 12, exclude_audited: bool = True) -> list[AppResearchResult]:
    """Get a random sample of apps for human audit."""
    db_path = get_db_path()
    async with aiosqlite.connect(db_path) as db:
        where_clause = ""
        if exclude_audited:
            where_clause = "WHERE status IN ('researched', 'verified') AND audit_status = 'Pending'"

        cursor = await db.execute(
            f"SELECT * FROM app_results {where_clause} ORDER BY RANDOM() LIMIT ?",
            (n,),
        )
        columns = [desc[0] for desc in cursor.description]
        rows = await cursor.fetchall()
        return [_row_to_result(row, columns) for row in rows]


async def reset_database():
    """Reset the database (drop and recreate)."""
    db_path = get_db_path()
    async with aiosqlite.connect(db_path) as db:
        await db.execute("DROP TABLE IF EXISTS app_results")
        await db.commit()
    await init_database()
    logger.warning("Database has been reset")
