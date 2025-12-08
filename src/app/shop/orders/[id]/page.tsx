'use client';

import { useEffect, useState } from 'react';
import { Package, Eye, ChevronRight } from 'lucide-react';
import Link from 'next/link';

type Order = {
  order_id: number;
  user_id: number;
  order_date: string;
  total_amount: number;
  status: string;
  orderItems?: Array<{
    order_item_id: number;
    quantity: number;
    price: number;
    product: {
      name: string;
    };
  }>;
  shipment?: {
    tracking_number: string;
    status: string;
  };
};

export default function UserOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [userId] = useState(1); // TODO: Get from auth context

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders');
      const allOrders = await res.json();
      // Filter orders for current user
      const userOrders = allOrders.filter((o: Order) => o.user_id === userId);
      // Sort by date, newest first
      userOrders.sort(
        (a: Order, b: Order) =>
          new Date(b.order_date).getTime() - new Date(a.order_date).getTime()
      );
      setOrders(userOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-leaf-100 text-leaf-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
        <p className="text-gray-600">View and track your order history</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
          <Package className="w-24 h-24 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No orders yet</h2>
          <p className="text-gray-600 mb-6">Start shopping to create your first order!</p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-700 transition"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.order_id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Order Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-bold text-gray-900">
                      Order #{order.order_id}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">Order Date: </span>
                      <span className="font-medium text-gray-900">
                        {new Date(order.order_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-600">Total: </span>
                      <span className="font-bold text-brand-600">
                        GHC {order.total_amount.toFixed(2)}
                      </span>
                    </div>

                    {order.orderItems && order.orderItems.length > 0 && (
                      <div className="sm:col-span-2">
                        <span className="text-gray-600">Items: </span>
                        <span className="font-medium text-gray-900">
                          {order.orderItems.length} item(s)
                        </span>
                      </div>
                    )}

                    {order.shipment && (
                      <div className="sm:col-span-2">
                        <span className="text-gray-600">Tracking: </span>
                        <span className="font-mono text-sm text-gray-900">
                          {order.shipment.tracking_number}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewDetails(order)}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Order Details - #{selectedOrder.order_id}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* Order Status */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Order Status</h4>
                <div className="flex items-center justify-between">
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(
                      selectedOrder.status
                    )}`}
                  >
                    {selectedOrder.status}
                  </span>
                  <span className="text-sm text-gray-600">
                    {new Date(selectedOrder.order_date).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Tracking Info */}
              {selectedOrder.shipment && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Shipment Tracking</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tracking Number:</span>
                      <span className="font-mono text-gray-900">
                        {selectedOrder.shipment.tracking_number}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipment Status:</span>
                      <span className="font-medium text-gray-900 capitalize">
                        {selectedOrder.shipment.status}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Order Items */}
              {selectedOrder.orderItems && selectedOrder.orderItems.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Order Items</h4>
                  <div className="space-y-3">
                    {selectedOrder.orderItems.map((item) => (
                      <div
                        key={item.order_item_id}
                        className="flex justify-between items-center pb-3 border-b border-gray-200 last:border-0"
                      >
                        <div>
                          <p className="font-medium text-gray-900">{item.product.name}</p>
                          <p className="text-sm text-gray-600">
                            Quantity: {item.quantity} × GHC {item.price.toFixed(2)}
                          </p>
                        </div>
                        <p className="font-bold text-gray-900">
                          GHC {(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Order Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Order Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between pb-2 border-b border-gray-200">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-bold text-brand-600 text-lg">
                      GHC {selectedOrder.total_amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Close
              </button>
              <Link
                href={`/order-confirmation/${selectedOrder.order_id}`}
                className="flex-1 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition font-medium text-center"
              >
                View Full Details
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}