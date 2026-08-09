# Bariwala Hub — System Audit, Business Architecture & Technical Specification

> **Document Type**: System Audit & Comprehensive Technical Blueprint  
> **Audience**: Software Architects, System Engineers, Business Stakeholders, AI Agents  
> **Target Region**: Bangladesh (Nationwide Scale)  
> **Version**: 1.0.0 (Production Ready)  
> **Last Audit Verification**: August 2026  

---

## 1. Executive Summary & Mission Statement

**Bariwala Hub** is an enterprise-grade, multi-tenant property management platform engineered specifically for the rental market of Bangladesh. The platform streamlines tenant onboarding, premises hierarchy tracking (properties, buildings, floors, flat units), lease contract creation under the **Premises Rent Control Act 1992**, automated monthly rent invoicing, online payment processing via **SSLCommerz** (bKash, Nagad, Cards), sub-meter utility billing across all 10 nationwide BD utility providers, double-entry financial general ledger accounting, property maintenance ticketing, and immutable security audit trails.

The application is built using a modern decoupled architecture: a **Laravel 11 RESTful API backend** coupled with a **Next.js 15+ App Router (React 19, TypeScript)** frontend.

---

## 2. Business Decisions, Legal Compliance & Domain Rules

The platform enforces strict business rules tailored to Bangladesh real estate laws and local market requirements:

| Rule Code | Category | Business / Legal Specification | Implementation & Code Location |
|-----------|----------|--------------------------------|--------------------------------|
| **BD-001** | Subscription & Trial | **First-Time 5-Day Free Trial**: New organization registrations automatically start with a 5-day trial period calculated in Bangladesh Time (`Asia/Dhaka`). | `OrganizationController.php`: Sets `status = 'trial'` and `trial_ends_at = Carbon::today('Asia/Dhaka')->addDays(5)`. |
| **BD-002** | Legal Compliance | **Premises Rent Control Act 1992 Notice**: Tenant profiles and eviction notices embed the statutory notice clause under Section 18 of the Rent Act 1992. | Embedded in `TenantController.php`, tenant profiles, and `/settings/compliance`. |
| **BD-003** | Lease Term | **Standard 1 to 2-Year Lease Duration**: Lease creation requires valid tenure between 12 and 24 months. | Enforced in `leaseSchema` validation and `LeaseController.php`. |
| **BD-005** | Email Delivery | **AWS SES Integration**: Transactional emails, password resets, and invoice notices use Amazon Simple Email Service. | Configured in `backend/config/mail.php` (`mailers.ses`). |
| **BD-008** | Refund Policy | **Advance Rent Refund Constraint**: Refunds are allowed **only** for advance rent paid when a tenant vacates early. Security deposits are offset against damage claims. | Enforced in `PaymentController::refund` before balance deduction. |
| **BD-MONEY** | Financial Accuracy | **Integer Poisha Currency Standard**: All monetary figures across DB columns, API payloads, invoices, and ledgers are stored as integer poisha (`1 BDT = 100 poisha`). | Stored as `BIGINT` in DB; converted via `bdtToPoisha()` and `formatMoney()` on UI. |
| **BD-UTILITY** | Utility Providers | **Nationwide BD Utility Coverage**: Full support for all 10 Bangladesh utility companies across Electricity, Gas, and Water. | Pre-seeded via `UtilityProviderSeeder.php` (`DPDC`, `DESCO`, `BREB`, `NESCO`, `WZPDCL`, `TITAS`, `KARNAPHULI`, `JALALABAD`, `DWASA`, `CWASA`). |

---

## 3. Technology Stack & Architectural Blueprint

```
                     ┌──────────────────────────────────────────────┐
                     │          Next.js 15+ App Router              │
                     │    (React 19, TypeScript, Tailwind v4)      │
                     └──────────────────────┬───────────────────────┘
                                            │ HTTP / REST API (Sanctum SPA Session)
                                            ▼
                     ┌──────────────────────────────────────────────┐
                     │          Laravel 11 RESTful API              │
                     │          (PHP 8.3, Eloquent ORM)             │
                     └──────┬────────────────┬───────────────┬──────┘
                            │                │               │
            ┌───────────────┴────┐   ┌───────┴──────┐  ┌─────┴─────────────┐
            │ PostgreSQL 16 DB   │   │  Redis 7.2   │  │  SSLCommerz Gateway │
            │ (B-Tree Indexed)   │   │(Rate Limit)  │  │(bKash, Nagad, Card) │
            └────────────────────┘   └──────────────┘  └───────────────────┘
```

