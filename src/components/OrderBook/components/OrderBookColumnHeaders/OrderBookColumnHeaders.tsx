'use client';

interface OrderBookColumnHeadersProps {
  symbol: string;
}

export function OrderBookColumnHeaders({
  symbol,
}: OrderBookColumnHeadersProps) {
  return (
    <div className="shrink-0 bg-sys-surface-elevated">
      <div className="grid grid-cols-[1fr_1fr_1fr] gap-2 px-3 py-2.5 text-xs font-medium text-white">
        <div>Price</div>
        <div className="text-center">Size ({symbol})</div>
        <div className="text-right">Total ($)</div>
      </div>
      <div className="h-px w-full bg-sys-divider/40" aria-hidden />
    </div>
  );
}
