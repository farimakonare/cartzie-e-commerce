'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { ShoppingCart, Star } from 'lucide-react';
import Link from 'next/link';
import { useNotification } from '@/components/NotificationProvider';

type Product = {
  product_id: number;
  name: string;
  description: string | null;
  price: number;
  stock_quantity: number;
  category_id: number;
  category?: { name: string };
  image_url?: string | null;
};

type Category = {
  category_id: number;
  name: string;
};

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { notify } = useNotification();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const rawSearchTerm = searchParams.get('search') ?? '';
  const normalizedSearchTerm = rawSearchTerm.trim().toLowerCase();

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

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory ? product.category_id === selectedCategory : true;
    const matchesSearch = normalizedSearchTerm
      ? product.name.toLowerCase().includes(normalizedSearchTerm) ||
        (product.description?.toLowerCase().includes(normalizedSearchTerm) ?? false)
      : true;

    return matchesCategory && matchesSearch;
  });

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
      cart[existingIndex].image_url =
        product.image_url || cart[existingIndex].image_url || null;
      notify({
        title: 'Cart updated',
        message: `Updated ${product.name} quantity in your cart.`,
      });
    } else {
      // Add new item
      cart.push({
        product_id: product.product_id,
        name: product.name,
        price: product.price,
        quantity: 1,
        stock_quantity: product.stock_quantity,
        image_url: product.image_url || null,
      });
      notify({
        title: 'Added to cart',
        message: `${product.name} has been added to your cart.`,
      });
    }

    // Save cart
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Trigger cart update event
    window.dispatchEvent(new Event('cartUpdated'));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sand-50 via-brand-50 to-leaf-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Hero Section */}
        {/* <section className="grid gap-8 lg:grid-cols-2 lg:items-center rounded-3xl bg-white/80 p-6 shadow-xl shadow-rose-100 border border-white">
          <div className="space-y-4">
            <p className="inline-flex items-center gap-2 rounded-full bg-leaf-100 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-leaf-700">
              Panaya Store
            </p>
            <h1 className="text-3xl md:text-4xl font-extrabold text-leaf-900">
              Natural fruit drinks & creamy cereal mix, bottled fresh every morning.
            </h1>
            <p className="text-leaf-800">
              Shop Panaya&apos;s rainbow of cold-pressed juices and the beloved cereal blend that
              pairs perfectly with each bottle. Everything is made without added sugar or
              preservatives—just the taste of real fruit and grains.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => window.scrollTo({ top: 500, behavior: 'smooth' })}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-500 via-berry-500 to-leaf-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-200 transition hover:brightness-110"
              >
                Sip & shop now
              </button>
              <Link
                href="/shop/orders"
                className="inline-flex items-center gap-2 rounded-full border border-leaf-500 px-6 py-3 text-sm font-semibold text-leaf-800 hover:bg-leaf-50"
              >
                Track my orders
              </Link>
            </div>
          </div>
          <div className="relative h-64 w-full overflow-hidden rounded-3xl">
            <Image
              src="/drink-b-1.jpeg"
              alt="Panaya juice hero"
              fill
              className="object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/40 to-transparent p-3 text-sm text-white">
              Pressed the same morning your bottle ships.
            </div>
          </div>
        </section> */}

        {/* Highlights */}
        {/* <section className="grid gap-4 md:grid-cols-3">
          {[
            { label: 'Juices today', value: filteredProducts.length, detail: 'Small, vibrant batches' },
            { label: 'Cereal goodness', value: 'Panaya Mix', detail: 'Millet • tiger nuts • spices' },
            { label: 'Zero additives', value: 'No sugar, no preservatives', detail: 'Just fruit + grain' },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl bg-white/80 p-4 shadow-sm border border-white"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-berry-500">{item.label}</p>
              <p className="text-xl font-bold text-leaf-900 mt-1">{item.value}</p>
              <p className="text-sm text-leaf-700 mt-1">{item.detail}</p>
            </div>
          ))}
        </section> */}

        {/* Categories Filter */}
        <section className="rounded-3xl bg-white/80 p-6 border border-white shadow-sm">
          <h2 className="text-xl font-semibold text-leaf-900 mb-4">Sip by mood or mix by vibe</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                selectedCategory === null
                  ? 'bg-gradient-to-r from-brand-500 to-berry-500 text-white shadow'
                  : 'bg-white text-leaf-800 border border-leaf-200 hover:border-leaf-500'
              }`}
            >
              All products
            </button>
            {categories.map((cat) => (
              <button
                key={cat.category_id}
                onClick={() => setSelectedCategory(cat.category_id)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                  selectedCategory === cat.category_id
                    ? 'bg-gradient-to-r from-brand-500 to-berry-500 text-white shadow'
                    : 'bg-white text-leaf-800 border border-leaf-200 hover:border-leaf-500'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </section>

        {/* Products Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-leaf-900">
              {selectedCategory
                ? categories.find((c) => c.category_id === selectedCategory)?.name
                : 'Panaya menu'}
            </h2>
            {/* <p className="text-sm text-leaf-700">
              Showing {filteredProducts.length}{' '}
              {selectedCategory ? 'items in this category' : 'juices and cereal products'}
            </p> */}
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <div
                key={product.product_id}
                className="rounded-3xl border border-white bg-white/90 p-4 shadow-lg transition hover:-translate-y-1 hover:shadow-rose-100"
              >
                <div className="relative h-48 w-full overflow-hidden rounded-2xl bg-leaf-50">
                  {product.image_url ? (
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      sizes="(min-width: 1024px) 33vw, 100vw"
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-5xl">🍹</div>
                  )}
                  <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-berry-500">
                    {product.category?.name || 'Panaya'}
                  </span>
                </div>
                <div className="mt-4 space-y-3">
                  <h3 className="text-lg font-semibold text-leaf-900 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-sm text-leaf-700 line-clamp-2">
                    {product.description || 'Freshly prepared and delivered chilled.'}
                  </p>
                  <div className="flex items-center gap-1 text-brand-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                    {/* <span className="text-xs text-brand-700">Panaya Favorite</span> */}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-leaf-900">
                      GHC {product.price.toFixed(2)}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        product.stock_quantity > 10
                          ? 'bg-leaf-100 text-leaf-800'
                          : product.stock_quantity > 0
                          ? 'bg-brand-100 text-brand-700'
                          : 'bg-berry-100 text-berry-700'
                      }`}
                    >
                      {product.stock_quantity > 0
                        ? `${product.stock_quantity} left`
                        : 'Sold out'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/shop/products/${product.product_id}`}
                      className="flex-1 rounded-full border border-leaf-400 px-4 py-2 text-center text-sm font-semibold text-leaf-800 transition hover:bg-leaf-50"
                    >
                      Details
                    </Link>
                    <button
                      onClick={() => addToCart(product)}
                      disabled={product.stock_quantity === 0}
                      className="flex items-center justify-center rounded-full bg-gradient-to-r from-brand-500 to-berry-500 px-4 py-2 text-sm font-semibold text-white shadow disabled:cursor-not-allowed disabled:bg-gray-300"
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
            <p className="text-leaf-700 text-lg">
              {normalizedSearchTerm
                ? `No products match "${rawSearchTerm}".`
                : 'No items in this category today.'}
            </p>
          </div>
        )}
    </section>
    </div>
  </div>
  );
}
