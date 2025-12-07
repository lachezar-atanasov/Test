import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User, Session } from '@supabase/supabase-js';
import type { Profile } from '../types/database';
import * as authApi from '../api/auth';

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isInitialized: boolean;
  hasCompletedOnboarding: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  setHasCompletedOnboarding: (completed: boolean) => void;

  // Async actions
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  loadProfile: () => Promise<void>;
  updateProfile: (updates: Partial<Omit<Profile, 'id' | 'created_at'>>) => Promise<boolean>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      profile: null,
      isLoading: false,
      isInitialized: false,
      hasCompletedOnboarding: false,

      setUser: user => set({ user }),
      setSession: session => set({ session }),
      setProfile: profile => set({ profile }),
      setLoading: isLoading => set({ isLoading }),
      setInitialized: isInitialized => set({ isInitialized }),
      setHasCompletedOnboarding: hasCompletedOnboarding => set({ hasCompletedOnboarding }),

      signIn: async (email, password) => {
        set({ isLoading: true });
        const result = await authApi.signIn(email, password);
        
        if (result.success) {
          const user = await authApi.getCurrentUser();
          set({ user });
          
          if (user) {
            const profile = await authApi.getProfile(user.id);
            set({ profile });
          }
        }
        
        set({ isLoading: false });
        return {
          success: result.success,
          error: result.error?.message,
        };
      },

      signUp: async (email, password) => {
        set({ isLoading: true });
        const result = await authApi.signUp(email, password);
        
        if (result.success && result.userId) {
          const user = await authApi.getCurrentUser();
          set({ user, hasCompletedOnboarding: false });
          
          if (user) {
            const profile = await authApi.getProfile(user.id);
            set({ profile });
          }
        }
        
        set({ isLoading: false });
        return {
          success: result.success,
          error: result.error?.message,
        };
      },

      signOut: async () => {
        set({ isLoading: true });
        await authApi.signOut();
        set({
          user: null,
          session: null,
          profile: null,
          isLoading: false,
        });
      },

      resetPassword: async email => {
        set({ isLoading: true });
        const result = await authApi.resetPassword(email);
        set({ isLoading: false });
        return {
          success: result.success,
          error: result.error?.message,
        };
      },

      loadProfile: async () => {
        const { user } = get();
        if (!user) return;

        const profile = await authApi.getProfile(user.id);
        set({ profile });
      },

      updateProfile: async updates => {
        const { user } = get();
        if (!user) return false;

        const result = await authApi.updateProfile(user.id, updates);
        if (result.success) {
          const profile = await authApi.getProfile(user.id);
          set({ profile });
        }
        return result.success;
      },

      initialize: async () => {
        set({ isLoading: true });
        
        const session = await authApi.getCurrentSession();
        const user = await authApi.getCurrentUser();
        
        set({ session, user });
        
        if (user) {
          const profile = await authApi.getProfile(user.id);
          set({ profile });
        }
        
        set({ isLoading: false, isInitialized: true });
      },
    }),
    {
      name: 'bg-bills-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        hasCompletedOnboarding: state.hasCompletedOnboarding,
      }),
    }
  )
);
