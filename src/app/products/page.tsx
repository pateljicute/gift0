'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  image_url?: string;
  images?: string[];
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error.message);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Our Products
        </h1>
        <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
          Browse our collection of premium products
        </p>
      </div>

      <div className="mt-12 grid gap-5 max-w-lg mx-auto lg:grid-cols-3 lg:max-w-none">
        {products.map((product) => (
          <div key={product.id} className="flex flex-col overflow-hidden rounded-lg shadow-lg">
            <div className="flex-shrink-0 relative h-48 w-full bg-gray-200">
              {product.images && product.images.length > 0 ? (
                <img
                  className="h-full w-full object-cover"
                  src={product.images[0]}
                  alt={product.name}
                />
              ) : product.image_url ? (
                <img
                  className="h-full w-full object-cover"
                  src={product.image_url}
                  alt={product.name}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
              )}
            </div>
            <div className="flex flex-1 flex-col justify-between bg-white p-6">
              <div className="flex-1">
                <div className="mt-2 block">
                  <p className="text-xl font-semibold text-gray-900">{product.name}</p>
                  <p className="mt-3 text-base text-gray-500">{product.description}</p>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <p className="text-2xl font-bold text-gray-900">${product.price.toFixed(2)}</p>
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}