# BashaBari

**All-in-one property operations and financial management SaaS for Bangladesh.**

BashaBari consolidates property management, tenant lifecycle, rent collection, utility billing, expense tracking, maintenance management, and financial reporting into a single modern platform.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui |
| Backend | Laravel 11, PHP 8.3+ |
| Database | PostgreSQL 16 |
| Cache / Queue | Redis 7 |
| Auth | Laravel Sanctum (SPA cookie-based) |
| API | RESTful, versioned (`/api/v1/`) |
| Testing | Pest (backend), Vitest (frontend), Playwright (E2E) |
| Mail (Dev) | Mailpit |
| Mail (Prod) | AWS SES |

## Project Structure

```
bariwala-hub/
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
- PHP 8.3+
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
- **Testing:** Run `php artisan test` (backend) and `npm test` (frontend) before committing

## License

Proprietary. All rights reserved.
