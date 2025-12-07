// Database types matching Supabase schema

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
  created_at: string;
  updated_at: string;
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
}

export interface PushToken {
  id: string;
  user_id: string;
  token: string;
  device_type: 'ios' | 'android' | 'web';
  created_at: string;
  updated_at: string;
}

// Extended types with relations
export interface BillPaymentWithRelations extends BillPayment {
  category?: BillCategory;
  bill_account?: BillAccount;
  recurring_bill?: RecurringBill;
}

export interface RecurringBillWithRelations extends RecurringBill {
  category?: BillCategory;
  bill_account?: BillAccount;
  payments?: BillPayment[];
}

export interface BillAccountWithRelations extends BillAccount {
  category?: BillCategory;
  recurring_bills?: RecurringBill[];
}

// Form types for creating/updating
export interface CreateBillAccountInput {
  category_id: string;
  name: string;
  provider_name: string;
  account_number?: string;
  billing_website?: string;
  payment_method_hint?: string;
}

export interface CreateRecurringBillInput {
  bill_account_id: string;
  category_id: string;
  title: string;
  expected_amount?: number;
  currency?: string;
  recurrence_type: RecurrenceType;
  due_day_of_month?: number;
  custom_cron?: string;
  reminder_days_before?: number;
  notes?: string;
}

export interface CreateBillPaymentInput {
  recurring_bill_id?: string;
  bill_account_id: string;
  category_id: string;
  title: string;
  amount: number;
  currency?: string;
  due_date: string;
  notes?: string;
}

export interface UpdateBillPaymentInput {
  amount?: number;
  due_date?: string;
  is_paid?: boolean;
  paid_date?: string;
  notes?: string;
  attachment_url?: string;
}
