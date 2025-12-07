import { SERVICE_CATEGORIES } from '@/types';
import { JOB_STATUS_COLORS, JOB_STATUS_LABELS, OFFER_STATUS_LABELS } from '@/config/constants';

/**
 * Format a price with currency
 */
export function formatPrice(price: number, currency: string = 'BGN'): string {
  return `${price} ${currency}`;
}

/**
 * Format a price range
 */
export function formatPriceRange(
  min?: number,
  max?: number,
  currency: string = 'BGN'
): string | null {
  if (!min && !max) return null;
  if (min && max) return `${min} - ${max} ${currency}`;
  if (min) return `From ${min} ${currency}`;
  if (max) return `Up to ${max} ${currency}`;
  return null;
}

/**
 * Get the label for a service category
 */
export function getCategoryLabel(category: string): string {
  const found = SERVICE_CATEGORIES.find((c) => c.value === category);
  return found?.label || category;
}

/**
 * Get the label for a job status
 */
export function getJobStatusLabel(status: string): string {
  return JOB_STATUS_LABELS[status] || status;
}

/**
 * Get the color for a job status
 */
export function getJobStatusColor(status: string): string {
  return JOB_STATUS_COLORS[status] || '#64748b';
}

/**
 * Get the label for an offer status
 */
export function getOfferStatusLabel(status: string): string {
  return OFFER_STATUS_LABELS[status] || status;
}

/**
 * Format a date to a readable string
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format a date to a short string
 */
export function formatDateShort(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format time
 */
export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format a relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  
  return formatDateShort(d);
}

/**
 * Get initials from a name
 */
export function getInitials(name?: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength - 3)}...`;
}

/**
 * Format a phone number (basic formatting)
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Basic Bulgarian format: +359 XXX XXX XXX
  if (digits.startsWith('359') && digits.length === 12) {
    return `+${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9)}`;
  }
  
  // Return as-is if no pattern matches
  return phone;
}

/**
 * Calculate star rating display
 */
export function calculateStars(rating: number, maxStars: number = 5): {
  filled: number;
  half: boolean;
  empty: number;
} {
  const filled = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  const empty = maxStars - filled - (half ? 1 : 0);
  
  return { filled, half, empty };
}
