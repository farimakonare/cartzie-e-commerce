'use client';

import { useEffect, useMemo, useState } from 'react';
import { Eye, Edit } from 'lucide-react';
import Image from 'next/image';
import { useNotification } from '@/components/NotificationProvider';

type Order = {
  order_id: number;
  user_id: number;
  order_date: string;
  total_amount: number;
  status: string;
  user?: { user_name: string; user_email: string; user_phone?: string | null; user_address?: string | null };
  orderItems?: Array<{
    order_item_id: number;
    quantity: number;
    price: number;
    product: { name: string };
  }>;
  payment?: {
    payment_id: number;
    payment_status: string;
    proof_image?: string | null;
    proof_uploaded_at?: string | null;
  } | null;
  shipment?: {
    shipment_id: number;
    status: string;
    events?: Array<{
      event_id: number;
      status: string;
      note?: string | null;
      created_at: string;
    }>;
  } | null;
};

const logShipmentEvent = async (shipmentId: number, status: string, note?: string) => {
  try {
    await fetch('/api/shipment-events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shipment_id: shipmentId, status, note }),
    });
  } catch (error) {
    console.error('Error logging shipment event:', error);
  }
};

export default function OrdersPage() {
  const { notify } = useNotification();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | string>('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderPage, setOrderPage] = useState(1);
  const [ordersPerPage, setOrdersPerPage] = useState(10);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders', { cache: 'no-store' });
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setStatusUpdate(order.status);
    setShowModal(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    try {
      await fetch(`/api/orders/${selectedOrder.order_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: statusUpdate }),
      });
      setShowModal(false);
      setSelectedOrder(null);
      fetchOrders();
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const handleApprovePayment = async () => {
    if (!selectedOrder?.payment) return;
    try {
      await fetch(`/api/payments/${selectedOrder.payment.payment_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_status: 'paid',
          proof_reviewed_at: new Date().toISOString(),
        }),
      });

      await fetch(`/api/orders/${selectedOrder.order_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'processing' }),
      });

      if (selectedOrder.shipment) {
        await fetch(`/api/shipments/${selectedOrder.shipment.shipment_id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'preparing_shipment' }),
        });
        await logShipmentEvent(
          selectedOrder.shipment.shipment_id,
          'preparing_shipment',
          'Payment approved by admin'
        );
      }

      setShowModal(false);
      fetchOrders();
      await notify({
        title: 'Payment approved',
        message: `Order #${selectedOrder.order_id} is ready for shipping.`,
      });
    } catch (error) {
      console.error('Error approving payment:', error);
      notify({
        title: 'Action failed',
        message: 'Unable to approve payment. Please try again.',
      });
    }
  };

  const handleRequestReupload = async () => {
    if (!selectedOrder?.payment) return;
    try {
      await fetch(`/api/payments/${selectedOrder.payment.payment_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_status: 'pending_payment',
          proof_image: null,
          proof_uploaded_at: null,
        }),
      });
      await fetch(`/api/orders/${selectedOrder.order_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'pending_payment' }),
      });
      if (selectedOrder.shipment) {
        await fetch(`/api/shipments/${selectedOrder.shipment.shipment_id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'pending_payment' }),
        });
        await logShipmentEvent(
          selectedOrder.shipment.shipment_id,
          'pending_payment',
          'Requested new payment proof'
        );
      }
      fetchOrders();
      await notify({
        title: 'Proof requested',
        message: `Customer will be asked to upload a new receipt for order #${selectedOrder.order_id}.`,
      });
    } catch (error) {
      console.error('Error requesting new proof:', error);
      notify({
        title: 'Action failed',
        message: 'Unable to update payment. Please try again.',
      });
    }
  };

