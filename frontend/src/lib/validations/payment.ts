import { z } from "zod";

/**
 * Initiate SSLCommerz Session Schema
 */
export const initiateSslcommerzSchema = z.object({
  invoice_id: z.number({ required_error: "Please select an unpaid invoice" }),
});

export type InitiateSslcommerzInput = z.infer<typeof initiateSslcommerzSchema>;

/**
 * Manual Payment Recording Schema
 */
export const paymentSchema = z.object({
  tenant_id: z.number({ required_error: "Please select a tenant" }),
  invoice_id: z.number().optional().nullable(),
  unit_id: z.number().optional().nullable(),
  payment_method: z.enum([
    "sslcommerz",
    "bkash",
    "nagad",
    "rocket",
    "bank_transfer",
    "cash",
    "cheque",
  ]),
  amount_bdt: z.number().min(1, "Amount must be greater than 0"),
  payment_date: z.string().min(1, "Payment date is required"),
  reference_number: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type PaymentInput = z.infer<typeof paymentSchema>;

/**
 * Payment Refund Schema
 */
export const refundPaymentSchema = z.object({
  refund_reason: z.string().min(3, "Please provide a reason for the refund"),
});

export type RefundPaymentInput = z.infer<typeof refundPaymentSchema>;
