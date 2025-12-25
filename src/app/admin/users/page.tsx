'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function UserManagementPage() {
    const supabase = createClient();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: fetchError } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;

            setUsers(data || []);
        } catch (err: any) {
            console.error('Error fetching users:', err);
            setError(err.message || 'Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-display font-bold text-white">User Management</h1>
                <button
                    onClick={fetchUsers}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700 transition-colors flex items-center gap-2"
                >
                    <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                </button>
            </div>

            {error && (
                <div className="bg-red-900/50 border border-red-500/50 text-red-200 p-4 rounded-xl mb-6 flex items-center gap-3">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>{error}</span>
                </div>
            )}

            <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-900/50 border-b border-slate-700">
                                <th className="px-6 py-4 text-slate-400 font-medium font-display">User</th>
                                <th className="px-6 py-4 text-slate-400 font-medium font-display">Email</th>
                                <th className="px-6 py-4 text-slate-400 font-medium font-display">Joined</th>
                                <th className="px-6 py-4 text-slate-400 font-medium font-display text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {loading && users.length === 0 ? (
                                <tr>
                                    <td className="px-6 py-8 text-center text-slate-400" colSpan={4}>
                                        <div className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></path>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Loading users...
                                        </div>
                                    </td>
                                </tr>
                            ) : (!users || users.length === 0) ? (
                                <tr>
                                    <td className="px-6 py-8 text-center text-slate-400" colSpan={4}>
                                        No users found.
                                    </td>
                                </tr>
                            ) : (
                                users.map((user: any) => (
                                    <tr key={user.id} className="hover:bg-slate-700/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                                    {user.avatar_url ? (
                                                        <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-white font-bold">{user.email?.charAt(0).toUpperCase()}</span>
                                                    )}
                                                </div>
                                                <p className="text-white font-medium">{user.full_name || 'N/A'}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-300">
                                            {user.email}
                                        </td>
                                        <td className="px-6 py-4 text-slate-400 text-sm">
                                            {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
