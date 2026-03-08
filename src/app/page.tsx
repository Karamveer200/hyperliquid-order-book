import { OrderBookWidget } from '@/components/OrderBook/OrderBookWidget';

export default function Home() {
  return (
    <div className="flex h-screen w-full flex-col bg-black">
      <div className="flex min-h-0 flex-1 flex-col items-center md:px-4">
        <div className="h-full w-full max-w-md pt-2 pb-5">
          <OrderBookWidget />
        </div>
      </div>
    </div>
  );
}
