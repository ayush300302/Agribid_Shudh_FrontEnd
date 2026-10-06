AGRIBID SHUDH · DEVELOPMENT SPEC M07

Order Fulfilment (Sell Side)

Module development specification

Contents

0. Module Context & Architecture	3

0.1 Module context diagram	3

0.2 Where this module sits in the system	3

0.3 Network & deployment diagram	4

0.4 Request authorisation (applies to every API in this module)	5

0.5 Conventions summary	5

M07. Order Fulfilment (Sell Side)	6

M07.1 Overview	6

M07.2 Flow & state machine	6

M07.3 Data model	7

M07.4 APIs	8

M07.5 Validations	8

M07.6 Events & jobs	9

M07.7 Acceptance criteria	9

M07.8 Build Checklist & Estimate	9

M07.9 Definition of Done	9

0. Module Context & Architecture

This document is the development specification for M07 · Order Fulfilment (Sell Side) of the Agribid Shudh multi-tier distribution app (Agribid → State Stockist → Distributor → Sub-Distributor → Retailer, plus Admin). It is derived from PRD v1.0 and is one of 18 documents; shared standards are detailed in Dev Spec 00 · Architecture & Common Standards.

0.1 Module context diagram

Figure 1: M07 context: clients, dependencies, consumers, data stores and external services

0.2 Where this module sits in the system

All modules run inside one NestJS backend (modular monolith) with background workers. M07 is a code module with its own folder, its own tables, and a public service interface. Other modules call it only through that interface, never by querying its tables directly.

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

M07. Order Fulfilment (Sell Side)

M07.1 Overview

M07.2 Flow & state machine

Figure 5: Seller-side fulfilment (from PRD)

Figure 6: Order status model

M07.3 Data model

Table: order_status_log  ·  immutable timeline

Table: reason_codes  ·  configurable lists

M07.4 APIs

M07.5 Validations

M07.6 Events & jobs

M07.7 Acceptance criteria

Given a NEW order for 10 bags where the seller has 6, when the seller accepts 6 with reason OUT_OF_STOCK, then the buyer is notified, totals are recalculated and 6 bags are reserved.

Given a NEW order older than 4 working hours, when the SLA job runs, then the order shows "SLA breached" and the parent and Admin are alerted.

Given a PACKED order, when the buyer tries to cancel, then the API returns INVALID_STATE_TRANSITION and the app suggests a return.

M07.8 Build Checklist & Estimate

Estimates are indicative and must be re-estimated by the squad in sprint planning.

M07.9 Definition of Done

Code reviewed and merged; unit and integration tests pass (≥ 80% coverage on business services).

Endpoints documented in OpenAPI; error codes added to the i18n catalogue (en, hi, mr).

Permission code and data scope enforced and covered by positive and negative tests.

Audit log written for every state or money change.

Mobile / web screens match DESIGN.md tokens with empty, loading, error and offline states.

Analytics events fired; acceptance criteria in this document verified by QA.

— End of M07 —

## Table 1

| Field | Detail |
| Document | Dev Spec M07: Order Fulfilment (Sell Side) v1.0 |
| Source | Agribid Shudh PRD v1.0 and Stitch design set |
| Date | 26 September 2026 |
| Target sprint | S5 |
| Depends on | M06 Ordering, M10 Inventory reserve, M13 Notifications |
| Read with | Dev Spec 00 · Architecture & Common Standards |
| Status | Draft for engineering review |

## Table 2

| Aspect | Detail |
| Clients | Partner Mobile App - sellers · Admin Web Console |
| Depends on | M06 Ordering · M10 Inventory reserve · M13 Notifications |
| Used by | M08 Invoicing · M09 Delivery · M14 Reports |
| Data stores | PostgreSQL: orders, order_status_log · Redis: SLA timers / queue |
| External services | None |

## Table 3

| Layer | Rule relevant to this module |
| Entry | All client and webhook traffic enters through CloudFront + WAF → ALB (HTTPS 443). |
| Compute | M07 APIs run in private ECS API tasks; its async jobs run in worker tasks. No public IPs. |
| Data | PostgreSQL and Redis sit in private data subnets reachable only from app security groups; S3 via VPC endpoint with pre-signed URLs. |
| Egress | No direct third-party calls from this module. |
| Secrets | Keys and credentials come from Secrets Manager; never in code or env files in the repo. |

## Table 4

| Item | Detail |
| Purpose | Seller inbox of orders: accept, partial accept, reject, pack; state machine; SLA and escalation; bulk actions. |
| PRD refs | BR-08, BR-11, BR-13, 9.5 SOM-01..08 |
| Screens | Orders (status tabs) ✓, Seller order detail ✓, Accept / partial dialog*, Reject reason sheet*, Pick list (web)* |
| Roles | Sellers (MF, SS, DS, SD); Admin override |
| Depends on | M06, M10 (reservation), M08 (invoice on PACKED), M09 |

## Table 5

