'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { formatCurrency } from '@/utils/format';
import Image from 'next/image';

interface Product {
    id: string; // UUID
    name: string;
    image_url: string;
    images?: string[];
}

interface GiftTier {
    id: number;
    threshold_amount: number;
    product_id?: string | null;
    product?: Product;
    gift_name?: string;
    gift_image_url?: string;
}

export default function GiftManagementPage() {
    const supabase = createClientComponentClient();
    const [tiers, setTiers] = useState<GiftTier[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    // Mode toggle between 'product' or 'custom'
    const [mode, setMode] = useState<'product' | 'custom'>('product');

    // Form States
    const [newItem, setNewItem] = useState({ threshold: '', productId: '' });
    const [customGift, setCustomGift] = useState({ name: '', image_url: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        // Fetch Tiers
        const { data: tiersData, error: tierError } = await supabase
            .from('gift_tiers')
            .select('*, product:products(id, name, image_url, images)')
            .order('threshold_amount', { ascending: true });

        if (tierError) console.error(tierError);

        // Fetch Products for dropdown
        const { data: productsData } = await supabase
            .from('products')
            .select('id, name, image_url, images')
            .order('name');

        if (tiersData) setTiers(tiersData);
        if (productsData) setProducts(productsData || []);
        setLoading(false);
    };

    const calculateNextAmount = () => {
        if (tiers.length === 0) return 1000;
        const max = Math.max(...tiers.map(t => t.threshold_amount));
        return max + 1000;
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItem.threshold) return;

        let payload: any = { threshold_amount: parseFloat(newItem.threshold) };

        if (mode === 'product') {
            if (!newItem.productId) return alert('Please select a product');
            payload.product_id = newItem.productId; // UUID is string
        } else {
            if (!customGift.name) return alert('Please enter a gift name');
            payload.gift_name = customGift.name;
            payload.gift_image_url = customGift.image_url || 'https://via.placeholder.com/150?text=Gift';
        }

        const { error } = await supabase.from('gift_tiers').insert(payload);

        if (error) {
            alert('Error adding tier: ' + error.message);
        } else {
            setNewItem({ threshold: '', productId: '' });
            setCustomGift({ name: '', image_url: '' });
            fetchData();
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to remove this gift tier?')) return;
        await supabase.from('gift_tiers').delete().eq('id', id);
        fetchData();
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-slate-800">Gift Incentive Management</h1>
                <div className="text-sm text-slate-500">
                    Define gifts that users unlock at specific spending milestones.
                </div>
            </div>

            {/* Add New Tier Form */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
                <h2 className="text-lg font-semibold mb-4 text-slate-700">Add New Incentive Tier</h2>

                {/* Mode Toggle */}
                <div className="flex gap-4 border-b border-slate-200 mb-6">
                    <button
                        type="button"
                        onClick={() => setMode('product')}
                        className={`pb-2 px-1 text-sm font-medium transition-colors border-b-2 ${mode === 'product' ? 'border-purple-600 text-purple-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        Select Existing Product
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode('custom')}
                        className={`pb-2 px-1 text-sm font-medium transition-colors border-b-2 ${mode === 'custom' ? 'border-purple-600 text-purple-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        Custom Gift / Manual
                    </button>
                </div>

                <form onSubmit={handleAdd} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Common: Threshold */}
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">Spending Threshold (₹)</label>
                            <input
                                type="number"
                                value={newItem.threshold}
                                onChange={e => setNewItem({ ...newItem, threshold: e.target.value })}
                                placeholder={`e.g. ${calculateNextAmount()}`}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                            />
                        </div>

                        {/* Mode Specific Inputs */}
                        {mode === 'product' ? (
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Select Gift Product</label>
                                <select
                                    value={newItem.productId}
                                    onChange={e => setNewItem({ ...newItem, productId: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                >
                                    <option value="">-- Choose a Product --</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-1">Gift Name</label>
                                    <input
                                        type="text"
                                        value={customGift.name}
                                        onChange={e => setCustomGift({ ...customGift, name: e.target.value })}
                                        placeholder="e.g. Mystery Hamper"
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-1">Image URL</label>
                                    <input
                                        type="text"
                                        value={customGift.image_url}
                                        onChange={e => setCustomGift({ ...customGift, image_url: e.target.value })}
                                        placeholder="https://..."
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                    />
                                    <p className="text-xs text-slate-400 mt-1">Paste a valid image URL.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={!newItem.threshold || (mode === 'product' ? !newItem.productId : !customGift.name)}
                            className="px-6 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Add {mode === 'product' ? 'Product' : 'Custom'} Tier
                        </button>
                    </div>
                </form>
            </div>

            {/* List Tiers */}
            <h2 className="text-lg font-semibold mb-4 text-slate-700">Active Gift Tiers</h2>
            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-8 text-slate-400">Loading gift tiers...</div>
                ) : tiers.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-500">
                        No gift tiers configured. Add one above!
                    </div>
                ) : (
                    tiers.map(tier => {
                        // Resolve Name & Image based on mode (Product vs Custom)
                        const displayName = tier.product ? tier.product.name : tier.gift_name;
                        const displayImage = tier.product ? (tier.product.images?.[0] || tier.product.image_url) : tier.gift_image_url;

                        return (
                            <div key={tier.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between group hover:border-purple-300 transition-colors">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 bg-slate-100 rounded-lg relative overflow-hidden flex-shrink-0">
                                        {displayImage ? (
                                            <Image
                                                src={displayImage || '/placeholder.jpg'}
                                                alt={displayName || 'Gift'}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <span className="flex items-center justify-center h-full text-2xl">🎁</span>
                                        )}
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Spend Over</div>
                                        <div className="text-2xl font-bold text-slate-800">{formatCurrency(tier.threshold_amount)}</div>
                                    </div>
                                    <div className="h-8 w-px bg-slate-200 mx-2 hidden md:block"></div>
                                    <div>
                                        <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Get Free</div>
                                        <div className="text-lg font-medium text-purple-600">
                                            {displayName || 'Unknown Gift'}
                                            {tier.product ? <span className="ml-2 text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">Linked</span> : <span className="ml-2 text-xs bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded">Custom</span>}
                                        </div>
                                    </div>
                                </div>


                                <button
                                    onClick={() => handleDelete(tier.id)}
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete Tier"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
