'use client';

import useSWR from 'swr';
import { supabase } from '@/lib/supabaseClient';
import ProductCard from '@/components/ui/ProductCard';
import { Product } from '@/data/types';

const fetcher = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export default function ProductsPage() {
  const { data: products, error, isLoading } = useSWR<Product[]>('products', fetcher);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-12 text-red-500">Failed to load products.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen bg-slate-950">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl font-display">
          Our Products
        </h1>
        <p className="mt-3 max-w-2xl mx-auto text-xl text-slate-400 sm:mt-4">
          Browse our collection of premium products
        </p>
      </div>

      <div className="mt-12 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products?.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}