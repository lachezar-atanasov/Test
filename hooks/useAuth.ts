import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { User, UserRole, MasterProfile } from '@/types';
import { Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  masterProfile: MasterProfile | null;
  session: Session | null;
  isLoading: boolean;
  isInitialized: boolean;
  
  // Actions
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string, role: UserRole, phone?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<{ error: Error | null }>;
  refreshUser: () => Promise<void>;
  setMasterProfile: (profile: MasterProfile | null) => void;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  masterProfile: null,
  session: null,
  isLoading: false,
  isInitialized: false,

  initialize: async () => {
    try {
      set({ isLoading: true });
      
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Fetch user profile from our users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (userData && !userError) {
          set({ user: userData as User, session });
          
          // If master, fetch master profile
          if (userData.role === 'master') {
            const { data: masterData } = await supabase
              .from('master_profiles')
              .select('*')
              .eq('user_id', session.user.id)
              .single();
            
            if (masterData) {
              set({ masterProfile: masterData as MasterProfile });
            }
          }
        }
      }
      
      set({ isInitialized: true, isLoading: false });
      
      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_OUT') {
          set({ user: null, session: null, masterProfile: null });
        } else if (session?.user) {
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (userData) {
            set({ user: userData as User, session });
            
            if (userData.role === 'master') {
              const { data: masterData } = await supabase
                .from('master_profiles')
                .select('*')
                .eq('user_id', session.user.id)
                .single();
              
              if (masterData) {
                set({ masterProfile: masterData as MasterProfile });
              }
            }
          }
        }
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ isInitialized: true, isLoading: false });
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      set({ isLoading: true });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();
        
        if (userError) throw userError;
        
        set({ user: userData as User, session: data.session });
        
        // If master, fetch master profile
        if (userData.role === 'master') {
          const { data: masterData } = await supabase
            .from('master_profiles')
            .select('*')
            .eq('user_id', data.user.id)
            .single();
          
          if (masterData) {
            set({ masterProfile: masterData as MasterProfile });
          }
        }
      }
      
      set({ isLoading: false });
      return { error: null };
    } catch (error) {
      set({ isLoading: false });
      return { error: error as Error };
    }
  },

  signUp: async (email: string, password: string, fullName: string, role: UserRole, phone?: string) => {
    try {
      set({ isLoading: true });
      
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (authError) throw authError;
      if (!authData.user) throw new Error('User creation failed');
      
      // Create user profile in our users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email,
          full_name: fullName,
          phone,
          role,
        })
        .select()
        .single();
      
      if (userError) throw userError;
      
      set({ user: userData as User, session: authData.session });
      
      // If master, create empty master profile
      if (role === 'master') {
        const { data: masterData, error: masterError } = await supabase
          .from('master_profiles')
          .insert({
            user_id: authData.user.id,
            services: [],
            districts: [],
            is_available: true,
            average_rating: 0,
            total_reviews: 0,
          })
          .select()
          .single();
        
        if (!masterError && masterData) {
          set({ masterProfile: masterData as MasterProfile });
        }
      }
      
      set({ isLoading: false });
      return { error: null };
    } catch (error) {
      set({ isLoading: false });
      return { error: error as Error };
    }
  },

  signOut: async () => {
    try {
      set({ isLoading: true });
      await supabase.auth.signOut();
      set({ user: null, session: null, masterProfile: null, isLoading: false });
    } catch (error) {
      console.error('Sign out error:', error);
      set({ isLoading: false });
    }
  },

  updateProfile: async (updates: Partial<User>) => {
    try {
      const { user } = get();
      if (!user) throw new Error('No user logged in');
      
      set({ isLoading: true });
      
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      
      set({ user: data as User, isLoading: false });
      return { error: null };
    } catch (error) {
      set({ isLoading: false });
      return { error: error as Error };
    }
  },

  refreshUser: async () => {
    const { user } = get();
    if (!user) return;
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (!error && data) {
      set({ user: data as User });
    }
  },

  setMasterProfile: (profile: MasterProfile | null) => {
    set({ masterProfile: profile });
  },
}));
