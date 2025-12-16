'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface ImageGalleryProps {
    images: string[];
    productName: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, productName }) => {
    const [selectedImage, setSelectedImage] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);

    return (
        <div className="space-y-4">
            {/* Main Image */}
            <div
                className="relative aspect-square rounded-2xl overflow-hidden bg-slate-800 cursor-zoom-in group"
                onClick={() => setIsZoomed(!isZoomed)}
            >
                <Image
                    src={images[selectedImage] || '/placeholder.jpg'}
                    alt={productName}
                    fill
                    className={`object-cover transition-transform duration-500 ${isZoomed ? 'scale-150' : 'group-hover:scale-110'
                        }`}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                />

                {/* Zoom Hint */}
                <div className="absolute bottom-4 right-4 glass-strong px-3 py-1.5 rounded-lg text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                    Click to zoom
                </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                    {images.map((image, index) => (
                        <button
                            key={index}
                            onClick={() => setSelectedImage(index)}
                            className={`relative aspect-square rounded-lg overflow-hidden bg-slate-800 transition-all ${selectedImage === index
                                    ? 'ring-2 ring-purple-500'
                                    : 'hover:opacity-75'
                                }`}
                        >
                            <Image
                                src={image || '/placeholder.jpg'}
                                alt={`${productName} ${index + 1}`}
                                fill
                                className="object-cover"
                                sizes="150px"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ImageGallery;
