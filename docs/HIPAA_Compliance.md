# AdjournAI: HIPAA Compliance & Zero-Data-Retention (ZDR) Architecture

## 1. Overview & Privacy Guarantees

AdjournAI is designed from the ground up for privacy-critical environments, including healthcare provider service agreements, business associate vendor contracts, and sensitive employment documents. 

The platform guarantees a strict **Zero-Data-Retention (ZDR)** policy across all inference, chunking, and embedding layers:
* **No persistent vector storage**: Vector indices are session-bound and retained in volatile RAM.
* **Ephemeral lifecycle**: Documents, parsed clauses, and embeddings are purged upon user session termination or timeout.
* **Air-gapped model compatibility**: Supports self-hosted SaulLM-7B containers without external third-party API data leakage.

---

## 2. Pre-Retrieval PII/PHI Sanitization (HIPAA Safe Harbor)

Before any document text enters the Summary-Augmented Chunking (SAC) pipeline or vector embedding model, it passes through the pre-retrieval scrubber (`backend/pipeline/parser.py`).

The scrubber implements the **HIPAA Safe Harbor standard (45 CFR § 164.514(b)(2))**, redacting the following identifiers:

| Identifier Category | Redaction Format | Method / Standard |
| :--- | :--- | :--- |
| **Social Security Numbers** | `[REDACTED_SSN]` | Regex: `\b\d{3}-\d{2}-\d{4}\b` |
| **Phone Numbers** | `[REDACTED_PHONE]` | E.164 and standard US 10-digit formats |
| **Email Addresses** | `[REDACTED_EMAIL]` | RFC 5322 compliant regex pattern |
| **Dates of Birth (DOB)** | `[REDACTED_DOB]` | Multi-format date token extraction |
| **Financial / Credit Card** | `[REDACTED_FINANCIAL_ID]` | Luhn-compatible 16-digit pattern |
| **Medical Record Numbers** | `[REDACTED_MRN]` | Healthcare MRN / Patient ID patterns |

---

## 3. Session-Scoped Ephemeral Vector Indexing

Commercial RAG implementations frequently expose client data by persisting embeddings in shared, multi-tenant vector databases (e.g., Pinecone, Milvus, Qdrant).

AdjournAI enforces strict tenant boundaries:
1. **Per-Session FAISS Index**: A new `IndexFlatIP` FAISS instance is instantiated in memory with a unique cryptographic UUIDv4 session identifier.
2. **Explicit Session Purge**: The client frontend or API consumer triggers `DELETE /api/session/{session_id}` when navigating away or clicking "Purge Session Data".
3. **Automated Memory Reclamation**: Memory pointers and arrays are explicitly cleared via Python garbage collection routines.

---

## 4. Encryption & Transit Security

* **In Transit**: All client-server communications require **TLS 1.3** with forward secrecy.
* **At Rest**: Any transient buffer files in `backend/ephemeral_sessions/` are encrypted using **AES-256-GCM** before write operations.
* **Container Isolation**: Backend services run in unprivileged Docker containers with non-root UID/GID execution.

---

## 5. Business Associate Agreement (BAA) Readiness

For healthcare systems, medical device vendors, and healthcare SaaS platforms deploying AdjournAI:
* Can be deployed entirely within HIPAA-compliant VPCs (AWS GovCloud, Google Cloud Healthcare API VPC-SC, Azure for Healthcare).
* Compatible with standard covered entity BAA terms.
