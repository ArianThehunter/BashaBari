export type StaffRole =
  | "caretaker"
  | "security_guard"
  | "guard_caretaker_dual"
  | "caretaker_guard_dual"
  | "bariwala_manager";

export type EmploymentType = "direct_employed" | "agency_contracted";

export type ShiftType = "day_shift" | "night_shift" | "24h_duty" | "rotation";

export interface StaffDutyLog {
  id: number;
  building_staff_id: number;
  action_type: string;
  previous_role?: string;
  new_role?: string;
  amount_paid?: number;
  payment_method?: string;
  voucher_number?: string;
  notes?: string;
  created_at: string;
}

export interface BuildingStaff {
  id: number;
  organization_id: number;
  property_id: number;
  building_id?: number;
  user_id?: number;
  name: string;
  phone: string;
  nid_number?: string;
  is_caretaker: boolean;
  is_security_guard: boolean;
  is_agency_contracted: boolean;
  is_owner_manager: boolean;
  staff_role: StaffRole;
  employment_type: EmploymentType;
  agency_name?: string;
  shift_type: ShiftType;
  shift_hours: string;
  monthly_salary: number; // Stored in poisha
  status: "active" | "on_leave" | "rotated_out" | "resigned" | "terminated";
  joining_date?: string;
  notes?: string;
  duty_logs?: StaffDutyLog[];
  property?: {
    id: number;
    name: string;
  };
  building?: {
    id: number;
    name: string;
  };
}

export interface VendorVisitLog {
  id: number;
  organization_id: number;
  property_id: number;
  building_id?: number;
  recorded_by_staff_id?: number;
  technician_name: string;
  technician_phone: string;
  company_name?: string;
  service_category:
    | "plumbing"
    | "electrical"
    | "elevator"
    | "tank_cleaning"
    | "generator"
    | "painting"
    | "pest_control"
    | "other";
  entry_time: string;
  exit_time?: string;
  purpose_of_visit: string;
  amount_paid: number; // Poisha
  payment_method?: string;
  receipt_reference?: string;
  status: "in_progress" | "completed" | "cancelled";
  created_at: string;
  property?: {
    id: number;
    name: string;
  };
  recorded_by_staff?: {
    id: number;
    name: string;
    staff_role: string;
  };
}
