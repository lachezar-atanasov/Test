/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function isValidPassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 6) {
    errors.push('Паролата трябва да е поне 6 символа');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate required field
 */
export function isRequired(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

/**
 * Validate numeric value
 */
export function isValidNumber(value: unknown): boolean {
  if (typeof value === 'number') return !isNaN(value) && isFinite(value);
  if (typeof value === 'string') {
    const num = parseFloat(value);
    return !isNaN(num) && isFinite(num);
  }
  return false;
}

/**
 * Validate positive number
 */
export function isPositiveNumber(value: unknown): boolean {
  if (!isValidNumber(value)) return false;
  const num = typeof value === 'string' ? parseFloat(value) : (value as number);
  return num > 0;
}

/**
 * Validate day of month (1-31)
 */
export function isValidDayOfMonth(day: number): boolean {
  return Number.isInteger(day) && day >= 1 && day <= 31;
}

/**
 * Validate date string format (YYYY-MM-DD)
 */
export function isValidDateString(dateString: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) return false;

  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Sanitize input string
 */
export function sanitizeInput(input: string): string {
  return input.trim().replace(/\s+/g, ' ');
}

/**
 * Validate bill form data
 */
export interface BillFormData {
  title: string;
  categoryId: string;
  amount?: string;
  dueDate?: string;
  dueDay?: number;
  recurrenceType?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateBillForm(data: BillFormData): ValidationResult {
  const errors: Record<string, string> = {};

  if (!isRequired(data.title)) {
    errors.title = 'Заглавието е задължително';
  }

  if (!isRequired(data.categoryId)) {
    errors.categoryId = 'Категорията е задължителна';
  }

  if (data.amount !== undefined && data.amount !== '') {
    if (!isValidNumber(data.amount)) {
      errors.amount = 'Невалидна сума';
    } else if (!isPositiveNumber(data.amount)) {
      errors.amount = 'Сумата трябва да е положително число';
    }
  }

  if (data.dueDate && !isValidDateString(data.dueDate)) {
    errors.dueDate = 'Невалидна дата';
  }

  if (data.dueDay !== undefined && !isValidDayOfMonth(data.dueDay)) {
    errors.dueDay = 'Невалиден ден от месеца (1-31)';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
