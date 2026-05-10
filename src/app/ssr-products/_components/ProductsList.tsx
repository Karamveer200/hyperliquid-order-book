import type { Product } from '@/app/ssr-products/_hooks/useGetProducts';
import { getProducts } from '@/lib/config/apis';
import Image from 'next/image';

const ProductsList = async () => {
  const products = await getProducts();

  return (
    <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
      {products?.map((product: Product) => (
        <article
          key={product.id}
          className="rounded-sm bg-gray-700 p-4 text-white"
        >
          <Image
            src={product.image}
            alt={product.title}
            loading="lazy"
            height={200}
            width={200}
            className="mb-4 rounded bg-white p-4"
          />

          <h2 className="line-clamp-2 font-semibold text-sys-green">
            {product.title}
          </h2>

          <p className="mt-2 text-sm text-white/70">{product.category}</p>

          <p className="mt-4 font-bold">${product.price}</p>
        </article>
      ))}
    </div>
  );
};

export default ProductsList;
