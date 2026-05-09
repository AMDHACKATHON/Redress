'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  Copy,
  Globe2,
  LogOut,
  Mail,
  ShieldCheck,
  UserCircle2,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useStore } from '@/lib/store';

function formatJoinedDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Recently';
  }

  return new Intl.DateTimeFormat('en', {
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function getMembershipText(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'New member';
  }

  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

  if (diffDays < 30) {
    return `${diffDays} day${diffDays === 1 ? '' : 's'} on Redress`;
  }

  const diffMonths = Math.max(1, Math.floor(diffDays / 30));
  if (diffMonths < 12) {
    return `${diffMonths} month${diffMonths === 1 ? '' : 's'} on Redress`;
  }

  const diffYears = Math.max(1, Math.floor(diffMonths / 12));
  return `${diffYears} year${diffYears === 1 ? '' : 's'} on Redress`;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useStore();
  const [copyingEmail, setCopyingEmail] = useState(false);

  const initials = useMemo(() => {
    const name = user?.name?.trim() || 'User';
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');
  }, [user?.name]);

  const handleCopyEmail = async () => {
    if (!user?.email || copyingEmail) return;

    try {
      setCopyingEmail(true);
      await navigator.clipboard.writeText(user.email);
      toast.success('Email copied');
    } catch {
      toast.error('Could not copy email');
    } finally {
      setCopyingEmail(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!user) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-8 w-40 rounded-full bg-slate-200/80 dark:bg-white/10 animate-pulse" />
        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="glass-card rounded-3xl p-6 md:p-8 min-h-[320px] animate-pulse" />
          <div className="glass-card rounded-3xl p-6 md:p-8 min-h-[320px] animate-pulse" />
        </div>
      </div>
    );
  }

  const joinedDate = formatJoinedDate(user.created_at);
  const membershipText = getMembershipText(user.created_at);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            Back to complaints
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage your Redress account details and session.
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 rounded-xl border border-red-200/70 dark:border-red-500/20 bg-red-500/5 px-4 py-2 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="glass-card rounded-3xl p-6 md:p-8 shadow-xl shadow-black/5 dark:shadow-black/20">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-indigo-500/15 to-purple-500/15 border border-white/20 dark:border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-300">
                    {initials || 'U'}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl md:text-2xl font-bold tracking-tight">{user.name}</h2>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <BadgeCheck size={14} />
                    Active
                  </span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Your secure profile overview for complaint resolution.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:min-w-[280px]">
              <div className="rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white/60 dark:bg-white/5 p-4">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Complaints</p>
                <p className="mt-2 text-2xl font-bold">{user.complaint_count}</p>
              </div>
              <div className="rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white/60 dark:bg-white/5 p-4">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Member since</p>
                <p className="mt-2 text-sm font-semibold">{joinedDate}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white/60 dark:bg-white/5 p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                <Mail size={16} className="text-indigo-500" />
                Email address
              </div>
              <p className="mt-3 break-all text-sm text-slate-600 dark:text-slate-300">
                {user.email}
              </p>
              <button
                onClick={handleCopyEmail}
                className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200/70 dark:border-white/10 px-4 py-2 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
              >
                <Copy size={14} />
                {copyingEmail ? 'Copying...' : 'Copy email'}
              </button>
            </div>

            <div className="rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white/60 dark:bg-white/5 p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                <CalendarDays size={16} className="text-indigo-500" />
                Account age
              </div>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                {membershipText}
              </p>
              <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                Joined in {joinedDate}
              </p>
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="glass-card rounded-3xl p-6 md:p-7">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              Account details
            </h3>

            <div className="mt-5 space-y-4">
              <div className="flex items-start gap-3 rounded-2xl bg-white/60 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 p-4">
                <UserCircle2 size={18} className="mt-0.5 text-indigo-500" />
                <div>
                  <p className="text-sm font-semibold">Display name</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{user.name}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl bg-white/60 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 p-4">
                <Globe2 size={18} className="mt-0.5 text-indigo-500" />
                <div>
                  <p className="text-sm font-semibold">Country</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {user.country || 'Not set yet'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl bg-white/60 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 p-4">
                <ShieldCheck size={18} className="mt-0.5 text-indigo-500" />
                <div>
                  <p className="text-sm font-semibold">Security</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Signed in with a protected session.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5">
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Profile editing and settings will be added next.
              </p>
            </div>
          </div>

          <div className="glass-card rounded-3xl p-6 md:p-7">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              Quick actions
            </h3>

            <div className="mt-5 space-y-3">
              <button
                onClick={handleCopyEmail}
                className="w-full rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white/60 dark:bg-white/5 px-4 py-3 text-sm font-semibold text-left hover:bg-slate-50 dark:hover:bg-white/10 transition-colors"
              >
                Copy contact email
              </button>

              <Link
                href="/dashboard"
                className="block w-full rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white/60 dark:bg-white/5 px-4 py-3 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-white/10 transition-colors"
              >
                View complaints
              </Link>

              <button
                onClick={handleLogout}
                className="w-full rounded-2xl border border-red-200/70 dark:border-red-500/20 bg-red-500/5 px-4 py-3 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors"
              >
                Sign out of account
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}