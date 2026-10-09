"use client";

import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute: Data stays fresh, 0ms instant switching between pages
            gcTime: 5 * 60 * 1000, // Cache preserved in memory for 5 minutes
            refetchOnWindowFocus: false, // Stop refetching every time you switch between browser and editor
            refetchOnMount: false, // Instantly serve cached data without flickering loading spinners
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}