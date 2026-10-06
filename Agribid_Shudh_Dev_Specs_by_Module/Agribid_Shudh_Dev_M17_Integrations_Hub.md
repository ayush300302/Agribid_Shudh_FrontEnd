AGRIBID SHUDH · DEVELOPMENT SPEC M17

Integrations Hub

Module development specification

Contents

0. Module Context & Architecture	3

0.1 Module context diagram	3

0.2 Where this module sits in the system	4

0.3 Network & deployment diagram	4

0.4 Request authorisation (applies to every API in this module)	5

0.5 Conventions summary	5

M17. Integrations Hub	6

M17.1 Pattern	6

M17.8 Build Checklist & Estimate	6

M17.9 Definition of Done	7

0. Module Context & Architecture

This document is the development specification for M17 · Integrations Hub of the Agribid Shudh multi-tier distribution app (Agribid → State Stockist → Distributor → Sub-Distributor → Retailer, plus Admin). It is derived from PRD v1.0 and is one of 18 documents; shared standards are detailed in Dev Spec 00 · Architecture & Common Standards.

0.1 Module context diagram

Figure 1: M17 context: clients, dependencies, consumers, data stores and external services

0.2 Where this module sits in the system

All modules run inside one NestJS backend (modular monolith) with background workers. M17 is a code module with its own folder, its own tables, and a public service interface. Other modules call it only through that interface, never by querying its tables directly.

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

M17. Integrations Hub

M17.1 Pattern

Each external system sits behind an adapter interface in the integrations module (e.g. SmsProvider, PaymentGateway, GspProvider, KycVerifier). Business modules call the interface, never the vendor SDK. Calls are made from workers with retry, circuit breaker and a full request / response log (secrets masked) in integration_logs.

Table: integration_logs

M17.8 Build Checklist & Estimate

Estimates are indicative and must be re-estimated by the squad in sprint planning.

M17.9 Definition of Done

Code reviewed and merged; unit and integration tests pass (≥ 80% coverage on business services).

Endpoints documented in OpenAPI; error codes added to the i18n catalogue (en, hi, mr).

Permission code and data scope enforced and covered by positive and negative tests.

Audit log written for every state or money change.

Mobile / web screens match DESIGN.md tokens with empty, loading, error and offline states.

Analytics events fired; acceptance criteria in this document verified by QA.

— End of M17 —

## Table 1

| Field | Detail |
| Document | Dev Spec M17: Integrations Hub v1.0 |
| Source | Agribid Shudh PRD v1.0 and Stitch design set |
| Date | 26 September 2026 |
| Target sprint | S1 (SMS, FCM, S3, Maps) · Phase 2 (others) |
| Depends on | M16 Config & secrets |
| Read with | Dev Spec 00 · Architecture & Common Standards |
| Status | Draft for engineering review |

## Table 2

| Aspect | Detail |
| Clients | Worker processes |
| Depends on | M16 Config & secrets |
| Used by | M03 KYC · M08 GSP · M11 Payments · M13 Messaging |
| Data stores | PostgreSQL: integration_logs · Secrets Manager |
| External services | SMS · FCM · WhatsApp · Payment gateway · GSP IRN / e-Way · KYC verify · Maps · Tally / SAP |

## Table 3

| Layer | Rule relevant to this module |
| Entry | All client and webhook traffic enters through CloudFront + WAF → ALB (HTTPS 443). |
| Compute | M17 APIs run in private ECS API tasks; its async jobs run in worker tasks. No public IPs. |
| Data | PostgreSQL and Redis sit in private data subnets reachable only from app security groups; S3 via VPC endpoint with pre-signed URLs. |
| Egress | Calls to SMS · FCM · WhatsApp, Payment gateway, GSP IRN / e-Way, KYC verify · Maps, Tally / SAP leave through the NAT Gateway via the M17 adapter layer. |
| Secrets | Keys and credentials come from Secrets Manager; never in code or env files in the repo. |

## Table 4

| Adapter | Vendor options | Direction | Phase | Key notes |
| SmsProvider | MSG91, Gupshup, Kaleyra | Out + DLR webhook | 1 | DLT entity & template IDs; OTP route |
| PushProvider | Firebase FCM | Out | 1 | Topic per partner; data messages for deep links |
| MapsProvider | Google Maps Platform | Out | 1 | Geocode, distance matrix; restrict API key by app signature |
| StorageProvider | AWS S3 | Out | 1 | Pre-signed URLs; lifecycle rules |
| KycVerifier | Signzy, Karza, IDfy, Cashfree Verification | Out | 2 | GSTIN, PAN, bank penny-drop |
| PaymentGateway | Razorpay, Cashfree, PayU | Out + webhooks | 2 | UPI intent, payment links, settlement report |
| GspProvider | ClearTax, Masters India, IRIS | Out | 2 | IRN generate / cancel; e-way bill generate / update Part-B |
| WhatsAppProvider | Gupshup, Interakt, Meta Cloud API | Out + webhooks | 2 | Pre-approved templates |
| ErpConnector | Tally (XML / ODBC), SAP | Both | 2–3 | Nightly export of invoices, receipts, stock |

## Table 5

| Column | Type | Constraints | Notes |
| id | bigserial | PK | retained 90 days |
| adapter / operation |  |  |  |
| ref_type / ref_id |  |  |  |
| request / response | jsonb |  | masked |
| status / http_code / latency_ms / attempt |  |  |  |

## Table 6

| Item | Detail |
| Target sprint | S1 (SMS, FCM, S3, Maps) · Phase 2 (others) |
| Indicative effort (person-days) | Backend 10 · Mobile 1 · Admin web 1 · QA 3 · Total 15 |

## Table 7

| Discipline | Tasks |
| Backend | 1. Adapter interfaces & vendor implementations
2. Retry, circuit breaker, integration_logs
3. Webhook verification middleware
4. Sandbox / mock providers for dev & QA |
| Mobile (Flutter) | 1. Maps SDK key restriction |
| Admin web | 1. Integration health page |
| QA focus | 1. Vendor sandbox tests
2. Timeouts & retries |
