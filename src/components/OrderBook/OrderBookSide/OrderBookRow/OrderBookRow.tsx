'use client';

import type { WsLevel } from '@/lib/hyperliquid/ws-types';

interface OrderBookRowProps {
  level: WsLevel;
  depthPercent: number;
  total: number;
  isBid: boolean;
}

export function OrderBookRow({
  level,
  depthPercent,
  total,
  isBid,
}: OrderBookRowProps) {
  const priceColor = isBid ? 'text-[#3fb68b]' : 'text-[#ff5353]';

  return (
    <div className="relative flex items-center h-6 text-xs">
      <div
        className={`absolute inset-y-0 right-0 opacity-[0.12] transition-[width] duration-150 ease-out ${
          isBid ? 'bg-[#3fb68b]' : 'bg-[#ff5353]'
        }`}
        style={{ width: `${depthPercent}%` }}
      />
      <div className="relative z-10 grid w-full grid-cols-[1fr_1fr_1fr] gap-2 px-3">
        <span className={`tabular-nums ${priceColor}`}>
          {Number(level.px).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>

        <span className="tabular-nums text-center text-[#c7c7c7]">
          {Number(level.sz).toLocaleString(undefined, {
            maximumFractionDigits: 4,
          })}
        </span>
        <span className="tabular-nums text-right text-[#c7c7c7]">
          {total.toLocaleString(undefined, {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2,
          })}
        </span>
      </div>
    </div>
  );
}
