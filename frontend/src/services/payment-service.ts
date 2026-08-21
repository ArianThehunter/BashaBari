import api from "@/lib/api";
import type { InitiateSslcommerzInput, PaymentInput } from "@/lib/validations/payment";
import type { Payment } from "@/types";

export interface PaymentsResponse {
  data: Payment[];
  meta: {
    total_collected_poisha: number;
    total_refunded_poisha: number;
  };
}

export interface SslcommerzInitiateResponse {
  status: "SUCCESS" | "FAILED";
  tran_id: string;
  gateway_url: string;
  amount_bdt: number;
  invoice_id: number;
}

export interface FinancialReportResponse {
  summary: {
    total_income_poisha: number;
    total_expense_poisha: number;
    staff_payroll_expense_poisha?: number;
    property_repair_expense_poisha?: number;
    net_bank_deposit_surplus_poisha?: number;
    net_cash_flow_poisha: number;
    total_billed_poisha: number;
    total_collected_poisha: number;
    collection_rate_percentage: number;
  };
  channels: Array<{
    payment_method: string;
    card_type?: string | null;
    total_amount: number;
  }>;
  recent_ledger: Array<{
    id: number;
    type: "income" | "expense" | "refund";
    category: string;
    amount: number; // poisha
    entry_date: string;
    description: string;
  }>;
}

export const paymentService = {
  /**
   * Fetch payments for active organization with search & filters.
   */
  async getPayments(params?: {
    payment_method?: string;
    status?: string;
    search?: string;
    organization_id?: number | null;
  }): Promise<PaymentsResponse> {
    const headers = params?.organization_id
      ? { "X-Organization-Id": String(params.organization_id) }
      : undefined;

    const response = await api.get<PaymentsResponse>("/api/v1/payments", {
      params,
      headers,
    });
    return response.data;
  },

  /**
   * Initiate SSLCommerz checkout session.
   */
  async initiateSslcommerz(
    data: InitiateSslcommerzInput,
    organizationId?: number | null,
  ): Promise<SslcommerzInitiateResponse> {
    const headers = organizationId ? { "X-Organization-Id": String(organizationId) } : undefined;
    const response = await api.post<SslcommerzInitiateResponse>(
      "/api/v1/payments/initiate-sslcommerz",
      data,
      { headers },
    );
    return response.data;
  },

  /**
   * Post the gateway callback.
   *
   * `amount` and `signature` come from the checkout URL the backend generated
   * and must be forwarded untouched — the server recomputes the signature and
   * rejects the callback if it does not match, so a client cannot mark an
   * invoice paid on its own say-so.
   */
  async completeSslcommerzSuccess(data: {
    tran_id: string;
    amount: string;
    signature: string;
    val_id?: string;
    card_type?: string;
    bank_tran_id?: string;
    card_no?: string;
  }): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(
      "/api/v1/gateway/sslcommerz/ipn",
      data,
    );
    return response.data;
  },

  /**
   * Record manual offline payment.
   */
  async createPayment(data: PaymentInput, organizationId?: number | null): Promise<Payment> {
    const headers = organizationId ? { "X-Organization-Id": String(organizationId) } : undefined;
    const response = await api.post<{ data: Payment }>("/api/v1/payments", data, { headers });
    return response.data.data;
  },

  /**
   * Refund payment.
   */
  async refundPayment(id: number): Promise<Payment> {
    const response = await api.post<{ data: Payment }>(`/api/v1/payments/${id}/refund`);
    return response.data.data;
  },

  /**
   * Fetch cash flow financial accounting report.
   */
  async getFinancialReport(organizationId?: number | null): Promise<FinancialReportResponse> {
    const headers = organizationId ? { "X-Organization-Id": String(organizationId) } : undefined;
    const response = await api.get<FinancialReportResponse>("/api/v1/reports/cash-flow", {
      headers,
    });
    return response.data;
  },
};
