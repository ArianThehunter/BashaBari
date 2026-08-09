"use client";

import { useQuery } from "@tanstack/react-query";
import { tenantPortalService, type TenantPortalOverview } from "@/services/tenant-portal-service";
import type { Invoice, MaintenanceRequest } from "@/types";

export function useTenantOverview() {
  const {
    data = null,
    isLoading,
    isError,
    refetch,
  } = useQuery<TenantPortalOverview | null>({
    queryKey: ["tenant-portal-overview"],
    queryFn: () => tenantPortalService.getOverview(),
  });

  return {
    overview: data,
    isLoading,
    isError,
    refetchOverview: refetch,
  };
}

export function useTenantInvoices() {
  const {
    data: invoices = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<Invoice[]>({
    queryKey: ["tenant-portal-invoices"],
    queryFn: () => tenantPortalService.getInvoices(),
  });

  return {
    invoices,
    isLoading,
    isError,
    refetchInvoices: refetch,
  };
}

export function useTenantMaintenance() {
  const {
    data: tickets = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<MaintenanceRequest[]>({
    queryKey: ["tenant-portal-maintenance"],
    queryFn: () => tenantPortalService.getMaintenanceTickets(),
  });

  return {
    tickets,
    isLoading,
    isError,
    refetchTickets: refetch,
  };
}
