'use client';

import React from 'react';
import Image from 'next/image';
import { CartItem as CartItemType } from '@/data/types';
import { formatCurrency } from '@/utils/format';
import { useCart } from '@/contexts/CartContext';

interface CartItemProps {
    item: CartItemType;
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
    const { updateQuantity, removeFromCart } = useCart();

    const handleQuantityChange = (newQuantity: number) => {
        if (newQuantity > 0) {
            updateQuantity(item.product.id, newQuantity);
        }
    };

    const handleRemove = () => {
        removeFromCart(item.product.id);
    };

    return (
        <div className="flex gap-4 py-4 border-b border-slate-700">
            {/* Image */}
            <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-slate-800">
                <Image
                    src={item.product.images[0] || '/placeholder.jpg'}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                />
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
                <h4 className="font-medium text-white truncate mb-1">{item.product.name}</h4>
                <p className="text-sm text-slate-400 mb-2">{formatCurrency(item.product.price)}</p>

                {/* Variants */}
                {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                    <div className="text-xs text-slate-500 mb-2">
                        {Object.entries(item.selectedVariants).map(([key, value]) => (
                            <span key={key} className="mr-2">
                                {key}: {value}
                            </span>
                        ))}
                    </div>
                )}

                {/* Quantity Controls */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleQuantityChange(item.quantity - 1)}
                        className="w-6 h-6 rounded flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-white transition-colors"
                    >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                    </button>
                    <span className="w-8 text-center text-sm font-medium text-white">{item.quantity}</span>
                    <button
                        onClick={() => handleQuantityChange(item.quantity + 1)}
                        className="w-6 h-6 rounded flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-white transition-colors"
                    >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Remove Button */}
            <button
                onClick={handleRemove}
                className="text-slate-400 hover:text-red-400 transition-colors p-1"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            </button>
        </div>
    );
};

export default CartItem;
