'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, ArrowRight } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  
  const isLoginPage = pathname === '/login';
  const isRegisterPage = pathname === '/register';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between glass-card rounded-2xl px-6 py-3">
        <Link href="/" className="flex items-center space-x-2">
          <img src="/assets/logo.png" alt="Redress Logo" className="w-8 h-8 object-contain logo-navy" />
          <span className="text-xl font-bold tracking-tight text-white">Redress</span>
        </Link>
        
        <div className="flex items-center space-x-3 md:space-x-5">
          {!isLoginPage && (
            <Link
              href="/login"
              className="text-sm font-medium text-slate-400 hover:text-white transition-colors hidden sm:inline-block"
            >
              Login
            </Link>
          )}
          
          {!isRegisterPage && (
            <Link
              href="/register"
              className="btn-primary !py-2.5 !px-5 !text-sm !rounded-xl flex items-center space-x-1.5"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
