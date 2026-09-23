# AdjournAID ⚖️🤖

> **🏆 Chosen Challenge Vertical:** **AI for Legal Assistance & Access**  
> **Democratized Legal Navigation & Contract Comprehension Platform**  
> _An open-access, GenAI-powered educational co-pilot helping consumers, tenants, and small business owners understand, compare, and navigate complex contracts with expert-level precision—without unauthorized practice of law (UPL)._

[![Tests: Passing](https://img.shields.io/badge/Tests-10%2F10%20Passing-emerald)](backend/tests/test_pipeline.py)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Zero-Data-Retention](https://img.shields.io/badge/Privacy-Zero--Data--Retention-indigo)](docs/HIPAA_Compliance.md)
[![WCAG 2.1 AA](https://img.shields.io/badge/Accessibility-WCAG%202.1%20AA-purple)](docs/EVALUATION_GUIDE.md#3--accessibility-inclusive-and-usable-design)
[![Cloud Run Ready](https://img.shields.io/badge/Deploy-Google%20Cloud%20Run-blue)](deploy-cloudrun.sh)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-adjournaid.dharmik.me-success)](https://adjournaid.dharmik.me/)

> 🌐 **Live Production App (Custom Domain):** [https://adjournaid.dharmik.me/](https://adjournaid.dharmik.me/)  
> ☁️ **Google Cloud Run Direct URL:** [https://adjournaid-981533950453.us-central1.run.app/](https://adjournaid-981533950453.us-central1.run.app/)  
> 📖 **Interactive OpenAPI / Swagger Docs:** [https://adjournaid.dharmik.me/docs](https://adjournaid.dharmik.me/docs)  
> 🩺 **Real-Time Health & Telemetry API:** [https://adjournaid.dharmik.me/api/health](https://adjournaid.dharmik.me/api/health)

---

## 📌 Executive Overview

Legal documents—commercial leases, SaaS master agreements, vendor contracts, and terms of service—are dense, ambiguous, and heavily asymmetric. Non-lawyers often face prohibitive hourly legal fees ($350–$600/hr) just to understand basic obligations, while general-purpose commercial LLMs suffer from high legal hallucination rates and retain sensitive customer data.

**AdjournAID** solves this as a **trust-first, educational legal co-pilot**. It combines:

1. **Summary-Augmented Chunking (SAC)** to eliminate Document-Level Retrieval Mismatch.
2. **Hierarchical Parent-Child Auto-Merge Retriever** in session-scoped FAISS memory.
3. **Hybrid Model Engine**: Toggle seamlessly between **Google Cloud Vertex AI (Gemini 2.0 Flash)**, **Local SaulLM-7B (vLLM Air-Gapped)**, and an **Offline Deterministic Fallback Engine**.
4. **Legal LLM-as-a-Judge (LeMAJ)**: Atomic fact verification tagging claims as `<Correct>`, `<Incorrect>`, or `<Irrelevant>`.
5. **Interactive Dual-Pane Synchronized UI**: Proportional scroll locking, click-to-verify clause highlighting, Warm Paper (☀️) and Soft Dark (🌙) ergonomics, and WCAG 2.1 AA keyboard navigation.

---

## ✨ Key Capabilities & Architectural Innovations

### 1. Dual-Pane Synchronized Document Viewer

- **Proportional Scroll Sync**: Proportional scroll-ratio tracking links the original contract on the left with CLAIM insights on the right.
- **Click-to-Verify Citation Mapping**: Clicking any risk card smoothly scrolls the left pane to the exact clause and triggers a soft glow focus highlight (`.clause-highlight-active`).
- **Progressive Margin Risk Badges**: Color-coded indicators:
  - 🔴 **Red**: Unilateral liability, uninsurable indemnity, acceleration traps.
  - 🟡 **Amber**: Off-market terms, automatic multi-year renewal lock-ins.
  - 🔵 **Blue**: Customary commercial boilerplate.

### 2. Summary-Augmented Chunking (SAC) Pipeline

- **Mitigating Document-Level Retrieval Mismatch (DRM)**: Traditional chunking shreds context, causing retrievers to pull text without contract identity.
- **Contextual Fingerprint Prepending**: Generates a **150-character synthetic document fingerprint** and prepends it along with the parent section title to every **500-character child chunk**:
  ```text
  [DOC SUMMARY: Commercial Lease. Core terms: ...] [SECTION: SECTION 4. INDEMNIFICATION] 4.1 Unilateral Indemnification...
  ```
- **Hierarchical Auto-Merge**: If 2 or more sibling child chunks match a query, the retriever collapses them into the comprehensive parent section, preventing fragmented context.

### 3. Hybrid Inference Engine (Cloud + Local Air-Gapped)

- **Google Cloud Vertex AI & Gemini 2.0**: Native integration via the `google-genai` SDK for high-speed structured CLAIM outputs.
- **SaulLM-7B-Instruct (Concept A)**: Compatible with local OpenAI-compatible vLLM containers running domain-specialized legal models.
- **Offline Deterministic Heuristic Engine**: Zero-dependency offline engine for local testing, CI/CD, and air-gapped environments.
- **Real-Time Engine Switcher**: Toggle engines on-the-fly via the top navbar dropdown or `POST /api/provider`.

### 4. Legal LLM-as-a-Judge (LeMAJ) Verification Layer

- Deconstructs AI assertions into atomic **Legal Data Points (LDPs)**.
- Cross-references claims against source clauses and applies factual tags:
  - `<Correct>`: Grounded in source text.
  - `<Incorrect>`: Contradicts contract text (hallucination).
  - `<Irrelevant>`: Subjective extrapolation or general commentary.
- Displays visual verification badges: **"Verified Grounded"** (Score ≥ 85%) or **"Verification Required"**.

### 5. Privacy, Zero-Data-Retention (ZDR) & Security

- **Pre-Retrieval HIPAA Safe Harbor PII Scrubbing**: SSNs, phone numbers, email addresses, DOBs, and medical record numbers are redacted _before_ vectorization.
- **Indirect Prompt Injection Neutralization**: Protects against adversarial document overrides (e.g. `[SYSTEM: ...]`, `Ignore prior instructions`).
- **Session-Scoped Memory & 30-Min TTL Garbage Collection**: Vector indices and document dictionaries live strictly in volatile memory. A background TTL sweeps and erases idle sessions after 30 minutes.
- **DoS Protection**: Upload payload size strictly enforced at **10 MB** (`HTTP 413`).
- **Non-UPL Compliance**: All responses and headers include educational copilot disclaimers (`X-Legal-Disclaimer`).

### 6. Actionable Deliverables (CLAIM Framework)

- **Mode 1: Contract Risk Review (`Alt + 1`)**: Clause-by-clause exposure analysis with counter-proposals and Red/Amber/Blue severity indicators.
- **Mode 2: Plain English Simplification (`Alt + 2`)**: Demystifies legalese into actionable 8th-grade reading level takeaways.
- **Mode 3: Contract Redlines (`Alt + 3`)**: Proposed balanced replacement text with negotiation rationales.
- **Mode 4: Attorney Consultation Brief & Action Checklist (`Alt + 4`)**: Synthesizes red flags, counsel questions, estimated legal fee savings ($875–$1,225+), interactive pre-signing checklist, and print-ready export (`window.print()`).
- **Mode 5: Interactive Legal Q&A & Citation Navigator (`Alt + 5`)**: Asks natural language questions grounded in contract excerpts with click-to-verify clause highlighting.
- **Mode 6: Fair-Market Baseline Benchmark (`Alt + 6`)**: Side-by-side comparison of agreement terms against commercial market baselines (Favorable, Standard, Off-Market, Hostile).

## 🏗️ Technical Architecture Diagram

```text
 ┌──────────────────────────────────────────────────────────────────────────────────┐
 │                                CLIENT INTERFACE                                  │
 │   • React 18 + Vite + Tailwind CSS + Lucide Icons                                │
 │   • Dual-Pane Viewer with Proportional Scroll Lock & Click-to-Verify Citations   │
 │   • Reading Themes: ☀️ Warm Paper (#FAF9F6) & 🌙 Soft Dark (#0F172A)            │
 │   • WCAG 2.1 AA Keyboard Shortcuts: Alt+1..4 (Tabs), Alt+S (Sync), Alt+T (Theme)│
 └────────────────────────────────────────┬─────────────────────────────────────────┘
                                          │  REST API (Axios Client with Interceptors)
                                          ▼
 ┌──────────────────────────────────────────────────────────────────────────────────┐
 │                           FASTAPI BACKEND GATEWAY                                │
 │   • Correlation Tracking (X-Request-ID) & Non-UPL Educational Disclaimers        │
 │   • Upload Guard (10MB Max File Limit) & ZDR 30-Min TTL Garbage Collector        │
 └───────────────────┬──────────────────────────────────────────────┬───────────────┘
                     │                                              │
                     ▼                                              ▼
 ┌──────────────────────────────────────┐       ┌───────────────────────────────────┐
 │       INGESTION & PRE-RETRIEVAL      │       │     RETRIEVAL & VECTOR ENGINE     │
 │ • Parser: PDF, DOCX, & Plain Text    │       │ • Session-Scoped Ephemeral FAISS  │
 │ • HIPAA Safe Harbor PII Scrubber     │       │ • Auto-Merge Sibling Collapse     │
 │ • Prompt Injection Neutralizer       │       │ • Fallback Hashing Dense Embedder │
 │ • Summary-Augmented Chunker (SAC)    │       │   (Sub-ms instant startup)        │
 └───────────────────┬──────────────────┘       └───────────────────┬───────────────┘
                     │                                              │
                     └──────────────────────┬───────────────────────┘
                                            ▼
 ┌──────────────────────────────────────────────────────────────────────────────────┐
 │                            UNIFIED INFERENCE SERVICE                             │
 │                         (backend/services/inference_service)                     │
 └──────────────┬───────────────────────────┬───────────────────────────────┬───────┘
                │                           │                               │
                ▼                           ▼                               ▼
 ┌─────────────────────────────┐ ┌─────────────────────────────┐ ┌──────────────────┐
 │   Google Cloud Vertex AI    │ │    Local SaulLM-7B (vLLM)   │ │  Deterministic   │
 │   Gemini 2.0 Flash / Pro    │ │  (Concept A: Air-Gapped)    │ │  Fallback Engine │
 │   (Concept B: Google GenAI) │ │  OpenAI-Compatible Endpoint │ │  (Zero-Dep)      │
 └──────────────┬──────────────┘ └──────────┬──────────────────┘ └──────────┬───────┘
                │                           │                               │
                └───────────────────────────┼───────────────────────────────┘
                                            ▼
 ┌──────────────────────────────────────────────────────────────────────────────────┐
 │                     LEMAJ FACT VERIFICATION & OUTPUT ENGINE                      │
 │ • Splits claims into Atomic Legal Data Points (LDPs)                             │
 │ • Tags facts: <Correct>, <Incorrect>, <Irrelevant> against source clauses        │
 │ • Emits trust badge: "Verified Grounded" vs "Verification Required"              │
 └──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📂 Project Repository Structure

```
AdjournAID/
├── backend/
│   ├── main.py                        # 📄 PAGES: Clean ~50-line FastAPI server entrypoint
│   ├── config.py                      # Backward-compatibility re-export shim -> infra/config/env.py
│   ├── requirements.txt               # Backend Python Dependencies
│   ├── Dockerfile                     # Backend Container Definition
│   ├── core/                          # ⚛️ ATOMS: Core domain business logic
│   │   ├── entities/                  # Document, Claim, and Verification data classes
│   │   ├── value_objects/             # RiskLevel, VerificationTag Enums
│   │   └── exceptions.py              # Domain exceptions (SessionNotFoundError, FileTooLargeError, etc.)
│   ├── services/                      # 🧪 MOLECULES: Basic data operations & utilities
│   │   ├── repositories/              # IDocumentRepository, SessionVectorRepository, VectorRepositoryManager
│   │   ├── utils/                     # HIPAA PII scrubber, Prompt injection sanitizer
│   │   ├── sac_service.py             # Summary-Augmented Chunking service
│   │   ├── verifier_service.py        # LeMAJ Verification service
│   │   └── inference_service.py       # Inference facade
│   ├── use_cases/                     # 🧫 ORGANISMS: Core feature orchestration
│   │   ├── ingest_document.py         # IngestDocumentUseCase (parse, scrub, chunk, index)
│   │   ├── analyze_contract.py        # AnalyzeContractUseCase (retrieve, infer, verify)
│   │   ├── purge_session.py           # PurgeSessionUseCase (ZDR instant purge & idle TTL cleanup)
│   │   └── sample_contracts.py        # SampleContractsUseCase (catalog & direct session loading)
│   ├── delivery/                      # 📋 TEMPLATES: HTTP delivery layer
│   │   └── http/
│   │       ├── controllers/           # Document, Analysis, Sample, Session, Health controllers
│   │       ├── routes/                # api_router.py with prefix /api
│   │       └── schemas/               # Request/Response DTO models (Pydantic)
│   ├── infra/                         # 🔌 THE PLUGS: External adapters & infrastructure
│   │   ├── config/                    # env.py (Settings & constants)
│   │   ├── parsers/                   # PDF, DOCX, TXT, and section extraction
│   │   ├── vector_store/              # FAISS index and Dense embedding fallback
│   │   └── llm/                       # InferenceEngine (Vertex AI, SaulLM-7B, Fallback)
│   ├── pipeline/                      # Re-export compatibility layer for existing scripts
│   ├── prompts/
│   │   └── claim_templates.py         # CLAIM Framework Prompt Engineering Templates
│   └── tests/
│       └── test_pipeline.py           # 9-Suite Automated Integration Test Pipeline
├── frontend/
│   ├── package.json                   # React 18, Vite, Tailwind CSS, Lucide Icons, Axios
│   ├── vite.config.js                 # Dev Server & Proxy Configuration
│   ├── Dockerfile                     # Multi-Stage Production Container Build
│   ├── src/
│   │   ├── App.jsx                    # Root Coordinator, Keyboard Shortcuts & Skip Link
│   │   ├── main.jsx                   # React Entrypoint
│   │   ├── index.css                  # Custom Typography, Animations & Scrollbars
│   │   ├── constants/                 # typography.js (centralized typography tokens)
│   │   ├── hooks/                     # useSyncScroll.js (proportional scroll synchronization)
│   │   ├── services/
│   │   │   └── api.js                 # Centralized API Client with Timeout & Error Handling
│   │   ├── styles/
│   │   │   └── viewer.css             # Dual-Pane Styling, Parchment Themes & Print Styles
│   │   └── components/
│   │       ├── atoms/                 # Button, Badge, SearchInput, MetricStat, Kbd
│   │       ├── molecules/             # FontSizeSelector, ThemeToggle, SyncScrollToggle, TaskTabNav, CalloutBox
│   │       ├── organisms/             # ViewerToolbar, ContractSourcePane, ClaimAnalysisPane, RiskReviewList, etc.
│   │       └── templates/             # MainLayout, DualPaneTemplate
├── docs/
│   ├── EVALUATION_GUIDE.md            # Comprehensive Hackathon Evaluation Rubric & Matrix
│   ├── AdjournAID-Architecture-Guide.md# Concept A (Local) vs Concept B (Cloud) Blueprint
│   └── HIPAA_Compliance.md            # ZDR, Safe Harbor De-Identification & Privacy Specs
├── deploy-cloudrun.sh                 # Google Cloud Run Deployment Script (Bash)
├── deploy-cloudrun.ps1                # Google Cloud Run Deployment Script (PowerShell)
├── docker-compose.yml                 # Multi-Container Orchestration (Ports 8000 & 3000)
├── sac-pipeline.py                    # Standalone CLI Verification Demo Script
├── .env.example                       # Environment Configuration Template
├── README.md                          # Master Project Overview
└── LICENSE                            # MIT License
```

---

## 🚀 Quickstart & Installation

### Option A: Local Development (Instant Startup)

**1. Backend Setup:**

```bash
# Navigate to project root
cd AdjournAID

# Create and activate virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Start FastAPI backend
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

**2. Frontend Setup:**

```bash
# Navigate to frontend directory
cd frontend

# Install npm dependencies
npm install

# Start Vite dev server
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

### Option B: Docker Compose

Run the entire full-stack application with a single command:

```bash
docker compose up --build
```

- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost:8000`

---

### Option C: Google Cloud Run Deployment (Concept B)

Deploy both the backend and frontend to Google Cloud Run using the automated deployment scripts:

**Linux / macOS (Bash):**

```bash
chmod +x deploy-cloudrun.sh
./deploy-cloudrun.sh YOUR_PROJECT_ID us-central1
```

**Windows (PowerShell):**

```powershell
.\deploy-cloudrun.ps1 -ProjectId YOUR_PROJECT_ID -Region us-central1
```

---

## ⚙️ Configuration & Environment Variables

Copy `.env.example` to `.env` to configure your desired inference provider:

```bash
cp .env.example .env
```

| Variable                | Description                         | Default                    | Options                                            |
| :---------------------- | :---------------------------------- | :------------------------- | :------------------------------------------------- |
| `LLM_PROVIDER`          | Active inference provider           | `fallback`                 | `vertex_ai`, `gemini`, `local_saul_lm`, `fallback` |
| `GOOGLE_CLOUD_PROJECT`  | Google Cloud Project ID (Vertex AI) | `""`                       | e.g. `my-gcp-project`                              |
| `GOOGLE_CLOUD_LOCATION` | Google Cloud Region                 | `us-central1`              | `us-central1`, `us-east4`, etc.                    |
| `GEMINI_MODEL`          | Gemini Model Identifier             | `gemini-2.0-flash`         | `gemini-2.0-flash`, `gemini-1.5-pro`               |
| `GEMINI_API_KEY`        | Direct API key (alternative to ADC) | `""`                       | Key from Google AI Studio                          |
| `SAULLM_API_URL`        | Local vLLM endpoint for SaulLM-7B   | `http://localhost:8000/v1` | Custom endpoint                                    |
| `HOST` / `PORT`         | Backend binding address and port    | `0.0.0.0` / `8000`         | Any valid host/port                                |

> [!TIP]
> You do **not** need an API key to test AdjournAID! The built-in **Deterministic Fallback Engine** runs 100% offline with zero dependencies and high legal fidelity.

---

## 🧪 Testing & Validation

AdjournAID features comprehensive automated test coverage across unit, pipeline, security, and API layers.

```bash
# 1. Run the 9-Suite Backend Test Pipeline
python backend/tests/test_pipeline.py

# 2. Run the Standalone SAC & LeMAJ Verification CLI Demo
python sac-pipeline.py

# 3. Verify Frontend Production Build
cd frontend && npm run build
```

### Automated Test Coverage Summary:

- `test_pii_phi_scrubbing`: Validates HIPAA Safe Harbor de-identification (SSN, Phone, Email).
- `test_sac_chunking_pipeline`: Confirms 150-char synthetic fingerprinting and header prepending.
- `test_session_retriever_auto_merge`: Tests FAISS vector indexing and parent-child sibling collapsing.
- `test_lemaj_verifier`: Tests atomic LDP decomposition and factual tagging.
- `test_fastapi_endpoints`: End-to-end testing of sample contract loading, CLAIM analysis, and ZDR purge.
- `test_prompt_injection_defense`: Validates neutralization of adversarial prompt overrides.
- `test_session_ttl_and_garbage_collection`: Verifies automatic 30-min idle session memory erasure.
- `test_security_headers_and_upload_limits`: Tests non-UPL headers, correlation IDs, and 10MB upload limits.
- `test_lemaj_boundary_conditions`: Tests 100% false / hallucination detection and scoring resilience.

---

## 🏆 Evaluation Rubric Alignment

For competition judges and evaluators, consult [**`docs/EVALUATION_GUIDE.md`**](docs/EVALUATION_GUIDE.md) for direct line-by-line code mappings across all 5 evaluation focus areas:

- **Security (High Impact)**: HIPAA Safe Harbor anonymization, indirect prompt injection defense, Zero-Data-Retention ephemeral storage, 30-min TTL purge, 10MB DoS payload limit, non-UPL disclaimers.
- **Efficiency (High Impact)**: SAC eliminates DRM without token bloat, Hierarchical Auto-Merge collapses sibling chunks, Context Token Budgeting (4000 char cap), lightweight feature-hashing embedder.
- **Accessibility (High Impact)**: Full WCAG 2.1 AA keyboard navigation (`Alt+1..4`, `Alt+S`, `Alt+T`, `?`), skip link, ARIA landmarks (`role="tablist"`, `aria-live="polite"`), Warm Paper & Soft Dark modes, 3-tier font scaler, `@media print` brief layout.
- **Testing (High Impact)**: 10 comprehensive automated test suites covering happy paths, file security, token context budgeting, adversarial injections, TTL expiration, and boundary hallucinations.
- **Code Quality (Medium Impact)**: Centralized frontend `api.js` client with `X-Request-ID` correlation, Pydantic type models, zero monolithic methods (<60 lines), modular pipelines.

---

## 📋 Key Assumptions & Educational Non-UPL Scope

In accordance with hackathon guidelines and legal engineering best practices, AdjournAID operates strictly under the following foundational assumptions:

1. **Educational Co-Pilot Boundary (Non-UPL)**: The platform provides document literacy, structured issue spotting, and negotiation preparation. It does **not** engage in the Unauthorized Practice of Law (UPL), establish an attorney-client relationship, or generate binding legal representation.
2. **Pre-Consultation Triage Purpose**: All deliverables (Risk Reviews, Simplifications, Redlines, Benchmarks, and Briefs) are designed to empower non-lawyers to hold focused, cost-effective consultations with licensed legal professionals.
3. **Zero-Data-Retention (ZDR)**: Ephemeral in-memory vector indexing assumes that contract text contains sensitive personal or commercial information. Vector indices are strictly scoped to the active session and automatically swept after 30 minutes of inactivity.
4. **Jurisdictional Baseline**: Baseline market comparisons reflect prevailing US commercial common law standards and general Uniform Commercial Code (UCC) principles unless state-specific governing law is explicitly cited.

---

## 🛡️ Non-UPL Legal Disclaimer

**AdjournAID is an educational co-pilot and document comprehension utility.** It **does not provide formal legal advice** and is not a substitute for representation by a licensed attorney. All deliverables (summaries, redlines, and briefs) are designed strictly to prepare consumers and small business owners for efficient, well-informed consultations with qualified legal counsel.

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for details.
