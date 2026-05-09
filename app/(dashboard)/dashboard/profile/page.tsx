'use client';

import Image from 'next/image';
import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Globe2,
  LogOut,
  Pencil,
  Trash2,
  X,
  Camera,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useStore } from '@/lib/store';
import api from '@/lib/api';

interface ApiError {
  response?: {
    data?: {
      error?: string;
    };
  };
}

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
  const { user, logout, setUser } = useStore();

  // Edit modals state
  const [editingName, setEditingName] = useState(false);
  const [editingCountry, setEditingCountry] = useState(false);
  const [editingAvatar, setEditingAvatar] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Form values
  const [newName, setNewName] = useState(user?.name || '');
  const [newCountry, setNewCountry] = useState(user?.country || '');
  const [newAvatar, setNewAvatar] = useState(user?.avatar || '');

  // Loading states
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // File input ref for avatar upload
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleAvatarFileChange = (e: any) => {
    const file = e?.target?.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setNewAvatar(String(reader.result));
      setEditingAvatar(true);
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  const initials = useMemo(() => {
    const name = user?.name?.trim() || 'User';
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');
  }, [user?.name]);

  const handleUpdateName = async () => {
    if (!newName.trim() || updating) return;

    try {
      setUpdating(true);
      const response = await api.patch('/profile/update', { name: newName });
      setUser(response.data);
      setEditingName(false);
      toast.success('Name updated successfully');
    } catch (error: unknown) {
      console.error('Update name error:', error);
      const apiError = error as ApiError;
      const errorMsg = (apiError?.response?.data?.error) || 'Failed to update name';
      toast.error(errorMsg);
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateCountry = async () => {
    if (updating) return;

    try {
      setUpdating(true);
      const response = await api.patch('/profile/update', { country: newCountry || null });
      setUser(response.data);
      setEditingCountry(false);
      toast.success('Country updated successfully');
    } catch (error: unknown) {
      console.error('Update country error:', error);
      const apiError = error as ApiError;
      const errorMsg = (apiError?.response?.data?.error) || 'Failed to update country';
      toast.error(errorMsg);
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateAvatar = async () => {
    if (updating) return;

    try {
      setUpdating(true);
      const response = await api.patch('/profile/update', { avatar: newAvatar || null });
      setUser(response.data);
      setEditingAvatar(false);
      toast.success('Avatar updated successfully');
    } catch (error: unknown) {
      console.error('Update avatar error:', error);
      const apiError = error as ApiError;
      const errorMsg = (apiError?.response?.data?.error) || 'Failed to update avatar';
      toast.error(errorMsg);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleting) return;

    try {
      setDeleting(true);
      await api.delete('/profile/delete');
      logout();
      toast.success('Account deleted successfully');
      router.push('/login');
    } catch (error: unknown) {
      console.error('Delete account error:', error);
      const apiError = error as ApiError;
      const errorMsg = (apiError?.response?.data?.error) || 'Failed to delete account';
      toast.error(errorMsg);
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
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
            className="inline-flex items-center justify-center rounded-lg p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-colors"
            aria-label="Back"
            title="Back"
          >
            <ArrowLeft size={16} />
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

      <div className="space-y-8">
        {/* Hero Section with Avatar */}
        <section className="glass-card rounded-3xl p-6 md:p-8 shadow-xl shadow-black/5 dark:shadow-black/20">
          <div className="flex flex-col items-center text-center space-y-6">
            {/* Avatar */}
            <div className="relative group">
              <div className="h-32 w-32 md:h-40 md:w-40 rounded-full bg-gradient-to-br from-indigo-500/15 to-purple-500/15 border-2 border-indigo-500/30 dark:border-indigo-500/50 flex items-center justify-center overflow-hidden shadow-lg">
                {user.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user.name}
                    width={160}
                    height={160}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-5xl md:text-6xl font-bold text-indigo-600 dark:text-indigo-300">
                    {initials || 'U'}
                  </span>
                )}
              </div>

              <input ref={fileInputRef} onChange={handleAvatarFileChange} className="hidden" type="file" accept="image/*" />

              <button
                onClick={triggerFileInput}
                className="absolute bottom-0 right-0 p-3 rounded-full bg-indigo-500 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-indigo-600"
                aria-label="Edit avatar"
              >
                <Camera size={20} />
              </button>
            </div>

            {/* Name + Edit */}
            <div className="space-y-2 w-full">
              <div className="flex items-center justify-center gap-3">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight inline-flex items-center gap-3">
                  {user.name}
                  <button
                    onClick={() => {
                      setNewName(user.name);
                      setEditingName(true);
                    }}
                    className="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-white/10 transition-colors"
                    aria-label="Edit name"
                  >
                    <Pencil size={20} className="text-slate-400" />
                  </button>
                </h2>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {membershipText} • Joined {joinedDate}
              </p>
            </div>

            {/* (stats removed here — complaints moved into country row below) */}
          </div>

          {/* Location + Complaints */}
          <div className="mt-8 pt-8 border-t border-slate-200/70 dark:border-white/10 space-y-4">
            <div className="flex items-center justify-between gap-4 rounded-2xl bg-white/60 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 p-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="p-2 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20">
                  <Globe2 size={20} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">LOCATION</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {user.country || 'Not set'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setNewCountry(user.country || '');
                  setEditingCountry(true);
                }}
                className="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-white/10 transition-colors"
                aria-label="Edit country"
              >
                <Pencil size={18} className="text-slate-400" />
              </button>
            </div>

            <div className="rounded-2xl bg-white/60 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 p-4">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">COMP</p>
              <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{user.complaint_count}</p>
            </div>
          </div>

        </section>
      </div>

      {/* Delete account section */}
      <section className="glass-card rounded-3xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">Danger zone</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Permanently delete your account and all associated data.</p>
          </div>
          <div className="flex items-center">
            <button
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-red-200/70 dark:border-red-500/20 bg-red-500/5 px-6 py-3 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 size={16} />
              Delete account
            </button>
          </div>
        </div>
      </section>

      {/* Edit Name Modal */}
      {editingName && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Edit display name</h2>
              <button
                onClick={() => setEditingName(false)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setEditingName(false)}
                className="flex-1 rounded-xl border border-slate-200 dark:border-white/10 px-4 py-3 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateName}
                disabled={updating || !newName.trim()}
                className="flex-1 rounded-xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-600 disabled:opacity-50 transition-colors"
              >
                {updating ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Country Modal */}
      {editingCountry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Edit country</h2>
              <button
                onClick={() => setEditingCountry(false)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <input
              type="text"
              value={newCountry}
              onChange={(e) => setNewCountry(e.target.value)}
              placeholder="e.g., United States"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setEditingCountry(false)}
                className="flex-1 rounded-xl border border-slate-200 dark:border-white/10 px-4 py-3 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateCountry}
                disabled={updating}
                className="flex-1 rounded-xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-600 disabled:opacity-50 transition-colors"
              >
                {updating ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Avatar Modal */}
      {editingAvatar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Edit avatar</h2>
              <button
                onClick={() => setEditingAvatar(false)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Enter a URL to your avatar image:
              </p>
              <input
                type="url"
                value={newAvatar}
                onChange={(e) => setNewAvatar(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

              {newAvatar && (
                <div className="mt-4 flex justify-center">
                  <div className="h-20 w-20 rounded-2xl overflow-hidden border-2 border-indigo-500">
                    <Image
                      src={newAvatar}
                      alt="Preview"
                      width={80}
                      height={80}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setEditingAvatar(false)}
                className="flex-1 rounded-xl border border-slate-200 dark:border-white/10 px-4 py-3 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateAvatar}
                disabled={updating}
                className="flex-1 rounded-xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-600 disabled:opacity-50 transition-colors"
              >
                {updating ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-red-600 dark:text-red-400">Delete account?</h2>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                This action cannot be undone. Your account and all associated data will be permanently deleted.
              </p>

              <div className="rounded-xl bg-red-500/10 border border-red-200 dark:border-red-500/20 p-3">
                <p className="text-xs font-semibold text-red-600 dark:text-red-400">
                  ⚠️ This will delete your account and all your complaints permanently.
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 rounded-xl border border-slate-200 dark:border-white/10 px-4 py-3 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex-1 rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                {deleting ? 'Deleting...' : 'Delete permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}