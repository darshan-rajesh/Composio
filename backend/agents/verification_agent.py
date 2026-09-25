"""
Verification Agent for the Composio SaaS Research Pipeline.

Independently reviews research findings by:
1. Running separate verification searches
2. Cross-referencing claims against new evidence
3. Flagging contradictions and producing corrections

Designed to be SKEPTICAL — finds mistakes, doesn't confirm them.
"""

import json
import asyncio
import random
from abc import ABC, abstractmethod
from datetime import datetime
from typing import Optional

from openai import AsyncOpenAI
from tavily import TavilyClient
from tenacity import retry, stop_after_attempt, wait_exponential
from loguru import logger

from backend.config import get_settings
from backend.models import VerificationResult, FieldVerification
from backend.agents.prompts import (
    VERIFICATION_SYSTEM_PROMPT,
    VERIFICATION_USER_PROMPT,
    VERIFICATION_SEARCH_QUERIES,
)


# ===========================
# Base Agent Interface
# ===========================

class BaseVerificationAgent(ABC):
    """Abstract base for verification agents."""

    @abstractmethod
    async def verify_app(self, app_name: str, research_findings: dict) -> VerificationResult:
        """Verify research findings for a single app."""
        pass

    async def verify_batch(
        self,
        apps_with_findings: list[tuple[str, dict]],
        on_progress: Optional[callable] = None,
    ) -> list[VerificationResult]:
        """Verify a batch of apps with concurrency control."""
        settings = get_settings()
        semaphore = asyncio.Semaphore(settings.batch_size)

        async def _verify_with_semaphore(item: tuple, index: int):
            app_name, findings = item
            async with semaphore:
                try:
                    logger.info(f"[{index + 1}/{len(apps_with_findings)}] Verifying: {app_name}")
                    result = await self.verify_app(app_name, findings)
                    if on_progress:
                        await on_progress(app_name, "verified", index + 1, len(apps_with_findings))
                    return result
                except Exception as e:
                    logger.error(f"Verification failed for {app_name}: {e}")
                    if on_progress:
                        await on_progress(app_name, "error", index + 1, len(apps_with_findings))
                    return VerificationResult(
                        app_name=app_name,
                        verification_notes=f"Verification failed: {str(e)}",
                    )

        tasks = [
            _verify_with_semaphore(item, i)
            for i, item in enumerate(apps_with_findings)
        ]
        return list(await asyncio.gather(*tasks))


# ===========================
# Live Verification Agent
# ===========================

from google import genai
from google.genai import types

