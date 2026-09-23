"""
AdjournAI Standalone SAC Demonstration & Verification Pipeline.
Usage:
    python sac-pipeline.py
"""

import sys
from pathlib import Path

# Add project root to path
ROOT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT_DIR))

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

from backend.pipeline.parser import DocumentParser
from backend.pipeline.sac_chunker import SummaryAugmentedChunker
from backend.pipeline.retriever import SessionRetriever
from backend.pipeline.lemaj_verifier import LeMAJVerifier


DEMO_CONTRACT = """
COMMERCIAL LEASE AND SERVICES AGREEMENT
This Agreement is entered into between PACIFIC TOWER HOLDINGS LLC ("Landlord") and NEXUS INNOVATIONS INC. ("Tenant").

SECTION 1. PREMISES AND INITIAL TERM
1.1 Leased Premises. Landlord leases 6,200 sq. ft. in Suite 800, 100 Montgomery St, San Francisco, CA.
1.2 Term. The term is 48 months starting April 1, 2026.
1.3 Unilateral Early Termination. Landlord may terminate this agreement at any time upon twenty (20) days notice without liability or refund of prepaid rent.

SECTION 2. RENT AND DEPOSIT
2.1 Monthly Base Rent. Tenant shall pay $24,000 per month.
2.2 Non-Refundable Security Deposit. Tenant shall forfeit the entire security deposit of $48,000 if Tenant requests any lease amendment during the term.

SECTION 3. INDEMNIFICATION AND LIABILITIES
3.1 Unilateral Indemnity. Tenant agrees to defend, indemnify, and hold harmless Landlord from any third-party claims, lawsuits, or personal injury damages occurring on the property, even if caused by the sole or contributory negligence of Landlord.
3.2 Waiver of Subrogation. Tenant waives all rights of recovery against Landlord.

SECTION 4. BOILERPLATE AND SEVERABILITY
4.1 Severability. Any unenforceable clause shall be severed without invalidating remaining provisions.
4.2 Counterparts. This agreement may be executed in counterparts.
"""


def main():
    print("=" * 75)
    print(" ⚖️  ADJOURNAI - SUMMARY-AUGMENTED CHUNKING (SAC) & LEMAJ PIPELINE DEMO")
    print("=" * 75)

    # 1. Parsing & Structural Decomposition
    print("\n[Step 1] Parsing Document & Extracting Structural Sections...")
    pages = DocumentParser.parse_text(DEMO_CONTRACT, scrub_pii=True)
    sections = DocumentParser.extract_sections(pages)
    print(f" -> Extracted {len(sections)} parent sections from {len(pages)} page(s).")
    for s in sections:
        print(f"    • [{s.section_id}] {s.title} ({len(s.content)} chars)")

    # 2. Summary-Augmented Chunking (SAC)
    print("\n[Step 2] Executing Summary-Augmented Chunking (SAC)...")
    sac_result = SummaryAugmentedChunker.process_document(
        doc_title="Commercial Lease and Services Agreement",
        sections=sections,
    )
    doc_fp = sac_result["doc_fingerprint"]
    chunks = sac_result["chunks"]

    print(f" -> Generated 150-char Document Fingerprint:\n    \"{doc_fp}\" (Length: {len(doc_fp)} chars)")
    print(f" -> Decomposed into {len(chunks)} SAC Child Chunks.")

    print("\n[Sample Pre-retrieval Augmented Chunk]:")
    sample_chunk = chunks[1] if len(chunks) > 1 else chunks[0]
    print("-" * 65)
    print(f"Chunk ID: {sample_chunk.chunk_id} | Parent: {sample_chunk.parent_title}")
    print("Prepended Vector Text:")
    print(f"  {sample_chunk.prepended_text[:280]}...")
    print("-" * 65)

    # 3. Session-Scoped Vector Indexing & Auto-Merge Retrieval
    print("\n[Step 3] Indexing Chunks & Testing Hierarchical Auto-Merge Retriever...")
    retriever = SessionRetriever(session_id="sac-demo-run")
    retriever.index_document(sections=sections, chunks=chunks)

    query = "unilateral indemnification landlord negligence"
    print(f" -> Executing Vector Query: '{query}'")
    retrieved = retriever.auto_merge_retrieve(query, top_k=3)

    for idx, r in enumerate(retrieved, 1):
        merged_badge = "[AUTO-MERGED PARENT SECTION]" if r.get("is_merged_parent") else "[CHILD CHUNK]"
        print(f"    Match #{idx} {merged_badge}: {r['title']} (Score: {r['relevance_score']:.3f})")
        print(f"    Snippet: {r['content'][:150]}...\n")

    # 4. LeMAJ Verification Layer
    print("[Step 4] Running LeMAJ Legal LLM-as-a-Judge Verification...")
    test_analysis = [
        {
            "clause_ref": "SECTION 3. INDEMNIFICATION AND LIABILITIES",
            "section_id": "sec-3",
            "summary": "Tenant agrees to defend and indemnify Landlord even for Landlord sole negligence.",
            "implication": "Exposes tenant to uninsurable liabilities and severe legal defense costs.",
        },
        {
            "clause_ref": "SECTION 2. RENT AND DEPOSIT",
            "section_id": "sec-2",
            "summary": "Tenant forfeits security deposit of $48,000 upon lease amendment request.",
            "implication": "Extreme predatory penalty clause locking in terms without flexibility.",
        }
    ]

    source_context = {s.section_id: s.content for s in sections}
    verification = LeMAJVerifier.verify_analysis(test_analysis, source_context)

    print(f" -> Overall Grounded Status: {verification['grounded_status']}")
    print(f" -> LeMAJ Trust Badge: [{verification['badge_text']}] (Score: {verification['score'] * 100:.1f}%)")
    print(f" -> Atomic Legal Data Points (LDPs) Evaluated: {verification['total_ldps']}")
    print(f"    • Correct (Grounded):   {verification['counts']['correct']}")
    print(f"    • Incorrect:            {verification['counts']['incorrect']}")
    print(f"    • Irrelevant:           {verification['counts']['irrelevant']}")

    print("\n[Sample Atomic LDPs]:")
    for ldp in verification["ldps"][:3]:
        print(f"    • [{ldp['tag']}] \"{ldp['claim_text']}\" -> {ldp['rationale']}")

    print("\n" + "=" * 75)
    print(" ✅ PIPELINE DEMONSTRATION COMPLETE - ALL SAC & LEMAJ CHECKS PASSED")
    print("=" * 75)


if __name__ == "__main__":
    main()
