import api from "@/lib/api";
import { bdtToPoisha } from "@/lib/money";
import type { LeaseInput, TerminateLeaseInput } from "@/lib/validations/lease";
import type { Lease } from "@/types";

export interface LeasesResponse {
  data: Lease[];
  meta: {
    total_rent_roll_poisha: number;
    active_leases_count: number;
  };
}

export const leaseService = {
  /**
   * Fetch leases for active organization.
   */
  async getLeases(params?: {
    status?: string;
    unit_id?: number;
    tenant_id?: number;
    organization_id?: number | null;
  }): Promise<LeasesResponse> {
    const headers = params?.organization_id
      ? { "X-Organization-Id": String(params.organization_id) }
      : undefined;

    const response = await api.get<LeasesResponse>("/api/v1/leases", {
      params,
      headers,
    });
    return response.data;
  },

  /**
   * Create digital lease agreement (converts BDT to integer poisha).
   */
  async createLease(data: LeaseInput, organizationId?: number | null): Promise<Lease> {
    const headers = organizationId ? { "X-Organization-Id": String(organizationId) } : undefined;
    const payload = {
      unit_id: data.unit_id,
      tenant_id: data.tenant_id,
      start_date: data.start_date,
      end_date: data.end_date,
      rent_amount: bdtToPoisha(data.rent_amount_bdt),
      security_deposit: bdtToPoisha(data.security_deposit_bdt || 0),
      advance_rent: bdtToPoisha(data.advance_rent_bdt || 0),
      billing_day: data.billing_day,
      terms_and_conditions: data.terms_and_conditions,
    };

    const response = await api.post<{ data: Lease }>("/api/v1/leases", payload, { headers });
    return response.data.data;
  },

  /**
   * Fetch single lease contract details.
   */
  async getLease(id: number): Promise<Lease> {
    const response = await api.get<{ data: Lease }>(`/api/v1/leases/${id}`);
    return response.data.data;
  },

  /**
   * Terminate lease agreement (auto-resets unit to vacant).
   */
  async terminateLease(id: number, data: TerminateLeaseInput): Promise<Lease> {
    const response = await api.post<{ data: Lease }>(`/api/v1/leases/${id}/terminate`, data);
    return response.data.data;
  },

  /**
   * Soft-delete lease contract.
   */
  async deleteLease(id: number): Promise<void> {
    await api.delete(`/api/v1/leases/${id}`);
  },
};
