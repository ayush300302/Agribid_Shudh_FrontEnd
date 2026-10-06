AGRIBID SHUDH · DEVELOPMENT SPEC 00

Architecture & Common Standards

Shared foundation for all 17 module specifications

Contents

1. Introduction	3

1.1 Purpose	3

1.2 How to read a module section	3

1.3 Role codes used	3

2. System Architecture	4

2.1 Logical architecture	4

2.2 Recommended technology stack	4

2.3 Network & deployment diagram	5

2.4 Module map & build order	6

3. Common Engineering Standards	7

3.1 API conventions	7

3.2 Data conventions	7

3.3 Authorisation model (applies to every API)	8

3.4 Standard HTTP error codes	8

3.5 Mobile app structure (Flutter)	8

Appendix A. Consolidated Data Model	10

A.1 Key indexes	10

Appendix B. Event Catalogue & Scheduled Jobs	11

B.1 Domain events	11

B.2 Scheduled jobs	11

Appendix C. Build Plan, Environments & Quality	12

C.1 Sprint plan (2-week sprints, phase 1 MVP)	12

C.2 Environments	12

C.3 Testing strategy	12

C.4 Definition of Done (per story)	13

C.5 Open technical decisions	13

Document Set Index	14

1. Introduction

1.1 Purpose

This document turns the Agribid Shudh PRD v1.0 into a build-ready specification. It is organised module by module so that each squad (backend, Flutter, admin web, QA) can pick up a module, understand its flow, and build its tables, APIs, screens and tests independently.

1.2 How to read a module section

1.3 Role codes used

"Sellers" = MF, SS, DS, SD. "Buyers" = SS, DS, SD, RT. A mid-tier partner (SS, DS, SD) is both.

2. System Architecture

2.1 Logical architecture

The backend is a modular monolith in phase 1: one deployable NestJS service whose code is split into strict modules (one folder, one DB schema prefix, public service interface per module). This is faster to build and operate than microservices for a ~10-person team. Heavy or asynchronous work (notifications, invoices, reports, integrations) runs in worker processes fed by a Redis-backed queue. Any module can later be extracted into a service without changing its API.

Figure 1: Logical architecture: clients, edge, core backend, data and external services

2.2 Recommended technology stack

Engineering may substitute equivalents (e.g. React Native, Spring Boot, GCP). The module contracts in this document do not change.

2.3 Network & deployment diagram

Figure 2: AWS network topology: public / private subnets across two availability zones

2.4 Module map & build order

Figure 3: Modules and their dependency layers (build top to bottom)

3. Common Engineering Standards

3.1 API conventions

3.2 Data conventions

Every table has id (uuid), created_at, updated_at, created_by, updated_by. Business tables use soft delete (deleted_at) where records must be retained (partners, SKUs).

Money: NUMERIC(14,2); tax rates NUMERIC(5,2); quantities NUMERIC(14,3). All tax rounding at line level, half-up to 2 decimals; invoice round-off line to nearest rupee.

Human-readable numbers: partner_code AGB-{TIER}-{STATE}-{SEQ5}; order_no ORD-{YYMM}-{SEQ6}; invoice_no ≤ 16 chars per GST rule, e.g. D0987/2627/00123.

Hierarchy: partners.path uses the PostgreSQL ltree type (e.g. MF1.SSMH01.DS0987.SD0012). Downline queries use path <@ :myPath with a GiST index.

Concurrency: stock and credit updates use SELECT … FOR UPDATE on the inventory / credit_account row inside one transaction.

Time zone: store UTC; business-day logic (SLA, due dates, reports) uses Asia/Kolkata.

3.3 Authorisation model (applies to every API)

Figure 4: Request authorisation pipeline: authentication, permission and data scope

3.4 Standard HTTP error codes

3.5 Mobile app structure (Flutter)

Feature-first folders: lib/features/{auth, home, catalog, cart, orders, sales, delivery, inventory, payments, network, returns, profile}/ each with data / domain / presentation layers.

One app binary; a RoleConfig object (from login response) drives bottom navigation, home tiles, quick actions and feature flags per role.

