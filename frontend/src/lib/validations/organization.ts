import { z } from "zod";

/**
 * Organization Creation / Onboarding Schema
 */
export const createOrganizationSchema = z.object({
  name: z
    .string()
    .min(2, "Organization name must be at least 2 characters")
    .max(100, "Organization name cannot exceed 100 characters"),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^(\+88)?01[3-9]\d{8}$/.test(val.replace(/\s+/g, "")),
      "Please enter a valid Bangladeshi phone number",
    ),
  email: z
    .string()
    .optional()
    .refine(
      (val) => !val || z.string().email().safeParse(val).success,
      "Please enter a valid email address",
    ),
  address: z.string().optional(),
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;

/**
 * Organization Update Settings Schema
 */
export const updateOrganizationSchema = createOrganizationSchema;

export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;

/**
 * Add / Invite Team Member Schema
 */
export const addMemberSchema = z.object({
  email: z
    .string()
    .min(1, "Email address is required")
    .email("Please enter a valid email address"),
  role_id: z
    .number({ required_error: "Please select a role" })
    .min(1, "Please select a role"),
  property_access: z.array(z.number()).optional().nullable(),
});

export type AddMemberInput = z.infer<typeof addMemberSchema>;
