import { BillPayment, BillCategory } from '../../types/database';

export interface CategorySummary {
  categoryId: string;
  categoryName: string;
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

export interface MonthlySummary {
  totalPaid: number;
  totalUpcoming: number;
  totalOverdue: number;
  byCategory: CategorySummary[];
  byProvider: ProviderSummary[];
}

/**
 * Aggregates bill payments by category
 */
export function aggregateByCategory(
  payments: BillPayment[],
  categories: BillCategory[]
): CategorySummary[] {
  const categoryMap = new Map<string, CategorySummary>();

  payments.forEach((payment) => {
    const category = categories.find((c) => c.id === payment.category_id);
    const categoryName = category?.name || 'Неизвестна категория';

    if (!categoryMap.has(payment.category_id)) {
      categoryMap.set(payment.category_id, {
        categoryId: payment.category_id,
        categoryName,
        total: 0,
        count: 0,
        percentage: 0,
      });
    }

    const summary = categoryMap.get(payment.category_id)!;
    summary.total += Number(payment.amount);
    summary.count += 1;
  });

  const total = payments.reduce((sum, p) => sum + Number(p.amount), 0);

  return Array.from(categoryMap.values())
    .map((summary) => ({
      ...summary,
      percentage: total > 0 ? (summary.total / total) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);
}

/**
 * Aggregates bill payments by provider (from bill_accounts)
 */
export function aggregateByProvider(
  payments: BillPayment[],
  accounts: Array<{ id: string; provider_name: string }>
): ProviderSummary[] {
  const providerMap = new Map<string, ProviderSummary>();

  payments.forEach((payment) => {
    const account = accounts.find((a) => a.id === payment.bill_account_id);
    const providerName = account?.provider_name || 'Неизвестен доставчик';

    if (!providerMap.has(providerName)) {
      providerMap.set(providerName, {
        providerName,
        total: 0,
        count: 0,
        percentage: 0,
      });
    }

    const summary = providerMap.get(providerName)!;
    summary.total += Number(payment.amount);
    summary.count += 1;
  });

  const total = payments.reduce((sum, p) => sum + Number(p.amount), 0);

  return Array.from(providerMap.values())
    .map((summary) => ({
      ...summary,
      percentage: total > 0 ? (summary.total / total) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);
}

/**
 * Generates a complete monthly summary
 */
export function generateMonthlySummary(
  payments: BillPayment[],
  categories: BillCategory[],
  accounts: Array<{ id: string; provider_name: string }>
): MonthlySummary {
  const paid = payments.filter((p) => p.is_paid);
  const upcoming = payments.filter((p) => !p.is_paid && !p.is_overdue);
  const overdue = payments.filter((p) => p.is_overdue);

  const totalPaid = paid.reduce((sum, p) => sum + Number(p.amount), 0);
  const totalUpcoming = upcoming.reduce((sum, p) => sum + Number(p.amount), 0);
  const totalOverdue = overdue.reduce((sum, p) => sum + Number(p.amount), 0);

  return {
    totalPaid,
    totalUpcoming,
    totalOverdue,
    byCategory: aggregateByCategory(payments, categories),
    byProvider: aggregateByProvider(payments, accounts),
  };
}

/**
 * Filters payments by date range
 */
export function filterByDateRange(
  payments: BillPayment[],
  startDate: Date,
  endDate: Date
): BillPayment[] {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  return payments.filter((payment) => {
    const dueDate = new Date(payment.due_date);
    return dueDate >= start && dueDate <= end;
  });
}
