import { supabase } from '@/lib/supabaseClient';

export interface Product {
  id?: number;
  created_at?: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
}

export const getProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error.message);
    return { error };
  }

  return { data };
};

export const getProductById = async (id: number) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching product:', error.message);
    return { error };
  }

  return { data };
};

export const createProduct = async (product: Product) => {
  const { data, error } = await supabase
    .from('products')
    .insert([product])
    .select()
    .single();

  if (error) {
    console.error('Error creating product:', error.message);
    return { error };
  }

  return { data };
};

export const updateProduct = async (id: number, product: Partial<Product>) => {
  const { data, error } = await supabase
    .from('products')
    .update(product)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating product:', error.message);
    return { error };
  }

  return { data };
};

export const deleteProduct = async (id: number) => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting product:', error.message);
    return { error };
  }

  return {};
};