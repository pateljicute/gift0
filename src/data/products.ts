import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Product, Category } from './types';

// Dynamic Server Client
const getSupabase = () => {
    return createServerComponentClient({ cookies });
};

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
        featured: dbProduct.is_featured,
        variants: [],
        rating: 5,
        reviewCount: 0,
        specifications: {}
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
    const supabase = getSupabase();
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

    if (error) {
        console.error('Error fetching categories:', error);
        return [];
    }

    return (data || []).map(transformCategory);
}

// Fetch a single category by slug
export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const supabase = getSupabase();
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .single();

    if (error || !data) return undefined;

    return transformCategory(data);
}

// Fetch products by category
export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
    const supabase = getSupabase();
    // First get category ID
    const { data: category } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', categorySlug)
        .single();

    if (!category) return [];

    const { data, error } = await supabase
        .from('products')
        .select(`
        *,
        category:categories(slug)
    `)
        .eq('category_id', category.id)
        .eq('is_archived', false) // Only active products
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching products:', error);
        return [];
    }

    return (data || []).map(transformProduct);
}

// Fetch featured products
export async function getFeaturedProducts(limit = 4): Promise<Product[]> {
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

    if (error) return [];
    return (data || []).map(transformProduct);
}

// Fetch single product by ID or Slug
export async function getProductById(idOrSlug: string): Promise<Product | undefined> {
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

    if (error || !data) return undefined;

    return transformProduct(data);
}

// Fetch related products
export async function getRelatedProducts(productId: string, categorySlug: string, limit = 4): Promise<Product[]> {
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

    if (error) return [];
    return (data || []).map(transformProduct);
}

// Fetch ALL products (for Homepage)
export async function getAllProducts(): Promise<Product[]> {
    const supabase = getSupabase();
    console.log('[API] Fetching all public products (Server Client)...');

    // Explicitly set cache control if needed, but createServerComponentClient usually handles it.
    // For debugging, we remove the static client import which was the issue.

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
        category:categories(slug)
    `)
        .eq('is_archived', false)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('[API] Error fetching all products:', error);
        return [];
    }

    console.log(`[API] Successfully fetched ${data?.length || 0} products.`);
    return (data || []).map(transformProduct);
}
