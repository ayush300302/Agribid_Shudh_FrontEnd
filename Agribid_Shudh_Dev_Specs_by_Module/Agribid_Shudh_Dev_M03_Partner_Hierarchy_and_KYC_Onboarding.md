AGRIBID SHUDH · DEVELOPMENT SPEC M03

Partner, Hierarchy & KYC Onboarding

Module development specification

Contents

0. Module Context & Architecture	3

0.1 Module context diagram	3

0.2 Where this module sits in the system	4

0.3 Network & deployment diagram	4

0.4 Request authorisation (applies to every API in this module)	5

0.5 Conventions summary	5

M03. Partner, Hierarchy & KYC Onboarding	6

M03.1 Overview	6

M03.2 Flow	6

M03.3 Data model	7

M03.4 APIs	8

M03.5 Validations	9

M03.6 Events & jobs	10

M03.7 Acceptance criteria	10

M03.8 Build Checklist & Estimate	10

M03.9 Definition of Done	11

0. Module Context & Architecture

This document is the development specification for M03 · Partner, Hierarchy & KYC Onboarding of the Agribid Shudh multi-tier distribution app (Agribid → State Stockist → Distributor → Sub-Distributor → Retailer, plus Admin). It is derived from PRD v1.0 and is one of 18 documents; shared standards are detailed in Dev Spec 00 · Architecture & Common Standards.

0.1 Module context diagram

Figure 1: M03 context: clients, dependencies, consumers, data stores and external services

0.2 Where this module sits in the system

All modules run inside one NestJS backend (modular monolith) with background workers. M03 is a code module with its own folder, its own tables, and a public service interface. Other modules call it only through that interface, never by querying its tables directly.

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

M03. Partner, Hierarchy & KYC Onboarding

M03.1 Overview

M03.2 Flow

Figure 5: Partner onboarding, KYC and approval (from PRD)

M03.3 Data model

Table: partners  ·  every business in the network

Table: kyc_documents

Table: partner_bank_accounts

Table: partner_mapping_history  ·  BR-01 audit of re-mapping

Table: territories

M03.4 APIs

M03.5 Validations

M03.6 Events & jobs

M03.7 Acceptance criteria

Given a Sub-Distributor adding a retailer with zero credit, when they submit all 4 steps, then the retailer becomes ACTIVE immediately, gets a partner code and a welcome SMS.

Given a Distributor entering a mobile already used by another retailer, when they complete step 1, then the app blocks creation and shows the existing mapping.

Given a draft saved at step 2, when the creator reopens it from the list, then the stepper resumes at step 2 with saved data.

Given Admin re-maps a Distributor to a new State Stockist from 1 Oct, when the date arrives, then new purchase orders route to the new SS while earlier open orders stay with the old one.

M03.8 Build Checklist & Estimate

Estimates are indicative and must be re-estimated by the squad in sprint planning.

M03.9 Definition of Done

Code reviewed and merged; unit and integration tests pass (≥ 80% coverage on business services).

Endpoints documented in OpenAPI; error codes added to the i18n catalogue (en, hi, mr).

Permission code and data scope enforced and covered by positive and negative tests.

Audit log written for every state or money change.

Mobile / web screens match DESIGN.md tokens with empty, loading, error and offline states.

Analytics events fired; acceptance criteria in this document verified by QA.

— End of M03 —

## Table 1

| Field | Detail |
| Document | Dev Spec M03: Partner, Hierarchy & KYC Onboarding v1.0 |
| Source | Agribid Shudh PRD v1.0 and Stitch design set |
| Date | 26 September 2026 |
| Target sprint | S2 |
| Depends on | M01 Auth, M02 RBAC, M13 Notifications, M17 Integrations |
| Read with | Dev Spec 00 · Architecture & Common Standards |
| Status | Draft for engineering review |

## Table 2

| Aspect | Detail |
| Clients | Partner Mobile App · Admin Web Console |
| Depends on | M01 Auth · M02 RBAC · M13 Notifications · M17 Integrations |
| Used by | M05 Pricing - tier/state · M06 Ordering - parent · M11 Credit accounts · M14 Reports - hierarchy |
| Data stores | PostgreSQL: partners, kyc_documents, territories · S3: KYC documents & photos |
| External services | GSTIN / PAN / bank verify · Google Maps |

## Table 3

| Layer | Rule relevant to this module |
| Entry | All client and webhook traffic enters through CloudFront + WAF → ALB (HTTPS 443). |
| Compute | M03 APIs run in private ECS API tasks; its async jobs run in worker tasks. No public IPs. |
| Data | PostgreSQL and Redis sit in private data subnets reachable only from app security groups; S3 via VPC endpoint with pre-signed URLs. |
| Egress | Calls to GSTIN / PAN / bank verify, Google Maps leave through the NAT Gateway via the M17 adapter layer. |
| Secrets | Keys and credentials come from Secrets Manager; never in code or env files in the repo. |

