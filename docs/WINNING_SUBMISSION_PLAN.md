# 🏆 AdjournAID: 99/100 Winning Hackathon Submission & Technical Plan

> **Challenge Track:** AI for Legal Assistance & Access  
> **Target Score:** 99 / 100 (Grand Prize / Winner Tier)  
> **Timeline:** 2-Day Rapid Execution Roadmap  

---

## 📌 Executive Summary & Hackathon Alignment

Legal documents—commercial leases, employment covenants, terms of service, and vendor agreements—are notoriously asymmetric, dense, and opaque. Non-lawyers (tenants, consumers, freelancers, and small business owners) cannot afford $350–$600/hr attorney rates for preliminary document triage, while standard commercial LLMs hallucinate legal facts and violate data confidentiality.

**AdjournAID** solves this directly within the hackathon challenge mandate:
> *"Build a GenAI-powered solution that makes legal information and basic legal assistance more accessible by helping users understand, compare, and navigate legal documents and information."*

To elevate AdjournAID from a strong submission (84/100) to a **99/100 Grand Prize Contender**, this plan executes a two-pronged strategy:
1. **Zero-Mercy Remediation of All Audit Gaps & Hard Rubric Criteria**: Eradicating CLI bugs, enforcing MIME guards, adding client-side correlation IDs, capping context tokens, and hardening accessibility.
2. **High-Impact Differentiating Capabilities**:
   - **Interactive Document Q&A & Dynamic Clause Navigator** (*"Answering questions based on provided legal documents"*).
   - **Contract & Standard Policy Baseline Comparator** (*"Comparing contracts, agreements, or policies"*).
   - **Actionable Decision Tree & Negotiation Next-Steps Checklist** (*"Helping users understand their options and potential next steps & generating checklists"*).
   - **One-Click Attorney Consultation Brief Export** (Print-ready PDF / copy-ready format).

---

## 📊 Comprehensive Gap Analysis & 99/100 Upgrade Matrix

| Parameter & Weight | Current State (84/100) | 99/100 Target State | Key Changes & Implementations |
| :--- | :--- | :--- | :--- |
| **Hard Rules & Hygiene** *(Pass/Fail)* | `sac-pipeline.py` crashes on `r['relevance_score']`. `README.md` lacks explicit challenge vertical title and formal assumptions section. | 100% Pass across all scripts and explicit compliance documentation. | Fix `vector_repo.py` & `sac-pipeline.py`. Update `README.md` with explicit vertical name and assumptions. |
| **Problem Statement Alignment** *(High Impact - 25%)* | 4 CLAIM deliverables implemented (Risk Review, Plain English, Redlines, Brief). | **6 Comprehensive Use Cases**: Adds Interactive Q&A, Contract/Policy Comparator, and Negotiation Checklist. | Expand `api/analyze` with `qa_query` and `comparison` modes; add interactive UI tabs and interactive checklist. |
| **Code Quality & Architecture** *(Medium Impact - 15%)* | Clean Architecture backend & Atomic design frontend. Monolithic fallback method (120 lines). `api.js` missing `X-Request-ID`. | Zero monolithic functions (<60 lines). Full end-to-end correlation tracing (`X-Request-ID`). Modular handlers. | Refactor `_run_fallback()` into modular strategies. Add Axios request interceptor with `crypto.randomUUID()`. |
| **Security & Safety** *(High Impact - 20%)* | Zero hardcoded keys, HIPAA Safe Harbor PII scrubbing, indirect prompt injection defense, 30-min ZDR TTL. Backend upload lacks MIME type check. | Strict MIME validation (`.pdf`, `.docx`, `.txt`, `.md`). Hard 10MB upload ceiling (`HTTP 413` & `HTTP 415`). | Add server-side extension and MIME validation in `ingest_document.py` and `document_controller.py`. |
| **Efficiency & Performance** *(Medium Impact - 15%)* | SAC 500-char child chunks + 150-char synthetic fingerprint. Sub-ms fallback embedder. Context cap was not enforced in code. | Strict 4,000-char context window budgeting enforced in `_format_contexts()`. Instant offline fallback. | Enforce `max_context_chars=4000` with graceful boundary truncation in `InferenceEngine`. |
| **Accessibility (WCAG 2.1 AA)** *(High Impact - 15%)* | Keyboard shortcuts (`Alt+1..4`, `Alt+S`, `Alt+T`, `?`), 3-tier font scaling, Warm Paper theme. Missing live polite regions & print trigger. | Full WCAG 2.1 AA: `aria-live="polite"` status announcer, `window.print()` button on Attorney Brief, keyboard navigation for all tabs (`Alt+1..6`). | Add live status announcer in `MainLayout.jsx`. Wire up `Printer` button in `ConsultationBrief.jsx`. |
| **Testing & Evaluation** *(High Impact - 10%)* | 9/9 backend tests pass. Frontend builds. `sac-pipeline.py` had crash. | 10/10 automated backend tests pass, standalone CLI demo runs with zero errors, frontend builds with 0 warnings. | Add `test_file_type_restrictions` and `test_context_budgeting` to `test_pipeline.py`. Ensure CLI demo runs end-to-end. |

