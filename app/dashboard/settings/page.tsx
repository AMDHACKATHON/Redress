'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import {
  Loader2,
  Save,
  Trash2,
  Mail,
  Globe,
  User as UserIcon,
  Upload,
  X,
  ArrowLeft,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';
import { useStore } from '@/lib/store';
import { useConfirm } from '@/components/ui/ConfirmDialog';
import { COUNTRIES } from '@/lib/countries';

interface ProfileResponse {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  avatar: string | null;
  country: string | null;
  address: string | null;
}

const AVATAR_SIZE = 256;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

async function fileToResizedDataUrl(file: File): Promise<string> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('Image too large. Pick something under 5MB.');
  }
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new window.Image();
    i.onload = () => resolve(i);
    i.onerror = () => reject(new Error('Could not read that image.'));
    i.src = dataUrl;
  });

  const canvas = document.createElement('canvas');
  canvas.width = AVATAR_SIZE;
  canvas.height = AVATAR_SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas unsupported in this browser.');

  const scale = Math.max(AVATAR_SIZE / img.width, AVATAR_SIZE / img.height);
  const drawW = img.width * scale;
  const drawH = img.height * scale;
  const dx = (AVATAR_SIZE - drawW) / 2;
  const dy = (AVATAR_SIZE - drawH) / 2;
  ctx.drawImage(img, dx, dy, drawW, drawH);

  return canvas.toDataURL('image/jpeg', 0.85);
}

export default function SettingsPage() {
  const { user, setUser, logout } = useStore();
  const confirm = useConfirm();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [address, setAddress] = useState('');
  const [avatar, setAvatar] = useState('');
  const [email, setEmail] = useState('');

  // Snapshot of saved values, used to compute the dirty flag.
  const [saved, setSaved] = useState({ name: '', country: '', address: '', avatar: '' });

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await api.get<ProfileResponse>('profile');
        if (!active) return;
        const p = res.data;
        const nextName = p.name || '';
        const nextCountry = p.country || '';
        const nextAddress = p.address || '';
        const nextAvatar = p.avatar || '';
        setName(nextName);
        setEmail(p.email || '');
        setCountry(nextCountry);
        setAddress(nextAddress);
        setAvatar(nextAvatar);
        setSaved({ name: nextName, country: nextCountry, address: nextAddress, avatar: nextAvatar });
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

  const dirty =
    name !== saved.name ||
    country !== saved.country ||
    address !== saved.address ||
    avatar !== saved.avatar;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    setSaving(true);
    try {
      await api.patch('profile/update', {
        name: name.trim(),
        country: country.trim() || null,
        address: address.trim() || null,
        avatar: avatar.trim() || null,
      });
      const next = {
        name: name.trim(),
        country: country.trim(),
        address: address.trim(),
        avatar: avatar.trim(),
      };
      setSaved(next);
      if (user) {
        setUser({
          ...user,
          name: next.name,
          country: next.country || null,
          address: next.address || null,
          avatar: next.avatar || null,
        });
      }
      toast.success('Settings saved');
    } catch (err) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('That file isn’t an image.');
      return;
    }
    setUploadingAvatar(true);
    try {
      const dataUrl = await fileToResizedDataUrl(file);
      setAvatar(dataUrl);
    } catch (err: any) {
      toast.error(err?.message || 'Could not load that image');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleAvatarRemove = () => {
    setAvatar('');
  };

  const handleDelete = async () => {
    const ok = await confirm({
      title: 'Delete your account?',
      description:
        'This will permanently delete your account and ALL your complaints, letters, and messages. This cannot be undone.',
      confirmLabel: 'Delete account',
      variant: 'danger',
    });
    if (!ok) return;

    setDeleting(true);
    try {
      await api.delete('profile/delete');
      toast.success('Account deleted');
      logout();
      await signOut({ callbackUrl: '/login' });
    } catch (err) {
      toast.error('Failed to delete account');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="animate-spin text-slate-400" size={32} />
      </div>
    );
  }

  const initial = (name || email).charAt(0).toUpperCase();

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="space-y-2">
        <Link
          href="/dashboard/profile"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
        >
          <ArrowLeft size={14} /> Back to profile
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Update the details that show up on your complaint letters.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="glass-card rounded-2xl p-6 space-y-5">
        <div className="space-y-1">
          <h2 className="font-semibold text-slate-900 dark:text-white">Account details</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Your name appears on the complaint letters you generate.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="settings-name"
              className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5"
            >
              <UserIcon size={12} /> Name
            </label>
            <input
              id="settings-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="w-full px-4 py-2.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50 transition"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="settings-email"
              className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5"
            >
              <Mail size={12} /> Email
            </label>
            <input
              id="settings-email"
              type="email"
              value={email}
              disabled
              placeholder="email@example.com"
              className="w-full px-4 py-2.5 bg-slate-100/50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-xl text-sm text-slate-500 dark:text-slate-500 cursor-not-allowed"
            />
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Email is managed by your sign-in provider and cannot be changed here.
            </p>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="settings-country"
              className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5"
            >
              <Globe size={12} /> Country
            </label>
            <select
              id="settings-country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50 transition [color-scheme:dark]"
            >
              <option value="" className="bg-slate-900 text-white">Select a country</option>
              {COUNTRIES.map((c) => (
                <option key={c} value={c} className="bg-slate-900 text-white">{c}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="settings-address"
              className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 block"
            >
              Mailing address
            </label>
            <textarea
              id="settings-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              placeholder="Street, city, postal code"
              className="w-full px-4 py-2.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50 transition resize-none"
            />
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Used as the sender block at the top of your complaint letters. Leave blank to skip.
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Avatar
            </span>
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-2xl font-bold text-indigo-500 dark:text-indigo-400 overflow-hidden shrink-0 border border-slate-200 dark:border-white/10">
                {avatar ? (
                  <Image
                    src={avatar}
                    alt="Avatar preview"
                    width={80}
                    height={80}
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                    unoptimized
                  />
                ) : (
                  initial || 'U'
                )}
              </div>
              <div className="flex flex-col gap-2">
                <input
                  ref={fileInputRef}
                  id="settings-avatar"
                  type="file"
                  accept="image/*"
                  aria-label="Upload avatar image"
                  className="hidden"
                  onChange={handleAvatarPick}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 transition disabled:opacity-50"
                >
                  {uploadingAvatar ? (
                    <Loader2 className="animate-spin" size={14} />
                  ) : (
                    <Upload size={14} />
                  )}
                  {avatar ? 'Change photo' : 'Upload photo'}
                </button>
                {avatar && (
                  <button
                    type="button"
                    onClick={handleAvatarRemove}
                    disabled={uploadingAvatar}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-red-500 hover:bg-red-500/10 transition disabled:opacity-50"
                  >
                    <X size={14} /> Remove
                  </button>
                )}
              </div>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Stored as a 256x256 image. PNG, JPG, or WEBP up to 5MB.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving || !dirty || !name.trim()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20 hover:opacity-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </form>

      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 space-y-4">
        <div>
          <h2 className="font-semibold text-red-500 dark:text-red-400">Danger zone</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Permanently delete your account and all associated complaints, letters, and messages.
          </p>
        </div>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50"
        >
          {deleting ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
          {deleting ? 'Deleting...' : 'Delete my account'}
        </button>
      </div>
    </div>
  );
}