## Table 4

| Item | Detail |
| Purpose | Create and approve partners of every tier, maintain parent mapping and hierarchy, store KYC, manage status. |
| PRD refs | BR-01..03, 9.2 (KYC-01..11), 9.10 (NET-01..05), ADM-02/03 |
| Screens | Add Partner stepper (Basic ✓ designed, Location, KYC, Credit pending), Partner list ✓, Partner profile ✓, Partner ledger ✓, KYC pending status, Admin partner queue, Hierarchy tree |
| Roles | Admin (all tiers), MF → SS, SS → DS, DS → SD / RT, SD → RT |
| Depends on | M01, M02, M11 (credit account creation), M13 (notifications), M17 (verification APIs) |

## Table 5

| Creator tier | Can create | Approval |
| Admin | Any tier | Maker-checker: created by one admin, approved by another (configurable) |
| MF | SS | Admin |
| SS | DS | Admin |
| DS | SD, RT (where BR-03 allows) | SD → Admin; RT with zero credit → auto; RT with credit → Admin |
| SD | RT | Zero credit → auto; credit → Admin |
| Self-registration (RT) | RT via referral code / QR | Parent from referral; zero-credit auto rule applies |

## Table 6

| Column | Type | Constraints | Notes |
| id | uuid | PK, default gen_random_uuid() |  |
| partner_code | varchar(24) | UNIQUE | AGB-DS-MH-00987, generated on approval |
| tier | enum | MF \| SS \| DS \| SD \| RT |  |
| parent_id | uuid | FK partners, NULL for MF | BR-01 single parent |
| path | ltree | GiST index | recomputed on re-map (descendants too) |
| business_name / owner_name | varchar(160) | NOT NULL |  |
| business_type | enum |  | KIRANA, SUPERMARKET, WHOLESALER, PHARMACY, AGRI_INPUT, OTHER |
| mobile / alt_mobile / email | varchar | mobile UNIQUE among active | OTP-verified mobile |
| gstin | varchar(15) | UNIQUE NULLS DISTINCT | regex GSTIN; state code must match address |
| pan | varchar(10) |  | regex [A-Z]{5}[0-9]{4}[A-Z] |
| fssai_no / trade_licence_no | varchar | NULL |  |
| address_line, pincode, city, district, state_code | varchar | NOT NULL | pincode → district / state lookup |
| delivery_address | jsonb | NULL | if different from shop address |
| geo | geography(Point) | NULL | from GPS Detect |
| territory_id | uuid | FK territories |  |
| status | enum | DRAFT \| PENDING_KYC \| ACTIVE \| CREDIT_HOLD \| BLOCKED \| INACTIVE |  |
| onboarding_step | smallint | 1–4 | resume draft |
| requested_credit_limit / requested_credit_days | numeric / smallint |  | copied to credit_accounts on approval |
| referral_code | varchar(10) | UNIQUE | for child self-registration |
| tier_badge | enum | NULL | GOLD \| SILVER \| BRONZE (P2) |
| approved_by / approved_at / rejection_reason |  |  |  |
| created_at, updated_at, deleted_at | timestamptz |  |  |

## Table 7

| Column | Type | Constraints | Notes |
| id | uuid | PK |  |
| partner_id | uuid | FK |  |
| doc_type | enum |  | GST_CERT, PAN, CANCELLED_CHEQUE, FSSAI, TRADE_LICENCE, SHOP_PHOTO, OWNER_PHOTO |
| s3_key | text | NOT NULL | private bucket |
| verify_status | enum | PENDING \| AUTO_OK \| MANUAL_OK \| REJECTED |  |
| verify_response | jsonb |  | API payload (masked) |

## Table 8

| Column | Type | Constraints | Notes |
| partner_id | uuid | FK |  |
| account_no_enc | bytea |  | KMS-encrypted; UI shows last 4 |
| ifsc | varchar(11) |  |  |
| holder_name | varchar |  |  |
| penny_drop_status | enum |  | P2 |

## Table 9

| Column | Type | Constraints | Notes |
| partner_id | uuid | FK |  |
| old_parent_id / new_parent_id | uuid |  |  |
| effective_from | date |  | open orders stay with old parent |
| reason / changed_by |  |  |  |

## Table 10

| Column | Type | Constraints | Notes |
| id | uuid | PK |  |
| state_code / district / taluka | varchar |  |  |
| pincodes | text[] | GIN index |  |
| retailer_direct_to_ds_allowed | boolean | default false | BR-03 switch |

## Table 11

