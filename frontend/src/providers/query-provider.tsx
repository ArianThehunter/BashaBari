"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, type ReactNode } from "react";

/**
 * TanStack Query provider with sensible defaults for a SaaS application.
 *
 * Configuration rationale:
 * - staleTime: 30s — API data is considered fresh for 30 seconds.
 * - gcTime: 5min — Unused cache entries are garbage collected after 5 minutes.
 * - retry: 1 — Retry failed requests once (avoids hammering failing endpoints).
 * - refetchOnWindowFocus: true — Refresh data when user returns to the tab.
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000, // 30 seconds
            gcTime: 5 * 60 * 1000, // 5 minutes
            retry: 1,
            refetchOnWindowFocus: true,
            refetchOnReconnect: true,
          },
          mutations: {
            retry: 0,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
