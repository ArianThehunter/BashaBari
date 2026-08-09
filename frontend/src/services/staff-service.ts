import api from "@/lib/api";
import type { BuildingStaff } from "@/types/staff";

export interface CreateStaffInput {
  property_id: number;
  building_id?: number;
  name: string;
  phone: string;
  nid_number?: string;
  is_caretaker: boolean;
  is_security_guard: boolean;
  is_agency_contracted?: boolean;
  is_owner_manager?: boolean;
  employment_type: "direct_employed" | "agency_contracted";
  agency_name?: string;
  shift_type: "day_shift" | "night_shift" | "24h_duty" | "rotation";
  shift_hours?: string;
  monthly_salary: number; // Poisha
  joining_date?: string;
  notes?: string;
}

export interface PaySalaryInput {
  amount: number; // Poisha
  payment_method: "cash" | "bkash" | "nagad" | "bank_transfer" | "cheque";
  notes?: string;
}

export const staffService = {
  async getStaffList(propertyId?: number): Promise<BuildingStaff[]> {
    const response = await api.get<{ data: BuildingStaff[] }>("/api/v1/building-staff", {
      params: { property_id: propertyId },
    });
    return response.data.data;
  },

  async getStaff(id: number): Promise<BuildingStaff> {
    const response = await api.get<{ data: BuildingStaff }>(`/api/v1/building-staff/${id}`);
    return response.data.data;
  },

  async createStaff(input: CreateStaffInput): Promise<BuildingStaff> {
    const response = await api.post<{ data: BuildingStaff }>("/api/v1/building-staff", input);
    return response.data.data;
  },

  async updateStaff(id: number, input: Partial<CreateStaffInput>): Promise<BuildingStaff> {
    const response = await api.put<{ data: BuildingStaff }>(`/api/v1/building-staff/${id}`, input);
    return response.data.data;
  },

  async deleteStaff(id: number): Promise<void> {
    await api.delete(`/api/v1/building-staff/${id}`);
  },

  async paySalary(id: number, input: PaySalaryInput): Promise<{ voucher_number: string }> {
    const response = await api.post<{ voucher_number: string }>(
      `/api/v1/building-staff/${id}/pay-salary`,
      input
    );
    return response.data;
  },
};
