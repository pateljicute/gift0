// Product Types
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: CategorySlug;
  images: string[];
  inStock: boolean;
  featured?: boolean;
  variants?: ProductVariant[];
  specifications?: Record<string, string>;
  rating?: number;
  reviewCount?: number;
}

export interface ProductVariant {
  id: string;
  name: string;
  options: string[];
}

// Category Types
export type CategorySlug = 'sublimation-mugs' | 'frames' | 'gift-items';

export interface Category {
  id: string;
  name: string;
  slug: CategorySlug;
  description: string;
  image: string;
  productCount: number;
}

// Cart Types
export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariants?: Record<string, string>;
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
}

// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
}

export interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  isDefault: boolean;
}

// Order Types
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  date: string;
  status: OrderStatus;
  items: CartItem[];
  total: number;
  shippingAddress: Address;
}

// Filter Types
export interface FilterOptions {
  priceRange?: [number, number];
  inStockOnly?: boolean;
  sortBy?: 'price-asc' | 'price-desc' | 'name' | 'newest';
}
