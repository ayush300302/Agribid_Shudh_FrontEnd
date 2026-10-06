AGRIBID SHUDH · DEVELOPMENT SPEC M16

Audit, Configuration & Support

Module development specification

Contents

0. Module Context & Architecture	3

0.1 Module context diagram	3

0.2 Where this module sits in the system	3

0.3 Network & deployment diagram	4

0.4 Request authorisation (applies to every API in this module)	5

0.5 Conventions summary	5

M16. Audit, Configuration & Support	6

M16.1 Data model	6

M16.2 Support tickets	7

M16.8 Build Checklist & Estimate	7

M16.9 Definition of Done	7

0. Module Context & Architecture

This document is the development specification for M16 · Audit, Configuration & Support of the Agribid Shudh multi-tier distribution app (Agribid → State Stockist → Distributor → Sub-Distributor → Retailer, plus Admin). It is derived from PRD v1.0 and is one of 18 documents; shared standards are detailed in Dev Spec 00 · Architecture & Common Standards.

0.1 Module context diagram

Figure 1: M16 context: clients, dependencies, consumers, data stores and external services

0.2 Where this module sits in the system

All modules run inside one NestJS backend (modular monolith) with background workers. M16 is a code module with its own folder, its own tables, and a public service interface. Other modules call it only through that interface, never by querying its tables directly.

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

M16. Audit, Configuration & Support

M16.1 Data model

Table: audit_logs  ·  immutable (insert-only role)

Table: config  ·  key-value with scope

M16.2 Support tickets

Table: tickets

M16.8 Build Checklist & Estimate

Estimates are indicative and must be re-estimated by the squad in sprint planning.

M16.9 Definition of Done

Code reviewed and merged; unit and integration tests pass (≥ 80% coverage on business services).

Endpoints documented in OpenAPI; error codes added to the i18n catalogue (en, hi, mr).

Permission code and data scope enforced and covered by positive and negative tests.

Audit log written for every state or money change.

Mobile / web screens match DESIGN.md tokens with empty, loading, error and offline states.

Analytics events fired; acceptance criteria in this document verified by QA.

— End of M16 —

## Table 1

| Field | Detail |
| Document | Dev Spec M16: Audit, Configuration & Support v1.0 |
| Source | Agribid Shudh PRD v1.0 and Stitch design set |
| Date | 26 September 2026 |
| Target sprint | S1 |
| Depends on | M01 Auth, M02 RBAC |
| Read with | Dev Spec 00 · Architecture & Common Standards |
| Status | Draft for engineering review |

## Table 2

| Aspect | Detail |
| Clients | Admin Web Console · Partner App - Help |
| Depends on | M01 Auth · M02 RBAC |
| Used by | All modules - audit & config |
| Data stores | PostgreSQL: audit_logs, config, tickets |
| External services | None |

## Table 3

| Layer | Rule relevant to this module |
| Entry | All client and webhook traffic enters through CloudFront + WAF → ALB (HTTPS 443). |
| Compute | M16 APIs run in private ECS API tasks; its async jobs run in worker tasks. No public IPs. |
| Data | PostgreSQL and Redis sit in private data subnets reachable only from app security groups; S3 via VPC endpoint with pre-signed URLs. |
| Egress | No direct third-party calls from this module. |
| Secrets | Keys and credentials come from Secrets Manager; never in code or env files in the repo. |

## Table 4

| Column | Type | Constraints | Notes |
| id | bigserial | PK | partitioned monthly |
| actor_user_id / actor_partner_id / actor_type |  |  |  |
| action | varchar(60) |  | e.g. order.status_override |
| entity_type / entity_id |  | index |  |
| before / after | jsonb |  | PII masked |
| reason | text |  | mandatory for overrides |
| ip / user_agent / geo / trace_id / at |  |  |  |

## Table 5

| Column | Type | Constraints | Notes |
| key | varchar(80) |  |  |
| scope | enum | GLOBAL \| STATE \| TIER \| PARTNER |  |
| scope_value | varchar |  |  |
| value | jsonb |  |  |
| effective_from / changed_by |  |  |  |

## Table 6

| Config key | Default | Used by |
| order.sla_hours | 4 working hours | M07 |
| order.mov_by_tier | SS 2,00,000 · DS 25,000 · SD 5,000 · RT 1,000 (₹, to confirm) | M06 |
| order.cancel_window | Until ACCEPTED | M06 |
| assisted.dispute_hours | 24 | M06 |
| credit.grace_days | 7 | M11 |
| credit.cap_by_tier | to be set by Finance | M03 / M11 |
| price.max_discount_pct | 3 | M05 |
| claim.window_hours | 48 | M12 |
| eway.threshold | 50000 | M08 |
| notify.quiet_hours | 21:00–08:00 | M13 |
| app.min_version | per platform | M01 |
| kyc.auto_approve_rt_zero_credit | true | M03 |

## Table 7

| Column | Type | Constraints | Notes |
| id / ticket_no |  |  |  |
| partner_id / user_id |  |  |  |
| category | enum |  | LOGIN, ORDER, PAYMENT, DELIVERY, APP_BUG, OTHER |
| subject / description / attachments |  |  |  |
| ref_type / ref_id |  |  | optional order / payment |
| status / assignee / sla_due_at |  |  | OPEN, IN_PROGRESS, RESOLVED, CLOSED |

## Table 8

| Method | Endpoint | Permission | Description |
| POST / GET | /support/tickets | auth | Raise and list my tickets (Help & Support). |
| GET | /support/faqs?lang= | public | FAQ content. |
| GET / PATCH | /admin/tickets | support.manage | Assign, reply, resolve. |
| GET | /admin/audit-logs?entity=&actor=&from= | audit.view | Audit viewer. |
| GET / PUT | /admin/config | config.manage | Config (maker-checker for money-impacting keys). |

## Table 9

| Item | Detail |
| Target sprint | S1 |
| Indicative effort (person-days) | Backend 5 · Mobile 2 · Admin web 4 · QA 2 · Total 13 |

## Table 10

| Discipline | Tasks |
| Backend | 1. audit_logs (partitioned, insert-only)
2. Config service with scopes & cache
3. Tickets & FAQs APIs |
| Mobile (Flutter) | 1. Help & Support: FAQs, raise ticket, ticket status |
| Admin web | 1. Audit viewer
2. Config editor
3. Support desk |
| QA focus | 1. Audit on every money / state change
2. Config effective dating |
