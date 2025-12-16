'use client';

import React, { useState } from 'react';
import { Product } from '@/data/types';
import ProductCard from '@/components/ui/ProductCard';

interface HomeProductGridProps {
    products: Product[];
}

export default function HomeProductGrid({ products }: HomeProductGridProps) {
    const [filter, setFilter] = useState<'all' | 'gift' | 'frames'>('all');

    const filteredProducts = products.filter(product => {
        if (filter === 'all') return true;
        if (filter === 'gift') return product.category === 'gift' || product.category === 'gift-items';
        if (filter === 'frames') return product.category === 'frames';
        return true;
    });

    return (
        <>
            {/* Title / Filter Area */}
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="font-display font-bold text-3xl text-white mb-2">
                        Explore All Products
                    </h1>
                    <p className="text-slate-400">
                        Discover our complete collection of personalized gifts and frames
                    </p>
                </div>

                {/* Filter Buttons */}
                <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'all'
                                ? 'bg-gradient-primary text-white shadow-lg shadow-purple-500/30'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter('gift')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'gift'
                                ? 'bg-gradient-primary text-white shadow-lg shadow-purple-500/30'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                    >
                        Gifts
                    </button>
                    <button
                        onClick={() => setFilter('frames')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'frames'
                                ? 'bg-gradient-primary text-white shadow-lg shadow-purple-500/30'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                    >
                        Frames
                    </button>
                </div>
            </div>

            {/* Full Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product, index) => (
                    <div
                        key={product.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}
                    >
                        <ProductCard product={product} />
                    </div>
                ))}
            </div>

            {filteredProducts.length === 0 && (
                <div className="text-center py-20 bg-slate-900 rounded-2xl border border-slate-800">
                    <h2 className="text-xl text-slate-400">No products found in this category</h2>
                </div>
            )}
        </>
    );
}
