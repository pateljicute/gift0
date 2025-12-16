import React from 'react';
import Link from 'next/link';
import ProductCard from '../ui/ProductCard';
import Button from '../ui/Button';
import { Product } from '@/data/types';

interface FeaturedProductsProps {
    products: Product[];
}

const FeaturedProducts: React.FC<FeaturedProductsProps> = ({ products }) => {
    return (
        <section className="py-16 md:py-24 bg-gradient-to-b from-transparent to-[#0f0f23]/50">
            <div className="container-custom">
                <div className="flex items-end justify-between mb-12">
                    <div>
                        <h2 className="font-display font-bold text-4xl md:text-5xl text-white mb-4">
                            Featured Products
                        </h2>
                        <p className="text-slate-400 text-lg">
                            Handpicked favorites loved by our customers
                        </p>
                    </div>
                    <Link href="/categories/gift-items" className="hidden md:block">
                        <Button variant="outline">
                            View All
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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

                <div className="mt-8 text-center md:hidden">
                    <Link href="/categories/gift-items">
                        <Button variant="outline" fullWidth>
                            View All Products
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default FeaturedProducts;