### 3.1 Backend Architecture (`backend/`)
- **Framework**: Laravel 11.x (PHP 8.3)
- **API Routing**: RESTful Versioned API (`/api/v1/`)
- **Authentication**: Laravel Sanctum (SPA Session-based Authentication with CSRF protection)
- **Role-Based Access Control (RBAC)**: Multi-tenant Spatie-style roles (`organization_members`, `roles`, `permissions`)
- **Background Jobs & Queue**: Redis queue driver for email notifications and invoice generation

### 3.2 Frontend Architecture (`frontend/`)
- **Framework**: Next.js 15+ App Router (React 19, TypeScript)
- **Styling**: Tailwind CSS v4 (`@import "tailwindcss";` & `@theme inline`) with dark mode support
- **UI Components**: Shadcn UI / Radix primitives (`Button`, `Card`, `Table`, `Dialog`, `Select`, `Badge`, `Input`, `Textarea`)
- **Data Fetching & Caching**: TanStack Query v5 (React Query) for optimistic UI updates and cache invalidation
- **Form Handling & Validation**: React Hook Form + Zod validation schemas
- **HTTP Client**: Axios with CSRF cookie handling and automatic 401 interceptors

### 3.3 Database & Storage
- **Primary Database**: PostgreSQL 16 (in Docker/production) with composite B-Tree indexes across all 9 core domain tables
- **Cache & Rate Limiter**: Redis 7.2
- **Testing Database**: SQLite in-memory database for ultra-fast PHPUnit feature tests (**37/37 tests passing**)

### 3.4 SRE, Reliability & Observability
- **Deep Health Probes** (`/health` & `/api/v1/health`): Performs live DB ping (`DB::connection()->getPdo()`) and Cache ping (`Cache::store()->put()`). Serves as AWS ELB / Kubernetes liveness & readiness probes.
- **Request Correlation ID Tracing**: `RequestIdMiddleware` appends `UUIDv4` correlation IDs to `X-Request-Id` headers and structured log contexts.
- **API Rate Limiting**: Tiered rate limits (`throttle:login`, `throttle:6,1` for password resets, `throttle:api` 120 req/min).
- **Security Headers**: HSTS, `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `X-XSS-Protection`.

---

## 4. System Schema & Entity-Relationship Architecture

The system database model encompasses 19 primary entities:

```
[ Organization ] ───< [ OrganizationMember ] >─── [ User ]
       │                                             │
       ├───< [ Property ] ───< [ Building ] ───< [ Floor ] ───< [ Unit ]
       │          │                                                │
       │          ├───< [ Tenant ] ────────────────────────────────┤
       │          │        │                                       │
       │          │        ├───< [ Lease ] ────────────────────────┤
       │          │        │       │                               │
       │          │        │       ├───< [ Invoice ] ───< [ InvoiceItem ]
       │          │        │       │       │
       │          │        │       │       ├───< [ Payment ]
       │          │        │       │       │
       │          │        │       └───────┼───< [ LedgerEntry ]
       │          │        │               │
       │          ├───< [ MaintenanceRequest ]
       │          │        │
       │          ├───< [ Expense ]
       │          │
       │          ├───< [ MeterReading ] >─── [ UtilityProvider ]
       │          │
       └──────────┴───< [ AuditLog ]
