"""
Pydantic models for the Composio SaaS Research Pipeline.

These schemas define the data contract across all components:
- Research Agent output
- Verification Agent output
- Confidence scoring
- Human audit records
- Analytics results
"""

from enum import Enum
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field


# ===========================
# Enums
# ===========================

class AuthMethod(str, Enum):
    OAUTH2 = "OAuth2"
    API_KEY = "API Key"
    BASIC_AUTH = "Basic Auth"
    BEARER_TOKEN = "Bearer Token"
    JWT = "JWT"
    SESSION_AUTH = "Session Auth"
    OTHER = "Other"
    UNKNOWN = "Unknown"


class AccessModel(str, Enum):
    SELF_SERVE = "Self-Serve"
    TRIAL = "Trial"
    PAID_PLAN = "Paid Plan Required"
    ADMIN_APPROVAL = "Admin Approval"
    CONTACT_SALES = "Contact Sales"
    PARTNERSHIP = "Partnership Required"
    UNKNOWN = "Unknown"


class APIType(str, Enum):
    REST = "REST"
    GRAPHQL = "GraphQL"
    RPC = "RPC"
    MIXED = "Mixed"
    NONE = "None"
    UNKNOWN = "Unknown"


class APIBreadth(str, Enum):
    NARROW = "Narrow"
    MEDIUM = "Medium"
    BROAD = "Broad"
    UNKNOWN = "Unknown"


class MCPAvailability(str, Enum):
    YES = "Yes"
    NO = "No"
    PARTIAL = "Partial"
    UNKNOWN = "Unknown"


class BuildabilityVerdict(str, Enum):
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"
    UNKNOWN = "Unknown"


class AuditStatus(str, Enum):
    CORRECT = "Correct"
    INCORRECT = "Incorrect"
    NEEDS_REVIEW = "Needs Review"
    PENDING = "Pending"


class VerificationStatus(str, Enum):
    VERIFIED = "Verified"
    PARTIALLY_VERIFIED = "Partially Verified"
    UNVERIFIED = "Unverified"
    CONTRADICTED = "Contradicted"


# ===========================
# Input Models
# ===========================

class AppInput(BaseModel):
    """A single app from the input CSV."""
    name: str = Field(..., description="Application name")
    category: str = Field(..., description="App category (CRM, DevTools, etc.)")
    website: str = Field(default="", description="App website URL")


# ===========================
# Research Agent Output
# ===========================

class ResearchFindings(BaseModel):
    """Raw findings from the Research Agent."""
    app_name: str
    category: str
    website: str = ""
    description: str = Field(default="", description="One-line description")

    auth_method: AuthMethod = AuthMethod.UNKNOWN
    access_model: AccessModel = AccessModel.UNKNOWN
    api_type: APIType = APIType.UNKNOWN
    api_breadth: APIBreadth = APIBreadth.UNKNOWN
    mcp_availability: MCPAvailability = MCPAvailability.UNKNOWN
    buildability_verdict: BuildabilityVerdict = BuildabilityVerdict.UNKNOWN

    main_blocker: str = Field(default="None identified", description="Primary integration blocker")
    evidence_urls: list[str] = Field(default_factory=list, description="Source URLs")

    raw_notes: str = Field(default="", description="Agent's reasoning notes")
    search_queries_used: list[str] = Field(default_factory=list, description="Search queries performed")
    researched_at: datetime = Field(default_factory=datetime.utcnow)


# ===========================
# Verification Agent Output
# ===========================

class FieldVerification(BaseModel):
    """Verification result for a single field."""
    field_name: str
    original_value: str
    verified: bool = False
    corrected_value: Optional[str] = None
    verification_note: str = ""


class VerificationResult(BaseModel):
    """Output from the Verification Agent."""
    app_name: str
    verification_status: VerificationStatus = VerificationStatus.UNVERIFIED
    field_verifications: list[FieldVerification] = Field(default_factory=list)
    corrections_made: int = 0
    verification_confidence: float = Field(default=0.0, ge=0.0, le=100.0)
    verification_notes: str = ""
    verified_at: datetime = Field(default_factory=datetime.utcnow)


# ===========================
# Confidence Score
# ===========================

