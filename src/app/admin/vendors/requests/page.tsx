'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Modal from '@/components/ui/Modal';

type Vendor = {
    id: string;
    shop_name: string;
    owner_name: string;
    phone_primary: string;
    address: string;
    pincode: string;
    created_at: string;
    status: string;
};

export default function PendingRequestsPage() {
    const supabase = createClientComponentClient();
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
    const [limitInput, setLimitInput] = useState<string>('50');

    useEffect(() => {
        fetchPendingVendors();
    }, []);

    const fetchPendingVendors = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('vendors')
            .select('*')
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

        if (error) console.error(error);
        else setVendors(data || []);
        setLoading(false);
    };

    const openApproveModal = (vendor: Vendor) => {
        setSelectedVendor(vendor);
        setLimitInput('50');
        setIsModalOpen(true);
    };

    const handleReject = async (vendorId: string) => {
        if (!confirm('Reject this application?')) return;
        const { error } = await supabase
            .from('vendors')
            .update({ status: 'rejected' })
            .eq('id', vendorId);

        if (error) alert(error.message);
        else fetchPendingVendors();
    };

    const handleConfirmApproval = async () => {
        if (!selectedVendor || !limitInput) return;
        const limit = parseInt(limitInput);
        if (isNaN(limit) || limit < 0) return alert('Invalid Limit');

        const { error } = await supabase
            .from('vendors')
            .update({ status: 'approved', product_limit: limit })
            .eq('id', selectedVendor.id);

        if (error) alert(error.message);
        else {
            setIsModalOpen(false);
            fetchPendingVendors();
        }
    };

    const formatDate = (date: string) => new Date(date).toLocaleDateString('en-IN');

    return (
        <div className="py-6 px-4 sm:px-6 md:px-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">New Shop Requests</h1>
            <p className="text-sm text-gray-500 mb-6">Review and approve incoming vendor applications.</p>

            {loading ? <p>Loading...</p> : vendors.length === 0 ? (
                <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
                    No pending requests found.
                </div>
            ) : (
                <div className="bg-white shadow overflow-hidden rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shop Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mobile</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                                <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {vendors.map((v) => (
                                <tr key={v.id}>
                                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{formatDate(v.created_at)}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{v.shop_name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{v.owner_name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{v.phone_primary}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{v.address}, {v.pincode}</td>
                                    <td className="px-6 py-4 text-right text-sm font-medium">
                                        <button onClick={() => handleReject(v.id)} className="text-red-600 hover:text-red-900 mr-4">Reject</button>
                                        <button onClick={() => openApproveModal(v)} className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">Approve</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Approve Shop">
                <div className="space-y-4">
                    <p>Set <strong>Product Upload Limit</strong> for {selectedVendor?.shop_name}:</p>
                    <input
                        type="number"
                        value={limitInput}
                        onChange={(e) => setLimitInput(e.target.value)}
                        className="w-full border p-2 rounded"
                    />
                    <div className="flex justify-end gap-2 pt-4">
                        <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded">Cancel</button>
                        <button onClick={handleConfirmApproval} className="px-4 py-2 bg-green-600 text-white rounded">Confirm Approval</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
