'use client';

import { OrderBookWidget } from '@/components/OrderBook/OrderBookWidget';

export default function Home() {
  return (
    <div className="flex h-screen w-full flex-col bg-[#0d0d0f]">
      <div className="flex min-h-0 flex-1 flex-col items-center md:px-4">
        <div className="h-full w-full max-w-md">
          <OrderBookWidget />
        </div>
      </div>
    </div>
  );
}
