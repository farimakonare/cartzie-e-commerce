'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Package,
  Users,
  ShoppingCart,
  Tags,
  LayoutDashboard,
  LogOut,
  CreditCard,
  Truck,
} from 'lucide-react';

type AdminUser = {
  user_id: number;
  user_name: string;
  user_email: string;
  role: string;
};

const getStoredAdminSession = (): AdminUser | null => {
  if (typeof window === 'undefined') return null;
  const stored = window.localStorage.getItem('adminUser');
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored) as AdminUser;
    return parsed?.role === 'admin' ? parsed : null;
  } catch (error) {
    console.error('Failed to parse admin session:', error);
    return null;
  }
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const isLoginRoute = pathname === '/admin/login';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isLoginRoute) {
      setAdminUser(null);
      setAuthChecked(true);
      return;
    }
    const admin = getStoredAdminSession();
    if (admin) {
      setAdminUser(admin);
      setAuthChecked(true);
    } else {
      setAuthChecked(false);
      router.replace('/admin/login');
    }
  }, [isLoginRoute, router]);

  useEffect(() => {
    if (typeof window === 'undefined' || isLoginRoute) return;
    const handleStorage = () => {
      const admin = getStoredAdminSession();
      if (admin) {
        setAdminUser(admin);
      } else {
        setAdminUser(null);
        router.replace('/admin/login');
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [isLoginRoute, router]);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('adminUser');
    }
    setAdminUser(null);
    router.replace('/admin/login');
  };

  const navItems = [
    { href: '/admin', label: 'Home', icon: LayoutDashboard },
    { href: '/admin/products', label: 'Product', icon: Package },
    { href: '/admin/categories', label: 'Category', icon: Tags },
    { href: '/admin/users', label: 'User', icon: Users },
    { href: '/admin/orders', label: 'Order', icon: ShoppingCart },
    { href: '/admin/payments', label: 'Payment', icon: CreditCard },
    { href: '/admin/shipments', label: 'Shipment', icon: Truck },
  ];

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  if (isLoginRoute) {
    return <>{children}</>;
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!adminUser) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-sand-50 overflow-hidden">
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-sand-200">
        <div className="px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="relative h-10 w-10">
                <Image
                  src="/panaya-logo.jpeg"
                  alt="Panaya"
                  fill
                  className="rounded-lg object-cover"
                  priority
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Panaya Admin</h1>
                <p className="text-xs text-gray-500">Panaya Management</p>
              </div>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-sm text-gray-600 hover:text-gray-900 hidden sm:block"
              >
                View Store
              </Link>
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{adminUser.user_name}</p>
                  <p className="text-xs text-gray-500">{adminUser.user_email}</p>
                </div>
                <div className="w-10 h-10 bg-brand-600 rounded-full flex items-center justify-center text-white font-semibold uppercase">
                  {adminUser.user_name?.charAt(0) || 'A'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex w-full pt-[72px]">
        {/* Sidebar Navigation */}
        <aside className="hidden md:flex fixed top-[72px] bottom-0 w-64 bg-white border-r border-sand-200 flex-col">
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    active
                      ? 'bg-brand-50 text-brand-600 font-semibold shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${active ? 'text-brand-600' : 'text-gray-500'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-all w-full"
            >
              <LogOut className="w-5 h-5 text-gray-500" />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Mobile Bottom Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-sand-200 z-50">
          <nav className="grid grid-cols-7 gap-1 p-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center gap-1 rounded-lg px-2 py-2 text-xs font-medium transition ${
                    active ? 'bg-brand-50 text-brand-600 shadow-sm' : 'text-gray-600'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 md:ml-64 p-4 sm:p-6 lg:p-8 mb-[4.5rem] md:mb-0 overflow-x-auto">
          <div className="min-w-[320px] max-w-7xl mx-auto h-[calc(100vh-72px)] overflow-y-auto pb-24 md:pb-8">
            <div className="pr-4">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
