AGRIBID SHUDH · DEVELOPMENT SPEC M08

Invoicing & GST Compliance

Module development specification

Contents

0. Module Context & Architecture	3

0.1 Module context diagram	3

0.2 Where this module sits in the system	4

0.3 Network & deployment diagram	4

0.4 Request authorisation (applies to every API in this module)	5

0.5 Conventions summary	5

M08. Invoicing & GST Compliance	6

M08.1 Overview	6

M08.2 Flow	6

M08.3 Data model	6

M08.4 APIs	7

M08.5 Rules	8

M08.6 Acceptance criteria	8

M08.8 Build Checklist & Estimate	8

M08.9 Definition of Done	9

0. Module Context & Architecture

This document is the development specification for M08 · Invoicing & GST Compliance of the Agribid Shudh multi-tier distribution app (Agribid → State Stockist → Distributor → Sub-Distributor → Retailer, plus Admin). It is derived from PRD v1.0 and is one of 18 documents; shared standards are detailed in Dev Spec 00 · Architecture & Common Standards.

0.1 Module context diagram

Figure 1: M08 context: clients, dependencies, consumers, data stores and external services

0.2 Where this module sits in the system

All modules run inside one NestJS backend (modular monolith) with background workers. M08 is a code module with its own folder, its own tables, and a public service interface. Other modules call it only through that interface, never by querying its tables directly.

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

M08. Invoicing & GST Compliance

M08.1 Overview

M08.2 Flow

Figure 5: Invoice generation with e-Invoice and e-Way bill

M08.3 Data model

Table: invoice_series  ·  one per seller per FY

Table: invoices

Table: credit_notes

M08.4 APIs

M08.5 Rules

M08.6 Acceptance criteria

Given a distributor intra-state order of ₹7,400 + 5% GST, when the order is packed, then the invoice shows CGST ₹185 and SGST ₹185 and the total ₹7,770.

Given a SS-to-DS order in a different state, when the invoice is generated, then IGST is applied instead of CGST / SGST.

Given a GSP outage, when an invoice is generated, then the invoice is issued as IRN_PENDING and IRN is added automatically when the GSP recovers.

M08.8 Build Checklist & Estimate

Estimates are indicative and must be re-estimated by the squad in sprint planning.

M08.9 Definition of Done

Code reviewed and merged; unit and integration tests pass (≥ 80% coverage on business services).

Endpoints documented in OpenAPI; error codes added to the i18n catalogue (en, hi, mr).

Permission code and data scope enforced and covered by positive and negative tests.

Audit log written for every state or money change.

Mobile / web screens match DESIGN.md tokens with empty, loading, error and offline states.

Analytics events fired; acceptance criteria in this document verified by QA.

— End of M08 —

## Table 1

| Field | Detail |
| Document | Dev Spec M08: Invoicing & GST Compliance v1.0 |
| Source | Agribid Shudh PRD v1.0 and Stitch design set |
| Date | 26 September 2026 |
| Target sprint | S5 (PDF) · Phase 2 (IRN / e-way) |
| Depends on | M07 Fulfilment, M11 Ledger, M17 Integrations |
| Read with | Dev Spec 00 · Architecture & Common Standards |
| Status | Draft for engineering review |

## Table 2

| Aspect | Detail |
| Clients | Partner Mobile App · Admin Web Console |
| Depends on | M07 Fulfilment · M11 Ledger · M17 Integrations |
| Used by | M09 Delivery - e-way bill · M11 Payments · M12 Credit notes |
| Data stores | PostgreSQL: invoices, invoice_series, credit_notes · S3: invoice PDFs |
| External services | GSP: e-Invoice IRN · NIC e-Way Bill via GSP |

## Table 3

| Layer | Rule relevant to this module |
| Entry | All client and webhook traffic enters through CloudFront + WAF → ALB (HTTPS 443). |
| Compute | M08 APIs run in private ECS API tasks; its async jobs run in worker tasks. No public IPs. |
| Data | PostgreSQL and Redis sit in private data subnets reachable only from app security groups; S3 via VPC endpoint with pre-signed URLs. |
| Egress | Calls to GSP: e-Invoice IRN, NIC e-Way Bill via GSP leave through the NAT Gateway via the M17 adapter layer. |
| Secrets | Keys and credentials come from Secrets Manager; never in code or env files in the repo. |

## Table 4

