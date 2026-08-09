import axios, { type AxiosError, type AxiosInstance } from "axios";

/**
 * Configured Axios instance for communicating with the Laravel API.
 *
 * Uses Sanctum cookie-based SPA authentication:
 * - `withCredentials: true` ensures cookies are sent with every request.
 * - XSRF-TOKEN cookie is automatically read and attached as X-XSRF-TOKEN header.
 * - All requests go through Next.js rewrites (see next.config.ts) which proxy
 *   /api/* and /sanctum/* to the Laravel backend.
 */

const api: AxiosInstance = axios.create({
  baseURL: "/", // Proxied through Next.js rewrites
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// ---- Request Interceptor: Attach CSRF Token ----

api.interceptors.request.use((config) => {
  // Read the XSRF-TOKEN cookie set by Sanctum
  const token = getCookie("XSRF-TOKEN");
  if (token) {
    config.headers["X-XSRF-TOKEN"] = decodeURIComponent(token);
  }
  return config;
});

// ---- Response Interceptor: Handle Auth Errors ----

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Session expired — redirect to login
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }

    if (error.response?.status === 419) {
      // CSRF token mismatch — refresh and retry
      // This can happen if the session was idle for too long
      console.warn("CSRF token mismatch. Refreshing token...");
    }

    return Promise.reject(error);
  },
);

// ---- CSRF Initialization ----

/**
 * Initialize the CSRF cookie before the first authenticated request.
 * Must be called before login or any mutating API call.
 */
export async function initCsrf(): Promise<void> {
  await api.get("/sanctum/csrf-cookie");
}

// ---- Helpers ----

/**
 * Read a cookie value by name from document.cookie.
 */
function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;

  const cookies = document.cookie.split("; ");
  const cookie = cookies.find((c) => c.startsWith(`${name}=`));
  return cookie?.split("=").slice(1).join("=");
}

// ---- API Error Types ----

export interface ApiValidationError {
  message: string;
  errors: Record<string, string[]>;
}

export interface ApiError {
  message: string;
}

/**
 * Type guard to check if an Axios error contains Laravel validation errors.
 */
export function isValidationError(
  error: unknown,
): error is AxiosError<ApiValidationError> {
  return (
    axios.isAxiosError(error) &&
    error.response?.status === 422 &&
    typeof error.response?.data?.errors === "object"
  );
}

/**
 * Extract a flat error message from an API error response.
 */
export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiError | undefined;
    return data?.message || error.message || "An unexpected error occurred.";
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred.";
}

export default api;
