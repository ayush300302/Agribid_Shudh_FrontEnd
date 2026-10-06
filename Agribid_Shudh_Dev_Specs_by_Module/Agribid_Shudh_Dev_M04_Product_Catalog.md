AGRIBID SHUDH · DEVELOPMENT SPEC M04

Product Catalog

Module development specification

Contents

0. Module Context & Architecture	3

0.1 Module context diagram	3

0.2 Where this module sits in the system	3

0.3 Network & deployment diagram	4

0.4 Request authorisation (applies to every API in this module)	5

0.5 Conventions summary	5

M04. Product Catalog	6

M04.1 Overview	6

M04.2 Data model	6

M04.3 APIs	7

M04.4 Rules	7

M04.5 Acceptance criteria	7

M04.8 Build Checklist & Estimate	7

M04.9 Definition of Done	8

0. Module Context & Architecture

This document is the development specification for M04 · Product Catalog of the Agribid Shudh multi-tier distribution app (Agribid → State Stockist → Distributor → Sub-Distributor → Retailer, plus Admin). It is derived from PRD v1.0 and is one of 18 documents; shared standards are detailed in Dev Spec 00 · Architecture & Common Standards.

0.1 Module context diagram

Figure 1: M04 context: clients, dependencies, consumers, data stores and external services

0.2 Where this module sits in the system

All modules run inside one NestJS backend (modular monolith) with background workers. M04 is a code module with its own folder, its own tables, and a public service interface. Other modules call it only through that interface, never by querying its tables directly.

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

M04. Product Catalog

M04.1 Overview

M04.2 Data model

Table: categories

Table: skus

M04.3 APIs

M04.4 Rules

M04.5 Acceptance criteria

Given a Retailer in Maharashtra, when they open the Rice category, then only SKUs enabled for RT in MH with an active RT price are listed.

Given the parent has zero stock of Sunflower Oil, when the buyer views it, then it shows "Out of Stock" with Add disabled and a Notify-me option.

M04.8 Build Checklist & Estimate

Estimates are indicative and must be re-estimated by the squad in sprint planning.

M04.9 Definition of Done

Code reviewed and merged; unit and integration tests pass (≥ 80% coverage on business services).

Endpoints documented in OpenAPI; error codes added to the i18n catalogue (en, hi, mr).

Permission code and data scope enforced and covered by positive and negative tests.

Audit log written for every state or money change.

Mobile / web screens match DESIGN.md tokens with empty, loading, error and offline states.

Analytics events fired; acceptance criteria in this document verified by QA.

— End of M04 —

## Table 1

| Field | Detail |
| Document | Dev Spec M04: Product Catalog v1.0 |
| Source | Agribid Shudh PRD v1.0 and Stitch design set |
| Date | 26 September 2026 |
| Target sprint | S2 |
| Depends on | M02 RBAC, M16 Config |
| Read with | Dev Spec 00 · Architecture & Common Standards |
| Status | Draft for engineering review |

## Table 2

| Aspect | Detail |
| Clients | Partner Mobile App · Admin Web Console |
| Depends on | M02 RBAC · M16 Config |
| Used by | M05 Pricing · M06 Ordering · M10 Inventory |
| Data stores | PostgreSQL: skus, categories · S3 + CDN: product images |
| External services | None |

## Table 3

| Layer | Rule relevant to this module |
| Entry | All client and webhook traffic enters through CloudFront + WAF → ALB (HTTPS 443). |
| Compute | M04 APIs run in private ECS API tasks; its async jobs run in worker tasks. No public IPs. |
| Data | PostgreSQL and Redis sit in private data subnets reachable only from app security groups; S3 via VPC endpoint with pre-signed URLs. |
| Egress | No direct third-party calls from this module. |
| Secrets | Keys and credentials come from Secrets Manager; never in code or env files in the repo. |

## Table 4

| Item | Detail |
| Purpose | Master list of SKUs, categories, packs, HSN / GST; visibility by state and tier. |
| PRD refs | 9.4 CAT-01..05, ADM-04 |
| Screens | Mobile: catalog list with category chips ✓ (Create Order design), product detail*, search. Admin: SKU list, SKU form, category manager, bulk import. |
| Roles | Admin / Catalog manages; everyone else reads |

