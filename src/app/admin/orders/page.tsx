'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { formatCurrency } from '@/utils/format';

interface OrderItem {
  id: number;
  quantity: number;
  product: {
    name: string;
    image_url?: string;
  };
}

interface OrderData {
  id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  total_price: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  created_at: string;
  order_items: OrderItem[];
  gift_name?: string;
  gift_image_url?: string;
}

export default function OrdersManagement() {
  const supabase = createClient();
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
            quantity,
            product:products(name, images)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error.message);
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  const updateOrderStatus = async (id: number, status: OrderData['status']) => {
    // We select() the returned data to ensure the row was actually found and updated.
    // If RLS blocks it, data will be empty/null usually (or count 0).
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error updating order status:', error.message);
      alert(`Error updating: ${error.message}`);
    } else if (!data || data.length === 0) {
      // RLS Silent Failure Case
      console.error('Update succeeded but no rows were affected. Check RLS policies.');
      alert('Update failed! You do not have permission to update this order. Please run the "fix_admin_permissions.sql" script in Supabase.');
    } else {
      // Success
      setOrders(orders.map(order =>
        order.id === id ? { ...order, status } : order
      ));
    }
  };

  const getStatusClass = (status: OrderData['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Orders Management</h1>

        {loading ? (
          <div className="mt-6 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="mt-6">
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <li key={order.id} className="hover:bg-slate-50">
                    <div className="px-4 py-4 sm:px-6">
                      {/* Header Row */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-4">
                          <p className="text-sm font-medium text-indigo-600 truncate">
                            Order #{order.id}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(order.created_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(order.status)}`}>
                            {order.status.toUpperCase()}
                          </p>
                        </div>
                      </div>

                      {/* Content Grid */}
                      <div className="md:grid md:grid-cols-2 md:gap-4">

                        {/* Customer Details */}
                        <div className="mb-4 md:mb-0">
                          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Customer</h4>
                          <p className="text-sm font-medium text-gray-900">{order.customer_name || 'N/A'}</p>
                          <p className="text-sm text-gray-600">{order.customer_phone || 'N/A'}</p>
                          <p className="text-sm text-gray-500 mt-1 whitespace-pre-wrap">{order.customer_address}</p>
                        </div>

                        {/* Order Items */}
                        <div>
                          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Items</h4>
                          <ul className="space-y-2">
                            {order.order_items?.map((item, idx) => (
                              <li key={idx} className="flex justify-between text-sm">
                                <span className="text-gray-800">
                                  {item.product?.name || 'Unknown Item'} <span className="text-gray-400">x{item.quantity}</span>
                                </span>
                              </li>
                            ))}
                            {/* Free Gift Display */}
                            {order.gift_name && (
                              <li className="flex justify-between text-sm bg-purple-50 p-2 rounded border border-purple-100">
                                <span className="text-purple-700 font-medium flex items-center gap-2">
                                  <span>🎁</span>
                                  {order.gift_name}
                                </span>
                                <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full uppercase">
                                  FREE
                                </span>
                              </li>
                            )}
                          </ul>
                          <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                            <span className="font-semibold text-gray-700">Total</span>
                            <span className="font-bold text-indigo-600 text-lg">
                              {formatCurrency(order.total || order.total_price)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-4 flex justify-end space-x-3 pt-4 border-t border-gray-100">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderData['status'])}
                          className="block w-40 pl-3 pr-10 py-1.5 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                        </select>
                        <button
                          onClick={() => updateOrderStatus(order.id, 'delivered')}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 shadow-sm"
                        >
                          Mark Delivered
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
