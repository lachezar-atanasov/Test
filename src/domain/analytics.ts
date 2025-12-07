import { format, startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns';
import type { BillPayment, BillCategory } from '../types/database';

export interface CategorySummary {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  total: number;
  count: number;
  percentage: number;
}

export interface ProviderSummary {
  providerName: string;
  total: number;
  count: number;
  percentage: number;
}

export interface MonthlyTrend {
  month: string;
  year: number;
  monthIndex: number;
  total: number;
  paid: number;
  unpaid: number;
  overdue: number;
}

export interface AnalyticsSummary {
  totalAmount: number;
  totalPaid: number;
  totalUnpaid: number;
  totalOverdue: number;
  billCount: number;
  paidCount: number;
  unpaidCount: number;
  overdueCount: number;
  averagePerBill: number;
}

/**
 * Calculate summary statistics for a list of payments
 */
export function calculateSummary(payments: BillPayment[]): AnalyticsSummary {
  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
  const paidPayments = payments.filter(p => p.is_paid);
  const totalPaid = paidPayments.reduce((sum, p) => sum + p.amount, 0);
  const unpaidPayments = payments.filter(p => !p.is_paid);
  const totalUnpaid = unpaidPayments.reduce((sum, p) => sum + p.amount, 0);
  const overduePayments = payments.filter(p => p.is_overdue && !p.is_paid);
  const totalOverdue = overduePayments.reduce((sum, p) => sum + p.amount, 0);

  return {
    totalAmount,
    totalPaid,
    totalUnpaid,
    totalOverdue,
    billCount: payments.length,
    paidCount: paidPayments.length,
    unpaidCount: unpaidPayments.length,
    overdueCount: overduePayments.length,
    averagePerBill: payments.length > 0 ? totalAmount / payments.length : 0,
  };
}

/**
 * Group payments by category and calculate totals
 */
export function groupByCategory(
  payments: BillPayment[],
  categories: BillCategory[]
): CategorySummary[] {
  const categoryMap = new Map<string, { total: number; count: number }>();

  // Initialize with all categories
  categories.forEach(cat => {
    categoryMap.set(cat.id, { total: 0, count: 0 });
  });

  // Sum up payments
  payments.forEach(payment => {
    const existing = categoryMap.get(payment.category_id);
    if (existing) {
      existing.total += payment.amount;
      existing.count += 1;
    } else {
      categoryMap.set(payment.category_id, { total: payment.amount, count: 1 });
    }
  });

  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);

  // Convert to array with category details
  const summaries: CategorySummary[] = [];
  categoryMap.forEach((data, categoryId) => {
    if (data.count === 0) return; // Skip empty categories

    const category = categories.find(c => c.id === categoryId);
    summaries.push({
      categoryId,
      categoryName: category?.name || 'Неизвестна',
      categoryColor: category?.color || '#9E9E9E',
      categoryIcon: category?.icon || 'help-circle',
      total: data.total,
      count: data.count,
      percentage: totalAmount > 0 ? (data.total / totalAmount) * 100 : 0,
    });
  });

  // Sort by total descending
  return summaries.sort((a, b) => b.total - a.total);
}

/**
 * Group payments by provider (extracted from title or notes)
 */
export function groupByProvider(payments: BillPayment[]): ProviderSummary[] {
  const providerMap = new Map<string, { total: number; count: number }>();

  payments.forEach(payment => {
    // Extract provider from title (first part before '-' or full title)
    let providerName = payment.title.split(' - ')[0].trim();
    if (!providerName) providerName = 'Други';

    const existing = providerMap.get(providerName);
    if (existing) {
      existing.total += payment.amount;
      existing.count += 1;
    } else {
      providerMap.set(providerName, { total: payment.amount, count: 1 });
    }
  });

  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);

  const summaries: ProviderSummary[] = [];
  providerMap.forEach((data, providerName) => {
    summaries.push({
      providerName,
      total: data.total,
      count: data.count,
      percentage: totalAmount > 0 ? (data.total / totalAmount) * 100 : 0,
    });
  });

  return summaries.sort((a, b) => b.total - a.total);
}

