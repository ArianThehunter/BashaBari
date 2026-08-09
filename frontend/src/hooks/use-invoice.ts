"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { invoiceService, type InvoicesResponse } from "@/services/invoice-service";
import type { GenerateInvoicesInput, InvoiceInput } from "@/lib/validations/invoice";
import type { Invoice } from "@/types";
import { getApiErrorMessage } from "@/lib/api";

export function useInvoices(params?: {
  status?: string;
  search?: string;
  organization_id?: number | null;
}) {
  const queryClient = useQueryClient();
  const invoicesQueryKey = ["invoices", params];

  const {
    data = {
      data: [],
      meta: { total_billed_poisha: 0, total_collected_poisha: 0, total_outstanding_poisha: 0 },
    },
    isLoading,
    isError,
    refetch,
  } = useQuery<InvoicesResponse>({
    queryKey: invoicesQueryKey,
    queryFn: () => invoiceService.getInvoices(params),
    enabled: !!params?.organization_id,
  });

  const generateInvoicesMutation = useMutation({
    mutationFn: (input: GenerateInvoicesInput) =>
      invoiceService.generateInvoices(input, params?.organization_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });

  const createInvoiceMutation = useMutation({
    mutationFn: (input: InvoiceInput) =>
      invoiceService.createInvoice(input, params?.organization_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });

  return {
    invoices: data.data,
    meta: data.meta,
    isLoading,
    isError,
    refetchInvoices: refetch,

    generateInvoices: generateInvoicesMutation.mutateAsync,
    isGeneratingInvoices: generateInvoicesMutation.isPending,

    createInvoice: createInvoiceMutation.mutateAsync,
    isCreatingInvoice: createInvoiceMutation.isPending,
    createInvoiceError: createInvoiceMutation.error
      ? getApiErrorMessage(createInvoiceMutation.error)
      : null,
  };
}

export function useInvoiceDetail(invoiceId: number | null) {
  const {
    data: invoice = null,
    isLoading,
    isError,
    refetch,
  } = useQuery<Invoice | null>({
    queryKey: ["invoice", invoiceId],
    queryFn: () => (invoiceId ? invoiceService.getInvoice(invoiceId) : null),
    enabled: !!invoiceId,
  });

  return {
    invoice,
    isLoading,
    isError,
    refetchInvoice: refetch,
  };
}
