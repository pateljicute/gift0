'use client';

import React, { useCallback, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface ImageUploadProps {
    onUpload: (urls: string[]) => void;
    existingImages?: string[];
}

export default function ImageUpload({ onUpload, existingImages = [] }: ImageUploadProps) {
    const [images, setImages] = useState<string[]>(existingImages);
    const [uploading, setUploading] = useState(false);

    // In a real app, I'd use react-dropzone, but for simplicity/no-deps I'll use a standard input
    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('You must select an image to upload.');
            }

            const files = Array.from(event.target.files);
            const newUrls: string[] = [];

            for (const file of files) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
                const filePath = `${fileName}`;

                // Upload to 'products' bucket
                const { error: uploadError } = await supabase.storage
                    .from('products')
                    .upload(filePath, file);

                if (uploadError) {
                    throw uploadError;
                }

                // Get public URL
                const { data } = supabase.storage.from('products').getPublicUrl(filePath);
                newUrls.push(data.publicUrl);
            }

            const updatedImages = [...images, ...newUrls];
            setImages(updatedImages);
            onUpload(updatedImages);
        } catch (error) {
            alert((error as Error).message);
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (indexToRemove: number) => {
        const updatedImages = images.filter((_, index) => index !== indexToRemove);
        setImages(updatedImages);
        onUpload(updatedImages);
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
                {images.map((url, index) => (
                    <div key={index} className="relative w-32 h-32 rounded-lg overflow-hidden border border-slate-700 group">
                        <img src={url} alt="Product" className="w-full h-full object-cover" />
                        <button
                            onClick={() => removeImage(index)}
                            type="button"
                            className="absolute top-1 right-1 bg-red-500/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                ))}

                <label className={`w-32 h-32 flex flex-col items-center justify-center border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:border-purple-500 hover:bg-slate-800/50 transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    {uploading ? (
                        <div className="spinner w-8 h-8 border-2" />
                    ) : (
                        <>
                            <svg className="w-8 h-8 text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span className="text-xs text-slate-400">Add Image</span>
                        </>
                    )}
                    <input
                        type="file"
                        className="hidden"
                        multiple
                        accept="image/*"
                        onChange={handleUpload}
                        disabled={uploading}
                    />
                </label>
            </div>
            <p className="text-xs text-slate-500">
                Supported formats: JPG, PNG, GIF, WebP. Max size: 5MB.
            </p>
        </div>
    );
}
