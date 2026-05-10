// app/providers.tsx
'use client';

import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <AppRouterCacheProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </AppRouterCacheProvider>
  );
}
