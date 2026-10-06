AGRIBID SHUDH · DEVELOPMENT SPEC M02

Users, Roles & Permissions (RBAC)

Module development specification

Contents

0. Module Context & Architecture	3

0.1 Module context diagram	3

0.2 Where this module sits in the system	3

0.3 Network & deployment diagram	4

0.4 Request authorisation (applies to every API in this module)	5

0.5 Conventions summary	5

M02. Users, Roles & Permissions (RBAC)	6

M02.1 Overview	6

M02.2 Model	6

M02.3 Data model	6

M02.4 APIs	7

M02.5 Implementation notes	7

M02.6 Acceptance criteria	7

M02.8 Build Checklist & Estimate	8

M02.9 Definition of Done	8

0. Module Context & Architecture

This document is the development specification for M02 · Users, Roles & Permissions (RBAC) of the Agribid Shudh multi-tier distribution app (Agribid → State Stockist → Distributor → Sub-Distributor → Retailer, plus Admin). It is derived from PRD v1.0 and is one of 18 documents; shared standards are detailed in Dev Spec 00 · Architecture & Common Standards.

0.1 Module context diagram

Figure 1: M02 context: clients, dependencies, consumers, data stores and external services

0.2 Where this module sits in the system

All modules run inside one NestJS backend (modular monolith) with background workers. M02 is a code module with its own folder, its own tables, and a public service interface. Other modules call it only through that interface, never by querying its tables directly.

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

M02. Users, Roles & Permissions (RBAC)

M02.1 Overview

M02.2 Model

A user acts for a partner through a user_account that carries one role. A role is a named bundle of permission codes (module.action). Data scope is derived from the partner's tier and hierarchy path, not stored per permission.

M02.3 Data model

Table: roles

Table: permissions / role_permissions

Table: user_accounts

M02.4 APIs

M02.5 Implementation notes

NestJS guard chain: JwtAuthGuard → AccountStatusGuard → PermissionGuard(@RequirePermission('order.accept')) → ScopeInterceptor that injects scope filters into repository queries.

Permissions are cached in Redis perm:{roleId} and invalidated on role change.

A request that fails the scope check returns 404, not 403, so record IDs cannot be probed.

Every write through an Admin override (status override, credit override) requires a reason string and is written to audit_logs.

M02.6 Acceptance criteria

Given a Retailer token, when it calls POST /orders/:id/accept, then the API returns 403 FORBIDDEN.

Given Distributor A, when it requests an order belonging to Distributor B, then the API returns 404 NOT_FOUND.

Given a State Manager scoped to MH, when they open the partner list, then only Maharashtra partners are returned.

M02.8 Build Checklist & Estimate

Estimates are indicative and must be re-estimated by the squad in sprint planning.

M02.9 Definition of Done

Code reviewed and merged; unit and integration tests pass (≥ 80% coverage on business services).

Endpoints documented in OpenAPI; error codes added to the i18n catalogue (en, hi, mr).

Permission code and data scope enforced and covered by positive and negative tests.

Audit log written for every state or money change.

Mobile / web screens match DESIGN.md tokens with empty, loading, error and offline states.

Analytics events fired; acceptance criteria in this document verified by QA.

— End of M02 —

## Table 1

| Field | Detail |
| Document | Dev Spec M02: Users, Roles & Permissions (RBAC) v1.0 |
| Source | Agribid Shudh PRD v1.0 and Stitch design set |
| Date | 26 September 2026 |
| Target sprint | S1 |
| Depends on | M01 Auth, M16 Audit |
| Read with | Dev Spec 00 · Architecture & Common Standards |
| Status | Draft for engineering review |

## Table 2

| Aspect | Detail |
| Clients | Admin Web Console · Partner App - staff P2 |
| Depends on | M01 Auth · M16 Audit |
| Used by | Every API guard · M14 report scopes |
| Data stores | PostgreSQL: roles, permissions, user_accounts · Redis: permission cache |
| External services | None |

## Table 3