Offline: Drift DB caches catalog, price list, open orders, ledger summary; an outbox table queues offline cart and payment records, synced with Idempotency-Keys.

Design tokens from DESIGN.md (Inter, Forest Green #1B5E20, CTA orange, 8 px radius, 48 px touch target) are implemented as a shared ThemeData package.

i18n with ARB files (en, hi, mr at launch); no hard-coded strings; INR formatting 1,00,000 via intl.

Appendix A. Consolidated Data Model

The diagrams below show the main relationships. Full columns are in each module section.

Figure 5: Identity & network entities

Figure 6: Commerce entities: catalog, orders, invoices, payments, stock

A.1 Key indexes

Appendix B. Event Catalogue & Scheduled Jobs

B.1 Domain events

Events are published after the DB transaction commits (transactional outbox table → worker → BullMQ). Payload: {eventId, type, occurredAt, actor, entityId, data}. Consumers must be idempotent on eventId.

B.2 Scheduled jobs

Appendix C. Build Plan, Environments & Quality

C.1 Sprint plan (2-week sprints, phase 1 MVP)

Phase 2 adds: payment gateway, e-Invoice / e-Way bill, KYC APIs, WhatsApp, GPS tracking, scheme engine full, iOS, staff logins, MPIN / biometric.

C.2 Environments

C.3 Testing strategy

Unit tests: ≥ 80% coverage on pricing, credit, inventory, invoice numbering and state machine services.

API contract tests: generated from OpenAPI; run in CI for every PR.

Integration tests: Testcontainers PostgreSQL + Redis; concurrency tests for stock reservation and credit checks.

Mobile: widget tests, golden tests for key screens; Maestro / Patrol E2E on the order-to-cash path; device lab of low-end Android (2 GB RAM, Android 9).

Performance: k6 load test to 5,000 concurrent users and 100k orders / day profile; p95 < 800 ms.

Security: OWASP ASVS L2 checklist for API, MASVS L1 for app; third-party penetration test before go-live.

UAT: role-based scripts derived from the acceptance criteria in each module.

C.4 Definition of Done (per story)

Code reviewed and merged; unit / integration tests pass; coverage threshold met.

API documented in OpenAPI; error codes added to the i18n catalogue.

Permission code and data scope applied and tested (positive and negative).

Audit log written for every state or money change.

Screens match design tokens; strings translated (en, hi, mr); empty / loading / error / offline states handled.

Analytics events from PRD Section 17 fired.

Acceptance criteria verified by QA in the qa environment.

C.5 Open technical decisions

— End of document —

Document Set Index

The development specification is split into one shared document and 17 module documents. Each module document repeats a short architecture summary so it can be handed to a squad on its own.

## Table 1

| Field | Detail |
| Document | Dev Spec 00: Architecture & Common Standards v1.0 |
| Source | Agribid Shudh PRD v1.0 |
| Date | 26 September 2026 |
| Audience | Tech lead, backend, mobile, web, QA, DevOps |
| Read with | Module documents M01–M17 (each is self-contained for its module) |
| Status | Draft: tech stack and estimates to be confirmed by engineering |

## Table 2

| Sub-section | What it contains | Primary reader |
| Overview | Purpose, PRD references, screens, roles, dependencies | All |
| Flow chart | Process / decision flow, sequence diagram where useful | All |
| Data model | PostgreSQL tables, columns, types, constraints, indexes | Backend |
| APIs | REST endpoints, permission code, behaviour | Backend, mobile, web |
| Validations | Business rules with HTTP status and error codes | Backend, QA |
| Events & jobs | Domain events published / consumed, scheduled jobs | Backend |
| Acceptance criteria | Given / When / Then test cases | QA, product |

## Table 3

| Code | Role | App | Tier value |
| ADM | Admin (Agribid HQ, with sub-roles) | Web console | 0 |
| MF | Agribid Manufacturer (plant / warehouse) | Web + mobile | 1 |
| SS | State Stockist | Mobile (+ web optional) | 2 |
| DS | Distributor | Mobile | 3 |
| SD | Sub-Distributor | Mobile | 4 |
| RT | Retailer | Mobile | 5 |
| DP | Delivery Partner (light role) | Web view / mobile P2 | n/a |

## Table 4

| Layer | Choice | Why / notes |
| Mobile app | Flutter 3.x (Dart), Riverpod or Bloc, Dio, Drift (SQLite) for offline, FCM | One codebase for Android now and iOS in phase 2; good performance on low-end Android |
| Admin web | React 18 + TypeScript, Vite, TanStack Query, Ant Design / MUI, React Hook Form + Zod | Data-heavy tables and forms |
| Backend | Node.js 20 + NestJS, TypeORM or Prisma, class-validator, BullMQ | Modular structure, DI, decorators for RBAC |
| Database | PostgreSQL 16 (ltree extension, pg_trgm), read replica for reports | Relational integrity for money and stock; ltree for hierarchy queries |
| Cache / queue | Redis 7 (ElastiCache) | OTP, sessions, permission cache, BullMQ queues, rate limits |
| Files | AWS S3 + CloudFront signed URLs | KYC documents, product images, invoice PDFs |
| PDF | Puppeteer HTML → PDF in worker | GST invoice, receipts, statements |
| Infra | AWS ap-south-1 (Mumbai), ECS Fargate, RDS, Terraform | Indian data residency (DPDP), managed services |
| CI/CD | GitHub Actions → ECR → ECS; Fastlane / Codemagic for app builds | Automated test, build and deploy |
| Observability | CloudWatch, OpenTelemetry, Sentry (app + API), Firebase Crashlytics | Crash-free ≥ 99.5% target |

## Table 5

| Component | Network rule |
| CloudFront + WAF | Only public entry point. AWS managed rule sets, rate limit 300 req / 5 min / IP on /auth/*, bot control on admin. |
| ALB (public subnet) | Accepts HTTPS 443 from CloudFront prefix list only; forwards to API target group on 3000. |
| API & worker tasks (private app subnet) | No public IP. Inbound only from ALB security group. Outbound via NAT Gateway to allow-listed third parties. |
| RDS & Redis (private data subnet) | Inbound 5432 / 6379 only from app security group. No internet route. Encryption at rest (KMS) and in transit. |
| S3 | Private buckets, access via VPC gateway endpoint; clients get time-limited pre-signed URLs (5 min upload, 15 min download). |
| Admin access | AWS SSM Session Manager (no SSH keys, no bastion ports open). Production DB read-only role for support. |
| Webhooks (payment gateway, GSP, SMS DLR) | Enter via CloudFront → /webhooks/*, verified by HMAC signature and IP allow-list. |
| Environments | dev, qa, uat, prod in separate AWS accounts / VPCs; prod data never copied to lower envs without masking. |

## Table 6

| Topic | Standard |
| Base URL | https://api.agribidshudh.in/api/v1 · versioned in path; breaking changes → v2. |
| Format | JSON, camelCase fields, ISO-8601 UTC timestamps, amounts as strings with 2 decimals ("12450.00"), quantities as decimals with 3 places. |
| Auth | Authorization: Bearer <accessToken> (JWT, RS256, 15 min). Refresh via /auth/refresh with rotating refresh token (30 days). |
| Idempotency | All POST that create money or stock effects (orders, payments, dispatch) require an Idempotency-Key header (UUID); stored 24 h. |
| Pagination | Cursor based: ?limit=20&cursor=<opaque>; response { data: [], nextCursor }. Admin tables may use page / size. |
| Filtering / sort | ?status=NEW,ACCEPTED&from=2026-09-01&to=2026-09-30&sort=-createdAt&q=krishna |
| Errors | { "error": { "code": "CREDIT_LIMIT_EXCEEDED", "message": "…", "details": {…}, "traceId": "…" } } with proper HTTP status. |
| Localisation | Accept-Language: en \| hi \| mr …; server returns localised messages for error codes. |
| App version | X-App-Version and X-Platform headers; server can reply 426 UPGRADE_REQUIRED (force update). |
| Docs | OpenAPI 3.1 generated from NestJS decorators; published per environment at /docs (non-prod). |

## Table 7

| HTTP | Error code examples | Meaning |
| 400 | VALIDATION_ERROR, INVALID_PACK_MULTIPLE | Bad input |
| 401 | UNAUTHORIZED, TOKEN_EXPIRED, OTP_INVALID | Not authenticated |
| 403 | FORBIDDEN, ACCOUNT_BLOCKED, KYC_PENDING | Authenticated but not allowed |
| 404 | NOT_FOUND | Missing or outside the caller's data scope |
| 409 | INVALID_STATE_TRANSITION, DUPLICATE_PARTNER, STOCK_CONFLICT | Conflicts with current state |
| 422 | CREDIT_LIMIT_EXCEEDED, CREDIT_HOLD, BELOW_MOV, OUT_OF_STOCK | Business rule failed |
| 426 | UPGRADE_REQUIRED | App version too old |
| 429 | RATE_LIMITED, OTP_LIMIT | Too many requests |
| 5xx | INTERNAL_ERROR, UPSTREAM_UNAVAILABLE | Server / third-party failure |

## Table 8

| Table | Index | Purpose |
| partners | GiST(path); (parent_id, status); UNIQUE(mobile) WHERE status <> INACTIVE; trigram(business_name) | Downline queries, child lists, search |
| orders | (seller_id, status, placed_at DESC); (buyer_id, placed_at DESC); (status, sla_due_at) | Inbox tabs, purchase history, SLA job |
| order_lines | (order_id); (sku_id) |  |
| inventory | PK(partner_id, sku_id); partial (partner_id) WHERE available <= min_level | Low-stock list |
| ledger_entries | (credit_account_id, id) | Running balance |
| invoices | UNIQUE(seller_id, invoice_no); (buyer_id, due_date) WHERE balance > 0 | Overdue job |
| skus | GIN(search_vector); GIN(enabled_states) | Catalog search |
| audit_logs | monthly partitions; (entity_type, entity_id) |  |

## Table 9

| Event | Producer | Consumers |
| partner.submitted / approved / rejected / remapped / blocked | M03 | M11 credit account, M13, M01 session revoke |
| order.placed / assisted_created / accepted / partially_accepted / rejected / cancelled / on_hold | M06 / M07 | M10, M13, M14 |
| order.packed | M07 | M08 invoice, M11 ledger |
| invoice.issued / irn_generated / irn_failed | M08 | M11, M13, Admin alert |
| shipment.dispatched / delivery.started / delivered / failed | M09 | M10 stock, M11 POD, M13, M05 scheme budget |
| stock.low / restocked / adjusted | M10 | M13, M14 |
| payment.received / reversed / disputed | M11 | M13, M07 auto-close, M14 |
| credit.hold_applied / hold_lifted | M11 | M13, M01 account status |
| claim.raised / decided / escalated | M12 | M08 CN, M10, M11, M13 |

## Table 10

| Job | Schedule (IST) | Module |
| payment_pending.expire | every 5 min | M06 |
| order.sla_watch | every 10 min | M07 |
| assisted.auto_confirm | every 15 min | M06 |
| irn.retry | every 15 min | M08 |
| approvals.sla | hourly | M03 |
| etl.incremental | every 15 min | M14 |
| credit.recompute | 00:30 daily | M11 |
| etl.full | 01:00 daily | M14 |
| session.cleanup | 02:00 daily | M01 |
| order.auto_close | 03:00 daily | M07 |
| pg.reconcile | 06:00 daily | M11 |
| dues.reminder | 10:00 daily | M11 |
| stock.snapshot | 23:55 daily | M10 |
| tier_badge.compute | 1st of month 04:00 | M03 (P2) |

## Table 11

| Sprint | Backend | Mobile (Flutter) | Admin web | Exit criteria |
| S0 | Repo, CI/CD, Terraform envs, auth skeleton, DB migrations framework | App shell, theme from DESIGN.md, i18n, API client | Shell, login, layout | Deploy to dev on merge |
| S1 | M01 Auth, M02 RBAC, M16 config / audit | Splash, onboarding, login, OTP, role routing | Admin login + 2FA, roles | All 6 roles can log in |
| S2 | M03 Partner & KYC, M04 Catalog | Add partner stepper, partner list / profile, catalog | Partner approvals, SKU management | Onboard network in dev |
| S3 | M05 Pricing (lists), M10 Inventory | Cart, review, inventory list / add | Price lists + maker-checker | Priced cart |
| S4 | M06 Ordering, M11 credit accounts | Place order, order list / detail, on-behalf | Credit caps | Order NEW with credit check |
| S5 | M07 Fulfilment, M08 Invoice (PDF, no IRN) | Seller inbox, accept / reject, invoice share | Order search & override | Order to PACKED with invoice |
| S6 | M09 Delivery, M11 payments & ledger | Assign, dispatch, track, POD, record payment, ledger | Finance screens | Full order-to-cash loop |
| S7 | M12 Returns, M13 Notifications, M14 dashboards | Claims, notification centre, role dashboards | Dashboard, reports, templates | Feature complete |
| S8 | Hardening, performance, security test, data migration | Offline, polish, low-end device testing | Bulk imports | UAT sign-off, pilot go-live |

## Table 12

| Env | Purpose | Data | Deploy |
| dev | Developer integration | Seed / synthetic | Auto on merge to develop |
| qa | QA regression & automation | Seed + test fixtures | Nightly / on demand |
| uat | Business UAT & pilot rehearsal | Masked copy of pilot data | Release candidates |
| prod | Live | Real | Tagged release with approval; blue / green on ECS |

## Table 13

| # | Decision | Options | Recommendation |
| T1 | Mobile framework | Flutter · React Native · native Kotlin | Flutter (single codebase, strong low-end Android performance) |
| T2 | Backend language | NestJS · Spring Boot · Go | NestJS (team speed, shared TypeScript with admin) |
| T3 | Cloud | AWS · GCP · Azure | AWS Mumbai (managed RDS, mature Indian region) |
| T4 | GSP / PG / SMS vendors | See M17 | Shortlist 2 each; decide by S4 on price & SLA |
| T5 | Product scope (food vs agri-inputs) | PRD Q1 | Blocks catalog attributes & licences (FSSAI vs fertilizer licence) |

## Table 14

| # | Document | Scope |
| 00 | Architecture & Common Standards | Architecture, network diagram, API / data / auth standards, data model, events, build plan |
| 01 | M01 · Authentication & Session | Depends on: M02 RBAC, M03 Partner status, M13 Notifications |
| 02 | M02 · Users, Roles & Permissions (RBAC) | Depends on: M01 Auth, M16 Audit |
| 03 | M03 · Partner, Hierarchy & KYC Onboarding | Depends on: M01 Auth, M02 RBAC, M13 Notifications |
| 04 | M04 · Product Catalog | Depends on: M02 RBAC, M16 Config |
| 05 | M05 · Pricing & Schemes | Depends on: M03 Partner tier/state, M04 Catalog, M16 Maker-checker |
| 06 | M06 · Cart & Ordering (Buy Side) | Depends on: M04 Catalog, M05 Pricing, M10 Inventory |
| 07 | M07 · Order Fulfilment (Sell Side) | Depends on: M06 Ordering, M10 Inventory reserve, M13 Notifications |
| 08 | M08 · Invoicing & GST Compliance | Depends on: M07 Fulfilment, M11 Ledger, M17 Integrations |
| 09 | M09 · Dispatch & Delivery | Depends on: M07 Fulfilment, M08 Invoicing, M10 Inventory |
| 10 | M10 · Inventory | Depends on: M04 Catalog, M07 Fulfilment, M09 Delivery - GRN |
| 11 | M11 · Payments, Credit & Ledger | Depends on: M03 Partner, M06 Ordering, M08 Invoicing |
| 12 | M12 · Returns & Claims | Depends on: M07 Fulfilment, M08 Credit notes, M10 Inventory |
| 13 | M13 · Notifications | Depends on: M16 Config & templates, M17 Integrations |
| 14 | M14 · Dashboards & Reports | Depends on: M02 Data scope, All transactional modules |
| 15 | M15 · Admin Console | Depends on: M01 Admin 2FA, M02 Roles, M03–M14 admin APIs |
| 16 | M16 · Audit, Configuration & Support | Depends on: M01 Auth, M02 RBAC |
| 17 | M17 · Integrations Hub | Depends on: M16 Config & secrets |
