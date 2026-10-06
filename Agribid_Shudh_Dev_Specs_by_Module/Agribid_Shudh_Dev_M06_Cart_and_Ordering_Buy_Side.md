AGRIBID SHUDH · DEVELOPMENT SPEC M06

Cart & Ordering (Buy Side)

Module development specification

Contents

0. Module Context & Architecture	3

0.1 Module context diagram	3

0.2 Where this module sits in the system	4

0.3 Network & deployment diagram	4

0.4 Request authorisation (applies to every API in this module)	5

0.5 Conventions summary	5

M06. Cart & Ordering (Buy Side)	6

M06.1 Overview	6

M06.2 Flows	6

M06.3 Data model	7

M06.4 APIs	8

M06.5 Validations	9

M06.6 Events	9

M06.7 Acceptance criteria	10

M06.8 Build Checklist & Estimate	10

M06.9 Definition of Done	10

0. Module Context & Architecture

This document is the development specification for M06 · Cart & Ordering (Buy Side) of the Agribid Shudh multi-tier distribution app (Agribid → State Stockist → Distributor → Sub-Distributor → Retailer, plus Admin). It is derived from PRD v1.0 and is one of 18 documents; shared standards are detailed in Dev Spec 00 · Architecture & Common Standards.

0.1 Module context diagram

Figure 1: M06 context: clients, dependencies, consumers, data stores and external services

0.2 Where this module sits in the system

All modules run inside one NestJS backend (modular monolith) with background workers. M06 is a code module with its own folder, its own tables, and a public service interface. Other modules call it only through that interface, never by querying its tables directly.

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

M06. Cart & Ordering (Buy Side)

M06.1 Overview

M06.2 Flows

Figure 5: Buyer order placement (from PRD)

Figure 6: Order placement API sequence

Figure 7: Assisted order on behalf of a retailer (from PRD)

M06.3 Data model

Table: carts / cart_items  ·  server cart, one per buyer-seller pair (also cached offline)

Table: orders

Table: order_lines

M06.4 APIs

M06.5 Validations

M06.6 Events

M06.7 Acceptance criteria

Given a retailer with ₹45,000 available credit, when they place a ₹16,530 credit order, then the order is NEW and available credit shows ₹28,470.

Given a retailer with an invoice overdue beyond grace, when they choose Credit Account, then the option is disabled with a "Pay dues" link, and POD still works.

Given a double tap on "Confirm & Place Order", when two requests reach the server with the same Idempotency-Key, then only one order is created.

Given a distributor creating an order for Krishna General Store, when it is placed, then the retailer receives an SMS and sees the order tagged "Placed by your distributor".

M06.8 Build Checklist & Estimate

Estimates are indicative and must be re-estimated by the squad in sprint planning.

M06.9 Definition of Done

Code reviewed and merged; unit and integration tests pass (≥ 80% coverage on business services).

Endpoints documented in OpenAPI; error codes added to the i18n catalogue (en, hi, mr).

Permission code and data scope enforced and covered by positive and negative tests.

Audit log written for every state or money change.

Mobile / web screens match DESIGN.md tokens with empty, loading, error and offline states.

Analytics events fired; acceptance criteria in this document verified by QA.

— End of M06 —

## Table 1

| Field | Detail |
| Document | Dev Spec M06: Cart & Ordering (Buy Side) v1.0 |
| Source | Agribid Shudh PRD v1.0 and Stitch design set |
| Date | 26 September 2026 |
| Target sprint | S4 |
| Depends on | M04 Catalog, M05 Pricing, M10 Inventory, M11 Credit check, M13 Notifications |
| Read with | Dev Spec 00 · Architecture & Common Standards |
| Status | Draft for engineering review |

## Table 2

| Aspect | Detail |
| Clients | Partner Mobile App |
| Depends on | M04 Catalog · M05 Pricing · M10 Inventory · M11 Credit check · M13 Notifications |
| Used by | M07 Fulfilment · M14 Reports |
| Data stores | PostgreSQL: carts, orders, order_lines · Redis: idempotency keys |
| External services | Payment gateway - online |

## Table 3

| Layer | Rule relevant to this module |
| Entry | All client and webhook traffic enters through CloudFront + WAF → ALB (HTTPS 443). |
| Compute | M06 APIs run in private ECS API tasks; its async jobs run in worker tasks. No public IPs. |
| Data | PostgreSQL and Redis sit in private data subnets reachable only from app security groups; S3 via VPC endpoint with pre-signed URLs. |
| Egress | Calls to Payment gateway - online leave through the NAT Gateway via the M17 adapter layer. |
| Secrets | Keys and credentials come from Secrets Manager; never in code or env files in the repo. |

## Table 4

| Item | Detail |
| Purpose | Buyer builds a cart from the parent's catalog, reviews, picks payment, places an order; order list and detail for buyers; reorder; order-on-behalf entry point. |
| PRD refs | BR-02, BR-06/07, BR-12, BR-15, 9.4 ORD-01..10, 9.6 OBO-01..04 |
| Screens | Catalog + cart bar ✓, Review Order ✓, Order Success ✓, Order list ✓, Buyer order detail ✓, Create Order for Retailer ✓ (on behalf) |
| Roles | Buyers (SS, DS, SD, RT); sellers for on-behalf |
| Depends on | M04, M05, M10 (stock status), M11 (credit check), M13 |

## Table 5

| Column | Type | Constraints | Notes |
| cart.id | uuid | PK |  |
| buyer_id / seller_id | uuid | UNIQUE pair | seller = buyer's parent |
| acting_user_id | uuid | NULL | set when a seller builds it on behalf |
| cart_items.sku_id / qty | uuid / numeric | qty > 0 |  |
| last_priced_at | timestamptz |  | for PR-01 |

