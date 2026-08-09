# Bariwala Hub — Database Schema

## Design Principles

- **PostgreSQL 16** as the primary database.
- All monetary values stored as **BIGINT in poisha** (1 BDT = 100 poisha).
- All timestamps stored as **TIMESTAMPTZ in UTC**.
- Business dates stored as **DATE** (timezone-agnostic).
- Every organization-owned table has an `organization_id` foreign key.
- Soft deletes where data retention is required.
- UUID not used unless specifically needed — BIGSERIAL for primary keys (simpler, faster).

## Entity Relationship Overview

```
organizations
├── properties
│   ├── buildings
│   │   ├── floors
│   │   │   └── units
│   │   │       ├── meters
│   │   │       │   └── meter_readings
│   │   │       ├── leases ──► tenants
│   │   │       │   └── invoices
│   │   │       │       ├── invoice_items
│   │   │       │       └── payments
│   │   │       │           └── receipts
│   │   │       └── maintenance_requests
│   │   │           └── maintenance_comments
│   │   └── expenses ──► vendors
│   └── staff_members
├── organization_members ──► users
│   └── roles ──► permissions
├── utility_types
├── expense_categories
├── announcements
└── audit_logs
```

## Core Tables

### users
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | BIGSERIAL | PK | |
| name | VARCHAR(255) | NOT NULL | |
| email | VARCHAR(255) | NOT NULL, UNIQUE | |
| phone | VARCHAR(20) | NULLABLE | |
| password | VARCHAR(255) | NOT NULL | bcrypt hashed |
| email_verified_at | TIMESTAMPTZ | NULLABLE | |
| platform_role | VARCHAR(20) | DEFAULT 'user' | 'user' or 'platform_admin' |
| is_active | BOOLEAN | DEFAULT TRUE | |
| remember_token | VARCHAR(100) | NULLABLE | |
| created_at | TIMESTAMPTZ | | |
| updated_at | TIMESTAMPTZ | | |

### organizations
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | BIGSERIAL | PK | |
| name | VARCHAR(255) | NOT NULL | |
| slug | VARCHAR(255) | NOT NULL, UNIQUE | URL-safe identifier |
| address | TEXT | NULLABLE | |
| phone | VARCHAR(20) | NULLABLE | |
| email | VARCHAR(255) | NULLABLE | |
| status | VARCHAR(20) | DEFAULT 'trial' | trial, active, suspended, cancelled |
| settings | JSONB | DEFAULT '{}' | Org-level configuration |
| trial_ends_at | DATE | NULLABLE | |
| created_at | TIMESTAMPTZ | | |
| updated_at | TIMESTAMPTZ | | |
| deleted_at | TIMESTAMPTZ | NULLABLE | Soft delete |

### properties
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | BIGSERIAL | PK | |
| organization_id | BIGINT | FK → organizations, NOT NULL | Tenant boundary |
| name | VARCHAR(255) | NOT NULL | |
| address | TEXT | NULLABLE | |
| city | VARCHAR(100) | NULLABLE | |
| area | VARCHAR(100) | NULLABLE | Neighborhood/zone |
| description | TEXT | NULLABLE | |
| status | VARCHAR(20) | DEFAULT 'active' | active, inactive |
| created_at | TIMESTAMPTZ | | |
| updated_at | TIMESTAMPTZ | | |
| deleted_at | TIMESTAMPTZ | NULLABLE | |

**Indexes:** `(organization_id)`, `(organization_id, status)`

### buildings
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | BIGSERIAL | PK | |
| property_id | BIGINT | FK → properties, NOT NULL | |
| organization_id | BIGINT | FK → organizations, NOT NULL | Denormalized for scope |
| name | VARCHAR(255) | NOT NULL | |
| total_floors | INTEGER | NULLABLE | |
| created_at | TIMESTAMPTZ | | |
| updated_at | TIMESTAMPTZ | | |

### floors
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | BIGSERIAL | PK | |
| building_id | BIGINT | FK → buildings, NOT NULL | |
| organization_id | BIGINT | FK → organizations, NOT NULL | |
| name | VARCHAR(100) | NOT NULL | Display name (e.g., "3rd Floor") |
| floor_number | INTEGER | NOT NULL | Sortable integer |
| created_at | TIMESTAMPTZ | | |
| updated_at | TIMESTAMPTZ | | |

**Unique:** `(building_id, floor_number)`