---

## 🏛️ System Architecture & Workflow

```text
 ┌────────────────────────────────────────────────────────────────────────────────────────┐
 │                                   REACT 18 CLIENT                                      │
 │  • Dual-Pane Synchronized Layout (Proportional Scroll Sync + Glow Clause Citation)    │
 │  • 6 Navigation Modes: Risk Review, Plain English, Redlines, Brief, Q&A, Compare      │
 │  • WCAG 2.1 AA: Alt+1..6 Hotkeys, Alt+S (Sync), Alt+T (Theme), Live Polite Announcer  │
 │  • Centralized Axios with X-Request-ID, 90s Timeout, and Error Normalization           │
 └───────────────────────────────────────────┬────────────────────────────────────────────┘
                                             │ REST API (X-Request-ID, X-Legal-Disclaimer)
                                             ▼
 ┌────────────────────────────────────────────────────────────────────────────────────────┐
 │                              FASTAPI APPLICATION GATEWAY                               │
 │  • Security Headers: X-Legal-Disclaimer, X-Zero-Data-Retention, X-Content-Type-Options │
 │  • Upload Guard: 10MB Ceiling & Strict MIME Validation (.pdf, .docx, .txt, .md)       │
 │  • Ephemeral Session TTL Manager: 30-minute idle garbage collection                    │
 └────────────────────┬──────────────────────────────────────────────┬────────────────────┘
                      │                                              │
                      ▼                                              ▼
 ┌──────────────────────────────────────────┐   ┌─────────────────────────────────────────┐
 │        INGESTION & PRE-RETRIEVAL         │   │        RETRIEVAL & VECTOR ENGINE        │
 │ • File Parsers: PDF, DOCX, TXT           │   │ • Ephemeral FAISS In-Memory Index       │
 │ • HIPAA Safe Harbor PII Scrubber         │   │ • Summary-Augmented Chunks (500 chars)  │
 │ • Prompt Injection Neutralizer           │   │ • 150-char Document Fingerprint         │
 │ • SAC Structural Section Decomposer      │   │ • Auto-Merge Sibling Collapse (>= 2)    │
 └────────────────────┬─────────────────────┘   │ • Sub-ms Fallback Dense Embedder        │
                      │                         └────────────────────┬────────────────────┘
                      └──────────────────────┬───────────────────────┘
                                             ▼
 ┌────────────────────────────────────────────────────────────────────────────────────────┐
 │                          UNIFIED INFERENCE SERVICE & TOKEN BUDGET                      │
 │  • Context Budgeting: Strict 4,000-char truncation ceiling preventing token blowout    │
 │  • Providers: Google Cloud Vertex AI (Gemini 2.0) | Local SaulLM-7B | Modular Fallback │
 └───────────────────────────────────────────┬────────────────────────────────────────────┘
                                             │
                                             ▼
 ┌────────────────────────────────────────────────────────────────────────────────────────┐
 │                        LEMAJ FACT-CHECKING & VERIFICATION ENGINE                       │
 │  • Deconstructs AI output into Atomic Legal Data Points (LDPs)                         │
 │  • Cross-references against source text: <Correct>, <Incorrect>, <Irrelevant>          │
 │  • Emits Groundedness Score & Visual Trust Badges (>= 85% = "Verified Grounded")       │
 └────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Detailed Phase-by-Phase Implementation Plan

### Phase 1: Immediate Audit Remediation (The 84 -> 92 Bridge)
1. **Fix `sac-pipeline.py` & `vector_repo.py`**:
   - In `vector_repo.py`: Ensure `auto_merge_retrieve` injects `"relevance_score": round(ch.get("_score", 1.0), 3)` into both auto-merged parent sections and child chunks.
   - In `sac-pipeline.py`: Change `r['relevance_score']` to `r.get('relevance_score', 1.0)` for safe defensive execution.
2. **Update `README.md`**:
   - Explicitly highlight: **`Chosen Challenge Vertical: "AI for Legal Assistance & Access"`**.
   - Add a structured section: **`## 📋 Key Assumptions & Non-UPL Educational Boundary`**.
3. **MIME Type & Payload Security in Backend**:
   - In `backend/use_cases/ingest_document.py`: Disallow arbitrary file types; enforce that `lower_name` must end with `.pdf`, `.docx`, `.txt`, or `.md`. Raise `DocumentParsingError("Unsupported file type. Please upload a PDF, DOCX, or TXT contract.")` on violations.
