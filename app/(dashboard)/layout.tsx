'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, User, LogOut, Shield, Menu, X } from 'lucide-react';
import api from '@/lib/api';
import { useStore } from '@/lib/store';
import { MinimalFooter } from '@/components/MinimalFooter';
import Loader from '@/components/Loader';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, setUser, logout } = useStore();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('redress_access_token');

      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const response = await api.get('auth/me');
        setUser(response.data);
        setIsCheckingAuth(false);
      } catch (error) {
        localStorage.removeItem('redress_access_token');
        localStorage.removeItem('redress_refresh_token');
        router.push('/login');
      }
    };

    checkAuth();
  }, [router, setUser]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (isCheckingAuth) {
    return <Loader />;
  }

  const navItems = [
    { label: 'Complaints', href: '/dashboard', icon: Home },
    { label: 'Profile', href: '/dashboard/profile', icon: User },
  ];

  return (
    <div className="min-h-screen flex transition-colors duration-300 relative">
      {/* Background ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-1/3 -left-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-indigo-500/[0.03] to-purple-600/[0.03] blur-3xl" />
        <div className="absolute inset-0 bg-grid opacity-20" />
      </div>

      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 fixed h-full z-40 p-3">
        <div className="flex-1 glass-card rounded-2xl flex flex-col overflow-hidden">
          {/* Logo */}
          <div className="p-5 flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <img src="/assets/logo.png" alt="Redress Logo" className="w-8 h-8 object-contain" />
              <span className="text-lg font-bold tracking-tight">Redress</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-3 border-t border-slate-200/50 dark:border-white/5 space-y-2">
            <div className="flex items-center space-x-3 px-3 py-2">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400 overflow-hidden shrink-0">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  user?.name?.charAt(0)?.toUpperCase() || 'U'
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 w-full px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 pb-20 md:pb-0 relative z-10">
        {/* Mobile Header */}
        <div className="md:hidden sticky top-0 z-50 px-4 py-3 bg-[#0a0f1e]/80 backdrop-blur-lg border-b border-white/5">
          <div className="glass-card rounded-2xl px-4 py-3 flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center space-x-2">
                <img src="/assets/logo.png" alt="Redress Logo" className="w-7 h-7 object-contain" />
              <span className="font-bold text-sm">Redress</span>
            </Link>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-white/5 relative z-[60]"
              >
                {mobileMenuOpen ? (
                  <X className="w-4 h-4" />
                ) : (
                  <Menu className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="absolute top-[80px] left-4 right-4 animate-fade-in-up">
              <div className="glass-card rounded-2xl p-4 flex flex-col space-y-4 shadow-2xl border border-white/10">
                <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-lg font-bold text-indigo-400 overflow-hidden shrink-0">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                    ) : (
                      user?.name?.charAt(0)?.toUpperCase() || 'U'
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold truncate text-white">{user?.name}</p>
                    <p className="text-sm text-slate-400 truncate">{user?.email}</p>
                  </div>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center space-x-2 w-full p-4 text-sm font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-all border border-red-500/10"
                >
                  <LogOut size={18} />
                  <span>Log out of Redress</span>
                </button>
              </div>
            </div>
            {/* Invisible backdrop click area to close menu */}
            <div className="absolute inset-0 z-[-1]" onClick={() => setMobileMenuOpen(false)} />
          </div>
        )}

        <div className="max-w-5xl mx-auto p-4 md:p-8 min-h-[calc(100vh-64px)] flex flex-col">
          <div className="flex-1">
            {children}
          </div>
          <MinimalFooter />
        </div>
      </main>

      {/* Bottom Nav - Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-4">
        <div className="glass-card rounded-2xl flex justify-around items-center h-16 px-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center space-y-1 w-full h-full rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'text-indigo-500'
                    : 'text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400'
                }`}
              >
                <div className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-indigo-500/10' : ''}`}>
                  <Icon size={20} />
                </div>
                <span className="text-[10px] font-semibold">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