| From | To | Actor / API | Side effects |
| PAYMENT_PENDING | NEW / CANCELLED | System (PG webhook / timeout) | Notify seller |
| NEW | ACCEPTED | Seller · POST /orders/:id/accept | Reserve stock (M10); recompute totals on partial; notify buyer |
| NEW | REJECTED | Seller · /reject {reasonCode} | Refund if prepaid; notify buyer |
| NEW | CANCELLED | Buyer · /cancel | Notify seller |
| NEW | ON_HOLD | Child disputes ASSISTED order | Notify seller & Admin |
| ACCEPTED | CANCELLED | Seller approves buyer cancel request | Release reservation |
| ACCEPTED | PACKED | Seller · /pack | Generate invoice (M08); ledger debit (M11) |
| PACKED | DISPATCHED | Seller · /dispatch (M09) | Deduct stock; e-way bill; tracking SMS |
| DISPATCHED | OUT_FOR_DELIVERY | Driver / seller | ETA to buyer |
| OUT_FOR_DELIVERY | DELIVERED | POD captured (M09) | Auto GRN at buyer (M10); scheme budget; claims window opens |
| OUT_FOR_DELIVERY | RETURNED | Refused / failed | Stock back to seller; credit note for invoice |
| DELIVERED | CLOSED | System when payment_status = PAID and claim window over | None |

## Table 6

| Column | Type | Constraints | Notes |
| id | bigserial | PK |  |
| order_id | uuid | FK, index |  |
| from_status / to_status | enum |  |  |
| actor_user_id / actor_type |  |  | USER \| SYSTEM \| ADMIN |
| reason_code / note |  |  |  |
| geo | geography | NULL | from mobile |
| at | timestamptz |  |  |

## Table 7

| Column | Type | Constraints | Notes |
| type | enum |  | REJECT, CANCEL, PARTIAL, DELIVERY_FAIL, RETURN, ADJUST |
| code / label_i18n / active |  |  | OUT_OF_STOCK, CREDIT_ISSUE, OUTSIDE_AREA, OTHER… |

## Table 8

| Method | Endpoint | Permission | Description |
| GET | /orders/sales?tab=NEW\|PROCESSING\|READY\|OFD\|DELIVERED | order.view_sales | Seller inbox with counts per tab and SLA remaining. |
| POST | /orders/:id/accept | order.accept | Body {lines?: [{lineId, qtyAccepted, reasonCode}]}; full accept if omitted. |
| POST | /orders/:id/reject | order.accept | Body {reasonCode, note}. |
| POST | /orders/:id/cancel-request/approve \| /decline | order.accept | Handle buyer cancel after acceptance. |
| POST | /orders/:id/pack | order.pack | Moves to PACKED and triggers invoice. |
| POST | /orders/bulk/accept | order.bulk | MF / SS bulk accept (array of ids). |
| GET | /orders/pick-list?ids= | order.pack | Aggregated SKU quantities PDF for godown. |
| POST | /admin/orders/:id/override-status | order.override | Admin override with reason (audited). |

## Table 9

| Code | Rule / validation | HTTP · error code |
| FL-01 | Only transitions in the table above are allowed; the order row is locked during transition. | 409 · INVALID_STATE_TRANSITION |
| FL-02 | qtyAccepted ≤ qtyOrdered and respects pack multiples; qty 0 on all lines = reject. | 400 |
| FL-03 | Accept requires available stock ≥ accepted qty for every line (reserve in same txn). | 409 · STOCK_CONFLICT |
| FL-04 | Partial accept of a CREDIT order re-computes totals and releases the credit difference. | n/a |
| FL-05 | Seller cannot act on ON_HOLD orders until resolved by Admin or child confirmation. | 409 · ORDER_ON_HOLD |

## Table 10

| Event / job | Trigger | Consumers / action |
| order.accepted / partially_accepted / rejected | Seller action | Notify buyer; M10 reserve / release |
| order.packed | Pack | M08 generate invoice; M11 post debit |
| job: order.sla_watch | Every 10 min | NEW orders past sla_due_at → escalate to seller's parent + Admin (BR-13); mark sla_breached |
| job: order.auto_close | Daily 03:00 IST | DELIVERED + PAID + claim window over → CLOSED |

## Table 11

| Item | Detail |
| Target sprint | S5 |
| Indicative effort (person-days) | Backend 8 · Mobile 7 · Admin web 3 · QA 5 · Total 23 |

## Table 12

| Discipline | Tasks |
| Backend | 1. State machine service with transition table
2. Accept / partial / reject / pack APIs
3. order_status_log & reason codes
4. SLA watcher & escalation job
5. Bulk accept, pick list PDF |
| Mobile (Flutter) | 1. Seller Orders tabs with counts & SLA timer
2. Seller order detail with stepper
3. Accept / partial / reject sheets |
| Admin web | 1. Order override & SLA breach list |
| QA focus | 1. Every allowed & forbidden transition
2. Concurrent accept vs cancel
3. SLA escalation timing |