| Method | Endpoint | Permission | Description |
| POST | /partners | partner.create_child | Create DRAFT (step 1 Basic). Returns id. Duplicate check on mobile. |
| PATCH | /partners/:id/steps/:step | partner.create_child | Save step 2 Location / 3 KYC / 4 Credit; Save Draft = same call. |
| POST | /partners/:id/documents/upload-url | partner.create_child | Pre-signed S3 PUT URL for a doc type. |
| POST | /partners/:id/submit | partner.create_child | Validate all steps → PENDING_KYC or auto-ACTIVE per approval matrix. |
| GET | /partners/children | partner.view_children | List my children; filters: status, overdue, pendingOrders, new; q search. |
| GET | /partners/:id | scope CHILDREN / ADMIN | Profile with KPIs (orders, purchases, outstanding, credit). |
| GET | /partners/me | auth | My profile, referral QR, parent details. |
| PATCH | /partners/me | auth | Edit non-KYC fields; KYC fields create a change request. |
| GET | /pincodes/:pin | auth | City / district / state lookup. |
| GET | /admin/partners/approvals | partner.approve | Approval queue with SLA age. |
| POST | /admin/partners/:id/approve \| /reject | partner.approve | Approve (generates partner_code, credit account) / reject with reason. |
| POST | /admin/partners/:id/remap | partner.remap | Change parent with effective date; recompute path for subtree. |
| POST | /admin/partners/:id/block \| /unblock | partner.block | With reason; revokes sessions on block. |
| POST | /admin/partners/import | partner.import | Excel bulk upload → async job → result file. |
| GET | /admin/hierarchy?root=:id&depth=2 | partner.view_all | Tree view with counts. |

## Table 12

| Code | Rule / validation | HTTP · error code |
| PT-01 | Creator may create only tiers allowed in the matrix above; RT under DS only if territory flag allows (BR-03). | 403 · TIER_NOT_ALLOWED |
| PT-02 | Mobile, GSTIN, PAN unique across active partners; response includes the existing partner's code and parent name (masked). | 409 · DUPLICATE_PARTNER |
| PT-03 | GSTIN format + checksum; GSTIN state code (first 2 digits) must equal address state. | 400 · GSTIN_STATE_MISMATCH |
| PT-04 | GSTIN mandatory for SS / DS / SD; FSSAI mandatory if any food category enabled. | 400 · KYC_INCOMPLETE |
| PT-05 | Requested credit ≤ tier cap (Admin config) and ≤ creator's authority. | 422 · CREDIT_ABOVE_CAP |
| PT-06 | Photos camera-only with EXIF GPS within 500 m of pinned location (warning, not block). | warning flag |
| PT-07 | Documents ≤ 5 MB, jpg / png / pdf; virus-scanned on upload (S3 event → scanner). | 400 · FILE_INVALID |
| PT-08 | Re-map: new parent must be exactly one tier above (or DS for RT where allowed) and ACTIVE; no cycles. | 409 · INVALID_MAPPING |
| PT-09 | Block: cannot block a partner with children unless children are re-mapped or blocked too (Admin confirms cascade). | 409 · HAS_ACTIVE_CHILDREN |

## Table 13

| Event / job | Trigger | Consumers / action |
| partner.submitted | Submit | Notify approver (Admin queue / parent) |
| partner.approved | Approve / auto | Create credit_account (M11), welcome SMS with app link (M13), analytics |
| partner.rejected | Reject | Notify creator with reason |
| partner.remapped | Admin re-map | Recompute ltree path of subtree; move credit account; notify old / new parent |
| job: kyc.verify | On submit | GSTIN / PAN / bank APIs (M17); store result; set verify_status |
| job: approvals.sla | Hourly | Escalate approvals older than 24 h to Admin lead |

## Table 14

| Item | Detail |
| Target sprint | S2 |
| Indicative effort (person-days) | Backend 10 · Mobile 10 · Admin web 6 · QA 5 · Total 31 |

## Table 15

| Discipline | Tasks |
| Backend | 1. partners schema with ltree path & GiST index
2. Stepper APIs (draft, steps 1–4, submit)
3. Duplicate checks (mobile, GSTIN, PAN)
4. Approval matrix, partner code generation
5. Re-map with subtree path recompute
6. S3 pre-signed upload + virus scan hook
7. Bulk import job |
| Mobile (Flutter) | 1. Add Partner stepper: Basic, Location (GPS, photos), KYC uploads, Credit
2. Save Draft / resume
3. Partner list with filters & summary
4. Partner profile, referral QR |
| Admin web | 1. Approval queue with document viewer
2. Partner 360, re-map, block
3. Hierarchy tree
4. Excel import screen |
| QA focus | 1. Approval routing matrix
2. Duplicate and GSTIN-state checks
3. Re-map effect on open orders |
