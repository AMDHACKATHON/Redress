'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Shield, ArrowRight, Eye, EyeOff, Check, X } from 'lucide-react';
import api from '@/lib/api';
import { useStore } from '@/lib/store';
import { AuthResponse } from '@/types';
import { MinimalFooter } from '@/components/MinimalFooter';

export default function RegisterPage() {
  const router = useRouter();
  const { setUser, setLoading, isLoading } = useStore();
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState<string | null>(null);

  const passwordChecks = [
    { label: 'At least 8 characters', valid: formData.password.length >= 8 },
    { label: 'Passwords match', valid: formData.password === formData.confirmPassword && formData.confirmPassword.length > 0 },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post<AuthResponse>('auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      toast.success('Account created successfully! Please sign in.');
      router.push('/login');
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0f1e] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-purple-500/[0.06] to-pink-600/[0.06] blur-3xl animate-pulse-glow" />
        <div className="absolute inset-0 bg-grid opacity-30" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center space-x-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight">Redress</span>
        </Link>

        <h1 className="text-center text-2xl font-bold tracking-tight mb-1">
          Create your account
        </h1>
        <p className="text-center text-sm text-slate-500 dark:text-slate-500">
          Start resolving complaints in minutes
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="glass-card rounded-2xl py-8 px-6 sm:px-10 shadow-xl shadow-black/5 dark:shadow-black/30">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="register-name"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Full Name
              </label>
              <input
                id="register-name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="input-premium w-full"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label
                htmlFor="register-email"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Email address
              </label>
              <input
                id="register-email"
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
                htmlFor="register-password"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="register-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
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

            <div>
              <label
                htmlFor="register-confirm-password"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Confirm Password
              </label>
              <input
                id="register-confirm-password"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                className="input-premium w-full"
                placeholder="••••••••"
              />
            </div>

            {/* Password strength indicators */}
            {formData.password.length > 0 && (
              <div className="space-y-1.5">
                {passwordChecks.map((check) => (
                  <div key={check.label} className="flex items-center space-x-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
                      check.valid
                        ? 'bg-emerald-500/20 text-emerald-500'
                        : 'bg-slate-200/50 dark:bg-white/5 text-slate-400 dark:text-slate-600'
                    }`}>
                      {check.valid ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />}
                    </div>
                    <span className={`text-xs transition-colors ${
                      check.valid ? 'text-emerald-500' : 'text-slate-400 dark:text-slate-600'
                    }`}>
                      {check.label}
                    </span>
                  </div>
                ))}
              </div>
            )}

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
                  <span>Create account</span>
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
                  Already have an account?
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="text-sm font-semibold text-indigo-500 hover:text-indigo-400 transition-colors"
              >
                Sign in instead →
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
