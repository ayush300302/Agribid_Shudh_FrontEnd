# Agribid Shudh

Frontend application for Agribid Shudh, built with Next.js. The backend is maintained separately.

## Related Repository

[agribid-shudh-backend](https://github.com/vivek-9941/agribid-shudh-backend)

Refer to the backend repository for API documentation and backend setup.

## Getting Started

### Prerequisites

- Node.js
- npm

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

Run `npm run` to see the scripts available in `package.json`.

## High-Level Design

```mermaid
flowchart LR
    User([User]) --> Browser["Web Browser"]

    subgraph Frontend["Agribid Shudh Frontend"]
        Browser --> App["Next.js Application"]
        App --> Routes["Routes and Pages"]
        Routes --> Features["Feature Modules"]
        Features --> UI["Shared UI Components"]
        Features --> Client["API Client"]
        Config["Environment Configuration"] --> Client
    end

    Client -->|"HTTPS API requests"| API["Backend APIs"]

    subgraph Backend["Agribid Shudh Backend"]
        API --> Logic["Backend Services and Business Logic"]
        Logic --> Data["Backend Data Storage"]
    end

    API -->|"Responses"| Client
    Client --> Features
```

The diagram shows the proposed frontend-to-backend interaction at a high level. Backend internals and API contracts should be verified against the backend documentation.

## Frontend Modules

The following modules are included in the development specifications. Their presence here describes planned product scope, not necessarily completed functionality.

| ID | Module |
|---|---|
| M00 | Architecture and Common Standards |
| M01 | Authentication and Session |
| M02 | Users, Roles, and Permissions (RBAC) |
| M03 | Partner Hierarchy and KYC Onboarding |
| M04 | Product Catalog |
| M05 | Pricing and Schemes |
| M06 | Cart and Ordering (Buy Side) |
| M07 | Order Fulfilment (Sell Side) |
| M08 | Invoicing and GST Compliance |
| M09 | Dispatch and Delivery |
| M10 | Inventory |
| M11 | Payments, Credit, and Ledger |
| M12 | Returns and Claims |
| M13 | Notifications |
| M14 | Dashboards and Reports |
| M15 | Admin Console |
| M16 | Audit, Configuration, and Support |
| M17 | Integrations Hub |

## Proposed Sprint Plan

This is an initial grouping based on module names. Confirm dependencies, sprint capacity, and acceptance criteria against the detailed specifications before scheduling.

| Sprint | Focus | Modules |
|---|---|---|
| 0 | Architecture and project foundations | M00 |
| 1 | Authentication and access control | M01, M02 |
| 2 | Partner onboarding | M03 |
| 3 | Catalog, pricing, and schemes | M04, M05 |
| 4 | Buyer ordering | M06 |
| 5 | Fulfilment, dispatch, and inventory | M07, M09, M10 |
| 6 | Invoicing and financial workflows | M08, M11 |
| 7 | Returns and notifications | M12, M13 |
| 8 | Reporting, administration, and integrations | M14, M15, M16, M17 |

## Configuration and Security

- Configure API URLs and other environment-specific settings outside the source code.
- Do not commit credentials, tokens, or secrets.
- Follow the backend documentation for authentication, API contracts, and required environment variables.
- Frontend validation improves usability; the backend must enforce authorization and business rules.