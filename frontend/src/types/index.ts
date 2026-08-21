/**
 * BashaBari — Core TypeScript Type Definitions
 *
 * These types mirror the backend API response shapes.
 * They are the contract between frontend and backend.
 */

// ---- Pagination ----

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
  };
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

// ---- Auth ----

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  platform_role: "user" | "platform_admin";
  is_active: boolean;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  current_organization?: Organization;
  memberships?: OrganizationMember[];
}

// ---- Organization ----

export interface Organization {
  id: number;
  name: string;
  slug: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  status: "trial" | "active" | "suspended" | "cancelled";
  trial_ends_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  id: number;
  user_id: number;
  organization_id: number;
  role_id: number;
  role: Role;
  is_owner: boolean;
  property_access: number[] | null; // null = all properties
  status: "active" | "inactive";
  user?: User;
  organization?: Organization;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: number;
  organization_id: number;
  name: string;
  slug: string;
  is_system: boolean;
  permissions?: Permission[];
}

export interface Permission {
  id: number;
  name: string;
  group_name: string;
  description: string | null;
}

// ---- Property Hierarchy ----

export interface Property {
  id: number;
  organization_id: number;
  name: string;
  address: string | null;
  city: string | null;
  area: string | null;
  description: string | null;
  status: "active" | "inactive";
  buildings_count?: number;
  units_count?: number;
  occupied_units_count?: number;
  buildings?: Building[];
  units?: Unit[];
  created_at: string;
  updated_at: string;
}

export interface Building {
  id: number;
  property_id: number;
  organization_id: number;
  name: string;
  total_floors: number | null;
  floors_count?: number;
  units_count?: number;
  floors?: Floor[];
  units?: Unit[];
  created_at: string;
  updated_at: string;
}

export interface Floor {
  id: number;
  building_id: number;
  organization_id: number;
  name: string;
  floor_number: number;
  units_count?: number;
  units?: Unit[];
  created_at: string;
  updated_at: string;
}

export interface Unit {
  id: number;
  floor_id: number;
  building_id: number;
  property_id: number;
  organization_id: number;
  unit_number: string;
  unit_type: "residential" | "commercial" | "garage" | "storage";
  bedrooms: number | null;
  bathrooms: number | null;
  area_sqft: number | null;
  base_rent_amount: number; // In poisha
  occupancy_status: "vacant" | "occupied" | "maintenance" | "reserved";
  notes: string | null;
  property?: Property;
  building?: Building;
  floor?: Floor;
  current_tenant?: Tenant;
  current_lease?: Lease;
  created_at: string;
  updated_at: string;
}

// ---- Tenant ----

