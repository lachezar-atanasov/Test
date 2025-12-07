import {
  isValidEmail,
  isValidPassword,
  isValidPhone,
  validateLoginForm,
  validateRegisterForm,
  validateJobRequestForm,
  validateOfferForm,
  validateReviewForm,
  errorsToRecord,
} from '../lib/validation';

describe('Email Validation', () => {
  test('valid emails should pass', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user.name@domain.co')).toBe(true);
    expect(isValidEmail('user+tag@example.org')).toBe(true);
  });

  test('invalid emails should fail', () => {
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail('notanemail')).toBe(false);
    expect(isValidEmail('missing@domain')).toBe(false);
    expect(isValidEmail('@nodomain.com')).toBe(false);
    expect(isValidEmail('spaces in@email.com')).toBe(false);
  });
});

describe('Password Validation', () => {
  test('valid passwords should pass', () => {
    expect(isValidPassword('123456')).toBe(true);
    expect(isValidPassword('password123')).toBe(true);
    expect(isValidPassword('verylongpassword')).toBe(true);
  });

  test('invalid passwords should fail', () => {
    expect(isValidPassword('')).toBe(false);
    expect(isValidPassword('12345')).toBe(false);
    expect(isValidPassword('short')).toBe(false);
  });
});

describe('Phone Validation', () => {
  test('valid phones should pass', () => {
    expect(isValidPhone('')).toBe(true); // Optional
    expect(isValidPhone('+359 888 123456')).toBe(true);
    expect(isValidPhone('0888123456')).toBe(true);
    expect(isValidPhone('+1 (555) 123-4567')).toBe(true);
  });

  test('invalid phones should fail', () => {
    expect(isValidPhone('abc')).toBe(false);
    expect(isValidPhone('12')).toBe(false);
  });
});

describe('Login Form Validation', () => {
  test('valid login form should pass', () => {
    const result = validateLoginForm({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('empty email should fail', () => {
    const result = validateLoginForm({
      email: '',
      password: 'password123',
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.find((e) => e.field === 'email')).toBeDefined();
  });

  test('invalid email should fail', () => {
    const result = validateLoginForm({
      email: 'notanemail',
      password: 'password123',
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.find((e) => e.field === 'email')?.message).toContain('valid email');
  });

  test('short password should fail', () => {
    const result = validateLoginForm({
      email: 'test@example.com',
      password: '12345',
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.find((e) => e.field === 'password')).toBeDefined();
  });
});

describe('Register Form Validation', () => {
  test('valid register form should pass', () => {
    const result = validateRegisterForm({
      email: 'test@example.com',
      password: 'password123',
      full_name: 'John Doe',
      role: 'client',
    });
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('missing full name should fail', () => {
    const result = validateRegisterForm({
      email: 'test@example.com',
      password: 'password123',
      full_name: '',
      role: 'client',
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.find((e) => e.field === 'full_name')).toBeDefined();
  });

  test('missing role should fail', () => {
    const result = validateRegisterForm({
      email: 'test@example.com',
      password: 'password123',
      full_name: 'John Doe',
      role: '' as any,
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.find((e) => e.field === 'role')).toBeDefined();
  });

  test('invalid phone should fail', () => {
    const result = validateRegisterForm({
      email: 'test@example.com',
      password: 'password123',
      full_name: 'John Doe',
      phone: 'ab',
      role: 'client',
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.find((e) => e.field === 'phone')).toBeDefined();
  });
});

describe('Job Request Form Validation', () => {
  const validForm = {
    title: 'Fix leaking faucet',
    description: 'The kitchen faucet is leaking and needs repair.',
    category: 'plumbing' as const,
    district: 'Lozenets',
    images: [],
  };

  test('valid job form should pass', () => {
    const result = validateJobRequestForm(validForm);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('missing title should fail', () => {
    const result = validateJobRequestForm({ ...validForm, title: '' });
    expect(result.isValid).toBe(false);
    expect(result.errors.find((e) => e.field === 'title')).toBeDefined();
  });

  test('title too long should fail', () => {
    const result = validateJobRequestForm({
      ...validForm,
      title: 'a'.repeat(101),
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.find((e) => e.field === 'title')?.message).toContain('less than');
  });

  test('missing description should fail', () => {
    const result = validateJobRequestForm({ ...validForm, description: '' });
    expect(result.isValid).toBe(false);
    expect(result.errors.find((e) => e.field === 'description')).toBeDefined();
  });

  test('missing category should fail', () => {
    const result = validateJobRequestForm({ ...validForm, category: '' as any });
    expect(result.isValid).toBe(false);
    expect(result.errors.find((e) => e.field === 'category')).toBeDefined();
  });

  test('missing district should fail', () => {
    const result = validateJobRequestForm({ ...validForm, district: '' });
    expect(result.isValid).toBe(false);
    expect(result.errors.find((e) => e.field === 'district')).toBeDefined();
  });

  test('invalid budget range should fail', () => {
    const result = validateJobRequestForm({
      ...validForm,
      budget_min: 100,
      budget_max: 50,
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.find((e) => e.field === 'budget_max')).toBeDefined();
  });

  test('too many images should fail', () => {
    const result = validateJobRequestForm({
      ...validForm,
      images: ['1', '2', '3', '4', '5', '6'],
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.find((e) => e.field === 'images')).toBeDefined();
  });
});

describe('Offer Form Validation', () => {
  test('valid offer form should pass', () => {
    const result = validateOfferForm({ price: 50 });
    expect(result.isValid).toBe(true);
  });

  test('zero price should fail', () => {
    const result = validateOfferForm({ price: 0 });
    expect(result.isValid).toBe(false);
    expect(result.errors.find((e) => e.field === 'price')).toBeDefined();
  });

  test('negative price should fail', () => {
    const result = validateOfferForm({ price: -10 });
    expect(result.isValid).toBe(false);
  });
});

describe('Review Form Validation', () => {
  test('valid review form should pass', () => {
    const result = validateReviewForm({ rating: 5 });
    expect(result.isValid).toBe(true);
  });

  test('rating too low should fail', () => {
    const result = validateReviewForm({ rating: 0 });
    expect(result.isValid).toBe(false);
  });

  test('rating too high should fail', () => {
    const result = validateReviewForm({ rating: 6 });
    expect(result.isValid).toBe(false);
  });
});

describe('Utility Functions', () => {
  test('errorsToRecord should convert errors array', () => {
    const errors = [
      { field: 'email', message: 'Invalid email' },
      { field: 'password', message: 'Too short' },
    ];
    const record = errorsToRecord(errors);
    expect(record.email).toBe('Invalid email');
    expect(record.password).toBe('Too short');
  });
});
