'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import { formatCurrency } from '@/utils/format';
import { Order } from '@/data/types';

interface OrderWithItems extends Order {
    items: any[];
}

export default function MyOrdersPage() {
    const { user, loading: authLoading } = useAuth();
    const [orders, setOrders] = useState<OrderWithItems[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClientComponentClient();

    useEffect(() => {
        if (!user) return;

        const fetchOrders = async () => {
            try {
                // 1. Run Cleanup (Safe to call repeatedly, it's efficient)
                // We wrap this in a silent try-catch so the page works even if the SQL script hasn't been run yet
                try {
                    await supabase.rpc('delete_old_delivered_orders');
                } catch (cleanupError) {
                    console.warn('Cleanup function not found or failed (SQL script might be missing):', cleanupError);
                }

                // 2. Fetch My Orders
                const { data, error } = await supabase
                    .from('orders')
                    .select('*, items:order_items(*, product:products(*))')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setOrders(data || []);
            } catch (error) {
                console.error('Error fetching orders:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [user, supabase]);

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
                <h1 className="text-2xl font-bold text-white mb-4">Please Sign In</h1>
                <p className="text-slate-400 mb-6">You need to be logged in to view your orders.</p>
                <button
                    onClick={() => window.location.href = '/'}
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                    Go to Home & Sign In
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-display font-bold text-white mb-8">My Orders</h1>

                {orders.length === 0 ? (
                    <div className="text-center py-12 bg-slate-900 rounded-xl border border-slate-800">
                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-medium text-white mb-2">No orders found</h2>
                        <p className="text-slate-400 mb-6">Looks like you haven't placed any orders yet.</p>
                        <Link href="/" className="text-purple-400 hover:text-purple-300 font-medium">
                            Start Shopping &rarr;
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div key={order.id} className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                                {/* Header */}
                                <div className="p-4 border-b border-slate-800 flex flex-wrap justify-between items-center gap-4 bg-slate-800/50">
                                    <div>
                                        <div className="text-xs text-slate-500 uppercase tracking-wide">Order ID</div>
                                        <div className="text-sm font-mono text-white">#{order.id.slice(0, 8)}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500 uppercase tracking-wide">Date</div>
                                        <div className="text-sm text-white">{new Date(order.date || order.created_at || Date.now()).toLocaleDateString()}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500 uppercase tracking-wide">Total</div>
                                        <div className="text-sm font-bold text-purple-400">{formatCurrency(order.total)}</div>
                                    </div>
                                    <div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${order.status === 'delivered' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                            order.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                                'bg-slate-700 text-slate-300 border-slate-600'
                                            }`}>
                                            {order.status === 'delivered' ? 'Delivery Complete' : order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                        </span>
                                    </div>
                                </div>

                                {/* Items */}
                                <div className="p-4">
                                    <div className="space-y-4">
                                        {order.items?.map((item: any, idx: number) => (
                                            <div key={idx} className="flex gap-4 items-center">
                                                <div className="w-16 h-16 bg-slate-800 rounded-lg overflow-hidden flex-shrink-0 relative border border-slate-700">
                                                    {/* Simple Image Fallback */}
                                                    {(item.product?.images?.[0] || item.product?.image_url) ? (
                                                        <img src={item.product?.images?.[0] || item.product?.image_url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-600">No Img</div>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="text-sm font-medium text-white">{item.product?.name || 'Unknown Product'}</h4>
                                                    <div className="text-xs text-slate-500">Qty: {item.quantity} × {formatCurrency(item.price)}</div>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Free Gift Display if present */}
                                        {order.gift_name && (
                                            <div className="flex gap-4 items-center mt-2 pt-2 border-t border-slate-800/50">
                                                <div className="w-16 h-16 bg-purple-900/20 rounded-lg overflow-hidden flex-shrink-0 relative border border-purple-500/30 flex items-center justify-center">
                                                    {order.gift_image_url ? (
                                                        <img src={order.gift_image_url} alt="Gift" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-2xl">🎁</span>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="text-sm font-bold text-purple-400">FREE GIFT: {order.gift_name}</h4>
                                                    <div className="text-xs text-slate-500">Unlocked with this order</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Footer Info */}
                                {order.status === 'delivered' && (
                                    <div className="px-4 py-2 bg-slate-950/50 text-xs text-slate-500 text-center border-t border-slate-800">
                                        Note: This receipt will be automatically removed 7 hours after delivery for security.
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
