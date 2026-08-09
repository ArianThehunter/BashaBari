import api from "@/lib/api";
import { bdtToPoisha } from "@/lib/money";
import type { GenerateInvoicesInput, InvoiceInput } from "@/lib/validations/invoice";
import type { Invoice } from "@/types";

export interface InvoicesResponse {
  data: Invoice[];
  meta: {
    total_billed_poisha: number;
    total_collected_poisha: number;
    total_outstanding_poisha: number;
  };
}

export const invoiceService = {
  /**
   * Fetch invoices for active organization with search & status filters.
   */
  async getInvoices(params?: {
    status?: string;
    search?: string;
    organization_id?: number | null;
  }): Promise<InvoicesResponse> {
    const headers = params?.organization_id
      ? { "X-Organization-Id": String(params.organization_id) }
      : undefined;

    const response = await api.get<InvoicesResponse>("/api/v1/invoices", {
      params,
      headers,
    });
    return response.data;
  },

  /**
   * Batch generate monthly rent invoices for active leases.
   */
  async generateInvoices(
    data: GenerateInvoicesInput,
    organizationId?: number | null,
  ): Promise<{ message: string; generated_count: number }> {
    const headers = organizationId ? { "X-Organization-Id": String(organizationId) } : undefined;
    const response = await api.post<{ message: string; generated_count: number }>(
      "/api/v1/invoices/generate",
      data,
      { headers },
    );
    return response.data;
  },

  /**
   * Create custom manual invoice with itemized line items (converts BDT to poisha).
   */
  async createInvoice(data: InvoiceInput, organizationId?: number | null): Promise<Invoice> {
    const headers = organizationId ? { "X-Organization-Id": String(organizationId) } : undefined;
    const payload = {
      ...data,
      items: data.items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unit_amount: bdtToPoisha(item.unit_amount_bdt),
      })),
    };

    const response = await api.post<{ data: Invoice }>("/api/v1/invoices", payload, { headers });
    return response.data.data;
  },

  /**
   * Fetch invoice details with tenant, unit, and items.
   */
  async getInvoice(id: number): Promise<Invoice> {
    const response = await api.get<{ data: Invoice }>(`/api/v1/invoices/${id}`);
    return response.data.data;
  },

  /**
   * Soft-delete invoice.
   */
  async deleteInvoice(id: number): Promise<void> {
    await api.delete(`/api/v1/invoices/${id}`);
  },
};