class ConfidenceBreakdown(BaseModel):
    """Detailed confidence score breakdown."""
    official_docs_found: float = 0.0     # max +30
    auth_verified: float = 0.0           # max +20
    api_verified: float = 0.0            # max +20
    mcp_verified: float = 0.0            # max +15
    multiple_sources: float = 0.0        # max +15
    penalties: float = 0.0               # negative adjustments
    total: float = Field(default=0.0, ge=0.0, le=100.0)


# ===========================
# Combined App Result
# ===========================

class AppResearchResult(BaseModel):
    """The complete research result for one app — the central data model."""
    id: Optional[int] = None

    # Core fields
    app_name: str
    category: str
    website: str = ""
    description: str = ""

    # Research findings
    auth_method: str = "Unknown"
    access_model: str = "Unknown"
    api_type: str = "Unknown"
    api_breadth: str = "Unknown"
    mcp_availability: str = "Unknown"
    buildability_verdict: str = "Unknown"
    main_blocker: str = "None identified"
    evidence_urls: list[str] = Field(default_factory=list)

    # Confidence
    confidence_score: float = 0.0
    confidence_breakdown: Optional[ConfidenceBreakdown] = None

    # Verification
    verification_status: str = "Unverified"
    verification_notes: str = ""
    corrections_made: int = 0

    # Audit
    audit_status: str = "Pending"
    audit_notes: str = ""

    # Timestamps
    researched_at: Optional[datetime] = None
    verified_at: Optional[datetime] = None
    audited_at: Optional[datetime] = None

    # Status
    status: str = "pending"  # pending, researching, researched, verified, audited, error
    error_message: str = ""


# ===========================
# Human Audit Models
# ===========================

class AuditSubmission(BaseModel):
    """A human audit submission for one app."""
    app_name: str
    audit_status: AuditStatus
    corrections: dict[str, str] = Field(default_factory=dict, description="Field name -> corrected value")
    notes: str = ""


class AuditSample(BaseModel):
    """A set of apps selected for human audit."""
    sample_size: int
    apps: list[AppResearchResult]
    sampling_method: str = "stratified_random"


class AuditMetrics(BaseModel):
    """Accuracy metrics from human audit."""
    total_audited: int = 0
    correct_count: int = 0
    incorrect_count: int = 0
    needs_review_count: int = 0
    first_pass_accuracy: float = 0.0    # Before verification
    post_verification_accuracy: float = 0.0  # After verification
    error_breakdown: dict[str, int] = Field(default_factory=dict)


# ===========================
# Analytics Models
# ===========================

class DistributionItem(BaseModel):
    """A single item in a distribution."""
    label: str
    count: int
    percentage: float


class InsightItem(BaseModel):
    """A generated insight/observation."""
    title: str
    description: str
    category: str  # e.g., "auth", "access", "buildability", "mcp", "opportunity"
    data_point: str = ""


class AnalyticsReport(BaseModel):
    """Full analytics output."""
    total_apps: int = 0
    avg_confidence: float = 0.0
    high_confidence_count: int = 0
    low_confidence_count: int = 0

    auth_distribution: list[DistributionItem] = Field(default_factory=list)
    access_distribution: list[DistributionItem] = Field(default_factory=list)
    category_distribution: list[DistributionItem] = Field(default_factory=list)
    api_type_distribution: list[DistributionItem] = Field(default_factory=list)
    buildability_distribution: list[DistributionItem] = Field(default_factory=list)
    mcp_distribution: list[DistributionItem] = Field(default_factory=list)
    blocker_distribution: list[DistributionItem] = Field(default_factory=list)

    insights: list[InsightItem] = Field(default_factory=list)
    audit_metrics: Optional[AuditMetrics] = None


# ===========================
# API Response Models
# ===========================

class PipelineStatus(BaseModel):
    """Status of the research pipeline."""
    total_apps: int = 0
    researched: int = 0
    verified: int = 0
    audited: int = 0
    errors: int = 0
    in_progress: int = 0
    current_app: str = ""
    phase: str = "idle"  # idle, researching, verifying, auditing, complete


class ApiResponse(BaseModel):
    """Standard API response wrapper."""
    success: bool = True
    message: str = ""
    data: Optional[dict] = None
