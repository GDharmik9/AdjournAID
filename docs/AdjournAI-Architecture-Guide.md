# AdjournAID: Architecture Comparison & Concept Guide

This document clarifies and separates the two architectural concepts discussed for **AdjournAID**:

1. **Concept A: Local / Open-Source System Architecture** (The core privacy-first design).
2. **Concept B: Google Cloud & Vertex AI Architecture** (The hackathon deployment & evaluation design).

---

## Part 1: Concept A — Local & Open-Source Architecture (Privacy & ZDR Focus)

This architecture was designed for maximum data privacy, air-gapped security, zero third-party API dependencies, and strict Zero-Data-Retention (ZDR).

### 1. Core Model & Inference Layer

- **Primary LLM**: **SaulLM-7B-Instruct** (a 7-billion parameter legal model trained on a 30B-token legal corpus).
- **Inference Engine**: Local air-gapped **vLLM** container running on GPU/CPU infrastructure.
- **Data Privacy**: No data leaves the container boundary; zero third-party API calls.

### 2. Context Engineering & RAG Pipeline

- **Summary-Augmented Chunking (SAC)**: Prepends a 150-character synthetic document summary to 500-character child chunks prior to embedding, reducing Document-Level Retrieval Mismatch (DRM) by >50%.
- **Hierarchical Auto-Merge Retriever**: Indexes small child chunks in a local **FAISS** or **ChromaDB** vector database. Automatically collapses adjacent child chunks into full parent section nodes during generation.

### 3. Verification & Hallucination Defense

- **LeMAJ Framework**: Decomposes generated AI answers into atomic **Legal Data Points (LDPs)**.
- **Reference-Free Scoring**: Fact-checks LDPs against source documents and tags them as `<Correct>`, `<Incorrect>`, `<Irrelevant>`, or `<Missing>`.
- **UI Badges**: Displays _"Verified Grounded"_ vs. _"Verification Required"_ badges on margin risk cards.

### 4. User Experience & Interface (Lazarev Principles)

- **3-Tier Progressive Disclosure**:
  - **Tier 1**: At-a-glance executive dashboard.
  - **Tier 2**: Color-coded expandable margin risk cards (**Red** = High Risk, **Amber** = Off-Market, **Blue** = Standard Boilerplate).
  - **Tier 3**: Click-to-verify source anchoring with synchronized PDF scrolling.
- **CLAIM Prompt Framework**: Prompts structured around **C**ontext, **L**egal Task, **A**udience, **I**nstructions, **M**ode of Output.

### 5. Security & HIPAA Compliance

- **Pre-Retrieval Scrubbing**: Masks PII and Protected Health Information (PHI) prior to vector embedding.
- **Session Ephemerality**: Vector indexes exist only for the user's active session and are auto-purged on disconnect.

---

## Part 2: Concept B — Google Cloud & Vertex AI Architecture (Hackathon Deployment Focus)

This architecture adapts AdjournAID for Google Cloud Platform (GCP) to provide a live deployment URL (`.a.run.app`), satisfy hackathon submission criteria, and leverage Vertex AI tools.

### 1. Cloud Model & Grounding Layer

- **Primary LLM**: **Gemini 1.5 Flash / Gemini 1.5 Pro** via **Vertex AI API**.
- **Context Capacity**: 1,000,000-token context window capable of ingesting entire 700+ page legal dockets in a single prompt.
- **Grounding Engine**: **Vertex AI Search & Google Search Grounding** (verifies statutory references and checks live legal regulations).
- **Enterprise Grounding Capability**: Supports third-party legal data grounding (e.g., Thomson Reuters / Westlaw).

### 2. Hosting & Cloud Infrastructure

- **Google Cloud Run (Frontend)**: Hosts the React Dual-Pane viewer in a serverless container providing a public HTTPS URL.
- **Google Cloud Run (Backend)**: Hosts the FastAPI microservice.
- **Google Cloud Storage (GCS)**: Stores temporary contract PDFs during active sessions.
- **Vertex AI Embeddings**: Uses `text-embedding-004` alongside the SAC chunking pipeline.

### 3. Hackathon Evaluation Alignment

- **Live Link**: Provides required `.a.run.app` URLs for judges to test the live web app.
- **GCP Services Rating**: Leverages Cloud Run, Vertex AI Gemini 1.5, Vertex AI Grounding, `text-embedding-004`, and GCS for maximum platform integration score.

---

## Part 3: Comparison Matrix

| Feature / Dimension       | Concept A (Local / Open-Source Stack) | Concept B (Google Cloud / Vertex AI Stack) |
| :------------------------ | :------------------------------------ | :----------------------------------------- |
| **Primary LLM**           | SaulLM-7B-Instruct (Local vLLM)       | Gemini 1.5 Flash / Pro (Vertex AI API)     |
| **Context Window**        | RAG Chunked (SAC + Auto-Merge)        | 1,000,000 Tokens + SAC RAG                 |
| **Vector DB / Retrieval** | Local FAISS / ChromaDB                | Vertex AI Search / Cloud Vector Search     |
| **Real-Time Grounding**   | Local LeMAJ LDP Verification          | Vertex AI Search Grounding + LeMAJ         |
| **Deployment Target**     | On-Premise / Air-Gapped Docker        | Google Cloud Run (`.a.run.app`)            |
| **Best Used For**         | Enterprise legal privacy & local ZDR  | Hackathon live demo, submission & scaling  |

---

## Part 4: Recommended Hybrid Implementation Strategy

You do **not** need to choose one over the other! You can implement a **provider toggle** in `backend/config.py`:

```python
# backend/config.py
import os

LLM_PROVIDER = os.getenv("LLM_PROVIDER", "vertex_ai")  # "vertex_ai" or "local_saul_lm"

if LLM_PROVIDER == "vertex_ai":
    # Uses Gemini 1.5 Flash on Vertex AI for Cloud Run Hackathon Deployment
    from services.vertex_service import generate_legal_analysis
else:
    # Uses local SaulLM-7B for private, air-gapped deployment
    from services.saul_lm_service import generate_legal_analysis
```

- **For the Hackathon Submission**: Set `LLM_PROVIDER="vertex_ai"` and deploy to Cloud Run to get live URLs and top Google Cloud ratings.
- **In your Pitch & Architecture Specs**: Highlight that AdjournAID supports both **Cloud Run + Vertex AI** (for cloud speed) and **SaulLM-7B + ZDR** (for air-gapped enterprise privacy).