const paymentBadgeClass = (status: string | undefined) => {
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

const formatAdminPaymentStatus = (status: string | undefined) => {
  if (!status) return 'n/a';
  return status === 'under_review' ? 'pending_review' : status.replace('_', ' ');
};

  const filteredOrders = useMemo(() => {
    const normalizedSearch = orderSearch.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesStatus = orderStatusFilter === 'all' ? true : order.status === orderStatusFilter;
      const matchesSearch = normalizedSearch
        ? [String(order.order_id), order.user?.user_name ?? '', order.user?.user_email ?? ''].some(
            (value) => value.toLowerCase().includes(normalizedSearch)
          )
        : true;
      return matchesStatus && matchesSearch;
    });
  }, [orders, orderStatusFilter, orderSearch]);

  const totalOrderPages = Math.max(1, Math.ceil(filteredOrders.length / ordersPerPage));

  useEffect(() => {
    setOrderPage(1);
  }, [orderStatusFilter, orderSearch, ordersPerPage]);

  useEffect(() => {
    if (orderPage > totalOrderPages) {
      setOrderPage(totalOrderPages);
    }
  }, [totalOrderPages, orderPage]);

  const paginatedOrders = useMemo(() => {
    const start = (orderPage - 1) * ordersPerPage;
    return filteredOrders.slice(start, start + ordersPerPage);
  }, [filteredOrders, orderPage, ordersPerPage]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Orders Management</h2>
      </div>

      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <input
          type="search"
          value={orderSearch}
          onChange={(e) => setOrderSearch(e.target.value)}
          placeholder="Search order # or customer"
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
        />
        <select
          value={orderStatusFilter}
          onChange={(e) => setOrderStatusFilter(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
        >
          <option value="all">All order statuses</option>
          <option value="pending_payment">Pending payment</option>
          <option value="pending_review">Payment under review</option>
          <option value="processing">Processing</option>
          <option value="preparing_shipment">Preparing shipment</option>
          <option value="in_transit">In transit</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <div className="flex items-center justify-end text-sm text-gray-500">
          Showing {filteredOrders.length} of {orders.length} orders
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedOrders.map((order) => (
                <tr key={order.order_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{order.order_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="font-medium">{order.user?.user_name || 'Unknown'}</div>
                      <div className="text-xs text-gray-500">{order.user?.user_email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(order.order_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    GHC {order.total_amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'completed'
                          ? 'bg-leaf-100 text-leaf-800'
                          : ['pending', 'pending_payment', 'pending_review'].includes(order.status)
                          ? 'bg-yellow-100 text-yellow-800'
                          : order.status === 'processing'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <button
                      onClick={() => handleViewOrder(order)}
                      className="text-brand-600 hover:text-brand-900 inline-flex items-center gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500 text-sm">
                    No orders match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {filteredOrders.length > ordersPerPage && (
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-gray-200 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span>
                Page {orderPage} of {totalOrderPages}
              </span>
              <select
                value={ordersPerPage}
                onChange={(e) => setOrdersPerPage(Number(e.target.value))}
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
                onClick={() => setOrderPage((prev) => Math.max(1, prev - 1))}
                disabled={orderPage === 1}
                className="rounded-lg border border-gray-300 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setOrderPage((prev) => Math.min(totalOrderPages, prev + 1))}
                disabled={orderPage === totalOrderPages}
                className="rounded-lg border border-gray-300 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Order Details - #{selectedOrder.order_id}</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Customer Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Customer Information</h4>
                <p className="text-sm text-gray-700">
                  <strong>Name:</strong> {selectedOrder.user?.user_name}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Email:</strong> {selectedOrder.user?.user_email}
                </p>
                {selectedOrder.user?.user_phone && (
                  <p className="text-sm text-gray-700">
                    <strong>Phone:</strong> {selectedOrder.user.user_phone}
                  </p>
                )}
                {selectedOrder.user?.user_address && (
                  <p className="text-sm text-gray-700">
                    <strong>Address:</strong> {selectedOrder.user.user_address}
                  </p>
                )}
              </div>

              {/* Order Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Order Information</h4>
                <p className="text-sm text-gray-700">
                  <strong>Order Date:</strong>{' '}
                  {new Date(selectedOrder.order_date).toLocaleString()}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Total Amount:</strong> GHC {selectedOrder.total_amount.toFixed(2)}
                </p>
              </div>

              {/* Payment Info */}
              {selectedOrder.payment && (
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900">Payment</h4>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${paymentBadgeClass(
                        selectedOrder.payment.payment_status
                      )}`}
                    >
                      {formatAdminPaymentStatus(selectedOrder.payment.payment_status)}
                    </span>
                  </div>
                  {selectedOrder.payment.proof_image ? (
                    <div className="relative h-48 w-full overflow-hidden rounded-lg border border-gray-200 bg-white">
                      <Image
                        src={selectedOrder.payment.proof_image}
                        alt="Payment proof"
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">
                      No proof uploaded yet. Customer still needs to submit a receipt.
                    </p>
                  )}
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={handleApprovePayment}
                      disabled={selectedOrder.payment.payment_status !== 'under_review'}
                      className="rounded-lg bg-leaf-600 px-4 py-2 text-sm font-semibold text-white disabled:bg-gray-300"
                    >
                      Approve Payment
                    </button>
                    <button
                      onClick={handleRequestReupload}
                      disabled={
                        selectedOrder.payment.payment_status === 'pending_payment' ||
                        selectedOrder.payment.payment_status === 'paid'
                      }
                      className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400"
                    >
                      Request New Proof
                    </button>
                  </div>
                </div>
              )}

              {/* Shipment Timeline */}
              {selectedOrder.shipment?.events && selectedOrder.shipment.events.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Shipment Timeline</h4>
                  <div className="space-y-3">
                    {selectedOrder.shipment.events.map((event) => (
                      <div key={event.event_id} className="relative pl-5">
                        <span className="absolute left-1 top-2 h-2 w-2 rounded-full bg-brand-500" />
                        <p className="text-sm font-semibold text-gray-900">
                          {event.status.replace('_', ' ')}{' '}
                          <span className="ml-2 text-xs font-normal text-gray-500">
                            {new Date(event.created_at).toLocaleString()}
                          </span>
                        </p>
                        {event.note && <p className="text-sm text-gray-600">{event.note}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Order Items */}
              {selectedOrder.orderItems && selectedOrder.orderItems.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Order Items</h4>
                  <div className="space-y-2">
                    {selectedOrder.orderItems.map((item) => (
                      <div
                        key={item.order_item_id}
                        className="flex justify-between text-sm text-gray-700 border-b pb-2"
                      >
                        <span>
                          {item.product.name} x {item.quantity}
                        </span>
                        <span className="font-medium">GHC {(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Update Status */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Update Order Status</h4>
                <div className="flex gap-2">
                  <select
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600"
                    value={statusUpdate}
                    onChange={(e) => setStatusUpdate(e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="pending_payment">Pending Payment</option>
                    <option value="pending_review">Pending Review</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <button
                    onClick={handleUpdateStatus}
                    className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Update
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
