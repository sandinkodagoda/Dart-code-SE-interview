# Electronics & Tech Gadgets E-Commerce Store

Full-stack E-Commerce platform for an **Electronics & Tech Gadgets Store** selling mobile phones, laptops, computers, tablets, smart devices, audio equipment, and accessories.

---

## Repository Structure

- [`backend/`](./backend): Modular Monolith REST API built with **NestJS**, **TypeScript**, **PostgreSQL**, **Prisma ORM**, **JWT**, **Argon2**, **Helmet**, **PayHere Sandbox**, and **WhatsApp Ordering**.
- [`frontend/`](./frontend): Web storefront and administration interface built with **Next.js** and **TypeScript**.
- [`docker-compose.yml`](./docker-compose.yml): Production-ready containerized deployment running PostgreSQL 16 and the NestJS backend.

---

## Backend Documentation

For the complete backend architecture guide, database models, security review, Swagger documentation, testing suite, and setup instructions, refer to:

👉 **[Backend Documentation & Setup Guide (backend/README.md)](./backend/README.md)**

---

## Quick Start (Docker)

To run the complete backend with PostgreSQL via Docker Compose:

```bash
docker compose up --build -d
```

- API Base URL: `http://localhost:5000/api/v1`
- Swagger Documentation: `http://localhost:5000/docs`