/**
 * Calculate monthly trends over a period
 */
export function calculateMonthlyTrends(
  payments: BillPayment[],
  monthsBack: number = 6
): MonthlyTrend[] {
  const trends: MonthlyTrend[] = [];
  const now = new Date();

  for (let i = monthsBack - 1; i >= 0; i--) {
    const monthDate = subMonths(now, i);
    const monthStart = format(startOfMonth(monthDate), 'yyyy-MM-dd');
    const monthEnd = format(endOfMonth(monthDate), 'yyyy-MM-dd');

    const monthPayments = payments.filter(
      p => p.due_date >= monthStart && p.due_date <= monthEnd
    );

    const total = monthPayments.reduce((sum, p) => sum + p.amount, 0);
    const paid = monthPayments.filter(p => p.is_paid).reduce((sum, p) => sum + p.amount, 0);
    const overdue = monthPayments
      .filter(p => p.is_overdue && !p.is_paid)
      .reduce((sum, p) => sum + p.amount, 0);

    trends.push({
      month: format(monthDate, 'MMM'),
      year: monthDate.getFullYear(),
      monthIndex: monthDate.getMonth(),
      total,
      paid,
      unpaid: total - paid,
      overdue,
    });
  }

  return trends;
}

/**
 * Calculate average monthly spending
 */
export function calculateMonthlyAverage(payments: BillPayment[], months: number = 6): number {
  const trends = calculateMonthlyTrends(payments, months);
  const total = trends.reduce((sum, t) => sum + t.total, 0);
  return months > 0 ? total / months : 0;
}

/**
 * Find the most expensive category
 */
export function getMostExpensiveCategory(
  payments: BillPayment[],
  categories: BillCategory[]
): CategorySummary | null {
  const grouped = groupByCategory(payments, categories);
  return grouped.length > 0 ? grouped[0] : null;
}

/**
 * Get spending comparison between two periods
 */
export function comparePeriods(
  currentPeriodPayments: BillPayment[],
  previousPeriodPayments: BillPayment[]
): {
  currentTotal: number;
  previousTotal: number;
  difference: number;
  percentageChange: number;
  trend: 'up' | 'down' | 'same';
} {
  const currentTotal = currentPeriodPayments.reduce((sum, p) => sum + p.amount, 0);
  const previousTotal = previousPeriodPayments.reduce((sum, p) => sum + p.amount, 0);
  const difference = currentTotal - previousTotal;
  const percentageChange = previousTotal > 0 ? (difference / previousTotal) * 100 : 0;

  let trend: 'up' | 'down' | 'same' = 'same';
  if (difference > 0) trend = 'up';
  else if (difference < 0) trend = 'down';

  return {
    currentTotal,
    previousTotal,
    difference,
    percentageChange,
    trend,
  };
}

/**
 * Filter payments by date range
 */
export function filterPaymentsByDateRange(
  payments: BillPayment[],
  startDate: string,
  endDate: string
): BillPayment[] {
  return payments.filter(p => p.due_date >= startDate && p.due_date <= endDate);
}

/**
 * Filter payments by category
 */
export function filterPaymentsByCategory(
  payments: BillPayment[],
  categoryId: string
): BillPayment[] {
  return payments.filter(p => p.category_id === categoryId);
}

/**
 * Generate CSV export data
 */
export function generateCSVExport(payments: BillPayment[], categories: BillCategory[]): string {
  const headers = [
    'Заглавие',
    'Категория',
    'Сума',
    'Валута',
    'Дата на падеж',
    'Платена',
    'Дата на плащане',
    'Бележки',
  ];

  const categoryMap = new Map(categories.map(c => [c.id, c.name]));

  const rows = payments.map(p => [
    `"${p.title}"`,
    `"${categoryMap.get(p.category_id) || 'Неизвестна'}"`,
    p.amount.toFixed(2),
    p.currency,
    p.due_date,
    p.is_paid ? 'Да' : 'Не',
    p.paid_date || '',
    `"${p.notes || ''}"`,
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}
