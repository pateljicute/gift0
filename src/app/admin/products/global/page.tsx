'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Image from 'next/image';

type Product = {
    id: string;
    name: string;
    price: number;
    images: string[];
    created_at: string;
    vendor: {
        shop_name: string;
    } | null;
};

export default function GlobalProductsPage() {
    const supabase = createClientComponentClient();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchGlobalProducts();
    }, []);

    const fetchGlobalProducts = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('products')
            .select(`
                id, name, price, images, created_at,
                vendor:vendors(shop_name)
            `)
            .order('created_at', { ascending: false });

        if (error) console.error(error);
        else setProducts(data as any || []);
        setLoading(false);
    };

    const handleDelete = async (productId: string) => {
        if (!confirm('Are you sure you want to DELETE this product? This cannot be undone.')) return;

        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', productId);

        if (error) alert(error.message);
        else fetchGlobalProducts();
    };

    const formatDate = (date: string) => new Date(date).toLocaleDateString('en-IN');

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.vendor?.shop_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="py-6 px-4 sm:px-6 md:px-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">Global Product Oversight</h1>
                    <p className="text-sm text-gray-500">Monitor all products uploaded by all shops.</p>
                </div>
                <input
                    type="text"
                    placeholder="Search by product or shop..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border border-gray-300 rounded-lg px-4 py-2 w-full md:w-64"
                />
            </div>

            {loading ? <p>Loading...</p> : (
                <div className="bg-white shadow overflow-hidden rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shop Name (Sold By)</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredProducts.map((p) => (
                                <tr key={p.id}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0 relative rounded overflow-hidden bg-gray-100">
                                                {p.images && p.images[0] ? (
                                                    <Image
                                                        src={p.images[0]}
                                                        alt={p.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : <div className="h-full w-full bg-gray-200" />}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{p.name}</div>
                                                <div className="text-xs text-gray-500">ID: {p.id.slice(0, 8)}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-indigo-600">
                                        {p.vendor?.shop_name || 'System / Admin'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">₹{p.price}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(p.created_at)}</td>
                                    <td className="px-6 py-4 text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleDelete(p.id)}
                                            className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
