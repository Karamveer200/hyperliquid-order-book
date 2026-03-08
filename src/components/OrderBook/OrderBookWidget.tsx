'use client';

import { useState, useEffect } from 'react';
import {
  useCustomLocalStorage,
  LOCAL_STORAGE_KEYS,
} from '@/hooks/useCustomLocalStorage';
import { useHyperliquidOrderBook } from '@/hooks/useHyperliquidOrderBook';
import type { CustomSelectOption } from '@/components/shared/SelectMenu/SelectMenu';
import { OrderBookHeader } from '@/components/OrderBook/components/OrderBookHeader/OrderBookHeader';
import { OrderBookColumnHeaders } from '@/components/OrderBook/components/OrderBookColumnHeaders/OrderBookColumnHeaders';
import { OrderBookSide } from '@/components/OrderBook/components/OrderBookSide/OrderBookSide';

const SYMBOLS = ['BTC', 'ETH'] as const;
type Symbol = (typeof SYMBOLS)[number];

type PrecisionValue = { nSigFigs: number; mantissa: number | null };

const PRECISION_MAP: Record<Symbol, Record<number, PrecisionValue>> = {
  ETH: {
    0.1: { nSigFigs: 5, mantissa: null },
    0.2: { nSigFigs: 5, mantissa: 2 },
    0.5: { nSigFigs: 5, mantissa: 5 },
    1: { nSigFigs: 4, mantissa: null },
    10: { nSigFigs: 3, mantissa: null },
    100: { nSigFigs: 2, mantissa: null },
  },
  BTC: {
    1: { nSigFigs: 5, mantissa: null },
    2: { nSigFigs: 5, mantissa: 2 },
    5: { nSigFigs: 5, mantissa: 5 },
    10: { nSigFigs: 4, mantissa: null },
    100: { nSigFigs: 3, mantissa: null },
    1000: { nSigFigs: 2, mantissa: null },
  },
};

const PRECISION_OPTIONS: Record<Symbol, readonly number[]> = {
  ETH: [0.1, 0.2, 0.5, 1, 10, 100],
  BTC: [1, 2, 5, 10, 100, 1000],
};

const SYMBOL_OPTIONS: CustomSelectOption[] = SYMBOLS.map((s) => ({
  label: s,
  value: s,
}));

// --- Helpers ---

function getPrecisionOptions(symbol: Symbol | null): CustomSelectOption[] {
  if (!symbol) return [];

  return (
    PRECISION_OPTIONS[symbol]?.map((p) => ({
      label: String(p),
      value: String(p),
    })) ?? []
  );
}

function getValidPrecision(symbol: Symbol | null, value: number): number {
  if (!symbol) return 1;

  const opts = PRECISION_OPTIONS[symbol];
  const isValid = opts?.includes(value as (typeof opts)[number]);
  return isValid ? value : (opts?.[0] ?? 1);
}

export function OrderBookWidget() {
  const [symbol, setSymbol] = useCustomLocalStorage(
    LOCAL_STORAGE_KEYS.ORDER_BOOK_SYMBOL,
    SYMBOLS[0]
  ) as [Symbol, (s: Symbol) => void];

  const [precisionRaw, setPrecision] = useCustomLocalStorage(
    LOCAL_STORAGE_KEYS.ORDER_BOOK_PRECISION,
    1
  ) as [number, (p: number) => void];

  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => setHasMounted(true), []);

  // Use initial values until mounted so server and first client render match (avoids hydration errors)
  const displaySymbol = hasMounted ? symbol : null;
  const displayPrecisionRaw = hasMounted ? precisionRaw : 1;

  const precision = getValidPrecision(displaySymbol, displayPrecisionRaw);
  const precisionOptions = getPrecisionOptions(displaySymbol);
  const config = displaySymbol
    ? PRECISION_MAP[displaySymbol]?.[precision]
    : null;

  const [flashTrigger, setFlashTrigger] = useState<number | null>(null);

  const { bids, spread, asks, isConnected, error, updateSubscription } =
    useHyperliquidOrderBook({
      coin: displaySymbol ?? '',
      nSigFigs: config?.nSigFigs ?? 0,
      mantissa: config?.mantissa ?? null,
    });

  useEffect(() => {
    if (flashTrigger === null) return;
    const t = setTimeout(() => setFlashTrigger(null), 600);
    return () => clearTimeout(t);
  }, [flashTrigger]);

  const handleSymbolChange = (option: CustomSelectOption) => {
    const newSymbol = option.value as Symbol;
    const firstPrecision = PRECISION_OPTIONS[newSymbol]?.[0] ?? 1;
    setSymbol(newSymbol);

    setPrecision(firstPrecision);
    updateSubscription({
      coin: newSymbol,
      nSigFigs: PRECISION_MAP[newSymbol][firstPrecision].nSigFigs,
      mantissa: PRECISION_MAP[newSymbol][firstPrecision].mantissa,
    });
  };

  const handlePrecisionChange = (option: CustomSelectOption) => {
    const newPrecision = Number(option.value);
    setPrecision(newPrecision);

    updateSubscription({
      coin: displaySymbol!,
      nSigFigs: PRECISION_MAP[displaySymbol!][newPrecision].nSigFigs,
      mantissa: PRECISION_MAP[displaySymbol!][newPrecision].mantissa,
    });
  };

  const symbolOption =
    SYMBOL_OPTIONS.find((o) => o.value === displaySymbol) || null;

  const precisionOption =
    precisionOptions?.find((o) => Number(o.value) === precision) || null;

  return (
    <div className="flex h-full max-h-[970px] flex-col overflow-hidden rounded-xs border border-sys-border bg-sys-surface shadow-xl">
      <OrderBookHeader
        symbolOptions={SYMBOL_OPTIONS}
        symbolOption={symbolOption}
        precisionOptions={precisionOptions}
        precisionOption={precisionOption}
        onSymbolChange={handleSymbolChange}
        onPrecisionChange={handlePrecisionChange}
        isConnected={isConnected}
        error={error}
      />

      <OrderBookColumnHeaders symbol={displaySymbol!} />

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-auto border-b border-sys-border">
          <OrderBookSide levels={asks} symbol={displaySymbol!} />
        </div>

        <div className="flex shrink-0 items-center justify-between border-y border-sys-border bg-sys-surface-elevated px-4 py-2 text-sm">
          <span className="text-sys-text-muted">Spread</span>{' '}
          <span className="tabular-nums text-sys-text">{spread || '—'}</span>
        </div>

        <div className="min-h-0 flex-1 overflow-auto">
          <OrderBookSide levels={bids} isBid symbol={displaySymbol!} />
        </div>
      </div>
    </div>
  );
}
