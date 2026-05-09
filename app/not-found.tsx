'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white flex flex-col items-center justify-center p-6 font-sans">
      <div className="text-center space-y-6">
        <h1 className="text-9xl font-bold text-white/5 select-none">404</h1>
        
        <div className="space-y-2 -mt-12">
          <h2 className="text-2xl font-semibold">Even AI couldn't find this page</h2>
          <p className="text-slate-500 text-sm">
            The link might be broken or the page has been moved.
          </p>
        </div>

        <div className="pt-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center space-x-2 text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
