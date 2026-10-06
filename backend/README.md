# Electronics & Tech Gadgets E-Commerce — Backend API

> Production-grade, secure, modular monolith RESTful backend for a modern Electronics and Tech Gadgets E-Commerce store built with **NestJS**, **TypeScript**, **PostgreSQL**, and **Prisma ORM**.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [System Architecture](#system-architecture)
4. [Folder Structure](#folder-structure)
5. [Prerequisites & Environment Variables](#prerequisites--environment-variables)
6. [Getting Started & Local Setup](#getting-started--local-setup)
7. [Database Architecture & Schema](#database-architecture--schema)
8. [Seed Data & Initial Credentials](#seed-data--initial-credentials)
9. [API Documentation & Swagger](#api-documentation--swagger)
10. [Core Business Logic & Security Architecture](#core-business-logic--security-architecture)
    - [Order Engine & Server-Side Pricing](#1-order-engine--server-side-pricing)
    - [Order Lifecycle State Machine](#2-order-lifecycle-state-machine)
    - [Inventory & Stock Audit Trails](#3-inventory--stock-audit-trails)
    - [WhatsApp Business Ordering](#4-whatsapp-business-ordering)
    - [PayHere Sandbox Integration & MD5 Verification](#5-payhere-sandbox-integration--md5-verification)
    - [Administrative Audit Logging](#6-administrative-audit-logging)
11. [Security Baseline](#security-baseline)
12. [Testing Strategy](#testing-strategy)
13. [Docker & Containerized Deployment](#docker--containerized-deployment)
14. [Design Decisions, Assumptions & Trade-offs](#design-decisions-assumptions--trade-offs)

---

## Project Overview

This backend powers a specialized electronics and gadgets e-commerce platform handling catalog browsing, full-text search, inventory control, guest checkouts, PayHere online payments, and direct WhatsApp ordering.

### Key Capabilities
- **Electronics Catalog**: Categories, Brands, hierarchical specifications (RAM, SSD, Display, Chipset, Battery), warranty details, and multi-image galleries with primary image promotion.
- **Search & Filters**: Case-insensitive text search, price ranges, brand/category slugs, in-stock filtering, and flexible sorting (`price-asc`, `price-desc`, `newest`, `name-asc`).
- **Atomic Order Engine**: Never trusts frontend prices; calculates line totals from database records, validates stock, deducts inventory, and tracks orders inside ACID transactions.
- **Order State Machine**: Strict lifecycle validation (`PENDING` → `CONFIRMED` → `PROCESSING` → `READY_TO_SHIP` → `SHIPPED` → `DELIVERED`); restocks inventory automatically on order cancellation.
- **Direct WhatsApp Ordering**: Creates the order record in the database and generates an immediate, business-formatted `wa.me` deep link with encoded customer and line item summaries.
- **PayHere Sandbox Integration**: Generates client checkout parameters with MD5 checksums, validates server-to-server IPN callbacks using HMAC/MD5 secrets, and prevents double-spending or replay attacks.
- **Administrative Control**: RBAC-protected management for categories, brands, products, inventory adjustments, orders, audit logs, and dashboard metrics.

---

## Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Runtime & Framework** | [NestJS](https://nestjs.com/) + [TypeScript](https://www.typescriptlang.org/) | Modular monolith, dependency injection, high maintainability |
| **Database** | [PostgreSQL](https://www.postgresql.org/) | ACID compliance, transactional integrity, relational safety |
| **ORM** | [Prisma](https://www.prisma.io/) | Type-safe queries, declarative migrations, schema modeling |
| **Authentication** | Passport + JWT | Stateless admin authentication with instant DB revocation check |
| **Password Hashing** | [Argon2](https://github.com/ranisalt/node-argon2) | Memory-hard, state-of-the-art password security |
| **Validation** | `class-validator` + `class-transformer` | Strict DTO validation, whitelisting, type coercion |
| **API Documentation** | Swagger / OpenAPI 3.0 | Interactive API documentation accessible at `/docs` |
| **Security & Headers** | [Helmet](https://helmetjs.github.io/) + NestJS Throttler | Security HTTP headers, CORS control, and rate limiting (100 req/min) |
| **Testing** | [Jest](https://jestjs.io/) | Unit & integration tests for critical business logic |
| **Containerization** | Docker + Docker Compose | Multi-stage production container build |

---

## System Architecture

```
                  ┌─────────────────────────────────────┐
                  │          Client Applications        │
                  │   (Next.js Web / Mobile Browser)    │
                  └──────────────────┬──────────────────┘
                                     │ HTTP / REST (/api/v1)
                                     ▼
        ┌─────────────────────────────────────────────────────────┐
        │                 NestJS Application Layer                │
        │                                                         │
        │   [Helmet] ──► [CORS] ──► [ThrottlerGuard Rate Limiter] │
        │                          │                              │
        │                          ▼                              │
        │             [ValidationPipe (Whitelisted)]              │
        │                          │                              │
        │                          ▼                              │
        │             [HttpExceptionFilter (Uniform Errors)]      │
        │                          │                              │
        │                          ▼                              │
        │             [TransformInterceptor (Response Envelope)]  │
        └──────────────────────────┬──────────────────────────────┘
                                   │
       ┌───────────────────────────┴───────────────────────────┐
       ▼                                                       ▼
┌──────────────┐                                        ┌──────────────┐
│ Public APIs  │                                        │  Admin APIs  │
├──────────────┤                                        ├──────────────┤
│ Products     │                                        │ Admins       │
│ Categories   │                                        │ Categories   │
│ Brands       │                                        │ Brands       │
│ Orders       │                                        │ Products     │
│ Payments     │                                        │ Inventory    │
│ WhatsApp     │                                        │ Orders       │
└──────┬───────┘                                        │ Audit Logs   │
       │                                                │ Dashboard    │
       │                                                └──────┬───────┘
       │                                                       │
       └───────────────────────────┬───────────────────────────┘
                                   │
                                   ▼
                   ┌───────────────────────────────┐
                   │    Prisma ORM & Transaction   │
                   └───────────────┬───────────────┘
                                   ▼
                   ┌───────────────────────────────┐
                   │     PostgreSQL Database       │
                   └───────────────────────────────┘
```

---

## Folder Structure

```
backend/
├── prisma/
│   ├── schema.prisma             # Complete database schema & enum definitions
│   ├── migrations/               # Declarative migration history
│   └── seed.ts                   # Realistic seed script (Admins, Categories, Brands, Products)
├── src/
│   ├── common/
│   │   ├── decorators/           # @CurrentUser(), @Roles()
│   │   ├── dto/                  # PaginationQueryDto, common structures
│   │   ├── filters/              # HttpExceptionFilter (uniform error envelope)
│   │   ├── guards/               # JwtAuthGuard, RolesGuard
│   │   ├── interceptors/         # TransformInterceptor (success envelope)
│   │   └── utils/                # slug.util.ts
│   ├── config/
│   │   ├── config.interface.ts   # Strongly typed configuration interface
│   │   └── configuration.ts      # Validated environment loader
│   ├── database/
│   │   ├── prisma.module.ts      # Global Prisma module
│   │   └── prisma.service.ts     # Prisma Client lifecycle management
│   ├── modules/
│   │   ├── admins/               # Admin user management & RBAC
│   │   ├── audit/                # Phase 18: Audit logging & compliance queries
│   │   ├── auth/                 # Admin authentication, Argon2, JWT issuance
│   │   ├── brands/               # Electronics brand catalog & admin CRUD
│   │   ├── categories/           # Product category catalog & admin CRUD
│   │   ├── customers/            # Customer profile & address find-or-create logic
│   │   ├── dashboard/            # Store analytics, inventory overview & revenue
│   │   ├── inventory/            # Stock adjustments, transactions & negative stock guard
│   │   ├── orders/               # Order engine, pricing calculation, state machine
│   │   ├── payments/             # PayHere Sandbox initiation & MD5 IPN verification
│   │   ├── products/             # Product catalog, images, search & filtering
│   │   └── whatsapp/             # WhatsApp order message generation & wa.me deep links
│   ├── app.module.ts             # Central root module wiring all features
│   └── main.ts                   # Application bootstrap, Swagger, Helmet & global pipes
├── test/                         # E2E & integration test configuration
├── Dockerfile                    # Production multi-stage Docker build
├── .dockerignore                 # Excluded build artifacts
└── package.json                  # Scripts & dependencies
```

---

## Prerequisites & Environment Variables

### Prerequisites
- **Node.js**: v18 or v20 LTS
- **PostgreSQL**: v14, v15, or v16
- **npm**: v9 or v10

### Environment Configuration
Copy the template file:
```bash
cp .env.example .env
```

| Variable | Description | Default / Example |
|---|---|---|
| `NODE_ENV` | Application environment | `development` / `production` |
| `PORT` | HTTP port | `5000` |
| `API_PREFIX` | Base REST prefix | `api/v1` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/ecommerce?schema=public` |
| `JWT_SECRET` | Secret key for signing admin JWTs | Min 32 characters random string |
| `JWT_EXPIRES_IN` | Token expiration duration | `1d` |
| `FRONTEND_URL` | Allowed origin for CORS | `http://localhost:3000` |
| `PAYHERE_MERCHANT_ID` | PayHere Sandbox merchant ID | `1211111` |
| `PAYHERE_MERCHANT_SECRET` | PayHere Sandbox merchant secret | MD5 secret string |
| `PAYHERE_CURRENCY` | Transaction currency | `LKR` |
| `PAYHERE_BASE_URL` | PayHere checkout redirect URL | `https://sandbox.payhere.lk/pay/checkout` |
| `WHATSAPP_BUSINESS_NUMBER`| Destination WhatsApp number | `94771234567` (without `+` or leading `0`) |

---

## Getting Started & Local Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Database Migrations
```bash
npx prisma migrate dev --name init
```

### 3. Seed Realistic Electronics Data
```bash
npm run seed
```

### 4. Start Development Server
```bash
npm run start:dev
```
The API will be running at `http://localhost:5000/api/v1`
Interactive Swagger documentation will be available at `http://localhost:5000/docs`

---

## Database Architecture & Schema

The PostgreSQL schema is modeled via Prisma (`prisma/schema.prisma`):

- **AdminUser**: Stores administrator credentials (hashed with Argon2), assigned role (`SUPER_ADMIN`, `ADMIN`), status (`isActive`), and tracks `lastLoginAt`.
- **Category**: Product categories with unique URL slugs and active status flags.
- **Brand**: Electronics manufacturers with unique URL slugs and logo URLs.
- **Product**: Core catalog entity containing SKU, selling price (`Decimal`), compareAtPrice, warranty, stock quantity, active flag, and JSON specifications (`RAM`, `Storage`, `Chipset`, `Display`, `Battery`).
- **ProductImage**: One-to-many relationship supporting image gallery, display ordering, and primary thumbnail indicator.
- **Customer**: Customer profile identified uniquely by email, tracking lifetime order count and total spend.
- **Address**: Reusable shipping/billing address attached to customers.
- **Order**: Master order header with sequential `orderNumber` (`TECH-YYYY-NNNNNN`), subtotal, delivery fee, total, order status, payment status, and snapshot delivery address.
- **OrderItem**: Immutable order line items storing snapshot product names, SKUs, and unit prices at purchase time to safeguard historical data.
- **InventoryTransaction**: Complete stock ledger recording movements (`STOCK_IN`, `SALE`, `RESTOCK`, `ADJUSTMENT`, `CANCELLATION`) with previous and new stock quantities.
- **Payment**: Tracks payment records, provider details, and status.
- **PaymentEvent**: Immutable event log recording all incoming payment webhook payloads and status changes.
- **AuditLog**: Comprehensive log of administrative actions with previous/new value JSON diffs and sanitized payloads.

---

## Seed Data & Initial Credentials

Running `npm run seed` provisions the database with realistic tech store inventory:

### Super Admin Credentials
- **Email**: `admin@techgadgets.com`
- **Password**: `AdminPassword123!`
- **Role**: `SUPER_ADMIN`

### Pre-seeded Categories & Brands
- **Categories**: Smartphones, Laptops & Computers, Tablets, Audio Devices, Smart Devices, Accessories.
- **Brands**: Apple, Samsung, Sony, Asus, Dell, Anker.
- **Products**: iPhone 15 Pro Max, Samsung Galaxy S24 Ultra, MacBook Pro 16" M3 Max, Asus ROG Zephyrus G16, Sony WH-1000XM5, iPad Pro 13" M4, Apple Watch Ultra 2, Anker 737 Power Bank, and more, complete with technical specifications and stock levels.

---

## API Documentation & Swagger

Access the interactive Swagger UI at:
**`http://localhost:5000/docs`**

All endpoints return a uniform JSON envelope:
```json
{
  "statusCode": 200,
  "success": true,
  "data": { ... },
  "timestamp": "2026-10-06T08:00:00.000Z"
}
```

Standard error responses follow this structure:
```json
{
  "statusCode": 400,
  "success": false,
  "message": "Insufficient stock for \"MacBook Pro 16\". Available: 1, Requested: 2",
  "error": "Bad Request",
  "timestamp": "2026-10-06T08:00:00.000Z",
  "path": "/api/v1/orders"
}
```

---

## Core Business Logic & Security Architecture

### 1. Order Engine & Server-Side Pricing
- **Zero Frontend Trust**: Frontend-submitted prices or totals are strictly ignored. Line totals are computed on the server by querying the active database product price multiplied by the requested quantity.
- **Inventory Locking**: Before order creation, the system queries each product, verifies that `isActive: true`, and ensures `stockQuantity >= requestedQuantity`.
- **Atomic Operations**: Order insertion, OrderItem snapshots, stock deduction, and `InventoryTransaction` creation execute inside a single `prisma.$transaction`. Any stock conflict instantly rolls back the entire transaction.

### 2. Order Lifecycle State Machine
Orders transition strictly through authorized states:
```
PENDING ──► CONFIRMED ──► PROCESSING ──► READY_TO_SHIP ──► SHIPPED ──► DELIVERED
   │             │             │              │
   └─────────────┴─────────────┴──────────────┴──────► CANCELLED
```
- Orders in `DELIVERED` or `CANCELLED` status are in terminal states and cannot be modified.
- **Automatic Stock Restoration**: When an order transitions to `CANCELLED`, the system automatically increments the `stockQuantity` for each line item and records an `InventoryTransaction` of type `CANCELLATION`.

### 3. Inventory & Stock Audit Trails
- Stock is never mutated via generic product updates.
- Dedicated endpoint `POST /api/v1/admin/inventory/adjust` performs atomic adjustments with quantity deltas.
- **Negative Stock Guard**: If an adjustment delta would reduce `stockQuantity < 0`, the transaction is rejected with `BadRequestException`.
- Low-stock threshold queries identify items requiring restock (`stockQuantity <= 5`).

### 4. WhatsApp Business Ordering
- Public endpoint: `POST /api/v1/orders/whatsapp`
- Validates line items and creates an order record (`paymentMethod: WHATSAPP`, `paymentStatus: PENDING`).
- Generates a human-friendly, formatted WhatsApp order message with bulleted items, prices, delivery address, and notes.
- Produces a direct `https://wa.me/{businessNumber}?text={encodedMessage}` link for instant client redirect.

### 5. PayHere Sandbox Integration & MD5 Verification
- Public endpoint: `POST /api/v1/payments/payhere/initiate`
- Calculates the client checkout parameters and generates the 32-character uppercase MD5 checksum:
  `MD5(merchant_id + order_id + amount + currency + MD5(merchant_secret).toUpperCase()).toUpperCase()`
- **Server-to-Server IPN Callback**: `POST /api/v1/payments/payhere/notify`
  - Validates the incoming notification MD5 signature against the configured `PAYHERE_MERCHANT_SECRET`.
  - Rejects tampered payloads (`SIGNATURE_INVALID` event).
  - Processes status `2` (SUCCESS) by marking the payment and order as `PAID` / `CONFIRMED` inside an atomic transaction.
  - The client redirect URL is never treated as authoritative proof of payment; only the signed server-to-server callback updates the database.

### 6. Administrative Audit Logging
- Phase 18 introduces comprehensive audit log tracking for all sensitive administrative actions:
  - Admin login
  - Product creation, update, and soft-deletion
  - Image modifications and primary photo swaps
  - Inventory stock adjustments
  - Order status updates and cancellations
- **Data Sanitization**: Passwords, hashes, JWT tokens, and merchant secrets are automatically redacted before logging to `AuditLog`.
- Filterable admin endpoint: `GET /api/v1/admin/audit-logs` (filtered by `action`, `entityType`, `adminId`, `startDate`, `endDate`).

---

## Security Baseline

1. **Password Security**: Argon2id password hashing prevents GPU-based brute-force attacks.
2. **Session Revocation**: JWT Strategy queries `adminUser.isActive` on every authenticated request, terminating sessions immediately if an account is disabled.
3. **HTTP Security Headers**: [Helmet](https://helmetjs.github.io/) secures standard headers (HSTS, X-Content-Type-Options, Frameguard, etc.).
4. **Rate Limiting**: [NestJS Throttler](https://docs.nestjs.com/security/rate-limiting) protects against automated brute-force attacks (100 requests per 60 seconds per IP).
5. **Strict DTO Validation**: Whitelisting (`whitelist: true`) strips non-permitted fields; `forbidNonWhitelisted: true` rejects unexpected payloads.

---

## Testing Strategy

The repository includes automated unit and integration tests covering core business invariants:

```bash
# Run the test suite
npm test

# Run tests with coverage report
npm run test:cov
```

### Covered Business Invariants (26 Tests Passing):
1. **Order State Machine** (`order-status.transitions.spec.ts`):
   - Forward state transitions
   - Terminal state enforcement
   - Prohibiting backward transitions and cancellations of delivered items
2. **PayHere Cryptography** (`payhere-crypto.spec.ts`):
   - Secret hash calculation
   - 32-character uppercase MD5 checkout initiation signature
   - Server-side notification MD5 signature verification
   - Tampered amount and status code rejection
3. **WhatsApp Service** (`whatsapp.service.spec.ts`):
   - Deep link URL encoding and business phone routing
   - Itemized summary string generation
4. **Admin Authentication** (`auth.service.spec.ts`):
   - Argon2 password verification
   - Invalid password and unknown email rejection
   - Deactivated account rejection
   - JWT token payload construction
5. **Order Engine Invariants** (`orders.service.spec.ts`):
   - Server-side price calculation
   - Insufficient stock prevention
   - Stock deduction and atomic rollback

---

## Docker & Containerized Deployment

### Run Complete Stack with Docker Compose
A production-ready `docker-compose.yml` is provided at the repository root:

```bash
docker compose up --build -d
```

This starts:
1. `techgadgets_postgres`: PostgreSQL 16 container with persistent volume and health check.
2. `techgadgets_backend`: Production-built NestJS container running the multi-stage Alpine image on port `5000`.

To stop the services:
```bash
docker compose down
```

---

## Design Decisions, Assumptions & Trade-offs

1. **Modular Monolith over Microservices**: Selected to maximize development velocity, maintain strict transactional consistency across orders and inventory without distributed 2PC or Saga overhead, and keep the architecture easy to explain during technical interviews.
2. **Prisma ORM with PostgreSQL**: Provides compile-time type safety, automated migrations, and reliable ACID transactions for order placement and stock deduction.
3. **Server-Side Price Authority**: Clients only provide product IDs and desired quantities. The server calculates line item totals, subtotal, and total price to prevent price tampering.
4. **Soft Deletion for Products**: Products are deactivated (`isActive: false`) rather than hard-deleted to preserve historical order items and inventory audit records.
5. **PayHere Webhook Authority**: The frontend return URL is only used to present a friendly thank-you page to the customer. Order payment status is solely updated when the signed, verified server-to-server callback (`POST /api/v1/payments/payhere/notify`) is received.
