'use client';

import React, { useEffect, useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { formatCurrency } from '@/utils/format';
import Image from 'next/image';

export default function IncentiveProgressBar() {
    const { cart, nextGiftTier, unlockedGift } = useCart();
    const [progress, setProgress] = useState(0);

    const currentTotal = cart.total;

    useEffect(() => {
        if (!nextGiftTier && !unlockedGift) {
            setProgress(0);
            return;
        }

        // Logic: 
        // If we have a next tier, progress is relative to that tier from 0? 
        // Or should it be global? 
        // Let's make it relative to the NEXT tier for max dopamine.
        // Actually, simpler is: 0 to Next Tier Threshold.
        const target = nextGiftTier ? nextGiftTier.threshold_amount : (unlockedGift ? unlockedGift.threshold_amount : 1000);

        // Cap at 100 if we passed it (which means we are likely at max gift)
        const rawPercent = Math.min((currentTotal / target) * 100, 100);
        setProgress(rawPercent);

    }, [currentTotal, nextGiftTier, unlockedGift]);

    if (!nextGiftTier && !unlockedGift) return null; // No gifts configured or loaded yet

    const targetTier = nextGiftTier || unlockedGift;
    if (!targetTier) return null;

    const remaining = Math.max(0, targetTier.threshold_amount - currentTotal);
    const giftName = targetTier.product ? targetTier.product.name : targetTier.gift_name;
    // Resolve image
    const giftImage = targetTier.product
        ? (targetTier.product.images?.[0])
        : targetTier.gift_image_url;

    return (
        <div className="bg-slate-900 border-b border-slate-800 sticky top-0 md:top-[80px] z-30 shadow-md transition-all duration-300">
            {/* Mobile-optimized taller container */}
            <div className="container-custom max-w-4xl mx-auto px-4 py-3 md:py-2">

                {/* Text Message */}
                <div className="flex items-center justify-between mb-2 text-xs md:text-sm">
                    <span className="text-slate-200">
                        {remaining > 0 ? (
                            <>
                                Unlock <span className="font-bold text-purple-400">{giftName}</span> in {formatCurrency(remaining)}!
                            </>
                        ) : (
                            <span className="font-bold text-green-400 flex items-center gap-1">
                                <span className="animate-bounce">🎁</span> Gift Unlocked: {giftName}
                            </span>
                        )}
                    </span>
                    <span className="text-slate-500 font-mono text-xs">
                        {formatCurrency(currentTotal)} / {formatCurrency(targetTier.threshold_amount)}
                    </span>
                </div>

                {/* Progress Bar Container */}
                <div className="relative h-4 md:h-3 bg-slate-800 rounded-full overflow-hidden shadow-inner">
                    {/* Animated Fill */}
                    <div
                        className={`absolute top-0 left-0 h-full transition-all duration-1000 ease-out rounded-full ${remaining <= 0 ? 'bg-green-500' : 'bg-gradient-to-r from-purple-600 to-pink-500'}`}
                        style={{ width: `${progress}%` }}
                    >
                        {/* Shine Effect */}
                        <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
                    </div>
                </div>

                {/* Mobile visual cue if gift unlocked */}
                {remaining <= 0 && (
                    <div className="md:hidden mt-2 flex items-center gap-3 bg-slate-800/50 p-2 rounded-lg border border-green-500/30 animate-pulse">
                        <div className="relative w-10 h-10 rounded overflow-hidden flex-shrink-0 bg-slate-700">
                            {giftImage ? (
                                <Image src={giftImage} alt={giftName || 'Gift'} fill className="object-cover" />
                            ) : (
                                <span className="text-xl flex items-center justify-center h-full">🎁</span>
                            )}
                        </div>
                        <div className="text-xs text-green-400 font-semibold">
                            Added to your Cart!
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

