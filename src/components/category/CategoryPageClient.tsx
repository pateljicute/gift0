'use client';

import React, { useState, useMemo } from 'react';
import { Category, Product, FilterOptions } from '@/data/types';
import FilterSidebar from '@/components/category/FilterSidebar';
import ProductGrid from '@/components/category/ProductGrid';
import { filterProducts, sortProducts } from '@/utils/helpers';

interface CategoryPageClientProps {
    category: Category;
    initialProducts: Product[];
}

export default function CategoryPageClient({ category, initialProducts }: CategoryPageClientProps) {
    const [filterOptions, setFilterOptions] = useState<FilterOptions>({
        sort: 'newest',
        minPrice: 0,
        maxPrice: 10000,
        inStock: false,
    });

    const filteredProducts = useMemo(() => {
        let result = filterProducts(initialProducts, filterOptions);
        result = sortProducts(result, filterOptions.sort);
        return result;
    }, [initialProducts, filterOptions]);

    return (
        <div className="container-custom py-12">
            {/* Breadcrumbs */}
            <nav className="flex items-center text-sm text-slate-400 mb-8 animate-fade-in">
                <a href="/" className="hover:text-purple-400 transition-colors">Home</a>
                <span className="mx-2">/</span>
                <span className="text-white font-medium">{category.name}</span>
            </nav>

            {/* Header */}
            <div className="mb-12 animate-slide-up">
                <h1 className="font-display font-bold text-4xl md:text-5xl text-white mb-4">
                    {category.name}
                </h1>
                <p className="text-slate-400 text-lg max-w-2xl">
                    {category.description}
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Filters */}
                <aside className="lg:w-64 flex-shrink-0 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <FilterSidebar
                        options={filterOptions}
                        onChange={setFilterOptions}
                    />
                </aside>

                {/* Product Grid */}
                <main className="flex-1">
                    <div className="mb-6 flex items-center justify-between text-slate-400 text-sm">
                        <p>Showing {filteredProducts.length} results</p>
                    </div>

                    <ProductGrid products={filteredProducts} />
                </main>
            </div>
        </div>
    );
}
