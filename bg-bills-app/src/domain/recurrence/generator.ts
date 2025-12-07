import { RecurrenceType } from '../../types/database';

export interface BillInstance {
  dueDate: Date;
  expectedAmount: number | null;
}

/**
 * Generates bill payment instances based on recurrence type and due day
 */
export function generateBillInstances(
  recurrenceType: RecurrenceType,
  dueDayOfMonth: number | null,
  expectedAmount: number | null,
  startDate: Date = new Date(),
  monthsAhead: number = 3
): BillInstance[] {
  if (!dueDayOfMonth) {
    return [];
  }

  const instances: BillInstance[] = [];
  const currentDate = new Date(startDate);

  for (let i = 0; i < monthsAhead; i++) {
    let targetDate: Date;

    switch (recurrenceType) {
      case 'monthly':
        targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, dueDayOfMonth);
        instances.push({ dueDate: targetDate, expectedAmount });
        break;

      case 'bi_monthly':
        // Every 2 months
        targetDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + i * 2,
          dueDayOfMonth
        );
        instances.push({ dueDate: targetDate, expectedAmount });
        break;

      case 'quarterly':
        // Every 3 months
        targetDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + i * 3,
          dueDayOfMonth
        );
        instances.push({ dueDate: targetDate, expectedAmount });
        break;

      case 'yearly':
        // Every 12 months
        targetDate = new Date(
          currentDate.getFullYear() + i,
          currentDate.getMonth(),
          dueDayOfMonth
        );
        instances.push({ dueDate: targetDate, expectedAmount });
        break;

      case 'custom':
        // For custom, we'd need cron parsing, but for now skip
        // In production, you'd parse custom_cron here
        break;
    }
  }

  // Filter out past dates and ensure dates are valid
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return instances
    .filter((instance) => {
      const dueDate = new Date(instance.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate >= today;
    })
    .map((instance) => ({
      ...instance,
      dueDate: new Date(instance.dueDate),
    }));
}

/**
 * Calculates the next due date for a recurring bill
 */
export function getNextDueDate(
  recurrenceType: RecurrenceType,
  dueDayOfMonth: number | null,
  lastDueDate?: Date
): Date | null {
  if (!dueDayOfMonth) {
    return null;
  }

  const baseDate = lastDueDate || new Date();
  let nextDate: Date;

  switch (recurrenceType) {
    case 'monthly':
      nextDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, dueDayOfMonth);
      break;
    case 'bi_monthly':
      nextDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + 2, dueDayOfMonth);
      break;
    case 'quarterly':
      nextDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + 3, dueDayOfMonth);
      break;
    case 'yearly':
      nextDate = new Date(baseDate.getFullYear() + 1, baseDate.getMonth(), dueDayOfMonth);
      break;
    default:
      return null;
  }

  // If the calculated date is in the past, move to next period
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (nextDate < today) {
    switch (recurrenceType) {
      case 'monthly':
        nextDate = new Date(today.getFullYear(), today.getMonth() + 1, dueDayOfMonth);
        break;
      case 'bi_monthly':
        nextDate = new Date(today.getFullYear(), today.getMonth() + 2, dueDayOfMonth);
        break;
      case 'quarterly':
        nextDate = new Date(today.getFullYear(), today.getMonth() + 3, dueDayOfMonth);
        break;
      case 'yearly':
        nextDate = new Date(today.getFullYear() + 1, today.getMonth(), dueDayOfMonth);
        break;
    }
  }

  return nextDate;
}
