"""
Use case for managing built-in sample legal contracts for instant testing and demonstration.
"""

from typing import List, Dict, Any, Optional
from backend.core.exceptions import SampleNotFoundError

SAMPLE_CONTRACTS: Dict[str, Dict[str, Any]] = {
    "commercial-lease": {
        "id": "commercial-lease",
        "title": "Commercial Office Lease Agreement",
        "description": "Standard office lease featuring aggressive unilateral indemnification and automatic triple-net escalation clauses.",
        "text": """COMMERCIAL OFFICE LEASE AGREEMENT
This Commercial Office Lease Agreement ("Agreement") is made this 15th day of January, 2026, by and between APEX METRO PROPERTIES LLC ("Landlord"), and HORIZON ENTERPRISES INC. ("Tenant").

SECTION 1. LEASED PREMISES AND TERM
1.1 Leased Premises. Landlord hereby leases to Tenant approximately 4,500 rentable square feet known as Suite 400 located at 500 Financial Plaza, San Francisco, CA.
1.2 Initial Term. The term of this Lease shall be for sixty (60) months commencing on March 1, 2026, and expiring on February 28, 2031.
1.3 Automatic Renewal. Tenant agrees that this Lease shall automatically renew for additional successive terms of three (3) years each, unless Tenant delivers written notice of non-renewal via registered mail at least one hundred eighty (180) days prior to the expiration date.

SECTION 2. RENT AND TRIPLE-NET ESCALATION
2.1 Base Rent. Tenant shall pay Base Rent in the amount of $18,500.00 per month, payable on the first day of each calendar month.
2.2 Operating Expense Escalation. Tenant shall pay its proportionate share (12.4%) of all Building Operating Expenses, including maintenance, property taxes, insurance, and Landlord's discretionary capital improvements. Landlord reserves the unilateral right to recalculate operating expense allocations annually without independent audit rights granted to Tenant.

SECTION 3. SECURITY DEPOSIT AND DEFAULT
3.1 Security Deposit. Tenant has deposited $37,000.00 as security.
3.2 Late Fee and Default. Any payment not received within three (3) days of due date shall incur a late charge equal to 12% of the overdue balance. Upon any event of default, Landlord may accelerate all remaining unpaid rent across the entire sixty (60) month term immediately.

SECTION 4. INDEMNIFICATION AND LIABILITY
4.1 Unilateral Indemnification. Tenant shall defend, indemnify, and hold harmless Landlord, its affiliates, agents, and contractors from and against any and all claims, damages, liabilities, losses, costs, and expenses (including attorneys' fees) arising out of or related to the premises or Tenant's occupancy, regardless of whether caused in whole or in part by the active or passive negligence of Landlord.
4.2 Landlord Waiver of Liability. Landlord shall have zero liability for any water damage, power interruption, roof failure, or loss of business suffered by Tenant, and Tenant unconditionally waives all claims for constructive eviction or consequential damages.

SECTION 5. ALTERATIONS AND SURRENDER
5.1 Alterations. Tenant shall make no alterations or improvements without Landlord's prior written consent. All alterations, fixtures, and cabling installed by Tenant shall immediately become the sole property of Landlord upon installation.

SECTION 6. GOVERNING LAW AND DISPUTE RESOLUTION
6.1 Governing Law. This Agreement shall be construed under the laws of the State of Delaware.
6.2 Mandatory Binding Arbitration. Any dispute shall be resolved through binding arbitration in Wilmington, Delaware, with each party bearing its own costs, and Tenant waives all rights to jury trial or class arbitration.

SECTION 7. MISCELLANEOUS BOILERPLATE
7.1 Severability. If any provision of this Lease is held invalid, the remainder shall continue in full force.
7.2 Entire Agreement. This Agreement constitutes the entire agreement between the parties and supersedes all prior representations.
"""
    },
    "saas-msa": {
        "id": "saas-msa",
        "title": "Master Software-as-a-Service (SaaS) Agreement",
        "description": "B2B Cloud Enterprise agreement with strict liability caps, IP ownership forfeiture, and data use rights.",
        "text": """MASTER SERVICES AGREEMENT
This Master Services Agreement ("Agreement") is entered into by CLOUDSTREAM TECH CORP ("Provider") and ACME LOGISTICS CORP ("Customer").

SECTION 1. SUBSCRIPTION SERVICES
1.1 Access Rights. Provider grants Customer a non-exclusive subscription to access the CloudStream Enterprise Platform for Customer's internal operations.
1.2 Usage Restrictions. Customer shall not reverse engineer, benchmark, or create derivative software based on the platform.

SECTION 2. FEES AND PAYMENT
2.1 Subscription Fees. Customer agrees to pay the annual subscription fee of $48,000.00 within fifteen (15) days of invoice date.
2.2 Interest on Overdue Fees. Unpaid amounts incur interest at 1.5% per month or the maximum rate permitted by law.

SECTION 3. DATA RIGHTS AND PRIVACY
3.1 Customer Data. Customer retains ownership of proprietary data uploaded to the service.
3.2 Anonymized Derivative Data. Customer grants Provider an irrevocable, perpetual, royalty-free, worldwide license to aggregate, anonymize, and utilize Customer data for training commercial artificial intelligence models and product enhancements.

SECTION 4. LIMITATION OF LIABILITY
4.1 Aggregate Liability Cap. In no event shall Provider's total aggregate liability arising out of or related to this Agreement exceed fifty dollars ($50.00), or the amount paid by Customer in the one month preceding the incident, whichever is lower.
4.2 Disclaimer of Consequential Damages. Provider expressly disclaims all liability for loss of profits, data corruption, business interruption, or punitive damages, even if advised of the possibility thereof.

SECTION 5. INDEMNITY
5.1 Customer Indemnification. Customer shall defend and hold harmless Provider against any third-party claims alleging that Customer Data infringes third-party rights or violates regulatory privacy standards.

SECTION 6. TERMINATION
6.1 Termination for Convenience. Provider may terminate this Agreement at any time for convenience with ten (10) days written notice without refund of prepaid fees. Customer may only terminate upon uncured material breach by Provider after sixty (60) days written cure notice.

SECTION 7. GENERAL PROVISIONS
7.1 Force Majeure. Neither party shall be liable for delays resulting from events beyond reasonable control.
7.2 Notices. All notices must be delivered via email to legal@cloudstreamtech.io.
"""
    }
}


class SampleContractsUseCase:
    """Provides methods for listing and retrieving built-in contracts."""

    @staticmethod
    def list_catalog() -> List[Dict[str, str]]:
        return [
            {
                "id": k,
                "title": v["title"],
                "description": v["description"],
            }
            for k, v in SAMPLE_CONTRACTS.items()
        ]

    @staticmethod
    def get_sample(sample_id: str) -> Dict[str, Any]:
        if sample_id not in SAMPLE_CONTRACTS:
            raise SampleNotFoundError(f"Sample contract '{sample_id}' not found")
        return SAMPLE_CONTRACTS[sample_id]
