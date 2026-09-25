"""
LLM prompts for the Research and Verification agents.

All prompts are centralized here for easy tuning.
Each prompt enforces structured JSON output and "never fabricate" behavior.
"""

# ===========================
# Research Agent Prompts
# ===========================

RESEARCH_SYSTEM_PROMPT = """You are a meticulous SaaS research analyst. Your job is to analyze search results 
about a specific SaaS application and extract structured facts.

CRITICAL RULES:
1. NEVER invent or fabricate information. Only report what you can verify from the search results.
2. If information is unclear or unavailable, mark it as "Unknown".
3. Always provide evidence URLs for your claims.
4. Reduce confidence for anything you're uncertain about.
5. Be conservative — it's better to say "Unknown" than to guess wrong.

You must return a valid JSON object with exactly these fields."""

RESEARCH_USER_PROMPT = """Research the following SaaS application using the provided search results.

APPLICATION: {app_name}
CATEGORY: {category}
WEBSITE: {website}

SEARCH RESULTS:
{search_results}

Based ONLY on the search results above, extract the following information. 
If any field cannot be determined from the results, use "Unknown".

Return a JSON object with these exact fields:
{{
    "app_name": "{app_name}",
    "category": "{category}",
    "website": "<official website URL, use '{website}' if not found in results>",
    "description": "<one-line description of what the app does>",
    "auth_method": "<one of: OAuth2, API Key, Basic Auth, Bearer Token, JWT, Session Auth, Other, Unknown>",
    "access_model": "<one of: Self-Serve, Trial, Paid Plan Required, Admin Approval, Contact Sales, Partnership Required, Unknown>",
    "api_type": "<one of: REST, GraphQL, RPC, Mixed, None, Unknown>",
    "api_breadth": "<one of: Narrow, Medium, Broad, Unknown — based on number of API endpoints/resources>",
    "mcp_availability": "<one of: Yes, No, Partial, Unknown — whether MCP (Model Context Protocol) server exists>",
    "buildability_verdict": "<one of: High, Medium, Low, Unknown — how easy it is to build an integration>",
    "main_blocker": "<primary barrier to integration, or 'None identified'>",
    "evidence_urls": ["<list of source URLs that support your findings>"],
    "reasoning": "<brief explanation of your analysis and any uncertainties>"
}}

IMPORTANT: Return ONLY the JSON object. No markdown, no explanation outside the JSON."""

# ===========================
# Search Query Templates
# ===========================

SEARCH_QUERIES = [
    "{app_name} API documentation developer",
    "{app_name} authentication method OAuth API key",
    "{app_name} developer portal API reference",
    "{app_name} pricing self-serve API access",
    "{app_name} MCP model context protocol server",
]

# ===========================
# Verification Agent Prompts
# ===========================

VERIFICATION_SYSTEM_PROMPT = """You are an independent fact-checker for SaaS application research.
Your role is to CRITICALLY evaluate research findings and identify potential errors.

CRITICAL RULES:
1. Be SKEPTICAL. Do not assume the original research is correct.
2. Cross-reference claims against the search results.
3. Flag contradictions between different sources.
4. If you cannot verify a claim, mark it as unverified.
5. Provide specific corrections when you find errors.
6. It's better to flag a potential error than to miss one.

You are NOT trying to confirm the research. You are trying to FIND MISTAKES."""

VERIFICATION_USER_PROMPT = """Independently verify the following research findings about a SaaS application.

APPLICATION: {app_name}

ORIGINAL RESEARCH FINDINGS:
{research_findings}

VERIFICATION SEARCH RESULTS (independently gathered):
{search_results}

For each field, determine if the original finding is correct based on the verification search results.

Return a JSON object with these exact fields:
{{
    "app_name": "{app_name}",
    "verification_status": "<one of: Verified, Partially Verified, Unverified, Contradicted>",
    "field_verifications": [
        {{
            "field_name": "auth_method",
            "original_value": "<from original research>",
            "verified": <true or false>,
            "corrected_value": "<correct value if different, or null>",
            "verification_note": "<explanation>"
        }},
        {{
            "field_name": "access_model",
            "original_value": "<from original research>",
            "verified": <true or false>,
            "corrected_value": "<correct value if different, or null>",
            "verification_note": "<explanation>"
        }},
        {{
            "field_name": "api_type",
            "original_value": "<from original research>",
            "verified": <true or false>,
            "corrected_value": "<correct value if different, or null>",
            "verification_note": "<explanation>"
        }},
        {{
            "field_name": "api_breadth",
            "original_value": "<from original research>",
            "verified": <true or false>,
            "corrected_value": "<correct value if different, or null>",
            "verification_note": "<explanation>"
        }},
        {{
            "field_name": "mcp_availability",
            "original_value": "<from original research>",
            "verified": <true or false>,
            "corrected_value": "<correct value if different, or null>",
            "verification_note": "<explanation>"
        }},
        {{
            "field_name": "buildability_verdict",
            "original_value": "<from original research>",
            "verified": <true or false>,
            "corrected_value": "<correct value if different, or null>",
            "verification_note": "<explanation>"
        }}
    ],
    "corrections_made": <number of fields corrected>,
    "verification_confidence": <0-100 score of how confident you are in verification>,
    "verification_notes": "<summary of verification findings, contradictions, concerns>"
}}

IMPORTANT: Return ONLY the JSON object. No markdown, no explanation outside the JSON."""

VERIFICATION_SEARCH_QUERIES = [
    "{app_name} API documentation authentication",
    "{app_name} developer docs REST GraphQL",
    "{app_name} MCP server model context protocol",
    "{app_name} integration pricing API access tier",
]

# ===========================
# Insights Generation Prompt
# ===========================

INSIGHTS_SYSTEM_PROMPT = """You are a product strategy analyst. Given aggregated data about 
SaaS applications and their integration characteristics, generate actionable insights.
Focus on patterns, opportunities, and strategic observations relevant to building 
an AI agent toolkit platform like Composio."""

INSIGHTS_USER_PROMPT = """Analyze the following aggregated research data about {total_apps} SaaS applications 
and generate strategic insights.

DISTRIBUTION DATA:
- Authentication Methods: {auth_dist}
- Access Models: {access_dist}  
- API Types: {api_dist}
- Buildability: {build_dist}
- MCP Availability: {mcp_dist}
- Categories: {category_dist}
- Common Blockers: {blocker_dist}

SUMMARY METRICS:
- Average Confidence Score: {avg_confidence}
- High Confidence Apps (>70): {high_conf}
- Low Confidence Apps (<40): {low_conf}

Generate 8-12 strategic insights. For each insight, provide:
{{
    "insights": [
        {{
            "title": "<short insight title>",
            "description": "<2-3 sentence detailed observation>",
            "category": "<one of: auth, access, buildability, mcp, opportunity, risk, trend>",
            "data_point": "<specific number or percentage that supports this>"
        }}
    ]
}}

Focus on:
1. Which auth methods dominate and what that means for integration builders
2. Self-serve vs gated patterns and which categories are most accessible
3. Buildability patterns — what makes apps easy or hard to integrate
4. MCP adoption trends and gaps
5. Biggest opportunities for an AI agent toolkit platform
6. Key risks or blockers to watch out for

Return ONLY the JSON object."""
