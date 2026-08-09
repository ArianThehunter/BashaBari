import api, { initCsrf } from "@/lib/api";
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from "@/lib/validations/auth";
import type { User } from "@/types";

export interface AuthResponse {
  message: string;
  user: User;
}

export const authService = {
  /**
   * Initialize CSRF cookie and register a new user.
   */
  async register(data: RegisterInput): Promise<AuthResponse> {
    await initCsrf();
    const response = await api.post<AuthResponse>("/api/register", data);
    return response.data;
  },

  /**
   * Initialize CSRF cookie and authenticate user.
   */
  async login(data: LoginInput): Promise<AuthResponse> {
    await initCsrf();
    const response = await api.post<AuthResponse>("/api/login", data);
    return response.data;
  },

  /**
   * Destroy user session (logout).
   */
  async logout(): Promise<void> {
    await api.post("/api/logout");
  },

  /**
   * Request a password reset link.
   */
  async forgotPassword(data: ForgotPasswordInput): Promise<{ message: string }> {
    await initCsrf();
    const response = await api.post<{ message: string }>("/api/forgot-password", data);
    return response.data;
  },

  /**
   * Reset password with token.
   */
  async resetPassword(data: ResetPasswordInput): Promise<{ message: string }> {
    await initCsrf();
    const response = await api.post<{ message: string }>("/api/reset-password", data);
    return response.data;
  },

  /**
   * Resend email verification link.
   */
  async resendVerificationEmail(): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>("/api/email/verification-notification");
    return response.data;
  },

  /**
   * Fetch current authenticated user.
   */
  async getProfile(): Promise<User> {
    const response = await api.get<{ data: User }>("/api/v1/user");
    return response.data.data;
  },
};
