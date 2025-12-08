'use client';

import { ChangeEvent, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useNotification } from '@/components/NotificationProvider';

type OrderItem = {
  order_item_id: number;
  quantity: number;
  price: number;
  product: { name: string };
};

type Payment = {
  payment_id: number;
  payment_status: string;
  proof_image?: string | null;
};

type Order = {
  order_id: number;
  user_id: number;
  total_amount: number;
  status: string;
  orderItems: OrderItem[];
  payment?: Payment | null;
};

export default function PaymentProofPage() {
  const params = useParams<{ orderId: string }>();
  const { notify } = useNotification();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');

  const fetchOrderDetails = async (silent = false) => {
    if (!silent) {
      setLoading(true);
    }
    try {
      const res = await fetch(
        `/api/orders/${params.orderId}?t=${Date.now()}`,
        { cache: 'no-store' }
      );
      if (!res.ok) throw new Error('Order not found');
      const data: Order = await res.json();
      if (!data.payment) {
        await createPaymentDraft(data);
        return await fetchOrderDetails(true);
      }
      setOrder(data);
      if (data.payment?.proof_image) {
        setPreview(data.payment.proof_image);
      }
    } catch (err) {
      console.error(err);
      setError('Unable to load order. Please try again from your orders page.');
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchOrderDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.orderId]);

  const createPaymentDraft = async (orderData: Order) => {
    try {
      await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderData.order_id,
          user_id: orderData.user_id,
          payment_date: new Date().toISOString(),
          payment_method: 'manual_transfer',
          payment_status: 'pending_payment',
          total_amount: orderData.total_amount,
        }),
      });
    } catch (error) {
      console.error('Error creating payment draft:', error);
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      notify({
        title: 'Invalid file',
        message: 'Please upload an image receipt.',
      });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      notify({
        title: 'File too large',
        message: 'Please upload an image smaller than 5MB.',
      });
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!order || !order.payment) {
      notify({
        title: 'Order not ready',
        message: 'Payment record missing. Please refresh the page.',
      });
      return;
    }
    if (!preview) {
      notify({ title: 'Receipt required', message: 'Please upload your proof of payment.' });
      return;
    }
    setUploading(true);
    try {
      await fetch(`/api/payments/${order.payment.payment_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proof_image: preview,
          payment_status: 'under_review',
          proof_uploaded_at: new Date().toISOString(),
        }),
      });

      await fetch(`/api/orders/${order.order_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'pending_review' }),
      });

      await fetchOrderDetails(true);
      await notify({
        title: 'Payment submitted',
        message: 'Thank you! Our admins will review your payment shortly.',
      });
    } catch (err) {
      console.error(err);
      notify({
        title: 'Upload failed',
        message: 'Unable to submit payment proof. Please try again.',
      });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Payment Upload</h1>
        <p className="text-gray-600 mb-6">{error || 'Order details unavailable.'}</p>
        <Link
          href="/shop/orders"
          className="inline-flex items-center px-6 py-3 rounded-lg bg-brand-600 text-white font-semibold hover:bg-brand-700"
        >
          Go to Orders
        </Link>
      </div>
    );
  }

  const pendingProof = order.payment?.payment_status === 'pending_payment';
  const pendingReview = order.payment?.payment_status === 'under_review';
  const paid = order.payment?.payment_status === 'paid';
  const proofActionsDisabled = !pendingProof || pendingReview || paid || uploading;
  const submitDisabled = proofActionsDisabled || !preview;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8">
        <Link href="/shop/orders" className="text-sm text-brand-500 hover:text-brand-700">
          ← Back to Orders
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mt-4">Upload Payment Proof</h1>
        <p className="text-gray-600 mt-2">
          Order #{order.order_id} • Total: GHC {order.total_amount.toFixed(2)}
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
          <div className="space-y-3 text-sm text-gray-700">
            {order.orderItems.map((item) => (
              <div
                key={item.order_item_id}
                className="flex items-center justify-between border-b border-gray-100 pb-2"
              >
                <div>
                  <p className="font-medium text-gray-900">{item.product.name}</p>
                  <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                </div>
                <span className="font-semibold">
                  GHC {(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between text-base font-semibold text-gray-900">
            <span>Total</span>
            <span>GHC {order.total_amount.toFixed(2)}</span>
          </div>

          <div className="mt-6 rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
            <p className="font-semibold text-gray-900 mb-1">Payment Instructions</p>
            <p>
              Transfer the total amount to our mobile wallet 0543214529. Upload a clear screenshot or photo of the receipt below.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Receipt</h2>
          <div className="space-y-4">
            {preview ? (
              <div className="relative h-64 w-full overflow-hidden rounded-xl border border-dashed border-gray-300 bg-gray-50">
                <Image
                  src={preview}
                  alt="Payment proof preview"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            ) : (
              <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-500">
                No receipt selected yet
              </div>
            )}

            <label
              className={`inline-flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium ${
                proofActionsDisabled
                  ? 'cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400'
                  : 'cursor-pointer border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                disabled={proofActionsDisabled}
              />
              {proofActionsDisabled ? 'Proof submitted' : 'Choose Image'}
            </label>

            <button
              onClick={handleSubmit}
              disabled={submitDisabled}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {uploading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Submitting...
                </>
              ) : paid ? (
                'Payment Approved'
              ) : pendingReview ? (
                'Under Review'
              ) : pendingProof ? (
                'Submit Proof'
              ) : (
                'Upload Disabled'
              )}
            </button>
          </div>
        </div>
      </div>

      {(pendingReview || paid) && (
        <div className="mt-8 rounded-2xl border border-leaf-200 bg-leaf-50 p-4 text-sm text-leaf-800">
          {paid
            ? 'Payment confirmed! We will notify you once your order ships.'
            : 'Thanks! Your proof is pending admin review.'}
        </div>
      )}
    </div>
  );
}
