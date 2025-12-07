import { supabase } from './supabase';
import {
  BillPayment,
  RecurringBill,
  BillAccount,
  BillCategory,
  Profile,
  NotificationSettings,
} from '../types/database';
import { generateBillInstances } from '../domain/recurrence/generator';

// Profile API
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateProfile(
  userId: string,
  updates: Partial<Profile>
): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Categories API
export async function getCategories(userId?: string): Promise<BillCategory[]> {
  const query = supabase.from('bill_categories').select('*');

  if (userId) {
    query.or(`user_id.eq.${userId},is_default.eq.true,user_id.is.null`);
  } else {
    query.or('is_default.eq.true,user_id.is.null');
  }

  const { data, error } = await query.order('is_default', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createCategory(
  category: Omit<BillCategory, 'id' | 'created_at'>
): Promise<BillCategory> {
  const { data, error } = await supabase
    .from('bill_categories')
    .insert(category)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Bill Accounts API
export async function getBillAccounts(userId: string): Promise<BillAccount[]> {
  const { data, error } = await supabase
    .from('bill_accounts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createBillAccount(
  account: Omit<BillAccount, 'id' | 'created_at' | 'updated_at'>
): Promise<BillAccount> {
  const { data, error } = await supabase
    .from('bill_accounts')
    .insert(account)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateBillAccount(
  accountId: string,
  updates: Partial<BillAccount>
): Promise<BillAccount> {
  const { data, error } = await supabase
    .from('bill_accounts')
    .update(updates)
    .eq('id', accountId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteBillAccount(accountId: string): Promise<void> {
  const { error } = await supabase.from('bill_accounts').delete().eq('id', accountId);
  if (error) throw error;
}

// Recurring Bills API
export async function getRecurringBills(userId: string): Promise<RecurringBill[]> {
  const { data, error } = await supabase
    .from('recurring_bills')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createRecurringBill(
  bill: Omit<RecurringBill, 'id' | 'created_at' | 'updated_at'>
): Promise<RecurringBill> {
  const { data: recurringBill, error: billError } = await supabase
    .from('recurring_bills')
    .insert(bill)
    .select()
    .single();

  if (billError) throw billError;

  // Generate bill payment instances for the next 3 months
  if (recurringBill.due_day_of_month && recurringBill.is_active) {
    const instances = generateBillInstances(
      recurringBill.recurrence_type,
      recurringBill.due_day_of_month,
      recurringBill.expected_amount,
      new Date(),
      3
    );

    const payments: Omit<BillPayment, 'id' | 'created_at' | 'updated_at'>[] = instances.map(
      (instance) => ({
        user_id: bill.user_id,
        recurring_bill_id: recurringBill.id,
        bill_account_id: bill.bill_account_id,
        category_id: bill.category_id,
        title: bill.title,
        amount: instance.expectedAmount || 0,
        currency: bill.currency,
        due_date: instance.dueDate.toISOString().split('T')[0],
        is_paid: false,
        paid_date: null,
        is_overdue: false,
        attachment_url: null,
        notes: null,
      })
    );

    if (payments.length > 0) {
      const { error: paymentsError } = await supabase.from('bill_payments').insert(payments);
      if (paymentsError) {
        console.error('Error creating bill payments:', paymentsError);
        // Don't throw - the recurring bill was created successfully
      }
    }
  }

  return recurringBill;
}

export async function updateRecurringBill(
  billId: string,
  updates: Partial<RecurringBill>
): Promise<RecurringBill> {
  const { data, error } = await supabase
    .from('recurring_bills')
    .update(updates)
    .eq('id', billId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteRecurringBill(billId: string): Promise<void> {
  const { error } = await supabase.from('recurring_bills').delete().eq('id', billId);
  if (error) throw error;
}

// Bill Payments API
export async function getBillPayments(
  userId: string,
  filters?: {
    isPaid?: boolean;
    isOverdue?: boolean;
    startDate?: string;
    endDate?: string;
  }
): Promise<BillPayment[]> {
  let query = supabase
    .from('bill_payments')
    .select('*')
    .eq('user_id', userId)
    .order('due_date', { ascending: true });

  if (filters?.isPaid !== undefined) {
    query = query.eq('is_paid', filters.isPaid);
  }

  if (filters?.isOverdue !== undefined) {
    query = query.eq('is_overdue', filters.isOverdue);
  }

  if (filters?.startDate) {
    query = query.gte('due_date', filters.startDate);
  }

  if (filters?.endDate) {
    query = query.lte('due_date', filters.endDate);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

export async function createBillPayment(
  payment: Omit<BillPayment, 'id' | 'created_at' | 'updated_at'>
): Promise<BillPayment> {
  const { data, error } = await supabase
    .from('bill_payments')
    .insert(payment)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateBillPayment(
  paymentId: string,
  updates: Partial<BillPayment>
): Promise<BillPayment> {
  // Update is_overdue based on due_date and is_paid
  if (updates.is_paid !== undefined || updates.due_date !== undefined) {
    const dueDate = updates.due_date
      ? new Date(updates.due_date)
      : await supabase
          .from('bill_payments')
          .select('due_date')
          .eq('id', paymentId)
          .single()
          .then(({ data }) => (data ? new Date(data.due_date) : new Date()));

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);

    updates.is_overdue = !updates.is_paid && dueDate < today;
  }

  const { data, error } = await supabase
    .from('bill_payments')
    .update(updates)
    .eq('id', paymentId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteBillPayment(paymentId: string): Promise<void> {
  const { error } = await supabase.from('bill_payments').delete().eq('id', paymentId);
  if (error) throw error;
}

// Notification Settings API
export async function getNotificationSettings(
  userId: string
): Promise<NotificationSettings | null> {
  const { data, error } = await supabase
    .from('notification_settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
  return data || null;
}

export async function upsertNotificationSettings(
  userId: string,
  settings: Omit<NotificationSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<NotificationSettings> {
  const { data, error } = await supabase
    .from('notification_settings')
    .upsert(
      {
        user_id: userId,
        ...settings,
      },
      { onConflict: 'user_id' }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}
