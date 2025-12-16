'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Modal from '@/components/ui/Modal';

type Vendor = {
    id: string;
    shop_name: string;
    owner_name: string;
    phone_primary: string;
    status: string;
    product_limit: number;
};

export default function ActiveSellersPage() {
    const supabase = createClientComponentClient();
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
    const [limitInput, setLimitInput] = useState<string>('');

    useEffect(() => {
        fetchActiveVendors();
    }, []);

    const fetchActiveVendors = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('vendors')
            .select('*')
            .in('status', ['approved', 'suspended'])
            .order('shop_name', { ascending: true });

        if (error) console.error(error);
        else setVendors(data || []);
        setLoading(false);
    };

    const toggleBan = async (vendor: Vendor) => {
        const newStatus = vendor.status === 'approved' ? 'suspended' : 'approved';
        const action = vendor.status === 'approved' ? 'BAN' : 'ACTIVATE';

        if (!confirm(`Are you sure you want to ${action} this seller?`)) return;

        const { error } = await supabase
            .from('vendors')
            .update({ status: newStatus })
            .eq('id', vendor.id);

        if (error) alert(error.message);
        else fetchActiveVendors();
    };

    const openEditLimit = (vendor: Vendor) => {
        setSelectedVendor(vendor);
        setLimitInput(vendor.product_limit.toString());
        setIsEditModalOpen(true);
    };

    const handleUpdateLimit = async () => {
        if (!selectedVendor || !limitInput) return;
        const limit = parseInt(limitInput);

        const { error } = await supabase
            .from('vendors')
            .update({ product_limit: limit })
            .eq('id', selectedVendor.id);

        if (error) alert(error.message);
        else {
            setIsEditModalOpen(false);
            fetchActiveVendors();
        }
    };

    return (
        <div className="py-6 px-4 sm:px-6 md:px-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Active Sellers Manager</h1>
            <p className="text-sm text-gray-500 mb-6">Manage approved shops, update limits, or suspend accounts.</p>

            {loading ? <p>Loading...</p> : (
                <div className="bg-white shadow overflow-hidden rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shop Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner / Phone</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Limit</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {vendors.map((v) => (
                                <tr key={v.id} className={v.status === 'suspended' ? 'bg-red-50' : ''}>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{v.shop_name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{v.owner_name} <br /> {v.phone_primary}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">{v.product_limit}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${v.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                            {v.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right text-sm font-medium">
                                        <button onClick={() => openEditLimit(v)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit Limit</button>
                                        <button
                                            onClick={() => toggleBan(v)}
                                            className={`${v.status === 'approved' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                                        >
                                            {v.status === 'approved' ? 'Ban / Suspend' : 'Re-Activate'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Update Limit">
                <div className="space-y-4">
                    <p>Update product limit for <strong>{selectedVendor?.shop_name}</strong>:</p>
                    <input
                        type="number"
                        value={limitInput}
                        onChange={(e) => setLimitInput(e.target.value)}
                        className="w-full border p-2 rounded"
                    />
                    <div className="flex justify-end gap-2 pt-4">
                        <button onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 border rounded">Cancel</button>
                        <button onClick={handleUpdateLimit} className="px-4 py-2 bg-indigo-600 text-white rounded">Update</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