## Table 6

| Column | Type | Constraints | Notes |
| id | uuid | PK |  |
| order_no | varchar(20) | UNIQUE | ORD-2609-000123 |
| buyer_id / seller_id | uuid | FK partners | seller must be buyer's parent at placement |
| source | enum | SELF \| ASSISTED \| ADMIN |  |
| placed_by_user_id | uuid |  |  |
| status | enum | see M07 state model |  |
| hold_reason | varchar | NULL | dispute on assisted order |
| payment_mode | enum | POD \| CREDIT \| ONLINE |  |
| payment_status | enum | UNPAID \| PARTIAL \| PAID \| REFUNDED |  |
| subtotal, discount_total, taxable_total, cgst, sgst, igst, delivery_charge, round_off, grand_total | numeric(14,2) |  | snapshot at placement; recomputed on partial accept |
| delivery_address | jsonb |  | snapshot |
| expected_delivery_date | date |  | seller lead time config |
| notes / special_instructions | text |  | e.g. "Delivery at Gate 4" |
| placed_at, accepted_at, packed_at, dispatched_at, delivered_at, closed_at, cancelled_at | timestamptz |  | SLA & reporting |
| sla_due_at | timestamptz |  | placed_at + SLA working hours |
| idempotency_key | uuid | UNIQUE(buyer_id, key) |  |

## Table 7

| Column | Type | Constraints | Notes |
| id | uuid | PK |  |
| order_id / sku_id | uuid | FK |  |
| sku_snapshot | jsonb |  | name, pack, hsn, gst_rate at order time |
| qty_ordered / qty_accepted / qty_delivered / qty_returned | numeric(14,3) |  |  |
| unit_price | numeric(14,2) |  | ex-GST |
| discount_amount / scheme_id / free_qty |  |  |  |
| taxable_value, tax_rate, cgst, sgst, igst, line_total | numeric |  |  |

## Table 8

| Method | Endpoint | Permission | Description |
| GET / PUT | /cart?sellerId= | order.place | Get / replace cart lines (server validates pack multiples). |
| POST | /pricing/quote | order.place | (M05) price the cart for Review Order. |
| POST | /orders | order.place | Place order. Body {sellerId?, lines[], paymentMode, addressId, notes, quoteHash}. Idempotency-Key required. |
| POST | /orders/on-behalf | order.on_behalf | Seller places for mapped child {buyerId, …}; source = ASSISTED; creditOverrideReason optional. |
| GET | /orders/purchases | order.view_own | My purchase orders; filters status, paymentStatus (All / Pending / Paid / Partial), q, date. |
| GET | /orders/:id | scope buyer / seller | Detail with lines, timeline, invoice, shipment, payments. |
| POST | /orders/:id/cancel | order.place | Buyer cancel (NEW only; ACCEPTED → cancel request). |
| POST | /orders/:id/confirm \| /dispute | order.place | Child confirms / disputes an ASSISTED order within 24 h. |
| POST | /orders/:id/reorder | order.place | Copy lines to cart at current prices; returns changed-price flags. |

## Table 9

| Code | Rule / validation | HTTP · error code |
| OR-01 | Seller must be buyer's current parent (BR-02); SS buys only from MF. | 422 · INVALID_SELLER |
| OR-02 | Each qty ≥ MOQ and a multiple of pack_multiple for buyer tier (BR-15). | 400 · INVALID_PACK_MULTIPLE / BELOW_MOQ |
| OR-03 | Order value ≥ MOV for buyer tier. | 422 · BELOW_MOV |
| OR-04 | CREDIT: grand_total ≤ available credit and no invoice overdue beyond grace (BR-06/07). Checked under row lock. | 422 · CREDIT_LIMIT_EXCEEDED / CREDIT_HOLD |
| OR-05 | Any line OUT of stock at the seller → blocked; LOW allowed (seller may partially accept). | 422 · OUT_OF_STOCK |
| OR-06 | quoteHash must match the current price; otherwise return the new quote. | 409 · PRICE_CHANGED |
| OR-07 | Same Idempotency-Key within 24 h returns the original order (no duplicate). | 200 original |
| OR-08 | ONLINE: order created as PAYMENT_PENDING and moves to NEW only after payment.captured; auto-cancelled after 30 min. | n/a |
| OR-09 | On-behalf credit override needs a reason ≥ 10 chars and permission order.credit_override. | 403 / 400 |

## Table 10

| Event / job | Trigger | Consumers / action |
| order.placed | Order NEW | Notify seller (push + SMS), start SLA timer, analytics |
| order.assisted_created | On-behalf order | SMS / push to child with Confirm / Dispute links; 24 h auto-confirm job |
| order.cancelled | Buyer / system cancel | Release reservation if any, refund if prepaid, notify |
| job: payment_pending.expire | Every 5 min | Cancel ONLINE orders pending > 30 min |

## Table 11

| Item | Detail |
| Target sprint | S4 |
| Indicative effort (person-days) | Backend 9 · Mobile 10 · Admin web 2 · QA 5 · Total 26 |

## Table 12

| Discipline | Tasks |
| Backend | 1. Cart APIs (server cart per buyer-seller pair)
2. POST /orders with idempotency & validations
3. Credit check under row lock
4. On-behalf order + 24 h confirm / dispute job
5. Purchase list & detail, reorder, cancel |
| Mobile (Flutter) | 1. Cart bar, Review Order, payment method selection
2. Order Success screen
3. Order list with filters, buyer order detail & timeline
4. Create Order for Retailer ("Acting on Behalf")
5. Offline cart outbox |
| Admin web | 1. Admin order search (read) |
| QA focus | 1. MOV / MOQ / pack multiples
2. Double-submit idempotency
3. Credit hold path
4. Assisted order dispute |
