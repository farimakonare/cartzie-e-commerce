'use client';

import { useEffect, useMemo, useState } from 'react';
import { Star } from 'lucide-react';
import Link from 'next/link';

type Review = {
  review_id: number;
  rating: number;
  comment?: string | null;
  user?: { user_name: string } | null;
  product?: { name: string; category?: { name: string } | null } | null;
};

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch('/api/reviews', { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to load reviews');
        const data = await res.json();
        setReviews(data);
      } catch (error) {
        console.error('Error loading reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const summary = useMemo(() => {
    if (!reviews.length) {
      return { total: 0, average: 0, fiveStar: 0, lowRating: 0 };
    }
    const total = reviews.length;
    const average = reviews.reduce((sum, r) => sum + r.rating, 0) / total;
    const fiveStar = reviews.filter((r) => r.rating === 5).length;
    const lowRating = reviews.filter((r) => r.rating <= 2).length;
    return { total, average, fiveStar, lowRating };
  }, [reviews]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return reviews;
    return reviews.filter((review) => {
      const customer = review.user?.user_name?.toLowerCase() ?? '';
      const product = review.product?.name?.toLowerCase() ?? '';
      return customer.includes(query) || product.includes(query);
    });
  }, [reviews, search]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Reviews</h1>
          <p className="text-gray-600">Track sentiment across all Panaya products.</p>
        </div>
        <div className="flex gap-3 text-sm text-gray-700">
          <div className="rounded-xl border border-gray-200 px-4 py-2">
            <p className="text-xs uppercase text-gray-500">Avg rating</p>
            <p className="text-lg font-semibold flex items-center gap-1">
              {summary.average.toFixed(1)}
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 px-4 py-2">
            <p className="text-xs uppercase text-gray-500">Total reviews</p>
            <p className="text-lg font-semibold">{summary.total}</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-4 text-sm text-gray-700">
            <div>
              <p className="text-xs uppercase text-gray-500">5 stars</p>
              <p className="text-lg font-semibold text-leaf-700">{summary.fiveStar}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-500">Needs attention</p>
              <p className="text-lg font-semibold text-berry-600">{summary.lowRating}</p>
            </div>
          </div>
          <div className="relative w-full sm:w-64">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-600"
              placeholder="Search by customer or product..."
            />
          </div>
        </div>

        <div className="mt-6 divide-y divide-gray-100">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-gray-500">No reviews yet.</div>
          ) : (
            filtered.map((review) => (
              <div
                key={review.review_id}
                className="py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-gray-900">
                    {review.user?.user_name ?? 'Anonymous'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {review.product?.name ?? 'Unknown product'}
                    {review.product?.category?.name
                      ? ` • ${review.product.category.name}`
                      : ''}
                  </p>
                  <p className="mt-2 text-sm text-gray-700">
                    {review.comment?.trim() || 'No comment provided.'}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-6">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(5)].map((_, idx) => (
                      <Star
                        key={idx}
                        className={`h-4 w-4 ${
                          idx < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <Link
                    href={`/shop/products/${review.product?.name ?? ''}`}
                    className="text-sm text-brand-600 hover:text-brand-700"
                  >
                    View product
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
