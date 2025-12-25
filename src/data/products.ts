import { createClient } from '@/utils/supabase/server';
import { Product, Category } from './types';
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from './mock_data';

// Dynamic Server Client
const getSupabase = () => {
    return createClient();
};

// Helper for consistent error handling and logging
function handleFetchError(context: string, error: any) {
    console.warn(`[Supabase Error] ${context}:`, error?.message || error);
    console.info(`[Fallback] Using mock data for ${context}`);
}

// Helper to map DB result to Product type
function transformProduct(dbProduct: any): Product {
    const isSale = dbProduct.sale_price !== null && Number(dbProduct.sale_price) < Number(dbProduct.price);
    const categorySlug = dbProduct.category?.slug || 'gift-items';

    return {
        id: dbProduct.id,
        name: dbProduct.name,
        slug: dbProduct.slug,
        description: dbProduct.description || '',
        price: isSale ? Number(dbProduct.sale_price) : Number(dbProduct.price),
        originalPrice: isSale ? Number(dbProduct.price) : undefined,
        category: categorySlug,
        images: dbProduct.images || [],
        inStock: (dbProduct.stock || 0) > 0,
        is_featured: dbProduct.is_featured,
        is_archived: false,
        variants: [],
        rating: 5,
        reviewCount: 0,
        specifications: dbProduct.specifications || {},
        delivery_charge: Number(dbProduct.delivery_charge) || 40,
        weight: Number(dbProduct.weight) || 0,
        dimensions: dbProduct.dimensions || undefined
    };
}

// Helper to map DB category
function transformCategory(dbCategory: any): Category {
    return {
        id: dbCategory.id,
        name: dbCategory.name,
        slug: dbCategory.slug,
        description: dbCategory.description || '',
        image: dbCategory.image_url || '',
        productCount: 0
    };
}

// Fetch all categories
export async function getCategories(): Promise<Category[]> {
    try {
        const supabase = getSupabase();
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('name');

        if (error) throw error;
        return (data || []).map(transformCategory);

    } catch (error) {
        handleFetchError('getCategories', error);
        return MOCK_CATEGORIES;
    }
}

// Fetch a single category by slug
export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
    try {
        const supabase = getSupabase();
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .eq('slug', slug)
            .single();

        if (error || !data) throw error;
        return transformCategory(data);

    } catch (error) {
        // Only log if it's strictly a connection error, not just "not found"
        // But for "not found" in mock, we just search the array
        const mockCat = MOCK_CATEGORIES.find(c => c.slug === slug);
        if (mockCat) {
            handleFetchError('getCategoryBySlug (Fallback)', error);
            return mockCat;
        }
        return undefined;
    }
}

// Fetch products by category
export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
    try {
        const supabase = getSupabase();
        // First get category ID
        const { data: category, error: catError } = await supabase
            .from('categories')
            .select('id')
            .eq('slug', categorySlug)
            .single();

        if (catError || !category) throw catError || new Error('Category not found');

        const { data, error } = await supabase
            .from('products')
            .select(`
            *,
            category:categories(slug)
        `)
            .eq('category_id', category.id)
            .eq('is_archived', false) // Only active products
            .order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []).map(transformProduct);

    } catch (error) {
        handleFetchError('getProductsByCategory', error);
        return MOCK_PRODUCTS.filter(p => p.category === categorySlug);
    }
}

// Fetch featured products
export async function getFeaturedProducts(limit = 4): Promise<Product[]> {
    try {
        const supabase = getSupabase();
        const { data, error } = await supabase
            .from('products')
            .select(`
            *,
            category:categories(slug)
        `)
            .eq('is_featured', true)
            .eq('is_archived', false)
            .limit(limit);

        if (error) throw error;
        return (data || []).map(transformProduct);

    } catch (error) {
        handleFetchError('getFeaturedProducts', error);
        return MOCK_PRODUCTS.filter(p => p.is_featured).slice(0, limit);
    }
}

// Fetch single product by ID or Slug
export async function getProductById(idOrSlug: string): Promise<Product | undefined> {
    try {
        const supabase = getSupabase();
        // Check if it's a UUID
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
        const field = isUuid ? 'id' : 'slug';

        const { data, error } = await supabase
            .from('products')
            .select(`
          *,
          category:categories(slug)
        `)
            .eq(field, idOrSlug)
            .single();

        if (error || !data) throw error;
        return transformProduct(data);

    } catch (error) {
        const mockProduct = MOCK_PRODUCTS.find(p => p.id === idOrSlug || p.slug === idOrSlug);
        if (mockProduct) {
            handleFetchError('getProductById (Fallback)', error);
            return mockProduct;
        }
        return undefined;
    }
}

// Fetch related products
export async function getRelatedProducts(productId: string, categorySlug: string, limit = 4): Promise<Product[]> {
    try {
        const supabase = getSupabase();
        const { data, error } = await supabase
            .from('products')
            .select(`
            *,
            category:categories!inner(slug)
        `)
            .eq('category.slug', categorySlug)
            .neq('id', productId)
            .eq('is_archived', false)
            .limit(limit);

        if (error) throw error;
        return (data || []).map(transformProduct);

    } catch (error) {
        handleFetchError('getRelatedProducts', error);
        return MOCK_PRODUCTS.filter(p => p.category === categorySlug && p.id !== productId).slice(0, limit);
    }
}

// Fetch ALL products (for Homepage)
export async function getAllProducts(): Promise<Product[]> {
    console.log('[API] Fetching all public products...');
    try {
        const supabase = getSupabase();
        const { data, error } = await supabase
            .from('products')
            .select(`
            id,
            name,
            slug,
            price,
            sale_price,
            stock,
            images,
            is_featured,
            specifications,
            category:categories(slug)
        `)
            .eq('is_archived', false)
            .order('created_at', { ascending: false });

        if (error) throw error;

        console.log(`[API] Successfully fetched ${data?.length || 0} products.`);
        return (data || []).map(transformProduct);

    } catch (error) {
        handleFetchError('getAllProducts', error);
        return MOCK_PRODUCTS;
    }
}
