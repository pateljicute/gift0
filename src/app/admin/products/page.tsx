'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

export default function AdminProductsPage() {
  const supabase = createClient();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select(`
          *,
          category:categories(name),
          likes:product_likes(count)
        `)
      .order('created_at', { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      // Transform data to include likes count
      const formattedData = (data || []).map((p: any) => ({
        ...p,
        likesCount: p.likes?.[0]?.count || 0
      }));
      setProducts(formattedData);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;
    setProducts(prev => prev.filter(p => p.id !== id));
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      alert('Error deleting product: ' + error.message);
      fetchProducts();
    }
  };

  if (error) { return <div className="p-8 text-red-400">Error: {error}</div>; }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl md:text-3xl font-display font-bold text-white">Products</h1>
        <Link href="/admin/products/add">
          <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm md:text-base">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add Product
          </button>
        </Link>
      </div>

      {loading ? (
        <div className="text-center text-slate-400 py-12">Loading products...</div>
      ) : (!products || products.length === 0) ? (
        <div className="text-center text-slate-400 py-12 bg-slate-800 rounded-xl border border-slate-700">
          No products found.
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-900/50 border-b border-slate-700">
                    <th className="px-6 py-4 text-slate-400 font-medium font-display">Product</th>
                    <th className="px-6 py-4 text-slate-400 font-medium font-display">Category</th>
                    <th className="px-6 py-4 text-slate-400 font-medium font-display">Likes</th>
                    <th className="px-6 py-4 text-slate-400 font-medium font-display">Price</th>
                    <th className="px-6 py-4 text-slate-400 font-medium font-display">Stock</th>
                    <th className="px-6 py-4 text-slate-400 font-medium font-display text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-700/30 transition-colors">
                      {/* Product Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-700 overflow-hidden flex-shrink-0 relative">
                            {product.images?.[0] ? <img src={product.images[0]} className="w-full h-full object-cover" /> : <div className="text-xs flex items-center justify-center h-full text-slate-500">No Img</div>}
                          </div>
                          <div>
                            <p className="text-white font-medium flex items-center gap-2">
                              {product.name}
                              {product.is_archived && (
                                <span className="bg-red-500/20 text-red-400 text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider">Archived</span>
                              )}
                            </p>
                            <p className="text-xs text-slate-500 truncate max-w-[150px]">{product.slug}</p>
                          </div>
                        </div>
                      </td>
                      {/* Category */}
                      <td className="px-6 py-4 text-slate-300 capitalize">{product.category?.name || 'Uncategorized'}</td>

                      {/* Likes (NEW) */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-pink-400">
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" /></svg>
                          <span className="font-medium">{product.likesCount || 0}</span>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="px-6 py-4 text-slate-300">₹{product.price}</td>

                      {/* Stock */}
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.stock > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {product.stock} in stock
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/products/${product.slug}`} target="_blank">
                            <button className="p-2 text-slate-400 hover:text-white rounded hover:bg-slate-700" title="View on Site">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                          </Link>
                          <Link href={`/admin/products/edit/${product.id}`}>
                            <button className="p-2 text-slate-400 hover:text-white rounded hover:bg-slate-700" title="Edit">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                          </Link>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-2 text-slate-400 hover:text-red-400 rounded hover:bg-slate-700"
                            title="Delete"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {products.map((product) => (
              <div key={product.id} className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-lg bg-slate-700 overflow-hidden flex-shrink-0 relative">
                      {product.images && product.images[0] ? (
                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">No Img</div>
                      )}
                    </div>
                    <div>
                      <p className="text-white font-medium text-lg">{product.name}</p>
                      <p className="text-sm text-slate-400">
                        {/* @ts-ignore */}
                        {product.category?.name || 'Uncategorized'}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Link href={`/products/${product.slug}`} target="_blank">
                      <button className="p-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600" title="View on Site">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-2 bg-red-900/30 text-red-400 rounded-lg hover:bg-red-900/50"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-700 pt-4">
                  <div>
                    <span className="text-slate-400 text-sm">Price</span>
                    <p className="text-xl font-bold text-white">₹{product.price}</p>
                  </div>

                  <div className="text-right">
                    <span className="text-slate-400 text-sm">Status</span>
                    <div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.stock > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {product.stock} in stock
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
