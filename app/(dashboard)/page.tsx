'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, ChevronRight, FileText } from 'lucide-react';
import api from '@/lib/api';
import { Complaint, Stage } from '@/types';
import { toast } from 'react-hot-toast';

export default function ComplaintsPage() {
  const router = useRouter();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await api.get<Complaint[]>('/complaints');
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
      const response = await api.post<{ complaint_id: string }>('/complaints/start');
      router.push(`/complaint/${response.complaint_id}`);
    } catch (error) {
      toast.error('Failed to start new complaint');
      setCreating(false);
    }
  };

  const getStageStyles = (stage: Stage) => {
    switch (stage) {
      case 'understand':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'draft':
        return 'bg-yellow-50 text-yellow-700 border-yellow-100';
      case 'escalate':
        return 'bg-red-50 text-red-700 border-red-100';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-white border border-gray-100 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Complaints</h1>
          <p className="text-gray-500 text-sm">Track and manage your active resolutions</p>
        </div>
        <button
          onClick={startNewComplaint}
          disabled={creating}
          className="flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-all disabled:opacity-50"
        >
          {creating ? (
            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <Plus size={18} />
          )}
          <span>New Complaint</span>
        </button>
      </div>

      {complaints.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-12 text-center space-y-4">
          <div className="bg-gray-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto text-gray-400">
            <FileText size={32} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">No complaints yet</h3>
            <p className="text-gray-500 max-w-xs mx-auto text-sm">
              Start your first complaint and let our AI help you resolve it.
            </p>
          </div>
          <button
            onClick={startNewComplaint}
            className="text-black font-medium text-sm hover:underline"
          >
            Start a complaint &rarr;
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {complaints.map((complaint) => (
            <div
              key={complaint.complaint_id}
              className="group bg-white border border-gray-100 rounded-xl p-5 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer flex items-center justify-between"
              onClick={() => router.push(`/complaint/${complaint.complaint_id}`)}
            >
              <div className="space-y-3 flex-1 mr-4">
                <div className="flex items-center space-x-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStageStyles(complaint.stage)}`}>
                    {complaint.stage.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(complaint.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-gray-900 font-medium line-clamp-1">
                  {complaint.summary || 'Initial Investigation'}
                </h3>
              </div>
              
              <button className="flex items-center space-x-1 text-sm font-medium text-gray-400 group-hover:text-black transition-colors">
                <span>View</span>
                <ChevronRight size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
