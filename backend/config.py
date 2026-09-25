"""
Centralized configuration for the Composio SaaS Research Pipeline.

Uses pydantic-settings for type-safe environment variable parsing.
Supports both 'live' (real API) and 'mock' (simulation) modes.
"""

from pathlib import Path
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


# Project root (two levels up from backend/config.py)
PROJECT_ROOT = Path(__file__).resolve().parent.parent

# Data directories
DATA_DIR = PROJECT_ROOT / "data"
DATABASE_DIR = PROJECT_ROOT / "database"
REPORTS_DIR = PROJECT_ROOT / "reports"
TEMPLATES_DIR = Path(__file__).resolve().parent / "templates"


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=str(PROJECT_ROOT / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # --- API Keys ---
    gemini_api_key: str = ""
    tavily_api_key: str = ""

    # --- Gemini Model Configuration ---
    gemini_model: str = "gemini-3.1-flash-lite"

    # --- Database ---
    database_url: str = f"sqlite:///{DATABASE_DIR / 'research.db'}"

    # --- Processing ---
    batch_size: int = 5
    max_retries: int = 3
    rate_limit_delay: float = 1.0

    # --- Server ---
    host: str = "0.0.0.0"
    port: int = 8000
    log_level: str = "INFO"

    # --- Mode ---
    agent_mode: str = "live"  # "live" or "mock"

    @property
    def is_gemini_configured(self) -> bool:
        return bool(self.gemini_api_key and not self.gemini_api_key.startswith("your_"))

    @property
    def is_tavily_configured(self) -> bool:
        return bool(self.tavily_api_key and not self.tavily_api_key.startswith("your_"))

    @property
    def is_mock_mode(self) -> bool:
        return self.agent_mode.lower() == "mock"

    @property
    def db_path(self) -> Path:
        """Extract the actual file path from the SQLite URL."""
        return Path(self.database_url.replace("sqlite:///", ""))


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


def ensure_directories():
    """Create all required directories if they don't exist."""
    for directory in [DATA_DIR, DATABASE_DIR, REPORTS_DIR]:
        directory.mkdir(parents=True, exist_ok=True)
