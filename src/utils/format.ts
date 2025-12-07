import { format, formatDistance, isToday, isTomorrow, isYesterday } from 'date-fns';
import { bg } from 'date-fns/locale';
import { t } from '../i18n';

/**
 * Format currency amount
 */
export function formatCurrency(amount: number, currency: string = 'BGN'): string {
  const formatted = amount.toFixed(2);
  
  if (currency === 'BGN') {
    return `${formatted} лв.`;
  }
  
  return new Intl.NumberFormat('bg-BG', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Format date in Bulgarian locale
 */
export function formatDate(date: Date | string, formatStr: string = 'dd MMM yyyy'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, formatStr, { locale: bg });
}

/**
 * Format date relative to today (e.g., "Днес", "Утре", "След 3 дни")
 */
export function formatRelativeDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isToday(dateObj)) {
    return t('dashboard.dueToday');
  }
  
  if (isTomorrow(dateObj)) {
    return t('dashboard.dueTomorrow');
  }
  
  if (isYesterday(dateObj)) {
    return 'Вчера';
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dateObj.setHours(0, 0, 0, 0);
  
  const diffTime = dateObj.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays > 0 && diffDays <= 7) {
    return t('dashboard.dueIn', { days: diffDays.toString() });
  }
  
  if (diffDays < 0) {
    return t('dashboard.overdueDays', { days: Math.abs(diffDays).toString() });
  }
  
  return formatDate(dateObj, 'dd MMM');
}

/**
 * Format month name in Bulgarian
 */
export function formatMonth(monthIndex: number): string {
  const months = [
    t('months.january'),
    t('months.february'),
    t('months.march'),
    t('months.april'),
    t('months.may'),
    t('months.june'),
    t('months.july'),
    t('months.august'),
    t('months.september'),
    t('months.october'),
    t('months.november'),
    t('months.december'),
  ];
  
  return months[monthIndex] || '';
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format number with thousand separators
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('bg-BG').format(value);
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3)}...`;
}

/**
 * Format day of month with ordinal (1-ви, 2-ри, etc.)
 */
export function formatDayOfMonth(day: number): string {
  if (day === 1) return '1-ви';
  if (day === 2) return '2-ри';
  return `${day}-ти`;
}

/**
 * Parse date string to Date object
 */
export function parseDate(dateString: string): Date {
  return new Date(dateString);
}

/**
 * Get current date as ISO string (YYYY-MM-DD)
 */
export function getCurrentDateString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

/**
 * Get first day of current month
 */
export function getFirstDayOfMonth(date: Date = new Date()): string {
  return format(new Date(date.getFullYear(), date.getMonth(), 1), 'yyyy-MM-dd');
}

/**
 * Get last day of current month
 */
export function getLastDayOfMonth(date: Date = new Date()): string {
  return format(new Date(date.getFullYear(), date.getMonth() + 1, 0), 'yyyy-MM-dd');
}
