'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Trash2, Plus, Minus } from 'lucide-react';
import Link from 'next/link';
import { useNotification } from '@/components/NotificationProvider';

type CartItem = {
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  stock_quantity: number;
  image_url?: string | null;
};

export default function SimpleCartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { notify } = useNotification();

  useEffect(() => {
    // Check if user is logged in
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
      // Redirect to login
      localStorage.setItem('redirectAfterLogin', '/shop/cart');
      router.push('/shop/login');
      return;
    }

    setCurrentUser(JSON.parse(userStr));

    // Load cart from localStorage
    const cartStr = localStorage.getItem('cart');
    if (cartStr) {
      setCartItems(JSON.parse(cartStr));
    }
  }, [router]);

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    const updatedCart = cartItems.map((item) =>
      item.product_id === productId
        ? { ...item, quantity: Math.min(newQuantity, item.stock_quantity) }
        : item
    );
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const removeItem = (productId: number) => {
    const updatedCart = cartItems.filter((item) => item.product_id !== productId);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const handleConfirmOrder = async () => {
    if (!currentUser) return;

    setLoading(true);

    try {
      const subtotal = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const tax = subtotal * 0.1;
      const shipping = 5.0;
      const total = subtotal + tax + shipping;

      // Create order
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser.user_id,
          total_amount: total,
          status: 'pending_payment',
          order_date: new Date().toISOString(),
        }),
      });

      const order = await orderRes.json();

      // Create order items
      for (const item of cartItems) {
        await fetch('/api/order-items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            order_id: order.order_id,
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price,
          }),
        });

        // Update product stock
        await fetch(`/api/products/${item.product_id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            stock_quantity: item.stock_quantity - item.quantity,
          }),
        });
      }

      // Create payment record pending proof
      await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: order.order_id,
          user_id: currentUser.user_id,
          payment_date: new Date().toISOString(),
          payment_method: 'manual_transfer',
          payment_status: 'pending_payment',
          total_amount: total,
          proof_image: null,
          proof_uploaded_at: null,
          proof_reviewed_at: null,
        }),
      });

      // Create shipment record
      const shipmentRes = await fetch('/api/shipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: order.order_id,
          shipment_date: new Date().toISOString(),
          delivery_date: null,
          status: 'pending_payment',
          tracking_number: `TRK${Date.now()}`,
          carrier: 'Standard Delivery',
        }),
      });
      const shipment = await shipmentRes.json();

      await fetch('/api/shipment-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shipment_id: shipment.shipment_id,
          status: 'pending_payment',
          note: 'Pending payment confirmation',
        }),
      });

      // Clear cart
      localStorage.removeItem('cart');
      setCartItems([]);

      await notify({
        title: 'Order placed',
        message: `Order #${order.order_id} created. Upload your payment proof to continue.`,
      });

      router.push(`/shop/payments/${order.order_id}`);
    } catch (error) {
      console.error('Error placing order:', error);
      notify({
        title: 'Order failed',
        message: 'Failed to place order. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const tax = subtotal * 0.1;
  const shipping = cartItems.length > 0 ? 5.0 : 0;
  const total = subtotal + tax + shipping;

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some products to get started!</p>
          <Link
            href="/shop"
            className="inline-block px-6 py-3 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-700 transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {cartItems.map((item, index) => (
              <div
                key={item.product_id}
                className={`p-6 flex gap-4 ${
                  index !== cartItems.length - 1 ? 'border-b border-gray-200' : ''
                }`}
              >
                {/* Product Image */}
                <div className="w-24 h-24 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden relative">
                  {item.image_url ? (
                    <Image
                      src={item.image_url}
                      alt={item.name}
                      fill
                      sizes="96px"
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <span className="text-3xl text-gray-300">📦</span>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {item.name}
                  </h3>
                  <p className="text-gray-600 mb-3">GHC {item.price.toFixed(2)} each</p>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-gray-900 font-medium w-8 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                      disabled={item.quantity >= item.stock_quantity}
                      className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Price and Remove */}
                <div className="text-right flex flex-col justify-between">
                  <button
                    onClick={() => removeItem(item.product_id)}
                    className="text-red-600 hover:text-red-700 ml-auto"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <p className="text-lg font-bold text-gray-900">
                    GHC {(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

            {/* User Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">Delivery Details</h3>
              <p className="text-sm text-gray-700">
                <strong>Name:</strong> {currentUser.user_name}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Email:</strong> {currentUser.user_email}
              </p>
              {currentUser.user_phone && (
                <p className="text-sm text-gray-700">
                  <strong>Phone:</strong> {currentUser.user_phone}
                </p>
              )}
              {currentUser.user_address && (
                <p className="text-sm text-gray-700">
                  <strong>Address:</strong> {currentUser.user_address}
                </p>
              )}
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal</span>
                <span>GHC {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Shipping</span>
                <span>GHC {shipping.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span>GHC {total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleConfirmOrder}
              disabled={loading}
              className="w-full px-6 py-3 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-700 transition mb-3 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Confirm Order'}
            </button>

            <Link
              href="/shop"
              className="block text-center text-brand-600 hover:text-brand-700 font-medium"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
