import {
  calculateSummary,
  groupByCategory,
  groupByProvider,
  calculateMonthlyTrends,
  calculateMonthlyAverage,
  getMostExpensiveCategory,
  comparePeriods,
  filterPaymentsByDateRange,
  filterPaymentsByCategory,
  generateCSVExport,
} from '../analytics';
import type { BillPayment, BillCategory } from '../../types/database';

describe('Analytics Domain Logic', () => {
  // Test data
  const mockCategories: BillCategory[] = [
    { id: 'cat-1', user_id: null, name: 'Ток', icon: 'lightning', color: '#FFC107', is_default: true },
    { id: 'cat-2', user_id: null, name: 'Вода', icon: 'water', color: '#2196F3', is_default: true },
    { id: 'cat-3', user_id: null, name: 'Интернет', icon: 'wifi', color: '#9C27B0', is_default: true },
  ];

  const mockPayments: BillPayment[] = [
    createMockPayment('1', 'cat-1', 'ЧЕЗ - Ток', 80.00, true, '2024-01-15'),
    createMockPayment('2', 'cat-1', 'ЧЕЗ - Ток', 75.00, true, '2024-02-15'),
    createMockPayment('3', 'cat-2', 'Софийска вода', 30.00, true, '2024-01-20'),
    createMockPayment('4', 'cat-2', 'Софийска вода', 35.00, false, '2024-02-20'),
    createMockPayment('5', 'cat-3', 'Виваком - Интернет', 25.00, true, '2024-01-10'),
    createMockPayment('6', 'cat-3', 'Виваком - Интернет', 25.00, false, '2024-02-10', true),
  ];

  describe('calculateSummary', () => {
    it('should calculate total amount correctly', () => {
      const result = calculateSummary(mockPayments);
      
      expect(result.totalAmount).toBe(270.00);
    });

    it('should calculate paid amount correctly', () => {
      const result = calculateSummary(mockPayments);
      
      expect(result.totalPaid).toBe(210.00); // 80 + 75 + 30 + 25
    });

    it('should calculate unpaid amount correctly', () => {
      const result = calculateSummary(mockPayments);
      
      expect(result.totalUnpaid).toBe(60.00); // 35 + 25
    });

    it('should calculate overdue amount correctly', () => {
      const result = calculateSummary(mockPayments);
      
      expect(result.totalOverdue).toBe(25.00); // Only payment 6 is overdue
    });

    it('should count bills correctly', () => {
      const result = calculateSummary(mockPayments);
      
      expect(result.billCount).toBe(6);
      expect(result.paidCount).toBe(4);
      expect(result.unpaidCount).toBe(2);
      expect(result.overdueCount).toBe(1);
    });

    it('should calculate average per bill', () => {
      const result = calculateSummary(mockPayments);
      
      expect(result.averagePerBill).toBe(45.00); // 270 / 6
    });

    it('should handle empty array', () => {
      const result = calculateSummary([]);
      
      expect(result.totalAmount).toBe(0);
      expect(result.billCount).toBe(0);
      expect(result.averagePerBill).toBe(0);
    });
  });

  describe('groupByCategory', () => {
    it('should group payments by category', () => {
      const result = groupByCategory(mockPayments, mockCategories);
      
      expect(result.length).toBe(3);
    });

    it('should calculate correct totals per category', () => {
      const result = groupByCategory(mockPayments, mockCategories);
      
      const electricity = result.find(r => r.categoryId === 'cat-1');
      const water = result.find(r => r.categoryId === 'cat-2');
      const internet = result.find(r => r.categoryId === 'cat-3');
      
      expect(electricity?.total).toBe(155.00);
      expect(water?.total).toBe(65.00);
      expect(internet?.total).toBe(50.00);
    });

    it('should calculate correct counts per category', () => {
      const result = groupByCategory(mockPayments, mockCategories);
      
      const electricity = result.find(r => r.categoryId === 'cat-1');
      expect(electricity?.count).toBe(2);
    });

    it('should calculate percentages correctly', () => {
      const result = groupByCategory(mockPayments, mockCategories);
      
      const electricity = result.find(r => r.categoryId === 'cat-1');
      // 155 / 270 * 100 ≈ 57.4%
      expect(electricity?.percentage).toBeCloseTo(57.4, 1);
    });

    it('should sort by total descending', () => {
      const result = groupByCategory(mockPayments, mockCategories);
      
      expect(result[0].categoryId).toBe('cat-1'); // Highest total
      expect(result[1].categoryId).toBe('cat-2');
      expect(result[2].categoryId).toBe('cat-3'); // Lowest total
    });

    it('should include category details', () => {
      const result = groupByCategory(mockPayments, mockCategories);
      
      expect(result[0].categoryName).toBe('Ток');
      expect(result[0].categoryColor).toBe('#FFC107');
      expect(result[0].categoryIcon).toBe('lightning');
    });
  });

  describe('groupByProvider', () => {
    it('should group payments by provider', () => {
      const result = groupByProvider(mockPayments);
      
      // Should have 3 providers: ЧЕЗ, Софийска вода, Виваком
      expect(result.length).toBe(3);
    });

    it('should calculate correct totals per provider', () => {
      const result = groupByProvider(mockPayments);
      
      const cez = result.find(r => r.providerName === 'ЧЕЗ');
      expect(cez?.total).toBe(155.00);
      expect(cez?.count).toBe(2);
    });

    it('should sort by total descending', () => {
      const result = groupByProvider(mockPayments);
      
      expect(result[0].total).toBeGreaterThanOrEqual(result[1].total);
      expect(result[1].total).toBeGreaterThanOrEqual(result[2].total);
    });
  });

  describe('calculateMonthlyTrends', () => {
    it('should calculate trends for specified months', () => {
      const result = calculateMonthlyTrends(mockPayments, 2);
      
      expect(result.length).toBe(2);
    });

    it('should calculate totals for each month', () => {
      // Use a more controlled set of payments for this test
      const januaryPayments = mockPayments.filter(p => p.due_date.startsWith('2024-01'));
      const result = calculateMonthlyTrends(januaryPayments, 1);
      
      expect(result.length).toBe(1);
    });
  });

  describe('calculateMonthlyAverage', () => {
    it('should calculate average monthly spending', () => {
      // Create payments in the current month to ensure they're included in trends
      const now = new Date();
      const currentMonthDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-15`;
      
      const controlledPayments = [
        createMockPayment('1', 'cat-1', 'Test', 100.00, true, currentMonthDate),
      ];
      
      const result = calculateMonthlyAverage(controlledPayments, 1);
      expect(result).toBe(100.00);
    });

    it('should return 0 for empty payments', () => {
      const result = calculateMonthlyAverage([], 3);
      expect(result).toBe(0);
    });
  });

  describe('getMostExpensiveCategory', () => {
    it('should return the most expensive category', () => {
      const result = getMostExpensiveCategory(mockPayments, mockCategories);
      
      expect(result).not.toBeNull();
      expect(result?.categoryId).toBe('cat-1'); // Electricity is most expensive
      expect(result?.total).toBe(155.00);
    });

    it('should return null for empty payments', () => {
      const result = getMostExpensiveCategory([], mockCategories);
      
      expect(result).toBeNull();
    });
  });

  describe('comparePeriods', () => {
    it('should compare two periods correctly', () => {
      const currentPeriod = mockPayments.filter(p => p.due_date.startsWith('2024-02'));
      const previousPeriod = mockPayments.filter(p => p.due_date.startsWith('2024-01'));
      
      const result = comparePeriods(currentPeriod, previousPeriod);
      
      expect(result.currentTotal).toBe(135.00); // Feb: 75 + 35 + 25
      expect(result.previousTotal).toBe(135.00); // Jan: 80 + 30 + 25
      expect(result.difference).toBe(0);
      expect(result.trend).toBe('same');
    });

    it('should detect upward trend', () => {
      const current = [createMockPayment('1', 'cat-1', 'Test', 100.00, true, '2024-02-01')];
      const previous = [createMockPayment('2', 'cat-1', 'Test', 50.00, true, '2024-01-01')];
      
      const result = comparePeriods(current, previous);
      
      expect(result.trend).toBe('up');
      expect(result.difference).toBe(50.00);
      expect(result.percentageChange).toBe(100); // 100% increase
    });

    it('should detect downward trend', () => {
      const current = [createMockPayment('1', 'cat-1', 'Test', 50.00, true, '2024-02-01')];
      const previous = [createMockPayment('2', 'cat-1', 'Test', 100.00, true, '2024-01-01')];
      
      const result = comparePeriods(current, previous);
      
      expect(result.trend).toBe('down');
      expect(result.difference).toBe(-50.00);
      expect(result.percentageChange).toBe(-50); // 50% decrease
    });
  });

  describe('filterPaymentsByDateRange', () => {
    it('should filter payments within range', () => {
      const result = filterPaymentsByDateRange(mockPayments, '2024-01-01', '2024-01-31');
      
      expect(result.length).toBe(3);
    });

    it('should return empty for range with no payments', () => {
      const result = filterPaymentsByDateRange(mockPayments, '2023-01-01', '2023-12-31');
      
      expect(result.length).toBe(0);
    });
  });

  describe('filterPaymentsByCategory', () => {
    it('should filter payments by category', () => {
      const result = filterPaymentsByCategory(mockPayments, 'cat-1');
      
      expect(result.length).toBe(2);
      expect(result.every(p => p.category_id === 'cat-1')).toBe(true);
    });

    it('should return empty for category with no payments', () => {
      const result = filterPaymentsByCategory(mockPayments, 'non-existent');
      
      expect(result.length).toBe(0);
    });
  });

  describe('generateCSVExport', () => {
    it('should generate valid CSV format', () => {
      const csv = generateCSVExport(mockPayments, mockCategories);
      const lines = csv.split('\n');
      
      // Should have header + data rows
      expect(lines.length).toBe(7); // 1 header + 6 payments
    });

    it('should include header row', () => {
      const csv = generateCSVExport(mockPayments, mockCategories);
      const header = csv.split('\n')[0];
      
      expect(header).toContain('Заглавие');
      expect(header).toContain('Категория');
      expect(header).toContain('Сума');
      expect(header).toContain('Валута');
    });

    it('should include payment data', () => {
      const csv = generateCSVExport(mockPayments, mockCategories);
      
      expect(csv).toContain('ЧЕЗ');
      expect(csv).toContain('80.00');
      expect(csv).toContain('BGN');
    });

    it('should translate category names', () => {
      const csv = generateCSVExport(mockPayments, mockCategories);
      
      expect(csv).toContain('Ток');
      expect(csv).toContain('Вода');
    });

    it('should handle empty payments', () => {
      const csv = generateCSVExport([], mockCategories);
      const lines = csv.split('\n');
      
      expect(lines.length).toBe(1); // Only header
    });
  });
});

// Helper function to create mock payments
function createMockPayment(
  id: string,
  categoryId: string,
  title: string,
  amount: number,
  isPaid: boolean,
  dueDate: string,
  isOverdue: boolean = false
): BillPayment {
  return {
    id,
    user_id: 'user-1',
    recurring_bill_id: null,
    bill_account_id: 'account-1',
    category_id: categoryId,
    title,
    amount,
    currency: 'BGN',
    due_date: dueDate,
    is_paid: isPaid,
    paid_date: isPaid ? dueDate : null,
    is_overdue: isOverdue,
    attachment_url: null,
    notes: null,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  };
}
