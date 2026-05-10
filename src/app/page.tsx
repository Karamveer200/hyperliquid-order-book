import Link from 'next/link';

export default function RootPage() {
  return (
    <div className="relative h-screen w-full bg-black">
      <button className="text-sys-green">
        <Link href="/ssr-products" className="text-sys-green">
          SSR Products
        </Link>

        <Link href="/flow-products" className="text-sys-green">
          SSR Products
        </Link>
      </button>
    </div>
  );
}
