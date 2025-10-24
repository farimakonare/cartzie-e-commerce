import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Welcome to Cartzie
          </h1>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Shop */}
          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">🛍️</div>
            <h2 className="text-2xl font-bold mb-4">Shop</h2>
            <p className="text-gray-600 mb-6">
              Browse our collection of products
            </p>
            <Link 
              href="/products"
              className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Products
            </Link>
          </div>

          {/* User Dashboard */}
          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">👤</div>
            <h2 className="text-2xl font-bold mb-4">My Account</h2>
            <p className="text-gray-600 mb-6">
              View orders, profile, and reviews
            </p>
            <Link 
              href="/userDashboard"
              className="block w-full bg-green-600 text-white text-center py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              User Dashboard
            </Link>
          </div>

          {/* Admin Dashboard */}
          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">⚙️</div>
            <h2 className="text-2xl font-bold mb-4">Admin Panel</h2>
            <p className="text-gray-600 mb-6">
              Manage products, orders, and users
            </p>
            <Link 
              href="/adminDashboard"
              className="block w-full bg-purple-600 text-white text-center py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Admin Dashboard
            </Link>
          </div>
        </div>

        <div className="mt-16 text-center">
          <div className="grid md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <Link 
              href="/cart"
              className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="text-2xl mb-2">🛒</div>
              <div className="font-medium">Shopping Cart</div>
            </Link>
            <Link 
              href="/categories"
              className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="text-2xl mb-2">📂</div>
              <div className="font-medium">Categories</div>
            </Link>
            <Link 
              href="/products"
              className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="text-2xl mb-2">📦</div>
              <div className="font-medium">Products</div>
            </Link>
            <Link 
              href="/userDashboard/orders"
              className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="text-2xl mb-2">📋</div>
              <div className="font-medium">My Orders</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}