'use client';

import React, { useState } from 'react';
import { FilterOptions } from '@/data/types';

interface FilterSidebarProps {
    onFilterChange: (filters: FilterOptions) => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({ onFilterChange }) => {
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
    const [inStockOnly, setInStockOnly] = useState(false);
    const [sortBy, setSortBy] = useState<FilterOptions['sortBy']>('newest');

    const handleApplyFilters = () => {
        onFilterChange({
            priceRange,
            inStockOnly,
            sortBy,
        });
    };

    const handleReset = () => {
        setPriceRange([0, 2000]);
        setInStockOnly(false);
        setSortBy('newest');
        onFilterChange({});
    };

    return (
        <div className="space-y-6">
            {/* Sort By */}
            <div className="card p-6">
                <h3 className="font-display font-bold text-lg text-white mb-4">Sort By</h3>
                <select
                    value={sortBy}
                    onChange={(e) => {
                        const newSort = e.target.value as FilterOptions['sortBy'];
                        setSortBy(newSort);
                        onFilterChange({ sortBy: newSort, priceRange, inStockOnly });
                    }}
                    className="input w-full"
                >
                    <option value="newest">Newest First</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="name">Name: A to Z</option>
                </select>
            </div>

            {/* Price Range */}
            <div className="card p-6">
                <h3 className="font-display font-bold text-lg text-white mb-4">Price Range</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-slate-300">
                        <span>₹{priceRange[0]}</span>
                        <span>₹{priceRange[1]}</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="2000"
                        step="100"
                        value={priceRange[1]}
                        onChange={(e) => {
                            const newMax = parseInt(e.target.value);
                            setPriceRange([priceRange[0], newMax]);
                        }}
                        onMouseUp={handleApplyFilters}
                        onTouchEnd={handleApplyFilters}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                </div>
            </div>

            {/* Availability */}
            <div className="card p-6">
                <h3 className="font-display font-bold text-lg text-white mb-4">Availability</h3>
                <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                        type="checkbox"
                        checked={inStockOnly}
                        onChange={(e) => {
                            setInStockOnly(e.target.checked);
                            onFilterChange({ inStockOnly: e.target.checked, priceRange, sortBy });
                        }}
                        className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-purple-500 focus:ring-2 focus:ring-purple-500/20"
                    />
                    <span className="text-slate-300 group-hover:text-white transition-colors">In Stock Only</span>
                </label>
            </div>

            {/* Reset Button */}
            <button
                onClick={handleReset}
                className="w-full btn-ghost"
            >
                Reset Filters
            </button>
        </div>
    );
};

export default FilterSidebar;
