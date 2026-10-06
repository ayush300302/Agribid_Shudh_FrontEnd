AGRIBID SHUDH · DEVELOPMENT SPEC M11

Payments, Credit & Ledger

Module development specification

Contents

0. Module Context & Architecture	3

0.1 Module context diagram	3

0.2 Where this module sits in the system	3

0.3 Network & deployment diagram	4

0.4 Request authorisation (applies to every API in this module)	5

0.5 Conventions summary	5

M11. Payments, Credit & Ledger	6

M11.1 Overview	6

M11.2 Flows	6

M11.3 Data model	7

M11.4 APIs	8

M11.5 Rules	9

M11.6 Events & jobs	9

M11.7 Acceptance criteria	9

M11.8 Build Checklist & Estimate	9

M11.9 Definition of Done	10

0. Module Context & Architecture

This document is the development specification for M11 · Payments, Credit & Ledger of the Agribid Shudh multi-tier distribution app (Agribid → State Stockist → Distributor → Sub-Distributor → Retailer, plus Admin). It is derived from PRD v1.0 and is one of 18 documents; shared standards are detailed in Dev Spec 00 · Architecture & Common Standards.

0.1 Module context diagram

Figure 1: M11 context: clients, dependencies, consumers, data stores and external services

0.2 Where this module sits in the system

All modules run inside one NestJS backend (modular monolith) with background workers. M11 is a code module with its own folder, its own tables, and a public service interface. Other modules call it only through that interface, never by querying its tables directly.

Figure 2: System logical architecture

0.3 Network & deployment diagram

Figure 3: AWS network topology (ap-south-1 Mumbai, two availability zones)

0.4 Request authorisation (applies to every API in this module)

Figure 4: Authentication, permission and data-scope pipeline

0.5 Conventions summary

Base URL /api/v1; JSON camelCase; timestamps ISO-8601 UTC; amounts as 2-decimal strings; quantities 3-decimal.

Errors: { error: { code, message, details, traceId } } with HTTP 400 / 401 / 403 / 404 / 409 / 422 / 429.

Idempotency-Key header on every POST that changes money or stock; cursor pagination (?limit, cursor).

Every table has id (uuid), created_at, updated_at, created_by, updated_by; money NUMERIC(14,2); time stored UTC, business logic in Asia/Kolkata.

Every state or money change writes audit_logs; scope failures return 404 (not 403).

M11. Payments, Credit & Ledger

M11.1 Overview

M11.2 Flows

Figure 5: Collection, credit and overdue control (from PRD)

Figure 6: Online payment and webhook sequence

M11.3 Data model

Table: credit_accounts  ·  one per buyer–seller pair

Table: ledger_entries  ·  append-only

Table: payments

Table: payment_allocations

Table: invoice_balances (view)

M11.4 APIs

M11.5 Rules

M11.6 Events & jobs

M11.7 Acceptance criteria

Given order #ORD-7742 of ₹45,200 paid by POD, when the seller selects 50% and confirms cash receipt, then the order shows PARTIAL with ₹22,600 outstanding and the buyer gets a receipt SMS.

Given a retailer with ₹14,500 outstanding across two invoices, when they pay ₹10,000 by UPI without choosing invoices, then the oldest invoice is settled first and the ledger balance shows ₹4,500.

Given an invoice 8 days overdue with 7 grace days, when the nightly job runs, then the buyer's credit account moves to HOLD and credit checkout is disabled.

M11.8 Build Checklist & Estimate

Estimates are indicative and must be re-estimated by the squad in sprint planning.

M11.9 Definition of Done

Code reviewed and merged; unit and integration tests pass (≥ 80% coverage on business services).

Endpoints documented in OpenAPI; error codes added to the i18n catalogue (en, hi, mr).

Permission code and data scope enforced and covered by positive and negative tests.

Audit log written for every state or money change.

Mobile / web screens match DESIGN.md tokens with empty, loading, error and offline states.

Analytics events fired; acceptance criteria in this document verified by QA.

— End of M11 —

## Table 1

