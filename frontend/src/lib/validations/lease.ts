import { z } from "zod";

/**
 * Lease Creation Schema
 */
export const leaseSchema = z.object({
  unit_id: z.number({ required_error: "Please select a flat unit" }),
  tenant_id: z.number({ required_error: "Please select a tenant" }),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  rent_amount_bdt: z.number().min(0, "Monthly rent cannot be negative"), // In BDT (user input)
  security_deposit_bdt: z.number().min(0).optional().nullable(), // In BDT
  advance_rent_bdt: z.number().min(0).optional().nullable(), // In BDT
  billing_day: z
    .number()
    .min(1, "Billing day must be between 1 and 31")
    .max(31, "Billing day must be between 1 and 31"),
  terms_and_conditions: z.string().optional().nullable(),
});

export type LeaseInput = z.infer<typeof leaseSchema>;

/**
 * Lease Termination Schema
 */
export const terminateLeaseSchema = z.object({
  termination_reason: z
    .string()
    .min(5, "Termination reason must be at least 5 characters")
    .max(500, "Termination reason cannot exceed 500 characters"),
});

export type TerminateLeaseInput = z.infer<typeof terminateLeaseSchema>;