export interface Tenant {
  id: number;
  user_id: number | null;
  organization_id: number;
  name: string;
  phone: string;
  email: string | null;
  nid_number: string | null;
  passport_number: string | null;
  father_name: string | null;
  permanent_address: string | null;
  occupation: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  emergency_contact_relation: string | null;
  documents: Record<string, unknown> | null;
  status: "active" | "inactive" | "archived";
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

// ---- Lease ----

export interface Lease {
  id: number;
  tenant_id: number;
  unit_id: number;
  organization_id: number;
  start_date: string; // DATE: YYYY-MM-DD
  end_date: string;
  rent_amount: number; // In poisha
  billing_frequency?: "monthly";
  security_deposit: number; // In poisha
  advance_rent: number; // In poisha
  billing_day: number; // 1-31
  rent_due_day?: number; // 1-28
  grace_period_days?: number;
  status: "active" | "pending" | "expired" | "terminated" | "draft" | "renewed";
  previous_lease_id?: number | null;
  terms_and_conditions?: string | null;
  terms?: string | null;
  terminated_at?: string | null;
  termination_reason?: string | null;
  tenant?: Tenant;
  unit?: Unit;
  created_at: string;
  updated_at: string;
}

// ---- Invoice ----

export interface Invoice {
  id: number;
  invoice_number: string;
  tenant_id: number;
  lease_id?: number | null;
  unit_id?: number | null;
  organization_id: number;
  billing_period_month: number;
  billing_period_year: number;
  billing_month?: string;
  issue_date: string;
  due_date: string;
  subtotal_amount: number; // poisha
  tax_amount: number; // poisha
  late_fee_amount: number; // poisha
  total_amount: number; // poisha
  paid_amount: number; // poisha
  due_amount: number; // poisha
  status: "draft" | "unpaid" | "partially_paid" | "paid" | "overdue" | "cancelled";
  notes?: string | null;
  items?: InvoiceItem[];
  organization?: Organization;
  tenant?: Tenant;
  lease?: Lease;
  unit?: Unit;
  created_at: string;
  updated_at: string;
}

export interface InvoiceItem {
  id: number;
  invoice_id: number;
  description: string;
  quantity: number;
  unit_amount: number; // poisha
  amount?: number; // poisha
  total_amount: number; // poisha
  created_at?: string;
  updated_at?: string;
}

export interface Payment {
  id: number;
  transaction_number: string; // tran_id
  val_id?: string | null;
  bank_tran_id?: string | null;
  payment_method: "sslcommerz" | "bkash" | "nagad" | "rocket" | "bank_transfer" | "cash" | "cheque";
  card_type?: string | null;
  card_no?: string | null;
  amount: number; // poisha
  store_amount?: number; // poisha
  currency?: string;
  payment_date: string;
  status: "completed" | "pending" | "refunded" | "failed" | "cancelled";
  reference_number?: string | null;
  notes?: string | null;
  tenant_id: number;
  invoice_id?: number | null;
  unit_id?: number | null;
  organization_id: number;
  tenant?: Tenant;
  invoice?: Invoice;
  unit?: Unit;
  created_at: string;
  updated_at: string;
}

// ---- Receipt ----

export interface Receipt {
  id: number;
  receipt_number: string;
  payment_id: number;
  tenant_id: number;
  organization_id: number;
  amount: number; // poisha
  receipt_date: string; // DATE
  pdf_path: string | null;
  payment?: Payment;
  tenant?: Tenant;
  created_at: string;
  updated_at: string;
}

// ---- Expense ----

// ---- Expense ----

export interface Expense {
  id: number;
  expense_number: string; // EXP-YYYYMM-XXX
  organization_id: number;
  property_id?: number | null;
  unit_id?: number | null;
  maintenance_request_id?: number | null;
  category: string;
  amount: number; // poisha
  expense_date: string;
  vendor_name?: string | null;
  payment_method: string;
  receipt_reference?: string | null;
  notes?: string | null;
  property?: Property;
  unit?: Unit;
  maintenanceRequest?: MaintenanceRequest;
  created_at: string;
  updated_at: string;
}

// ---- Maintenance ----

export interface MaintenanceRequest {
  id: number;
  organization_id: number;
  property_id: number;
  building_id?: number | null;
  unit_id?: number | null;
  tenant_id?: number | null;
  reported_by_user_id: number;
  title: string;
  description: string;
  category: "plumbing" | "electrical" | "painting" | "elevator" | "cleaning" | "repairs" | "other" | string;
  priority: "low" | "medium" | "high" | "emergency";
  status: "pending" | "in_progress" | "completed" | "cancelled";
  estimated_cost_amount: number; // poisha
  actual_cost_amount: number; // poisha
  assigned_vendor_name?: string | null;
  assigned_vendor_phone?: string | null;
  is_escalated_to_owner?: boolean;
  escalated_by?: string | null;
  escalation_reason?: string | null;
  resolved_at?: string | null;
  property?: Property;
  building?: Building;
  unit?: Unit;
  tenant?: Tenant;
  reporter?: User;
  expenses?: Expense[];
  created_at: string;
  updated_at: string;
}

export interface MaintenanceComment {
  id: number;
  maintenance_request_id: number;
  user_id: number;
  comment: string;
  is_internal: boolean;
  user?: User;
  created_at: string;
}

// ---- Meter ----

export interface Meter {
  id: number;
  unit_id: number;
  organization_id: number;
  meter_type: string;
  meter_identifier: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MeterReading {
  id: number;
  meter_id: number;
  previous_reading: number;
  current_reading: number;
  consumption: number;
  reading_date: string; // DATE
  recorded_by: number;
  evidence_path: string | null;
  created_at: string;
}

// ---- Notification ----

export interface Notification {
  id: string;
  type: string;
  data: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
}

// ---- Audit Log ----

export interface AuditLog {
  id: number;
  organization_id: number | null;
  user_id: number;
  action: string;
  auditable_type: string;
  auditable_id: number;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
  user?: User;
}
