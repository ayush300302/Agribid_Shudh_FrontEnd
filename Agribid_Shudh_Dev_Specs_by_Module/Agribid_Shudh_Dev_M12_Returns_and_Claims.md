AGRIBID SHUDH · DEVELOPMENT SPEC M12

Returns & Claims

Module development specification

Contents

0. Module Context & Architecture	3

0.1 Module context diagram	3

0.2 Where this module sits in the system	3

0.3 Network & deployment diagram	4

0.4 Request authorisation (applies to every API in this module)	5

0.5 Conventions summary	5

M12. Returns & Claims	6

M12.1 Overview	6

M12.2 Flow	6

M12.3 Data model	6

M12.4 APIs	7

M12.5 Rules	7

M12.6 Acceptance criteria	7

M12.8 Build Checklist & Estimate	7

M12.9 Definition of Done	8

0. Module Context & Architecture

This document is the development specification for M12 · Returns & Claims of the Agribid Shudh multi-tier distribution app (Agribid → State Stockist → Distributor → Sub-Distributor → Retailer, plus Admin). It is derived from PRD v1.0 and is one of 18 documents; shared standards are detailed in Dev Spec 00 · Architecture & Common Standards.

0.1 Module context diagram

Figure 1: M12 context: clients, dependencies, consumers, data stores and external services

0.2 Where this module sits in the system

All modules run inside one NestJS backend (modular monolith) with background workers. M12 is a code module with its own folder, its own tables, and a public service interface. Other modules call it only through that interface, never by querying its tables directly.

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

M12. Returns & Claims

M12.1 Overview

M12.2 Flow

Figure 5: Return / claim lifecycle

M12.3 Data model

Table: claims / claim_lines

M12.4 APIs

M12.5 Rules

M12.6 Acceptance criteria

Given an order delivered 20 h ago with 2 damaged bags, when the buyer raises a DAMAGE claim with photos and the seller approves a credit note, then a CN is issued and the buyer's outstanding reduces by the value of 2 bags incl. GST.

M12.8 Build Checklist & Estimate

Estimates are indicative and must be re-estimated by the squad in sprint planning.

M12.9 Definition of Done

Code reviewed and merged; unit and integration tests pass (≥ 80% coverage on business services).

Endpoints documented in OpenAPI; error codes added to the i18n catalogue (en, hi, mr).

Permission code and data scope enforced and covered by positive and negative tests.

Audit log written for every state or money change.

Mobile / web screens match DESIGN.md tokens with empty, loading, error and offline states.

Analytics events fired; acceptance criteria in this document verified by QA.

— End of M12 —

## Table 1

| Field | Detail |
| Document | Dev Spec M12: Returns & Claims v1.0 |
| Source | Agribid Shudh PRD v1.0 and Stitch design set |
| Date | 26 September 2026 |
| Target sprint | S7 |
| Depends on | M07 Fulfilment, M08 Credit notes, M10 Inventory, M11 Ledger |
| Read with | Dev Spec 00 · Architecture & Common Standards |
| Status | Draft for engineering review |

## Table 2

| Aspect | Detail |
| Clients | Partner Mobile App · Admin Web Console |
| Depends on | M07 Fulfilment · M08 Credit notes · M10 Inventory · M11 Ledger |
| Used by | M14 Reports |
| Data stores | PostgreSQL: claims, claim_lines · S3: claim photos |
| External services | None |

## Table 3

| Layer | Rule relevant to this module |
| Entry | All client and webhook traffic enters through CloudFront + WAF → ALB (HTTPS 443). |
| Compute | M12 APIs run in private ECS API tasks; its async jobs run in worker tasks. No public IPs. |
| Data | PostgreSQL and Redis sit in private data subnets reachable only from app security groups; S3 via VPC endpoint with pre-signed URLs. |
| Egress | No direct third-party calls from this module. |
| Secrets | Keys and credentials come from Secrets Manager; never in code or env files in the repo. |

## Table 4

| Item | Detail |
| Purpose | Shortage, damage, wrong item and quality claims after delivery; approval; credit note or replacement; stock handling. |
| PRD refs | BR-09, 9.12 RET-01..03, INV-03 |
| Screens | Raise claim*, Claim list*, Claim detail / decide*, Admin escalations* |
| Depends on | M07, M08 (credit note), M10, M11 |

## Table 5

| Column | Type | Constraints | Notes |
| id / claim_no |  |  | CLM-2609-00012 |
| order_id | uuid | FK |  |
| raised_by (buyer) | uuid |  |  |
| type | enum |  | SHORTAGE, DAMAGE, WRONG_ITEM, QUALITY, EXPIRY |
| status | enum | OPEN \| APPROVED \| PARTIALLY_APPROVED \| REJECTED \| ESCALATED \| CLOSED |  |
| resolution | enum | CREDIT_NOTE \| REPLACEMENT |  |
| claim_lines: order_line_id, qty, approved_qty, reason, photos[] |  |  |  |
| physical_return | boolean |  |  |
| decided_by / decided_at / note |  |  |  |

## Table 6

| Method | Endpoint | Permission | Description |
| POST | /orders/:id/claims | claim.raise | Raise claim with lines and photo keys. |
| GET | /claims?role=buyer\|seller&status= | claim.view | List. |
| POST | /claims/:id/decide | claim.decide | {approvedLines[], resolution, note} or reject. |
| POST | /claims/:id/escalate | claim.raise | Buyer escalates a rejection to Admin. |
| POST | /admin/claims/:id/resolve | claim.admin | Final decision (quality → Agribid QA). |

## Table 7

| Code | Rule / validation | HTTP · error code |
| RC-01 | Claim allowed only within 48 h (config) of delivered_at and qty ≤ delivered qty − already claimed. | 422 · CLAIM_WINDOW_CLOSED |
| RC-02 | At least one photo for DAMAGE / WRONG_ITEM / QUALITY. | 400 |
| RC-03 | Approved credit note posts a ledger credit and reduces invoice balance; replacement creates a zero-value order linked to the claim. | n/a |
| RC-04 | Seller SLA 48 h; no decision → auto-escalate to Admin. | n/a |

## Table 8

| Item | Detail |
| Target sprint | S7 |
| Indicative effort (person-days) | Backend 5 · Mobile 5 · Admin web 3 · QA 3 · Total 16 |

## Table 9

| Discipline | Tasks |
| Backend | 1. claims schema & window checks
2. Decide API → credit note / replacement
3. Stock-in for physical returns
4. SLA auto-escalation |
| Mobile (Flutter) | 1. Raise claim with photos
2. Claim list & detail
3. Seller decision screen |
| Admin web | 1. Escalated claims & QA queue |
| QA focus | 1. Window expiry
2. CN ledger effect
3. Replacement order |
