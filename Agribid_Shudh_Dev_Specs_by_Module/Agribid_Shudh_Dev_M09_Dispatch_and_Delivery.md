AGRIBID SHUDH · DEVELOPMENT SPEC M09

Dispatch & Delivery

Module development specification

Contents

0. Module Context & Architecture	3

0.1 Module context diagram	3

0.2 Where this module sits in the system	4

0.3 Network & deployment diagram	4

0.4 Request authorisation (applies to every API in this module)	5

0.5 Conventions summary	5

M09. Dispatch & Delivery	6

M09.1 Overview	6

M09.2 Flow	6

M09.3 Data model	6

M09.4 APIs	7

M09.5 Validations	8

M09.6 Acceptance criteria	8

M09.8 Build Checklist & Estimate	8

M09.9 Definition of Done	9

0. Module Context & Architecture

This document is the development specification for M09 · Dispatch & Delivery of the Agribid Shudh multi-tier distribution app (Agribid → State Stockist → Distributor → Sub-Distributor → Retailer, plus Admin). It is derived from PRD v1.0 and is one of 18 documents; shared standards are detailed in Dev Spec 00 · Architecture & Common Standards.

0.1 Module context diagram

Figure 1: M09 context: clients, dependencies, consumers, data stores and external services

0.2 Where this module sits in the system

All modules run inside one NestJS backend (modular monolith) with background workers. M09 is a code module with its own folder, its own tables, and a public service interface. Other modules call it only through that interface, never by querying its tables directly.

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

M09. Dispatch & Delivery

M09.1 Overview

M09.2 Flow

Figure 5: Assignment, dispatch and proof of delivery (from PRD)

M09.3 Data model

Table: delivery_partners

Table: shipments

Table: delivery_pod  ·  per order

M09.4 APIs

M09.5 Validations

M09.6 Acceptance criteria

Given a 450 kg order and a bike with 100 kg capacity, when the seller selects the bike, then the partner is disabled with "Capacity exceeded".

Given a dispatched order, when the driver enters the buyer's correct OTP, then the order becomes DELIVERED and the buyer's stock increases by the delivered quantities.

Given a POD order, when delivery is completed, then the app opens Record Cash Payment pre-filled with the order total.

M09.8 Build Checklist & Estimate

Estimates are indicative and must be re-estimated by the squad in sprint planning.

M09.9 Definition of Done

Code reviewed and merged; unit and integration tests pass (≥ 80% coverage on business services).

Endpoints documented in OpenAPI; error codes added to the i18n catalogue (en, hi, mr).

Permission code and data scope enforced and covered by positive and negative tests.

Audit log written for every state or money change.

Mobile / web screens match DESIGN.md tokens with empty, loading, error and offline states.

Analytics events fired; acceptance criteria in this document verified by QA.

— End of M09 —

## Table 1

| Field | Detail |
| Document | Dev Spec M09: Dispatch & Delivery v1.0 |
| Source | Agribid Shudh PRD v1.0 and Stitch design set |
| Date | 26 September 2026 |
| Target sprint | S6 |
| Depends on | M07 Fulfilment, M08 Invoicing, M10 Inventory, M11 POD payment, M13 Notifications |
| Read with | Dev Spec 00 · Architecture & Common Standards |
| Status | Draft for engineering review |

## Table 2

| Aspect | Detail |
| Clients | Partner Mobile App - sellers · Delivery Web View · Buyer tracking link |
| Depends on | M07 Fulfilment · M08 Invoicing · M10 Inventory · M11 POD payment · M13 Notifications |
| Used by | M14 Reports |
| Data stores | PostgreSQL: delivery_partners, shipments, delivery_pod · S3: POD photos |
| External services | Google Maps · SMS gateway |

## Table 3

| Layer | Rule relevant to this module |
| Entry | All client and webhook traffic enters through CloudFront + WAF → ALB (HTTPS 443). |
| Compute | M09 APIs run in private ECS API tasks; its async jobs run in worker tasks. No public IPs. |
| Data | PostgreSQL and Redis sit in private data subnets reachable only from app security groups; S3 via VPC endpoint with pre-signed URLs. |
| Egress | Calls to Google Maps, SMS gateway leave through the NAT Gateway via the M17 adapter layer. |
| Secrets | Keys and credentials come from Secrets Manager; never in code or env files in the repo. |

## Table 4

| Item | Detail |
| Purpose | Seller manages delivery partners and vehicles, assigns orders by capacity, dispatches, tracks and captures proof of delivery; driver web view. |
| PRD refs | 9.7 DLV-01..07, 10.7 |
| Screens | Assign Delivery Partner ✓, Confirm Assignment (detailed) ✓, Live Tracking ✓, Complete Delivery ✓, Delivery partners settings*, Driver web view* |
| Depends on | M07, M08 (e-way bill), M10 (stock deduct), M11 (POD payment), M13 |

