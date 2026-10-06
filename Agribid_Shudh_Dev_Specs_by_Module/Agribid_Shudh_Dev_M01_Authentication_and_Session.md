AGRIBID SHUDH · DEVELOPMENT SPEC M01

Authentication & Session

Module development specification

Contents

0. Module Context & Architecture	3

0.1 Module context diagram	3

0.2 Where this module sits in the system	3

0.3 Network & deployment diagram	4

0.4 Request authorisation (applies to every API in this module)	5

0.5 Conventions summary	5

M01. Authentication & Session	6

M01.1 Overview	6

M01.2 Flow	7

M01.3 Data model	8

M01.4 APIs	9

M01.5 Validations & rules	9

M01.6 Events & jobs	10

M01.7 Acceptance criteria	10

M01.8 Build Checklist & Estimate	10

M01.9 Definition of Done	10

0. Module Context & Architecture

This document is the development specification for M01 · Authentication & Session of the Agribid Shudh multi-tier distribution app (Agribid → State Stockist → Distributor → Sub-Distributor → Retailer, plus Admin). It is derived from PRD v1.0 and is one of 18 documents; shared standards are detailed in Dev Spec 00 · Architecture & Common Standards.

0.1 Module context diagram

Figure 1: M01 context: clients, dependencies, consumers, data stores and external services

0.2 Where this module sits in the system

All modules run inside one NestJS backend (modular monolith) with background workers. M01 is a code module with its own folder, its own tables, and a public service interface. Other modules call it only through that interface, never by querying its tables directly.

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

M01. Authentication & Session

M01.1 Overview

M01.2 Flow

Figure 5: App launch, authentication and role-based routing (from PRD)

Figure 6: OTP login sequence

M01.3 Data model

Table: users  ·  a person; one mobile number

Table: sessions  ·  one row per logged-in device

OTPs are not stored in PostgreSQL: Redis key otp:{requestId} → {mobileHash, otpHash, attempts} with TTL 300 s; counter otp_count:{mobile} TTL 1 h.

M01.4 APIs

M01.5 Validations & rules

M01.6 Events & jobs

M01.7 Acceptance criteria

Given a registered active distributor, when they enter a correct OTP, then they land on the Distributor home with the Distributor bottom nav.

Given a mobile linked to two partner accounts, when OTP is verified, then the Select Business screen lists both and the chosen one becomes active.

Given a retailer with PENDING_KYC, when they log in, then they see the KYC status screen and cannot place orders.

Given a user who entered 3 wrong OTPs, when they try again, then they must request a new OTP.

Given an app older than min version, when any API is called, then the app shows a blocking Update screen.

M01.8 Build Checklist & Estimate

Estimates are indicative and must be re-estimated by the squad in sprint planning.

M01.9 Definition of Done

Code reviewed and merged; unit and integration tests pass (≥ 80% coverage on business services).

Endpoints documented in OpenAPI; error codes added to the i18n catalogue (en, hi, mr).

Permission code and data scope enforced and covered by positive and negative tests.

Audit log written for every state or money change.

Mobile / web screens match DESIGN.md tokens with empty, loading, error and offline states.

Analytics events fired; acceptance criteria in this document verified by QA.

— End of M01 —

## Table 1

| Field | Detail |
| Document | Dev Spec M01: Authentication & Session v1.0 |
| Source | Agribid Shudh PRD v1.0 and Stitch design set |
| Date | 26 September 2026 |
| Target sprint | S0–S1 |
| Depends on | M02 RBAC, M03 Partner status, M13 Notifications |
| Read with | Dev Spec 00 · Architecture & Common Standards |
| Status | Draft for engineering review |

## Table 2

| Aspect | Detail |
| Clients | Partner Mobile App · Admin Web Console |
| Depends on | M02 RBAC · M03 Partner status · M13 Notifications |
| Used by | All modules - JWT & session |
| Data stores | PostgreSQL: users, sessions · Redis: OTP, rate limits |
| External services | SMS DLT gateway · Firebase FCM |

## Table 3

| Layer | Rule relevant to this module |
| Entry | All client and webhook traffic enters through CloudFront + WAF → ALB (HTTPS 443). |
| Compute | M01 APIs run in private ECS API tasks; its async jobs run in worker tasks. No public IPs. |
| Data | PostgreSQL and Redis sit in private data subnets reachable only from app security groups; S3 via VPC endpoint with pre-signed URLs. |
| Egress | Calls to SMS DLT gateway, Firebase FCM leave through the NAT Gateway via the M17 adapter layer. |
| Secrets | Keys and credentials come from Secrets Manager; never in code or env files in the repo. |

## Table 4

| Item | Detail |
| Purpose | Login for all partner roles and Admin; OTP / password; session and device management; role resolution. |
| PRD refs | Section 7, 7.1–7.3; ONB-01..03 |
| Screens | Splash, Onboarding ×3, Login, OTP entry*, Select business*, First-login setup*, Forgot password*, KYC pending*, Blocked* (* = design pending) |
| Roles | All |
| Depends on | M02 (roles), M03 (partner status), M13 (SMS) |

