import React from 'react';
import Link from 'next/link';
import { Category } from '@/data/types';

interface CategoryShowcaseProps {
    categories: Category[];
}

const CategoryShowcase: React.FC<CategoryShowcaseProps> = ({ categories }) => {
    return (
        <section id="categories" className="py-16 md:py-24">
            <div className="container-custom">
                <div className="text-center mb-12">
                    <h2 className="font-display font-bold text-4xl md:text-5xl text-white mb-4">
                        Shop by Category
                    </h2>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        Explore our curated collection of personalized gifts for every occasion
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map((category, index) => (
                        <Link
                            key={category.id}
                            href={`/categories/${category.slug}`}
                            className="group relative overflow-hidden rounded-2xl aspect-square animate-slide-up"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            {/* Background with Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-slate-900/60 to-pink-900/40 group-hover:from-purple-900/60 group-hover:to-pink-900/60 transition-all duration-500" />

                            {/* Decorative Pattern */}
                            <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:24px_24px]" />
                            </div>

                            {/* Content */}
                            <div className="relative h-full flex flex-col justify-end p-8 group-hover:-translate-y-2 transition-transform duration-500">
                                {/* Icon */}
                                <div className="mb-4 w-16 h-16 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:shadow-purple-500/50 group-hover:scale-110 transition-all duration-500">
                                    {category.slug === 'sublimation-mugs' && (
                                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                    )}
                                    {category.slug === 'frames' && (
                                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    )}
                                    {category.slug === 'gift-items' && (
                                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                                        </svg>
                                    )}
                                </div>

                                <h3 className="font-display font-bold text-2xl md:text-3xl text-white mb-2 group-hover:gradient-text transition-all">
                                    {category.name}
                                </h3>
                                <p className="text-slate-300 mb-3">{category.description}</p>
                                <div className="flex items-center text-purple-400 font-medium group-hover:text-purple-300 transition-colors">
                                    <span>Explore {category.productCount} products</span>
                                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </div>
                            </div>

                            {/* Border Glow Effect */}
                            <div className="absolute inset-0 rounded-2xl border border-purple-500/0 group-hover:border-purple-500/50 transition-all duration-500" />
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CategoryShowcase;
