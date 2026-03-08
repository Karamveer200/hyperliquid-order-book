'use client';

export const clientConfig = () => ({
  appEnv: process.env.NEXT_PUBLIC_APP_ENV!,
  hyperliquidWsUrl: process.env.NEXT_PUBLIC_HYPERLIQUID_WS_URL!,
});
