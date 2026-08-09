import api from "@/lib/api";
import type { MaintenanceRequestInput } from "@/lib/validations/maintenance";
import type { MaintenanceRequest } from "@/types";

export interface MaintenanceRequestsResponse {
  data: MaintenanceRequest[];
  meta: {
    total_tickets: number;
    pending_count: number;
    in_progress_count: number;
    emergency_count: number;
  };
}

export const maintenanceService = {
  /**
   * Fetch maintenance tickets for active organization.
   */
  async getMaintenanceRequests(params?: {
    status?: string;
    priority?: string;
    category?: string;
    search?: string;
    organization_id?: number | null;
  }): Promise<MaintenanceRequestsResponse> {
    const headers = params?.organization_id
      ? { "X-Organization-Id": String(params.organization_id) }
      : undefined;

    const response = await api.get<MaintenanceRequestsResponse>(
      "/api/v1/maintenance-requests",
      { params, headers },
    );
    return response.data;
  },

  /**
   * Create maintenance ticket.
   */
  async createMaintenanceRequest(
    data: MaintenanceRequestInput,
    organizationId?: number | null,
  ): Promise<MaintenanceRequest> {
    const headers = organizationId ? { "X-Organization-Id": String(organizationId) } : undefined;
    const response = await api.post<{ data: MaintenanceRequest }>(
      "/api/v1/maintenance-requests",
      data,
      { headers },
    );
    return response.data.data;
  },

  /**
   * Update maintenance ticket status / vendor.
   */
  async updateMaintenanceRequest(
    id: number,
    data: Partial<{
      status: string;
      priority: string;
      actual_cost_bdt: number;
      assigned_vendor_name: string;
      assigned_vendor_phone: string;
    }>,
  ): Promise<MaintenanceRequest> {
    const response = await api.put<{ data: MaintenanceRequest }>(
      `/api/v1/maintenance-requests/${id}`,
      data,
    );
    return response.data.data;
  },

  /**
   * Delete maintenance request.
   */
  async deleteMaintenanceRequest(id: number): Promise<void> {
    await api.delete(`/api/v1/maintenance-requests/${id}`);
  },
};
