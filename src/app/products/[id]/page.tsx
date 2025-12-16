import React from 'react';
import { notFound } from 'next/navigation';
import { getProductById, getRelatedProducts } from '@/data/products';
import ProductPageClient from '@/components/product/ProductPageClient';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface ProductPageProps {
    params: {
        id: string;
    };
}

export default async function ProductPage({ params }: ProductPageProps) {
    const product = await getProductById(params.id);

    if (!product) {
        notFound();
    }

    const relatedProducts = await getRelatedProducts(product.id, product.category);

    return <ProductPageClient product={product} relatedProducts={relatedProducts} />;
}