| Field | Detail |
| Document | Dev Spec M11: Payments, Credit & Ledger v1.0 |
| Source | Agribid Shudh PRD v1.0 and Stitch design set |
| Date | 26 September 2026 |
| Target sprint | S4 (credit) · S6 (payments) · Phase 2 (gateway) |
| Depends on | M03 Partner, M06 Ordering, M08 Invoicing, M17 Integrations |
| Read with | Dev Spec 00 · Architecture & Common Standards |
| Status | Draft for engineering review |

## Table 2

| Aspect | Detail |
| Clients | Partner Mobile App · Admin Web Console |
| Depends on | M03 Partner · M06 Ordering · M08 Invoicing · M17 Integrations |
| Used by | M06 Credit check · M07 Auto-close · M14 Collections |
| Data stores | PostgreSQL: credit_accounts, ledger_entries, payments |
| External services | Payment gateway / UPI |

## Table 3

| Layer | Rule relevant to this module |
| Entry | All client and webhook traffic enters through CloudFront + WAF → ALB (HTTPS 443). |
| Compute | M11 APIs run in private ECS API tasks; its async jobs run in worker tasks. No public IPs. |
| Data | PostgreSQL and Redis sit in private data subnets reachable only from app security groups; S3 via VPC endpoint with pre-signed URLs. |
| Egress | Calls to Payment gateway / UPI leave through the NAT Gateway via the M17 adapter layer. |
| Secrets | Keys and credentials come from Secrets Manager; never in code or env files in the repo. |

## Table 4

| Item | Detail |
| Purpose | Credit accounts between each buyer–seller pair; double-entry-style ledger; payment recording (cash, UPI, bank, cheque) and online gateway; allocation; reminders; credit hold. |
| PRD refs | BR-06, BR-07, 9.9 PAY-01..09, ADM-07 |
| Screens | Record Cash Payment ✓, Retailer history / ledger ✓ (Settle), Pay Now ✓, Order list payment filters ✓, Credit summary*, Statement*, Cash reconciliation* |
| Depends on | M03, M06, M08, M17 (payment gateway) |

## Table 5

| Column | Type | Constraints | Notes |
| id | uuid | PK |  |
| buyer_id / seller_id | uuid | UNIQUE pair |  |
| credit_limit | numeric(14,2) | ≤ tier cap |  |
| credit_days / grace_days | smallint |  | defaults from Admin config |
| outstanding | numeric(14,2) |  | maintained by ledger posting |
| overdue_amount / oldest_due_date |  |  | updated by nightly job |
| status | enum | ACTIVE \| HOLD \| CLOSED | HOLD = BR-07 |
| override_until / override_by |  | NULL | temporary Admin override |

## Table 6

| Column | Type | Constraints | Notes |
| id | bigserial | PK |  |
| credit_account_id | uuid | index |  |
| entry_type | enum |  | INVOICE (Dr), PAYMENT (Cr), CREDIT_NOTE (Cr), REFUND (Dr), ADJUSTMENT (Dr/Cr), OPENING |
| debit / credit | numeric(14,2) | one of them > 0 |  |
| balance_after | numeric(14,2) |  |  |
| ref_type / ref_id |  |  | invoice, payment, CN |
| narration / at |  |  |  |

## Table 7

| Column | Type | Constraints | Notes |
| id | uuid | PK |  |
| receipt_no | varchar(20) | UNIQUE | per seller series |
| payer_id / payee_id | uuid |  |  |
| amount | numeric(14,2) | > 0 |  |
| mode | enum |  | CASH, UPI, BANK_TRANSFER, CHEQUE, ONLINE_PG |
| reference_no | varchar(40) |  | UPI ref / UTR / cheque no.; UNIQUE per payee+mode when present |
| cheque_status | enum | NULL | RECEIVED, CLEARED, BOUNCED |
| collected_by_user_id / delivery_partner_id |  |  | cash handover |
| pg_order_id / pg_payment_id |  | UNIQUE | gateway |
| status | enum | PENDING \| SUCCESS \| FAILED \| REVERSED |  |
| received_at / remarks / geo |  |  |  |

## Table 8

| Column | Type | Constraints | Notes |
| payment_id / invoice_id | uuid |  |  |
| amount | numeric(14,2) |  | sum ≤ payment amount; ≤ invoice balance |

## Table 9

| Column | Type | Constraints | Notes |
| invoice_id |  |  | total − allocations − credit notes = balance; days_past_due |

