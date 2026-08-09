"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { tenantService } from "@/services/tenant-service";
import type { TenantInput } from "@/lib/validations/tenant";
import type { Tenant } from "@/types";
import { getApiErrorMessage } from "@/lib/api";

export function useTenants(params?: {
  search?: string;
  status?: string;
  organization_id?: number | null;
}) {
  const queryClient = useQueryClient();
  const tenantsQueryKey = ["tenants", params];

  const {
    data: tenants = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<Tenant[]>({
    queryKey: tenantsQueryKey,
    queryFn: () => tenantService.getTenants(params),
    enabled: !!params?.organization_id,
  });

  const createTenantMutation = useMutation({
    mutationFn: (data: TenantInput) => tenantService.createTenant(data, params?.organization_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
    },
  });

  const deleteTenantMutation = useMutation({
    mutationFn: (id: number) => tenantService.deleteTenant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
    },
  });

  return {
    tenants,
    isLoading,
    isError,
    refetchTenants: refetch,

    createTenant: createTenantMutation.mutateAsync,
    isCreatingTenant: createTenantMutation.isPending,
    createTenantError: createTenantMutation.error
      ? getApiErrorMessage(createTenantMutation.error)
      : null,

    deleteTenant: deleteTenantMutation.mutateAsync,
    isDeletingTenant: deleteTenantMutation.isPending,
  };
}

export function useTenantDetail(tenantId: number | null) {
  const queryClient = useQueryClient();
  const tenantQueryKey = ["tenant", tenantId];

  const {
    data: tenant = null,
    isLoading,
    isError,
    refetch,
  } = useQuery<Tenant | null>({
    queryKey: tenantQueryKey,
    queryFn: () => (tenantId ? tenantService.getTenant(tenantId) : null),
    enabled: !!tenantId,
  });

  const updateTenantMutation = useMutation({
    mutationFn: (data: TenantInput) => {
      if (!tenantId) throw new Error("Tenant ID required");
      return tenantService.updateTenant(tenantId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantQueryKey });
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
    },
  });

  return {
    tenant,
    isLoading,
    isError,
    refetchTenant: refetch,

    updateTenant: updateTenantMutation.mutateAsync,
    isUpdatingTenant: updateTenantMutation.isPending,
    updateTenantError: updateTenantMutation.error
      ? getApiErrorMessage(updateTenantMutation.error)
      : null,
  };
}
