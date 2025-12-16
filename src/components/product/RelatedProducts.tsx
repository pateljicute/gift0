'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from '@/data/types';
import ProductCard from '../ui/ProductCard';

interface RelatedProductsProps {
    products: Product[];
}

const RelatedProducts: React.FC<RelatedProductsProps> = ({ products }) => {
    if (!products || products.length === 0) return null;

    // We can assume the passed products share the category or are relevant
    // The parent component is responsible for fetching the right ones
    const currentCategory = products[0]?.category; // Infer category for "View All" link


    return (
        <section className="py-16">
            <div className="flex items-center justify-between mb-8">
                <h2 className="font-display font-bold text-3xl text-white">You May Also Like</h2>
                <Link
                    href={currentCategory ? `/categories/${currentCategory}` : '/categories/gift-items'}
                    className="text-purple-400 hover:text-purple-300 transition-colors text-sm font-medium"
                >
                    View All
                </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((product, index) => (
                    <div
                        key={product.id}
                        className="animate-slide-up"
                        style={{ animationDelay: `${index * 0.1}s` }}
                    >
                        <ProductCard product={product} />
                    </div>
                ))}
            </div>
        </section>
    );
};

export default RelatedProducts;
