'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ShoppingCart, Star, ArrowLeft, Minus, Plus } from 'lucide-react';
import { useNotification } from '@/components/NotificationProvider';

type Product = {
  product_id: number;
  name: string;
  description: string | null;
  price: number;
  stock_quantity: number;
  category_id: number;
  image_url?: string | null;
  category?: { name: string };
  reviews?: Array<{
    review_id: number;
    rating: number;
    comment: string;
    user: { user_name: string };
  }>;
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { notify } = useNotification();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${params.id}`);
      const data = await res.json();
      setProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async () => {
    if (!product) return;

    // Check if user is logged in
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
      // Save redirect URL and go to login
      localStorage.setItem(
        'redirectAfterLogin',
        `/shop/products/${product.product_id}`
      );
      router.push('/shop/login');
      return;
    }

    // Get existing cart
    const cartStr = localStorage.getItem('cart');
    const cart = cartStr ? JSON.parse(cartStr) : [];

    // Check if product already in cart
    const existingIndex = cart.findIndex(
      (item: any) => item.product_id === product.product_id
    );

    if (existingIndex >= 0) {
      // Update quantity
      cart[existingIndex].quantity += quantity;
      cart[existingIndex].image_url =
        product.image_url || cart[existingIndex].image_url || null;
    } else {
      // Add new item
      cart.push({
        product_id: product.product_id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        stock_quantity: product.stock_quantity,
        image_url: product.image_url || null,
      });
    }

    // Save cart
    localStorage.setItem('cart', JSON.stringify(cart));
    await notify({
      title: 'Added to cart',
      message: `Added ${quantity} × ${product.name} to your cart.`,
    });

    router.push('/shop/cart');
  };

  const increaseQuantity = () => {
    if (product && quantity < product.stock_quantity) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h2>
        <button
          onClick={() => router.push('/')}
          className="text-brand-600 hover:text-brand-700"
        >
          Go back to shop
        </button>
      </div>
    );
  }

  const averageRating =
    product.reviews && product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
      : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Product Image */}
        <div className="bg-gray-50 rounded-2xl h-96 lg:h-full flex items-center justify-center overflow-hidden relative">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="text-gray-200 text-9xl">📦</div>
          )}
        </div>

        {/* Product Info */}
        <div>
          {/* Category Badge */}
          <span className="inline-block px-3 py-1 text-sm font-medium bg-brand-100 text-brand-600 rounded-full mb-4">
            {product.category?.name}
          </span>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.round(averageRating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              {averageRating.toFixed(1)} ({product.reviews?.length || 0} reviews)
            </span>
          </div>

          {/* Price */}
          <div className="mb-6">
            <span className="text-4xl font-bold text-gray-900">
              GHC {product.price.toFixed(2)}
            </span>
          </div>

          {/* Stock Status */}
          <div className="mb-6">
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                product.stock_quantity > 10
                  ? 'bg-leaf-100 text-leaf-700'
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

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-700 leading-relaxed">
              {product.description || 'No description available for this product.'}
            </p>
          </div>

          {/* Quantity Selector */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Quantity</h3>
            <div className="flex items-center gap-3">
              <button
                onClick={decreaseQuantity}
                disabled={quantity <= 1}
                className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-lg font-medium w-12 text-center">{quantity}</span>
              <button
                onClick={increaseQuantity}
                disabled={quantity >= product.stock_quantity}
                className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={addToCart}
            disabled={product.stock_quantity === 0}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <ShoppingCart className="w-5 h-5" />
            Add to Cart
          </button>
        </div>
      </div>

      {/* Reviews Section */}
      {product.reviews && product.reviews.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h3>
          <div className="space-y-6">
            {product.reviews.map((review) => (
              <div key={review.review_id} className="border-b border-gray-200 pb-6 last:border-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-medium text-gray-900">{review.user.user_name}</span>
                </div>
                <p className="text-gray-700">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
