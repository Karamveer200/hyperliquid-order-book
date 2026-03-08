'use client';

import { useState, useEffect, useRef } from 'react';
import type { WsBook, OrderBookState } from '@/lib/hyperliquid/ws-types';
import { clientConfig } from '@/lib/config/clientConfig';

export interface SubscriptionParams {
  coin: string;
  nSigFigs: number;
  mantissa: number | null; // optional, for bucketing (e.g. 1, 2, 5 when nSigFigs is 5)
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
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subParamsRef = useRef<SubscriptionParams | null>(null);

  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const reconnectAttempts = useRef(0);

  const subscribe = (ws: WebSocket) => {
    ws.send(
      JSON.stringify({
        method: 'subscribe',
        subscription: buildPayload(subParamsRef.current!),
      })
    );
  };

  const updateSubscription = (updatedParams: SubscriptionParams) => {
    console.log('updateSubscription', updatedParams);
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    const prev = subParamsRef.current!;

    ws.send(
      JSON.stringify({
        method: 'unsubscribe',
        subscription: buildPayload({
          coin: prev.coin,
          nSigFigs: prev.nSigFigs,
          mantissa: prev.mantissa,
        }),
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

  const connect = () => {
    setError(null);

    const ws = new WebSocket(clientConfig().hyperliquidWsUrl);

    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      reconnectAttempts.current = 0;

      subscribe(ws);
    };

    ws.onmessage = (event) => {
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
        // ignore parse errors for non-JSON or other channels
      }
    };

    ws.onerror = () => {
      setError('WebSocket error');
    };

    ws.onclose = () => {
      const reconnectDelayMs = 3000; // 3 seconds
      const maxReconnectAttempts = 5; // 5 attempts

      setIsConnected(false);
      wsRef.current = null;
      subParamsRef.current = null;

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

  useEffect(() => {
    if (!coin || !nSigFigs || !!subParamsRef.current) return;
    // If subParamsRef.current is not null, websocket is already subscribed initially

    subParamsRef.current = { coin, nSigFigs, mantissa };

    connect();
  }, [coin, nSigFigs, mantissa]);

  return { ...state, isConnected, error, updateSubscription };
};
