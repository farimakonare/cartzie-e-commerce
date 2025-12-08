'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Package, CreditCard, Truck, Upload } from 'lucide-react';
import { useNotification } from '@/components/NotificationProvider';

type OrderItem = {
  order_item_id: number;
  quantity: number;
  price: number;
  product: { name: string };
};

type ShipmentEvent = {
  event_id: number;
  status: string;
  note?: string | null;
  created_at: string;
};

type OrderRecord = {
  order_id: number;
  order_date: string;
  total_amount: number;
  status: string;
  orderItems: OrderItem[];
  payment?: {
    payment_id: number;
    payment_status: string;
    proof_image?: string | null;
  } | null;
  shipment?: {
    shipment_id: number;
    status: string;
    tracking_number: string | null;
    shipment_date: string;
    carrier: string | null;
    events?: ShipmentEvent[];
  } | null;
};

type TabKey = 'orders' | 'payments' | 'shipments';

const orderStatusMeta: Record<
  string,
  { label: string; badgeClass: string; message: string }
> = {
  pending_payment: {
    label: 'Pending payment',
    badgeClass: 'bg-brand-100 text-brand-800',
    message: 'Send your payment proof so we can start preparing your order.',
  },
  pending_review: {
    label: 'Payment under review',
    badgeClass: 'bg-yellow-100 text-yellow-800',
    message: 'We are validating your receipt.',
  },
  processing: {
    label: 'Processing order',
    badgeClass: 'bg-blue-100 text-blue-800',
    message: 'Team Panaya is prepping your order.',
  },
  preparing_shipment: {
    label: 'Preparing order',
    badgeClass: 'bg-brand-100 text-brand-800',
    message: 'Packaging is underway before the courier picks it up.',
  },
  in_transit: {
    label: 'Out for delivery',
    badgeClass: 'bg-purple-100 text-purple-800',
    message: 'Your order has left our kitchen and is on the move.',
  },
  completed: {
    label: 'Delivered',
    badgeClass: 'bg-leaf-100 text-leaf-800',
    message: 'Enjoy your Panaya goodies! Thanks for shopping with us.',
  },
  cancelled: {
    label: 'Cancelled',
    badgeClass: 'bg-berry-100 text-berry-800',
    message: 'This order was cancelled.',
  },
};

const paymentStatusColors: Record<string, string> = {
  pending_payment: 'bg-brand-100 text-brand-800',
  under_review: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-leaf-100 text-leaf-800',
};

const shipmentStatusMeta: Record<string, { label: string; badgeClass: string }> = {
  pending_payment: { label: 'Pending payment', badgeClass: 'bg-gray-100 text-gray-800' },
  preparing_shipment: {
    label: 'Processing order',
    badgeClass: 'bg-blue-100 text-blue-800',
  },
  in_transit: {
    label: 'Out for delivery',
    badgeClass: 'bg-purple-100 text-purple-800',
  },
  delivered: { label: 'Delivered', badgeClass: 'bg-leaf-100 text-leaf-800' },
  cancelled: { label: 'Cancelled', badgeClass: 'bg-berry-100 text-berry-800' },
};

const formatStatus = (status: string) =>
  status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

const getOrderStatusMeta = (status: string) =>
  orderStatusMeta[status] ?? {
    label: formatStatus(status),
    badgeClass: 'bg-gray-100 text-gray-800',
    message: 'Status will update soon.',
  };

const getShipmentStatusMeta = (status: string) =>
  shipmentStatusMeta[status] ?? {
    label: formatStatus(status),
    badgeClass: 'bg-gray-100 text-gray-800',
  };

const ORDER_STATUS_OPTIONS = [
  'pending_payment',
  'pending_review',
  'processing',
  'preparing_shipment',
  'in_transit',
  'completed',
  'cancelled',
];

const PAYMENT_STATUS_OPTIONS = ['pending_payment', 'under_review', 'paid'];

const SHIPMENT_STATUS_OPTIONS = ['preparing_shipment', 'in_transit', 'delivered', 'cancelled'];

