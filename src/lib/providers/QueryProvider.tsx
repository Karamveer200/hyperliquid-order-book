"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export const QueryProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        networkMode: "online",
        refetchOnWindowFocus: false,
        retry: 1,
      },
      mutations: {
        retry: false,
        networkMode: "online",
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};
