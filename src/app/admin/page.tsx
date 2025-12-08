/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Package, Users, ShoppingCart, TrendingUp, AlertCircle } from 'lucide-react';

type Stats = {
  totalProducts: number;
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  lowStockProducts: number;
};

type RecentOrder = {
  order_id: number;
  user?: { user_name: string };
  total_amount: number;
  status: string;
  order_date: string;
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [productsRes, usersRes, ordersRes] = await Promise.all([
        fetch('/api/products', { cache: 'no-store' }),
        fetch('/api/users', { cache: 'no-store' }),
        fetch('/api/orders', { cache: 'no-store' }),
      ]);

      const products = await productsRes.json();
      const users = await usersRes.json();
      const orders = await ordersRes.json();

      const totalRevenue = orders.reduce((sum: number, o: any) => sum + o.total_amount, 0);
      const pendingOrders = orders.filter((o: any) =>
        ['pending', 'pending_payment', 'pending_review'].includes(o.status)
      ).length;
      const lowStockProducts = products.filter((p: any) => p.stock_quantity < 10).length;

      const totalCustomers = users.filter((user: any) => user.role === 'customer').length;

      setStats({
        totalProducts: products.length,
        totalUsers: totalCustomers,
        totalOrders: orders.length,
        totalRevenue,
        pendingOrders,
        lowStockProducts,
      });

      const sorted = orders.sort(
        (a: any, b: any) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime()
      );
      setRecentOrders(sorted.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your store.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-brand-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-brand-600" />
            </div>
            <span className="text-xs font-medium text-leaf-600 bg-leaf-50 px-2 py-1 rounded-full">
              Active
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-1">Total Products</p>
          <p className="text-3xl font-bold text-gray-900">{stats.totalProducts}</p>
          {stats.lowStockProducts > 0 && (
            <p className="text-xs text-brand-600 mt-2">{stats.lowStockProducts} low stock</p>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-leaf-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-leaf-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-leaf-600" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Total Users</p>
          <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
          <p className="text-xs text-gray-500 mt-2">Registered customers</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-brand-100 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-brand-600" />
            </div>
            {stats.pendingOrders > 0 && (
              <span className="text-xs font-medium text-sand-600 bg-sand-50 px-2 py-1 rounded-full">
                {stats.pendingOrders} pending
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-1">Total Orders</p>
          <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
          <p className="text-xs text-gray-500 mt-2">All time orders</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-sand-100 rounded-lg flex items-center justify-center">
              <span className="text-sm font-bold text-sand-600">GHC</span>
            </div>
            <TrendingUp className="w-5 h-5 text-leaf-600" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
          <p className="text-3xl font-bold text-gray-900">GHC {stats.totalRevenue.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-2">All time earnings</p>
        </div>
      </div>

      {(stats.pendingOrders > 0 || stats.lowStockProducts > 0) && (
        <div className="bg-sand-50 border border-sand-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-sand-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-sand-900 mb-1">Attention Required</h3>
              <ul className="text-sm text-sand-800 space-y-1">
                {stats.pendingOrders > 0 && (
                  <li>• {stats.pendingOrders} order(s) waiting for payment or processing</li>
                )}
                {stats.lowStockProducts > 0 && (
                  <li>• {stats.lowStockProducts} product(s) are running low on stock</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm text-brand-600 font-medium">
              View all
            </Link>
          </div>
          <div className="p-6 space-y-4">
            {recentOrders.length === 0 ? (
              <p className="text-center text-gray-500 py-10">No orders yet</p>
            ) : (
              recentOrders.map((order) => (
                <div key={order.order_id} className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">Order #{order.order_id}</p>
                    <p className="text-sm text-gray-500">
                      {order.user?.user_name || 'Unknown'} •{' '}
                      {new Date(order.order_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      GHC {order.total_amount.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">{order.status}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Quick Links</h2>
          </div>
          <div className="p-6 space-y-3">
            {[
              { href: '/admin/products', label: 'Manage Products' },
              { href: '/admin/orders', label: 'Process Orders' },
              { href: '/admin/payments', label: 'Review Payments' },
              { href: '/admin/shipments', label: 'Track Shipments' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-sand-50"
              >
                {link.label}
                <span className="text-gray-400">→</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
