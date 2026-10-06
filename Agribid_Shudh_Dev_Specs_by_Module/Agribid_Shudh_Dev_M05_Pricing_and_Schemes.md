AGRIBID SHUDH · DEVELOPMENT SPEC M05

Pricing & Schemes

Module development specification

Contents

0. Module Context & Architecture	3

0.1 Module context diagram	3

0.2 Where this module sits in the system	3

0.3 Network & deployment diagram	4

0.4 Request authorisation (applies to every API in this module)	5

0.5 Conventions summary	5

M05. Pricing & Schemes	6

M05.1 Overview	6

M05.2 Price resolution flow	6

M05.3 Data model	6

M05.4 APIs	8

M05.5 Rules	8

M05.6 Acceptance criteria	9

M05.8 Build Checklist & Estimate	9

M05.9 Definition of Done	9

0. Module Context & Architecture

This document is the development specification for M05 · Pricing & Schemes of the Agribid Shudh multi-tier distribution app (Agribid → State Stockist → Distributor → Sub-Distributor → Retailer, plus Admin). It is derived from PRD v1.0 and is one of 18 documents; shared standards are detailed in Dev Spec 00 · Architecture & Common Standards.

0.1 Module context diagram

Figure 1: M05 context: clients, dependencies, consumers, data stores and external services

0.2 Where this module sits in the system

All modules run inside one NestJS backend (modular monolith) with background workers. M05 is a code module with its own folder, its own tables, and a public service interface. Other modules call it only through that interface, never by querying its tables directly.

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

M05. Pricing & Schemes

M05.1 Overview

M05.2 Price resolution flow

Figure 5: Price and scheme resolution for one cart line

M05.3 Data model

Table: price_lists

Table: price_list_items

Table: partner_price_overrides  ·  optional special rates

Table: schemes

Table: banners

M05.4 APIs

M05.5 Rules

M05.6 Acceptance criteria

Given a slab scheme 2% at ≥ 10 bags and 4% at ≥ 50 bags, when a buyer orders 55 bags, then the line shows 4% discount and the savings line on Review Order.

Given a new DS price list effective 1 Oct 00:00 IST, when a distributor opens the catalog on 1 Oct, then the new prices are shown and carts priced earlier return PRICE_CHANGED.

M05.8 Build Checklist & Estimate

Estimates are indicative and must be re-estimated by the squad in sprint planning.

M05.9 Definition of Done

Code reviewed and merged; unit and integration tests pass (≥ 80% coverage on business services).

Endpoints documented in OpenAPI; error codes added to the i18n catalogue (en, hi, mr).

Permission code and data scope enforced and covered by positive and negative tests.

Audit log written for every state or money change.

Mobile / web screens match DESIGN.md tokens with empty, loading, error and offline states.

Analytics events fired; acceptance criteria in this document verified by QA.

— End of M05 —

## Table 1

| Field | Detail |
| Document | Dev Spec M05: Pricing & Schemes v1.0 |
| Source | Agribid Shudh PRD v1.0 and Stitch design set |
| Date | 26 September 2026 |
| Target sprint | S3 (lists) · Phase 2 (full schemes) |
| Depends on | M03 Partner tier/state, M04 Catalog, M16 Maker-checker |
| Read with | Dev Spec 00 · Architecture & Common Standards |
| Status | Draft for engineering review |

## Table 2

| Aspect | Detail |
| Clients | Partner Mobile App · Admin Web Console |
| Depends on | M03 Partner tier/state · M04 Catalog · M16 Maker-checker |
| Used by | M06 Ordering - quote · M08 Invoicing - tax · M14 Scheme reports |
| Data stores | PostgreSQL: price_lists, schemes, banners · Redis: price cache |
| External services | None |

## Table 3

| Layer | Rule relevant to this module |
| Entry | All client and webhook traffic enters through CloudFront + WAF → ALB (HTTPS 443). |
| Compute | M05 APIs run in private ECS API tasks; its async jobs run in worker tasks. No public IPs. |
| Data | PostgreSQL and Redis sit in private data subnets reachable only from app security groups; S3 via VPC endpoint with pre-signed URLs. |
| Egress | No direct third-party calls from this module. |
| Secrets | Keys and credentials come from Secrets Manager; never in code or env files in the repo. |

## Table 4

| Item | Detail |
| Purpose | Tier price lists per state, seller discount band, scheme engine, price resolution at cart and order time. |
| PRD refs | BR-04, BR-05, BR-16, 9.11 SCH-01..04, ADM-05/06 |
| Screens | Admin: Price lists (grid editor, upload, version compare), Schemes (builder, targeting, report), Banners. Mobile: price on cards, scheme tags, Offers page, banner carousel. |
| Depends on | M04, M03 (tier / state), M16 (maker-checker) |

## Table 5

| Column | Type | Constraints | Notes |
| id | uuid | PK |  |
| state_code | varchar(2) |  |  |
| tier | enum |  | buyer tier this list prices |
| version | int |  |  |
| effective_from / effective_to | timestamptz |  | no overlap for same state × tier |
| status | enum | DRAFT \| PENDING_APPROVAL \| PUBLISHED \| ARCHIVED |  |
| approved_by | uuid |  | checker ≠ maker |

