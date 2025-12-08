'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Lock, Mail, Store } from 'lucide-react';
import { useNotification } from '@/components/NotificationProvider';

export default function AdminLoginPage() {
  const router = useRouter();
  const { notify } = useNotification();
  const [formData, setFormData] = useState({
    user_email: '',
    user_password: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('adminUser');
    if (stored) {
      router.replace('/admin');
    }
  }, [router]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.user_email.trim(),
          password: formData.user_password,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        notify({
          title: 'Login failed',
          message: data?.error || 'Invalid admin credentials.',
        });
        return;
      }

      const admin = await res.json();
      localStorage.setItem('adminUser', JSON.stringify(admin));
      notify({
        title: 'Welcome back',
        message: `Signed in as ${admin.user_name}.`,
      });
      router.replace('/admin');
    } catch (error) {
      console.error('Admin login error:', error);
      notify({
        title: 'Error',
        message: 'Unable to login right now. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sand-50 via-brand-50 to-leaf-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl mb-4 shadow">
            <div className="relative h-12 w-12">
              <Image
                src="/panaya-logo.jpeg"
                alt="Panaya"
                fill
                className="rounded-xl object-cover"
                priority
              />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome Back
          </h1>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-500">
            Login to manage orders
          </p>
          {/* <h1 className="text-3xl font-bold text-gray-900 mt-2">Control Center Login</h1>
          <p className="text-gray-600 mt-2">
            Only authorized team members may access this dashboard.
          </p> */}
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={formData.user_email}
                  onChange={(e) => setFormData({ ...formData, user_email: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 pl-11 pr-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent"
                  placeholder="admin@panaya.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  required
                  value={formData.user_password}
                  onChange={(e) => setFormData({ ...formData, user_password: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 pl-11 pr-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold py-3 transition disabled:bg-brand-300 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-brand-600 transition text-sm"
          >
            <Store className="w-4 h-4" />
            Back to store
          </button>
        </div>
      </div>
    </div>
  );
}
