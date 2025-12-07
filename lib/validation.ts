import { VALIDATION } from '@/config/constants';
import { LoginForm, RegisterForm, JobRequestForm, OfferForm, ReviewForm } from '@/types';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Email validation
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Password validation
export function isValidPassword(password: string): boolean {
  return password.length >= VALIDATION.MIN_PASSWORD_LENGTH;
}

// Phone validation (optional, basic format)
export function isValidPhone(phone: string): boolean {
  if (!phone) return true; // Phone is optional
  const phoneRegex = /^[\d\s+\-()]+$/;
  return phone.length >= 6 && phoneRegex.test(phone);
}

// Validate login form
export function validateLoginForm(form: LoginForm): ValidationResult {
  const errors: ValidationError[] = [];

  if (!form.email.trim()) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!isValidEmail(form.email)) {
    errors.push({ field: 'email', message: 'Please enter a valid email' });
  }

  if (!form.password) {
    errors.push({ field: 'password', message: 'Password is required' });
  } else if (!isValidPassword(form.password)) {
    errors.push({
      field: 'password',
      message: `Password must be at least ${VALIDATION.MIN_PASSWORD_LENGTH} characters`,
    });
  }

  return { isValid: errors.length === 0, errors };
}

// Validate registration form
export function validateRegisterForm(form: RegisterForm): ValidationResult {
  const errors: ValidationError[] = [];

  if (!form.full_name.trim()) {
    errors.push({ field: 'full_name', message: 'Full name is required' });
  }

  if (!form.email.trim()) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!isValidEmail(form.email)) {
    errors.push({ field: 'email', message: 'Please enter a valid email' });
  }

  if (!form.password) {
    errors.push({ field: 'password', message: 'Password is required' });
  } else if (!isValidPassword(form.password)) {
    errors.push({
      field: 'password',
      message: `Password must be at least ${VALIDATION.MIN_PASSWORD_LENGTH} characters`,
    });
  }

  if (form.phone && !isValidPhone(form.phone)) {
    errors.push({ field: 'phone', message: 'Please enter a valid phone number' });
  }

  if (!form.role) {
    errors.push({ field: 'role', message: 'Please select a role' });
  }

  return { isValid: errors.length === 0, errors };
}

// Validate job request form
export function validateJobRequestForm(form: JobRequestForm): ValidationResult {
  const errors: ValidationError[] = [];

  if (!form.title.trim()) {
    errors.push({ field: 'title', message: 'Title is required' });
  } else if (form.title.length > VALIDATION.MAX_TITLE_LENGTH) {
    errors.push({
      field: 'title',
      message: `Title must be less than ${VALIDATION.MAX_TITLE_LENGTH} characters`,
    });
  }

  if (!form.description.trim()) {
    errors.push({ field: 'description', message: 'Description is required' });
  } else if (form.description.length > VALIDATION.MAX_DESCRIPTION_LENGTH) {
    errors.push({
      field: 'description',
      message: `Description must be less than ${VALIDATION.MAX_DESCRIPTION_LENGTH} characters`,
    });
  }

  if (!form.category) {
    errors.push({ field: 'category', message: 'Please select a category' });
  }

  if (!form.district) {
    errors.push({ field: 'district', message: 'Please select a district' });
  }

  if (form.budget_min && form.budget_max && form.budget_min > form.budget_max) {
    errors.push({
      field: 'budget_max',
      message: 'Maximum budget must be greater than minimum',
    });
  }

  if (form.images.length > VALIDATION.MAX_IMAGES_PER_JOB) {
    errors.push({
      field: 'images',
      message: `You can only add up to ${VALIDATION.MAX_IMAGES_PER_JOB} images`,
    });
  }

  return { isValid: errors.length === 0, errors };
}

// Validate offer form
export function validateOfferForm(form: OfferForm): ValidationResult {
  const errors: ValidationError[] = [];

  if (!form.price || form.price <= 0) {
    errors.push({ field: 'price', message: 'Please enter a valid price' });
  }

  return { isValid: errors.length === 0, errors };
}

// Validate review form
export function validateReviewForm(form: ReviewForm): ValidationResult {
  const errors: ValidationError[] = [];

  if (!form.rating || form.rating < 1 || form.rating > 5) {
    errors.push({ field: 'rating', message: 'Rating must be between 1 and 5' });
  }

  return { isValid: errors.length === 0, errors };
}

// Helper to get error message for a field
export function getFieldError(errors: ValidationError[], field: string): string | undefined {
  return errors.find((e) => e.field === field)?.message;
}

// Helper to convert validation errors to a record
export function errorsToRecord(errors: ValidationError[]): Record<string, string> {
  return errors.reduce((acc, error) => {
    acc[error.field] = error.message;
    return acc;
  }, {} as Record<string, string>);
}
