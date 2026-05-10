import ProductsList from '@/app/ssr-products/_components/ProductsList';
import { Skeleton } from '@mui/material';
import { Suspense } from 'react';

const Page = () => {
  return (
    <div className="bg-black p-10 min-h-screen h-full">
      <h1 className="text-2xl font-bold text-white">SSR Products</h1>

      <Suspense
        fallback={
          <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(12)].map((_, index) => (
              <article
                key={index}
                className="rounded-sm bg-gray-700 text-white h-[400px]"
              >
                <Skeleton
                  variant="rectangular"
                  height={400}
                  animation="wave"
                  className="w-full rounded"
                />
              </article>
            ))}
          </div>
        }
      >
        <ProductsList />
      </Suspense>
    </div>
  );
};

export default Page;
