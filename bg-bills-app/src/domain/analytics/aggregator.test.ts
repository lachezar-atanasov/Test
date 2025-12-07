import {
  aggregateByCategory,
  aggregateByProvider,
  generateMonthlySummary,
  filterByDateRange,
} from './aggregator';

// Type definitions for testing
interface BillCategory {
  id: string;
  user_id: string | null;
  name: string;
  icon: string;
  color: string;
  is_default: boolean;
}

interface BillPayment {
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

const mockCategories: BillCategory[] = [
  { id: '1', user_id: null, name: 'Ток', icon: 'flash', color: '#FFD700', is_default: true },
  { id: '2', user_id: null, name: 'Вода', icon: 'water', color: '#4ECDC4', is_default: true },
];

const mockPayments: BillPayment[] = [
  {
    id: '1',
    user_id: 'user1',
    recurring_bill_id: null,
    bill_account_id: 'acc1',
    category_id: '1',
    title: 'Сметка за ток',
    amount: 100,
    currency: 'BGN',
    due_date: '2024-01-15',
    is_paid: true,
    paid_date: '2024-01-14',
    is_overdue: false,
    attachment_url: null,
    notes: null,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: '2',
    user_id: 'user1',
    recurring_bill_id: null,
    bill_account_id: 'acc2',
    category_id: '1',
    title: 'Сметка за ток 2',
    amount: 150,
    currency: 'BGN',
    due_date: '2024-01-20',
    is_paid: false,
    paid_date: null,
    is_overdue: false,
    attachment_url: null,
    notes: null,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: '3',
    user_id: 'user1',
    recurring_bill_id: null,
    bill_account_id: 'acc3',
    category_id: '2',
    title: 'Сметка за вода',
    amount: 50,
    currency: 'BGN',
    due_date: '2024-01-25',
    is_paid: true,
    paid_date: '2024-01-24',
    is_overdue: false,
    attachment_url: null,
    notes: null,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
];

describe('aggregateByCategory', () => {
  it('should aggregate payments by category', () => {
    const result = aggregateByCategory(mockPayments, mockCategories);

    expect(result).toHaveLength(2);
    const electricity = result.find((r) => r.categoryId === '1');
    expect(electricity?.total).toBe(250);
    expect(electricity?.count).toBe(2);
    expect(electricity?.percentage).toBeCloseTo(83.33, 1);
  });
});

describe('aggregateByProvider', () => {
  it('should aggregate payments by provider', () => {
    const accounts = [
      { id: 'acc1', provider_name: 'ЧЕЗ' },
      { id: 'acc2', provider_name: 'ЧЕЗ' },
      { id: 'acc3', provider_name: 'Софийска вода' },
    ];

    const result = aggregateByProvider(mockPayments, accounts);

    expect(result.length).toBeGreaterThan(0);
    const cez = result.find((r) => r.providerName === 'ЧЕЗ');
    expect(cez?.total).toBe(250);
    expect(cez?.count).toBe(2);
  });
});

describe('generateMonthlySummary', () => {
  it('should generate complete monthly summary', () => {
    const accounts = [
      { id: 'acc1', provider_name: 'ЧЕЗ' },
      { id: 'acc2', provider_name: 'ЧЕЗ' },
      { id: 'acc3', provider_name: 'Софийска вода' },
    ];

    const summary = generateMonthlySummary(mockPayments, mockCategories, accounts);

    expect(summary.totalPaid).toBe(150);
    expect(summary.totalUpcoming).toBe(150);
    expect(summary.totalOverdue).toBe(0);
    expect(summary.byCategory).toHaveLength(2);
    expect(summary.byProvider.length).toBeGreaterThan(0);
  });
});

describe('filterByDateRange', () => {
  it('should filter payments by date range', () => {
    const startDate = new Date(2024, 0, 1);
    const endDate = new Date(2024, 0, 31);
    const filtered = filterByDateRange(mockPayments, startDate, endDate);

    expect(filtered).toHaveLength(3);
  });

  it('should return empty array for payments outside range', () => {
    const startDate = new Date(2025, 0, 1);
    const endDate = new Date(2025, 0, 31);
    const filtered = filterByDateRange(mockPayments, startDate, endDate);

    expect(filtered).toHaveLength(0);
  });
});