4. **Context Token Budgeting (4000-Char Cap)**:
   - In `backend/infra/llm/inference_engine.py`: In `_format_contexts()`, enforce a strict 4000-char budget cap so prompt builders never experience token bloat.
5. **Frontend API Request Correlation**:
   - In `frontend/src/services/api.js`: Add request interceptor injecting `config.headers['X-Request-ID'] = crypto.randomUUID()`.
6. **Refactor Monolithic Fallback**:
   - Decompose `InferenceEngine._run_fallback` (120 lines) into clean modular functions: `_fallback_risk_review()`, `_fallback_simplification()`, `_fallback_redline()`, `_fallback_brief()`.
7. **Accessibility & WCAG Polish**:
   - Add `aria-live="polite"` status announcer container in `MainLayout.jsx`.
   - Wire up `Printer` button in `ConsultationBrief.jsx` with `onClick={() => window.print()}` and `@media print` optimization.

---

### Phase 2: Feature Innovation for Challenge Alignment (The 92 -> 99 Leap)

#### Feature A: Interactive Legal Q&A & Citation Navigator
- **Value Proposition**: Directly addresses the prompt's *"Answering questions based on provided legal documents"* and *"Helping users navigate legal documents"*.
- **Backend**:
  - Add `task_type="qa_query"` to `AnalyzeContractUseCase` with CLAIM prompt template `build_qa_prompt(query, doc_fingerprint, context)`.
  - LeMAJ verification checks answers against source clauses.
- **Frontend**:
  - Interactive "Ask Contract" search input in toolbar/analysis pane.
  - When user asks a question (e.g., *"What is the penalty if I terminate before 48 months?"*), the AI provides a verified answer with an exact clause citation badge. Clicking the badge scrolls to and highlights the clause in the source contract viewer!

#### Feature B: Contract & Standard Policy Baseline Comparator
- **Value Proposition**: Directly addresses the prompt's *"Comparing contracts, agreements, or policies"* and *"Highlighting inconsistencies or off-market terms"*.
- **Backend**:
  - Add `task_type="comparison"` to compare the current agreement against standard market baselines (e.g. Fair Market Commercial Lease Baseline, Standard Non-Disclosure Terms, Consumer Protection Standards).
  - Categorizes clauses into: `Favorable (Aligned)`, `Off-Market (Deviation)`, `Hostile / Uncustomary`.
- **Frontend**:
  - A 5th tab `Compare to Market Baseline` (`Alt + 5`) providing a side-by-side comparative table with risk variance tags.

#### Feature C: Actionable Options & Negotiation Checklist
- **Value Proposition**: Directly addresses *"Helping users understand their options and potential next steps"* and *"Generating summaries, checklists, or other actionable outputs"*.
- **Enhancement**:
  - Add an interactive, checkable **Pre-Signing Action Checklist** inside the Attorney Consultation Brief.
  - Users can check off verified items (e.g., *"Requested mutual indemnification carve-out"*, *"Verified 90-day renewal notice window"*, *"Confirmed landlord HVAC maintenance duty"*), creating an exportable punch list for counsel meetings.

---

### Phase 3: Automated Testing & Submission Verification
1. Run updated 10-suite backend test pipeline (`python backend/tests/test_pipeline.py`).
2. Run standalone SAC CLI test (`python sac-pipeline.py`).
3. Run frontend production build (`cd frontend && npm run build`).
4. Validate container build (`docker build -t adjournaid .`).

---

## 📅 2-Day Execution Timeline & Milestones

- **Day 1 Morning (Hours 0–4)**:
  - Fix all audit blockers: `sac-pipeline.py`, `vector_repo.py`, MIME security, 4000-char context cap, `api.js` `X-Request-ID`.
  - Refactor `InferenceEngine._run_fallback` into modular clean methods.
  - Update `README.md` with explicit challenge vertical and assumptions.
- **Day 1 Afternoon (Hours 4–8)**:
  - Implement Feature A: Interactive Legal Q&A & Citation Navigator in backend and frontend.
  - Implement Feature C: Interactive Action Checklist in `ConsultationBrief.jsx` with print integration.
- **Day 2 Morning (Hours 8–12)**:
  - Implement Feature B: Policy & Contract Comparison mode.
  - Accessibility polish: `aria-live="polite"` status announcer and keyboard hotkeys (`Alt+1..6`).
- **Day 2 Afternoon (Hours 12–16)**:
  - Full end-to-end integration testing, CLI demo run, Docker build verification.
  - Polish presentation documentation (`docs/EVALUATION_GUIDE.md` and `README.md`).
  - Final Go / No-Go review.
