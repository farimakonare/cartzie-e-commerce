'use client';

import { useEffect, useState } from 'react';
import { Package, Users, ShoppingCart, DollarSign, TrendingUp, AlertCircle, Tags } from 'lucide-react';
import Link from 'next/link';

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
        fetch('/api/products'),
        fetch('/api/users'),
        fetch('/api/orders'),
      ]);

      const products = await productsRes.json();
      const users = await usersRes.json();
      const orders = await ordersRes.json();

      // Calculate stats
      const totalRevenue = orders.reduce((sum: number, o: any) => sum + o.total_amount, 0);
      const pendingOrders = orders.filter((o: any) => o.status === 'pending').length;
      const lowStockProducts = products.filter((p: any) => p.stock_quantity < 10).length;

      setStats({
        totalProducts: products.length,
        totalUsers: users.length,
        totalOrders: orders.length,
        totalRevenue,
        pendingOrders,
        lowStockProducts,
      });

      // Get recent 5 orders
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
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your store.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Products */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-indigo-600" />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
              Active
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-1">Total Products</p>
          <p className="text-3xl font-bold text-gray-900">{stats.totalProducts}</p>
          {stats.lowStockProducts > 0 && (
            <p className="text-xs text-orange-600 mt-2">
              {stats.lowStockProducts} low stock
            </p>
          )}
        </div>

        {/* Total Users */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Total Users</p>
          <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
          <p className="text-xs text-gray-500 mt-2">Registered customers</p>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
            {stats.pendingOrders > 0 && (
              <span className="text-xs font-medium text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
                {stats.pendingOrders} pending
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-1">Total Orders</p>
          <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
          <p className="text-xs text-gray-500 mt-2">All time orders</p>
        </div>

        {/* Total Revenue */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <div className="w-6 h-6 text-yellow-600"> 
                <h1 className="text-l font-bold">GHC</h1>
              </div>
            </div>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
          <p className="text-3xl font-bold text-gray-900">GHC {stats.totalRevenue.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-2">All time earnings</p>
        </div>
      </div>

      {/* Alerts Section */}
      {(stats.pendingOrders > 0 || stats.lowStockProducts > 0) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900 mb-1">Attention Required</h3>
              <ul className="text-sm text-yellow-800 space-y-1">
                {stats.pendingOrders > 0 && (
                  <li>• You have {stats.pendingOrders} pending order(s) to process</li>
                )}
                {stats.lowStockProducts > 0 && (
                  <li>• {stats.lowStockProducts} product(s) are running low on stock</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
              <Link
                href="/admin/orders"
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                View all
              </Link>
            </div>
          </div>
          <div className="p-6">
            {recentOrders.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No orders yet</p>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order.order_id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        Order #{order.order_id}
                      </p>
                      <p className="text-sm text-gray-600">
                        {order.user?.user_name || 'Guest'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        GHC{order.total_amount.toFixed(2)}
                      </p>
                      <span
                        className={`inline-block text-xs px-2 py-1 rounded-full font-medium ${
                          order.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : order.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <Link
                href="/admin/products"
                className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-lg hover:border-indigo-600 hover:bg-indigo-50 transition-all group"
              >
                <Package className="w-8 h-8 text-gray-600 group-hover:text-indigo-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">Add Product</span>
              </Link>

              <Link
                href="/admin/categories"
                className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-lg hover:border-indigo-600 hover:bg-indigo-50 transition-all group"
              >
                <Tags className="w-8 h-8 text-gray-600 group-hover:text-indigo-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">Add Category</span>
              </Link>

              <Link
                href="/admin/users"
                className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-lg hover:border-indigo-600 hover:bg-indigo-50 transition-all group"
              >
                <Users className="w-8 h-8 text-gray-600 group-hover:text-indigo-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">Manage Users</span>
              </Link>

              <Link
                href="/admin/orders"
                className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-lg hover:border-indigo-600 hover:bg-indigo-50 transition-all group"
              >
                <ShoppingCart className="w-8 h-8 text-gray-600 group-hover:text-indigo-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">View Orders</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}