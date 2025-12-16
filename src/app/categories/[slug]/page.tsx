import React from 'react';
import { notFound } from 'next/navigation';
import { getCategoryBySlug, getProductsByCategory } from '@/data/products';
import CategoryPageClient from '@/components/category/CategoryPageClient';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface CategoryPageProps {
    params: {
        slug: string;
    };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
    const category = await getCategoryBySlug(params.slug);

    if (!category) {
        notFound();
    }

    const products = await getProductsByCategory(params.slug);

    return <CategoryPageClient category={category} initialProducts={products} />;
}
