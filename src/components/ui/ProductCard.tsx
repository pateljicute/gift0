'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/components/auth/AuthProvider';
import { Product } from '@/data/types';
import { formatCurrency } from '@/utils/format';
import { getDiscountPercentage } from '@/utils/helpers';
import { useCart } from '@/contexts/CartContext';
import Button from './Button';
import Badge from './Badge';

interface ProductCardProps {
    product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const { addToCart } = useCart();
    const { user } = useAuth(); // Check if logged in

    // PRICING LOGIC
    // Logged OUT (Guest) = 50% OFF
    // Logged IN = Normal Percentage (if any)
    const isGuest = !user;

    // If guest, displayed price is 50% of original. 
    // We treat the "database price" as the "Original Market Price" in this context
    const displayPrice = isGuest ? product.price * 0.5 : product.price;
    const originalPrice = product.price; // Always show the base price as anchor

    const discountPercentage = isGuest ? 50 : (product.originalPrice ? getDiscountPercentage(product.originalPrice, product.price) : 0);

    const isGift = product.category === 'gift' || product.category === 'gift-items';
    const isFrame = product.category === 'frames';

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(product, 1);
    };

    return (
        <Link href={`/products/${product.slug}`} className="block group">
            <div className="card-hover h-full flex flex-col overflow-hidden bg-slate-900 border border-slate-800 rounded-xl">
                {/* Image */}
                <div className="relative h-64 bg-slate-800 overflow-hidden">
                    <div className="hover-zoom w-full h-full relative">
                        <Image
                            src={product.images?.[0] || '/placeholder.jpg'}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            priority={true}
                        />
                    </div>

                    {/* Share Button (Top Right) */}
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const url = `${window.location.origin}/products/${product.slug}`;
                            const text = `Check out ${product.name} on Gift Center!`;
                            if (navigator.share) {
                                navigator.share({ title: product.name, text: text, url: url }).catch(console.error);
                            } else {
                                window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
                            }
                        }}
                        className="absolute top-3 right-3 p-2 bg-slate-900/50 hover:bg-slate-900/80 backdrop-blur rounded-full text-white transition-all z-20 opacity-0 group-hover:opacity-100 mobile-visible"
                        aria-label="Share"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                    </button>

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {!product.inStock && (
                            <Badge variant="error" size="sm">Out of Stock</Badge>
                        )}
                        {discountPercentage > 0 && (
                            <Badge variant="warning" size="sm">{discountPercentage}% OFF {isGuest && '(Guest Offer)'}</Badge>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-semibold text-base text-white mb-1 line-clamp-1 group-hover:text-purple-400 transition-colors">
                        {product.name}
                    </h3>

                    {/* Category Label */}
                    <p className="text-xs text-slate-500 mb-3 capitalize">
                        {String(product.category).replace('-', ' ')}
                    </p>

                    {/* Price & Actions Row */}
                    <div className="mt-auto pt-4 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-xl font-bold text-white">
                                        {formatCurrency(displayPrice)}
                                    </span>
                                    {discountPercentage > 0 && (
                                        <span className="text-xs text-slate-500 line-through">
                                            {formatCurrency(originalPrice)}
                                        </span>
                                    )}
                                </div>
                                {discountPercentage > 0 && <span className="text-[10px] text-green-400">Save {discountPercentage}%</span>}
                            </div>
                        </div>

                        {/* Action Custom Button */}
                        <div className="w-full">
                            {isGift ? (
                                <Button
                                    size="sm"
                                    variant="primary"
                                    onClick={handleAddToCart}
                                    disabled={!product.inStock}
                                    fullWidth
                                    className="shadow-lg shadow-purple-500/20"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    ADD TO CART
                                </Button>
                            ) : (
                                <span className="bg-slate-800 text-white text-xs px-3 py-2 rounded-lg border border-slate-600 block text-center cursor-pointer hover:bg-slate-700">
                                    View Details
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;
