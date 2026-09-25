"""
Research Agent for the Composio SaaS Research Pipeline.

Performs automated research on SaaS applications by:
1. Running targeted web searches via Tavily
2. Feeding results to Qwen 3 for structured extraction
3. Returning validated ResearchFindings

Supports dual mode: 'live' (real APIs) and 'mock' (deterministic simulation).
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
from backend.models import ResearchFindings
from backend.agents.prompts import (
    RESEARCH_SYSTEM_PROMPT,
    RESEARCH_USER_PROMPT,
    SEARCH_QUERIES,
)


# ===========================
# Base Agent Interface
# ===========================

class BaseResearchAgent(ABC):
    """Abstract base for research agents."""

    @abstractmethod
    async def research_app(self, app_name: str, category: str, website: str) -> ResearchFindings:
        """Research a single app and return structured findings."""
        pass

    async def research_batch(
        self,
        apps: list[dict],
        on_progress: Optional[callable] = None,
    ) -> list[ResearchFindings]:
        """Research a batch of apps with concurrency control."""
        settings = get_settings()
        semaphore = asyncio.Semaphore(settings.batch_size)
        results = []

        async def _research_with_semaphore(app: dict, index: int):
            async with semaphore:
                try:
                    logger.info(f"[{index + 1}/{len(apps)}] Researching: {app['name']}")
                    result = await self.research_app(
                        app["name"], app.get("category", ""), app.get("website", "")
                    )
                    if on_progress:
                        await on_progress(app["name"], "completed", index + 1, len(apps))
                    return result
                except Exception as e:
                    logger.error(f"Failed to research {app['name']}: {e}")
                    if on_progress:
                        await on_progress(app["name"], "error", index + 1, len(apps))
                    # Return a minimal findings object with error state
                    return ResearchFindings(
                        app_name=app["name"],
                        category=app.get("category", ""),
                        website=app.get("website", ""),
                        raw_notes=f"Research failed: {str(e)}",
                    )

        tasks = [
            _research_with_semaphore(app, i) for i, app in enumerate(apps)
        ]
        results = await asyncio.gather(*tasks)
        return list(results)


# ===========================
# Live Research Agent
# ===========================

from google import genai
from google.genai import types

class LiveResearchAgent(BaseResearchAgent):
    """Research agent using real Tavily + Gemini 3.6 Flash APIs."""

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
        """Perform a web search via Tavily."""
        try:
            # Tavily client is sync, run in executor
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: self.tavily_client.search(
                    query=query,
                    search_depth="advanced",
                    max_results=5,
                    include_raw_content=False,
                ),
            )
            return response.get("results", [])
        except Exception as e:
            logger.warning(f"Search failed for '{query}': {e}")
            return []

    @retry(
        stop=stop_after_attempt(5),
        wait=wait_exponential(multiplier=2, min=3, max=60),
    )
    async def _extract_findings(
        self, app_name: str, category: str, website: str, search_results: str
    ) -> dict:
        """Use Gemini 3.6 Flash to extract structured findings from search results."""
        user_prompt = RESEARCH_USER_PROMPT.format(
            app_name=app_name,
            category=category,
            website=website,
            search_results=search_results,
        )

        full_prompt = f"{RESEARCH_SYSTEM_PROMPT}\n\n{user_prompt}"

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

        # Parse JSON from response (handle markdown code blocks)
        if content.startswith("```"):
            lines = content.splitlines()
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].startswith("```"):
                lines = lines[:-1]
            content = "\n".join(lines).strip()

        return json.loads(content)

    async def research_app(self, app_name: str, category: str, website: str) -> ResearchFindings:
        """Research a single app using Tavily search + Qwen 3 extraction."""
        logger.info(f"Starting research for: {app_name}")

        # Step 1: Perform multiple targeted searches
        all_results = []
        queries_used = []
        for query_template in SEARCH_QUERIES:
            query = query_template.format(app_name=app_name)
            queries_used.append(query)
            results = await self._search(query)
            all_results.extend(results)
            await asyncio.sleep(self.rate_limit_delay)  # Rate limiting

        # Deduplicate by URL
        seen_urls = set()
        unique_results = []
        for r in all_results:
            url = r.get("url", "")
            if url not in seen_urls:
                seen_urls.add(url)
                unique_results.append(r)

        if not unique_results:
            logger.warning(f"No search results found for {app_name}")
            return ResearchFindings(
                app_name=app_name,
                category=category,
                website=website,
                raw_notes="No search results were found. All fields marked as Unknown.",
                search_queries_used=queries_used,
            )

        # Step 2: Format search results for LLM
        search_text = ""
        for i, r in enumerate(unique_results[:15], 1):  # Cap at 15 results
            search_text += f"\n--- Result {i} ---\n"
            search_text += f"Title: {r.get('title', 'N/A')}\n"
            search_text += f"URL: {r.get('url', 'N/A')}\n"
            search_text += f"Content: {r.get('content', 'N/A')}\n"

        # Step 3: Extract structured findings via LLM
        findings_dict = await self._extract_findings(app_name, category, website, search_text)

        # Step 4: Build ResearchFindings object
        findings = ResearchFindings(
            app_name=findings_dict.get("app_name", app_name),
            category=findings_dict.get("category", category),
            website=findings_dict.get("website", website),
            description=findings_dict.get("description", ""),
            auth_method=findings_dict.get("auth_method", "Unknown"),
            access_model=findings_dict.get("access_model", "Unknown"),
            api_type=findings_dict.get("api_type", "Unknown"),
            api_breadth=findings_dict.get("api_breadth", "Unknown"),
            mcp_availability=findings_dict.get("mcp_availability", "Unknown"),
            buildability_verdict=findings_dict.get("buildability_verdict", "Unknown"),
            main_blocker=findings_dict.get("main_blocker", "None identified"),
            evidence_urls=findings_dict.get("evidence_urls", []),
            raw_notes=findings_dict.get("reasoning", ""),
            search_queries_used=queries_used,
        )

        logger.info(f"Completed research for: {app_name} (auth={findings.auth_method}, api={findings.api_type})")
        return findings


# ===========================
# Mock Research Agent
# ===========================

# Realistic mock data pools for simulation
_MOCK_AUTH_METHODS = {
    "CRM": ["OAuth2", "API Key", "OAuth2", "OAuth2", "API Key"],
    "Support": ["OAuth2", "API Key", "OAuth2", "Bearer Token", "API Key"],
    "Communications": ["OAuth2", "API Key", "Bearer Token", "OAuth2", "API Key"],
    "Marketing": ["OAuth2", "API Key", "OAuth2", "API Key", "OAuth2"],
    "Ecommerce": ["OAuth2", "API Key", "API Key", "OAuth2", "Bearer Token"],
    "Data/SEO": ["OAuth2", "API Key", "API Key", "Bearer Token", "OAuth2"],
    "Developer Tools": ["OAuth2", "Bearer Token", "OAuth2", "API Key", "OAuth2"],
    "Productivity": ["OAuth2", "API Key", "OAuth2", "OAuth2", "Bearer Token"],
    "Finance": ["OAuth2", "API Key", "OAuth2", "Bearer Token", "OAuth2"],
    "AI": ["API Key", "API Key", "API Key", "Bearer Token", "OAuth2"],
}

_MOCK_ACCESS_MODELS = {
    "CRM": ["Self-Serve", "Self-Serve", "Self-Serve", "Trial", "Paid Plan Required"],
    "Support": ["Self-Serve", "Self-Serve", "Trial", "Self-Serve", "Contact Sales"],
    "Communications": ["Self-Serve", "Self-Serve", "Self-Serve", "Self-Serve", "Paid Plan Required"],
    "Marketing": ["Self-Serve", "Self-Serve", "Contact Sales", "Self-Serve", "Self-Serve"],
    "Ecommerce": ["Self-Serve", "Self-Serve", "Self-Serve", "Admin Approval", "Self-Serve"],
    "Data/SEO": ["Self-Serve", "Self-Serve", "Self-Serve", "Paid Plan Required", "Contact Sales"],
    "Developer Tools": ["Self-Serve", "Self-Serve", "Self-Serve", "Self-Serve", "Self-Serve"],
    "Productivity": ["Self-Serve", "Self-Serve", "Self-Serve", "Self-Serve", "Trial"],
    "Finance": ["Self-Serve", "Trial", "Contact Sales", "Self-Serve", "Paid Plan Required"],
    "AI": ["Self-Serve", "Self-Serve", "Self-Serve", "API Key", "Self-Serve"],
}

_MOCK_API_TYPES = {
    "CRM": ["REST", "REST", "REST", "REST", "Mixed"],
    "Support": ["REST", "REST", "REST", "REST", "REST"],
    "Communications": ["REST", "REST", "REST", "REST", "Mixed"],
    "Marketing": ["REST", "REST", "REST", "REST", "REST"],
    "Ecommerce": ["REST", "REST", "REST", "GraphQL", "REST"],
    "Data/SEO": ["REST", "REST", "REST", "REST", "REST"],
    "Developer Tools": ["REST", "GraphQL", "REST", "REST", "REST"],
    "Productivity": ["REST", "REST", "REST", "REST", "REST"],
    "Finance": ["REST", "REST", "REST", "REST", "REST"],
    "AI": ["REST", "REST", "REST", "REST", "REST"],
}

_MOCK_BLOCKERS = [
    "None identified",
    "Rate limiting on free tier",
    "Complex OAuth flow",
    "Limited API documentation",
    "Enterprise-only API access",
    "Webhook configuration required",
    "API versioning complexity",
    "None identified",
    "Sandbox environment required",
    "None identified",
]

_MOCK_DESCRIPTIONS = {
    "CRM": "Customer relationship management platform for sales teams",
    "Support": "Customer support and helpdesk ticketing platform",
    "Communications": "Business communication and messaging platform",
    "Marketing": "Marketing automation and campaign management platform",
    "Ecommerce": "E-commerce and payment processing platform",
    "Data/SEO": "Data analytics and search engine optimization platform",
    "Developer Tools": "Software development and collaboration platform",
    "Productivity": "Productivity and project management platform",
    "Finance": "Financial management and accounting platform",
    "AI": "Artificial intelligence and machine learning platform",
}


class MockResearchAgent(BaseResearchAgent):
    """Simulated research agent for testing without API calls."""

    async def research_app(self, app_name: str, category: str, website: str) -> ResearchFindings:
        """Generate deterministic mock research findings."""
        logger.info(f"[MOCK] Researching: {app_name}")

        # Simulate processing delay
        await asyncio.sleep(random.uniform(0.1, 0.5))

        # Use app name hash for deterministic but varied results
        seed = hash(app_name) % 100

        auth_pool = _MOCK_AUTH_METHODS.get(category, ["API Key", "OAuth2", "Unknown"])
        access_pool = _MOCK_ACCESS_MODELS.get(category, ["Self-Serve", "Trial", "Unknown"])
        api_pool = _MOCK_API_TYPES.get(category, ["REST", "Unknown"])

        # Deterministic selection based on seed
        auth = auth_pool[seed % len(auth_pool)]
        access = access_pool[seed % len(access_pool)]
        api_type = api_pool[seed % len(api_pool)]
        breadth = ["Narrow", "Medium", "Broad", "Medium"][seed % 4]
        mcp = ["No", "No", "No", "Unknown", "Yes", "Partial"][seed % 6]
        buildability = ["High", "Medium", "High", "Medium", "Low"][seed % 5]
        blocker = _MOCK_BLOCKERS[seed % len(_MOCK_BLOCKERS)]
        description = _MOCK_DESCRIPTIONS.get(category, "SaaS platform")

        findings = ResearchFindings(
            app_name=app_name,
            category=category,
            website=website or f"https://www.{app_name.lower().replace(' ', '')}.com",
            description=f"{description} — {app_name}",
            auth_method=auth,
            access_model=access,
            api_type=api_type,
            api_breadth=breadth,
            mcp_availability=mcp,
            buildability_verdict=buildability,
            main_blocker=blocker,
            evidence_urls=[
                f"https://docs.{app_name.lower().replace(' ', '')}.com/api",
                f"https://developer.{app_name.lower().replace(' ', '')}.com",
            ],
            raw_notes=f"[MOCK] Simulated research for {app_name}. Not real data.",
            search_queries_used=[f"[MOCK] {app_name} API docs"],
        )

        logger.info(f"[MOCK] Completed: {app_name} (auth={auth}, api={api_type})")
        return findings


# ===========================
# Factory
# ===========================

def get_research_agent() -> BaseResearchAgent:
    """Get the appropriate research agent based on config mode."""
    settings = get_settings()
    if settings.is_mock_mode:
        logger.info("Using MockResearchAgent (simulation mode)")
        return MockResearchAgent()
    else:
        logger.info("Using LiveResearchAgent (real API mode)")
        return LiveResearchAgent()