## Table 6

| Column | Type | Constraints | Notes |
| price_list_id + sku_id | composite PK |  |  |
| buy_price | numeric(14,2) | > 0 | price the tier pays its parent (ex-GST) |
| suggested_sell_price | numeric(14,2) |  | price this tier charges its child |
| mrp | numeric(14,2) |  | override of SKU MRP if needed |
| max_discount_pct | numeric(5,2) | default config | BR-05 seller band |

## Table 7

| Column | Type | Constraints | Notes |
| partner_id + sku_id |  |  |  |
| price | numeric |  |  |
| valid_to | date |  |  |
| approved_by | uuid |  |  |

## Table 8

| Column | Type | Constraints | Notes |
| id | uuid | PK |  |
| code / name / description_i18n |  |  |  |
| type | enum |  | FLAT_PCT, SLAB_PCT, SLAB_AMOUNT, FREE_GOODS, COMBO, EARLY_PAYMENT |
| rules | jsonb |  | e.g. {"slabs":[{"minQty":10,"pct":2},{"minQty":50,"pct":4}]} |
| target_tiers / target_states / target_partner_ids / sku_ids / category_ids | arrays |  |  |
| valid_from / valid_to | timestamptz |  |  |
| budget_amount / budget_used | numeric |  | stop when exhausted |
| stackable | boolean | default false |  |
| status | enum | DRAFT \| PENDING_APPROVAL \| ACTIVE \| PAUSED \| ENDED |  |

## Table 9

| Column | Type | Constraints | Notes |
| id | uuid | PK |  |
| image_key, title_i18n, subtitle_i18n |  |  | "Monsoon Deals · Up to 15% off on bulk Rice orders" |
| action | jsonb |  | {type: SCHEME \| CATEGORY \| URL, id} |
| target_tiers / states / valid dates / sort |  |  |  |

## Table 10

| Method | Endpoint | Permission | Description |
| POST | /pricing/quote | order.place | Price a cart {sellerId?, lines[]} → priced lines, schemes applied, taxes, totals. Used by cart and review screens. |
| GET | /offers | catalog.browse | Active schemes visible to caller. |
| GET | /banners | auth | Home carousel for caller tier / state. |
| GET / POST | /admin/price-lists | price.manage | List / create draft (copy from previous version). |
| PUT | /admin/price-lists/:id/items | price.manage | Bulk upsert items (grid or Excel). |
| POST | /admin/price-lists/:id/submit \| /approve \| /reject | price.manage / price.approve | Maker-checker; approve publishes at effective_from. |
| GET | /admin/price-lists/:id/compare/:otherId | price.manage | Diff with % change per SKU. |
| CRUD | /admin/schemes, /admin/banners | scheme.manage / scheme.approve | Scheme builder with targeting and approval. |
| GET | /admin/schemes/:id/report | scheme.manage | Uptake, discount given, incremental volume. |

## Table 11

| Code | Rule / validation | HTTP · error code |
| PR-01 | Price is re-resolved at order placement; if any line changed since the cart was priced, return the new quote and require the user to re-confirm. | 409 · PRICE_CHANGED |
| PR-02 | Seller-entered selling price must be ≥ list × (1 − max_discount_pct) and ≤ list and ≤ MRP (BR-05). | 422 · PRICE_OUT_OF_BAND |
| PR-03 | A buyer never receives buy_price of any tier other than its own (API response DTOs strip it). | n/a |
| PR-04 | Tax type: IGST when seller state ≠ place-of-supply state, else CGST + SGST (half each). | n/a |
| PR-05 | Scheme application order: partner override price → best non-stackable scheme (max benefit) → stackable schemes → early-payment discount at payment time. | n/a |
| PR-06 | Scheme budget is decremented on DELIVERED (not on placement); a scheme is auto-paused when budget_used ≥ budget_amount. | n/a |
| PR-07 | Published price lists are immutable; a change = new version. | 409 · PRICE_LIST_LOCKED |

## Table 12

| Item | Detail |
| Target sprint | S3 (lists) · Phase 2 (full schemes) |
| Indicative effort (person-days) | Backend 10 · Mobile 3 · Admin web 8 · QA 5 · Total 26 |

## Table 13

| Discipline | Tasks |
| Backend | 1. price_lists / items, versioning, effective dating
2. Quote engine (base → override → schemes → GST)
3. Scheme rules evaluator (flat, slab, free goods)
4. Maker-checker integration
5. Banner API |
| Mobile (Flutter) | 1. Price & scheme tags on cards
2. Offers page, banner carousel
3. PRICE_CHANGED re-confirm dialog |
| Admin web | 1. Price-list grid editor, upload, compare
2. Scheme builder & targeting
3. Banner manager |
| QA focus | 1. Slab boundaries
2. IGST vs CGST/SGST
3. Effective-date switch at midnight IST |
