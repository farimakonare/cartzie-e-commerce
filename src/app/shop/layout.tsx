'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ShoppingCart, User, Search, Home, LogOut, Package } from 'lucide-react';
import { useState, useEffect, FormEvent } from 'react';
import { useNotification } from '@/components/NotificationProvider';

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { confirm } = useNotification();
  const [cartCount, setCartCount] = useState(0);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Check if user is logged in
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }

    // Update cart count
    updateCartCount();

    // Listen for storage changes
    const handleStorageChange = () => {
      updateCartCount();
      const userStr = localStorage.getItem('currentUser');
      if (userStr) {
        setCurrentUser(JSON.parse(userStr));
      } else {
        setCurrentUser(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom cart update event
    window.addEventListener('cartUpdated', updateCartCount);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, []);

  useEffect(() => {
    const currentQuery = searchParams.get('search') ?? '';
    setSearchTerm(currentQuery);
  }, [searchParams]);

  const updateCartCount = () => {
    const cartStr = localStorage.getItem('cart');
    if (cartStr) {
      const cart = JSON.parse(cartStr);
      const count = cart.reduce((total: number, item: any) => total + item.quantity, 0);
      setCartCount(count);
    } else {
      setCartCount(0);
    }
  };

  const handleCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!currentUser) {
      // Not logged in - redirect to login
      localStorage.setItem('redirectAfterLogin', '/shop/cart');
      router.push('/shop/login');
    } else {
      // Go to cart
      router.push('/shop/cart');
    }
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!currentUser) {
      // Not logged in - redirect to login
      router.push('/shop/login');
    } else {
      // Toggle profile menu
      setShowProfileMenu(!showProfileMenu);
    }
  };

  const handleLogout = async () => {
    const confirmed = await confirm({
      title: 'Logout',
      message: 'Are you sure you want to logout?',
      confirmText: 'Logout',
    });
    if (!confirmed) return;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('cart');
    setCurrentUser(null);
    setCartCount(0);
    setShowProfileMenu(false);
    router.push('/shop');
    window.location.reload();
  };

  const navigateWithSearch = (value: string, method: 'push' | 'replace' = 'replace') => {
    const trimmed = value.trim();
    const targetSearch = trimmed ? value : null;
    const currentSearch = searchParams.get('search');
    const onShopPage = pathname === '/shop';

    if (onShopPage) {
      const currentIsEmpty = !currentSearch || currentSearch.trim() === '';
      const targetIsEmpty = !targetSearch;
      if (currentIsEmpty && targetIsEmpty) {
        return;
      }
      if (!targetIsEmpty && currentSearch === targetSearch) {
        return;
      }
    }

    const destination = trimmed ? `/shop?search=${encodeURIComponent(value)}` : '/shop';
    if (method === 'push') {
      router.push(destination);
    } else {
      router.replace(destination);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    navigateWithSearch(value, 'replace');
  };

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigateWithSearch(searchTerm, 'push');
  };

  return (
    <div className="min-h-screen bg-sand-50">
      {/* Header */}
      <header className="bg-white border-b border-sand-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/shop" className="flex items-center gap-2">
              <div className="relative h-8 w-8">
                <Image
                  src="/panaya-logo.jpeg"
                  alt="Panaya"
                  fill
                  className="rounded-lg object-cover"
                  priority
                />
              </div>
              <span className="text-xl font-bold text-gray-900">Panaya</span>
            </Link>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-lg mx-8">
              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600"
                />
                <Search className="pointer-events-none absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              </form>
            </div>

            {/* Navigation */}
            <nav className="flex items-center gap-6">
              <Link
                href="/shop"
                className={`flex items-center gap-2 text-sm font-medium transition ${
                  pathname === '/shop' ? 'text-brand-600' : 'text-gray-700 hover:text-brand-600'
                }`}
              >
                <Home className="w-5 h-5" />
                <span className="hidden sm:inline">Home</span>
              </Link>

              <Link
                href="/shop/orders"
                className={`flex items-center gap-2 text-sm font-medium transition ${
                  pathname.startsWith('/shop/orders')
                    ? 'text-brand-600'
                    : 'text-gray-700 hover:text-brand-600'
                }`}
              >
                <Package className="w-5 h-5" />
                <span className="hidden sm:inline">My Orders</span>
              </Link>

              {/* Cart Link */}
              <button
                onClick={handleCartClick}
                className={`flex items-center gap-2 text-sm font-medium transition relative ${
                  pathname === '/shop/cart' ? 'text-brand-600' : 'text-gray-700 hover:text-brand-600'
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
                <span className="hidden sm:inline">Cart</span>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Profile Link with Dropdown */}
              <div className="relative">
                <button
                  onClick={handleProfileClick}
                  className={`flex items-center gap-2 text-sm font-medium transition ${
                    pathname === '/shop/profile' ? 'text-brand-600' : 'text-gray-700 hover:text-brand-600'
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span className="hidden sm:inline">
                    {currentUser ? currentUser.user_name : 'Profile'}
                  </span>
                </button>

                {/* Profile Dropdown Menu */}
                {showProfileMenu && currentUser && (
                  <>
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm font-semibold text-gray-900">{currentUser.user_name}</p>
                        <p className="text-xs text-gray-600">{currentUser.user_email}</p>
                        {currentUser.user_phone && (
                          <p className="text-xs text-gray-600">
                            <span className="font-medium">Phone:</span> {currentUser.user_phone}
                          </p>
                        )}
                        {currentUser.user_address && (
                          <p className="text-xs text-gray-500 mt-1">
                            <span className="font-medium">Address:</span> {currentUser.user_address}
                          </p>
                        )}
                      </div>
                      
                      <div className="px-4 py-2">
                        <p className="text-xs text-gray-500">
                          <span className="font-medium">Role:</span>{' '}
                          <span className="capitalize">{currentUser.role}</span>
                        </p>
                      </div>

                      <div className="border-t border-gray-200 pt-2">
                        <button
                          onClick={handleLogout}
                          className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 transition flex items-center gap-2"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </div>
                    
                    {/* Backdrop to close menu */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowProfileMenu(false)}
                    />
                  </>
                )}
              </div>
            </nav>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden pb-3">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600"
              />
              <Search className="pointer-events-none absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-600">
            <p>&copy; 2025 Panaya. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
