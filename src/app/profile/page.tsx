'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';

export default function ProfilePage() {
    const { user, signOut } = useAuth();

    // We are not passing mock orders anymore. Assuming OrderPage handles fetching or empty state.
    // Ideally we would fetch orders here or in a separate component.

    if (!user) {
        return (
            <div className="py-20 text-center text-white">
                <p className="mb-4">Please sign in to view your profile.</p>
                <Link href="/" className="text-purple-400 hover:text-purple-300">Go Home</Link>
            </div>
        );
    }

    return (
        <div className="py-8 md:py-12">
            <div className="container-custom">
                <h1 className="font-display font-bold text-4xl md:text-5xl text-white mb-8">
                    My Account
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Sidebar */}
                    <aside className="lg:col-span-1">
                        <div className="card p-6">
                            <div className="flex items-center gap-4 mb-6">
                                {user.user_metadata?.avatar_url ? (
                                    <img
                                        src={user.user_metadata.avatar_url}
                                        alt={user.user_metadata.full_name || 'User'}
                                        className="w-16 h-16 rounded-full border-2 border-purple-500"
                                    />
                                ) : (
                                    <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center text-white text-2xl font-bold">
                                        {user.email?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-semibold text-white text-lg">{user.user_metadata?.full_name || 'User'}</h3>
                                    <p className="text-sm text-slate-400">{user.email}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Link href="/orders" className="block w-full text-left px-4 py-3 rounded-lg text-slate-400 hover:bg-white/5 hover:text-white transition-colors">
                                    Order History
                                </Link>
                                <button
                                    onClick={() => signOut()}
                                    className="w-full text-left px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                                >
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        {/* User Info Card */}
                        <div className="card p-6 mb-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="font-display font-bold text-2xl text-white">Account Information</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-sm text-slate-400 mb-1 block">Full Name</label>
                                    <p className="text-white font-medium">{user.user_metadata?.full_name || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-slate-400 mb-1 block">Email</label>
                                    <p className="text-white font-medium">{user.email}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
