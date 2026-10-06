AGRIBID SHUDH · DEVELOPMENT SPEC M15

Admin Console

Module development specification

Contents

0. Module Context & Architecture	3

0.1 Module context diagram	3

0.2 Where this module sits in the system	3

0.3 Network & deployment diagram	4

0.4 Request authorisation (applies to every API in this module)	5

0.5 Conventions summary	5

M15. Admin Console	6

M15.1 Overview	6

M15.2 Screen list	6

M15.3 Maker-checker	7

M15.8 Build Checklist & Estimate	7

M15.9 Definition of Done	7

0. Module Context & Architecture

This document is the development specification for M15 · Admin Console of the Agribid Shudh multi-tier distribution app (Agribid → State Stockist → Distributor → Sub-Distributor → Retailer, plus Admin). It is derived from PRD v1.0 and is one of 18 documents; shared standards are detailed in Dev Spec 00 · Architecture & Common Standards.

0.1 Module context diagram

Figure 1: M15 context: clients, dependencies, consumers, data stores and external services

0.2 Where this module sits in the system

All modules run inside one NestJS backend (modular monolith) with background workers. M15 is a code module with its own folder, its own tables, and a public service interface. Other modules call it only through that interface, never by querying its tables directly.

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

M15. Admin Console

M15.1 Overview

Figure 5: Admin modules and maker-checker governance (from PRD)

M15.2 Screen list

M15.3 Maker-checker

Changes to price lists, schemes, credit caps / overrides, GST rate and partner approvals created by one admin must be approved by a different admin holding the approve permission. Implemented as a generic change_requests table (entity_type, entity_id, payload_before, payload_after, maker, checker, status, comments); the domain module applies the payload on approval.

M15.8 Build Checklist & Estimate

Estimates are indicative and must be re-estimated by the squad in sprint planning.

M15.9 Definition of Done

Code reviewed and merged; unit and integration tests pass (≥ 80% coverage on business services).

Endpoints documented in OpenAPI; error codes added to the i18n catalogue (en, hi, mr).

Permission code and data scope enforced and covered by positive and negative tests.

Audit log written for every state or money change.

Mobile / web screens match DESIGN.md tokens with empty, loading, error and offline states.

Analytics events fired; acceptance criteria in this document verified by QA.

— End of M15 —

## Table 1

| Field | Detail |
| Document | Dev Spec M15: Admin Console v1.0 |
| Source | Agribid Shudh PRD v1.0 and Stitch design set |
| Date | 26 September 2026 |
| Target sprint | S1–S8 (alongside each module) |
| Depends on | M01 Admin 2FA, M02 Roles, M03–M14 admin APIs, M16 Maker-checker |
| Read with | Dev Spec 00 · Architecture & Common Standards |
| Status | Draft for engineering review |

## Table 2

| Aspect | Detail |
| Clients | Admin Web Console |
| Depends on | M01 Admin 2FA · M02 Roles · M03–M14 admin APIs · M16 Maker-checker |
| Used by | Agribid HQ users |
| Data stores | S3 + CloudFront: SPA hosting |
| External services | None |

## Table 3

| Layer | Rule relevant to this module |
| Entry | All client and webhook traffic enters through CloudFront + WAF → ALB (HTTPS 443). |
| Compute | M15 APIs run in private ECS API tasks; its async jobs run in worker tasks. No public IPs. |
| Data | PostgreSQL and Redis sit in private data subnets reachable only from app security groups; S3 via VPC endpoint with pre-signed URLs. |
| Egress | No direct third-party calls from this module. |
| Secrets | Keys and credentials come from Secrets Manager; never in code or env files in the repo. |

## Table 4

| Item | Detail |
| Purpose | Web application for Agribid HQ that hosts the Admin side of every module plus configuration, approvals and support. |
| PRD refs | 10.6 ADM-01..12 |
| Tech | React + TypeScript SPA served from S3 / CloudFront; same API with /admin/* routes; 2FA; idle logout 30 min. |

## Table 5

| Menu | Screens | Backing module |
| Dashboard | KPI cards, state map, alerts, approval queue counts | M14 |
| Partners | List / filters, partner 360 view, approval queue, hierarchy tree, re-map, block, bulk import | M03 |
| Catalog | SKUs, categories, bulk import, images | M04 |
| Pricing | Price lists by state × tier, grid editor, version compare, approvals | M05 |
| Schemes & Banners | Builder, targeting, schedule, performance | M05 |
| Credit | Tier caps, defaults, accounts, holds, overrides | M11 |
| Orders | Network search, timeline, SLA breaches, disputes / on-hold, overrides | M06 / M07 |
| Finance | Payments search, reversals, PG reconciliation, invoices / IRN pending, credit notes | M08 / M11 |
| Claims | Escalated claims, QA cases | M12 |
| Reports | All report codes, exports, schedules | M14 |
| Settings | Configuration keys, notification templates, reason codes, app version control | M16 / M13 |
| Access | Admin users, roles, audit log viewer | M02 / M16 |
| Support | Tickets from partners with assignment and SLA | M16 |

## Table 6

| Item | Detail |
| Target sprint | S1–S8 (alongside each module) |
| Indicative effort (person-days) | Backend 3 · Mobile 0 · Admin web 12 · QA 4 · Total 19 |

## Table 7

| Discipline | Tasks |
| Backend | 1. change_requests (maker-checker) service |
| Mobile (Flutter) | None |
| Admin web | 1. App shell, navigation, auth
2. Shared table / form / filter components
3. Screens listed in M15.2 as each module lands |
| QA focus | 1. Maker ≠ checker enforcement
2. Role-based menu visibility |
