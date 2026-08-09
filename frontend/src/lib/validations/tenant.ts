import { z } from "zod";

/**
 * Tenant Creation & Profile Update Schema
 */
export const tenantSchema = z.object({
  name: z
    .string()
    .min(2, "Full legal name must be at least 2 characters")
    .max(150, "Full legal name cannot exceed 150 characters"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z
    .string()
    .min(11, "Mobile phone number must be at least 11 digits")
    .max(20, "Mobile phone number cannot exceed 20 characters"),
  nid_number: z
    .string()
    .regex(/^[0-9]*$/, "NID number must contain only digits")
    .optional()
    .or(z.literal("")),
  passport_number: z.string().optional().or(z.literal("")),
  father_name: z.string().optional().or(z.literal("")),
  permanent_address: z.string().optional().or(z.literal("")),
  occupation: z.string().optional().or(z.literal("")),
  emergency_contact_name: z.string().optional().or(z.literal("")),
  emergency_contact_phone: z.string().optional().or(z.literal("")),
  emergency_contact_relation: z.string().optional().or(z.literal("")),
  status: z.enum(["active", "inactive", "archived"]),
});

export type TenantInput = z.infer<typeof tenantSchema>;
