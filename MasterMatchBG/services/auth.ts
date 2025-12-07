import { supabase } from './supabase';
import { User, UserRole, LoginCredentials, RegisterCredentials } from '../types';

// ============================================
// Authentication Service
// ============================================

export const authService = {
  /**
   * Sign up a new user with email and password
   */
  async signUp(credentials: RegisterCredentials): Promise<{ user: any; error: any }> {
    const { email, password, name, phone } = credentials;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          phone,
        },
      },
    });

    if (error) {
      return { user: null, error };
    }

    // Create user profile in users table
    if (data.user) {
      const { error: profileError } = await supabase.from('users').insert({
        id: data.user.id,
        email: data.user.email,
        name,
        phone,
        city: 'Sofia',
        role: null, // Will be set during role selection
      });

      if (profileError) {
        console.error('Error creating user profile:', profileError);
      }
    }

    return { user: data.user, error: null };
  },

  /**
   * Sign in with email and password
   */
  async signIn(credentials: LoginCredentials): Promise<{ user: any; session: any; error: any }> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    return {
      user: data?.user || null,
      session: data?.session || null,
      error,
    };
  },

  /**
   * Sign out the current user
   */
  async signOut(): Promise<{ error: any }> {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  /**
   * Get the current session
   */
  async getSession(): Promise<{ session: any; error: any }> {
    const { data, error } = await supabase.auth.getSession();
    return { session: data?.session || null, error };
  },

  /**
   * Get the current user from the database
   */
  async getCurrentUser(): Promise<{ user: User | null; error: any }> {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authData.user) {
      return { user: null, error: authError };
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    return { user: userData, error: userError };
  },

  /**
   * Update user role (client or master)
   */
  async updateUserRole(userId: string, role: UserRole): Promise<{ user: User | null; error: any }> {
    const { data, error } = await supabase
      .from('users')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    return { user: data, error };
  },

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    updates: Partial<Pick<User, 'name' | 'phone' | 'district' | 'avatar_url'>>
  ): Promise<{ user: User | null; error: any }> {
    const { data, error } = await supabase
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    return { user: data, error };
  },

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },

  /**
   * Reset password
   */
  async resetPassword(email: string): Promise<{ error: any }> {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return { error };
  },
};

export default authService;
