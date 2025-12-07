import { generateBillInstances, getNextDueDate } from './generator';

type RecurrenceType = 'monthly' | 'bi_monthly' | 'quarterly' | 'yearly' | 'custom';

describe('generateBillInstances', () => {
  it('should generate monthly instances', () => {
    const startDate = new Date(2024, 0, 1); // January 1, 2024
    const instances = generateBillInstances('monthly', 15, 100, startDate, 3);

    expect(instances).toHaveLength(3);
    expect(instances[0].dueDate.getDate()).toBe(15);
    expect(instances[0].dueDate.getMonth()).toBe(0); // January
    expect(instances[1].dueDate.getMonth()).toBe(1); // February
    expect(instances[2].dueDate.getMonth()).toBe(2); // March
  });

  it('should generate quarterly instances', () => {
    const startDate = new Date(2024, 0, 1);
    const instances = generateBillInstances('quarterly', 1, 200, startDate, 2);

    expect(instances).toHaveLength(2);
    expect(instances[0].dueDate.getMonth()).toBe(0); // January
    expect(instances[1].dueDate.getMonth()).toBe(3); // April
  });

  it('should filter out past dates', () => {
    const pastDate = new Date(2020, 0, 1);
    const instances = generateBillInstances('monthly', 15, 100, pastDate, 12);

    // Should only include future dates
    const today = new Date();
    instances.forEach((instance) => {
      expect(instance.dueDate.getTime()).toBeGreaterThanOrEqual(today.getTime());
    });
  });

  it('should return empty array for null due day', () => {
    const instances = generateBillInstances('monthly', null, 100);
    expect(instances).toHaveLength(0);
  });
});

describe('getNextDueDate', () => {
  it('should calculate next monthly due date', () => {
    const baseDate = new Date(2024, 0, 10); // January 10
    const nextDate = getNextDueDate('monthly', 15, baseDate);

    expect(nextDate).not.toBeNull();
    expect(nextDate!.getDate()).toBe(15);
    expect(nextDate!.getMonth()).toBe(1); // February
  });

  it('should calculate next quarterly due date', () => {
    const baseDate = new Date(2024, 0, 1);
    const nextDate = getNextDueDate('quarterly', 1, baseDate);

    expect(nextDate).not.toBeNull();
    expect(nextDate!.getMonth()).toBe(3); // April
  });

  it('should return null for null due day', () => {
    const nextDate = getNextDueDate('monthly', null);
    expect(nextDate).toBeNull();
  });
});
