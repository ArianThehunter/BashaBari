import { z } from "zod";

/**
 * Maintenance Request Ticket Schema
 */
export const maintenanceRequestSchema = z.object({
  property_id: z.number({ required_error: "Please select a property" }),
  building_id: z.number().optional().nullable(),
  unit_id: z.number().optional().nullable(),
  tenant_id: z.number().optional().nullable(),
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(5, "Description is required"),
  category: z.enum([
    "plumbing",
    "electrical",
    "painting",
    "elevator",
    "cleaning",
    "repairs",
    "other",
  ]),
  priority: z.enum(["low", "medium", "high", "emergency"]),
  estimated_cost_bdt: z.number().optional().nullable(),
  assigned_vendor_name: z.string().optional().nullable(),
  assigned_vendor_phone: z.string().optional().nullable(),
});

export type MaintenanceRequestInput = z.infer<typeof maintenanceRequestSchema>;

/**
 * Log Property Expense Schema
 */
export const expenseSchema = z.object({
  property_id: z.number().optional().nullable(),
  unit_id: z.number().optional().nullable(),
  maintenance_request_id: z.number().optional().nullable(),
  category: z.enum([
    "plumbing",
    "electrical",
    "painting",
    "elevator",
    "cleaning",
    "repairs",
    "utility_bill",
    "tax",
    "other",
  ]),
  amount_bdt: z.number().min(1, "Amount must be greater than 0"),
  expense_date: z.string().min(1, "Expense date is required"),
  vendor_name: z.string().optional().nullable(),
  payment_method: z.enum(["cash", "bkash", "nagad", "bank_transfer", "cheque"]),
  receipt_reference: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type ExpenseInput = z.infer<typeof expenseSchema>;
