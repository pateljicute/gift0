'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { formatCurrency } from '@/utils/format';
import CartItem from './CartItem';
import Button from '../ui/Button';
import Image from 'next/image';

const CartDrawer: React.FC = () => {
    const { cart, isCartOpen, closeCart, clearCart, unlockedGift } = useCart();

    useEffect(() => {
        if (isCartOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isCartOpen]);

    if (!isCartOpen) return null;

    return (
        <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
                onClick={closeCart}
            />

            {/* Drawer */}
            <div className="absolute top-0 right-0 bottom-0 w-full max-w-md glass-strong flex flex-col animate-slide-right shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-700">
                    <div>
                        <h2 className="text-2xl font-display font-bold text-white">Shopping Cart</h2>
                        <p className="text-sm text-slate-400 mt-0.5">{cart.itemCount} items</p>
                    </div>
                    <button
                        onClick={closeCart}
                        className="p-2 text-slate-400 hover:text-white transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
                    {/* Free Gift Section */}
                    {unlockedGift && (
                        <div className="mb-6 bg-gradient-to-r from-purple-900/40 to-pink-900/40 border border-purple-500/30 rounded-xl p-4 flex items-center gap-4 animate-fade-in relative overflow-hidden">
                            <div className="absolute inset-0 bg-white/5 animate-[shimmer_2s_infinite]" />
                            <div className="relative w-16 h-16 bg-slate-800 rounded-lg overflow-hidden flex-shrink-0 border border-purple-500/50">
                                {unlockedGift.product?.images?.[0] || unlockedGift.product?.image_url || unlockedGift.gift_image_url ? (
                                    <Image
                                        src={unlockedGift.product?.images?.[0] || unlockedGift.product?.image_url || unlockedGift.gift_image_url || ''}
                                        alt="Gift"
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <span className="flex items-center justify-center h-full text-2xl">🎁</span>
                                )}
                            </div>
                            <div>
                                <div className="text-xs font-bold text-green-400 uppercase tracking-wider mb-1">Gift Unlocked!</div>
                                <div className="font-semibold text-white text-sm">
                                    {unlockedGift.product?.name || unlockedGift.gift_name}
                                </div>
                                <div className="text-xs text-slate-400 mt-1 line-through text-opacity-70">
                                    ₹{formatCurrency(unlockedGift.product?.price || 500)}
                                </div>
                            </div>
                            <div className="ml-auto">
                                <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase">
                                    Free
                                </span>
                            </div>
                        </div>
                    )}

                    {cart.items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                                <svg className="w-12 h-12 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-display font-bold text-white mb-2">Your cart is empty</h3>
                            <p className="text-slate-400 mb-6">Add some items to get started!</p>
                            <Button onClick={closeCart} variant="primary">
                                Continue Shopping
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-0">
                            {cart.items.map((item) => (
                                <CartItem key={`${item.product.id}-${JSON.stringify(item.selectedVariants)}`} item={item} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {cart.items.length > 0 && (
                    <div className="border-t border-slate-700 p-6 space-y-4">
                        {/* Subtotal */}
                        <div className="flex items-center justify-between text-lg">
                            <span className="text-slate-300">Subtotal</span>
                            <span className="font-bold text-white text-2xl">{formatCurrency(cart.total)}</span>
                        </div>

                        <p className="text-xs text-slate-500">
                            Shipping and taxes calculated at checkout
                        </p>

                        {/* Actions */}
                        <div className="space-y-2">
                            <Link href="/checkout" onClick={closeCart}>
                                <Button variant="primary" fullWidth>
                                    Proceed to Checkout
                                </Button>
                            </Link>
                            <Button variant="ghost" fullWidth onClick={closeCart}>
                                Continue Shopping
                            </Button>
                            <button
                                onClick={clearCart}
                                className="w-full text-sm text-slate-500 hover:text-red-400 transition-colors py-2"
                            >
                                Clear Cart
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartDrawer;
