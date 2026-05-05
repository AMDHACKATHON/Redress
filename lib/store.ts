import { create } from 'zustand';
import { User, Complaint, ComplaintDetail } from '@/types';

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  complaints: Complaint[];
  activeComplaint: ComplaintDetail | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setComplaints: (complaints: Complaint[]) => void;
  setActiveComplaint: (complaint: ComplaintDetail | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useStore = create<AppState>((set) => ({
  // State
  user: null,
  isAuthenticated: false,
  complaints: [],
  activeComplaint: null,
  isLoading: false,

  // Actions
  setUser: (user) => 
    set({ 
      user, 
      isAuthenticated: !!user 
    }),

  setComplaints: (complaints) => 
    set({ complaints }),

  setActiveComplaint: (activeComplaint) => 
    set({ activeComplaint }),

  setLoading: (isLoading) => 
    set({ isLoading }),

  logout: () => {
    localStorage.removeItem('redress_access_token');
    localStorage.removeItem('redress_refresh_token');
    set({ 
      user: null, 
      isAuthenticated: false, 
      complaints: [], 
      activeComplaint: null 
    });
  },
}));
