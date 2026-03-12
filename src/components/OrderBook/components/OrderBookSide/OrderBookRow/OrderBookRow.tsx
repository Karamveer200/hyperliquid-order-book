import { memo, useEffect, useRef } from 'react';
import type { WsLevel } from '@/lib/hyperliquid/ws-types';
import { ROW_HEIGHT_PX } from '@/components/OrderBook/utils/constants';
import { motion } from 'framer-motion';

interface OrderBookRowProps {
  level: WsLevel;
  depthPercent: number;
  total: number;
  isBid: boolean;
  isNew: boolean;
  isSwapped: boolean;
}

const priceFormatter = new Intl.NumberFormat('en', {
  notation: 'compact',
  maximumFractionDigits: 2,
});

function OrderBookRowComponent(props: OrderBookRowProps) {
  const { level, depthPercent, total, isBid } = props;
  const rowRef = useRef<HTMLDivElement>(null);

  const priceColor = isBid ? 'text-sys-bid' : 'text-sys-ask';

  const totalValue = priceFormatter.format(total);

  return (
    <motion.div
      ref={rowRef}
      className="relative flex items-center text-xs group transition-colors"
      style={{
        height: `${ROW_HEIGHT_PX}px`,
        animation: props.isSwapped ? 'order-book-row-flash' : 'none',
      }}
    >
      <div
        className={`absolute inset-y-0 right-0 opacity-[0.2] transition-[width] duration-150 ease-out ${
          isBid ? 'bg-sys-bid left-0 sm:right-0 sm:left-auto' : 'bg-sys-ask'
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
    </motion.div>
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
      prevProps.isBid === nextProps.isBid &&
      prevProps.isNew === nextProps.isNew &&
      prevProps.isSwapped === nextProps.isSwapped
    );
  }
);