## Table 5

| Column | Type | Constraints | Notes |
| id | uuid | PK |  |
| seller_id | uuid | FK partners | owner |
| name / mobile |  |  | mobile used for OTP / link |
| vehicle_type | enum |  | BIKE, CARGO_BIKE, MINI_TRUCK, PICKUP, TRUCK, THIRD_PARTY |
| vehicle_no | varchar(12) |  | UP-14-BT-5678 format validation |
| capacity_kg | numeric |  |  |
| status | enum | AVAILABLE \| ON_DELIVERY \| OFF |  |
| rating / trips_count |  |  | computed |
| last_location / last_seen_at |  |  | P2 GPS |

## Table 6

| Column | Type | Constraints | Notes |
| id | uuid | PK |  |
| order_ids | uuid[] |  | one trip may carry several orders |
| delivery_partner_id | uuid | NULL if self-pickup / transporter |  |
| transporter_name / lr_no |  | NULL | third party |
| load_kg | numeric |  | sum of order weights |
| pickup_location / eta |  |  |  |
| status | enum | ASSIGNED \| DISPATCHED \| IN_TRANSIT \| COMPLETED |  |
| tracking_token | varchar(32) | UNIQUE | public tracking / driver link |

## Table 7

| Column | Type | Constraints | Notes |
| order_id | uuid | PK |  |
| method | enum | OTP \| PHOTO_SIGN |  |
| otp_verified_at | timestamptz |  |  |
| photo_key / signature_key | text |  | S3 |
| receiver_name | varchar |  |  |
| geo / at |  |  |  |
| line_quantities | jsonb |  | delivered vs accepted, reasons for short |

## Table 8

| Method | Endpoint | Permission | Description |
| CRUD | /delivery-partners | delivery.manage | Seller's partners and vehicles. |
| GET | /orders/:id/delivery-options?type=&sort=distance | delivery.assign | Partners with status, remaining capacity %, distance, ETA. |
| POST | /shipments | delivery.assign | Body {orderIds[], deliveryPartnerId \| transporter, instructions}; validates capacity. |
| POST | /shipments/:id/dispatch | delivery.assign | Confirm & Dispatch → orders DISPATCHED, stock deducted, e-way bill, tracking SMS. |
| PATCH | /shipments/:id/partner | delivery.assign | Change partner before dispatch. |
| GET | /track/:token | public (token) | Buyer / driver web view: timeline, driver, vehicle, ETA. |
| POST | /deliveries/:orderId/start | driver token / seller | OUT_FOR_DELIVERY; sends delivery OTP to buyer. |
| POST | /deliveries/:orderId/complete | driver token / seller | Body {method, otp \| photo+signature, lines[], payment?} → DELIVERED. |
| POST | /deliveries/:orderId/fail | driver token / seller | Body {reasonCode} → RETURNED or re-attempt. |
| POST | /shipments/:id/location | driver token (P2) | GPS ping every 60 s while in transit. |

## Table 9

| Code | Rule / validation | HTTP · error code |
| DL-01 | sum(order net weight) ≤ partner remaining capacity; "Full Load" partners cannot be selected. | 422 · CAPACITY_EXCEEDED |
| DL-02 | Only PACKED orders with issued invoice can be dispatched; e-way bill present if IN-04 applies. | 409 / 422 |
| DL-03 | Delivery OTP: 4 digits, sent to buyer on start, 3 attempts, valid until delivered; seller can switch to photo POD with reason. | 401 · OTP_INVALID |
| DL-04 | Delivered qty ≤ dispatched qty; shortfall requires a reason and becomes a return to seller stock. | 400 |
| DL-05 | Tracking token links expire 7 days after delivery. | 410 · LINK_EXPIRED |

## Table 10

| Item | Detail |
| Target sprint | S6 |
| Indicative effort (person-days) | Backend 8 · Mobile 10 · Admin web 2 · QA 5 · Total 25 |

## Table 11

| Discipline | Tasks |
| Backend | 1. delivery_partners, shipments, delivery_pod schema
2. Delivery options with capacity & distance
3. Dispatch (stock deduct, e-way bill, tracking SMS)
4. Start / complete / fail delivery with OTP
5. Public tracking token API |
| Mobile (Flutter) | 1. Assign Delivery Partner list with filters
2. Confirm Assignment (detailed)
3. Live Tracking timeline
4. Complete Delivery (OTP / photo + signature)
5. Delivery partner settings
6. Driver web view (PWA) |
| Admin web | None |
| QA focus | 1. Capacity validation
2. POD OTP attempts
3. Partial delivery → return to stock |
