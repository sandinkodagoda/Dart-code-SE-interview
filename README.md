# Electronics & Tech Gadgets E-Commerce Store — Full-Stack Platform

Enterprise-grade, full-stack E-Commerce platform for an **Electronics & Tech Gadgets Store** selling mobile phones, laptops, computers, tablets, audio gear, and tech accessories.

Built for the Software Engineer Technical Assessment across all **23 Phases** covering both the **Backend Engine** and the **Next.js Storefront & Admin Portal**.

---

## 1. System Architecture

```text
/
├── backend/                  # NestJS + TypeScript + PostgreSQL + Prisma ORM
│   ├── src/
│   │   ├── modules/          # Auth, Products, Categories, Brands, Orders, Payments, Inventory, Dashboard, Audit
│   │   ├── common/           # Guards, Interceptors, Filters, Swagger, Decorators
│   │   └── database/         # Prisma Service & Seed Data
│   └── prisma/               # Schema, Migrations, Seed script
│
├── frontend/                 # Next.js 16 (App Router) + TypeScript + TanStack Query + Zustand
│   ├── src/
│   │   ├── app/              # Customer Storefront & Admin Operations Portal
│   │   ├── components/       # Design System UI components & Layouts
│   │   ├── lib/              # Axios Client & Query Provider
│   │   ├── stores/           # Zustand Persistent Cart & Auth stores
│   │   └── types/            # TypeScript Domain Models & API Contracts
│   └── public/
│
├── docker-compose.yml        # Multi-container orchestration (PostgreSQL + NestJS)
└── README.md
```

---

## 2. Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Backend** | NestJS, TypeScript, PostgreSQL 16, Prisma ORM, JWT, Argon2, Helmet, CORS, Throttler, PayHere Sandbox, WhatsApp Ordering, Jest (26 Unit/Integration Tests) |
| **Frontend** | Next.js 16 (App Router, Turbopack), React 19, TypeScript, TanStack Query v5, Zustand, Axios, Lucide React, Custom CSS Design Tokens |
| **DevOps** | Docker, Docker Compose, Multi-stage Dockerfile |

---

## 3. Features & Completed Phases

### Customer Storefront (Phases 01 – 12)
- **Phase 01**: Next.js Project Foundation, strict typing, and environment structure.
- **Phase 02**: Tech design tokens (electric blue, slate, glassmorphism) & UI library (`Button`, `Badge`, `Price`, `Input`, `Select`, `Skeleton`, `EmptyState`).
- **Phase 03**: Axios HTTP client with unified error handling and TanStack Query caching.
- **Phase 04**: Storefront shell with top flash offer bar, live search, cart item counter, and responsive drawer.
- **Phase 05**: High-impact customer homepage with hero banner, category grid, featured products, M3 MacBook promotion, and new arrivals.
- **Phase 06**: Catalog discovery (`/shop`) with keyword search, category & brand filters, in-stock toggle, sorting, and pagination.
- **Phase 07**: Product details (`/product/[slug]`) with image gallery switcher, price with discount tag, stock indicators, quantity cap, specifications table, and WhatsApp inquiry.
- **Phase 08**: Persistent shopping cart (`/cart`) with `localStorage` sync, line item modifiers, and free delivery progress indicator (free over LKR 10,000, flat LKR 350 otherwise).
- **Phase 09**: Frictionless guest checkout (`/checkout`) with delivery address and server-authoritative pricing (frontend never calculates authoritative totals).
- **Phase 10**: WhatsApp direct checkout integration (`wa.me` deep link with encoded order summary and line items).
- **Phase 11**: PayHere Sandbox card checkout with auto-submitting signed HTML form.
- **Phase 12**: Dynamic order confirmation & tracking screen (`/order/[orderNumber]`) with 5-second polling for payment callbacks.

### Admin Operations Portal (Phases 13 – 18)
- **Phase 13**: Admin authentication (`/admin/login`) with JWT session management and demo credentials autofill helper.
- **Phase 14**: Analytics dashboard (`/admin/dashboard`) with revenue metrics, order pipeline (Pending $\to$ Delivered), catalog health, low-stock alert banner, and recent orders table.
- **Phase 15**: Product management (`/admin/products`) with data table, multi-criteria filters, create/edit modal, and soft-delete/deactivate toggle.
- **Phase 16**: Category & Brand management (`/admin/categories`, `/admin/brands`) with CRUD modals and delete safety protection.
- **Phase 17**: Inventory management (`/admin/inventory`) with live stock balances, low-stock threshold warning, atomic stock adjustment modal (`RESTOCK`, `STOCK_IN`, `ADJUSTMENT`), and historical audit ledger.
- **Phase 18**: Order fulfillment (`/admin/orders`) with status/payment filters, full order breakdown, and strict lifecycle state machine transitions (`PENDING` $\to$ `CONFIRMED` $\to$ `PROCESSING` $\to$ `READY_TO_SHIP` $\to$ `SHIPPED` $\to$ `DELIVERED`, or `CANCELLED` with automatic inventory restoration).

### Full-Stack Polish & Production Readiness (Phases 19 – 23)
- **Phase 19**: Edge cases handling (out of stock button disabling, negative stock prevention, invalid state transition rejection, token expiration handling).
- **Phase 20**: SEO optimization with distinct metadata layouts for `/`, `/shop`, `/cart`, `/checkout`, and `/order`.
- **Phase 21**: Responsive UI polish across desktop, tablet, and mobile breakpoints.
- **Phase 22**: Complete documentation and quick run instructions.
- **Phase 23**: End-to-end evaluation & live demo readiness.

---

## 4. Quick Start & Execution

### Option A: Running with Local Node.js & PostgreSQL

#### 1. Start Backend
```bash
cd backend
npm install
npx prisma migrate deploy
npm run seed
npm run start:dev
```
- Backend will be live at: `http://localhost:5000/api/v1`
- Swagger UI Documentation: `http://localhost:5000/docs`

#### 2. Start Frontend
```bash
cd frontend
npm install
npm run dev
```
- Storefront will be live at: `http://localhost:3000`
- Admin Portal will be live at: `http://localhost:3000/admin`

---

### Option B: Running with Docker Compose

```bash
docker compose up --build -d
```
- Backend API: `http://localhost:5000/api/v1`
- Swagger API Docs: `http://localhost:5000/docs`

---

## 5. Seed Credentials & Test Data

### Admin Portal Credentials
- **URL**: `http://localhost:3000/admin/login`
- **Email**: `admin@techgadgets.com`
- **Password**: `AdminPassword123!`
- *(A one-click "Fill Seed Credentials" button is provided on the login page)*

### PayHere Sandbox Test Credentials
- **Merchant ID**: `1211111`
- **Payment Method**: Visa / MasterCard / AMEX
- **Card Number**: Use standard PayHere Sandbox test cards (e.g. `4111 1111 1111 1111`, expiry `12/28`, CVV `123`)

---

## 6. Running Tests

To run the backend test suite (26 passing tests covering Orders, Inventory, WhatsApp, and Payments):

```bash
cd backend
npm run test
```