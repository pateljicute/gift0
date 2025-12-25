
import { Product, Category } from './types';

export const MOCK_CATEGORIES: Category[] = [
    {
        id: 'cat_1',
        name: 'Sublimation Mugs',
        slug: 'sublimation-mugs',
        description: 'Custom designed sublimation mugs',
        image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&q=80&w=800',
        productCount: 4
    },
    {
        id: 'cat_2',
        name: 'Frames',
        slug: 'frames',
        description: 'Beautiful photo frames',
        image: 'https://images.unsplash.com/photo-1583039803625-441297e2d3e0?auto=format&fit=crop&q=80&w=800',
        productCount: 3
    },
    {
        id: 'cat_3',
        name: 'Gift Items',
        slug: 'gift-items',
        description: 'Special gifts for every occasion',
        image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=800',
        productCount: 5
    }
];

export const MOCK_PRODUCTS: Product[] = [
    {
        id: 'prod_1',
        name: 'Classic White Mug',
        slug: 'classic-white-mug',
        description: 'A classic white ceramic mug perfect for sublimation printing.',
        price: 9.99,
        category: 'sublimation-mugs',
        images: ['https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&q=80&w=800'],
        inStock: true,
        featured: true,
        rating: 4.5,
        reviewCount: 12,
        delivery_charge: 40,
        weight: 0.5
    },
    {
        id: 'prod_2',
        name: 'Wooden Photo Frame',
        slug: 'wooden-photo-frame',
        description: 'Elegant wooden photo frame for your cherished memories.',
        price: 24.99,
        originalPrice: 29.99,
        category: 'frames',
        images: ['https://images.unsplash.com/photo-1583039803625-441297e2d3e0?auto=format&fit=crop&q=80&w=800'],
        inStock: true,
        featured: true,
        rating: 4.8,
        reviewCount: 8,
        delivery_charge: 60,
        weight: 1.2
    },
    {
        id: 'prod_3',
        name: 'Custom Gift Box',
        slug: 'custom-gift-box',
        description: 'A beautiful gift box for special occasions.',
        price: 15.50,
        category: 'gift-items',
        images: ['https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=800'],
        inStock: true,
        featured: false,
        rating: 4.2,
        reviewCount: 5,
        delivery_charge: 50,
        weight: 0.8
    },
    {
        id: 'prod_4',
        name: 'Magic Mug',
        slug: 'magic-mug',
        description: 'Heat sensitive mug that reveals design when hot.',
        price: 12.99,
        category: 'sublimation-mugs',
        images: ['https://images.unsplash.com/photo-1577937927133-66ef06ac47be?auto=format&fit=crop&q=80&w=800'],
        inStock: false,
        featured: false,
        rating: 4.0,
        reviewCount: 3
    }
];
