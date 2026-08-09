/**
 * Date and time formatting utilities for Bariwala Hub.
 *
 * Strategy:
 * - Timestamps from the API are always UTC (ISO 8601).
 * - Business dates (rent due, lease dates) are DATE strings (YYYY-MM-DD).
 * - All display conversions use Asia/Dhaka timezone.
 */

const TIMEZONE = "Asia/Dhaka";
const LOCALE = "en-BD";

// ---- Timestamp Formatting (UTC → Asia/Dhaka) ----

/**
 * Format a UTC timestamp for display in Bangladesh local time.
 * Input: ISO 8601 UTC string (e.g., "2025-01-15T10:30:00Z")
 * Output: Localized date+time string (e.g., "Jan 15, 2025, 4:30 PM")
 */
export function formatDateTime(utcIso: string): string {
  return new Intl.DateTimeFormat(LOCALE, {
    timeZone: TIMEZONE,
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(utcIso));
}

/**
 * Format a UTC timestamp showing only the date part in local time.
 */
export function formatDateTimeAsDate(utcIso: string): string {
  return new Intl.DateTimeFormat(LOCALE, {
    timeZone: TIMEZONE,
    dateStyle: "medium",
  }).format(new Date(utcIso));
}

/**
 * Format a UTC timestamp as a relative time (e.g., "2 hours ago").
 */
export function formatRelativeTime(utcIso: string): string {
  const now = new Date();
  const date = new Date(utcIso);
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return formatDateTimeAsDate(utcIso);
}

// ---- Business Date Formatting (No timezone conversion) ----

/**
 * Format a business date (YYYY-MM-DD) for display.
 * These dates are timezone-agnostic (e.g., rent due date, lease start).
 * Input: "2025-01-15"
 * Output: "Jan 15, 2025"
 */
export function formatDate(dateStr: string): string {
  // Parse as local date to avoid timezone shift
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return new Intl.DateTimeFormat(LOCALE, {
    dateStyle: "medium",
  }).format(date);
}

/**
 * Format a business date for form inputs (YYYY-MM-DD).
 */
export function toInputDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Get the current date in Asia/Dhaka timezone as YYYY-MM-DD.
 */
export function todayInDhaka(): string {
  const now = new Date();
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
  }).format(now); // en-CA gives YYYY-MM-DD format
}

// ---- Billing Period Helpers ----

/**
 * Get the billing period label for a given start/end date.
 * Input: "2025-01-01", "2025-01-31"
 * Output: "January 2025"
 */
export function formatBillingPeriod(startDate: string): string {
  const [year, month] = startDate.split("-").map(Number);
  const date = new Date(year, month - 1, 1);

  return new Intl.DateTimeFormat(LOCALE, {
    month: "long",
    year: "numeric",
  }).format(date);
}
