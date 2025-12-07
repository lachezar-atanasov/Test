export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type RecurrenceType = 'monthly' | 'bi_monthly' | 'quarterly' | 'yearly' | 'custom';

export interface Profile {
  id: string;
  created_at: string;
  preferred_language: string;
  payday: number | null;
  default_reminder_days_before: number;
  currency: string;
}

export interface BillCategory {
  id: string;
  user_id: string | null;
  name: string;
  icon: string;
  color: string;
  is_default: boolean;
  created_at?: string;
}

export interface BillAccount {
  id: string;
  user_id: string;
  category_id: string;
  name: string;
  provider_name: string;
  account_number: string | null;
  billing_website: string | null;
  payment_method_hint: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface RecurringBill {
  id: string;
  user_id: string;
  bill_account_id: string;
  category_id: string;
  title: string;
  expected_amount: number | null;
  currency: string;
  recurrence_type: RecurrenceType;
  due_day_of_month: number | null;
  custom_cron: string | null;
  is_active: boolean;
  reminder_days_before: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface BillPayment {
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
}

export interface NotificationSettings {
  id: string;
  user_id: string;
  enable_push: boolean;
  days_before: number[];
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
  created_at?: string;
  updated_at?: string;
}
