import {
  addMonths,
  addDays,
  setDate,
  getDaysInMonth,
  startOfMonth,
  endOfMonth,
  isAfter,
  isBefore,
  format,
} from 'date-fns';
import type { RecurrenceType, RecurringBill, BillPayment } from '../types/database';

/**
 * Calculate the next due date based on recurrence type
 */
export function getNextDueDate(
  recurrenceType: RecurrenceType,
  dueDay: number,
  fromDate: Date = new Date()
): Date {
  const currentMonth = fromDate.getMonth();
  const currentYear = fromDate.getFullYear();

  // Adjust due day for months with fewer days
  const adjustedDueDay = Math.min(dueDay, getDaysInMonth(fromDate));
  
  let nextDate = setDate(fromDate, adjustedDueDay);
  
  // If due date has passed this period, move to next
  if (isBefore(nextDate, fromDate) || nextDate.getTime() === fromDate.getTime()) {
    switch (recurrenceType) {
      case 'monthly':
        nextDate = addMonths(nextDate, 1);
        break;
      case 'bi_monthly':
        nextDate = addMonths(nextDate, 2);
        break;
      case 'quarterly':
        nextDate = addMonths(nextDate, 3);
        break;
      case 'yearly':
        nextDate = addMonths(nextDate, 12);
        break;
      default:
        nextDate = addMonths(nextDate, 1);
    }
  }
  
  // Adjust for month length again after moving
  const finalDueDay = Math.min(dueDay, getDaysInMonth(nextDate));
  return setDate(nextDate, finalDueDay);
}

/**
 * Generate payment instances for a recurring bill
 */
export function generatePaymentInstances(
  recurringBill: RecurringBill,
  monthsAhead: number = 3,
  fromDate: Date = new Date()
): Omit<BillPayment, 'id' | 'created_at' | 'updated_at'>[] {
  const payments: Omit<BillPayment, 'id' | 'created_at' | 'updated_at'>[] = [];
  const dueDay = recurringBill.due_day_of_month || 15;
  
  let currentDate = fromDate;
  const endDate = addMonths(fromDate, monthsAhead);
  
  while (isBefore(currentDate, endDate)) {
    const dueDate = getNextDueDate(
      recurringBill.recurrence_type,
      dueDay,
      currentDate
    );
    
    if (isAfter(dueDate, endDate)) break;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDateClean = new Date(dueDate);
    dueDateClean.setHours(0, 0, 0, 0);
    
    payments.push({
      user_id: recurringBill.user_id,
      recurring_bill_id: recurringBill.id,
      bill_account_id: recurringBill.bill_account_id,
      category_id: recurringBill.category_id,
      title: recurringBill.title,
      amount: recurringBill.expected_amount || 0,
      currency: recurringBill.currency,
      due_date: format(dueDate, 'yyyy-MM-dd'),
      is_paid: false,
      paid_date: null,
      is_overdue: isBefore(dueDateClean, today),
      attachment_url: null,
      notes: null,
    });
    
    // Move to next period
    switch (recurringBill.recurrence_type) {
      case 'monthly':
        currentDate = addMonths(currentDate, 1);
        break;
      case 'bi_monthly':
        currentDate = addMonths(currentDate, 2);
        break;
      case 'quarterly':
        currentDate = addMonths(currentDate, 3);
        break;
      case 'yearly':
        currentDate = addMonths(currentDate, 12);
        break;
      default:
        currentDate = addMonths(currentDate, 1);
    }
    
    // Safety: prevent infinite loops
    if (payments.length > 24) break;
  }
  
  return payments;
}

/**
 * Get interval in months for a recurrence type
 */
export function getRecurrenceIntervalMonths(recurrenceType: RecurrenceType): number {
  switch (recurrenceType) {
    case 'monthly':
      return 1;
    case 'bi_monthly':
      return 2;
    case 'quarterly':
      return 3;
    case 'yearly':
      return 12;
    case 'custom':
    default:
      return 1;
  }
}

/**
 * Get payments due within a date range
 */
export function getPaymentsInRange(
  payments: BillPayment[],
  startDate: Date,
  endDate: Date
): BillPayment[] {
  const start = format(startDate, 'yyyy-MM-dd');
  const end = format(endDate, 'yyyy-MM-dd');
  
  return payments.filter(p => p.due_date >= start && p.due_date <= end);
}

/**
 * Check if a payment is due today
 */
export function isDueToday(payment: BillPayment): boolean {
  const today = format(new Date(), 'yyyy-MM-dd');
  return payment.due_date === today;
}

/**
 * Check if a payment is due within N days
 */
export function isDueWithinDays(payment: BillPayment, days: number): boolean {
  const today = new Date();
  const futureDate = addDays(today, days);
  const dueDate = new Date(payment.due_date);
  
  return dueDate >= today && dueDate <= futureDate;
}

/**
 * Calculate days until due date (negative if overdue)
 */
export function getDaysUntilDue(payment: BillPayment): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(payment.due_date);
  dueDate.setHours(0, 0, 0, 0);
  
  const diffTime = dueDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Get all payments for a specific month
 */
export function getPaymentsForMonth(
  payments: BillPayment[],
  year: number,
  month: number
): BillPayment[] {
  const start = startOfMonth(new Date(year, month - 1));
  const end = endOfMonth(new Date(year, month - 1));
  
  return getPaymentsInRange(payments, start, end);
}

/**
 * Format recurrence type for display
 */
export function formatRecurrenceType(
  recurrenceType: RecurrenceType,
  translations: Record<string, string>
): string {
  const key = recurrenceType === 'bi_monthly' ? 'biMonthly' : recurrenceType;
  return translations[key] || recurrenceType;
}
