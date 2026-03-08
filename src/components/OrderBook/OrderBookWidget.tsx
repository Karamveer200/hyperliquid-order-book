'use client';

import { useState, useCallback, useMemo } from 'react';
import { useHyperliquidOrderBook } from '@/hooks/useHyperliquidOrderBook';
import { OrderBookSide } from './OrderBookSide/OrderBookSide';
import { SelectMenu } from '@/components/shared/SelectMenu/SelectMenu';
import type { CustomSelectOption } from '@/components/shared/SelectMenu/SelectMenu';

const SYMBOLS = ['ETH', 'BTC'] as const;

const PRECISION_MAP: Record<
  number,
  { nSigFigs: number; mantissa: number | null }
> = {
  1: { nSigFigs: 5, mantissa: null },
  2: { nSigFigs: 5, mantissa: 2 },
  5: { nSigFigs: 5, mantissa: 5 },
  10: { nSigFigs: 4, mantissa: null },
  100: { nSigFigs: 3, mantissa: null },
  1000: { nSigFigs: 2, mantissa: null },
} as const;

const PRECISION_OPTIONS = [1, 2, 5, 10, 100, 1000] as const;

const SYMBOL_OPTIONS: CustomSelectOption[] = SYMBOLS.map((s) => ({
  label: s,
  value: s,
}));

const PRECISION_SELECT_OPTIONS: CustomSelectOption[] = PRECISION_OPTIONS.map(
  (p) => ({ label: String(p), value: String(p) })
);

export function OrderBookWidget() {
  const [symbol, setSymbol] = useState<(typeof SYMBOLS)[number]>('ETH');

  const [precision, setPrecision] =
    useState<(typeof PRECISION_OPTIONS)[number]>(1);

  const { nSigFigs, mantissa } = PRECISION_MAP[precision];

  const { bids, asks, isConnected, error, updateSubscription } =
    useHyperliquidOrderBook({
      coin: symbol,
      nSigFigs,
      mantissa,
    });

  const formatPrice = useCallback(
    (px: string) => {
      const n = Number(px);
      if (symbol === 'BTC')
        return n.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      return n.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,
      });
    },
    [symbol]
  );

  const formatSize = useCallback((sz: string) => {
    const n = Number(sz);
    if (n >= 1000)
      return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
    return n.toLocaleString(undefined, { maximumFractionDigits: 4 });
  }, []);

  const spread = useMemo(() => {
    const bestBid = bids[0];
    const bestAsk = asks[0];
    if (!bestBid || !bestAsk) return null;
    const bidPx = Number(bestBid.px);
    const askPx = Number(bestAsk.px);
    return { spread: askPx - bidPx, bidPx, askPx };
  }, [bids, asks]);

  const handlePrecisionChange = (newValue: unknown) => {
    const option = newValue as CustomSelectOption | null;
    if (!option) return;
    const newPrecision = Number(
      option.value
    ) as (typeof PRECISION_OPTIONS)[number];
    setPrecision(newPrecision);
    updateSubscription({
      coin: symbol,
      nSigFigs: PRECISION_MAP[newPrecision].nSigFigs,
      mantissa: PRECISION_MAP[newPrecision].mantissa,
    });
  };

  const handleSymbolChange = (newValue: unknown) => {
    const option = newValue as CustomSelectOption | null;
    if (!option) return;
    const newSymbol = option.value as (typeof SYMBOLS)[number];
    setSymbol(newSymbol);
    updateSubscription({
      coin: newSymbol,
      nSigFigs: PRECISION_MAP[precision].nSigFigs,
      mantissa: PRECISION_MAP[precision].mantissa,
    });
  };

  const symbolOption =
    SYMBOL_OPTIONS.find((o) => o.value === symbol) ?? SYMBOL_OPTIONS[0];
  const precisionOption =
    PRECISION_SELECT_OPTIONS.find((o) => Number(o.value) === precision) ??
    PRECISION_SELECT_OPTIONS[0];

  return (
    <div className="flex h-full flex-col rounded-xl border border-[#2d2d2d] bg-[#131318] overflow-hidden shadow-xl max-h-[900px]">
      <div className="flex shrink-0 items-center justify-between px-4 py-3 border-b border-[#2d2d2d]">
        <div className="flex items-center gap-3">
          <span className="text-[#9b9b9b] text-sm">Market</span>
          <div className="min-w-[100px]">
            <SelectMenu
              options={SYMBOL_OPTIONS}
              value={symbolOption}
              onChange={handleSymbolChange}
              isClearable={false}
              menuWidth="120px"
            />
          </div>

          <span className="text-[#9b9b9b] text-sm ml-2">Precision</span>
          <div className="min-w-[90px]">
            <SelectMenu
              options={PRECISION_SELECT_OPTIONS}
              value={precisionOption}
              onChange={handlePrecisionChange}
              isClearable={false}
              menuWidth="100px"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${isConnected ? 'bg-[#3fb68b]' : 'bg-[#ff5353]'}`}
            title={isConnected ? 'Live' : 'Disconnected'}
          />
          <span className="text-xs text-[#9b9b9b]">
            {isConnected ? 'Live' : 'Reconnecting…'}
          </span>
          {error && <span className="text-xs text-[#ff5353]">{error}</span>}
        </div>
      </div>

      {/* Column headers */}
      <div className="shrink-0 bg-[#15191C]">
        <div className="grid grid-cols-[1fr_1fr_1fr] gap-2 px-3 py-2.5 text-xs font-medium text-[#e5e7eb]">
          <div>Price</div>
          <div className="text-right">Size ({symbol})</div>
          <div className="text-right">Total ({symbol})</div>
        </div>
        <div className="h-px w-full bg-[#6EE7B7]/40" aria-hidden />
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-auto border-b border-[#2d2d2d]">
          <OrderBookSide
            levels={asks}
            isBid={false}
            formatPrice={formatPrice}
            formatSize={formatSize}
          />
        </div>

        <div className="shrink-0 px-4 py-2 bg-[#1c1c21] border-y border-[#2d2d2d] flex items-center justify-between text-sm">
          <span className="text-[#9b9b9b]">Spread</span>
          {spread ? (
            <span className="text-[#c7c7c7] tabular-nums">
              {formatPrice(String(spread.spread))}
              <span className="text-[#9b9b9b] ml-1">
                ({formatPrice(String(spread.bidPx))} /{' '}
                {formatPrice(String(spread.askPx))})
              </span>
            </span>
          ) : (
            <span className="text-[#9b9b9b]">—</span>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-auto">
          <OrderBookSide
            levels={bids}
            isBid={true}
            formatPrice={formatPrice}
            formatSize={formatSize}
          />
        </div>
      </div>
    </div>
  );
}
