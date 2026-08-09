# Bariwala Hub — Timezone Strategy

## Policy

| Context | Timezone | Format |
|---------|----------|--------|
| Database server | UTC | — |
| Laravel `config('app.timezone')` | `UTC` | — |
| All `TIMESTAMPTZ` columns | UTC | ISO 8601 |
| Business dates (rent due, lease start/end) | `DATE` type | `YYYY-MM-DD` (timezone-agnostic) |
| API responses (timestamps) | UTC | ISO 8601: `2025-01-15T10:30:00Z` |
| Frontend display | `Asia/Dhaka` (UTC+6) | Localized format |
| Laravel Scheduler | UTC internally, cron entries adjusted if needed | — |
| Queue job timestamps | UTC | — |

## Rules

1. **Store in UTC.** All `created_at`, `updated_at`, `deleted_at`, and event timestamps are stored as UTC.

2. **Business dates are DATE, not TIMESTAMP.** Rent due dates, lease start/end dates, billing periods, and payment dates are stored as `DATE` type. A rent due date of `2025-01-15` means January 15 in the business context — it has no timezone component.

3. **Convert at the boundary.** UTC-to-local conversion happens ONLY at:
   - Frontend display layer (JavaScript `Intl.DateTimeFormat` or `date-fns-tz`)
   - Notification content generation (email/WhatsApp bodies)
   - PDF generation (invoice/receipt display dates)

4. **Never mix timezones in calculations.** When comparing "is this invoice overdue?", compare the business date against the current date in `Asia/Dhaka`.

5. **API always returns UTC.** All timestamp fields in API responses are ISO 8601 UTC. The frontend is responsible for display conversion.

## PostgreSQL Configuration

```sql
-- Ensure server timezone is UTC
ALTER SYSTEM SET timezone = 'UTC';
SELECT pg_reload_conf();

-- Verify
SHOW timezone; -- Should return 'UTC'
```

## Laravel Configuration

```php
// config/app.php
'timezone' => 'UTC',

// When you need Bangladesh local time in backend code:
use Carbon\Carbon;
$localTime = Carbon::now('Asia/Dhaka');
$localDate = Carbon::today('Asia/Dhaka');
```

## Frontend Helper

```typescript
// lib/date.ts
const TIMEZONE = 'Asia/Dhaka';

export function formatDateTime(utcIso: string): string {
  return new Intl.DateTimeFormat('en-BD', {
    timeZone: TIMEZONE,
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(utcIso));
}

export function formatDate(dateStr: string): string {
  // For DATE fields (no timezone conversion needed)
  return new Intl.DateTimeFormat('en-BD', {
    dateStyle: 'medium',
  }).format(new Date(dateStr + 'T00:00:00'));
}
```

## Critical Edge Cases

### Monthly billing boundary

When generating invoices for "January 2025", the billing period is:
- Start: `2025-01-01` (DATE)
- End: `2025-01-31` (DATE)

The generation timestamp is a UTC TIMESTAMPTZ. The billing period dates are timezone-agnostic.

### Scheduled jobs

The Laravel scheduler runs in UTC. If a job needs to run at midnight Bangladesh time:

```php
// This runs at 00:00 Asia/Dhaka = 18:00 UTC (previous day)
$schedule->command('invoices:generate')->dailyAt('18:00');
```

### "Today" in business context

When checking "is today the rent due date?", use Bangladesh local date:

```php
$today = Carbon::today('Asia/Dhaka');
$isDue = $lease->rent_due_date->isSameDay($today);
```
