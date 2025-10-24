'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Star } from 'lucide-react';
import Link from 'next/link';

type Product = {
  product_id: number;
  name: string;
  description: string | null;
  price: number;
  stock_quantity: number;
  category_id: number;
  category?: { name: string };
};

type Category = {
  category_id: number;
  name: string;
};

export default function HomePage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories'),
      ]);
      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = selectedCategory
    ? products.filter((p) => p.category_id === selectedCategory)
    : products;

  const addToCart = (product: Product) => {
    // Check if user is logged in
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
      // Not logged in - redirect to login
      localStorage.setItem('redirectAfterLogin', `/shop/products/${product.product_id}`);
      router.push('/shop/login');
      return;
    }

    // User is logged in - add to cart
    const cartStr = localStorage.getItem('cart');
    const cart = cartStr ? JSON.parse(cartStr) : [];

    // Check if product already in cart
    const existingIndex = cart.findIndex(
      (item: any) => item.product_id === product.product_id
    );

    if (existingIndex >= 0) {
      // Update quantity
      cart[existingIndex].quantity += 1;
      alert(`Updated ${product.name} quantity in cart!`);
    } else {
      // Add new item
      cart.push({
        product_id: product.product_id,
        name: product.name,
        price: product.price,
        quantity: 1,
        stock_quantity: product.stock_quantity,
      });
      alert(`Added ${product.name} to cart!`);
    }

    // Save cart
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Trigger cart update event
    window.dispatchEvent(new Event('cartUpdated'));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 md:p-12 mb-8 text-white">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Welcome to Cartzie</h1>
        <p className="text-lg mb-6 text-indigo-100">
          Discover amazing products at unbeatable prices
        </p>
        <button 
          onClick={() => window.scrollTo({ top: 400, behavior: 'smooth' })}
          className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition"
        >
          Shop Now
        </button>
      </div>

      {/* Categories Filter */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Shop by Category</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              selectedCategory === null
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-indigo-600'
            }`}
          >
            All Products
          </button>
          {categories.map((cat) => (
            <button
              key={cat.category_id}
              onClick={() => setSelectedCategory(cat.category_id)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                selectedCategory === cat.category_id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-indigo-600'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {selectedCategory
            ? categories.find((c) => c.category_id === selectedCategory)?.name
            : 'All Products'}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.product_id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition group"
            >
              {/* Product Image Placeholder */}
              <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <div className="text-gray-400 text-6xl">📦</div>
              </div>

              <div className="p-4">
                {/* Category Badge */}
                <span className="inline-block px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-600 rounded-full mb-2">
                  {product.category?.name}
                </span>

                {/* Product Name */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {product.name}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {product.description || 'No description available'}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="text-xs text-gray-500 ml-1">(4.5)</span>
                </div>

                {/* Price and Stock */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-bold text-gray-900">
                    GHC {product.price.toFixed(2)}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      product.stock_quantity > 10
                        ? 'bg-green-100 text-green-700'
                        : product.stock_quantity > 0
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {product.stock_quantity > 0
                      ? `${product.stock_quantity} in stock`
                      : 'Out of stock'}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Link
                    href={`/shop/products/${product.product_id}`}
                    className="flex-1 px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition text-center"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => addToCart(product)}
                    disabled={product.stock_quantity === 0}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No products found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}