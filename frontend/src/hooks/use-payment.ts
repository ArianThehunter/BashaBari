"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  paymentService,
  type FinancialReportResponse,
  type PaymentsResponse,
} from "@/services/payment-service";
import type { InitiateSslcommerzInput, PaymentInput } from "@/lib/validations/payment";
import { getApiErrorMessage } from "@/lib/api";

export function usePayments(params?: {
  payment_method?: string;
  status?: string;
  search?: string;
  organization_id?: number | null;
}) {
  const queryClient = useQueryClient();
  const paymentsQueryKey = ["payments", params];

  const {
    data = {
      data: [],
      meta: { total_collected_poisha: 0, total_refunded_poisha: 0 },
    },
    isLoading,
    isError,
    refetch,
  } = useQuery<PaymentsResponse>({
    queryKey: paymentsQueryKey,
    queryFn: () => paymentService.getPayments(params),
    enabled: !!params?.organization_id,
  });

  const initiateSslcommerzMutation = useMutation({
    mutationFn: (input: InitiateSslcommerzInput) =>
      paymentService.initiateSslcommerz(input, params?.organization_id),
  });

  const createPaymentMutation = useMutation({
    mutationFn: (input: PaymentInput) =>
      paymentService.createPayment(input, params?.organization_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });

  const refundPaymentMutation = useMutation({
    mutationFn: (paymentId: number) => paymentService.refundPayment(paymentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });

  return {
    payments: data.data,
    meta: data.meta,
    isLoading,
    isError,
    refetchPayments: refetch,

    initiateSslcommerz: initiateSslcommerzMutation.mutateAsync,
    isInitiatingSslcommerz: initiateSslcommerzMutation.isPending,

    createPayment: createPaymentMutation.mutateAsync,
    isCreatingPayment: createPaymentMutation.isPending,
    createPaymentError: createPaymentMutation.error
      ? getApiErrorMessage(createPaymentMutation.error)
      : null,

    refundPayment: refundPaymentMutation.mutateAsync,
    isRefundingPayment: refundPaymentMutation.isPending,
  };
}

export function useFinancialReport(organizationId?: number | null) {
  const {
    data = {
      summary: {
        total_income_poisha: 0,
        total_expense_poisha: 0,
        staff_payroll_expense_poisha: 0,
        property_repair_expense_poisha: 0,
        net_bank_deposit_surplus_poisha: 0,
        net_cash_flow_poisha: 0,
        total_billed_poisha: 0,
        total_collected_poisha: 0,
        collection_rate_percentage: 100,
      },
      channels: [],
      recent_ledger: [],
    },
    isLoading,
    isError,
    refetch,
  } = useQuery<FinancialReportResponse>({
    queryKey: ["financial-report", organizationId],
    queryFn: () => paymentService.getFinancialReport(organizationId),
    enabled: !!organizationId,
  });

  return {
    summary: data.summary,
    channels: data.channels,
    recentLedger: data.recent_ledger,
    isLoading,
    isError,
    refetchReport: refetch,
  };
}
