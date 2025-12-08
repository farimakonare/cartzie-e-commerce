'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, MapPin, Phone } from 'lucide-react';
import { useNotification } from '@/components/NotificationProvider';

export default function LoginPage() {
  const router = useRouter();
  const { notify } = useNotification();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    user_name: '',
    user_email: '',
    user_password: '',
    user_address: '',
    user_phone: '',
  });

  const handleSubmit = async () => {
    setLoading(true);

    try {
      if (isLogin) {
        // Login - Find user by email and password
        const res = await fetch('/api/users');
        const users = await res.json();
        const user = users.find(
          (u: any) =>
            u.user_email === formData.user_email &&
            u.role === 'customer' // Only allow customers to login on storefront
        );

        if (user) {
          let userToStore = user;

          if (formData.user_phone.trim() && formData.user_phone !== user.user_phone) {
            try {
              const updateRes = await fetch(`/api/users/${user.user_id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_phone: formData.user_phone.trim() }),
              });

              if (updateRes.ok) {
                userToStore = await updateRes.json();
              } else {
                userToStore = { ...user, user_phone: formData.user_phone.trim() };
              }
            } catch (updateError) {
              console.error('Error updating phone:', updateError);
            }
          }

          // Store user in localStorage for session
          localStorage.setItem('currentUser', JSON.stringify(userToStore));
          
          // Check if there's a redirect URL (from cart)
          const redirectUrl = localStorage.getItem('redirectAfterLogin');
          if (redirectUrl) {
            localStorage.removeItem('redirectAfterLogin');
            router.push(redirectUrl);
          } else {
            router.push('/shop');
          }
        } else {
          notify({
            title: 'Login failed',
            message: 'Invalid email or user not found. Please register first.',
          });
        }
      } else {
        // Register - Create new user
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            role: 'customer',
          }),
        });

        if (res.ok) {
          const newUser = await res.json();
          localStorage.setItem('currentUser', JSON.stringify(newUser));
          
          const redirectUrl = localStorage.getItem('redirectAfterLogin');
          if (redirectUrl) {
            localStorage.removeItem('redirectAfterLogin');
            router.push(redirectUrl);
          } else {
            router.push('/shop');
          }
        } else {
          notify({
            title: 'Registration failed',
            message: 'Please try again.',
          });
        }
      }
    } catch (error) {
      console.error('Error:', error);
      notify({
        title: 'Error',
        message: 'Something went wrong. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sand-50 via-brand-50 to-leaf-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          {/* <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl mb-4 shadow">
            <div className="relative h-12 w-12">
              <Image src="/panaya-logo.jpeg" alt="Panaya" fill className="rounded-xl object-cover" priority />
            </div>
          </div> */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-gray-600">
            {isLogin
              ? 'Sign in to continue shopping'
              : 'Register to start shopping'}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="space-y-5">
            {/* Name (Register only) */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={formData.user_name}
                    onChange={(e) =>
                      setFormData({ ...formData, user_name: e.target.value })
                    }
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={formData.user_email}
                  onChange={(e) =>
                    setFormData({ ...formData, user_email: e.target.value })
                  }
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number {isLogin ? '*' : '*'}
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  required={!isLogin}
                  value={formData.user_phone}
                  onChange={(e) =>
                    setFormData({ ...formData, user_phone: e.target.value })
                  }
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent"
                  placeholder="+233 00 000 0000"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  required
                  value={formData.user_password}
                  onChange={(e) =>
                    setFormData({ ...formData, user_password: e.target.value })
                  }
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            {/* Address (Register only) */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.user_address}
                    onChange={(e) =>
                      setFormData({ ...formData, user_address: e.target.value })
                    }
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent"
                    placeholder="Enter your address (optional)"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-3 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading
                ? 'Please wait...'
                : isLogin
                ? 'Sign In'
                : 'Create Account'}
            </button>
          </div>

          {/* Toggle Login/Register */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setFormData({
                  user_name: '',
                  user_email: '',
                  user_password: '',
                  user_address: '',
                  user_phone: '',
                });
              }}
              className="text-brand-600 hover:text-brand-700 font-medium"
            >
              {isLogin
                ? "Don't have an account? Register"
                : 'Already have an account? Sign In'}
            </button>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/shop')}
            className="text-gray-600 hover:text-gray-900 font-medium"
          >
            ← Back to Shop
          </button>
        </div>
      </div>
    </div>
  );
}
