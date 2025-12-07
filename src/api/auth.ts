import { supabase } from './supabase';
import type { Profile } from '../types/database';

export interface AuthError {
  message: string;
  code?: string;
}

export interface AuthResponse {
  success: boolean;
  error?: AuthError;
  userId?: string;
}

/**
 * Sign up a new user with email and password
 */
export async function signUp(email: string, password: string): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return {
        success: false,
        error: { message: error.message, code: error.code },
      };
    }

    // Create initial profile
    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        preferred_language: 'bg',
        default_reminder_days_before: 3,
        currency: 'BGN',
      });

      if (profileError) {
        console.error('Error creating profile:', profileError);
      }

      // Create default notification settings
      const { error: notifError } = await supabase.from('notification_settings').insert({
        user_id: data.user.id,
        enable_push: true,
        days_before: [3, 0],
      });

      if (notifError) {
        console.error('Error creating notification settings:', notifError);
      }
    }

    return {
      success: true,
      userId: data.user?.id,
    };
  } catch (e) {
    return {
      success: false,
      error: { message: 'An unexpected error occurred' },
    };
  }
}

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return {
        success: false,
        error: { message: error.message, code: error.code },
      };
    }

    return {
      success: true,
      userId: data.user?.id,
    };
  } catch (e) {
    return {
      success: false,
      error: { message: 'An unexpected error occurred' },
    };
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<AuthResponse> {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return {
        success: false,
        error: { message: error.message },
      };
    }

    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: { message: 'An unexpected error occurred' },
    };
  }
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<AuthResponse> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      return {
        success: false,
        error: { message: error.message },
      };
    }

    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: { message: 'An unexpected error occurred' },
    };
  }
}

/**
 * Get the current user's session
 */
export async function getCurrentSession() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error) {
    console.error('Error getting session:', error);
    return null;
  }
  return session;
}

/**
 * Get the current user
 */
export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) {
    console.error('Error getting user:', error);
    return null;
  }
  return user;
}

/**
 * Get user profile
 */
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error getting profile:', error);
    return null;
  }

  return data;
}

/**
 * Update user profile
 */
export async function updateProfile(
  userId: string,
  updates: Partial<Omit<Profile, 'id' | 'created_at'>>
): Promise<{ success: boolean; error?: AuthError }> {
  const { error } = await supabase.from('profiles').update(updates).eq('id', userId);

  if (error) {
    return {
      success: false,
      error: { message: error.message },
    };
  }

  return { success: true };
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(
  callback: (event: string, session: unknown) => void
) {
  return supabase.auth.onAuthStateChange(callback);
}