```

### Key Domain Tables & Columns:
1. **`organizations`**: `id`, `name`, `slug`, `status` ('trial', 'active', 'suspended'), `trial_ends_at`, timestamps.
2. **`properties`**: `id`, `organization_id`, `name`, `address`, `city`, `total_units`, timestamps.
3. **`buildings`**: `id`, `organization_id`, `property_id`, `name`, `total_floors`, timestamps.
4. **`floors`**: `id`, `organization_id`, `building_id`, `floor_number`, `name`, timestamps.
5. **`units`**: `id`, `organization_id`, `property_id`, `building_id`, `floor_id`, `unit_number`, `unit_type`, `base_rent_amount` (poisha), `occupancy_status` ('vacant', 'occupied', 'maintenance'), timestamps.
6. **`tenants`**: `id`, `organization_id`, `name`, `email`, `phone`, `nid_number`, `passport_number`, `emergency_contact_phone`, timestamps.
7. **`leases`**: `id`, `organization_id`, `unit_id`, `tenant_id`, `lease_number`, `start_date`, `end_date`, `rent_amount` (poisha), `security_deposit` (poisha), `advance_rent` (poisha), `billing_day`, `status` ('active', 'expired', 'terminated'), timestamps.
8. **`invoices`**: `id`, `organization_id`, `tenant_id`, `lease_id`, `unit_id`, `invoice_number` (`INV-YYYYMM-XXX`), `billing_period_month`, `billing_period_year`, `issue_date`, `due_date`, `subtotal_amount`, `tax_amount`, `paid_amount`, `due_amount`, `status` ('unpaid', 'partially_paid', 'paid', 'overdue'), timestamps.
9. **`payments`**: `id`, `organization_id`, `tenant_id`, `invoice_id`, `payment_number` (`PAY-YYYYMM-XXX`), `amount` (poisha), `payment_date`, `payment_method` ('sslcommerz', 'cash', 'bkash', 'nagad', 'bank_transfer'), `tran_id`, `val_id`, `bank_tran_id`, `card_type`, `card_no`, `raw_response` (json), timestamps.
10. **`ledger_entries`**: `id`, `organization_id`, `invoice_id`, `payment_id`, `expense_id`, `type` ('income', 'expense'), `category`, `amount` (poisha), `entry_date`, `description`, timestamps.
11. **`maintenance_requests`**: `id`, `organization_id`, `property_id`, `building_id`, `unit_id`, `tenant_id`, `reported_by_user_id`, `title`, `description`, `category` ('plumbing', 'electrical', 'painting', 'elevator', 'cleaning', 'repairs'), `priority` ('low', 'medium', 'high', 'emergency'), `status` ('pending', 'in_progress', 'completed', 'cancelled'), `estimated_cost_amount`, `actual_cost_amount`, `assigned_vendor_name`, `assigned_vendor_phone`, `resolved_at`, timestamps.
12. **`expenses`**: `id`, `organization_id`, `property_id`, `unit_id`, `maintenance_request_id`, `expense_number` (`EXP-YYYYMM-XXX`), `category`, `amount` (poisha), `expense_date`, `vendor_name`, `payment_method`, `receipt_reference`, `notes`, timestamps.
13. **`utility_providers`**: `id`, `name`, `code` (`DPDC`, `DESCO`, `BREB`, `NESCO`, `WZPDCL`, `TITAS`, `KARNAPHULI`, `JALALABAD`, `DWASA`, `CWASA`), `type` ('electricity', 'gas', 'water'), `default_rate_per_unit_poisha`, timestamps.
14. **`meter_readings`**: `id`, `organization_id`, `property_id`, `unit_id`, `utility_provider_id`, `meter_number`, `previous_reading`, `current_reading`, `units_consumed`, `rate_per_unit_poisha`, `total_amount_poisha`, `reading_date`, `billing_month`, `status` ('pending', 'invoiced'), timestamps.
15. **`audit_logs`**: `id`, `organization_id`, `user_id`, `event` (`tenant.deleted`, `lease.terminated`, `payment.refunded`), `auditable_type`, `auditable_id`, `old_values` (json), `new_values` (json), `ip_address`, `user_agent`, timestamps.

---

## 5. Payment Gateway Architecture (SSLCommerz Integration)

Payment processing is built on the **Strategy Pattern**:

```
                  ┌──────────────────────────────────────────────┐
                  │          PaymentGatewayInterface             │
                  └──────────────────────┬───────────────────────┘
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 │                                               │
  ┌──────────────▼─────────────┐                  ┌──────────────▼─────────────┐
  │    MockSSLCommerzDriver    │                  │      SSLCommerzDriver      │
  │  (Local Hosted Simulator)  │                  │   (Live Merchant API v4)   │
  └────────────────────────────┘                  └────────────────────────────┘
