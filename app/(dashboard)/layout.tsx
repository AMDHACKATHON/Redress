'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, User, LogOut } from 'lucide-react';
import api from '@/lib/api';
import { useStore } from '@/lib/store';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, setUser, logout } = useStore();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('redress_access_token');
      
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const response = await api.get('/auth/me/');
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  const navItems = [
    { label: 'Complaints', href: '/', icon: Home },
    { label: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-60 bg-white border-r border-gray-100 fixed h-full">
        <div className="p-6">
          <h1 className="text-2xl font-bold tracking-tight">Redress</h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-black text-white' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-black'
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100 space-y-4">
          <div className="flex items-center space-x-3 px-3">
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                user?.name?.charAt(0) || 'U'
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 w-full px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-all"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-60 pb-20 md:pb-0">
        <div className="max-w-5xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>

      {/* Bottom Nav - Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around items-center h-16 px-4 z-50">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center space-y-1 w-full h-full ${
                isActive ? 'text-black' : 'text-gray-400'
              }`}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
