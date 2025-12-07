import {
  getNextDueDate,
  generatePaymentInstances,
  getRecurrenceIntervalMonths,
  getPaymentsInRange,
  isDueToday,
  isDueWithinDays,
  getDaysUntilDue,
  getPaymentsForMonth,
} from '../recurrence';
import type { RecurringBill, BillPayment, RecurrenceType } from '../../types/database';

describe('Recurrence Domain Logic', () => {
  describe('getNextDueDate', () => {
    it('should return same month if due day is in the future', () => {
      const fromDate = new Date(2024, 0, 10); // January 10
      const result = getNextDueDate('monthly', 15, fromDate);
      
      expect(result.getDate()).toBe(15);
      expect(result.getMonth()).toBe(0); // January
      expect(result.getFullYear()).toBe(2024);
    });

    it('should return next month if due day has passed', () => {
      const fromDate = new Date(2024, 0, 20); // January 20
      const result = getNextDueDate('monthly', 15, fromDate);
      
      expect(result.getDate()).toBe(15);
      expect(result.getMonth()).toBe(1); // February
      expect(result.getFullYear()).toBe(2024);
    });

    it('should handle bi-monthly recurrence', () => {
      const fromDate = new Date(2024, 0, 20);
      const result = getNextDueDate('bi_monthly', 15, fromDate);
      
      expect(result.getDate()).toBe(15);
      expect(result.getMonth()).toBe(2); // March (2 months later)
    });

    it('should handle quarterly recurrence', () => {
      const fromDate = new Date(2024, 0, 20);
      const result = getNextDueDate('quarterly', 15, fromDate);
      
      expect(result.getDate()).toBe(15);
      expect(result.getMonth()).toBe(3); // April (3 months later)
    });

    it('should handle yearly recurrence', () => {
      const fromDate = new Date(2024, 0, 20);
      const result = getNextDueDate('yearly', 15, fromDate);
      
      expect(result.getDate()).toBe(15);
      expect(result.getMonth()).toBe(0); // January next year
      expect(result.getFullYear()).toBe(2025);
    });

    it('should adjust due day for months with fewer days', () => {
      const fromDate = new Date(2024, 1, 1); // February 1
      const result = getNextDueDate('monthly', 31, fromDate);
      
      // February 2024 has 29 days (leap year)
      expect(result.getDate()).toBe(29);
      expect(result.getMonth()).toBe(1);
    });
  });

  describe('generatePaymentInstances', () => {
    const baseRecurringBill: RecurringBill = {
      id: 'test-bill-1',
      user_id: 'user-1',
      bill_account_id: 'account-1',
      category_id: 'category-1',
      title: 'Test Bill',
      expected_amount: 50.00,
      currency: 'BGN',
      recurrence_type: 'monthly',
      due_day_of_month: 15,
      custom_cron: null,
      is_active: true,
      reminder_days_before: 3,
      notes: null,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    it('should generate correct number of instances for monthly bills', () => {
      const fromDate = new Date(2024, 0, 1); // January 1, 2024
      const instances = generatePaymentInstances(baseRecurringBill, 3, fromDate);
      
      // Should generate 3 months of payments
      expect(instances.length).toBeGreaterThanOrEqual(2);
      expect(instances.length).toBeLessThanOrEqual(4);
    });

    it('should set correct properties on generated instances', () => {
      const fromDate = new Date(2024, 0, 1);
      const instances = generatePaymentInstances(baseRecurringBill, 1, fromDate);
      
      expect(instances.length).toBeGreaterThan(0);
      
      const firstInstance = instances[0];
      expect(firstInstance.user_id).toBe('user-1');
      expect(firstInstance.recurring_bill_id).toBe('test-bill-1');
      expect(firstInstance.bill_account_id).toBe('account-1');
      expect(firstInstance.category_id).toBe('category-1');
      expect(firstInstance.title).toBe('Test Bill');
      expect(firstInstance.amount).toBe(50.00);
      expect(firstInstance.currency).toBe('BGN');
      expect(firstInstance.is_paid).toBe(false);
    });

    it('should generate bi-monthly instances correctly', () => {
      const biMonthlyBill: RecurringBill = {
        ...baseRecurringBill,
        recurrence_type: 'bi_monthly',
      };
      
      const fromDate = new Date(2024, 0, 1);
      const instances = generatePaymentInstances(biMonthlyBill, 6, fromDate);
      
      // 6 months / 2 months interval = ~3 instances
      expect(instances.length).toBeGreaterThanOrEqual(2);
      expect(instances.length).toBeLessThanOrEqual(4);
    });

    it('should mark overdue bills correctly', () => {
      const pastBill: RecurringBill = {
        ...baseRecurringBill,
        due_day_of_month: 1,
      };
      
      // Generate from a date where the first due date would be in the past
      const fromDate = new Date(2020, 0, 1);
      const instances = generatePaymentInstances(pastBill, 1, fromDate);
      
      // All instances from 2020 should be overdue
      instances.forEach(instance => {
        expect(instance.is_overdue).toBe(true);
      });
    });
  });

  describe('getRecurrenceIntervalMonths', () => {
    it('should return 1 for monthly', () => {
      expect(getRecurrenceIntervalMonths('monthly')).toBe(1);
    });

    it('should return 2 for bi_monthly', () => {
      expect(getRecurrenceIntervalMonths('bi_monthly')).toBe(2);
    });

    it('should return 3 for quarterly', () => {
      expect(getRecurrenceIntervalMonths('quarterly')).toBe(3);
    });

    it('should return 12 for yearly', () => {
      expect(getRecurrenceIntervalMonths('yearly')).toBe(12);
    });

    it('should return 1 for custom', () => {
      expect(getRecurrenceIntervalMonths('custom')).toBe(1);
    });
  });

  describe('getPaymentsInRange', () => {
    const mockPayments: BillPayment[] = [
      createMockPayment('1', '2024-01-15'),
      createMockPayment('2', '2024-02-15'),
      createMockPayment('3', '2024-03-15'),
      createMockPayment('4', '2024-04-15'),
    ];

    it('should filter payments within date range', () => {
      const start = new Date(2024, 1, 1); // February 1
      const end = new Date(2024, 2, 31); // March 31
      
      const result = getPaymentsInRange(mockPayments, start, end);
      
      expect(result.length).toBe(2);
      expect(result[0].id).toBe('2');
      expect(result[1].id).toBe('3');
    });

    it('should return empty array for range with no payments', () => {
      const start = new Date(2024, 5, 1);
      const end = new Date(2024, 5, 30);
      
      const result = getPaymentsInRange(mockPayments, start, end);
      
      expect(result.length).toBe(0);
    });
  });

  describe('isDueToday', () => {
    it('should return true for payment due today', () => {
      const today = new Date().toISOString().split('T')[0];
      const payment = createMockPayment('1', today);
      
      expect(isDueToday(payment)).toBe(true);
    });

    it('should return false for payment not due today', () => {
      const payment = createMockPayment('1', '2024-01-01');
      
      expect(isDueToday(payment)).toBe(false);
    });
  });

  describe('isDueWithinDays', () => {
    it('should return true for payment due within specified days', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const payment = createMockPayment('1', tomorrow.toISOString().split('T')[0]);
      
      expect(isDueWithinDays(payment, 3)).toBe(true);
    });

    it('should return false for payment due after specified days', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);
      const payment = createMockPayment('1', futureDate.toISOString().split('T')[0]);
      
      expect(isDueWithinDays(payment, 3)).toBe(false);
    });
  });

  describe('getDaysUntilDue', () => {
    it('should return positive number for future due date', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      const payment = createMockPayment('1', futureDate.toISOString().split('T')[0]);
      
      const days = getDaysUntilDue(payment);
      
      expect(days).toBe(5);
    });

    it('should return negative number for past due date', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 3);
      const payment = createMockPayment('1', pastDate.toISOString().split('T')[0]);
      
      const days = getDaysUntilDue(payment);
      
      expect(days).toBe(-3);
    });

    it('should return 0 for due today', () => {
      const today = new Date().toISOString().split('T')[0];
      const payment = createMockPayment('1', today);
      
      const days = getDaysUntilDue(payment);
      
      expect(days).toBe(0);
    });
  });

  describe('getPaymentsForMonth', () => {
    const mockPayments: BillPayment[] = [
      createMockPayment('1', '2024-02-05'),
      createMockPayment('2', '2024-02-15'),
      createMockPayment('3', '2024-02-28'),
      createMockPayment('4', '2024-03-01'),
    ];

    it('should return only payments for specified month', () => {
      const result = getPaymentsForMonth(mockPayments, 2024, 2);
      
      expect(result.length).toBe(3);
      expect(result[0].id).toBe('1');
      expect(result[1].id).toBe('2');
      expect(result[2].id).toBe('3');
    });

    it('should return empty array for month with no payments', () => {
      const result = getPaymentsForMonth(mockPayments, 2024, 1);
      
      expect(result.length).toBe(0);
    });
  });
});

// Helper function to create mock payments
function createMockPayment(id: string, dueDate: string): BillPayment {
  return {
    id,
    user_id: 'user-1',
    recurring_bill_id: null,
    bill_account_id: 'account-1',
    category_id: 'category-1',
    title: `Test Payment ${id}`,
    amount: 50.00,
    currency: 'BGN',
    due_date: dueDate,
    is_paid: false,
    paid_date: null,
    is_overdue: false,
    attachment_url: null,
    notes: null,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  };
}
