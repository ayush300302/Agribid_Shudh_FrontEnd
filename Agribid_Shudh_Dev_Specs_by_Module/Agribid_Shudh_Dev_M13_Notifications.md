AGRIBID SHUDH · DEVELOPMENT SPEC M13

Notifications

Module development specification

Contents

0. Module Context & Architecture	3

0.1 Module context diagram	3

0.2 Where this module sits in the system	4

0.3 Network & deployment diagram	4

0.4 Request authorisation (applies to every API in this module)	5

0.5 Conventions summary	5

M13. Notifications	6

M13.1 Overview	6

M13.2 Flow	6

M13.3 Data model	6

M13.4 APIs	7

M13.5 Rules	7

M13.8 Build Checklist & Estimate	7

M13.9 Definition of Done	8

0. Module Context & Architecture

This document is the development specification for M13 · Notifications of the Agribid Shudh multi-tier distribution app (Agribid → State Stockist → Distributor → Sub-Distributor → Retailer, plus Admin). It is derived from PRD v1.0 and is one of 18 documents; shared standards are detailed in Dev Spec 00 · Architecture & Common Standards.

0.1 Module context diagram

Figure 1: M13 context: clients, dependencies, consumers, data stores and external services

0.2 Where this module sits in the system

All modules run inside one NestJS backend (modular monolith) with background workers. M13 is a code module with its own folder, its own tables, and a public service interface. Other modules call it only through that interface, never by querying its tables directly.

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

M13. Notifications

M13.1 Overview

M13.2 Flow

Figure 5: Event-driven notification pipeline

M13.3 Data model

Table: notification_templates

Table: notifications  ·  in-app inbox + delivery log

Table: notification_prefs

M13.4 APIs

M13.5 Rules

Quiet hours 21:00–08:00 IST for non-transactional messages; queued until 08:00.

Push first; SMS fallback for critical events (OTP, order placed for seller, dispatch, delivery OTP, payment receipt, credit hold).

Retry 3× with exponential backoff; after failure, mark FAILED and surface in Admin delivery report.

SMS content must match the DLT-registered template exactly (variables only in placeholders).

M13.8 Build Checklist & Estimate

Estimates are indicative and must be re-estimated by the squad in sprint planning.

M13.9 Definition of Done

Code reviewed and merged; unit and integration tests pass (≥ 80% coverage on business services).

Endpoints documented in OpenAPI; error codes added to the i18n catalogue (en, hi, mr).

Permission code and data scope enforced and covered by positive and negative tests.

Audit log written for every state or money change.

Mobile / web screens match DESIGN.md tokens with empty, loading, error and offline states.

Analytics events fired; acceptance criteria in this document verified by QA.

— End of M13 —

## Table 1

| Field | Detail |
| Document | Dev Spec M13: Notifications v1.0 |
| Source | Agribid Shudh PRD v1.0 and Stitch design set |
| Date | 26 September 2026 |
| Target sprint | S7 |
| Depends on | M16 Config & templates, M17 Integrations |
| Read with | Dev Spec 00 · Architecture & Common Standards |
| Status | Draft for engineering review |

## Table 2

| Aspect | Detail |
| Clients | Partner Mobile App · Admin Web Console |
| Depends on | M16 Config & templates · M17 Integrations |
| Used by | All modules via domain events |
| Data stores | PostgreSQL: notifications, templates, prefs · Redis: send queue |
| External services | Firebase FCM · SMS DLT gateway · WhatsApp BSP |

## Table 3

| Layer | Rule relevant to this module |
| Entry | All client and webhook traffic enters through CloudFront + WAF → ALB (HTTPS 443). |
| Compute | M13 APIs run in private ECS API tasks; its async jobs run in worker tasks. No public IPs. |
| Data | PostgreSQL and Redis sit in private data subnets reachable only from app security groups; S3 via VPC endpoint with pre-signed URLs. |
| Egress | Calls to Firebase FCM, SMS DLT gateway, WhatsApp BSP leave through the NAT Gateway via the M17 adapter layer. |
| Secrets | Keys and credentials come from Secrets Manager; never in code or env files in the repo. |

## Table 4

| Item | Detail |
| Purpose | One service that turns domain events into push, SMS, WhatsApp and in-app messages using templates, preferences, language and quiet hours. |
| PRD refs | Section 12 (notifications matrix) |
| Screens | Notification centre*, Notification settings ✓ (Profile), Admin template editor* |

## Table 5

| Column | Type | Constraints | Notes |
| code | varchar | PK | ORDER_PLACED_SELLER, ORDER_ACCEPTED_BUYER, DELIVERY_OTP, DUE_REMINDER… |
| channel | enum |  | PUSH, SMS, WHATSAPP, IN_APP |
| language | varchar(5) |  |  |
| body / title | text |  | Handlebars placeholders {{orderNo}} |
| dlt_template_id / wa_template_name |  |  | regulatory ids |
| transactional | boolean |  | quiet hours apply only to false |

## Table 6

| Column | Type | Constraints | Notes |
| id | uuid | PK |  |
| user_id / partner_id | uuid |  |  |
| template_code / channel |  |  |  |
| payload | jsonb |  | deep link target e.g. {screen: ORDER, id} |
| status | enum | QUEUED \| SENT \| DELIVERED \| FAILED \| READ |  |
| provider_message_id / error |  |  |  |
| read_at | timestamptz |  |  |

## Table 7

| Column | Type | Constraints | Notes |
| user_id + category |  |  | ORDERS, PAYMENTS, OFFERS, STOCK |
| push / sms / whatsapp | boolean |  | OTP & transactional SMS cannot be disabled |

## Table 8

| Method | Endpoint | Permission | Description |
| GET | /notifications?cursor= | auth | In-app list + unread count. |
| POST | /notifications/read | auth | Mark ids / all as read. |
| GET / PUT | /notifications/prefs | auth | Preferences. |
| POST | /devices/fcm-token | auth | Register / refresh FCM token. |
| CRUD | /admin/notification-templates | config.manage | Edit templates per language; preview; test send. |
| POST | /webhooks/sms-dlr, /webhooks/wa | HMAC / IP | Delivery receipts. |

## Table 9

| Item | Detail |
| Target sprint | S7 |
| Indicative effort (person-days) | Backend 6 · Mobile 4 · Admin web 3 · QA 3 · Total 16 |

## Table 10

| Discipline | Tasks |
| Backend | 1. Router: event → template → recipients
2. Channel adapters (FCM, SMS, WhatsApp)
3. Quiet hours & retries
4. Delivery receipts webhooks |
| Mobile (Flutter) | 1. Notification centre & deep links
2. Notification preferences
3. FCM token registration |
| Admin web | 1. Template editor with preview & test send |
| QA focus | 1. DLT template match
2. Quiet-hours queueing
3. Deep-link routing |