class LiveVerificationAgent(BaseVerificationAgent):
    """Verification agent using real Tavily + Gemini 3.6 Flash APIs."""

    def __init__(self):
        settings = get_settings()
        if not settings.is_gemini_configured:
            logger.error("GEMINI_API_KEY is missing or invalid in configuration!")
        if not settings.is_tavily_configured:
            logger.error("TAVILY_API_KEY is missing or invalid in configuration!")

        self.genai_client = genai.Client(api_key=settings.gemini_api_key or "missing-key")
        self.tavily_client = TavilyClient(api_key=settings.tavily_api_key or "missing-key")
        self.model = settings.gemini_model
        self.rate_limit_delay = settings.rate_limit_delay

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=30),
    )
    async def _search(self, query: str) -> list[dict]:
        """Perform verification search via Tavily."""
        try:
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: self.tavily_client.search(
                    query=query,
                    search_depth="advanced",
                    max_results=4,
                    include_raw_content=False,
                ),
            )
            return response.get("results", [])
        except Exception as e:
            logger.warning(f"Verification search failed for '{query}': {e}")
            return []

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=30),
    )
    async def _verify_with_llm(
        self, app_name: str, research_findings: str, search_results: str
    ) -> dict:
        """Use Gemini 3.6 Flash to independently verify findings."""
        user_prompt = VERIFICATION_USER_PROMPT.format(
            app_name=app_name,
            research_findings=research_findings,
            search_results=search_results,
        )

        full_prompt = f"{VERIFICATION_SYSTEM_PROMPT}\n\n{user_prompt}"

        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None,
            lambda: self.genai_client.models.generate_content(
                model=self.model,
                contents=full_prompt,
                config=types.GenerateContentConfig(
                    temperature=0.1,
                    max_output_tokens=2000,
                ),
            ),
        )

        content = response.text.strip()

        # Parse JSON
        if content.startswith("```"):
            lines = content.splitlines()
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].startswith("```"):
                lines = lines[:-1]
            content = "\n".join(lines).strip()

        return json.loads(content)

    async def verify_app(self, app_name: str, research_findings: dict) -> VerificationResult:
        """Verify findings using independent search + LLM cross-check."""
        logger.info(f"Starting verification for: {app_name}")

        # Step 1: Independent verification searches
        all_results = []
        for query_template in VERIFICATION_SEARCH_QUERIES:
            query = query_template.format(app_name=app_name)
            results = await self._search(query)
            all_results.extend(results)
            await asyncio.sleep(self.rate_limit_delay)

        # Format search results
        search_text = ""
        seen_urls = set()
        for i, r in enumerate(all_results, 1):
            url = r.get("url", "")
            if url in seen_urls:
                continue
            seen_urls.add(url)
            search_text += f"\n--- Verification Source {i} ---\n"
            search_text += f"Title: {r.get('title', 'N/A')}\n"
            search_text += f"URL: {url}\n"
            search_text += f"Content: {r.get('content', 'N/A')}\n"

        if not search_text:
            search_text = "No verification sources found."

        # Step 2: LLM verification
        findings_json = json.dumps(research_findings, indent=2, default=str)
        verification_dict = await self._verify_with_llm(app_name, findings_json, search_text)

        # Step 3: Build VerificationResult
        field_verifications = []
        for fv in verification_dict.get("field_verifications", []):
            field_verifications.append(FieldVerification(
                field_name=fv.get("field_name", ""),
                original_value=fv.get("original_value", ""),
                verified=fv.get("verified", False),
                corrected_value=fv.get("corrected_value"),
                verification_note=fv.get("verification_note", ""),
            ))

        result = VerificationResult(
            app_name=app_name,
            verification_status=verification_dict.get("verification_status", "Unverified"),
            field_verifications=field_verifications,
            corrections_made=verification_dict.get("corrections_made", 0),
            verification_confidence=min(100, max(0, verification_dict.get("verification_confidence", 0))),
            verification_notes=verification_dict.get("verification_notes", ""),
        )

        logger.info(
            f"Verification complete for {app_name}: "
            f"status={result.verification_status}, corrections={result.corrections_made}"
        )
        return result


# ===========================
# Mock Verification Agent
# ===========================

class MockVerificationAgent(BaseVerificationAgent):
    """Simulated verification agent for testing."""

    async def verify_app(self, app_name: str, research_findings: dict) -> VerificationResult:
        """Generate deterministic mock verification results."""
        logger.info(f"[MOCK] Verifying: {app_name}")
        await asyncio.sleep(random.uniform(0.05, 0.2))

        seed = hash(app_name) % 100

        # Simulate ~80% verification rate, ~10% corrections
        verified_fields = []
        corrections = {}
        fields_to_check = [
            "auth_method", "access_model", "api_type",
            "api_breadth", "mcp_availability", "buildability_verdict",
        ]

        corrections_count = 0
        for field in fields_to_check:
            original = research_findings.get(field, "Unknown")
            is_verified = random.Random(seed + hash(field)).random() > 0.15
            corrected = None

            if not is_verified and field == "mcp_availability":
                corrected = "Unknown"
                corrections[field] = corrected
                corrections_count += 1
            elif not is_verified and field == "access_model":
                corrected = "Trial"
                corrections[field] = corrected
                corrections_count += 1

            verified_fields.append(FieldVerification(
                field_name=field,
                original_value=str(original),
                verified=is_verified,
                corrected_value=corrected,
                verification_note=f"[MOCK] {'Verified' if is_verified else 'Corrected'} via simulated check",
            ))

        # Determine overall status
        if corrections_count == 0:
            status = "Verified"
        elif corrections_count <= 2:
            status = "Partially Verified"
        else:
            status = "Contradicted"

        confidence = max(30, 100 - (corrections_count * 15) - random.Random(seed).randint(0, 20))

        return VerificationResult(
            app_name=app_name,
            verification_status=status,
            field_verifications=verified_fields,
            corrections_made=corrections_count,
            verification_confidence=float(confidence),
            verification_notes=f"[MOCK] Simulated verification. {corrections_count} corrections made.",
        )


# ===========================
# Factory
# ===========================

def get_verification_agent() -> BaseVerificationAgent:
    """Get the appropriate verification agent based on config mode."""
    settings = get_settings()
    if settings.is_mock_mode:
        logger.info("Using MockVerificationAgent (simulation mode)")
        return MockVerificationAgent()
    else:
        logger.info("Using LiveVerificationAgent (real API mode)")
        return LiveVerificationAgent()
