import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthStore {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: false,
  initialized: false,

  signIn: async (email: string, password: string) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      set({ user: data.user });
    } finally {
      set({ loading: false });
    }
  },

  signUp: async (email: string, password: string) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      set({ user: data.user });
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    set({ loading: true });
    try {
      await supabase.auth.signOut();
      set({ user: null });
    } finally {
      set({ loading: false });
    }
  },

  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  setInitialized: (initialized) => set({ initialized }),
}));

supabase.auth.onAuthStateChange((_event, session) => {
  useAuthStore.setState({
    user: session?.user || null,
    initialized: true,
  });
});



/*import { create } from 'zustand';

interface AuthState {
  user: any;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  // We initialize the app with a fake admin user already "logged in"
  user: { 
    id: 'demo-user-123', 
    email: 'admin@rear.com', 
    role: 'admin' 
  }, 
  loading: false,

  signIn: async (email, password) => {
    set({ loading: true });
    // Simulate a network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    set({ 
      user: { id: 'demo-user-123', email, role: 'admin' }, 
      loading: false 
    });
  },

  signOut: async () => {
    set({ user: null });
  },
}));*/