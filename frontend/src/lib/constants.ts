/**
 * Application-wide constants for Bariwala Hub.
 */

// ---- Application ----
export const APP_NAME = "BashaBari";
export const APP_DESCRIPTION =
  "All-in-one property, flat, rent, caretaker, and tenant operations platform for Bangladesh (বাসাবাড়ি)";

// ---- Locale ----
export const TIMEZONE = "Asia/Dhaka";
export const LOCALE = "en-BD";
export const CURRENCY = "BDT";
export const CURRENCY_SYMBOL = "৳";

// ---- Tenant Lifecycle States ----
export const TENANT_STATUSES = [
  "prospect",
  "application",
  "approved",
  "active",
  "notice_given",
  "vacating",
  "vacated",
  "archived",
] as const;

export type TenantStatus = (typeof TENANT_STATUSES)[number];

// ---- Lease Statuses ----
export const LEASE_STATUSES = [
  "draft",
  "active",
  "renewed",
  "terminated",
  "expired",
] as const;

export type LeaseStatus = (typeof LEASE_STATUSES)[number];

// ---- Invoice Statuses ----
export const INVOICE_STATUSES = [
  "draft",
  "sent",
  "partially_paid",
  "paid",
  "overdue",
  "cancelled",
  "void",
] as const;

export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

// ---- Payment Methods ----
export const PAYMENT_METHODS = [
  "cash",
  "bkash",
  "nagad",
  "rocket",
  "upay",
  "bank_transfer",
  "other",
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "Cash",
  bkash: "bKash",
  nagad: "Nagad",
  rocket: "Rocket",
  upay: "Upay",
  bank_transfer: "Bank Transfer",
  other: "Other",
};

// ---- Payment Types ----
export const PAYMENT_TYPES = [
  "payment",
  "advance",
  "deposit",
  "refund",
] as const;

export type PaymentType = (typeof PAYMENT_TYPES)[number];

// ---- Unit Types ----
export const UNIT_TYPES = [
  "residential",
  "commercial",
  "garage",
  "storage",
] as const;

export type UnitType = (typeof UNIT_TYPES)[number];

// ---- Occupancy Statuses ----
export const OCCUPANCY_STATUSES = [
  "vacant",
  "occupied",
  "maintenance",
  "reserved",
] as const;

export type OccupancyStatus = (typeof OCCUPANCY_STATUSES)[number];

// ---- Maintenance ----
export const MAINTENANCE_CATEGORIES = [
  "plumbing",
  "electrical",
  "structural",
  "appliance",
  "pest",
  "cleaning",
  "other",
] as const;

export type MaintenanceCategory = (typeof MAINTENANCE_CATEGORIES)[number];

export const MAINTENANCE_PRIORITIES = [
  "low",
  "medium",
  "high",
  "urgent",
] as const;

export type MaintenancePriority = (typeof MAINTENANCE_PRIORITIES)[number];

export const MAINTENANCE_STATUSES = [
  "open",
  "assigned",
  "in_progress",
  "waiting",
  "completed",
  "cancelled",
] as const;

export type MaintenanceStatus = (typeof MAINTENANCE_STATUSES)[number];

// ---- Expense Approval ----
export const APPROVAL_STATUSES = [
  "pending",
  "approved",
  "rejected",
] as const;

export type ApprovalStatus = (typeof APPROVAL_STATUSES)[number];

// ---- Organization Statuses ----
export const ORGANIZATION_STATUSES = [
  "trial",
  "active",
  "suspended",
  "cancelled",
] as const;

export type OrganizationStatus = (typeof ORGANIZATION_STATUSES)[number];

// ---- Roles ----
export const ORGANIZATION_ROLES = [
  "owner",
  "caretaker",
  "accountant",
  "tenant",
] as const;

export type OrganizationRole = (typeof ORGANIZATION_ROLES)[number];

export const PLATFORM_ROLES = ["user", "platform_admin"] as const;

export type PlatformRole = (typeof PLATFORM_ROLES)[number];

// ---- Subscription Pricing ----
export const SUBSCRIPTION_PLANS = [
  {
    id: "standard",
    name: "Standard Plan (স্ট্যান্ডার্ড)",
    price_bdt: 999,
    price_poisha: 99900,
    description: "Ideal for individual building owners & caretakers (up to 25 flats)",
    features: [
      "Up to 25 Units / Flats",
      "Automated Rent Invoices & E-Receipts",
      "Sub-Meter Utility Logging (DPDC, WASA)",
      "Tenant Complaints & Technician Register",
      "Cash & bKash/Nagad Payment Tracking",
    ],
  },
  {
    id: "premium",
    name: "Premium Plan (প্রিমিয়াম)",
    price_bdt: 1499,
    price_poisha: 149900,
    description: "Multi-property portfolios & property management caretakers",
    features: [
      "Unlimited Units & Multi-Building Support",
      "Multi-Seat Caretaker & Guard Staff Access",
      "3-Day Advance Scheduled Maintenance Broadcasts",
      "Tenant Move-Out Departure Portal Notices",
      "Double-Entry General Ledger & Cash Flow Reports",
      "Premises Rent Control Act 1992 Compliance",
    ],
  },
] as const;

