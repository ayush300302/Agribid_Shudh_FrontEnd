AGRIBID SHUDH · DEVELOPMENT SPEC M10

Inventory

Module development specification

Contents

0. Module Context & Architecture	3

0.1 Module context diagram	3

0.2 Where this module sits in the system	3

0.3 Network & deployment diagram	4

0.4 Request authorisation (applies to every API in this module)	5

0.5 Conventions summary	5

M10. Inventory	6

M10.1 Overview	6

M10.2 Flow	7

M10.3 Data model	7

M10.4 APIs	8

M10.5 Rules	8

M10.6 Events & jobs	9

M10.7 Acceptance criteria	9

M10.8 Build Checklist & Estimate	9

M10.9 Definition of Done	9

0. Module Context & Architecture

This document is the development specification for M10 · Inventory of the Agribid Shudh multi-tier distribution app (Agribid → State Stockist → Distributor → Sub-Distributor → Retailer, plus Admin). It is derived from PRD v1.0 and is one of 18 documents; shared standards are detailed in Dev Spec 00 · Architecture & Common Standards.

0.1 Module context diagram

Figure 1: M10 context: clients, dependencies, consumers, data stores and external services

0.2 Where this module sits in the system

All modules run inside one NestJS backend (modular monolith) with background workers. M10 is a code module with its own folder, its own tables, and a public service interface. Other modules call it only through that interface, never by querying its tables directly.

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

M10. Inventory

M10.1 Overview

M10.2 Flow

Figure 5: Inbound, reservation and replenishment (from PRD)

M10.3 Data model

Table: inventory  ·  one row per partner × SKU (× location in P3)

Table: stock_movements  ·  append-only ledger of stock

M10.4 APIs

M10.5 Rules

M10.6 Events & jobs

M10.7 Acceptance criteria

Given a distributor with 12 units of Toor Dal and min level 20, when they open Inventory, then the item shows a "Low Stock" badge and appears in reorder suggestions.

Given two sellers' staff accepting orders for the last 5 units at the same time, when both requests arrive, then only one succeeds and the other receives STOCK_CONFLICT.

M10.8 Build Checklist & Estimate

Estimates are indicative and must be re-estimated by the squad in sprint planning.

M10.9 Definition of Done

Code reviewed and merged; unit and integration tests pass (≥ 80% coverage on business services).

Endpoints documented in OpenAPI; error codes added to the i18n catalogue (en, hi, mr).

Permission code and data scope enforced and covered by positive and negative tests.

Audit log written for every state or money change.

Mobile / web screens match DESIGN.md tokens with empty, loading, error and offline states.

Analytics events fired; acceptance criteria in this document verified by QA.

— End of M10 —

## Table 1

| Field | Detail |
| Document | Dev Spec M10: Inventory v1.0 |
| Source | Agribid Shudh PRD v1.0 and Stitch design set |
| Date | 26 September 2026 |
| Target sprint | S3 |
| Depends on | M04 Catalog, M07 Fulfilment, M09 Delivery - GRN |
| Read with | Dev Spec 00 · Architecture & Common Standards |
| Status | Draft for engineering review |

## Table 2

| Aspect | Detail |
| Clients | Partner Mobile App · Admin Web Console |
| Depends on | M04 Catalog · M07 Fulfilment · M09 Delivery - GRN |
| Used by | M04 Stock badges · M06 Ordering · M14 Stock reports |
| Data stores | PostgreSQL: inventory, stock_movements |
| External services | None |

## Table 3

| Layer | Rule relevant to this module |
| Entry | All client and webhook traffic enters through CloudFront + WAF → ALB (HTTPS 443). |
| Compute | M10 APIs run in private ECS API tasks; its async jobs run in worker tasks. No public IPs. |
| Data | PostgreSQL and Redis sit in private data subnets reachable only from app security groups; S3 via VPC endpoint with pre-signed URLs. |
| Egress | No direct third-party calls from this module. |
| Secrets | Keys and credentials come from Secrets Manager; never in code or env files in the repo. |

## Table 4

| Item | Detail |
| Purpose | Stock per partner per SKU; reservations; stock movements (GRN, sale, adjustment, return); low-stock alerts and reorder suggestions. |
| PRD refs | BR-08, BR-09, 9.8 INV-01..08 |
| Screens | Inventory list ✓, Add Inventory ✓, Stock adjust*, Movement history*, Shortage claim* (links to M12) |
| Depends on | M04, M07, M09 |

