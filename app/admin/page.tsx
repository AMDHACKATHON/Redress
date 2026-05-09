'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Users, 
  FileText, 
  ShieldCheck, 
  ArrowLeft, 
  Trash2, 
  Eye, 
  ChevronDown, 
  ChevronUp,
  Loader2,
  Mail,
  Calendar,
  Globe
} from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';

const ADMIN_EMAIL = 'hello@samkiel.dev';

interface AdminStats {
  totalUsers: number;
  totalComplaints: number;
  totalLetters: number;
  totalEscalations: number;
}

interface UserListItem {
  id: string;
  name: string;
  email: string;
  complaintCount: number;
  createdAt: string;
}

interface UserDetail extends UserListItem {
  country: string | null;
}

interface ComplaintDetail {
  complaintId: string;
  summary: string | null;
  stage: string;
  letterGenerated: boolean;
  escalationGenerated: boolean;
  createdAt: string;
  letter: any;
  escalationLetter: any;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<{[key: string]: {user: UserDetail, complaints: ComplaintDetail[]}}>({});
  const [fetchingDetails, setFetchingDetails] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated' || (status === 'authenticated' && session?.user?.email !== ADMIN_EMAIL)) {
      router.push('/dashboard');
    } else if (status === 'authenticated') {
      fetchAdminData();
    }
  }, [status, session, router]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const response = await api.get('admin/stats');
      setStats(response.data.stats);
      setUsers(response.data.users);
    } catch (error) {
      toast.error('Failed to load admin statistics');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (userId: string) => {
    if (userDetails[userId]) {
      setExpandedUserId(expandedUserId === userId ? null : userId);
      return;
    }

    setFetchingDetails(userId);
    try {
      const response = await api.get(`admin/users/${userId}`);
      setUserDetails(prev => ({ ...prev, [userId]: response.data }));
      setExpandedUserId(userId);
    } catch (error) {
      toast.error('Failed to load user details');
    } finally {
      setFetchingDetails(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure? This will delete the user and ALL their data (complaints, letters, messages). This cannot be undone.')) {
      return;
    }

    setDeletingId(userId);
    try {
      await api.delete(`admin/users/${userId}`);
      toast.success('User and all associated data deleted');
      setUsers(users.filter(u => u.id !== userId));
      // Update stats locally
      if (stats) {
        const userToDelete = users.find(u => u.id === userId);
        setStats({
          ...stats,
          totalUsers: stats.totalUsers - 1,
          totalComplaints: stats.totalComplaints - (userToDelete?.complaintCount || 0)
        });
      }
    } catch (error) {
      toast.error('Failed to delete user');
    } finally {
      setDeletingId(null);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-slate-100 p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <Link 
              href="/dashboard" 
              className="inline-flex items-center space-x-2 text-sm text-slate-400 hover:text-white transition-colors mb-4"
            >
              <ArrowLeft size={16} />
              <span>Back to Dashboard</span>
            </Link>
            <h1 className="text-4xl font-extrabold tracking-tight">Admin <span className="gradient-text">Control Center</span></h1>
            <p className="text-slate-400">Platform overview and user management</p>
          </div>
          <div className="flex items-center space-x-3 px-4 py-2 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <ShieldCheck size={20} />
            <span className="text-sm font-semibold">Authorized: {session?.user?.email}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total Users', value: stats?.totalUsers, icon: Users, color: 'from-blue-500 to-indigo-600' },
            { label: 'Total Complaints', value: stats?.totalComplaints, icon: FileText, color: 'from-indigo-500 to-purple-600' },
            { label: 'Letters Drafted', value: stats?.totalLetters, icon: ShieldCheck, color: 'from-purple-500 to-pink-600' },
            { label: 'Escalations Sent', value: stats?.totalEscalations, icon: Globe, color: 'from-pink-500 to-rose-600' },
          ].map((stat, i) => (
            <div key={i} className="glass-card p-6 rounded-3xl space-y-4 hover:scale-[1.02] transition-transform duration-300">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                <stat.icon className="text-white" size={24} />
              </div>
              <div>
                <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
                <p className="text-3xl font-bold text-white mt-1">{stat.value?.toLocaleString() || '0'}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Users Table */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center space-x-3">
            <Users size={24} className="text-indigo-500" />
            <span>User Directory</span>
          </h2>
          
          <div className="glass-card rounded-3xl overflow-hidden border border-white/5">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 text-slate-400 text-xs font-bold uppercase tracking-wider">
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4 text-center">Complaints</th>
                    <th className="px-6 py-4">Joined</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map((user) => (
                    <React.Fragment key={user.id}>
                      <tr className={`group transition-colors ${expandedUserId === user.id ? 'bg-indigo-500/5' : 'hover:bg-white/[0.02]'}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-semibold text-white">{user.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2 text-slate-400">
                            <Mail size={14} />
                            <span>{user.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold border border-indigo-500/20">
                            {user.complaintCount}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2 text-slate-400 text-sm">
                            <Calendar size={14} />
                            <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                          <button 
                            onClick={() => fetchUserDetails(user.id)}
                            disabled={fetchingDetails === user.id}
                            className={`p-2 rounded-xl transition-all ${
                              expandedUserId === user.id 
                                ? 'bg-indigo-500 text-white' 
                                : 'bg-white/5 text-slate-400 hover:bg-indigo-500/20 hover:text-indigo-400'
                            }`}
                          >
                            {fetchingDetails === user.id ? (
                              <Loader2 size={18} className="animate-spin" />
                            ) : expandedUserId === user.id ? (
                              <ChevronUp size={18} />
                            ) : (
                              <ChevronDown size={18} />
                            )}
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={deletingId === user.id}
                            className="p-2 rounded-xl bg-white/5 text-slate-400 hover:bg-rose-500/20 hover:text-rose-500 transition-all"
                          >
                            {deletingId === user.id ? (
                              <Loader2 size={18} className="animate-spin" />
                            ) : (
                              <Trash2 size={18} />
                            )}
                          </button>
                        </td>
                      </tr>
                      
                      {/* Expanded Section */}
                      {expandedUserId === user.id && userDetails[user.id] && (
                        <tr className="bg-indigo-500/[0.03]">
                          <td colSpan={5} className="px-8 py-8 border-t border-indigo-500/10">
                            <div className="space-y-8 animate-fade-in-up">
                              {/* Expanded User Header */}
                              <div className="grid grid-cols-3 gap-6 pb-6 border-b border-white/5">
                                <div className="space-y-1">
                                  <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Country</p>
                                  <p className="text-sm">{userDetails[user.id].user.country || 'Not specified'}</p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest">User ID</p>
                                  <p className="text-xs font-mono text-slate-500">{user.id}</p>
                                </div>
                              </div>

                              {/* Complaints List */}
                              <div className="space-y-4">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center space-x-2">
                                  <span>Activity History</span>
                                  <span className="px-1.5 py-0.5 rounded bg-white/5 text-[10px]">{userDetails[user.id].complaints.length} Records</span>
                                </h3>
                                
                                {userDetails[user.id].complaints.length === 0 ? (
                                  <div className="text-center py-8 text-slate-500 text-sm bg-white/[0.02] rounded-2xl border border-dashed border-white/5">
                                    No complaints recorded for this user yet.
                                  </div>
                                ) : (
                                  <div className="grid gap-4">
                                    {userDetails[user.id].complaints.map((c) => (
                                      <div key={c.complaintId} className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 space-y-4">
                                        <div className="flex justify-between items-start">
                                          <div className="space-y-1">
                                            <div className="flex items-center space-x-3">
                                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                                                c.stage === 'escalate' ? 'border-rose-500/30 text-rose-400 bg-rose-500/5' :
                                                c.stage === 'draft' ? 'border-amber-500/30 text-amber-400 bg-amber-500/5' :
                                                'border-indigo-500/30 text-indigo-400 bg-indigo-500/5'
                                              }`}>
                                                {c.stage}
                                              </span>
                                              <span className="text-xs text-slate-500 font-medium">
                                                {new Date(c.createdAt).toLocaleDateString()}
                                              </span>
                                            </div>
                                            <p className="font-semibold text-slate-200">{c.summary || 'Initial Discovery'}</p>
                                          </div>
                                          <div className="flex space-x-2">
                                            {c.letterGenerated && (
                                              <div className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 text-[10px] font-bold border border-emerald-500/20 uppercase">
                                                <ShieldCheck size={10} />
                                                <span>Letter Ready</span>
                                              </div>
                                            )}
                                            {c.escalationGenerated && (
                                              <div className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-indigo-500/10 text-indigo-500 text-[10px] font-bold border border-indigo-500/20 uppercase">
                                                <Globe size={10} />
                                                <span>Escalated</span>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                        
                                        {(c.letter || c.escalationLetter) && (
                                          <div className="flex flex-wrap gap-4 pt-2">
                                            {c.letter && (
                                              <button className="text-[10px] font-bold text-slate-400 hover:text-white transition-colors flex items-center space-x-1.5 uppercase">
                                                <FileText size={12} />
                                                <span>View Base Letter</span>
                                              </button>
                                            )}
                                            {c.escalationLetter && (
                                              <button className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center space-x-1.5 uppercase">
                                                <Globe size={12} />
                                                <span>View Escalation</span>
                                              </button>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper component for React.Fragment
import React from 'react';
