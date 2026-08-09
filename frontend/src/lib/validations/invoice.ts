import { z } from "zod";

/**
 * Invoice Line Item Schema
 */
export const invoiceItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unit_amount_bdt: z.number().min(0, "Amount cannot be negative"),
});

export type InvoiceItemInput = z.infer<typeof invoiceItemSchema>;

/**
 * Manual Invoice Creation Schema
 */
export const invoiceSchema = z.object({
  tenant_id: z.number({ required_error: "Please select a tenant" }),
  unit_id: z.number().optional().nullable(),
  lease_id: z.number().optional().nullable(),
  billing_period_month: z.number().min(1).max(12),
  billing_period_year: z.number().min(2020).max(2100),
  issue_date: z.string().min(1, "Issue date is required"),
  due_date: z.string().min(1, "Due date is required"),
  items: z.array(invoiceItemSchema).min(1, "At least one line item is required"),
  notes: z.string().optional().nullable(),
});

export type InvoiceInput = z.infer<typeof invoiceSchema>;

/**
 * Batch Bill Generator Schema
 */
export const generateInvoicesSchema = z.object({
  month: z.number().min(1).max(12),
  year: z.number().min(2020).max(2100),
});

export type GenerateInvoicesInput = z.infer<typeof generateInvoicesSchema>;
