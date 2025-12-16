import { Product, FilterOptions } from '@/data/types';

// Filter products
export const filterProducts = (products: Product[], filters: FilterOptions): Product[] => {
    let filtered = [...products];

    // Filter by price range
    if (filters.priceRange) {
        const [min, max] = filters.priceRange;
        filtered = filtered.filter((p) => p.price >= min && p.price <= max);
    }

    // Filter by stock
    if (filters.inStockOnly) {
        filtered = filtered.filter((p) => p.inStock);
    }

    return filtered;
};

// Sort products
export const sortProducts = (products: Product[], sortBy: FilterOptions['sortBy']): Product[] => {
    const sorted = [...products];

    switch (sortBy) {
        case 'price-asc':
            return sorted.sort((a, b) => a.price - b.price);
        case 'price-desc':
            return sorted.sort((a, b) => b.price - a.price);
        case 'name':
            return sorted.sort((a, b) => a.name.localeCompare(b.name));
        case 'newest':
            // Assuming products are already in newest-first order
            return sorted;
        default:
            return sorted;
    }
};

// Search products
export const searchProducts = (products: Product[], query: string): Product[] => {
    const lowerQuery = query.toLowerCase();
    return products.filter(
        (p) =>
            p.name.toLowerCase().includes(lowerQuery) ||
            p.description.toLowerCase().includes(lowerQuery) ||
            p.category.toLowerCase().includes(lowerQuery)
    );
};

// Get related products
export const getRelatedProducts = (product: Product, allProducts: Product[], limit = 4): Product[] => {
    return allProducts
        .filter((p) => p.id !== product.id && p.category === product.category)
        .slice(0, limit);
};

// Calculate discount percentage
export const getDiscountPercentage = (originalPrice: number, currentPrice: number): number => {
    if (!originalPrice || originalPrice <= currentPrice) return 0;
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
};
