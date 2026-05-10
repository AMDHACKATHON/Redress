'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Loader2,
  Mail,
  Globe,
  MapPin,
  Calendar,
  FileText,
  Settings as SettingsIcon,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';

interface ProfileResponse {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  avatar: string | null;
  country: string | null;
  state: string | null;
  address: string | null;
  complaintCount?: number;
  complaint_count?: number;
  createdAt?: string;
  created_at?: string;
}

interface NormalizedProfile {
  name: string;
  email: string;
  avatar: string | null;
  country: string;
  state: string;
  address: string;
  complaintCount: number;
  createdAt: string;
}

function normalize(p: ProfileResponse): NormalizedProfile {
  return {
    name: p.name || '',
    email: p.email || '',
    avatar: p.avatar || null,
    country: p.country || '',
    state: p.state || '',
    address: p.address || '',
    complaintCount: p.complaintCount ?? p.complaint_count ?? 0,
    createdAt: p.createdAt || p.created_at || '',
  };
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<NormalizedProfile | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await api.get<ProfileResponse>('profile');
        if (!active) return;
        setProfile(normalize(res.data));
      } catch (err) {
        toast.error('Failed to load profile');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="animate-spin text-slate-400" size={32} />
      </div>
    );
  }

  if (!profile) return null;

  const initial = (profile.name || profile.email).charAt(0).toUpperCase();
  const memberSince = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '—';

  const profileFieldsComplete = !!profile.country && !!profile.address;
  const locationLabel = [profile.state, profile.country].filter(Boolean).join(', ');

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Profile</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Your account at a glance.
          </p>
        </div>
        <Link
          href="/dashboard/settings"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 transition"
        >
          <SettingsIcon size={14} />
          Edit in settings
        </Link>
      </div>

      {/* Identity card */}
      <div className="glass-card rounded-2xl p-6 flex items-center gap-5">
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-2xl font-bold text-indigo-500 dark:text-indigo-400 overflow-hidden shrink-0">
          {profile.avatar ? (
            <Image
              src={profile.avatar}
              alt={profile.name}
              width={64}
              height={64}
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
              unoptimized
            />
          ) : (
            initial || 'U'
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-lg font-semibold text-slate-900 dark:text-white truncate">
            {profile.name || '—'}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 truncate flex items-center gap-1.5">
            <Mail size={14} /> {profile.email}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card rounded-2xl p-5 space-y-1">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
            <FileText size={14} /> Complaints filed
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {profile.complaintCount}
          </p>
        </div>
        <div className="glass-card rounded-2xl p-5 space-y-1">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
            <Calendar size={14} /> Member since
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {memberSince}
          </p>
        </div>
      </div>

      {/* Personal info (read-only) */}
      <div className="glass-card rounded-2xl p-6 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white">Personal information</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              These appear on the complaint letters you generate.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <ReadOnlyField
            icon={<Globe size={12} />}
            label="Location"
            value={locationLabel}
            empty="No country set"
          />
          <ReadOnlyField
            icon={<MapPin size={12} />}
            label="Mailing address"
            value={profile.address}
            empty="No address set"
            multiline
          />
        </div>

        {!profileFieldsComplete && (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 flex items-start gap-3">
            <div className="text-xs text-amber-700 dark:text-amber-300 flex-1">
              Add your country and mailing address so they show up at the top of your complaint letters.
            </div>
            <Link
              href="/dashboard/settings"
              className="shrink-0 text-xs font-semibold text-amber-700 dark:text-amber-300 hover:underline"
            >
              Add now →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function ReadOnlyField({
  icon,
  label,
  value,
  empty,
  multiline,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  empty: string;
  multiline?: boolean;
}) {
  const hasValue = !!value.trim();
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
        {icon} {label}
      </p>
      <div
        className={`px-4 py-3 rounded-xl bg-slate-100/50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 text-sm ${
          hasValue
            ? 'text-slate-900 dark:text-white'
            : 'text-slate-400 dark:text-slate-500 italic'
        } ${multiline ? 'whitespace-pre-wrap leading-relaxed' : 'truncate'}`}
      >
        {hasValue ? value : empty}
      </div>
    </div>
  );
}
