# Bariwala Hub — Business Rules & Decisions

This document records all business decisions made by the project owner and flags items that still need decisions.

## Confirmed Decisions

### BD-001: Subscription Model
- **Decision:** Free trial first-time only, 5 days.
- **Implication:** Each organization gets one trial upon creation. No re-trial. After 5 days, subscription is required to continue.

### BD-002: Rent Receipt Disclaimer
- **Decision:** Include disclaimer text following the House Rent Control Act, 1991 of Bangladesh.
- **Draft text (requires legal review):**
  > "This is a digitally generated rent receipt issued through Bariwala Hub for recordkeeping purposes. This receipt records the payment details as entered by the issuing party. Bariwala Hub does not independently verify the accuracy of the payment or guarantee compliance with the House Rent Control Act, 1991. For legally prescribed receipt formats, please consult relevant legal authorities."
- **Status:** Draft — needs final approval before Phase 11.

### BD-003: Data Retention
- **Decision:** 1 to 2 years for archived tenant data, old invoices, and audit logs.
- **Implementation:** Soft-delete for tenant records. Archived data retained for 2 years, then eligible for permanent deletion upon admin action. Audit logs retained for 2 years minimum.

### BD-004: WhatsApp Provider
- **Decision:** Twilio or Meta Cloud API (to be finalized).
- **Recommendation:** Meta Cloud API (WhatsApp Business Platform) — direct from Meta, lower per-message cost, no intermediary markup. Twilio adds a convenience layer but at higher cost. Both are production-grade and reliable.
- **Status:** Needs final selection before Phase 16.

### BD-005: Email Provider
- **Decision:** AWS SES for production transactional email.
- **Dev environment:** Mailpit (local SMTP capture).

### BD-006: Standard Rent Rules
- **Decision:** Manual entry only. No automated standard rent calculation or guidance.
- **Implementation:** Optional fields to record standard rent amount, source, and determination date. Purely informational.

### BD-007: Rent Increase Rules
- **Decision:** Purely manual. No automated validation or caps.
- **Implementation:** Record current rent, new rent, effective date, reason, and agreement. No system-enforced limits.

### BD-008: Refund Policy
- **Decision:** Refunds only if rent was paid in advance and the tenant has to leave.
- **Implementation:** Refund is recorded as a separate payment record with type `refund`, linked to the original payment. Requires owner/authorized role approval.

### BD-009: Invoice Auto-Send
- **Decision:** Auto-send invoices to tenants upon generation.
- **Implementation:** When an invoice is generated (manually or by scheduler), it is automatically sent via configured notification channels (email, and optionally WhatsApp when enabled).

### BD-010: Domain & Deployment
- **Decision:** To be decided later.
- **Status:** Deferred to Phase 20.

---

## Pending Decisions

These will be flagged again when their respective phases arrive:

| # | Decision Needed | Phase | Current Default |
|---|----------------|-------|-----------------|
| 1 | Final subscription tier names, pricing, and unit limits | 19 | Free trial (5 days) only |
| 2 | Final receipt disclaimer text (legal review) | 11 | Draft provided above |
| 3 | WhatsApp: Twilio vs Meta Cloud API final selection | 16 | Leaning Meta Cloud API |
| 4 | Exact data retention period (1 year or 2 years?) | 6 | Default to 2 years |
| 5 | Domain name and VPS provider | 20 | TBD |

---

## Rules That Are NOT Business Decisions

The following are engineering rules derived from the specification. They do not require business approval:

- Money stored as integer poisha (BIGINT).
- Timestamps stored in UTC, displayed in Asia/Dhaka.
- Invoice generation is idempotent (no duplicates).
- Payments and invoices are separate entities (never merged).
- Historical lease records are preserved (never overwritten).
- Tenant data is soft-deleted, not hard-deleted.
- Authorization is enforced server-side (frontend checks are UX only).
- File uploads are validated (MIME, size, extension).
- Audit logs do not contain secrets.
