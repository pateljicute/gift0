import { supabase } from '@/lib/supabaseClient';

export interface Order {
  id?: number;
  created_at?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  product_id: number;
  quantity: number;
  total_price: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
}

export const getOrders = async () => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      products(name)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error.message);
    return { error };
  }

  return { data };
};

export const getOrderById = async (id: number) => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      products(name)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching order:', error.message);
    return { error };
  }

  return { data };
};

export const createOrder = async (order: Omit<Order, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('orders')
    .insert([order])
    .select()
    .single();

  if (error) {
    console.error('Error creating order:', error.message);
    return { error };
  }

  return { data };
};

export const updateOrderStatus = async (id: number, status: Order['status']) => {
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating order status:', error.message);
    return { error };
  }

  return { data };
};