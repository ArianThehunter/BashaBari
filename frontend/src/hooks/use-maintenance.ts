"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { maintenanceService, type MaintenanceRequestsResponse } from "@/services/maintenance-service";
import type { MaintenanceRequestInput } from "@/lib/validations/maintenance";
import { getApiErrorMessage } from "@/lib/api";

export function useMaintenanceRequests(params?: {
  status?: string;
  priority?: string;
  category?: string;
  search?: string;
  organization_id?: number | null;
}) {
  const queryClient = useQueryClient();
  const maintenanceQueryKey = ["maintenance-requests", params];

  const {
    data = {
      data: [],
      meta: { total_tickets: 0, pending_count: 0, in_progress_count: 0, emergency_count: 0 },
    },
    isLoading,
    isError,
    refetch,
  } = useQuery<MaintenanceRequestsResponse>({
    queryKey: maintenanceQueryKey,
    queryFn: () => maintenanceService.getMaintenanceRequests(params),
    enabled: !!params?.organization_id,
  });

  const createMaintenanceRequestMutation = useMutation({
    mutationFn: (input: MaintenanceRequestInput) =>
      maintenanceService.createMaintenanceRequest(input, params?.organization_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance-requests"] });
    },
  });

  const updateMaintenanceRequestMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<{
        status: string;
        priority: string;
        actual_cost_bdt: number;
        assigned_vendor_name: string;
        assigned_vendor_phone: string;
      }>;
    }) => maintenanceService.updateMaintenanceRequest(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance-requests"] });
    },
  });

  return {
    tickets: data.data,
    meta: data.meta,
    isLoading,
    isError,
    refetchTickets: refetch,

    createMaintenanceRequest: createMaintenanceRequestMutation.mutateAsync,
    isCreatingTicket: createMaintenanceRequestMutation.isPending,
    createTicketError: createMaintenanceRequestMutation.error
      ? getApiErrorMessage(createMaintenanceRequestMutation.error)
      : null,

    updateMaintenanceRequest: updateMaintenanceRequestMutation.mutateAsync,
    isUpdatingTicket: updateMaintenanceRequestMutation.isPending,
  };
}
