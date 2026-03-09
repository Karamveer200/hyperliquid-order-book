import { memo, useEffect, useRef } from 'react';
import type { WsLevel } from '@/lib/hyperliquid/ws-types';
import { ROW_HEIGHT_PX } from '@/components/OrderBook/utils/constants';

const FLASH_CLASS = 'order-book-row-flash';
const FLASH_DURATION_MS = 500;

interface OrderBookRowProps {
  level: WsLevel;
  depthPercent: number;
  total: number;
  isBid: boolean;
}

const priceFormatter = new Intl.NumberFormat('en', {
  notation: 'compact',
  maximumFractionDigits: 2,
});

function OrderBookRowComponent(props: OrderBookRowProps) {
  const { level, depthPercent, total, isBid } = props;
  const prevRef = useRef<{ px: string } | null>(null);
  const rowRef = useRef<HTMLDivElement>(null);

  // Performance debugging logs
  useEffect(() => {
    if (prevRef.current && prevRef.current.px !== level.px) {
      const el = rowRef.current;

      // Not sure about the exact scenario of flashing
      // Clarify with the team

      // if (el) {
      //   el.classList.add(FLASH_CLASS);

      //   const t = setTimeout(() => {
      //     el.classList.remove(FLASH_CLASS);
      //   }, FLASH_DURATION_MS);

      //   return () => clearTimeout(t);
      // }
    }

    prevRef.current = { px: level.px };
  }, [level.px]);

  const priceColor = isBid ? 'text-sys-bid' : 'text-sys-ask';

  const totalValue = priceFormatter.format(total);

  return (
    <div
      ref={rowRef}
      className="relative flex items-center text-xs group transition-colors"
      style={{ height: `${ROW_HEIGHT_PX}px` }}
    >
      <div
        className={`absolute inset-y-0 right-0 opacity-[0.2] transition-[width] duration-150 ease-out ${
          isBid ? 'bg-sys-bid' : 'bg-sys-ask'
        }`}
        style={{ width: `${depthPercent}%` }}
      />
      <div className="relative z-10 grid w-full grid-cols-[1fr_1fr_1fr] gap-2 px-3">
        <span
          className={`tabular-nums ${priceColor} group-hover:font-bold group-hover:text-white`}
        >
          {Number(level.px).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>

        <span className="tabular-nums text-center text-white group-hover:font-bold">
          {Number(level.sz).toLocaleString(undefined, {
            maximumFractionDigits: 4,
          })}
        </span>

        <span className="tabular-nums text-right text-white group-hover:font-bold">
          {totalValue}
        </span>
      </div>
    </div>
  );
}

export const OrderBookRow = memo(
  OrderBookRowComponent,
  (prevProps, nextProps) => {
    const { level: prevLevel } = prevProps;
    const { level: nextLevel } = nextProps;

    return (
      prevLevel.px === nextLevel.px &&
      prevLevel.sz === nextLevel.sz &&
      prevLevel.n === nextLevel.n &&
      prevProps.depthPercent === nextProps.depthPercent &&
      prevProps.total === nextProps.total &&
      prevProps.isBid === nextProps.isBid
    );
  }
);
