'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Shield, ArrowRight, Eye, EyeOff } from 'lucide-react';
import api from '@/lib/api';
import { useStore } from '@/lib/store';
import { AuthResponse } from '@/types';
import { MinimalFooter } from '@/components/MinimalFooter';
import { Navbar } from '@/components/Navbar';

export default function LoginPage() {
  const router = useRouter();
  const { setUser, setLoading, isLoading } = useStore();
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('redress_access_token');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await api.post<AuthResponse>('auth/login', formData);
      const { user, tokens } = response.data;

      localStorage.setItem('redress_access_token', tokens.access);
      localStorage.setItem('redress_refresh_token', tokens.refresh);

      setUser(user);
      toast.success('Welcome back to Redress!');
      router.push('/dashboard');
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        'Login failed. Please check your credentials.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <Navbar />
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-indigo-500/[0.06] to-purple-600/[0.06] blur-3xl animate-pulse-glow" />
        <div className="absolute inset-0 bg-grid opacity-30" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 mt-20">

        <h1 className="text-center text-2xl font-bold tracking-tight mb-1">
          Welcome back
        </h1>
        <p className="text-center text-sm text-slate-500 dark:text-slate-500">
          Sign in to continue resolving complaints
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="glass-card rounded-2xl py-8 px-6 sm:px-10 shadow-xl shadow-black/5 dark:shadow-black/30">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="login-email"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Email address
              </label>
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="input-premium w-full"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="input-premium w-full pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-red-400 text-sm bg-red-500/10 p-3 rounded-xl border border-red-500/20 flex items-start space-x-2">
                <div className="w-1 h-1 rounded-full bg-red-400 mt-1.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-white/10" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white/60 dark:bg-[#0d1220]/60 text-slate-400 dark:text-slate-600 backdrop-blur-sm rounded-full">
                  New to Redress?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/register"
                className="btn-secondary w-full flex items-center justify-center"
              >
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-auto relative z-10">
        <MinimalFooter />
      </div>
    </div>
  );
}
