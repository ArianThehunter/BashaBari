import api from "@/lib/api";
import type { ExpenseInput } from "@/lib/validations/maintenance";
import type { Expense } from "@/types";

export interface ExpensesResponse {
  data: Expense[];
  meta: {
    total_expenses_poisha: number;
    total_records: number;
  };
}

export const expenseService = {
  /**
   * Fetch expenses for active organization.
   */
  async getExpenses(params?: {
    category?: string;
    property_id?: number;
    search?: string;
    organization_id?: number | null;
  }): Promise<ExpensesResponse> {
    const headers = params?.organization_id
      ? { "X-Organization-Id": String(params.organization_id) }
      : undefined;

    const response = await api.get<ExpensesResponse>("/api/v1/expenses", {
      params,
      headers,
    });
    return response.data;
  },

  /**
   * Log property operating expense.
   */
  async createExpense(data: ExpenseInput, organizationId?: number | null): Promise<Expense> {
    const headers = organizationId ? { "X-Organization-Id": String(organizationId) } : undefined;
    const response = await api.post<{ data: Expense }>("/api/v1/expenses", data, { headers });
    return response.data.data;
  },

  /**
   * Delete expense.
   */
  async deleteExpense(id: number): Promise<void> {
    await api.delete(`/api/v1/expenses/${id}`);
  },
};