## Table 5

| Column | Type | Constraints | Notes |
| id | uuid | PK, default gen_random_uuid() |  |
| created_at / updated_at | timestamptz | NOT NULL | UTC; UI shows IST |
| mobile | varchar(10) | UNIQUE, NOT NULL | Indian mobile, validated ^[6-9]\d{9}$ |
| name | varchar(120) | NOT NULL |  |
| email | varchar(160) | NULL |  |
| password_hash | varchar(255) | NULL | argon2id; NULL until first-login setup |
| mpin_hash | varchar(255) | NULL | phase 2 |
| preferred_language | varchar(5) | default 'en' |  |
| failed_login_count | smallint | default 0 | lock after 5 |
| locked_until | timestamptz | NULL |  |
| last_login_at | timestamptz | NULL |  |

## Table 6

| Column | Type | Constraints | Notes |
| id | uuid | PK |  |
| user_id / partner_id | uuid | FK | active business chosen |
| device_id | varchar(100) | NOT NULL | app-generated install id |
| device_info | jsonb |  | model, OS, app version |
| fcm_token | text | NULL | for push |
| refresh_token_hash | varchar(255) | NOT NULL | rotated on every refresh |
| expires_at | timestamptz | NOT NULL | now + 30 days |
| revoked_at | timestamptz | NULL | logout / 3rd-device eviction |

## Table 7

| Method | Endpoint | Permission | Description |
| POST | /auth/otp/request | public | Send OTP. Body {mobile, purpose: LOGIN \| RESET}. Returns requestId, resendAfter. |
| POST | /auth/otp/verify | public | Verify OTP + deviceId. Returns tokens or accounts[] + tempToken if multiple businesses. |
| POST | /auth/login | public | Mobile / partnerCode + password + deviceId. |
| POST | /auth/select-account | tempToken | Choose partner account; issues tokens. |
| POST | /auth/refresh | refresh token | Rotate tokens. |
| POST | /auth/first-login | auth | Set password, language, accept T&C version. |
| POST | /auth/password/reset | OTP-verified | Reset password. |
| POST | /auth/logout | auth | Revoke current session (or ?all=true). |
| GET | /me | auth | User, active partner, role, permissions, RoleConfig (nav, tiles, flags), account status. |
| GET | /app/config | public | Min supported version, maintenance flag, supported languages, T&C version. |
| POST | /admin/auth/login | public | Admin email + password → requires 2FA step. |
| POST | /admin/auth/2fa/verify | temp | TOTP / email OTP verify; issues admin tokens (idle 30 min). |

## Table 8

| Code | Rule / validation | HTTP · error code |
| AU-01 | Max 5 OTP requests per mobile per hour; resend after 30 s. | 429 · OTP_LIMIT |
| AU-02 | OTP 6 digits, valid 5 min, max 3 attempts per requestId. | 401 · OTP_INVALID / OTP_EXPIRED |
| AU-03 | 5 wrong passwords → locked 15 min. | 403 · ACCOUNT_LOCKED |
| AU-04 | Mobile not registered → generic message (no user enumeration); OTP is not actually sent. | 200 (silent) |
| AU-05 | Partner status BLOCKED / INACTIVE → login refused with reason code. | 403 · ACCOUNT_BLOCKED |
| AU-06 | PENDING_KYC → login allowed, token scope limited to kyc.* and catalog.browse. | 200, scope=LIMITED |
| AU-07 | Max 2 active sessions per user; the 3rd login revokes the oldest and pushes a logout notice. | n/a |
| AU-08 | Password policy: min 8 chars, letters + digits, not equal to mobile. | 400 · WEAK_PASSWORD |
| AU-09 | App version below min → force update screen. | 426 · UPGRADE_REQUIRED |

## Table 9

| Event / job | Trigger | Consumers / action |
| user.logged_in | Successful login | Audit log; analytics login_success |
| session.evicted | 3rd device login | Push "logged out on other device" |
| job: session.cleanup | Daily 02:00 IST | Delete expired / revoked sessions older than 90 days |

## Table 10

| Item | Detail |
| Target sprint | S0–S1 |
| Indicative effort (person-days) | Backend 8 · Mobile 8 · Admin web 3 · QA 4 · Total 23 |

## Table 11

| Discipline | Tasks |
| Backend | 1. OTP request / verify with Redis TTL & rate limits
2. Password login, lockout, first-login setup
3. JWT (RS256) access + rotating refresh tokens
4. Session & device binding (max 2), logout, eviction push
5. GET /me with RoleConfig; /app/config force-update
6. Admin login with TOTP 2FA |
| Mobile (Flutter) | 1. Splash with master-data sync
2. Onboarding carousel ×3 with language picker
3. Login (password / OTP), OTP entry with resend timer
4. Select business, first-login setup, forgot password
5. KYC-pending, blocked and force-update screens
6. Role-based router & bottom nav from RoleConfig |
| Admin web | 1. Admin login + 2FA screens
2. Idle-timeout handling |
| QA focus | 1. OTP limits & expiry
2. Lockout & device eviction
3. Role routing for all 6 roles
4. Force-update path |