| Item | Detail |
| Purpose | Generate GST tax invoices, credit notes and receipts; e-Invoice IRN and e-Way bill via GSP; PDF storage and sharing. |
| PRD refs | BR-10, SOM-05, 9.12 RET-02, integrations (Section 15 of PRD) |
| Screens | Generate Invoice CTA ✓ (order detail), Invoice preview / share*, Download invoice ✓ (buyer), Admin invoice search |
| Depends on | M07, M11, M17 (GSP) |

## Table 5

| Column | Type | Constraints | Notes |
| seller_id + fy | composite PK |  | fy = "2627" |
| prefix | varchar(5) |  | e.g. D0987 |
| next_seq | int |  | incremented under row lock; no gaps allowed |
| doc_type | enum | INV \| CN | credit notes have their own series |

## Table 6

| Column | Type | Constraints | Notes |
| id | uuid | PK |  |
| invoice_no | varchar(16) | UNIQUE(seller_id, invoice_no) | GST limit 16 chars |
| order_id | uuid | FK UNIQUE | one invoice per order in phase 1 |
| seller_id / buyer_id | uuid |  |  |
| seller_gstin / buyer_gstin / place_of_supply | varchar |  | snapshot |
| invoice_date | date |  |  |
| taxable, cgst, sgst, igst, round_off, total | numeric(14,2) |  |  |
| irn / ack_no / ack_date / signed_qr | text | NULL | e-Invoice |
| irn_status | enum | NA \| PENDING \| GENERATED \| FAILED \| CANCELLED |  |
| eway_bill_no / eway_valid_upto |  | NULL |  |
| pdf_key | text |  | S3 |
| due_date | date |  | invoice_date + credit days (CREDIT orders) |
| status | enum | ISSUED \| CANCELLED | cancel within 24 h only if not dispatched |

## Table 7

| Column | Type | Constraints | Notes |
| id / cn_no |  |  | CN series |
| invoice_id | uuid | FK |  |
| reason | enum |  | RETURN, SHORTAGE, DAMAGE, PRICE_DIFF, SCHEME |
| amounts | numeric |  |  |
| pdf_key | text |  |  |

## Table 8

| Method | Endpoint | Permission | Description |
| POST | /orders/:id/invoice | invoice.generate | Generate (or return existing) invoice; normally auto on PACKED. |
| GET | /invoices/:id/pdf | scope buyer / seller | Pre-signed PDF URL (15 min). |
| GET | /invoices?role=buyer\|seller&from=&to= | invoice.view | List / search invoices. |
| POST | /invoices/:id/cancel | invoice.cancel | Only before dispatch and within 24 h; cancels IRN. |
| POST | /invoices/:id/eway-bill | invoice.generate | Create e-way bill with vehicle no. (auto at dispatch). |
| POST | /invoices/:id/share | invoice.view | Send via SMS / WhatsApp link. |

## Table 9

| Code | Rule / validation | HTTP · error code |
| IN-01 | Invoice numbers are consecutive per seller per FY; a failed transaction must not consume a number (allocate inside the same DB txn). | n/a |
| IN-02 | Seller must have GSTIN to issue a tax invoice; RT-to-consumer billing is out of scope. | 422 · SELLER_GSTIN_MISSING |
| IN-03 | e-Invoice only when seller.e_invoice_enabled (turnover rule configured by Admin) and buyer has GSTIN (B2B). | n/a |
| IN-04 | e-Way bill required when consignment value > configured threshold (default ₹50,000; state-wise override). | 422 · EWAY_REQUIRED at dispatch if missing |
| IN-05 | IRN failure never blocks dispatch for > 2 h: invoice is marked IRN_PENDING, retried, and Admin alerted. | n/a |
| IN-06 | PDF template: seller & buyer details, GSTINs, HSN-wise lines, tax split, amount in words, QR (IRN), bank details, signature, "Computer generated". | n/a |

## Table 10

| Item | Detail |
| Target sprint | S5 (PDF) · Phase 2 (IRN / e-way) |
| Indicative effort (person-days) | Backend 8 · Mobile 3 · Admin web 3 · QA 4 · Total 18 |

## Table 11

| Discipline | Tasks |
| Backend | 1. Gap-free invoice series per seller per FY
2. Invoice builder & tax split
3. HTML → PDF worker, S3 storage
4. Credit note series
5. GSP adapter: IRN, e-way bill, retries |
| Mobile (Flutter) | 1. Generate Invoice action, preview, share via WhatsApp |
| Admin web | 1. Invoice search, IRN-pending queue |
| QA focus | 1. Numbering under concurrency
2. Tax rounding & round-off
3. GSP failure fallback |