## Table 10

| Method | Endpoint | Permission | Description |
| POST | /payments | payment.record | Seller records receipt {payerId, amount, mode, reference, receivedAt, orderId?, invoiceIds?, remarks}. Idempotency-Key. |
| POST | /payments/intent | payment.pay | Buyer starts online payment for invoices / on-account. |
| POST | /webhooks/pg | HMAC | Gateway callbacks (captured, failed, refunded). |
| GET | /credit/summary?sellerId= | auth | Buyer view: limit, used, available, next due, overdue, status. |
| GET | /ledger?counterpartyId=&from=&to= | scope pair | Ledger lines with running balance (Order / Payment History tabs). |
| GET | /ledger/statement.pdf?counterpartyId=&from=&to= | scope pair | Statement PDF. |
| PATCH | /credit/accounts/:id | credit.set_child | Parent sets child limit / days within cap. |
| POST | /payments/:id/dispute | payment.pay | Buyer flags "payment not recorded". |
| PATCH | /payments/:id/cheque-status | payment.record | Cleared / bounced (bounce reverses allocation, adds charge). |
| GET | /payments/cash-reconciliation?date= | payment.record | Cash collected per collector vs handed over. |
| POST | /admin/credit/accounts/:id/override | credit.override | Temporary lift of hold / limit with expiry and reason. |

## Table 11

| Code | Rule / validation | HTTP · error code |
| PY-01 | Available credit = credit_limit − outstanding − value of open CREDIT orders not yet invoiced. | n/a |
| PY-02 | Payment without invoice list is allocated FIFO to the oldest open invoice; excess stays as on-account credit. | n/a |
| PY-03 | Cash payment ≤ ₹1,99,999 per payer per day (Income-tax Act s.269ST); above that, block cash mode. | 422 · CASH_LIMIT |
| PY-04 | UPI / UTR reference must be unique for the payee; duplicates rejected. | 409 · DUPLICATE_REFERENCE |
| PY-05 | Recorded payments can be reversed only by Admin Finance with reason (reversal entry, never delete). | 403 |
| PY-06 | HOLD when any invoice days_past_due > grace_days; HOLD lifts automatically when overdue = 0 (BR-07). | n/a |
| PY-07 | Child credit_limit ≤ tier cap and ≤ the setter's own authority (config). | 422 · CREDIT_ABOVE_CAP |
| PY-08 | Webhook processing is idempotent on pg_payment_id; the amount must equal the intent amount. | 200 ignore duplicate |

## Table 12

| Event / job | Trigger | Consumers / action |
| payment.received | Payment SUCCESS | Ledger credit, allocation, receipt SMS / PDF, maybe lift HOLD, maybe close orders |
| credit.hold_applied / lifted | Nightly job or payment | Notify buyer and seller |
| job: dues.reminder | Daily 10:00 IST | T-3 days, due day, overdue daily reminders (quiet hours respected) |
| job: credit.recompute | Daily 00:30 IST | Recalculate overdue_amount, apply HOLD |
| job: pg.reconcile | Daily 06:00 IST | Match gateway settlement report to payments; flag mismatches to Finance |

## Table 13

| Item | Detail |
| Target sprint | S4 (credit) · S6 (payments) · Phase 2 (gateway) |
| Indicative effort (person-days) | Backend 12 · Mobile 8 · Admin web 6 · QA 6 · Total 32 |

## Table 14

| Discipline | Tasks |
| Backend | 1. credit_accounts, ledger_entries, payments, allocations
2. Record payment with FIFO allocation
3. Credit summary & available-credit calculation
4. Nightly overdue & hold job, reminders
5. Payment gateway intent + HMAC webhooks
6. Statement PDF, cash reconciliation |
| Mobile (Flutter) | 1. Record Cash Payment (50% / 100% / custom)
2. Ledger with Order / Payment History tabs, Settle
3. Credit summary, Pay Now / Pay dues
4. Payment dispute |
| Admin web | 1. Credit caps & overrides
2. Payments search, reversal, PG reconciliation |
| QA focus | 1. Partial payments & allocation
2. Cash limit 269ST
3. Hold / lift timing
4. Webhook idempotency |
