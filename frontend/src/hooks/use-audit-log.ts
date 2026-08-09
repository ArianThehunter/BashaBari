"use client";

import { useQuery } from "@tanstack/react-query";
import { auditLogService, type AuditLogsResponse } from "@/services/audit-log-service";

export function useAuditLogs(params?: {
  event?: string;
  search?: string;
  page?: number;
  organization_id?: number | null;
}) {
  const auditLogsQueryKey = ["audit-logs", params];

  const {
    data = {
      data: [],
      current_page: 1,
      last_page: 1,
      total: 0,
    },
    isLoading,
    isError,
    refetch,
  } = useQuery<AuditLogsResponse>({
    queryKey: auditLogsQueryKey,
    queryFn: () => auditLogService.getAuditLogs(params),
    enabled: !!params?.organization_id,
  });

  return {
    logs: data.data,
    meta: {
      current_page: data.current_page,
      last_page: data.last_page,
      total: data.total,
    },
    isLoading,
    isError,
    refetchLogs: refetch,
  };
}
