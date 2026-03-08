'use client';

import { useState, useEffect, useRef } from 'react';
import type { WsBook, OrderBookState } from '@/lib/hyperliquid/ws-types';
import { clientConfig } from '@/lib/config/clientConfig';

export interface SubscriptionParams {
  coin: string;
  nSigFigs: number;
  mantissa: number | null;
}

const buildPayload = ({ coin, nSigFigs, mantissa }: SubscriptionParams) => {
  const sub: {
    type: 'l2Book';
    coin: string;
    nSigFigs: number;
    mantissa?: number;
  } = {
    type: 'l2Book',
    coin,
    nSigFigs,
  };

  if (mantissa != null) sub.mantissa = mantissa;

  return sub;
};

export const useHyperliquidOrderBook = ({
  coin,
  nSigFigs,
  mantissa,
}: SubscriptionParams) => {
  const [state, setState] = useState<OrderBookState>({
    bids: [],
    asks: [],
    spread: '0',
    coin: '',
    time: 0,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const subParamsRef = useRef<SubscriptionParams | null>(null);

  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const reconnectAttempts = useRef(0);

  const lastMessageTimeRef = useRef<number>(Date.now());

  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reconnectDelayMs = 3000;
  const maxReconnectAttempts = 5;
  const staleTimeoutMs = 10000;

  const subscribe = (ws: WebSocket) => {
    if (!subParamsRef.current) return;

    ws.send(
      JSON.stringify({
        method: 'subscribe',
        subscription: buildPayload(subParamsRef.current),
      })
    );
  };

  const connect = () => {
    if (!subParamsRef.current) return;

    setError(null);

    const ws = new WebSocket(clientConfig().hyperliquidWsUrl);

    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      reconnectAttempts.current = 0;
      subscribe(ws);
    };

    ws.onmessage = (event) => {
      lastMessageTimeRef.current = Date.now();

      try {
        const msg = JSON.parse(event.data as string);

        if (msg.channel === 'l2Book' && msg.data) {
          const data = msg.data as WsBook;

          const sortedBids = data.levels[0]?.sort(
            (a, b) => Number(b.px) - Number(a.px)
          );

          const sortedAsks = data.levels[1]?.sort(
            (a, b) => Number(b.px) - Number(a.px)
          );

          setState({
            bids: sortedBids ?? [],
            asks: sortedAsks ?? [],
            coin: data.coin,
            time: data.time,
            spread: data.spread,
          });
        }
      } catch {
        // ignore parse errors
        console.error('Error parsing WebSocket message:', event.data);
      }
    };

    ws.onerror = () => {
      setIsConnected(false);
      setError('Connection lost');
    };

    ws.onclose = () => {
      setIsConnected(false);
      wsRef.current = null;

      reconnectAttempts.current += 1;

      if (reconnectAttempts.current >= maxReconnectAttempts) {
        setError(
          'Connection failed after 5 attempts. Try changing symbol or refresh.'
        );
        return;
      }

      reconnectTimeoutRef.current = setTimeout(connect, reconnectDelayMs);
    };
  };

  const updateSubscription = (updatedParams: SubscriptionParams) => {
    const ws = wsRef.current;

    if (!ws || ws.readyState !== WebSocket.OPEN || !subParamsRef.current)
      return;

    const prev = subParamsRef.current;

    ws.send(
      JSON.stringify({
        method: 'unsubscribe',
        subscription: buildPayload(prev),
      })
    );

    ws.send(
      JSON.stringify({
        method: 'subscribe',
        subscription: buildPayload(updatedParams),
      })
    );

    subParamsRef.current = { ...updatedParams };
  };

  // initial connect
  useEffect(() => {
    if (!coin || !nSigFigs || subParamsRef.current) return;

    subParamsRef.current = { coin, nSigFigs, mantissa };

    connect();
  }, [coin, nSigFigs, mantissa]);

  // reconnect when tab becomes visible (important for iPhone)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const ws = wsRef.current;

        if (!ws || ws.readyState !== WebSocket.OPEN) {
          ws?.close();
          connect();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return { ...state, isConnected, error, updateSubscription };
};
