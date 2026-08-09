import api from "@/lib/api";
import type { VendorVisitLog } from "@/types/staff";

export interface CreateVendorVisitInput {
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
  amount_paid?: number;
  payment_method?: "cash" | "bkash" | "nagad" | "bank_transfer" | "cheque";
  receipt_reference?: string;
}

export const vendorLogService = {
  async getVendorLogs(propertyId?: number): Promise<VendorVisitLog[]> {
    const response = await api.get<{ data: VendorVisitLog[] }>("/api/v1/vendor-visit-logs", {
      params: { property_id: propertyId },
    });
    return response.data.data;
  },

  async createVendorLog(input: CreateVendorVisitInput): Promise<VendorVisitLog> {
    const response = await api.post<{ data: VendorVisitLog }>("/api/v1/vendor-visit-logs", input);
    return response.data.data;
  },
};
