# Bariwala Hub — System Architecture

## Overview

Bariwala Hub is a multi-tenant SaaS platform for property management in Bangladesh. It follows a **monorepo structure** with a decoupled frontend SPA and backend API.

## Architecture Style

**SPA + API (Decoupled Monolith)**

- The **frontend** is a Next.js 15 Single-Page Application using the App Router.
- The **backend** is a Laravel 11 RESTful API.
- They communicate over HTTP/JSON via versioned API endpoints.
- Authentication uses Laravel Sanctum's cookie-based SPA mode.

This is NOT a microservices architecture. The backend is a well-structured monolith. This is intentional — the project does not have the operational complexity or team size to justify distributed services at MVP stage.

## Architecture Diagram

```
┌──────────────────────────────────────────────────────┐
│                    Browser                            │
│    (Desktop: Owner/Caretaker/Accountant/Admin)       │
│    (Mobile: Caretaker/Tenant)                        │
└────────────────┬─────────────────────────────────────┘
                 │ HTTPS
                 ▼
┌──────────────────────────────────────────────────────┐
│              Nginx (Reverse Proxy)                    │
│                                                      │
│   /api/*  ──────►  PHP-FPM (Laravel 11)              │
│   /*      ──────►  Next.js (Node.js)                 │
└──────────┬──────────────────────┬────────────────────┘
           │                      │
           ▼                      ▼
┌──────────────────┐   ┌──────────────────────────────┐
│   PostgreSQL 16   │   │      Redis 7                  │
│   (Primary DB)    │   │  - Sessions                   │
│                   │   │  - Cache                      │
└──────────────────┘   │  - Queue (jobs)                │
                        └──────────────────────────────┘
                                  │
                                  ▼
                        ┌──────────────────┐
                        │   Queue Worker    │
                        │  - Emails         │
                        │  - PDFs           │
                        │  - Notifications  │
                        │  - Reports        │
                        └──────────────────┘
```

## Key Architecture Decisions

### ADR-001: SPA Authentication via Laravel Sanctum (Cookie-Based)

**Context:** The frontend is a React SPA on the same domain as the API. We need secure authentication without the complexity of JWT token management.

**Decision:** Use Laravel Sanctum in SPA mode (cookie/session-based).

**Rationale:**
- No token storage on client (no localStorage/sessionStorage vulnerabilities).
- CSRF protection is automatic.
- Session revocation is instant (no JWT expiry wait).
- Industry standard for same-domain SPA + Laravel setups.
- Simpler than JWT for this use case (no mobile apps, no third-party API consumers in MVP).

**Consequences:**
- Frontend and API must share the same top-level domain (or use proper CORS + cookie config).
- Stateful sessions require Redis-backed session storage for scalability.
- Future mobile apps will need Sanctum API tokens (a separate concern, handled later).

---

### ADR-002: PostgreSQL as Primary Database

**Context:** Originally specified as MySQL/MariaDB, but deployment target is Supabase (PostgreSQL-based).

**Decision:** Use PostgreSQL 16 everywhere (local dev, staging, production/Supabase).

**Rationale:**
- Supabase only supports PostgreSQL.
- PostgreSQL has superior JSON support, better constraint enforcement, and advanced indexing.
- Laravel's Eloquent ORM fully supports PostgreSQL with minimal differences.
- Avoids painful MySQL-to-PostgreSQL migration later.

---

### ADR-003: Organization-Scoped Multi-Tenancy (Shared Database)

**Context:** The platform needs to isolate data between organizations while remaining cost-effective.

**Decision:** Single shared database with `organization_id` foreign key on all tenant-owned tables. A global Eloquent scope automatically filters queries.

**Rationale:**
- Most cost-effective approach for a SaaS MVP.
- Simple to implement and reason about.
- Foreign keys + application-level scoping provide strong isolation.
- Can migrate to schema-per-tenant or database-per-tenant later if scale demands it.

**Enforcement layers:**
1. Middleware resolves current organization from session.
2. Global Eloquent scope adds `WHERE organization_id = ?` to all queries.
3. Policies verify resource ownership.
4. Database foreign keys enforce referential integrity.

---

### ADR-004: Money as Integer Minor Units (Poisha)

**Context:** Financial calculations must be exact. Floating-point arithmetic introduces rounding errors.

**Decision:** Store all monetary values as `BIGINT` in poisha (1 BDT = 100 poisha).

**Rationale:**
- Integer arithmetic is exact.
- No rounding surprises.
- `BIGINT` supports values up to ~92 quadrillion poisha.
- Display conversion (poisha → BDT) happens only at presentation layer.
- Currency column can be added later for multi-currency without changing storage format.

---

### ADR-005: UTC Timestamp Strategy

See [timezone.md](timezone.md) for full details.

**Decision:**
- Database timezone: UTC.
- Laravel timezone: UTC.
- Business dates (rent due, lease dates): `DATE` type (timezone-agnostic).
- Event timestamps: `TIMESTAMPTZ` stored in UTC.
- Display: Convert to `Asia/Dhaka` (UTC+6) at presentation layer.

---

### ADR-006: API Versioning via URL Prefix

**Decision:** URL-based versioning: `/api/v1/...`

**Rationale:** Explicit, simple, well-understood. Easy to introduce `/api/v2/` if breaking changes are needed.

---

### ADR-007: No Redux by Default

**Decision:** Do not introduce Redux Toolkit unless a genuine global client-state need arises.

**State management approach:**
| State Type | Solution |
|---|---|
| Server data | TanStack Query v5 |
| Form state | React Hook Form + Zod |
| URL state | `nuqs` / `useSearchParams` |
| Local UI | `useState` / `useReducer` |
| Global client (if needed) | Zustand |

---

## Security Architecture

### Defense Layers

1. **Network:** HTTPS only, secure headers (HSTS, CSP, X-Frame-Options).
2. **Authentication:** Sanctum session + CSRF tokens.
3. **Authorization:** Laravel Policies + Gates, enforced server-side.
4. **Input validation:** Laravel Form Requests (backend), Zod (frontend).
5. **Multi-tenancy:** Organization scope, never trust client-supplied org IDs.
6. **Rate limiting:** Laravel rate limiter on auth and sensitive endpoints.
7. **File uploads:** MIME validation, size limits, private storage.
8. **Audit logging:** All sensitive mutations logged with actor, action, metadata.
9. **Error handling:** Production errors return safe messages, no stack traces.
10. **Secrets:** Environment variables only, never committed.

## Deployment Architecture (Production)

Target: VPS or Supabase (database) + VPS (application).

```
┌─────────────────────────────────────────────┐
│                   VPS                        │
│                                             │
│  Nginx ─── PHP-FPM (Laravel)                │
│         ─── Next.js (Node.js, PM2)          │
│                                             │
│  Redis (local or managed)                    │
│  Queue Worker (Supervisor)                   │
│  Laravel Scheduler (cron)                    │
│                                             │
│  SSL: Let's Encrypt / Certbot               │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
        ┌──────────────────┐
        │  Supabase         │
        │  (PostgreSQL 16)  │
        └──────────────────┘
```
