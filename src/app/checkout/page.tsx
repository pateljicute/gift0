'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { formatCurrency } from '@/utils/format';

export default function CheckoutPage() {
  const { cart, clearCart, unlockedGift } = useCart();
  const { user, signInWithGoogle, loading: authLoading } = useAuth(); // Create signInWithGoogle usage
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    houseNo: '',
    street: '',
    city: '',
    state: '',
    zip: ''
  });

  // Load saved address from profile
  useEffect(() => {
    if (!user) return;

    const loadProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        setFormData(prev => ({
          ...prev,
          name: data.full_name || prev.name,
          phone: data.phone || '',
          houseNo: data.house_no || '',
          street: data.street || '',
          city: data.city || '',
          state: data.state || '',
          zip: data.zip || ''
        }));
      }
    };

    loadProfile();
  }, [user, supabase]);

  // Check auth status
  if (authLoading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading...</div>;
  }

  // Force Login if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
        <div className="max-w-md w-full bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-2xl">
          <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-display font-bold text-white mb-2">Secure Checkout</h1>
          <p className="text-slate-400 mb-8">Please sign in to complete your purchase and view exclusive member pricing.</p>

          <button
            onClick={() => signInWithGoogle()}
            className="w-full bg-white text-slate-900 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-3 hover:bg-slate-100 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Sign in with Google
          </button>

          <p className="text-xs text-slate-500 mt-4">
            By continuing, you verify that you are a real user.
          </p>
        </div>
      </div>
    );
  }

  // Auth is confirmed
  const checkoutTotal = cart.items.reduce((sum, item) => {
    return sum + (item.product.price * item.quantity); // Always full price
  }, 0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const fullAddress = `${formData.houseNo}, ${formData.street}, ${formData.city}, ${formData.state} - ${formData.zip}`;

      // 0. Update Profile with latest address (Background sync)
      if (user) {
        supabase.from('profiles').upsert({
          id: user.id,
          full_name: formData.name, // Update name if changed
          phone: formData.phone,
          house_no: formData.houseNo,
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
          updated_at: new Date().toISOString(),
        }).then(({ error }) => {
          if (error) console.error('Failed to save address to profile:', error);
        });
      }

      // 1. Create Order with Timeout Safety
      const createOrderPromise = supabase.from('orders').insert({
        user_id: user.id, // User is guaranteed
        status: 'pending',
        total: checkoutTotal,
        customer_address: `${formData.name}, ${formData.phone}\n${fullAddress}`,
        customer_name: formData.name,
        customer_phone: formData.phone,
        // Add Gift Details
        gift_name: unlockedGift ? (unlockedGift.product?.name || unlockedGift.gift_name) : null,
        gift_image_url: unlockedGift ? (unlockedGift.product?.images?.[0] || unlockedGift.gift_image_url) : null
      }).select().single();

      // Timeout after 15 seconds
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timed out. Please check your internet connection or try again.')), 15000)
      );

      const { data: order, error } = await Promise.race([createOrderPromise, timeoutPromise]) as any;

      if (error) throw error;

      // 2. Create Items
      if (order) {
        const orderItems = cart.items.map(item => ({
          order_id: order.id,
          product_id: item.product.id,
          quantity: item.quantity,
          price: item.product.price // Always full price
        }));
        const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
        if (itemsError) throw itemsError;
      }

      // 3. Construct Message
      let message = `*New Order #${order?.id?.slice(0, 8)}*\n\n`;
      message += `*Customer:* ${formData.name}\n`;
      message += `*Phone:* ${formData.phone}\n`;
      message += `*Address:* ${fullAddress}\n\n`;
      message += `*Items:*\n`;
      cart.items.forEach(item => {
        message += `- ${item.product.name} (x${item.quantity})\n`;
      });

      // Add Gift to WhatsApp Message
      if (unlockedGift) {
        const giftName = unlockedGift.product?.name || unlockedGift.gift_name;
        message += `\n🎁 *FREE GIFT UNLOCKED: ${giftName}*\n`;
      }

      message += `\n*Total: ${formatCurrency(checkoutTotal)}*`;

      const whatsappUrl = `https://wa.me/917470724553?text=${encodeURIComponent(message)}`;

      setSuccess(true);
      clearCart();

      // Short delay before redirect
      setTimeout(() => {
        window.location.href = whatsappUrl;
      }, 3000);

    } catch (error: any) {
      console.error('Checkout error:', error);
      alert('Failed to place order: ' + (error.message || 'Unknown error'));
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center animate-fade-in">
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-500/50 animate-bounce">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-4xl font-display font-bold text-white mb-2">Congratulations!</h1>
        <p className="text-xl text-slate-300 mb-8">Your order has been placed successfully.</p>

        <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 max-w-sm w-full mx-auto mb-8">
          <p className="text-slate-400 text-sm mb-2">Redirecting to WhatsApp for confirmation...</p>
          <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 animate-[progress_3s_linear_forwards]" style={{ width: '0%' }} />
          </div>
        </div>

        <p className="text-sm text-slate-500">
          If you are not redirected automatically, <a href="#" className="underline text-green-400">click here</a>.
        </p>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-4">
        <h1 className="text-2xl font-bold mb-4">Your Cart is Empty</h1>
        <button onClick={() => router.push('/')} className="text-purple-400 hover:text-purple-300">
          &larr; Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-display font-bold text-white mb-8 text-center">Secure Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary (Left/Top) */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
              <h2 className="text-xl font-semibold text-white mb-4">Order Summary</h2>
              <div className="space-y-4 mb-4">
                {cart.items.map((item) => (
                  <div key={item.product.id} className="flex justify-between items-center text-slate-300">
                    <div className="flex-1">
                      <div className="text-sm text-white font-medium">{item.product.name}</div>
                      <div className="text-xs text-slate-500">Qty: {item.quantity}</div>
                    </div>
                    <div className="text-sm font-medium">
                      {formatCurrency(item.product.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-800 pt-4 flex justify-between items-center">
                <span className="text-lg font-bold text-white">Total</span>
                <span className="text-xl font-bold text-purple-400">{formatCurrency(checkoutTotal)}</span>
              </div>
            </div>
          </div>

          {/* Detailed Form (Right/Bottom) */}
          <div className="lg:col-span-2 bg-slate-900 p-6 rounded-xl border border-slate-800">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Delivery Address
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide">Full Name</label>
                  <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide">Phone Number</label>
                  <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500" placeholder="9876543210" />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/50">
                <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide">House No / Building Name</label>
                <input type="text" name="houseNo" required value={formData.houseNo} onChange={handleChange} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500" placeholder="Flat 101, Galaxy Apartments" />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide">Street / Colony / Area</label>
                <input type="text" name="street" required value={formData.street} onChange={handleChange} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500" placeholder="Sector 4, Main Road" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide">City</label>
                  <input type="text" name="city" required value={formData.city} onChange={handleChange} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide">State</label>
                  <input type="text" name="state" required value={formData.state} onChange={handleChange} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide">Pincode</label>
                  <input type="text" name="zip" required value={formData.zip} onChange={handleChange} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-8 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transform hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
              >
                {loading ? 'Processing...' : (
                  <>
                    <span>Confirm Order on WhatsApp</span>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.463 1.065 2.876 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" /></svg>
                  </>
                )}
              </button>
              <p className="text-xs text-slate-500 text-center mt-4">
                By placing this order, you will be redirected to WhatsApp to communicate directly with our team.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}