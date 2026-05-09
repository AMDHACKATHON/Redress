import { create } from 'zustand';
import { User, Complaint, Message, Letter, EscalationLetter } from '@/types';

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  complaints: Complaint[];
  activeComplaint: Complaint | null;
  messages: Message[];
  letter: Letter | null;
  escalationLetter: EscalationLetter | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setComplaints: (complaints: Complaint[]) => void;
  setActiveComplaint: (complaint: Complaint | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  setLetter: (letter: Letter | null) => void;
  setEscalationLetter: (letter: EscalationLetter | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useStore = create<AppState>((set) => ({
  // State
  user: null,
  isAuthenticated: false,
  complaints: [],
  activeComplaint: null,
  messages: [],
  letter: null,
  escalationLetter: null,
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

  setMessages: (messages) => 
    set({ messages }),

  addMessage: (message) => 
    set((state) => ({ messages: [...state.messages, message] })),

  setLetter: (letter) => 
    set({ letter }),

  setEscalationLetter: (escalationLetter) => 
    set({ escalationLetter }),

  setLoading: (isLoading) => 
    set({ isLoading }),

  logout: () => {
    set({ 
      user: null, 
      isAuthenticated: false, 
      complaints: [], 
      activeComplaint: null,
      messages: [],
      letter: null,
      escalationLetter: null
    });
  },
}));
