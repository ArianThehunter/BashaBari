"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { leaseService, type LeasesResponse } from "@/services/lease-service";
import type { LeaseInput, TerminateLeaseInput } from "@/lib/validations/lease";
import type { Lease } from "@/types";
import { getApiErrorMessage } from "@/lib/api";

export function useLeases(params?: {
  status?: string;
  unit_id?: number;
  tenant_id?: number;
  organization_id?: number | null;
}) {
  const queryClient = useQueryClient();
  const leasesQueryKey = ["leases", params];

  const {
    data = { data: [], meta: { total_rent_roll_poisha: 0, active_leases_count: 0 } },
    isLoading,
    isError,
    refetch,
  } = useQuery<LeasesResponse>({
    queryKey: leasesQueryKey,
    queryFn: () => leaseService.getLeases(params),
    enabled: !!params?.organization_id,
  });

  const createLeaseMutation = useMutation({
    mutationFn: (input: LeaseInput) => leaseService.createLease(input, params?.organization_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leases"] });
      queryClient.invalidateQueries({ queryKey: ["units"] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });

  return {
    leases: data.data,
    meta: data.meta,
    isLoading,
    isError,
    refetchLeases: refetch,

    createLease: createLeaseMutation.mutateAsync,
    isCreatingLease: createLeaseMutation.isPending,
    createLeaseError: createLeaseMutation.error
      ? getApiErrorMessage(createLeaseMutation.error)
      : null,
  };
}

export function useLeaseDetail(leaseId: number | null) {
  const queryClient = useQueryClient();
  const leaseQueryKey = ["lease", leaseId];

  const {
    data: lease = null,
    isLoading,
    isError,
    refetch,
  } = useQuery<Lease | null>({
    queryKey: leaseQueryKey,
    queryFn: () => (leaseId ? leaseService.getLease(leaseId) : null),
    enabled: !!leaseId,
  });

  const terminateLeaseMutation = useMutation({
    mutationFn: (input: TerminateLeaseInput) => {
      if (!leaseId) throw new Error("Lease ID required");
      return leaseService.terminateLease(leaseId, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaseQueryKey });
      queryClient.invalidateQueries({ queryKey: ["leases"] });
      queryClient.invalidateQueries({ queryKey: ["units"] });
    },
  });

  return {
    lease,
    isLoading,
    isError,
    refetchLease: refetch,

    terminateLease: terminateLeaseMutation.mutateAsync,
    isTerminatingLease: terminateLeaseMutation.isPending,
    terminateLeaseError: terminateLeaseMutation.error
      ? getApiErrorMessage(terminateLeaseMutation.error)
      : null,
  };
}
