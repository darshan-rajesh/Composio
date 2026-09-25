# Composio SaaS Research Engine & Case Study Platform

An end-to-end, autonomous research pipeline and analytics system that automatically researches 100 SaaS applications, verifies technical specifications using multi-agent workflows, incorporates a human audit/trust mechanism, and presents insights via an interactive dashboard and standalone case study website.

---

##  Architecture & System Overview

```
                          ┌────────────────────────┐
                          │   Input: 100 Apps CSV  │
                          └───────────┬────────────┘
                                      │
                                      ▼
                          ┌────────────────────────┐
                          │     Research Agent     │
                          │ (Tavily Search + LLM)  │
                          └───────────┬────────────┘
                                      │
                                      ▼
                          ┌────────────────────────┐
                          │   Verification Agent   │
                          │ (Independent Auditor)  │
                          └───────────┬────────────┘
                                      │
                                      ▼
                          ┌────────────────────────┐
                          │ Confidence Score Engine│
                          │   (Additive + Penalty) │
                          └───────────┬────────────┘
                                      │
                                      ▼
                          ┌────────────────────────┐
                          │     SQLite Database    │
                          └───────────┬────────────┘
                                      │
       ┌──────────────────────────────┼──────────────────────────────┐
       ▼                              ▼                              ▼
┌──────────────┐              ┌──────────────┐              ┌──────────────┐
│  React App   │              │ Human Audit  │              │ Case Study   │
│  Dashboard   │              │   Workflow   │              │ Generator    │
└──────────────┘              └──────────────┘              └──────────────┘
```

---

##  Features

1. **Autonomous Research Agent**: Researches 100 SaaS applications by executing multi-hop Tavily web searches and extracting structured specs (Auth protocols, API types, SDK availability, Webhook support, and Model Context Protocol / MCP readiness).
2. **Multi-Agent Verification**: An independent agent cross-references findings against official documentation to detect hallucinations, flag contradictions, and adjust confidence scores.
3. **Confidence Scoring Engine**: Algorithmic scoring (0–100%) incorporating documentation quality, auth validation, and multi-source corroboration.
4. **Human Audit & Trust Module**: Interactive UI for auditing sampled applications, recording pre/post accuracy metrics, flagging discrepancies, and tracking hallucination rates.
5. **Interactive React Analytics Dashboard**: Rich visualizations with Chart.js, KPI metric cards, searchable/filterable dataset tables, and real-time execution progress tracking.
6. **Standalone Case Study Generator**: Generates a self-contained HTML case study with embedded interactive charts, complete architectural breakdown, honest limitations report, and actionable recommendations.

---

##  Quick Start Guide

### Prerequisites
- **Python 3.10+**
- **Node.js 18+** & `npm`
- **OpenAI API Key** (`OPENAI_API_KEY`)
- **Tavily API Key** (`TAVILY_API_KEY`)

---

### Step 1: Backend Setup

```bash
# Navigate to project root
cd e:\composio

# Create & activate virtual environment (optional)
python -m venv venv
.\venv\Scripts\activate   # Windows

# Install Python dependencies
pip install -r requirements.txt

# Create .env file from example
copy .env.example .env

# Set your API Keys in .env:
# OPENAI_API_KEY=sk-...
# TAVILY_API_KEY=tvly-...
```

Run the backend API server:
```bash
uvicorn backend.main:app --reload --port 8000
```
API Documentation will be accessible at `http://localhost:8000/docs`.

---

### Step 2: Frontend Setup

Open a new terminal window:
```bash
cd e:\composio\frontend

# Install dependencies (already included in repository setup)
npm install

# Start development server
npm run dev
```
Open `http://localhost:5173` in your browser to access the interactive dashboard.

---

##  Running the Autonomous Research Pipeline

1. **Via Dashboard UI**:
   - Open the web application at `http://localhost:5173`.
   - Click **🚀 Start Pipeline Run** in the header banner.
   - Watch live progress as the agents research, verify, and populate the database.

2. **Via CLI Execution**:
   ```bash
   python -m backend.agents.research_agent
   ```

---

##  Conducting Human Audits & Generating Reports

- **Human Audit**: Navigate to the **🛡️ Human Audit & Trust** tab on the React web app. Review sampled apps, flag discrepancies, add notes, and compute post-audit accuracy metrics.
- **Export Case Study**: Click **📄 Export Case Study HTML** on the top right. A standalone report will be written to `reports/final_report.html`.

---

##  Repository Structure

```
e:\composio\
├── backend/
│   ├── main.py                  # FastAPI application entry point
│   ├── config.py                # Environment configuration
│   ├── database.py              # SQLite database schema & CRUD helpers
│   ├── models.py                # Pydantic schemas for request/response
│   ├── agents/
│   │   ├── research_agent.py    # Primary research agent using Tavily + GPT-4o-mini
│   │   ├── verification_agent.py# Independent cross-validation agent
│   │   └── prompts.py           # Structured prompts
│   ├── services/
│   │   ├── confidence.py        # Additive confidence scoring engine
│   │   ├── audit.py             # Stratified sampling & audit metrics engine
│   │   ├── analytics.py         # Statistical analysis service
│   │   └── case_study.py        # Jinja2 HTML report generator
│   ├── routers/                 # FastAPI REST endpoint routes
│   └── templates/
│       └── case_study.html      # Self-contained report HTML template
├── frontend/
│   ├── src/
│   │   ├── components/          # KPICards, Charts, DataTable, AuditPanel, etc.
│   │   ├── pages/               # Dashboard & Audit views
│   │   ├── api.js               # Axios API client
│   │   ├── App.jsx              # Main shell component
│   │   └── index.css            # Tailwind CSS design system
├── data/
│   └── apps.csv                 # 100 Curated SaaS applications dataset
├── database/
│   └── research.db              # SQLite storage (generated on runtime)
├── reports/
│   └── final_report.html        # Generated case study report
├── requirements.txt
├── .env.example
└── README.md
```
