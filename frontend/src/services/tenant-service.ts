import api from "@/lib/api";
import type { TenantInput } from "@/lib/validations/tenant";
import type { Tenant } from "@/types";

export const tenantService = {
  /**
   * Fetch tenants for active organization with search & status filters.
   */
  async getTenants(params?: {
    search?: string;
    status?: string;
    organization_id?: number | null;
  }): Promise<Tenant[]> {
    const headers = params?.organization_id
      ? { "X-Organization-Id": String(params.organization_id) }
      : undefined;

    const response = await api.get<{ data: Tenant[] }>("/api/v1/tenants", {
      params,
      headers,
    });
    return response.data.data;
  },

  /**
   * Create a new tenant profile.
   */
  async createTenant(data: TenantInput, organizationId?: number | null): Promise<Tenant> {
    const headers = organizationId ? { "X-Organization-Id": String(organizationId) } : undefined;
    const response = await api.post<{ data: Tenant }>("/api/v1/tenants", data, { headers });
    return response.data.data;
  },

  /**
   * Fetch tenant profile details.
   */
  async getTenant(id: number): Promise<Tenant> {
    const response = await api.get<{ data: Tenant }>(`/api/v1/tenants/${id}`);
    return response.data.data;
  },

  /**
   * Update tenant profile.
   */
  async updateTenant(id: number, data: TenantInput): Promise<Tenant> {
    const response = await api.put<{ data: Tenant }>(`/api/v1/tenants/${id}`, data);
    return response.data.data;
  },

  /**
   * Soft-delete tenant profile.
   */
  async deleteTenant(id: number): Promise<void> {
    await api.delete(`/api/v1/tenants/${id}`);
  },
};