export default function CustomerOrdersPage() {
  const router = useRouter();
  const { notify } = useNotification();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('orders');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | string>('all');
  const [paymentSearch, setPaymentSearch] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<'all' | string>('all');
  const [shipmentSearch, setShipmentSearch] = useState('');
  const [shipmentStatusFilter, setShipmentStatusFilter] = useState<'all' | string>('all');
  const [orderPage, setOrderPage] = useState(1);
  const [paymentPage, setPaymentPage] = useState(1);
  const [shipmentPage, setShipmentPage] = useState(1);
  const [ordersPerPage, setOrdersPerPage] = useState(5);
  const [paymentsPerPage, setPaymentsPerPage] = useState(5);
  const [shipmentsPerPage, setShipmentsPerPage] = useState(5);

  useEffect(() => {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
      localStorage.setItem('redirectAfterLogin', '/shop/orders');
      router.push('/shop/login');
      return;
    }
    const user = JSON.parse(userStr);
    setCurrentUser(user);
    fetchOrders(user.user_id);
  }, [router]);

  const fetchOrders = async (userId: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders?userId=${userId}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load orders');
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error(error);
      notify({
        title: 'Unable to load orders',
        message: 'Please refresh the page.',
      });
    } finally {
      setLoading(false);
    }
  };

  const paymentQueue = useMemo(() => {
    return orders.filter(
      (order) =>
        order.payment &&
        ['pending_payment', 'under_review'].includes(order.payment.payment_status)
    );
  }, [orders]);

  const shipmentsList = useMemo(() => {
    return orders
      .filter(
        (order) =>
          order.shipment &&
          order.payment &&
          order.payment.payment_status === 'paid'
      )
      .map((order) => ({
        order_id: order.order_id,
        shipment: order.shipment!,
      }));
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const normalizedSearch = orderSearch.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesStatus = orderStatusFilter === 'all' ? true : order.status === orderStatusFilter;
      const matchesSearch = normalizedSearch
        ? [
            `#${order.order_id}`,
            order.status,
            ...order.orderItems.map((item) => item.product.name),
          ]
            .join(' ')
            .toLowerCase()
            .includes(normalizedSearch)
        : true;
      return matchesStatus && matchesSearch;
    });
  }, [orders, orderSearch, orderStatusFilter]);

  const totalOrderPages = Math.max(1, Math.ceil(filteredOrders.length / ordersPerPage));

  useEffect(() => {
    setOrderPage(1);
  }, [orderSearch, orderStatusFilter, ordersPerPage]);

  useEffect(() => {
    if (orderPage > totalOrderPages) {
      setOrderPage(totalOrderPages);
    }
  }, [totalOrderPages, orderPage]);

  const paginatedOrders = useMemo(() => {
    const start = (orderPage - 1) * ordersPerPage;
    return filteredOrders.slice(start, start + ordersPerPage);
  }, [filteredOrders, orderPage, ordersPerPage]);

  const filteredPayments = useMemo(() => {
    const normalizedSearch = paymentSearch.trim().toLowerCase();
    return paymentQueue.filter((order) => {
      const status = order.payment?.payment_status ?? '';
      const matchesStatus = paymentStatusFilter === 'all' ? true : status === paymentStatusFilter;
      const matchesSearch = normalizedSearch
        ? [`#${order.order_id}`, status, order.total_amount.toFixed(2)]
            .join(' ')
            .toLowerCase()
            .includes(normalizedSearch)
        : true;
      return matchesStatus && matchesSearch;
    });
  }, [paymentQueue, paymentSearch, paymentStatusFilter]);

  const totalPaymentPages = Math.max(1, Math.ceil(filteredPayments.length / paymentsPerPage));

  useEffect(() => {
    setPaymentPage(1);
  }, [paymentSearch, paymentStatusFilter, paymentQueue.length, paymentsPerPage]);

  useEffect(() => {
    if (paymentPage > totalPaymentPages) {
      setPaymentPage(totalPaymentPages);
    }
  }, [totalPaymentPages, paymentPage]);

  const paginatedPayments = useMemo(() => {
    const start = (paymentPage - 1) * paymentsPerPage;
    return filteredPayments.slice(start, start + paymentsPerPage);
  }, [filteredPayments, paymentPage, paymentsPerPage]);

  const filteredShipments = useMemo(() => {
    const normalizedSearch = shipmentSearch.trim().toLowerCase();
    return shipmentsList.filter(({ order_id, shipment }) => {
      const matchesStatus =
        shipmentStatusFilter === 'all' ? true : shipment.status === shipmentStatusFilter;
      const matchesSearch = normalizedSearch
        ? [`#${order_id}`, `#${shipment.shipment_id}`, shipment.status, shipment.carrier ?? '']
            .join(' ')
            .toLowerCase()
            .includes(normalizedSearch)
        : true;
      return matchesStatus && matchesSearch;
    });
  }, [shipmentsList, shipmentSearch, shipmentStatusFilter]);

  const totalShipmentPages = Math.max(1, Math.ceil(filteredShipments.length / shipmentsPerPage));

  useEffect(() => {
    setShipmentPage(1);
  }, [shipmentSearch, shipmentStatusFilter, shipmentsList.length, shipmentsPerPage]);

  useEffect(() => {
    if (shipmentPage > totalShipmentPages) {
      setShipmentPage(totalShipmentPages);
    }
  }, [totalShipmentPages, shipmentPage]);

  const paginatedShipments = useMemo(() => {
    const start = (shipmentPage - 1) * shipmentsPerPage;
    return filteredShipments.slice(start, start + shipmentsPerPage);
  }, [filteredShipments, shipmentPage, shipmentsPerPage]);

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const emptyState = (
    <div className="text-center py-16 bg-white border border-dashed border-gray-200 rounded-3xl">
      <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Nothing to show yet</h3>
      <p className="text-gray-500 mb-6">Start shopping to see your orders, payments, and shipments.</p>
      <Link
        href="/shop"
        className="inline-flex items-center rounded-lg bg-brand-600 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-700"
      >
        Browse products
      </Link>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Purchases</h1>
          <p className="text-gray-600">Track your orders, payment proofs, and shipments in one place.</p>
        </div>
        <div className="flex gap-2 rounded-2xl border border-gray-200 bg-white p-1">
          {(['orders', 'payments', 'shipments'] as TabKey[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold capitalize ${
                activeTab === tab ? 'bg-brand-600 text-white shadow' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab === 'orders' && <Package className="w-4 h-4" />}
              {tab === 'payments' && <CreditCard className="w-4 h-4" />}
              {tab === 'shipments' && <Truck className="w-4 h-4" />}
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            emptyState
          ) : (
            <>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                <input
                  type="search"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Search by order # or item"
                  className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                />
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                >
                  <option value="all">All order statuses</option>
                  {ORDER_STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {formatStatus(status)}
                    </option>
                  ))}
                </select>
                <div className="flex items-center justify-between gap-3 text-sm text-gray-500">
                  
                  <span className="flex-1 text-right">
                    Showing {filteredOrders.length} of {orders.length} orders
                  </span>
                </div>
              </div>
              {filteredOrders.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-8 text-center text-gray-500">
                  No orders match your filters.
                </div>
              ) : (
                <>
                  {paginatedOrders.map((order) => {
                    const statusMeta = getOrderStatusMeta(order.status);
                    return (
                      <div
                        key={order.order_id}
                        className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
                      >
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <p className="text-sm text-gray-500">
                            Placed on {new Date(order.order_date).toLocaleDateString()}
                          </p>
                          <h3 className="text-lg font-semibold text-gray-900">Order #{order.order_id}</h3>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${statusMeta.badgeClass}`}
                        >
                          {statusMeta.label}
                        </span>
                      </div>
                      <div className="mt-4 space-y-2 text-sm text-gray-700">
                        {order.orderItems.map((item) => (
                          <div key={item.order_item_id} className="flex items-center justify-between">
                            <span>
                              {item.product.name} • Qty {item.quantity}
                            </span>
                            <span className="font-medium">
                              GHC {(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                        <div className="font-semibold text-gray-900">
                          Total: GHC {order.total_amount.toFixed(2)}
                        </div>
                      </div>
                      <p className="mt-3 text-sm text-gray-600">{statusMeta.message}</p>
                      {order.status === 'pending_payment' && (
                        <div className="mt-3">
                          <Link
                            href={`/shop/payments/${order.order_id}`}
                            className="inline-flex items-center gap-2 rounded-lg border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700"
                          >
                            <Upload className="w-3 h-3" /> Upload payment proof
                          </Link>
                        </div>
                      )}
                      </div>
                    );
                  })}
                  {filteredOrders.length > ordersPerPage && (
                    <div className="flex items-center justify-between rounded-3xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                      <span>
                        Page {orderPage} of {totalOrderPages}
                      </span>
                      <select
                        value={ordersPerPage}
                        onChange={(e) => setOrdersPerPage(Number(e.target.value))}
                        className="w-[100px] rounded-lg border border-gray-200 px-2 py-1 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                      >
                        {[2, 5, 10, 20].map((size) => (
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
                          className="rounded-full border border-gray-300 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => setOrderPage((prev) => Math.min(totalOrderPages, prev + 1))}
                          disabled={orderPage === totalOrderPages}
                          className="rounded-full border border-gray-300 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="space-y-4">
          {paymentQueue.length === 0 ? (
            emptyState
          ) : (
            <>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                <input
                  type="search"
                  value={paymentSearch}
                  onChange={(e) => setPaymentSearch(e.target.value)}
                  placeholder="Search by order #"
                  className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                />
                <select
                  value={paymentStatusFilter}
                  onChange={(e) => setPaymentStatusFilter(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                >
                  <option value="all">All payment statuses</option>
                  {PAYMENT_STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {formatStatus(status)}
                    </option>
                  ))}
                </select>
                <div className="flex items-center justify-between gap-3 text-sm text-gray-500">
                  <select
                    value={paymentsPerPage}
                    onChange={(e) => setPaymentsPerPage(Number(e.target.value))}
                    className="w-32 rounded-2xl border border-gray-200 px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  >
                    {[2, 5, 10, 20].map((size) => (
                      <option key={size} value={size}>
                        {size} / page
                      </option>
                    ))}
                  </select>
                  <span className="flex-1 text-right">
                    Showing {filteredPayments.length} of {paymentQueue.length} payments
                  </span>
                </div>
              </div>
              {filteredPayments.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-8 text-center text-gray-500">
                  No payments match your filters.
                </div>
              ) : (
                <>
                  {paginatedPayments.map((order) => (
                    <div key={order.order_id} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Order #{order.order_id}</p>
                          <h3 className="text-lg font-semibold text-gray-900">
                            GHC {order.total_amount.toFixed(2)}
                          </h3>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            paymentStatusColors[order.payment!.payment_status] ||
                            'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {formatStatus(order.payment!.payment_status)}
                        </span>
                      </div>
                    <p className="mt-3 text-sm text-gray-600">
                      Transfer to panaya@payments.com or wallet 0543214529. Upload a screenshot for review.
                    </p>
                    {order.payment?.payment_status === 'pending_payment' ? (
                      <div className="mt-4 flex flex-wrap gap-3">
                        <Link
                          href={`/shop/payments/${order.order_id}`}
                          className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
                        >
                          Upload proof
                        </Link>
                      </div>
                    ) : (
                      <p className="mt-4 inline-flex items-center gap-2 rounded-lg bg-yellow-50 px-3 py-2 text-sm font-medium text-yellow-700">
                        {order.payment?.payment_status === 'paid'
                          ? 'Payment approved'
                          : 'Pending approval'}
                      </p>
                    )}
                    </div>
                  ))}
                  {filteredPayments.length > paymentsPerPage && (
                    <div className="flex items-center justify-between rounded-3xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <span>
                          Page {paymentPage} of {totalPaymentPages}
                        </span>
                        <select
                          value={paymentsPerPage}
                          onChange={(e) => setPaymentsPerPage(Number(e.target.value))}
                          className="rounded-full border border-gray-300 px-2 py-1 text-sm"
                        >
                          {[2, 5, 10, 20].map((size) => (
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
                          className="rounded-full border border-gray-300 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => setPaymentPage((prev) => Math.min(totalPaymentPages, prev + 1))}
                          disabled={paymentPage === totalPaymentPages}
                          className="rounded-full border border-gray-300 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      )}

      {activeTab === 'shipments' && (
        <div className="space-y-4">
          {shipmentsList.length === 0 ? (
            emptyState
          ) : (
            <>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                <input
                  type="search"
                  value={shipmentSearch}
                  onChange={(e) => setShipmentSearch(e.target.value)}
                  placeholder="Search by shipment or order #"
                  className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                />
                <select
                  value={shipmentStatusFilter}
                  onChange={(e) => setShipmentStatusFilter(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 px-4 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                >
                  <option value="all">All shipment statuses</option>
                  {SHIPMENT_STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {formatStatus(status)}
                    </option>
                  ))}
                </select>
                <div className="flex items-center justify-between gap-3 text-sm text-gray-500">
                  
                  <span className="flex-1 text-right">
                    Showing {filteredShipments.length} of {shipmentsList.length} shipments
                  </span>
                </div>
              </div>
              {filteredShipments.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-8 text-center text-gray-500">
                  No shipments match your filters.
                </div>
              ) : (
                <>
                  {paginatedShipments.map(({ order_id, shipment }) => {
                    const events = shipment.events || [];
                    const statusMeta = getShipmentStatusMeta(shipment.status);
                    return (
                      <div
                        key={shipment.shipment_id}
                        className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm space-y-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div>
                            <p className="text-xs text-gray-500">Order #{order_id}</p>
                            <h3 className="text-lg font-semibold text-gray-900">
                              Shipment #{shipment.shipment_id}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Shipped on{' '}
                              {new Date(shipment.shipment_date).toLocaleDateString(undefined, {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </p>
                          </div>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${statusMeta.badgeClass}`}
                          >
                            {statusMeta.label}
                          </span>
                        </div>

                        <div className="text-sm text-gray-600 space-y-1">
                          {shipment.tracking_number && (
                            <p>
                              Tracking:{' '}
                              <span className="font-semibold text-gray-900">{shipment.tracking_number}</span>
                            </p>
                          )}
                          {shipment.carrier && (
                            <p>
                              Carrier: <span className="font-semibold text-gray-900">{shipment.carrier}</span>
                            </p>
                          )}
                        </div>

                        <div className="border-t border-gray-200 pt-4">
                          <p className="text-sm font-semibold text-gray-900 mb-3">Tracking timeline</p>
                          {events.length === 0 ? (
                            <p className="text-sm text-gray-500">No updates yet.</p>
                          ) : (
                            <div className="space-y-3">
                              {events.map((event) => (
                                <div key={event.event_id} className="relative pl-5">
                                  <span className="absolute left-1 top-2 h-2 w-2 rounded-full bg-brand-500" />
                                  <p className="text-sm font-semibold text-gray-900">
                                    {formatStatus(event.status)}{' '}
                                    <span className="ml-2 text-xs font-normal text-gray-500">
                                      {new Date(event.created_at).toLocaleString()}
                                    </span>
                                  </p>
                                  {event.note && <p className="text-sm text-gray-600">{event.note}</p>}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {filteredShipments.length > shipmentsPerPage && (
                    <div className="flex items-center justify-between rounded-3xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                      <span>
                        Page {shipmentPage} of {totalShipmentPages}
                      </span>
                      <select
                        value={shipmentsPerPage}
                        onChange={(e) => setShipmentsPerPage(Number(e.target.value))}
                        className="w-[100px] rounded-lg border border-gray-200 px-2 py-1 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                      >
                        {[2, 5, 10, 20].map((size) => (
                          <option key={size} value={size}>
                            {size} / page
                          </option>
                        ))}
                      </select>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShipmentPage((prev) => Math.max(1, prev - 1))}
                          disabled={shipmentPage === 1}
                          className="rounded-full border border-gray-300 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => setShipmentPage((prev) => Math.min(totalShipmentPages, prev + 1))}
                          disabled={shipmentPage === totalShipmentPages}
                          className="rounded-full border border-gray-300 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

            </>
          )}
        </div>
      )}
    </div>
  );
}
