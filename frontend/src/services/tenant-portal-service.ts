import api from "@/lib/api";
import type { Invoice, Lease, MaintenanceRequest, Tenant } from "@/types";

export interface TenantPortalOverview {
  tenant: Tenant;
  active_lease: Lease | null;
  unpaid_invoices_count: number;
  total_due_poisha: number;
  open_maintenance_tickets_count: number;
}

export const tenantPortalService = {
  /**
   * Fetch authenticated tenant overview.
   */
  async getOverview(): Promise<TenantPortalOverview> {
    const response = await api.get<TenantPortalOverview>("/api/v1/tenant-portal/overview");
    return response.data;
  },

  /**
   * Fetch tenant invoices.
   */
  async getInvoices(): Promise<Invoice[]> {
    const response = await api.get<{ data: Invoice[] }>("/api/v1/tenant-portal/invoices");
    return response.data.data;
  },

  /**
   * Fetch tenant maintenance tickets.
   */
  async getMaintenanceTickets(): Promise<MaintenanceRequest[]> {
    const response = await api.get<{ data: MaintenanceRequest[] }>("/api/v1/tenant-portal/maintenance");
    return response.data.data;
  },
};
