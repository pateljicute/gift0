'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Product, CartItem, Cart } from '@/data/types';
import Link from 'next/link';

export interface GiftTier {
    id: number;
    threshold_amount: number;
    product_id?: string | null;
    product?: Product;
    gift_name?: string;
    gift_image_url?: string;
}

interface CartContextType {
    cart: Cart;
    addToCart: (product: Product, quantity: number, selectedVariants?: Record<string, string>) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    isCartOpen: boolean;
    openCart: () => void;
    closeCart: () => void;
    // New Gift Props
    unlockedGift: GiftTier | null;
    nextGiftTier: GiftTier | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

interface CartProviderProps {
    children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
    const [cart, setCart] = useState<Cart>({
        items: [],
        total: 0,
        itemCount: 0,
    });
    const [isCartOpen, setIsCartOpen] = useState(false);
    const supabase = createClientComponentClient();

    // Gift State
    const [giftTiers, setGiftTiers] = useState<GiftTier[]>([]);
    const [unlockedGift, setUnlockedGift] = useState<GiftTier | null>(null);
    const [nextGiftTier, setNextGiftTier] = useState<GiftTier | null>(null);

    // Fetch Gift Tiers on Mount
    useEffect(() => {
        const fetchGifts = async () => {
            const { data } = await supabase
                .from('gift_tiers')
                .select('*, product:products(id, name, images)')
                .order('threshold_amount', { ascending: true });

            // Cast data to fit GiftTier
            if (data) setGiftTiers(data as any as GiftTier[]);
        };
        fetchGifts();
    }, []);

    // Load cart from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('giftcenter_cart');
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch (error) {
                console.error('Error loading cart from localStorage:', error);
            }
        }
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('giftcenter_cart', JSON.stringify(cart));
    }, [cart]);

    // Recalculate Gift whenever Cart Total changes
    useEffect(() => {
        if (giftTiers.length === 0) return;

        let best: GiftTier | null = null;
        let next: GiftTier | null = null;

        // Find highest unlocked tier
        // Assuming tiers are sorted ASC
        for (const tier of giftTiers) {
            if (cart.total >= tier.threshold_amount) {
                best = tier;
            } else {
                next = tier;
                break; // Found the first one we haven't reached
            }
        }
        setUnlockedGift(best);
        setNextGiftTier(next);

    }, [cart.total, giftTiers]);

    const calculateTotals = (items: CartItem[]): { total: number; itemCount: number } => {
        const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
        const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
        return { total, itemCount };
    };

    const addToCart = (
        product: Product,
        quantity: number = 1,
        selectedVariants?: Record<string, string>
    ) => {
        setCart((prevCart) => {
            const existingItemIndex = prevCart.items.findIndex(
                (item) =>
                    item.product.id === product.id &&
                    JSON.stringify(item.selectedVariants) === JSON.stringify(selectedVariants)
            );

            let newItems: CartItem[];

            if (existingItemIndex > -1) {
                // Update quantity of existing item
                newItems = [...prevCart.items];
                newItems[existingItemIndex].quantity += quantity;
            } else {
                // Add new item
                newItems = [
                    ...prevCart.items,
                    {
                        product,
                        quantity,
                        selectedVariants,
                    },
                ];
            }

            const { total, itemCount } = calculateTotals(newItems);

            return {
                items: newItems,
                total,
                itemCount,
            };
        });

        // Open cart when item is added
        setIsCartOpen(true);
    };

    const removeFromCart = (productId: string) => {
        setCart((prevCart) => {
            const newItems = prevCart.items.filter((item) => item.product.id !== productId);
            const { total, itemCount } = calculateTotals(newItems);

            return {
                items: newItems,
                total,
                itemCount,
            };
        });
    };

    const updateQuantity = (productId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }

        setCart((prevCart) => {
            const newItems = prevCart.items.map((item) =>
                item.product.id === productId ? { ...item, quantity } : item
            );
            const { total, itemCount } = calculateTotals(newItems);

            return {
                items: newItems,
                total,
                itemCount,
            };
        });
    };

    const clearCart = () => {
        setCart({
            items: [],
            total: 0,
            itemCount: 0,
        });
    };

    const openCart = () => setIsCartOpen(true);
    const closeCart = () => setIsCartOpen(false);

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                isCartOpen,
                openCart,
                closeCart,
                unlockedGift,
                nextGiftTier,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};
