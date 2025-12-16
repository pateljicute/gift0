import React from 'react';
import { Order } from '@/data/types';
import { formatCurrency, formatDateShort } from '@/utils/format';
import Badge from '../ui/Badge';

interface OrderHistoryProps {
    orders: Order[];
}

const OrderHistory: React.FC<OrderHistoryProps> = ({ orders }) => {
    const getStatusVariant = (status: Order['status']) => {
        switch (status) {
            case 'delivered':
                return 'success';
            case 'shipped':
                return 'primary';
            case 'processing':
                return 'warning';
            case 'cancelled':
                return 'error';
            default:
                return 'warning';
        }
    };

    if (orders.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
                    <svg className="w-12 h-12 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                </div>
                <h3 className="text-xl font-display font-bold text-white mb-2">No Orders Yet</h3>
                <p className="text-slate-400 mb-6">Start shopping to see your order history here</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {orders.map((order) => (
                <div key={order.id} className="card p-6 hover:border-slate-600 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h4 className="font-semibold text-white text-lg mb-1">Order #{order.id}</h4>
                            <p className="text-sm text-slate-400">{formatDateShort(order.date)}</p>
                        </div>
                        <Badge variant={getStatusVariant(order.status)}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                    </div>

                    <div className="space-y-2 mb-4">
                        {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                                <span className="text-slate-300">
                                    {item.product.name} × {item.quantity}
                                </span>
                                <span className="text-white font-medium">
                                    {formatCurrency(item.product.price * item.quantity)}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="pt-4 border-t border-slate-700 flex items-center justify-between">
                        <span className="text-slate-400">Total</span>
                        <span className="text-xl font-bold text-white">{formatCurrency(order.total)}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default OrderHistory;
