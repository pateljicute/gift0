'use client';

import React, { useState } from 'react';
import { Product } from '@/data/types';
import ImageGallery from '@/components/product/ImageGallery';
import RelatedProducts from '@/components/product/RelatedProducts';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { useCart } from '@/contexts/CartContext';

interface ProductPageClientProps {
    product: Product;
    relatedProducts: Product[];
}

export default function ProductPageClient({ product, relatedProducts }: ProductPageClientProps) {
    const { addToCart } = useCart();
    const [quantity, setQuantity] = useState(1);
    const [selectedVariant, setSelectedVariant] = useState<string>('');
    const [activeTab, setActiveTab] = useState('description');

    const handleQuantityChange = (delta: number) => {
        const newQuantity = quantity + delta;
        if (newQuantity >= 1 && newQuantity <= product.stock) {
            setQuantity(newQuantity);
        }
    };

    const handleAddToCart = () => {
        addToCart(product, quantity, selectedVariant ? { variant: selectedVariant } : undefined);
    };

    const discountPercentage = product.salePrice
        ? Math.round(((product.price - product.salePrice) / product.price) * 100)
        : 0;

    return (
        <div className="container-custom py-12">
            {/* Breadcrumbs */}
            <nav className="flex items-center text-sm text-slate-400 mb-8 animate-fade-in">
                <a href="/" className="hover:text-purple-400 transition-colors">Home</a>
                <span className="mx-2">/</span>
                <a href={`/categories/${product.category}`} className="hover:text-purple-400 transition-colors capitalize">
                    {product.category.replace('-', ' ')}
                </a>
                <span className="mx-2">/</span>
                <span className="text-white font-medium truncate max-w-[200px]">{product.name}</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                {/* Image Gallery */}
                <div className="animate-slide-up">
                    <ImageGallery images={product.images} productName={product.name} />
                </div>

                {/* Product Info */}
                <div className="space-y-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            {product.isFeatured && <Badge variant="primary">Featured</Badge>}
                            {product.stock > 0 ? (
                                <Badge variant="success">In Stock</Badge>
                            ) : (
                                <Badge variant="error">Out of Stock</Badge>
                            )}
                        </div>
                        <h1 className="font-display font-bold text-3xl md:text-4xl text-white mb-4">
                            {product.name}
                        </h1>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="flex items-center text-yellow-500">
                                {[...Array(5)].map((_, i) => (
                                    <svg
                                        key={i}
                                        className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-slate-600'}`}
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                                <span className="ml-2 text-slate-400 text-sm">({product.reviews} reviews)</span>
                            </div>
                        </div>
                        <div className="flex items-baseline gap-4">
                            <span className="text-3xl font-bold bg-gradient-brand bg-clip-text text-transparent">
                                ₹{product.salePrice || product.price}
                            </span>
                            {product.salePrice && (
                                <>
                                    <span className="text-xl text-slate-500 line-through">
                                        ₹{product.price}
                                    </span>
                                    <span className="text-green-400 text-sm font-medium">
                                        Save {discountPercentage}%
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    <p className="text-slate-300 leading-relaxed text-lg">
                        {product.description}
                    </p>

                    {/* Variants */}
                    {product.variants && product.variants.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="font-medium text-white">Available Options</h3>
                            <div className="flex flex-wrap gap-3">
                                {product.variants.map((variant) => (
                                    <button
                                        key={variant}
                                        onClick={() => setSelectedVariant(variant)}
                                        className={`px-4 py-2 rounded-lg border transition-all ${selectedVariant === variant
                                            ? 'border-purple-500 bg-purple-500/10 text-purple-300'
                                            : 'border-slate-700 text-slate-400 hover:border-slate-600'
                                            }`}
                                    >
                                        {variant}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-800">
                        <div className="flex items-center border border-slate-700 rounded-lg bg-[#0f0f23]">
                            <button
                                onClick={() => handleQuantityChange(-1)}
                                disabled={quantity <= 1}
                                className="px-4 py-3 text-slate-400 hover:text-white disabled:opacity-50 transition-colors"
                            >
                                -
                            </button>
                            <span className="w-12 text-center font-medium text-white">{quantity}</span>
                            <button
                                onClick={() => handleQuantityChange(1)}
                                disabled={quantity >= product.stock}
                                className="px-4 py-3 text-slate-400 hover:text-white disabled:opacity-50 transition-colors"
                            >
                                +
                            </button>
                        </div>
                        <div className="flex-1">
                            <Button
                                fullWidth
                                size="lg"
                                onClick={handleAddToCart}
                                disabled={product.stock === 0}
                                className="h-[50px]"
                            >
                                {product.stock > 0 ? 'ADD TO CART' : 'Out of Stock'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="mb-20">
                <div className="flex border-b border-slate-800 mb-8 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('description')}
                        className={`px-8 py-4 font-medium text-lg border-b-2 transition-colors whitespace-nowrap ${activeTab === 'description'
                            ? 'border-purple-500 text-purple-400'
                            : 'border-transparent text-slate-400 hover:text-white'
                            }`}
                    >
                        Description
                    </button>
                    <button
                        onClick={() => setActiveTab('specs')}
                        className={`px-8 py-4 font-medium text-lg border-b-2 transition-colors whitespace-nowrap ${activeTab === 'specs'
                            ? 'border-purple-500 text-purple-400'
                            : 'border-transparent text-slate-400 hover:text-white'
                            }`}
                    >
                        Specifications
                    </button>
                    <button
                        onClick={() => setActiveTab('reviews')}
                        className={`px-8 py-4 font-medium text-lg border-b-2 transition-colors whitespace-nowrap ${activeTab === 'reviews'
                            ? 'border-purple-500 text-purple-400'
                            : 'border-transparent text-slate-400 hover:text-white'
                            }`}
                    >
                        Reviews ({product.reviews})
                    </button>
                </div>

                <div className="min-h-[200px] text-slate-300 leading-relaxed">
                    {activeTab === 'description' && (
                        <div className="animate-fade-in space-y-4">
                            <p>{product.description}</p>
                            <p>

                            </p>
                        </div>
                    )}
                    {activeTab === 'specs' && (
                        <div className="animate-fade-in">
                            <ul className="space-y-3 list-disc pl-5">
                                <li>Premium Materials</li>
                                <li>High-quality finish</li>
                                <li>Durable construction</li>
                                <li>Carefully packaged</li>
                            </ul>
                        </div>
                    )}
                    {activeTab === 'reviews' && (
                        <div className="animate-fade-in">
                            <div className="grid gap-6">
                                {/* Mock Review */}
                                <div className="bg-[#1a1a2e] p-6 rounded-xl border border-slate-800">
                                    <div className="flex items-center gap-2 mb-2 text-yellow-500">
                                        {[...Array(5)].map((_, i) => (
                                            <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        ))}
                                    </div>
                                    <h4 className="font-bold text-white mb-1">Excellent Quality!</h4>
                                    <p className="text-slate-400 text-sm mb-3">by Happy Customer</p>
                                    <p className="text-slate-300">
                                        Really impressed with the quality and finish. It looks exactly like the pictures
                                        and arrived very quickly. Will definitely buy again!
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <RelatedProducts products={relatedProducts} />
        </div>
    );
}
