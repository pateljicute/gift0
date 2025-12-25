'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { createSlug } from '@/utils/format';
import ImageUpload from '@/components/admin/ImageUpload';
import { Category } from '@/data/types';

export default function NewProductPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    sale_price: '',
    stock: '',
    category_id: '',
    is_featured: false,
    images: [] as string[]
  });

  useEffect(() => {
    // Fetch categories for the dropdown
    async function fetchCategories() {
      const { data, error } = await supabase.from('categories').select('*');
      if (data) setCategories(data as unknown as Category[]); // Type assertion for now or map properly
    }
    fetchCategories();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageUpload = (urls: string[]) => {
    setFormData(prev => ({ ...prev, images: urls }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const slug = createSlug(formData.name);

      const { error } = await supabase.from('products').insert({
        name: formData.name,
        slug: slug,
        description: formData.description,
        price: parseFloat(formData.price),
        sale_price: formData.sale_price ? parseFloat(formData.sale_price) : null,
        stock: parseInt(formData.stock),
        category_id: formData.category_id,
        images: formData.images,
        is_featured: formData.is_featured
      });

      if (error) throw error;

      alert('Product created successfully!');
      router.push('/admin/products');
      router.refresh();
    } catch (error) {
      alert('Error creating product: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-3xl font-display font-bold text-white">Add New Product</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="card p-6 space-y-6">
          <h2 className="text-xl font-bold text-white">Basic Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Product Name</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="input"
                placeholder="Microfiber Cushion"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Category</label>
              <select
                name="category_id"
                required
                value={formData.category_id}
                onChange={handleChange}
                className="input"
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Description</label>
            <textarea
              name="description"
              required
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="input min-h-[100px]"
              placeholder="Product description and details..."
            />
          </div>
        </div>

        {/* Pricing & Inventory */}
        <div className="card p-6 space-y-6">
          <h2 className="text-xl font-bold text-white">Pricing & Inventory</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Price (₹)</label>
              <input
                type="number"
                name="price"
                required
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                className="input"
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Sale Price (Optional)</label>
              <input
                type="number"
                name="sale_price"
                min="0"
                step="0.01"
                value={formData.sale_price}
                onChange={handleChange}
                className="input"
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Stock Quantity</label>
              <input
                type="number"
                name="stock"
                required
                min="0"
                value={formData.stock}
                onChange={handleChange}
                className="input"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Media */}
        <div className="card p-6 space-y-6">
          <h2 className="text-xl font-bold text-white">Product Images</h2>
          <ImageUpload onUpload={handleImageUpload} existingImages={formData.images} />
        </div>

        {/* Settings */}
        <div className="card p-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="is_featured"
              checked={formData.is_featured}
              onChange={handleChange}
              className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-purple-500 focus:ring-2 focus:ring-purple-500/20"
            />
            <span className="text-white font-medium">mark as Featured Product</span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-ghost px-6"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`btn-primary px-8 ${loading ? 'opacity-70 cursor-wait' : ''}`}
          >
            {loading ? 'Creating...' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
}