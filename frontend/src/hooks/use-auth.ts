"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/services/auth-service";
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from "@/lib/validations/auth";
import type { User } from "@/types";
import { getApiErrorMessage } from "@/lib/api";

const AUTH_USER_QUERY_KEY = ["auth", "user"];

export function useAuth() {
  const queryClient = useQueryClient();

  // ---- Query: Current User Session ----
  const {
    data: user,
    isLoading,
    isError,
    refetch,
  } = useQuery<User | null>({
    queryKey: AUTH_USER_QUERY_KEY,
    queryFn: async () => {
      try {
        return await authService.getProfile();
      } catch {
        // Return null if unauthenticated instead of throwing query error
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // Fresh for 5 mins
    retry: false,
  });

  // ---- Mutation: Login ----
  const loginMutation = useMutation({
    mutationFn: (data: LoginInput) => authService.login(data),
    onSuccess: (data) => {
      queryClient.setQueryData(AUTH_USER_QUERY_KEY, data.user);
    },
  });

  // ---- Mutation: Register ----
  const registerMutation = useMutation({
    mutationFn: (data: RegisterInput) => authService.register(data),
    onSuccess: (data) => {
      queryClient.setQueryData(AUTH_USER_QUERY_KEY, data.user);
    },
  });

  // ---- Mutation: Logout ----
  const logoutMutation = useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      queryClient.setQueryData(AUTH_USER_QUERY_KEY, null);
      queryClient.clear();
    },
  });

  // ---- Mutation: Forgot Password ----
  const forgotPasswordMutation = useMutation({
    mutationFn: (data: ForgotPasswordInput) => authService.forgotPassword(data),
  });

  // ---- Mutation: Reset Password ----
  const resetPasswordMutation = useMutation({
    mutationFn: (data: ResetPasswordInput) => authService.resetPassword(data),
  });

  // ---- Mutation: Resend Email Verification ----
  const resendVerificationMutation = useMutation({
    mutationFn: () => authService.resendVerificationEmail(),
  });

  return {
    user,
    isLoading,
    isError,
    isAuthenticated: !!user,
    refetchUser: refetch,

    // Login
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error ? getApiErrorMessage(loginMutation.error) : null,

    // Register
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error ? getApiErrorMessage(registerMutation.error) : null,

    // Logout
    logout: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,

    // Forgot Password
    forgotPassword: forgotPasswordMutation.mutateAsync,
    isSendingForgotPassword: forgotPasswordMutation.isPending,
    forgotPasswordError: forgotPasswordMutation.error
      ? getApiErrorMessage(forgotPasswordMutation.error)
      : null,

    // Reset Password
    resetPassword: resetPasswordMutation.mutateAsync,
    isResettingPassword: resetPasswordMutation.isPending,
    resetPasswordError: resetPasswordMutation.error
      ? getApiErrorMessage(resetPasswordMutation.error)
      : null,

    // Resend Email Verification
    resendVerification: resendVerificationMutation.mutateAsync,
    isResendingVerification: resendVerificationMutation.isPending,
  };
}
