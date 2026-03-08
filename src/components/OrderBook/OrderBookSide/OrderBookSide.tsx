'use client';

import { memo, useMemo, useState, useEffect, useRef } from 'react';
import type { WsLevel } from '@/lib/hyperliquid/ws-types';
import { OrderBookRow } from './OrderBookRow/OrderBookRow';

const ROW_HEIGHT_PX = 24;

interface OrderBookSideProps {
  levels: WsLevel[];
  isBid: boolean;
  formatPrice: (px: string) => string;
  formatSize: (sz: string) => string;
}

function OrderBookSideComponent({
  levels,
  isBid,
  formatPrice,
  formatSize,
}: OrderBookSideProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { height } = entries[0]?.contentRect ?? { height: 0 };
      setContainerHeight(height);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const maxOrdersToShow = Math.min(
    18,
    Math.floor(containerHeight / ROW_HEIGHT_PX)
  );

  const rowCount = Math.max(0, maxOrdersToShow);

  const { rows } = useMemo(() => {
    const sorted = [...levels].sort((a, b) => Number(b.px) - Number(a.px));

    const slice = isBid ? sorted.slice(0, rowCount) : sorted.slice(-rowCount);

    const levelsForCum = isBid ? slice : [...slice].reverse();

    let cum = 0;

    const withCumulative = levelsForCum.map((level) => {
      const size = Number(level.sz);
      const price = Number(level.px);

      cum += size;

      return {
        level,
        cumulative: cum,
        notional: size * price,
      };
    });

    const max = cum || 1;

    const final = isBid ? withCumulative : withCumulative.reverse();

    return {
      rows: final.map(({ level, cumulative, notional }) => ({
        level,
        depthPercent: (cumulative / max) * 100,
        total: notional,
      })),
    };
  }, [levels, isBid, rowCount]);

  return (
    <div ref={containerRef} className="flex h-full min-h-0 flex-col">
      {rows.map(({ level, depthPercent, total }) => (
        <OrderBookRow
          key={level.px}
          level={level}
          depthPercent={depthPercent}
          total={total}
          isBid={isBid}
          formatPrice={formatPrice}
          formatSize={formatSize}
        />
      ))}
    </div>
  );
}

export const OrderBookSide = memo(OrderBookSideComponent);