| Layer | Rule relevant to this module |
| Entry | All client and webhook traffic enters through CloudFront + WAF → ALB (HTTPS 443). |
| Compute | M02 APIs run in private ECS API tasks; its async jobs run in worker tasks. No public IPs. |
| Data | PostgreSQL and Redis sit in private data subnets reachable only from app security groups; S3 via VPC endpoint with pre-signed URLs. |
| Egress | No direct third-party calls from this module. |
| Secrets | Keys and credentials come from Secrets Manager; never in code or env files in the repo. |

## Table 4

| Item | Detail |
| Purpose | Define roles, permission codes and data scope; enforce on every API; allow Admin sub-roles and (phase 2) partner staff logins. |
| PRD refs | Section 8 (permission matrix), BR-14, ADM-10 |
| Screens | Admin: Roles & Permissions, Admin users. Mobile (P2): Staff users. |
| Depends on | M01 |

## Table 5

| Scope type | Rule (SQL idea) | Used for |
| OWN | record.partner_id = :me | My inventory, my profile |
| AS_BUYER / AS_SELLER | order.buyer_id = :me / order.seller_id = :me | Purchases / Sales tabs |
| CHILDREN | partner.parent_id = :me | My retailers list, credit limits |
| DOWNLINE | partner.path <@ :myPath | SS / DS network reports |
| STATE | partner.state_code = ANY(:adminStates) | Admin "State Manager" sub-role |
| ALL | no filter | Super Admin, Sales Ops |

## Table 6

| Column | Type | Constraints | Notes |
| id | uuid | PK |  |
| code | varchar(40) | UNIQUE | MF_OWNER, SS_OWNER, DS_OWNER, SD_OWNER, RT_OWNER, ADM_SUPER, ADM_SALES_OPS, ADM_FINANCE, ADM_CATALOG, ADM_SUPPORT, ADM_STATE_MGR, DS_STAFF_BILLING … |
| app | enum | MOBILE \| ADMIN |  |
| tier | smallint | NULL | for partner roles |
| is_system | boolean |  | system roles cannot be deleted |

## Table 7

| Column | Type | Constraints | Notes |
| code | varchar(60) | PK | e.g. order.place, order.accept, order.on_behalf, inventory.adjust, payment.record, partner.create_child, price.publish, credit.set_child |
| role_id + permission_code | composite PK |  |  |

## Table 8

| Column | Type | Constraints | Notes |
| user_id | uuid | FK users |  |
| partner_id | uuid | FK partners, NULL for admin |  |
| role_id | uuid | FK roles |  |
| admin_state_scope | text[] | NULL | for ADM_STATE_MGR |
| status | enum | ACTIVE \| DISABLED |  |
|  |  | UNIQUE(user_id, partner_id) |  |

## Table 9

| Method | Endpoint | Permission | Description |
| GET | /admin/roles | role.view | List roles with permission codes. |
| POST / PUT | /admin/roles[/:id] | role.manage | Create / edit custom admin roles (system roles are read-only). |
| GET / POST | /admin/users | adminuser.manage | List / invite admin users (email, role, state scope). |
| PATCH | /admin/users/:id | adminuser.manage | Disable, change role, reset 2FA. |
| GET / POST | /partners/me/staff | staff.manage (P2) | Partner owner adds staff users with a staff role. |

## Table 10

| Item | Detail |
| Target sprint | S1 |
| Indicative effort (person-days) | Backend 6 · Mobile 1 · Admin web 4 · QA 3 · Total 14 |

## Table 11

| Discipline | Tasks |
| Backend | 1. roles / permissions / user_accounts schema & seed
2. Guard chain: JWT → status → permission → scope
3. Scope helpers (OWN, CHILDREN, DOWNLINE, STATE, ALL)
4. Permission cache in Redis with invalidation |
| Mobile (Flutter) | 1. Hide actions not in permission list |
| Admin web | 1. Roles & permissions editor
2. Admin users list / invite / disable |
| QA focus | 1. Negative tests: 403 vs 404 per role
2. State-scoped admin visibility |