```

- **Strategy Contract**: `PaymentGatewayInterface` defines `initiatePaymentSession()` and `verifyPaymentCallback()`.
- **Mock Hosted Simulator**: `MockSSLCommerzDriver` routes session checkout to `/payments/sslcommerz-checkout`, allowing local testing of bKash, Nagad, Rocket, Visa, Mastercard, DBBL Nexus, and AMEX payments.
- **IPN Auto-Reconciliation**: Payment callbacks automatically update invoice `paid_amount`, recalculate `due_amount`, transition invoice status (`paid` / `partially_paid`), and log an `income` entry in `ledger_entries`.

---

## 6. SMS Gateway & Sub-Meter Engine Integration

### 6.1 SMS Gateway (`SmsGatewayInterface`)
- `MockBDSmsDriver` detects Bangladesh mobile operators based on MSISDN prefix:
  - **Grameenphone**: `017`, `013`
  - **Robi / Airtel**: `018`, `016`
  - **Banglalink**: `019`, `014`
  - **Teletalk**: `015`
- Automatically logs SMS dispatches for invoice generation, payment receipts, and rent due alerts.

### 6.2 Sub-Meter Consumption Calculation
- Unit Math: `units_consumed = current_reading - previous_reading`.
- Financial Conversion: `total_amount_poisha = (int) round(units_consumed * (rate_per_unit_bdt * 100))`.

---

## 7. Tenant Self-Service Portal (`/tenant-portal`) & PDF Views

### 7.1 Tenant Portal Routes
- `/tenant-portal`: Mobile-first dashboard with outstanding due rent card and instant SSLCommerz payment button.
- `/tenant-portal/invoices`: Tenant's invoice history and printable receipts.
- `/tenant-portal/maintenance`: Tenant maintenance ticket logging.

### 7.2 Official Printable PDF Receipts
- `/invoices/[id]/print`: Standardized Bangladesh money receipt containing Organization header, Tenant NID details, Premises address, itemized subtotal, tax, SSLCommerz verification stamp, and owner signature line.

---

## 8. Verification Matrix & Quality Assurance

| Audit Check | Execution Command | Result |
|-------------|-------------------|--------|
| **Backend Test Suite** | `php artisan test` | ✅ **37/37 passed** (124 assertions) |
| **Frontend Production Build** | `npm run build` | ✅ **37 static & dynamic routes compiled** |
| **Frontend Linter** | `npm run lint` | ✅ **0 errors, 0 warnings** |
| **Git Release Commit** | `git commit` | ✅ **Committed (`c0b7cbc`)** |

---

## 9. File Tree Reference

```
bariwala hub/
├── backend/
│   ├── app/
│   │   ├── Http/Controllers/Api/
│   │   │   ├── HealthCheckController.php
│   │   │   └── V1/
│   │   │       ├── AuditLogController.php
│   │   │       ├── ExpenseController.php
│   │   │       ├── FinancialReportController.php
│   │   │       ├── InvoiceController.php
│   │   │       ├── LeaseController.php
│   │   │       ├── MaintenanceRequestController.php
│   │   │       ├── MeterReadingController.php
│   │   │       ├── OrganizationController.php
│   │   │       ├── PaymentController.php
│   │   │       ├── PropertyController.php
│   │   │       ├── TenantController.php
│   │   │       ├── TenantPortalController.php
│   │   │       └── UtilityProviderController.php
│   │   ├── Models/
│   │   │   ├── AuditLog.php
│   │   │   ├── Expense.php
│   │   │   ├── Invoice.php
│   │   │   ├── Lease.php
│   │   │   ├── LedgerEntry.php
│   │   │   ├── MaintenanceRequest.php
│   │   │   ├── MeterReading.php
│   │   │   ├── Payment.php
│   │   │   ├── Property.php
│   │   │   ├── Tenant.php
│   │   │   ├── Unit.php
│   │   │   └── UtilityProvider.php
│   │   └── Services/
│   │       ├── AuditLogService.php
│   │       ├── Payment/
│   │       │   ├── PaymentGatewayInterface.php
│   │       │   └── Drivers/MockSSLCommerzDriver.php
│   │       └── Sms/
│   │           ├── SmsGatewayInterface.php
│   │           └── Drivers/MockBDSmsDriver.php
│   ├── database/
│   │   ├── migrations/ (10 domain migrations)
│   │   └── seeders/
│   │       ├── RoleAndPermissionSeeder.php
│   │       └── UtilityProviderSeeder.php
│   └── tests/Feature/ (37 backend PHPUnit tests)
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── (dashboard)/
    │   │   │   ├── dashboard/page.tsx
    │   │   │   ├── expenses/
    │   │   │   ├── financials/
    │   │   │   ├── invoices/ (Directory, Detail, New, Print)
    │   │   │   ├── leases/
    │   │   │   ├── maintenance/
    │   │   │   ├── payments/ (Directory, New, SSLCommerz Checkout)
    │   │   │   ├── properties/
    │   │   │   ├── settings/ (Organization, Members, Audit Logs, Compliance)
    │   │   │   ├── tenants/
    │   │   │   └── utilities/ (Directory, New)
    │   │   └── (tenant-portal)/
    │   │       └── tenant-portal/ (Dashboard, Invoices, Maintenance)
    │   ├── hooks/ (use-auth, use-invoice, use-payment, use-utility, use-tenant-portal, etc.)
    │   ├── lib/ (api, money, validations)
    │   ├── services/ (payment-service, utility-service, tenant-portal-service, etc.)
    │   └── types/index.ts
    └── package.json
```
