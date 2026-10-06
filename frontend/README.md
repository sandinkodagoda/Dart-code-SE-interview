# TechGadgets Store — Frontend (Next.js & TypeScript)

Official frontend application for the **Electronics & Tech Gadgets E-Commerce Store** Software Engineer Assessment.

This repository implements both the high-converting **Customer Storefront** and the secure **Admin Operations Portal** with a server-authoritative architecture connected to the NestJS + PostgreSQL backend.

---

## 1. Architecture & Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Turbopack, React 19)
- **Language**: TypeScript (Strict typing across all domain models)
- **State Management**:
  - [Zustand](https://github.com/pmndrs/zustand) with `localStorage` persistence for the Shopping Cart and Admin Auth Session
  - [TanStack Query v5](https://tanstack.com/query) for server state caching, pagination, and real-time polling
- **API Client**: Axios with centralized error unwrapping and dynamic JWT interceptors
- **Icons**: Lucide React
- **Design Tokens**: Custom vanilla CSS tokens in `src/app/globals.css` (electric blue, slate, glassmorphism, responsive container, shimmer keyframes)

---

## 2. Directory Structure

```text
frontend/
├── src/
│   ├── app/
│   │   ├── admin/                  # Admin Operations Portal
│   │   │   ├── brands/             # Brand Management
│   │   │   ├── categories/         # Category Taxonomy
│   │   │   ├── dashboard/          # KPI Dashboard & Order Pipeline
│   │   │   ├── inventory/          # Stock Balance & Audit Ledger
│   │   │   ├── login/              # Admin Authentication & Autofill
│   │   │   ├── orders/             # Order Status State Machine
│   │   │   ├── products/           # Catalog Product Management
│   │   │   ├── layout.tsx          # Admin Shell (Sidebar, Topbar, Guard)
│   │   │   └── page.tsx            # Redirects to /admin/dashboard
│   │   ├── cart/                   # Shopping Cart screen
│   │   ├── checkout/               # Guest Checkout & Payment Selection
│   │   ├── order/[orderNumber]/    # Real-Time Order Tracking & Confirmation
│   │   ├── product/[slug]/         # Product Detail with gallery & specs
│   │   ├── shop/                   # Catalog discovery, search & filters
│   │   ├── globals.css             # Design tokens & animations
│   │   ├── layout.tsx              # Root storefront shell (Header, Footer)
│   │   └── page.tsx                # Customer Flagship Home Page
│   ├── components/
│   │   ├── layout/                 # Header (Announcement bar, search, drawer) & Footer
│   │   ├── product/                # Reusable ProductCard with price & badges
│   │   └── ui/                     # Button, Input, Select, Badge, Price, Skeleton, EmptyState
│   ├── lib/
│   │   ├── api/                    # apiClient (Axios), storeApi, adminApi
│   │   └── query/                  # QueryProvider (TanStack Query)
│   ├── stores/
│   │   ├── auth.store.ts           # Admin JWT & Profile State
│   │   └── cart.store.ts           # Shopping cart persistence & delivery calculator
│   └── types/                      # TypeScript domain models and API contracts
├── .env.example
├── .env.local
├── package.json
└── tsconfig.json
```

---

## 3. Key Feature Sets

### Customer Storefront (Phases 01–12)
1. **Flagship Home Page**: Hero showcase, category cards, featured products grid, promotional MacBook banner, and latest arrivals.
2. **Catalog Discovery (`/shop`)**: Real-time keyword search, category filter, brand filter, in-stock toggle, 4-way sorting, and server pagination.
3. **Product Detail (`/product/[slug]`)**: Breadcrumb navigation, image gallery switcher, server price with discount tags, stock indicator, quantity modifier capped at inventory, and technical specifications table.
4. **Shopping Cart (`/cart`)**: Persistent cart in `localStorage`, quantity modifier, free islandwide delivery progress indicator (free above LKR 10,000, flat LKR 350 otherwise), and empty state fallback.
5. **Guest Checkout (`/checkout`)**: Zero-friction checkout with no mandatory account creation, customer contact and delivery address forms, and server-authoritative price calculation.
6. **WhatsApp Direct Ordering**: Calls backend to generate pre-formatted `wa.me` deep link with complete order details and routes customer to order confirmation.
7. **PayHere Online Gateway**: Initiates signed PayHere sandbox parameters from backend and auto-submits a secure hidden form to PayHere Sandbox.
8. **Real-Time Order Confirmation (`/order/[orderNumber]`)**: Live order status milestones, line items table, delivery summary, and automatic 5s polling when payment is `PENDING`.

### Admin Operations Portal (Phases 13–18)
1. **Authentication (`/admin/login`)**: Protected portal with JWT session management and demo credentials autofill.
2. **Analytics Dashboard (`/admin/dashboard`)**: Authoritative revenue metric, order pipeline (Pending $\to$ Delivered), catalog health, low-stock alert banner, and recent orders table.
3. **Product Management (`/admin/products`)**: Filterable products table, create/edit product modal, pricing, specifications, and soft-delete/deactivate toggle.
4. **Category & Brand Management (`/admin/categories`, `/admin/brands`)**: Full CRUD management with deletion protection when associated products exist.
5. **Inventory Management (`/admin/inventory`)**: Dual-view interface with live stock levels and full transaction audit ledger (`RESTOCK`, `SALE`, `ADJUSTMENT`, `CANCELLATION`, `STOCK_IN`) with negative stock prevention.
6. **Order Fulfillment (`/admin/orders`)**: Multi-filter order list with order modal and strict state machine lifecycle progression (`PENDING` $\to$ `CONFIRMED` $\to$ `PROCESSING` $\to$ `READY_TO_SHIP` $\to$ `SHIPPED` $\to$ `DELIVERED`, or `CANCELLED` with automatic inventory restoration).

---

## 4. Setup & Running Locally

### Prerequisites
- Node.js 20+
- Backend running at `http://localhost:5000`

### 1. Configure Environment Variables
Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Contents of `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm run start -p 3000
```

---

## 5. Seed Admin Credentials

To access the Admin Portal (`http://localhost:3000/admin`):
- **Email**: `admin@techgadgets.com`
- **Password**: `AdminPassword123!`
- *(A one-click "Fill Seed Credentials" helper is available on the login page)*
