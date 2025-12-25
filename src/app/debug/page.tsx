'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function DebugPage() {
    const supabase = createClient();
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchDebugData() {
            try {
                // 1. Fetch RAW Products
                const { data: prodData, error: prodError } = await supabase
                    .from('products')
                    .select('*');

                if (prodError) throw prodError;
                setProducts(prodData || []);

                // 2. Fetch RAW Categories
                const { data: catData, error: catError } = await supabase
                    .from('categories')
                    .select('*');

                if (catError) throw catError;
                setCategories(catData || []);

            } catch (err: any) {
                console.error(err);
                setError(err.message || 'Unknown error');
            }
        }
        fetchDebugData();
    }, []);

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <h1 className="text-3xl text-red-500 font-bold mb-8">System Debugger</h1>

            {error && <div className="bg-red-900/50 p-4 border border-red-500 rounded mb-8">{error}</div>}

            <div className="grid grid-cols-2 gap-8">
                <div>
                    <h2 className="text-xl font-bold mb-4 text-purple-400">Categories ({categories.length})</h2>
                    <pre className="bg-slate-900 p-4 rounded text-xs overflow-auto h-96">
                        {JSON.stringify(categories, null, 2)}
                    </pre>
                </div>
                <div>
                    <h2 className="text-xl font-bold mb-4 text-green-400">Products ({products.length})</h2>
                    <pre className="bg-slate-900 p-4 rounded text-xs overflow-auto h-96">
                        {JSON.stringify(products, null, 2)}
                    </pre>
                </div>
            </div>

            <div className="mt-8">
                <h3 className="text-xl font-bold mb-2">Analysis</h3>
                <p className="text-slate-400">
                    If this list is empty, RLS policies are blocking Public Access.
                    <br />
                    If products exist but don't show on the site, check if <code>category_id</code> matches one of the IDs in the left list.
                </p>
            </div>
        </div>
    );
}
