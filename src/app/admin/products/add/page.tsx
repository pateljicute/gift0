'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client'; // Supabase Client

// --- Types ---
interface Category {
    id: string;
    name: string;
    slug: string;
}

interface ProductFormData {
    name: string;
    description: string;
    price: string;
    stock: string;
    category_id: string;
    // Delivery Logic
    delivery_charge: string;
    weight: string;
    dim_l: string;
    dim_w: string;
    dim_h: string;
    // Cake Specifics
    flavor: string;
    message: string;
    // Future extensibility: Size, etc.
}

export default function AddProductPage() {
    const supabase = createClient();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- State ---
    const [loading, setLoading] = useState(true); // Initial load (auth/cats)
    const [submitting, setSubmitting] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);

    // Form State
    const [formData, setFormData] = useState<ProductFormData>({
        name: '',
        description: '',
        price: '',
        stock: '1',
        category_id: '',
        delivery_charge: '40', // Default
        weight: '',
        dim_l: '',
        dim_w: '',
        dim_h: '',
        flavor: '',
        message: ''
    });

    // Image State
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);

    // Messages
    const [error, setError] = useState<string | null>(null);

    // --- 1. Initial Data Fetch & Security Check ---
    useEffect(() => {
        const init = async () => {
            try {
                setLoading(true);
                setError(null);

                // A. Security Check
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    // If not logged in, redirect immediately
                    router.replace('/admin/login'); // Adjust route as needed
                    return;
                }

                // Optional: Strict Email Check (Enable if ADMIN_EMAIL is exposed)
                /*
                if (process.env.NEXT_PUBLIC_ADMIN_EMAIL && user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
                   throw new Error('Unauthorized Access');
                }
                */

                // B. Fetch Categories
                const { data: cats, error: catError } = await supabase
                    .from('categories')
                    .select('id, name, slug');

                if (catError) throw catError;

                if (cats) {
                    // Allow only specific categories if needed, or all
                    // For this specific project, ensure we have 'cakes', 'frames', 'gift-items'
                    setCategories(cats);
                }

            } catch (err: any) {
                console.error('Init Error:', err);
                setError(err.message || 'Failed to initialize page');
            } finally {
                setLoading(false);
            }
        };

        init();
    }, [supabase, router]);

    // --- 2. Helpers ---
    const getSelectedCategorySlug = () => {
        const cat = categories.find(c => c.id === formData.category_id);
        return cat?.slug || '';
    };

    const isCake = () => getSelectedCategorySlug() === 'cakes';

    // --- 3. Handlers ---
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files);
            const totalImages = imageFiles.length + selectedFiles.length;

            // VALIDATION: Max 2 Images
            if (totalImages > 2) {
                alert('You can only upload a maximum of 2 images.');
                return;
            }

            // Generate Previews
            const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));

            setImageFiles(prev => [...prev, ...selectedFiles]);
            setImagePreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const removeImage = (index: number) => {
        setImageFiles(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    // --- 4. Submit Logic ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('>>> [DEBUG] Submit Triggered');
        setSubmitting(true);
        setError(null);

        try {
            console.log('>>> [DEBUG] Form Data:', formData);

            // --- VALIDATION ---
            if (!formData.name.trim()) throw new Error('Product Name is required.');
            if (!formData.price || parseFloat(formData.price) <= 0) throw new Error('Valid Price is required.');
            if (!formData.category_id) throw new Error('Category is required.');

            // Cake Strict Validation
            if (isCake()) {
                if (!formData.flavor.trim()) throw new Error('Cake Flavor is required.');
            }

            console.log('>>> [DEBUG] Validation Passed. Uploading Images...');

            // --- IMAGE UPLOAD (Supabase Storage) ---
            const uploadedImageUrls: string[] = [];
            if (imageFiles.length > 0) {
                // Ensure bucket exists
                // Note: We can't check bucket existence easily from client without failing, 
                // so we proceed and catch error.
                for (const file of imageFiles) {
                    const fileExt = file.name.split('.').pop();
                    const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;
                    const filePath = `${fileName}`;

                    console.log(`>>> [DEBUG] Uploading ${filePath}...`);
                    const { error: uploadError } = await supabase.storage
                        .from('products')
                        .upload(filePath, file);

                    if (uploadError) {
                        console.error('>>> [DEBUG] Upload Error:', uploadError);
                        throw new Error(`Image Upload Failed: ${uploadError.message}`);
                    }

                    const { data: { publicUrl } } = supabase.storage
                        .from('products')
                        .getPublicUrl(filePath);

                    uploadedImageUrls.push(publicUrl);
                }
            }

            console.log('>>> [DEBUG] Images Uploaded:', uploadedImageUrls);

            // --- DATA PREPARATION ---
            const baseSlug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            const uniqueSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

            let specifications = {};
            if (isCake()) {
                specifications = {
                    flavor: formData.flavor.trim(),
                    message: formData.message.trim(),
                };
            }

            // --- DB INSERT ---
            const insertPayload = {
                name: formData.name.trim(),
                slug: uniqueSlug,
                description: formData.description.trim(),
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock) || 0,
                category_id: formData.category_id,
                images: uploadedImageUrls,
                is_featured: true,
                is_archived: false,
                specifications: specifications,
                // New Delivery Logic
                delivery_charge: parseFloat(formData.delivery_charge) || 40.00,
                weight: parseFloat(formData.weight) || 0,
                dimensions: {
                    length: parseFloat(formData.dim_l) || 0,
                    width: parseFloat(formData.dim_w) || 0,
                    height: parseFloat(formData.dim_h) || 0
                }
            };

            console.log('>>> [DEBUG] Inserting into DB:', insertPayload);

            const { data, error: insertError } = await supabase
                .from('products')
                .insert(insertPayload)
                .select();

            if (insertError) {
                console.error('>>> [DEBUG] Insert Error:', insertError);
                throw new Error(`DB Insert Failed: ${insertError.message} (Code: ${insertError.code})`);
            }

            console.log('>>> [DEBUG] Insert Success:', data);

            // --- SUCCESS ---
            alert('✅ Product Added Successfully!');
            window.location.href = '/admin/products'; // Force hard redirect to be safe

        } catch (err: any) {
            console.error('>>> [DEBUG] CATCH Error:', err);
            // Force alert to ensure user sees it
            alert(`❌ ERROR: ${err.message}`);
            setError(err.message || 'Failed to add product.');
        } finally {
            setSubmitting(false);
        }
    };

    // --- 5. Render ---
    if (loading) {
        return <div className="text-white text-center py-20">Loading Editor...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-display font-bold text-white">Add New Product</h1>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-400 p-4 rounded-xl mb-6">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-slate-800 border border-slate-700 rounded-xl p-6 md:p-8 space-y-8 shadow-2xl">

                {/* SECTION 1: Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className="block text-slate-400 text-sm font-bold mb-2 uppercase tracking-wider">Product Name *</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                            placeholder="e.g. Chocolate Truffle Cake"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-slate-400 text-sm font-bold mb-2 uppercase tracking-wider">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                            placeholder="detailed description..."
                        />
                    </div>

                    <div>
                        <label className="block text-slate-400 text-sm font-bold mb-2 uppercase tracking-wider">Price (₹) *</label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                            placeholder="0.00"
                        />
                    </div>

                    <div>
                        <label className="block text-slate-400 text-sm font-bold mb-2 uppercase tracking-wider">Stock Qty *</label>
                        <input
                            type="number"
                            name="stock"
                            value={formData.stock}
                            onChange={handleChange}
                            min="0"
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>
                </div>

                {/* SECTION 1.5: Dimensions & Delivery */}
                <div className="border-t border-slate-700 pt-8">
                    <h3 className="text-xl text-white font-semibold mb-6 flex items-center gap-2">
                        <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                        Dimensions & Delivery
                    </h3>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-slate-400 text-xs font-bold mb-1 uppercase">Weight (kg)</label>
                            <input
                                type="number"
                                name="weight"
                                value={formData.weight}
                                onChange={handleChange}
                                step="0.01"
                                min="0"
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                                placeholder="0.5"
                            />
                        </div>
                        <div>
                            <label className="block text-slate-400 text-xs font-bold mb-1 uppercase">Delivery Fee (₹)</label>
                            <input
                                type="number"
                                name="delivery_charge"
                                value={formData.delivery_charge}
                                onChange={handleChange}
                                step="0.01"
                                min="0"
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                                placeholder="40"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-slate-400 text-xs font-bold mb-1 uppercase">Dimensions (L x W x H) cm</label>
                            <div className="grid grid-cols-3 gap-2">
                                <input type="number" name="dim_l" value={formData.dim_l} onChange={handleChange} placeholder="L" className="bg-slate-900 border border-slate-700 rounded px-2 py-2 text-white text-sm" />
                                <input type="number" name="dim_w" value={formData.dim_w} onChange={handleChange} placeholder="W" className="bg-slate-900 border border-slate-700 rounded px-2 py-2 text-white text-sm" />
                                <input type="number" name="dim_h" value={formData.dim_h} onChange={handleChange} placeholder="H" className="bg-slate-900 border border-slate-700 rounded px-2 py-2 text-white text-sm" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* SECTION 2: Category & Specifics */}
                <div className="border-t border-slate-700 pt-8">
                    <h3 className="text-xl text-white font-semibold mb-6 flex items-center gap-2">
                        <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                        Category Details
                    </h3>

                    <div className="mb-6">
                        <label className="block text-slate-400 text-sm font-bold mb-2 uppercase tracking-wider">Select Category *</label>
                        <select
                            name="category_id"
                            value={formData.category_id}
                            onChange={handleChange}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                        >
                            <option value="">-- Choose Category --</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* DYNAMIC FIELDS FOR CAKE */}
                    {isCake() && (
                        <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-6 animate-fade-in space-y-4">
                            <h4 className="text-purple-300 font-semibold mb-2">Cake Specifications</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-slate-400 text-xs font-bold mb-1 uppercase">Flavor *</label>
                                    <input
                                        type="text"
                                        name="flavor"
                                        value={formData.flavor}
                                        onChange={handleChange}
                                        className="w-full bg-slate-950 border border-purple-500/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-400 transition-colors"
                                        placeholder="e.g. Vanilla, Red Velvet"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-400 text-xs font-bold mb-1 uppercase">Message (Optional)</label>
                                    <input
                                        type="text"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        className="w-full bg-slate-950 border border-purple-500/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-400 transition-colors"
                                        placeholder="Message on cake..."
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* SECTION 3: Images */}
                <div className="border-t border-slate-700 pt-8">
                    <h3 className="text-xl text-white font-semibold mb-6 flex items-center gap-2">
                        <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        Product Images
                    </h3>

                    <div className="space-y-4">
                        <div className={`border-2 border-dashed border-slate-700 rounded-xl p-8 text-center transition-all ${imageFiles.length >= 2 ? 'opacity-50 cursor-not-allowed' : 'hover:border-purple-500 hover:bg-slate-800/50 cursor-pointer'} relative`}>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                accept="image/png, image/jpeg, image/webp"
                                multiple
                                disabled={imageFiles.length >= 2}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                            />
                            <div className="pointer-events-none">
                                <p className="text-slate-300 font-medium">Click to upload images</p>
                                <p className="text-slate-500 text-sm mt-1">Max 2 images (JPG, PNG, WEBP)</p>
                            </div>
                        </div>

                        {/* Previews */}
                        {imagePreviews.length > 0 && (
                            <div className="grid grid-cols-2 gap-4">
                                {imagePreviews.map((src, i) => (
                                    <div key={i} className="relative group rounded-lg overflow-hidden border border-slate-700">
                                        <img src={src} alt="Preview" className="w-full h-32 object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(i)}
                                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-8 flex justify-end gap-4 border-t border-slate-700">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-6 py-3 rounded-xl border border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700 transition-all font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:grayscale flex items-center gap-2"
                    >
                        {submitting ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                Saving...
                            </>
                        ) : (
                            'Save Product'
                        )}
                    </button>
                </div>

            </form>
        </div>
    );
}
