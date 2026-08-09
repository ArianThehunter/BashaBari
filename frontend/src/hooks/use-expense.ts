"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { expenseService, type ExpensesResponse } from "@/services/expense-service";
import type { ExpenseInput } from "@/lib/validations/maintenance";
import { getApiErrorMessage } from "@/lib/api";

export function useExpenses(params?: {
  category?: string;
  property_id?: number;
  search?: string;
  organization_id?: number | null;
}) {
  const queryClient = useQueryClient();
  const expensesQueryKey = ["expenses", params];

  const {
    data = {
      data: [],
      meta: { total_expenses_poisha: 0, total_records: 0 },
    },
    isLoading,
    isError,
    refetch,
  } = useQuery<ExpensesResponse>({
    queryKey: expensesQueryKey,
    queryFn: () => expenseService.getExpenses(params),
    enabled: !!params?.organization_id,
  });

  const createExpenseMutation = useMutation({
    mutationFn: (input: ExpenseInput) =>
      expenseService.createExpense(input, params?.organization_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["financial-report"] });
    },
  });

  return {
    expenses: data.data,
    meta: data.meta,
    isLoading,
    isError,
    refetchExpenses: refetch,

    createExpense: createExpenseMutation.mutateAsync,
    isCreatingExpense: createExpenseMutation.isPending,
    createExpenseError: createExpenseMutation.error
      ? getApiErrorMessage(createExpenseMutation.error)
      : null,
  };
}
