import { supabase } from './supabase';
import type {
  BillCategory,
  BillAccount,
  RecurringBill,
  BillPayment,
  CreateBillAccountInput,
  CreateRecurringBillInput,
  CreateBillPaymentInput,
  UpdateBillPaymentInput,
  BillPaymentWithRelations,
  RecurringBillWithRelations,
} from '../types/database';

// ============ CATEGORIES ============

/**
 * Get all categories (default + user custom)
 */
export async function getCategories(userId?: string): Promise<BillCategory[]> {
  let query = supabase.from('bill_categories').select('*');

  if (userId) {
    query = query.or(`is_default.eq.true,user_id.eq.${userId}`);
  } else {
    query = query.eq('is_default', true);
  }

  const { data, error } = await query.order('name');

  if (error) {
    console.error('Error getting categories:', error);
    return [];
  }

  return data || [];
}

/**
 * Create a custom category
 */
export async function createCategory(
  userId: string,
  category: Omit<BillCategory, 'id' | 'user_id' | 'is_default'>
): Promise<BillCategory | null> {
  const { data, error } = await supabase
    .from('bill_categories')
    .insert({
      ...category,
      user_id: userId,
      is_default: false,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating category:', error);
    return null;
  }

  return data;
}

// ============ BILL ACCOUNTS ============

/**
 * Get all bill accounts for a user
 */
export async function getBillAccounts(userId: string): Promise<BillAccount[]> {
  const { data, error } = await supabase
    .from('bill_accounts')
    .select('*, category:bill_categories(*)')
    .eq('user_id', userId)
    .order('name');

  if (error) {
    console.error('Error getting bill accounts:', error);
    return [];
  }

  return data || [];
}

/**
 * Get a single bill account
 */
export async function getBillAccount(accountId: string): Promise<BillAccount | null> {
  const { data, error } = await supabase
    .from('bill_accounts')
    .select('*, category:bill_categories(*)')
    .eq('id', accountId)
    .single();

  if (error) {
    console.error('Error getting bill account:', error);
    return null;
  }

  return data;
}

/**
 * Create a bill account
 */
export async function createBillAccount(
  userId: string,
  account: CreateBillAccountInput
): Promise<BillAccount | null> {
  const { data, error } = await supabase
    .from('bill_accounts')
    .insert({
      ...account,
      user_id: userId,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating bill account:', error);
    return null;
  }

  return data;
}

/**
 * Update a bill account
 */
export async function updateBillAccount(
  accountId: string,
  updates: Partial<CreateBillAccountInput>
): Promise<boolean> {
  const { error } = await supabase
    .from('bill_accounts')
    .update(updates)
    .eq('id', accountId);

  if (error) {
    console.error('Error updating bill account:', error);
    return false;
  }

  return true;
}

/**
 * Delete a bill account
 */
export async function deleteBillAccount(accountId: string): Promise<boolean> {
  const { error } = await supabase.from('bill_accounts').delete().eq('id', accountId);

  if (error) {
    console.error('Error deleting bill account:', error);
    return false;
  }

  return true;
}

// ============ RECURRING BILLS ============

/**
 * Get all recurring bills for a user
 */
export async function getRecurringBills(userId: string): Promise<RecurringBillWithRelations[]> {
  const { data, error } = await supabase
    .from('recurring_bills')
    .select('*, category:bill_categories(*), bill_account:bill_accounts(*)')
    .eq('user_id', userId)
    .order('title');

  if (error) {
    console.error('Error getting recurring bills:', error);
    return [];
  }

  return data || [];
}

/**
 * Get a single recurring bill
 */
export async function getRecurringBill(billId: string): Promise<RecurringBillWithRelations | null> {
  const { data, error } = await supabase
    .from('recurring_bills')
    .select('*, category:bill_categories(*), bill_account:bill_accounts(*)')
    .eq('id', billId)
    .single();

  if (error) {
    console.error('Error getting recurring bill:', error);
    return null;
  }

  return data;
}

/**
 * Create a recurring bill
 */
export async function createRecurringBill(
  userId: string,
  bill: CreateRecurringBillInput
): Promise<RecurringBill | null> {
  const { data, error } = await supabase
    .from('recurring_bills')
    .insert({
      ...bill,
      user_id: userId,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating recurring bill:', error);
    return null;
  }

  return data;
}

/**
 * Update a recurring bill
 */
export async function updateRecurringBill(
  billId: string,
  updates: Partial<CreateRecurringBillInput>
): Promise<boolean> {
  const { error } = await supabase.from('recurring_bills').update(updates).eq('id', billId);

  if (error) {
    console.error('Error updating recurring bill:', error);
    return false;
  }

  return true;
}

/**
 * Delete a recurring bill
 */
export async function deleteRecurringBill(billId: string): Promise<boolean> {
  const { error } = await supabase.from('recurring_bills').delete().eq('id', billId);

  if (error) {
    console.error('Error deleting recurring bill:', error);
    return false;
  }

  return true;
}

// ============ BILL PAYMENTS ============

/**
 * Get bill payments for a user with optional filters
 */
export async function getBillPayments(
  userId: string,
  options?: {
    startDate?: string;
    endDate?: string;
    isPaid?: boolean;
    isOverdue?: boolean;
    categoryId?: string;
    limit?: number;
  }
): Promise<BillPaymentWithRelations[]> {
  let query = supabase
    .from('bill_payments')
    .select('*, category:bill_categories(*), bill_account:bill_accounts(*)')
    .eq('user_id', userId);

  if (options?.startDate) {
    query = query.gte('due_date', options.startDate);
  }

  if (options?.endDate) {
    query = query.lte('due_date', options.endDate);
  }

  if (options?.isPaid !== undefined) {
    query = query.eq('is_paid', options.isPaid);
  }

  if (options?.isOverdue !== undefined) {
    query = query.eq('is_overdue', options.isOverdue);
  }

  if (options?.categoryId) {
    query = query.eq('category_id', options.categoryId);
  }

  query = query.order('due_date', { ascending: true });

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error getting bill payments:', error);
    return [];
  }

  return data || [];
}

/**
 * Get upcoming bill payments (next N days)
 */
export async function getUpcomingPayments(
  userId: string,
  days: number = 14
): Promise<BillPaymentWithRelations[]> {
  const today = new Date();
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + days);

  return getBillPayments(userId, {
    startDate: today.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    isPaid: false,
  });
}

/**
 * Get overdue bill payments
 */
export async function getOverduePayments(userId: string): Promise<BillPaymentWithRelations[]> {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('bill_payments')
    .select('*, category:bill_categories(*), bill_account:bill_accounts(*)')
    .eq('user_id', userId)
    .eq('is_paid', false)
    .lt('due_date', today)
    .order('due_date', { ascending: true });

  if (error) {
    console.error('Error getting overdue payments:', error);
    return [];
  }

  return data || [];
}

/**
 * Get a single bill payment
 */
export async function getBillPayment(paymentId: string): Promise<BillPaymentWithRelations | null> {
  const { data, error } = await supabase
    .from('bill_payments')
    .select('*, category:bill_categories(*), bill_account:bill_accounts(*)')
    .eq('id', paymentId)
    .single();

  if (error) {
    console.error('Error getting bill payment:', error);
    return null;
  }

  return data;
}

/**
 * Create a bill payment
 */
export async function createBillPayment(
  userId: string,
  payment: CreateBillPaymentInput
): Promise<BillPayment | null> {
  const today = new Date().toISOString().split('T')[0];
  const isOverdue = payment.due_date < today;

  const { data, error } = await supabase
    .from('bill_payments')
    .insert({
      ...payment,
      user_id: userId,
      is_paid: false,
      is_overdue: isOverdue,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating bill payment:', error);
    return null;
  }

  return data;
}

/**
 * Update a bill payment
 */
export async function updateBillPayment(
  paymentId: string,
  updates: UpdateBillPaymentInput
): Promise<boolean> {
  const { error } = await supabase.from('bill_payments').update(updates).eq('id', paymentId);

  if (error) {
    console.error('Error updating bill payment:', error);
    return false;
  }

  return true;
}

/**
 * Mark a bill as paid
 */
export async function markBillAsPaid(paymentId: string): Promise<boolean> {
  const today = new Date().toISOString().split('T')[0];

  const { error } = await supabase
    .from('bill_payments')
    .update({
      is_paid: true,
      paid_date: today,
      is_overdue: false,
    })
    .eq('id', paymentId);

  if (error) {
    console.error('Error marking bill as paid:', error);
    return false;
  }

  return true;
}

/**
 * Mark a bill as unpaid
 */
export async function markBillAsUnpaid(paymentId: string): Promise<boolean> {
  const { data: payment } = await supabase
    .from('bill_payments')
    .select('due_date')
    .eq('id', paymentId)
    .single();

  if (!payment) return false;

  const today = new Date().toISOString().split('T')[0];
  const isOverdue = payment.due_date < today;

  const { error } = await supabase
    .from('bill_payments')
    .update({
      is_paid: false,
      paid_date: null,
      is_overdue: isOverdue,
    })
    .eq('id', paymentId);

  if (error) {
    console.error('Error marking bill as unpaid:', error);
    return false;
  }

  return true;
}

/**
 * Delete a bill payment
 */
export async function deleteBillPayment(paymentId: string): Promise<boolean> {
  const { error } = await supabase.from('bill_payments').delete().eq('id', paymentId);

  if (error) {
    console.error('Error deleting bill payment:', error);
    return false;
  }

  return true;
}

/**
 * Get monthly summary for a user
 */
export async function getMonthlySummary(
  userId: string,
  year: number,
  month: number
): Promise<{
  total: number;
  paid: number;
  remaining: number;
  overdue: number;
  count: number;
  paidCount: number;
}> {
  const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
  const endDate = new Date(year, month, 0).toISOString().split('T')[0];

  const payments = await getBillPayments(userId, { startDate, endDate });

  const total = payments.reduce((sum, p) => sum + p.amount, 0);
  const paidPayments = payments.filter(p => p.is_paid);
  const paid = paidPayments.reduce((sum, p) => sum + p.amount, 0);
  const overduePayments = payments.filter(p => p.is_overdue && !p.is_paid);
  const overdue = overduePayments.reduce((sum, p) => sum + p.amount, 0);

  return {
    total,
    paid,
    remaining: total - paid,
    overdue,
    count: payments.length,
    paidCount: paidPayments.length,
  };
}
