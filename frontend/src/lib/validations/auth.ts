import { z } from "zod";

/**
 * Login Form Validation Schema
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email address is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required"),
  remember: z.boolean(),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Registration Form Validation Schema
 */
export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Full name must be at least 2 characters")
      .max(100, "Full name cannot exceed 100 characters"),
    email: z
      .string()
      .min(1, "Email address is required")
      .email("Please enter a valid email address"),
    phone: z
      .string()
      .optional()
      .refine(
        (val) => !val || /^(\+88)?01[3-9]\d{8}$/.test(val.replace(/\s+/g, "")),
        "Please enter a valid Bangladeshi phone number (e.g., 01711000000)",
      ),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      ),
    password_confirmation: z
      .string()
      .min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * Forgot Password Validation Schema
 */
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email address is required")
    .email("Please enter a valid email address"),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

/**
 * Reset Password Validation Schema
 */
export const resetPasswordSchema = z
  .object({
    email: z
      .string()
      .min(1, "Email address is required")
      .email("Please enter a valid email address"),
    token: z.string().min(1, "Reset token is required"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      ),
    password_confirmation: z
      .string()
      .min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
