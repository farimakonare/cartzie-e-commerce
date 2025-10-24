'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingCart, User, Search, Home, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [cartCount, setCartCount] = useState(0);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

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

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('cart');
      setCurrentUser(null);
      setCartCount(0);
      setShowProfileMenu(false);
      router.push('/shop');
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/shop" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">Cz</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Cartzie</span>
            </Link>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-lg mx-8">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
                <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex items-center gap-6">
              <Link
                href="/shop"
                className={`flex items-center gap-2 text-sm font-medium transition ${
                  pathname === '/shop' ? 'text-indigo-600' : 'text-gray-700 hover:text-indigo-600'
                }`}
              >
                <Home className="w-5 h-5" />
                <span className="hidden sm:inline">Home</span>
              </Link>

              {/* Cart Link */}
              <button
                onClick={handleCartClick}
                className={`flex items-center gap-2 text-sm font-medium transition relative ${
                  pathname === '/shop/cart' ? 'text-indigo-600' : 'text-gray-700 hover:text-indigo-600'
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
                    pathname === '/shop/profile' ? 'text-indigo-600' : 'text-gray-700 hover:text-indigo-600'
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
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
              <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-600">
            <p>&copy; 2025 Cartzie. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}