## Table 5

| Column | Type | Constraints | Notes |
| id | uuid | PK |  |
| name / name_i18n | varchar / jsonb |  | Rice, Pulses, Wheat & Flour, Sugar, Edible Oil, Spices… |
| parent_id | uuid | NULL | sub-categories |
| sort_order / icon |  |  |  |

## Table 6

| Column | Type | Constraints | Notes |
| id | uuid | PK |  |
| sku_code | varchar(30) | UNIQUE | e.g. RICE-BAS-PRM-50KG |
| name / name_i18n | varchar(160) / jsonb | NOT NULL | "Shudh Premium Basmati" |
| brand_line | varchar(80) |  | Heritage Brand, Shudh Brand… |
| category_id | uuid | FK |  |
| pack_size / pack_uom | numeric / enum |  | 50 KG, 25 KG, 10 KG, 1 KG, 15 L |
| sale_uom | enum |  | BAG, SACK, PACK, TIN, QUINTAL, MT |
| net_weight_kg | numeric(10,3) |  | used for vehicle capacity |
| hsn_code | varchar(8) | NOT NULL |  |
| gst_rate | numeric(5,2) | NOT NULL | 0, 5, 12, 18 |
| mrp | numeric(14,2) |  | printed MRP (where applicable) |
| moq_by_tier | jsonb |  | {"SS": 100, "DS": 20, "SD": 5, "RT": 1} in sale_uom |
| pack_multiple_by_tier | jsonb |  | BR-15 |
| images | text[] |  | S3 keys; first = thumbnail |
| attributes | jsonb |  | grade, origin, shelf life, polished / unpolished |
| enabled_states | text[] |  | empty = all |
| enabled_tiers | text[] |  |  |
| status | enum | ACTIVE \| INACTIVE \| DISCONTINUED |  |
| search_vector | tsvector | GIN | name + brand + code (+ pg_trgm for typos) |

## Table 7

| Method | Endpoint | Permission | Description |
| GET | /catalog?category=&q=&cursor= | catalog.browse | SKUs visible to caller (state, tier), with caller buy price, MRP, scheme tags and parent stock status (IN / LOW / OUT). |
| GET | /catalog/:skuId | catalog.browse | Detail with price slabs and active schemes. |
| GET | /catalog/categories | catalog.browse | Category chips. |
| GET | /catalog/sync?since= | catalog.browse | Delta for offline cache (changed SKUs & prices since timestamp). |
| POST | /catalog/:skuId/notify-me | catalog.browse | Register restock alert. |
| GET / POST / PUT | /admin/skus[/:id] | catalog.manage | CRUD SKUs; image upload URLs. |
| POST | /admin/skus/import | catalog.manage | Excel bulk create / update. |

## Table 8

| Code | Rule / validation | HTTP · error code |
| CT-01 | Caller sees only SKUs where status ACTIVE and caller state ∈ enabled_states (or empty) and tier ∈ enabled_tiers and an active price exists for caller's tier. | filtered |
| CT-02 | Stock badge uses the parent's available qty: OUT = 0, LOW ≤ parent min level, else IN. Exact qty is never shown to the buyer. | n/a |
| CT-03 | HSN 4–8 digits; GST rate from allowed list; changing gst_rate needs maker-checker. | 400 · INVALID_TAX |
| CT-04 | DISCONTINUED SKUs stay visible in past orders and reports but not in the catalog. | n/a |

## Table 9

| Item | Detail |
| Target sprint | S2 |
| Indicative effort (person-days) | Backend 5 · Mobile 5 · Admin web 5 · QA 3 · Total 18 |

## Table 10

| Discipline | Tasks |
| Backend | 1. skus / categories schema, search vector
2. Catalog API filtered by state & tier
3. Delta sync endpoint for offline cache
4. Notify-me registration |
| Mobile (Flutter) | 1. Catalog list with category chips & search
2. Product card with stock badge
3. Product detail
4. Offline catalog cache (Drift) |
| Admin web | 1. SKU list & form, image upload
2. Category manager
3. Bulk import |
| QA focus | 1. Visibility by state / tier
2. Search typo tolerance
3. Offline catalog |
