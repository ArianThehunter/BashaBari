import api from "@/lib/api";

export interface AuditLogItem {
  id: number;
  organization_id: number;
  user_id: number | null;
  event: string;
  auditable_type: string;
  auditable_id: number;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface AuditLogsResponse {
  data: AuditLogItem[];
  current_page: number;
  last_page: number;
  total: number;
}

export const auditLogService = {
  /**
   * Fetch security audit logs for active organization.
   */
  async getAuditLogs(params?: {
    event?: string;
    search?: string;
    page?: number;
    organization_id?: number | null;
  }): Promise<AuditLogsResponse> {
    const headers = params?.organization_id
      ? { "X-Organization-Id": String(params.organization_id) }
      : undefined;

    const response = await api.get<AuditLogsResponse>("/api/v1/audit-logs", {
      params,
      headers,
    });
    return response.data;
  },
};