### units
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | BIGSERIAL | PK | |
| floor_id | BIGINT | FK → floors, NOT NULL | |
| building_id | BIGINT | FK → buildings, NOT NULL | Denormalized |
| property_id | BIGINT | FK → properties, NOT NULL | Denormalized |
| organization_id | BIGINT | FK → organizations, NOT NULL | |
| unit_number | VARCHAR(50) | NOT NULL | |
| unit_type | VARCHAR(30) | DEFAULT 'residential' | residential, commercial, garage, storage |
| bedrooms | SMALLINT | NULLABLE | |
| bathrooms | SMALLINT | NULLABLE | |
| area_sqft | DECIMAL(10,2) | NULLABLE | |
| base_rent_amount | BIGINT | DEFAULT 0 | In poisha |
| occupancy_status | VARCHAR(20) | DEFAULT 'vacant' | vacant, occupied, maintenance, reserved |
| utility_config | JSONB | DEFAULT '{}' | Which utilities apply |
| notes | TEXT | NULLABLE | |
| created_at | TIMESTAMPTZ | | |
| updated_at | TIMESTAMPTZ | | |
| deleted_at | TIMESTAMPTZ | NULLABLE | |

**Unique:** `(floor_id, unit_number)`
**Indexes:** `(organization_id)`, `(property_id, occupancy_status)`

### tenants
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | BIGSERIAL | PK | |
| user_id | BIGINT | FK → users, NULLABLE | Linked if tenant has portal login |
| organization_id | BIGINT | FK → organizations, NOT NULL | |
| name | VARCHAR(255) | NOT NULL | |
| phone | VARCHAR(20) | NULLABLE | |
| email | VARCHAR(255) | NULLABLE | |
| nid_number | TEXT | NULLABLE | Encrypted at application level |
| emergency_contact | VARCHAR(255) | NULLABLE | |
| status | VARCHAR(20) | DEFAULT 'prospect' | See tenant lifecycle |
| notes | TEXT | NULLABLE | Private management notes |
| created_at | TIMESTAMPTZ | | |
| updated_at | TIMESTAMPTZ | | |
| deleted_at | TIMESTAMPTZ | NULLABLE | Soft delete (retain history) |

### leases
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | BIGSERIAL | PK | |
| tenant_id | BIGINT | FK → tenants, NOT NULL | |
| unit_id | BIGINT | FK → units, NOT NULL | |
| organization_id | BIGINT | FK → organizations, NOT NULL | |
| start_date | DATE | NOT NULL | Business date |
| end_date | DATE | NULLABLE | NULL = month-to-month |
| rent_amount | BIGINT | NOT NULL | In poisha |
| billing_frequency | VARCHAR(20) | DEFAULT 'monthly' | |
| security_deposit | BIGINT | DEFAULT 0 | In poisha |
| advance_rent | BIGINT | DEFAULT 0 | In poisha |
| rent_due_day | SMALLINT | DEFAULT 1 | Day of month (1-28) |
| grace_period_days | SMALLINT | DEFAULT 0 | |
| status | VARCHAR(20) | DEFAULT 'draft' | draft, active, renewed, terminated, expired |
| previous_lease_id | BIGINT | FK → leases, NULLABLE | Renewal chain |
| terms | TEXT | NULLABLE | |
| created_at | TIMESTAMPTZ | | |
| updated_at | TIMESTAMPTZ | | |

**Indexes:** `(tenant_id, status)`, `(unit_id, status)`, `(organization_id)`

### invoices
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | BIGSERIAL | PK | |
| invoice_number | VARCHAR(50) | NOT NULL, UNIQUE | Generated: INV-ORG001-202501-0001 |
| tenant_id | BIGINT | FK → tenants, NOT NULL | |
| lease_id | BIGINT | FK → leases, NOT NULL | |
| unit_id | BIGINT | FK → units, NOT NULL | |
| organization_id | BIGINT | FK → organizations, NOT NULL | |
| billing_period_start | DATE | NOT NULL | |
| billing_period_end | DATE | NOT NULL | |
| previous_balance | BIGINT | DEFAULT 0 | In poisha |
| total_amount | BIGINT | NOT NULL | In poisha |
| paid_amount | BIGINT | DEFAULT 0 | In poisha |
| outstanding_amount | BIGINT | NOT NULL | In poisha (computed) |
| due_date | DATE | NOT NULL | |
| status | VARCHAR(20) | DEFAULT 'draft' | draft, sent, partially_paid, paid, overdue, cancelled, void |
| idempotency_key | VARCHAR(100) | UNIQUE | Prevents duplicate generation |
| sent_at | TIMESTAMPTZ | NULLABLE | When invoice was sent |
| created_at | TIMESTAMPTZ | | |
| updated_at | TIMESTAMPTZ | | |

### invoice_items
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | BIGSERIAL | PK | |
| invoice_id | BIGINT | FK → invoices, NOT NULL | |
| description | VARCHAR(255) | NOT NULL | "Monthly Rent", "Electricity", etc. |
| type | VARCHAR(30) | NOT NULL | rent, utility, expense, other |
| amount | BIGINT | NOT NULL | In poisha |
| quantity | DECIMAL(10,4) | DEFAULT 1 | For metered utilities |
| unit_price | BIGINT | NULLABLE | Per-unit price in poisha |
| metadata | JSONB | DEFAULT '{}' | Meter readings, calculation details |
| created_at | TIMESTAMPTZ | | |
| updated_at | TIMESTAMPTZ | | |

