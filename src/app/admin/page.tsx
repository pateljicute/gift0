'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function AdminDashboard() {
    const supabase = createClientComponentClient();
    const [counts, setCounts] = useState({
        users: 0,
        orders: 0,
        products: 0
    });
    const [loading, setLoading] = useState(true);
    const [recentUsers, setRecentUsers] = useState<any[]>([]);

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch users count (profiles)
                const { count: usersCount } = await supabase
                    .from('profiles')
                    .select('*', { count: 'exact', head: true });

                // Fetch orders count
                const { count: ordersCount } = await supabase
                    .from('orders')
                    .select('*', { count: 'exact', head: true });

                // Fetch products count
                const { count: productsCount } = await supabase
                    .from('products')
                    .select('*', { count: 'exact', head: true });

                setCounts({
                    users: usersCount || 0,
                    orders: ordersCount || 0,
                    products: productsCount || 0
                });

                // Fetch recent users
                const { data: users } = await supabase
                    .from('profiles')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(5);

                if (users) setRecentUsers(users);

            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    return (
        <div>
            <h1 className="text-3xl font-display font-bold text-white mb-8">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                {/* Users Card - Prioritized 1st */}
                <Link
                    href="/admin/users"
                    className="group bg-slate-800 border border-slate-700 p-8 rounded-2xl hover:bg-slate-800/80 hover:border-green-500/50 transition-all duration-300 relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10 flex flex-col items-center text-center">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-6 shadow-lg shadow-green-500/30 group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">User Management</h2>
                        <p className="text-3xl font-bold text-green-400 mb-1">
                            {loading ? '...' : counts.users}
                        </p>
                        <p className="text-slate-400 text-sm">Registered Users</p>
                    </div>
                </Link>

                {/* Orders Card */}
                <Link
                    href="/admin/orders"
                    className="group bg-slate-800 border border-slate-700 p-8 rounded-2xl hover:bg-slate-800/80 hover:border-blue-500/50 transition-all duration-300 relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10 flex flex-col items-center text-center">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Orders</h2>
                        <p className="text-3xl font-bold text-blue-400 mb-1">
                            {loading ? '...' : counts.orders}
                        </p>
                        <p className="text-slate-400 text-sm">Total Orders</p>
                    </div>
                </Link>

                {/* Products Card (was Add Product) - Now shows count and links to list, or we can keep Add Product but maybe Products List is better here? 
                   The user said "prioritize User Management", but also "ensure Orders and Users data is visible". 
                   The original card was explicitly "Add New Product" link. I will keep it as a link to products list OR add product?
                   Usually dashboard cards link to lists. I'll link to /admin/products and show count.
                   Wait, the original layout had "Add Product" specifically. 
                   I'll make this "Products" card link to /admin/products, and maybe add a smaller "Add" button or just keep it as Manage Products.
                   Let's stick to the pattern: Icon, Title, Count, Subtitle. Link to /admin/products.
                   But the user specifically asked for "Add Product functionality working".
                   The dashboard link was "Add New Product" href="/admin/products/add".
                   I'll change this card to "Manage Products" linking to /admin/products, which likely has an "Add Product" button.
                   Actually, looking at current /admin/products page (from file list, it exists), it probably lists products. 
                   I will change the card to "Products" and link to /admin/products. 
                */}
                <Link
                    href="/admin/products"
                    className="group bg-slate-800 border border-slate-700 p-8 rounded-2xl hover:bg-slate-800/80 hover:border-purple-500/50 transition-all duration-300 relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10 flex flex-col items-center text-center">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-6 shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Products</h2>
                        <p className="text-3xl font-bold text-purple-400 mb-1">
                            {loading ? '...' : counts.products}
                        </p>
                        <p className="text-slate-400 text-sm">Active Items</p>
                    </div>
                </Link>
            </div>

            {/* Recent Activity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Users */}
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-white">Recent Users</h3>
                        <Link href="/admin/users" className="text-sm text-purple-400 hover:text-purple-300">
                            View All
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {recentUsers.length === 0 ? (
                            <p className="text-slate-400 text-sm">No users yet.</p>
                        ) : (
                            recentUsers.map(user => (
                                <div key={user.id} className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                                    <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center overflow-hidden shrink-0">
                                        {user.avatar_url ? (
                                            <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-xs font-bold text-white">{user.email?.charAt(0).toUpperCase()}</span>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-white font-medium truncate">{user.full_name || 'User'}</p>
                                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                                    </div>
                                    <div className="ml-auto text-xs text-slate-500">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-white mb-6">Quick Actions</h3>
                    <div className="space-y-3">
                        <Link href="/admin/products/add" className="block w-full bg-slate-700 hover:bg-slate-600 p-3 rounded-lg text-left text-white transition-colors flex items-center justify-between group">
                            <span>Add New Product</span>
                            <svg className="w-5 h-5 text-slate-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                        <Link href="/admin/users" className="block w-full bg-slate-700 hover:bg-slate-600 p-3 rounded-lg text-left text-white transition-colors flex items-center justify-between group">
                            <span>Manage Users</span>
                            <svg className="w-5 h-5 text-slate-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
