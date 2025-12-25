'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function PartnerRegistrationPage() {
    const supabase = createClient();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        shop_name: '',
        owner_name: '',
        phone_primary: '',
        address: '',
        pincode: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            alert('Please login first to register your shop.');
            router.push('/login' as any);
            return;
        }

        const { error } = await supabase.from('vendors').insert({
            user_id: user.id,
            shop_name: formData.shop_name,
            owner_name: formData.owner_name,
            phone_primary: formData.phone_primary,
            address: formData.address,
            pincode: formData.pincode,
            status: 'pending',
            product_limit: 0
        });

        if (error) {
            alert('Error submitting application: ' + error.message);
        } else {
            alert('Application submitted successfully! Please wait for admin approval.');
            router.push('/');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Partner with Us</h2>
                    <p className="mt-2 text-sm text-gray-600">Register your shop and start selling online.</p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div className="mb-4">
                            <label htmlFor="shop_name" className="block text-sm font-medium text-gray-700">Shop Name</label>
                            <input
                                id="shop_name"
                                required
                                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                value={formData.shop_name}
                                onChange={e => setFormData({ ...formData, shop_name: e.target.value })}
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="owner_name" className="block text-sm font-medium text-gray-700">Owner Name</label>
                            <input
                                id="owner_name"
                                required
                                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                value={formData.owner_name}
                                onChange={e => setFormData({ ...formData, owner_name: e.target.value })}
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                            <input
                                id="phone"
                                required
                                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                value={formData.phone_primary}
                                onChange={e => setFormData({ ...formData, phone_primary: e.target.value })}
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Shop Address</label>
                            <textarea
                                id="address"
                                required
                                rows={3}
                                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="pincode" className="block text-sm font-medium text-gray-700">Pincode</label>
                            <input
                                id="pincode"
                                required
                                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                value={formData.pincode}
                                onChange={e => setFormData({ ...formData, pincode: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
                        >
                            {loading ? 'Submitting...' : 'Register Shop'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
