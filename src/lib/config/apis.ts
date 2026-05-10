const FAKE_STORE_API_URL = 'https://fakestoreapi.com';

export const getProducts = async () => {
  const response = await fetch(`${FAKE_STORE_API_URL}/products`);

  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }

  return response.json();
};
