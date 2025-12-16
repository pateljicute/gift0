'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Define category type for the dropdown
interface Category {
    id: string;
    name: string;
    slug: string;
}

export default function AddProductPage() {
    const supabase = createClientComponentClient();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [uploading, setUploading] = useState(false);

    // Multiple images state
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [fetchError, setFetchError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category_id: '',
        stock: '1',
    });

    const fetchCategories = async () => {
        setFetchError(null);
        try {
            const { data, error } = await supabase.from('categories').select('id, name, slug');
            if (error) throw error;

            if (data && data.length > 0) {
                setCategories(data);
                if (!formData.category_id) {
                    setFormData(prev => ({ ...prev, category_id: data[0].id }));
                }
            } else {
                setCategories([]);
            }
        } catch (err: any) {
            console.error('Error fetching categories:', err);
            setFetchError(err.message);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const seedCategories = async () => {
        if (!confirm('This will add default categories to the database. Continue?')) return;
        setLoading(true);
        try {
            const defaultCategories = [
                { name: 'Gift Items', slug: 'gift-items', description: 'Unique gifts' },
                { name: 'Sublimation Mugs', slug: 'sublimation-mugs', description: 'Custom mugs' },
                { name: 'Frames', slug: 'frames', description: 'Photo frames' },
                { name: 'Keychains', slug: 'keychains', description: 'Personalized keychains' },
                { name: 'Bottles', slug: 'bottles', description: 'Custom bottles' }
            ];

            const { error } = await supabase.from('categories').insert(defaultCategories);
            if (error) throw error;

            alert('Categories seeded successfully!');
            fetchCategories();
        } catch (err: any) {
            alert('Failed to seed categories: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const newPreviews = files.map(file => URL.createObjectURL(file));

            setImageFiles(prev => [...prev, ...files]);
            setImagePreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const removeImage = (index: number) => {
        setImageFiles(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const uploadImages = async (): Promise<string[]> => {
        const urls: string[] = [];
        setUploading(true);

        try {
            for (const file of imageFiles) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('products')
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('products')
                    .getPublicUrl(filePath);

                urls.push(publicUrl);
            }
            return urls;
        } catch (error: any) {
            console.error('Upload failed:', error);
            throw error;
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validate Category
            if (!formData.category_id || formData.category_id === '') {
                throw new Error('Please select a category');
            }

            // Upload Images
            let imageUrls: string[] = [];
            if (imageFiles.length > 0) {
                imageUrls = await uploadImages();
            }

            // Generate unique slug
            const baseSlug = formData.name.toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)+/g, '');
            const slug = `${baseSlug}-${Date.now().toString().slice(-6)}`;

            // Insert Product
            const { error } = await supabase.from('products').insert({
                name: formData.name,
                slug: slug,
                description: formData.description,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock),
                category_id: formData.category_id,
                images: imageUrls,
                is_featured: true,
                is_archived: false,
                created_at: new Date().toISOString()
            });

            if (error) throw error;

            alert('Product added successfully!');
            router.push('/admin/products');
            router.refresh();

        } catch (error: any) {
            console.error('Error adding product:', error);
            alert(`Failed to add product: ${error.message || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-display font-bold text-white mb-8">Add New Product</h1>

            <form onSubmit={handleSubmit} className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-6">

                {/* Product Name */}
                <div>
                    <label className="block text-slate-300 font-medium mb-2">Product Name</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                        placeholder="e.g. Personalized Mug"
                    />
                </div>

                <div>
                    <label className="block text-slate-300 font-medium mb-2">Category</label>
                    <select
                        name="category_id"
                        value={formData.category_id}
                        onChange={handleChange}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                    >
                        <option value="">Select a Category</option>
                        {categories.filter(c => ['gift', 'frames'].includes(c.slug)).map(cat => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-slate-300 font-medium mb-2">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={4}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                        placeholder="Product description..."
                    />
                </div>

                {/* Price & Stock */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-slate-300 font-medium mb-2">Price (₹)</label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            required
                            min="0"
                            step="0.01"
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                            placeholder="0.00"
                        />
                    </div>
                    <div>
                        <label className="block text-slate-300 font-medium mb-2">Stock Quantity</label>
                        <input
                            type="number"
                            name="stock"
                            value={formData.stock}
                            onChange={handleChange}
                            required
                            min="0"
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                        />
                    </div>
                </div>

                {/* Multiple Image Upload */}
                <div>
                    <label className="block text-slate-300 font-medium mb-2">Product Images (Add Multiple)</label>
                    <div className={`border-2 border-dashed border-slate-700 rounded-xl p-8 text-center hover:border-purple-500 transition-colors relative ${uploading ? 'opacity-50' : ''}`}>

                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />

                        <div className="pointer-events-none">
                            <svg className="w-10 h-10 text-slate-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-slate-400">Click to upload images</p>
                            <p className="text-sm text-slate-600 mt-1">Supports JPG, PNG, WEBP (Multiple allowed)</p>
                        </div>
                    </div>

                    {/* Image Previews */}
                    {imagePreviews.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                            {imagePreviews.map((src, index) => (
                                <div key={index} className="relative group">
                                    <img src={src} alt={`Preview ${index}`} className="w-full h-24 object-cover rounded-lg border border-slate-700" />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Submit Button */}
                <div className="pt-4 flex justify-end">
                    <button
                        type="submit"
                        disabled={loading || uploading}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:hover:scale-100 flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Saving...
                            </>
                        ) : 'Save Product'}
                    </button>
                </div>

            </form>
        </div>
    );
}
