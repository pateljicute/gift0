import { getAllProducts } from '@/data/products';
import HomeProductGrid from '@/components/home/HomeProductGrid';

// Revalidate every 5 minutes (ISR) - Improves performance significantly
export const revalidate = 300;

export default async function HomePage() {
  // Fetch ALL data from Supabase
  const products = await getAllProducts();

  if (!products) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="overflow-x-hidden min-h-screen bg-slate-950">
      <div className="container-custom py-8">
        <HomeProductGrid products={products} />
      </div>
    </div>
  );
}