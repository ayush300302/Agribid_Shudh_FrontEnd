AGRIBID SHUDH · DEVELOPMENT SPEC M14

Dashboards & Reports

Module development specification

Contents

0. Module Context & Architecture	3

0.1 Module context diagram	3

0.2 Where this module sits in the system	3

0.3 Network & deployment diagram	4

0.4 Request authorisation (applies to every API in this module)	5

0.5 Conventions summary	5

M14. Dashboards & Reports	6

M14.1 Overview	6

M14.2 Data pipeline	6

M14.3 Reporting schema	6

M14.4 APIs	7

M14.5 Rules	7

M14.8 Build Checklist & Estimate	7

M14.9 Definition of Done	7

0. Module Context & Architecture

This document is the development specification for M14 · Dashboards & Reports of the Agribid Shudh multi-tier distribution app (Agribid → State Stockist → Distributor → Sub-Distributor → Retailer, plus Admin). It is derived from PRD v1.0 and is one of 18 documents; shared standards are detailed in Dev Spec 00 · Architecture & Common Standards.

0.1 Module context diagram

Figure 1: M14 context: clients, dependencies, consumers, data stores and external services

0.2 Where this module sits in the system

All modules run inside one NestJS backend (modular monolith) with background workers. M14 is a code module with its own folder, its own tables, and a public service interface. Other modules call it only through that interface, never by querying its tables directly.

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

M14. Dashboards & Reports

M14.1 Overview

M14.2 Data pipeline

Figure 5: Reporting data flow

M14.3 Reporting schema

M14.4 APIs

M14.5 Rules

Every report applies the caller's data scope (M02) through the dim_partner.path filter; this cannot be bypassed by parameters.

Mobile home tiles are real-time from OLTP (small indexed queries); analytical reports read the reporting schema (max 15 min lag, shown as "Updated hh:mm").

Exports over 100,000 rows are split into multiple files; links expire in 24 h.

M14.8 Build Checklist & Estimate

Estimates are indicative and must be re-estimated by the squad in sprint planning.

M14.9 Definition of Done

Code reviewed and merged; unit and integration tests pass (≥ 80% coverage on business services).

Endpoints documented in OpenAPI; error codes added to the i18n catalogue (en, hi, mr).

Permission code and data scope enforced and covered by positive and negative tests.

Audit log written for every state or money change.

Mobile / web screens match DESIGN.md tokens with empty, loading, error and offline states.

Analytics events fired; acceptance criteria in this document verified by QA.

— End of M14 —

## Table 1

| Field | Detail |
| Document | Dev Spec M14: Dashboards & Reports v1.0 |
| Source | Agribid Shudh PRD v1.0 and Stitch design set |
| Date | 26 September 2026 |
| Target sprint | S7 |
| Depends on | M02 Data scope, All transactional modules |
| Read with | Dev Spec 00 · Architecture & Common Standards |
| Status | Draft for engineering review |

## Table 2

| Aspect | Detail |
| Clients | Partner Mobile App · Admin Web Console |
| Depends on | M02 Data scope · All transactional modules |
| Used by | M15 Admin dashboard |
| Data stores | PostgreSQL read replica · Reporting schema · S3: Excel exports |
| External services | Email service |

## Table 3

| Layer | Rule relevant to this module |
| Entry | All client and webhook traffic enters through CloudFront + WAF → ALB (HTTPS 443). |
| Compute | M14 APIs run in private ECS API tasks; its async jobs run in worker tasks. No public IPs. |
| Data | PostgreSQL and Redis sit in private data subnets reachable only from app security groups; S3 via VPC endpoint with pre-signed URLs. |
| Egress | Calls to Email service leave through the NAT Gateway via the M17 adapter layer. |
| Secrets | Keys and credentials come from Secrets Manager; never in code or env files in the repo. |

## Table 4

| Item | Detail |
| Purpose | Role home KPIs, charts and reports across primary, secondary and tertiary sales, collections, stock and fulfilment; Excel export. |
| PRD refs | 9.3 DSH-01..06, 9.3.1 tiles, Section 13 reports, ADM-01, ADM-09 |
| Screens | Home dashboard ✓ (DS), variants per role*, Reports list (mobile summary)*, Admin dashboard & report pages* |

## Table 5

| Table | Grain | Key measures |
| fact_sales | invoice line | qty, taxable, tax, total; seller, buyer, sku, date, level (PRIMARY / SECONDARY / TERTIARY by seller tier) |
| fact_orders | order | status timestamps, SLA breach flag, fill rate, source (SELF / ASSISTED) |
| fact_payments | payment allocation | amount, mode, days to pay |
| snap_outstanding | credit account × day | outstanding, overdue buckets 0–15 / 16–30 / 31–60 / 60+ |
| snap_stock | partner × sku × day | on_hand, available, stock cover days |
| dim_partner / dim_sku / dim_date / dim_territory | dimension | hierarchy path, tier, state, category, FY / month / week |

## Table 6

| Method | Endpoint | Permission | Description |
| GET | /dashboard/home | auth | Role-specific tiles, alerts, 7-day chart (cached 60 s). |
| GET | /reports/:code?from=&to=&groupBy=&partnerId= | report.view | codes: SALES_SUMMARY, LEVEL_SALES, OUTSTANDING_AGEING, COLLECTIONS, STOCK_COVER, FULFILMENT, SCHEME_PERF, PARTNER_PERF, EXCEPTIONS. |
| POST | /reports/:code/export | report.export | Async Excel job → download link notification. |
| CRUD | /admin/report-schedules | report.schedule | Email reports on schedule. |

## Table 7

| Item | Detail |
| Target sprint | S7 |
| Indicative effort (person-days) | Backend 9 · Mobile 5 · Admin web 8 · QA 4 · Total 26 |

## Table 8

| Discipline | Tasks |
| Backend | 1. Reporting schema & ETL jobs
2. Home dashboard API per role
3. Report API with scope filter
4. Async Excel export & schedules |
| Mobile (Flutter) | 1. Role home dashboards (5 variants)
2. Sales chart
3. Mobile report summaries |
| Admin web | 1. Admin dashboard & state map
2. Report pages with filters & export |
| QA focus | 1. Numbers reconcile with OLTP
2. Scope leakage tests |
