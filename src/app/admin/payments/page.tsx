'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { CreditCard } from 'lucide-react';
import { useNotification } from '@/components/NotificationProvider';

type PaymentRecord = {
  payment_id: number;
  order_id: number;
  user_id: number;
  payment_method: string;
  payment_status: string;
  total_amount: number;
  proof_image?: string | null;
  user?: { user_name: string; user_email: string; user_phone?: string | null } | null;
  order?: {
    status: string;
    user?: { user_name: string; user_email: string; user_phone?: string | null } | null;
    shipment?: { shipment_id: number; status: string } | null;
  } | null;
};

const badgeClass = (status: string) => {
  switch (status) {
    case 'paid':
      return 'bg-leaf-100 text-leaf-800';
    case 'under_review':
      return 'bg-yellow-100 text-yellow-800';
    case 'pending_payment':
      return 'bg-brand-100 text-brand-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const formatAdminPaymentStatus = (status: string) =>
  status === 'under_review' ? 'pending_review' : status.replace('_', ' ');

export default function AdminPaymentsPage() {
  const { notify } = useNotification();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentPage, setPaymentPage] = useState(1);
  const [paymentsPerPage, setPaymentsPerPage] = useState(10);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/payments', { cache: 'no-store' });
      const data = await res.json();
      setPayments(data);
    } catch (error) {
      console.error('Error fetching payments:', error);
      notify({ title: 'Error', message: 'Unable to load payments.' });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (payment: PaymentRecord) => {
    try {
      await fetch(`/api/payments/${payment.payment_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_status: 'paid',
          proof_reviewed_at: new Date().toISOString(),
        }),
      });
      await fetch(`/api/orders/${payment.order_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'processing' }),
      });
      if (payment.order?.shipment) {
        await fetch(`/api/shipments/${payment.order.shipment.shipment_id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'preparing_shipment' }),
        });
      }
      await notify({ title: 'Payment approved', message: `Order #${payment.order_id} marked paid.` });
      fetchPayments();
    } catch (error) {
      console.error(error);
      notify({ title: 'Action failed', message: 'Unable to approve payment.' });
    }
  };

  const handleRequestProof = async (payment: PaymentRecord) => {
    try {
      await fetch(`/api/payments/${payment.payment_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_status: 'pending_payment',
          proof_image: null,
          proof_uploaded_at: null,
        }),
      });
      await fetch(`/api/orders/${payment.order_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'pending_payment' }),
      });
      await notify({
        title: 'Proof requested',
        message: `Customer notified to re-upload receipt for order #${payment.order_id}.`,
      });
      fetchPayments();
    } catch (error) {
      console.error(error);
      notify({ title: 'Action failed', message: 'Unable to update payment.' });
    }
  };

  const filteredPayments = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return payments.filter((payment) => {
      const matchesStatus = statusFilter === 'all' ? true : payment.payment_status === statusFilter;
      const matchesSearch = normalizedSearch
        ? [
            String(payment.order_id),
            payment.user?.user_name ?? payment.order?.user?.user_name ?? '',
            payment.user?.user_email ?? payment.order?.user?.user_email ?? '',
            payment.user?.user_phone ?? payment.order?.user?.user_phone ?? '',
          ].some((value) => value.toLowerCase().includes(normalizedSearch))
        : true;
      return matchesStatus && matchesSearch;
    });
  }, [payments, statusFilter, searchTerm]);

  const totalPaymentPages = Math.max(1, Math.ceil(filteredPayments.length / paymentsPerPage));

  useEffect(() => {
    setPaymentPage(1);
  }, [statusFilter, searchTerm, paymentsPerPage]);

  useEffect(() => {
    if (paymentPage > totalPaymentPages) {
      setPaymentPage(totalPaymentPages);
    }
  }, [totalPaymentPages, paymentPage]);

  const paginatedPayments = useMemo(() => {
    const start = (paymentPage - 1) * paymentsPerPage;
    return filteredPayments.slice(start, start + paymentsPerPage);
  }, [filteredPayments, paymentPage, paymentsPerPage]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-brand-500" />
            Payment Reviews
          </h1>
          <p className="text-gray-600 mt-1">Approve receipts or request a new upload.</p>
        </div>
        <span className="text-sm text-gray-500">
          {payments.length} payment{payments.length === 1 ? '' : 's'}
        </span>
      </div>

      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <input
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search order # or customer"
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
        >
          <option value="all">All payment statuses</option>
          <option value="pending_payment">Pending payment</option>
          <option value="under_review">Under review</option>
          <option value="paid">Paid</option>
        </select>
        <div className="flex items-center justify-end text-sm text-gray-500">
          Showing {filteredPayments.length} of {payments.length} payments
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-6 py-3">Order</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Proof</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {paginatedPayments.map((payment) => (
                <tr key={payment.payment_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">Order #{payment.order_id}</div>
                    <div className="text-xs text-gray-500">{payment.payment_method}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">
                      {payment.user?.user_name || payment.order?.user?.user_name || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {payment.user?.user_email || payment.order?.user?.user_email}
                    </div>
                    {(payment.user?.user_phone || payment.order?.user?.user_phone) && (
                      <div className="text-xs text-gray-500">
                        {payment.user?.user_phone || payment.order?.user?.user_phone}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-900">
                    GHC {payment.total_amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClass(
                        payment.payment_status
                      )}`}
                    >
                      {formatAdminPaymentStatus(payment.payment_status)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {payment.proof_image ? (
                      <div className="relative h-12 w-20 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                        <Image
                          src={payment.proof_image}
                          alt="Payment proof"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <span className="text-xs text-gray-500">Pending upload</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleApprove(payment)}
                      disabled={payment.payment_status !== 'under_review'}
                      className="rounded-lg bg-leaf-600 px-3 py-1.5 text-xs font-semibold text-white disabled:bg-gray-300"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleRequestProof(payment)}
                      disabled={
                        payment.payment_status === 'pending_payment' ||
                        payment.payment_status === 'paid'
                      }
                      className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:text-gray-400 disabled:border-gray-200"
                    >
                      Request Proof
                    </button>
                  </td>
                </tr>
              ))}
              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No payments match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {filteredPayments.length > paymentsPerPage && (
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span>
                Page {paymentPage} of {totalPaymentPages}
              </span>
              <select
                value={paymentsPerPage}
                onChange={(e) => setPaymentsPerPage(Number(e.target.value))}
                className="w-[100px] rounded-lg border border-gray-300 px-2 py-1 text-sm"
              >
                {[2, 5, 10, 20, 50].map((size) => (
                  <option key={size} value={size}>
                    {size} / page
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPaymentPage((prev) => Math.max(1, prev - 1))}
                disabled={paymentPage === 1}
                className="rounded-lg border border-gray-300 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPaymentPage((prev) => Math.min(totalPaymentPages, prev + 1))}
                disabled={paymentPage === totalPaymentPages}
                className="rounded-lg border border-gray-300 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
