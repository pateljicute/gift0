'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { formatCurrency } from '@/utils/format';

export default function CheckoutPage() {
  const { cart, clearCart, unlockedGift } = useCart();
  const { user, signInWithGoogle, loading: authLoading } = useAuth();
  const router = useRouter();
  const supabase = createClientComponentClient();

  // Status: idle | processing | success | error
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

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

  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'delivery'>('pickup');
  const [whatsappUrl, setWhatsappUrl] = useState('');

  // Check auth status
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p>Loading your profile...</p>
        </div>
      </div>
    );
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

  // Calculate Totals
  const calculateTotals = () => {
    const subtotal = cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    let delivery = 0;
    if (deliveryMethod === 'delivery') {
      if (subtotal < 1000) {
        delivery = cart.items.reduce((sum, item) => {
          const charge = item.product.delivery_charge || 40;
          return sum + (charge * item.quantity);
        }, 0);
      }
    }

    return {
      subtotal,
      delivery,
      total: subtotal + delivery
    };
  };

  const { subtotal, delivery, total } = calculateTotals();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('processing');
    setErrorMessage('');

    try {
      const fullAddress = deliveryMethod === 'pickup'
        ? 'Pickup from Shop'
        : `${formData.houseNo}, ${formData.street}, ${formData.city}, ${formData.state} - ${formData.zip}`;

      // 0. Update Profile (Only if Home Delivery, to save address)
      if (user && deliveryMethod === 'delivery') {
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: user.id,
          full_name: formData.name,
          phone: formData.phone,
          house_no: formData.houseNo,
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
          updated_at: new Date().toISOString(),
        });
        if (profileError) console.warn('Failed to save profile address:', profileError);
      }

      // 1. Create Order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id || null,
          customer_name: formData.name,
          customer_email: user.email,
          customer_phone: formData.phone,
          customer_address: fullAddress,
          total_price: total,
          status: 'pending',
          gift_name: unlockedGift ? (unlockedGift.product?.name || unlockedGift.gift_name) : null,
          gift_image_url: unlockedGift ? (unlockedGift.product?.images?.[0] || unlockedGift.gift_image_url) : null
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Save Order Items
      const orderItems = cart.items.map(item => ({
        order_id: order.id,
        product_id: item.product.id,
        quantity: item.quantity,
        price_at_time: item.product.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // 3. Construct WhatsApp Message
      let message = `*New Order Placed!* 🛍️%0A%0A`;
      message += `*Customer Details:*%0A`;
      message += `Name: ${formData.name}%0A`;
      message += `Phone: ${formData.phone}%0A`;
      message += `${deliveryMethod === 'delivery' ? `Address: ${fullAddress}%0A` : `*PICKUP FROM SHOP* 🏪%0A`}`;

      message += `%0A*Order Items:*%0A`;
      cart.items.forEach(item => {
        message += `- ${item.product.name} (x${item.quantity})%0A`;
      });

      if (unlockedGift) {
        message += `🎁 FREE GIFT: ${unlockedGift.product?.name || unlockedGift.gift_name}%0A`;
      }

      message += `%0A----------------%0A`;
      message += `Subtotal: ₹${subtotal.toFixed(2)}%0A`;
      message += `${deliveryMethod === 'delivery' ? `Delivery Fee: ${delivery === 0 ? 'FREE' : `₹${delivery.toFixed(2)}`}%0A` : ''}`;
      message += `*Total Amount: ₹${total.toFixed(2)}*`;

      const generatedLink = `https://wa.me/917470724553?text=${encodeURIComponent(message)}`;
      setWhatsappUrl(generatedLink);

      // 4. Success State
      setStatus('success');
      clearCart();

      // 5. Attempt Auto-Redirect after short delay
      setTimeout(() => {
        window.location.href = generatedLink;
      }, 1500);

    } catch (err: any) {
      console.error('Checkout Error:', err);
      setStatus('error');
      setErrorMessage(err.message || 'An unexpected error occurred. Please try again.');
    }
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center animate-fade-in">
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-500/50 animate-bounce">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-4xl font-display font-bold text-white mb-2">Order Placed!</h1>
        <p className="text-xl text-slate-300 mb-8">Redirecting you to WhatsApp to complete your order...</p>

        <a
          href={whatsappUrl}
          className="bg-[#25D366] text-white font-bold py-3 px-8 rounded-full hover:bg-[#128C7E] transition-colors flex items-center gap-2 shadow-lg"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.463 1.065 2.876 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" /></svg>
          Click here if not redirected
        </a>
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
    <div className="min-h-screen pt-24 pb-12 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-display font-bold text-white mb-8">Checkout</h1>

        {/* Error Banner */}
        {status === 'error' && errorMessage && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-4 rounded-xl mb-6 flex items-start gap-3">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-bold">Order Failed</p>
              <p className="text-sm">{errorMessage}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* LEFT COLUMN: Forms */}
          <div>
            <div className="flex gap-4 mb-8">
              <button
                onClick={() => setDeliveryMethod('pickup')}
                className={`flex-1 py-4 rounded-xl border-2 font-bold transition-all ${deliveryMethod === 'pickup' ? 'border-purple-500 bg-purple-500/10 text-white' : 'border-slate-800 bg-slate-900 text-slate-400'}`}
              >
                Visit Shop
              </button>
              <button
                onClick={() => setDeliveryMethod('delivery')}
                className={`flex-1 py-4 rounded-xl border-2 font-bold transition-all ${deliveryMethod === 'delivery' ? 'border-purple-500 bg-purple-500/10 text-white' : 'border-slate-800 bg-slate-900 text-slate-400'}`}
              >
                Home Delivery
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name and Phone Inputs */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide">Name</label>
                  <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide">Phone Number</label>
                  <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500" placeholder="9876543210" />
                </div>
              </div>

              {deliveryMethod === 'delivery' && (
                <>
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
                </>
              )}

              {/* Submit Button with Loading State */}
              <button
                type="submit"
                disabled={status === 'processing'}
                className={`w-full mt-8 font-bold py-4 rounded-xl shadow-lg transform transition-all flex items-center justify-center gap-2 ${status === 'processing'
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-[#25D366] hover:bg-[#128C7E] text-white hover:scale-[1.02] shadow-green-500/30'
                  }`}
              >
                {status === 'processing' ? (
                  <>
                    <div className="w-5 h-5 border-2 border-slate-400 border-t-white rounded-full animate-spin" />
                    <span>Processing Order...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.463 1.065 2.876 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" /></svg>
                    <span>{`Place Order • ₹${total.toFixed(2)}`}</span>
                  </>
                )}
              </button>

              <p className="text-xs text-slate-500 text-center mt-4">
                By placing this order, you will be redirected to WhatsApp to communicate directly with our team.
              </p>
            </form>
          </div>

          {/* RIGHT COLUMN: Order Summary */}
          <div>
            <div className="bg-slate-800 rounded-2xl p-6 sticky top-24">
              <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                {cart.items.map((item) => (
                  <div key={item.product.id} className="flex gap-4">
                    <div className="w-16 h-16 bg-slate-700 rounded-lg overflow-hidden flex-shrink-0 relative">
                      {item.product.images?.[0] && <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-medium text-sm line-clamp-2">{item.product.name}</h3>
                      <p className="text-slate-400 text-xs mt-1">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">{formatCurrency(item.product.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {unlockedGift && (
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 mb-6 flex items-center gap-3">
                  <span className="text-xl">🎁</span>
                  <div>
                    <p className="text-purple-400 font-bold text-sm">Free Gift Unlocked!</p>
                    <p className="text-slate-400 text-xs">{unlockedGift.product?.name || unlockedGift.gift_name}</p>
                  </div>
                </div>
              )}

              <div className="space-y-3 pt-6 border-t border-slate-700">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {deliveryMethod === 'delivery' && (
                  <div className="flex justify-between text-slate-400">
                    <span>Delivery Fee</span>
                    <span className={delivery === 0 ? 'text-green-400' : 'text-white'}>
                      {delivery === 0 ? 'FREE' : `₹${delivery.toFixed(2)}`}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-4 border-t border-slate-700">
                  <span className="text-lg font-bold text-white">Total</span>
                  <span className="text-2xl font-bold text-purple-400">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}