## Table 5

| Column | Type | Constraints | Notes |
| partner_id + sku_id | composite PK |  |  |
| on_hand | numeric(14,3) | ≥ 0 |  |
| reserved | numeric(14,3) | ≥ 0, ≤ on_hand |  |
| available | generated | on_hand − reserved |  |
| min_level | numeric |  | Min. Stock Alert |
| location_label | varchar |  | Warehouse Location |
| purchase_price / selling_price | numeric(14,2) |  | weighted avg cost; sell price within BR-05 |
| version | int |  | optimistic lock for UI edits |

## Table 6

| Column | Type | Constraints | Notes |
| id | bigserial | PK |  |
| partner_id / sku_id | uuid | index |  |
| type | enum |  | OPENING, GRN, MANUAL_IN, SALE_RESERVE, SALE_RELEASE, SALE_DISPATCH, RETURN_IN, RETURN_OUT, ADJUST_DAMAGE, ADJUST_EXPIRY, ADJUST_AUDIT |
| qty | numeric | signed |  |
| on_hand_after / reserved_after | numeric |  |  |
| ref_type / ref_id |  |  | ORDER, SHIPMENT, CLAIM, ADJUSTMENT |
| reason / user / at |  |  |  |

## Table 7

| Method | Endpoint | Permission | Description |
| GET | /inventory?category=&q=&lowOnly= | inventory.view | My stock list with badges. |
| POST | /inventory/stock-in | inventory.manage | Add Item form: {skuId, qty, unit, minLevel, location, purchasePrice, sellingPrice, photo}. |
| PATCH | /inventory/:skuId | inventory.manage | Edit min level, location, selling price (version check). |
| POST | /inventory/:skuId/adjust | inventory.adjust | {qty (signed), type, reason, photo}; visible to parent and Admin. |
| GET | /inventory/:skuId/movements | inventory.view | Movement history. |
| GET | /inventory/reorder-suggestions | inventory.view | SKUs ≤ min with suggested qty → one tap adds to cart (M06). |
| GET | /admin/inventory?partnerId=&state= | inventory.view_all | Network stock & stock-cover. |

## Table 8

| Code | Rule / validation | HTTP · error code |
| IV-01 | All stock changes go through one InventoryService.move() that writes stock_movements and updates inventory in the same transaction with FOR UPDATE. | n/a |
| IV-02 | Reserve on ACCEPT; release on REJECT / CANCEL; SALE_DISPATCH reduces on_hand and reserved together. | n/a |
| IV-03 | GRN on DELIVERED adds qty_delivered to buyer on_hand; purchase_price updated by weighted average. | n/a |
| IV-04 | on_hand can never go negative; any attempt raises STOCK_CONFLICT and the transaction rolls back. | 409 · STOCK_CONFLICT |
| IV-05 | Suggested reorder = max(min_level × 2 − available, 8-week avg weekly sales × lead-time weeks + safety) rounded to pack multiple (P1 simple; P2 forecast). | n/a |
| IV-06 | Adjustments above ₹10,000 value (configurable) need parent or Admin approval. | pending state |

## Table 9

| Event / job | Trigger | Consumers / action |
| stock.low | available ≤ min_level after a move | Push to partner (debounced once per SKU per day) |
| stock.restocked | available crosses from 0 to > 0 | Notify-me subscribers (M04) |
| job: stock.snapshot | Daily 23:55 IST | Write snap_stock for reports / stock-cover |

## Table 10

| Item | Detail |
| Target sprint | S3 |
| Indicative effort (person-days) | Backend 7 · Mobile 6 · Admin web 2 · QA 4 · Total 19 |

## Table 11

| Discipline | Tasks |
| Backend | 1. inventory & stock_movements schema
2. InventoryService.move() with row locks
3. Reserve / release / dispatch / GRN hooks
4. Low-stock event & reorder suggestions
5. Daily stock snapshot |
| Mobile (Flutter) | 1. Inventory list with badges
2. Add Inventory form
3. Adjust stock, movement history
4. Reorder suggestion → cart |
| Admin web | 1. Network stock view |
| QA focus | 1. Negative stock prevention
2. Concurrent reservations
3. Auto GRN on delivery |
