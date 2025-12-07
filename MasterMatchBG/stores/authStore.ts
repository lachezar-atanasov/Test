import { create } from 'zustand';
import { User, UserRole, LoginCredentials, RegisterCredentials } from '../types';
import { authService } from '../services/auth';

// ============================================
// Auth Store State
// ============================================

interface AuthState {
  user: User | null;
  session: any | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
}

interface AuthActions {
  // Core auth actions
  initialize: () => Promise<void>;
  signUp: (credentials: RegisterCredentials) => Promise<{ success: boolean; error?: string }>;
  signIn: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  
  // Profile actions
  setUserRole: (role: UserRole) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: Partial<Pick<User, 'name' | 'phone' | 'district' | 'avatar_url'>>) => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
  
  // State actions
  setError: (error: string | null) => void;
  clearError: () => void;
}

type AuthStore = AuthState & AuthActions;

// ============================================
// Auth Store Implementation
// ============================================

export const useAuthStore = create<AuthStore>((set, get) => ({
  // Initial state
  user: null,
  session: null,
  isLoading: false,
  isInitialized: false,
  error: null,

  // Initialize auth - check for existing session
  initialize: async () => {
    set({ isLoading: true });
    
    try {
      const { session } = await authService.getSession();
      
      if (session) {
        const { user } = await authService.getCurrentUser();
        set({ user, session, isInitialized: true, isLoading: false });
      } else {
        set({ user: null, session: null, isInitialized: true, isLoading: false });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ user: null, session: null, isInitialized: true, isLoading: false });
    }
  },

  // Sign up
  signUp: async (credentials) => {
    set({ isLoading: true, error: null });
    
    try {
      const { user, error } = await authService.signUp(credentials);
      
      if (error) {
        set({ isLoading: false, error: error.message });
        return { success: false, error: error.message };
      }

      // After signup, sign in automatically
      const { session, error: signInError } = await authService.signIn({
        email: credentials.email,
        password: credentials.password,
      });

      if (signInError) {
        set({ isLoading: false, error: signInError.message });
        return { success: false, error: signInError.message };
      }

      const { user: fullUser } = await authService.getCurrentUser();
      set({ user: fullUser, session, isLoading: false });
      
      return { success: true };
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  // Sign in
  signIn: async (credentials) => {
    set({ isLoading: true, error: null });
    
    try {
      const { session, error } = await authService.signIn(credentials);
      
      if (error) {
        set({ isLoading: false, error: error.message });
        return { success: false, error: error.message };
      }

      const { user } = await authService.getCurrentUser();
      set({ user, session, isLoading: false });
      
      return { success: true };
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  // Sign out
  signOut: async () => {
    set({ isLoading: true });
    
    try {
      await authService.signOut();
      set({ user: null, session: null, isLoading: false });
    } catch (error) {
      console.error('Sign out error:', error);
      set({ user: null, session: null, isLoading: false });
    }
  },

  // Set user role (client/master)
  setUserRole: async (role) => {
    const { user } = get();
    
    if (!user) {
      return { success: false, error: 'No user logged in' };
    }

    set({ isLoading: true, error: null });
    
    try {
      const { user: updatedUser, error } = await authService.updateUserRole(user.id, role);
      
      if (error) {
        set({ isLoading: false, error: error.message });
        return { success: false, error: error.message };
      }

      set({ user: updatedUser, isLoading: false });
      return { success: true };
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  // Update profile
  updateProfile: async (updates) => {
    const { user } = get();
    
    if (!user) {
      return { success: false, error: 'No user logged in' };
    }

    set({ isLoading: true, error: null });
    
    try {
      const { user: updatedUser, error } = await authService.updateProfile(user.id, updates);
      
      if (error) {
        set({ isLoading: false, error: error.message });
        return { success: false, error: error.message };
      }

      set({ user: updatedUser, isLoading: false });
      return { success: true };
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  // Refresh user data
  refreshUser: async () => {
    try {
      const { user } = await authService.getCurrentUser();
      if (user) {
        set({ user });
      }
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  },

  // Error handling
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));

// Selector hooks for convenience
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => !!state.session);
export const useUserRole = () => useAuthStore((state) => state.user?.role);
export const useIsClient = () => useAuthStore((state) => state.user?.role === 'client');
export const useIsMaster = () => useAuthStore((state) => state.user?.role === 'master');

export default useAuthStore;
