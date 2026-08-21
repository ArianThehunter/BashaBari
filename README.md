# BashaBari

**All-in-one property operations and financial management SaaS for Bangladesh.**

BashaBari consolidates property management, tenant lifecycle, rent collection, utility billing, expense tracking, maintenance management, and financial reporting into a single modern platform.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, shadcn/ui |
| Backend | Laravel 13, PHP 8.4 |
| Database | PostgreSQL 16 |
| Cache / Queue / Session | Redis 7 |
| Auth | Laravel Sanctum (SPA cookie-based) |
| Authorization | Per-organization RBAC (roles + permissions), enforced by route middleware |
| Multi-tenancy | Fail-closed global scope keyed on `organization_id` |
| API | RESTful, versioned (`/api/v1/`) |
| Payments | SSLCommerz (sandbox + live drivers behind one interface) |
| Testing | PHPUnit (backend) |
| Mail (Dev) | Mailpit |
| Mail (Prod) | AWS SES |

> Frontend tests are not yet set up. Backend tests run against PostgreSQL in CI.

## Multi-tenancy

Every tenant-scoped table carries `organization_id`, and the models that own one
use the `BelongsToOrganization` trait.

The `organization` route middleware resolves the active organization from the
`X-Organization-Id` header (falling back to the caller's single membership) and
**rejects the request** when it cannot — it never falls through to an unscoped
query. Requesting an organization you are not an active member of returns `403`.

Inside a tenant-scoped request, querying an org-scoped model without an active
organization throws rather than returning every tenant's rows. CLI commands,
seeders and queue workers run unscoped by design and either filter explicitly or
opt in with `OrganizationContext::forOrganization()`.

## Authorization

Permissions are seeded by `RoleAndPermissionSeeder` and enforced per route:

```php
Route::post('/properties', [PropertyController::class, 'store'])
    ->middleware('org.permission:properties.create');
```

Organization owners hold every permission implicitly; everyone else resolves
against their assigned role, and a member with no role holds none.

## Project Structure

```
BashaBari/
├── frontend/          # Next.js 15 SPA
├── backend/           # Laravel 11 API
├── docker/            # Docker configuration files
├── docs/              # Architecture & project documentation
├── docker-compose.yml # Local development orchestration
└── README.md
```

## Prerequisites

See [docs/setup.md](docs/setup.md) for detailed installation instructions.

**Required:**
- Node.js 22+
- PHP 8.4+
- Composer
- PostgreSQL 16+
- Redis 7+
- Git



## Documentation

| Document | Description |
|----------|-------------|
| [Architecture](docs/architecture.md) | System architecture and decisions |
| [Setup Guide](docs/setup.md) | Local development setup (Windows) |
| [Database Schema](docs/database-schema.md) | Domain model and entity relationships |
| [Authentication](docs/auth.md) | Authentication strategy |
| [Authorization](docs/authorization.md) | RBAC and permission model |
| [Timezone](docs/timezone.md) | Timezone handling strategy |
| [Business Rules](docs/business-rules.md) | Documented business decisions |

## Development Workflow

- **Branch model:** `main` → `develop` → `feature/*`
- **Commits:** Conventional commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`)
- **Testing:** Run `php artisan test` and `vendor/bin/pint --test` (backend), `npm run lint` and `npm run build` (frontend) before committing

## License

Proprietary. All rights reserved.