### payments
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | BIGSERIAL | PK | |
| invoice_id | BIGINT | FK → invoices, NULLABLE | NULL for advance/deposit |
| tenant_id | BIGINT | FK → tenants, NOT NULL | |
| organization_id | BIGINT | FK → organizations, NOT NULL | |
| amount | BIGINT | NOT NULL | In poisha |
| payment_date | DATE | NOT NULL | Business date |
| method | VARCHAR(30) | NOT NULL | cash, bkash, nagad, rocket, upay, bank_transfer, other |
| reference_number | VARCHAR(100) | NULLABLE | Transaction ID |
| type | VARCHAR(20) | DEFAULT 'payment' | payment, advance, deposit, refund |
| verification_status | VARCHAR(20) | DEFAULT 'manual' | manual, gateway_verified |
| recorded_by | BIGINT | FK → users, NOT NULL | |
| notes | TEXT | NULLABLE | |
| created_at | TIMESTAMPTZ | | |
| updated_at | TIMESTAMPTZ | | |

### receipts
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | BIGSERIAL | PK | |
| receipt_number | VARCHAR(50) | NOT NULL, UNIQUE | Generated: RCP-ORG001-202501-0001 |
| payment_id | BIGINT | FK → payments, NOT NULL | |
| tenant_id | BIGINT | FK → tenants, NOT NULL | |
| organization_id | BIGINT | FK → organizations, NOT NULL | |
| amount | BIGINT | NOT NULL | In poisha |
| receipt_date | DATE | NOT NULL | |
| pdf_path | VARCHAR(500) | NULLABLE | Path to generated PDF |
| created_at | TIMESTAMPTZ | | |
| updated_at | TIMESTAMPTZ | | |

### expenses
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | BIGSERIAL | PK | |
| organization_id | BIGINT | FK → organizations, NOT NULL | |
| property_id | BIGINT | FK → properties, NOT NULL | |
| building_id | BIGINT | FK → buildings, NULLABLE | |
| unit_id | BIGINT | FK → units, NULLABLE | |
| vendor_id | BIGINT | FK → vendors, NULLABLE | |
| expense_category_id | BIGINT | FK → expense_categories, NOT NULL | |
| amount | BIGINT | NOT NULL | In poisha |
| expense_date | DATE | NOT NULL | |
| payment_method | VARCHAR(30) | NULLABLE | |
| description | TEXT | NULLABLE | |
| receipt_path | VARCHAR(500) | NULLABLE | |
| approval_status | VARCHAR(20) | DEFAULT 'pending' | pending, approved, rejected |
| recorded_by | BIGINT | FK → users, NOT NULL | |
| created_at | TIMESTAMPTZ | | |
| updated_at | TIMESTAMPTZ | | |

### maintenance_requests
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | BIGSERIAL | PK | |
| organization_id | BIGINT | FK → organizations, NOT NULL | |
| unit_id | BIGINT | FK → units, NOT NULL | |
| tenant_id | BIGINT | FK → tenants, NULLABLE | |
| assigned_to_staff | BIGINT | FK → staff_members, NULLABLE | |
| vendor_id | BIGINT | FK → vendors, NULLABLE | |
| title | VARCHAR(255) | NOT NULL | |
| description | TEXT | NULLABLE | |
| category | VARCHAR(30) | NOT NULL | plumbing, electrical, structural, etc. |
| priority | VARCHAR(10) | DEFAULT 'medium' | low, medium, high, urgent |
| status | VARCHAR(20) | DEFAULT 'open' | open, assigned, in_progress, waiting, completed, cancelled |
| estimated_cost | BIGINT | NULLABLE | In poisha |
| actual_cost | BIGINT | NULLABLE | In poisha |
| expense_id | BIGINT | FK → expenses, NULLABLE | Links to expense record |
| completed_at | TIMESTAMPTZ | NULLABLE | |
| created_at | TIMESTAMPTZ | | |
| updated_at | TIMESTAMPTZ | | |

### audit_logs
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | BIGSERIAL | PK | |
| organization_id | BIGINT | FK → organizations, NULLABLE | NULL for platform-level |
| user_id | BIGINT | FK → users, NOT NULL | Actor |
| action | VARCHAR(50) | NOT NULL | created, updated, deleted, etc. |
| auditable_type | VARCHAR(100) | NOT NULL | Model class name |
| auditable_id | BIGINT | NOT NULL | Resource ID |
| old_values | JSONB | NULLABLE | Previous state |
| new_values | JSONB | NULLABLE | New state |
| ip_address | INET | NULLABLE | |
| user_agent | TEXT | NULLABLE | |
| created_at | TIMESTAMPTZ | NOT NULL | |

**Note:** Audit logs are append-only. Never update or delete.

---

## Supporting Tables

Additional tables include: `vendors`, `staff_members`, `meters`, `meter_readings`, `utility_types`, `utility_bills`, `expense_categories`, `announcements`, `documents`, `notifications`, `subscription_plans`. These follow the same patterns and will be detailed when their respective phases are implemented.
