import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Environment variables (should be set in .env or app config)
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

// Custom storage adapter for secure token storage
const ExpoSecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      return AsyncStorage.getItem(key);
    }
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      // Fallback to AsyncStorage if SecureStore fails
      return AsyncStorage.getItem(key);
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem(key, value);
      return;
    }
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      // Fallback to AsyncStorage if SecureStore fails
      await AsyncStorage.setItem(key, value);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    if (Platform.OS === 'web') {
      await AsyncStorage.removeItem(key);
      return;
    }
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      // Fallback to AsyncStorage if SecureStore fails
      await AsyncStorage.removeItem(key);
    }
  },
};

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Helper to check if Supabase is configured
export function isSupabaseConfigured(): boolean {
  return (
    SUPABASE_URL !== 'https://your-project.supabase.co' && SUPABASE_ANON_KEY !== 'your-anon-key'
  );
}

// Database types for Supabase
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          created_at: string;
          preferred_language: string;
          payday: number | null;
          default_reminder_days_before: number;
          currency: string;
        };
        Insert: {
          id: string;
          created_at?: string;
          preferred_language?: string;
          payday?: number | null;
          default_reminder_days_before?: number;
          currency?: string;
        };
        Update: {
          preferred_language?: string;
          payday?: number | null;
          default_reminder_days_before?: number;
          currency?: string;
        };
      };
      bill_categories: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          icon: string;
          color: string;
          is_default: boolean;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          icon: string;
          color: string;
          is_default?: boolean;
        };
        Update: {
          name?: string;
          icon?: string;
          color?: string;
        };
      };
      bill_accounts: {
        Row: {
          id: string;
          user_id: string;
          category_id: string;
          name: string;
          provider_name: string;
          account_number: string | null;
          billing_website: string | null;
          payment_method_hint: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category_id: string;
          name: string;
          provider_name: string;
          account_number?: string | null;
          billing_website?: string | null;
          payment_method_hint?: string | null;
        };
        Update: {
          category_id?: string;
          name?: string;
          provider_name?: string;
          account_number?: string | null;
          billing_website?: string | null;
          payment_method_hint?: string | null;
        };
      };
      recurring_bills: {
        Row: {
          id: string;
          user_id: string;
          bill_account_id: string;
          category_id: string;
          title: string;
          expected_amount: number | null;
          currency: string;
          recurrence_type: string;
          due_day_of_month: number | null;
          custom_cron: string | null;
          is_active: boolean;
          reminder_days_before: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          bill_account_id: string;
          category_id: string;
          title: string;
          expected_amount?: number | null;
          currency?: string;
          recurrence_type: string;
          due_day_of_month?: number | null;
          custom_cron?: string | null;
          is_active?: boolean;
          reminder_days_before?: number | null;
          notes?: string | null;
        };
        Update: {
          bill_account_id?: string;
          category_id?: string;
          title?: string;
          expected_amount?: number | null;
          currency?: string;
          recurrence_type?: string;
          due_day_of_month?: number | null;
          custom_cron?: string | null;
          is_active?: boolean;
          reminder_days_before?: number | null;
          notes?: string | null;
        };
      };
      bill_payments: {
        Row: {
          id: string;
          user_id: string;
          recurring_bill_id: string | null;
          bill_account_id: string;
          category_id: string;
          title: string;
          amount: number;
          currency: string;
          due_date: string;
          is_paid: boolean;
          paid_date: string | null;
          is_overdue: boolean;
          attachment_url: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          recurring_bill_id?: string | null;
          bill_account_id: string;
          category_id: string;
          title: string;
          amount: number;
          currency?: string;
          due_date: string;
          is_paid?: boolean;
          paid_date?: string | null;
          is_overdue?: boolean;
          attachment_url?: string | null;
          notes?: string | null;
        };
        Update: {
          amount?: number;
          due_date?: string;
          is_paid?: boolean;
          paid_date?: string | null;
          is_overdue?: boolean;
          attachment_url?: string | null;
          notes?: string | null;
        };
      };
      notification_settings: {
        Row: {
          id: string;
          user_id: string;
          enable_push: boolean;
          days_before: number[];
          quiet_hours_start: string | null;
          quiet_hours_end: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          enable_push?: boolean;
          days_before?: number[];
          quiet_hours_start?: string | null;
          quiet_hours_end?: string | null;
        };
        Update: {
          enable_push?: boolean;
          days_before?: number[];
          quiet_hours_start?: string | null;
          quiet_hours_end?: string | null;
        };
      };
      push_tokens: {
        Row: {
          id: string;
          user_id: string;
          token: string;
          device_type: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          token: string;
          device_type: string;
        };
        Update: {
          token?: string;
          device_type?: string;
        };
      };
    };
  };
}
