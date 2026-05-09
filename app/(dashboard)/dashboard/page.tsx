'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, ChevronRight, FileText, Trash2, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { Complaint, Stage } from '@/types';
import { toast } from 'react-hot-toast';
import { useStore } from '@/lib/store';

export default function ComplaintsPage() {
  const router = useRouter();
  const { complaints, setComplaints, isLoading, setLoading } = useStore();
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const response = await api.get<Complaint[]>('complaints');
      setComplaints(response.data);
    } catch (error) {
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const startNewComplaint = async () => {
    setCreating(true);
    try {
      const response = await api.post<Complaint>('complaints/start', {
        summary: "New Complaint - Getting Started"
      });
      const newComplaint = response.data;
      setComplaints([newComplaint, ...complaints]);
      router.push(`/dashboard/complaint/${newComplaint._id}`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to start new complaint');
    } finally {
      setCreating(false);
    }
  };

  const deleteComplaint = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this complaint?')) return;

    setDeletingId(id);
    try {
      await api.delete(`complaints/${id}`);
      setComplaints(complaints.filter(c => c._id !== id));
      toast.success('Complaint deleted');
    } catch (error) {
      toast.error('Failed to delete complaint');
    } finally {
      setDeletingId(null);
    }
  };

  const getStageStyles = (stage: Stage) => {
    switch (stage) {
      case 'understand':
        return 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800';
      case 'draft':
        return 'bg-yellow-50 text-yellow-700 border-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800';
      case 'escalate':
        return 'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
    }
  };

  if (isLoading && complaints.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
          <div className="h-10 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Your Complaints</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Track and manage your active resolutions</p>
        </div>
        <button
          onClick={startNewComplaint}
          disabled={creating}
          className="flex items-center space-x-2 bg-black dark:bg-white dark:text-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50"
        >
          {creating ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <Plus size={18} />
          )}
          <span>New Complaint</span>
        </button>
      </div>

      {complaints.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl p-12 text-center space-y-4">
          <div className="bg-gray-50 dark:bg-gray-800 h-16 w-16 rounded-full flex items-center justify-center mx-auto text-gray-400">
            <FileText size={32} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No complaints yet</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto text-sm">
              Start your first complaint and let our AI help you resolve it.
            </p>
          </div>
          <button
            onClick={startNewComplaint}
            className="text-black dark:text-white font-medium text-sm hover:underline"
          >
            Start a complaint &rarr;
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {complaints.map((complaint) => (
            <div
              key={complaint._id}
              className="group bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-sm transition-all cursor-pointer flex items-center justify-between"
              onClick={() => router.push(`/dashboard/complaint/${complaint._id}`)}
            >
              <div className="space-y-3 flex-1 mr-4">
                <div className="flex items-center space-x-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStageStyles(complaint.stage)}`}>
                    {complaint.stage.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(complaint.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-gray-900 dark:text-white font-medium line-clamp-1">
                  {complaint.summary || 'Initial Investigation'}
                </h3>
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={(e) => deleteComplaint(e, complaint._id)}
                  disabled={deletingId === complaint._id}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                >
                  {deletingId === complaint._id ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Trash2 size={18} />
                  )}
                </button>
                <button className="flex items-center space-x-1 text-sm font-medium text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors">
                  <span>View</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
