import {
  formatPrice,
  formatPriceRange,
  getCategoryLabel,
  formatDate,
  formatRelativeTime,
  getInitials,
  truncateText,
  formatPhoneNumber,
  calculateStars,
} from '../lib/formatters';

describe('Price Formatting', () => {
  test('formatPrice should format price with currency', () => {
    expect(formatPrice(50)).toBe('50 BGN');
    expect(formatPrice(100, 'EUR')).toBe('100 EUR');
  });

  test('formatPriceRange should format range correctly', () => {
    expect(formatPriceRange(50, 100)).toBe('50 - 100 BGN');
    expect(formatPriceRange(50, undefined)).toBe('From 50 BGN');
    expect(formatPriceRange(undefined, 100)).toBe('Up to 100 BGN');
    expect(formatPriceRange(undefined, undefined)).toBeNull();
  });
});

describe('Category Labels', () => {
  test('getCategoryLabel should return correct labels', () => {
    expect(getCategoryLabel('plumbing')).toBe('Plumbing');
    expect(getCategoryLabel('electrical')).toBe('Electrical');
    expect(getCategoryLabel('cleaning')).toBe('Cleaning');
  });

  test('getCategoryLabel should return input for unknown category', () => {
    expect(getCategoryLabel('unknown')).toBe('unknown');
  });
});

describe('Date Formatting', () => {
  test('formatDate should format date string', () => {
    const result = formatDate('2024-03-15');
    expect(result).toContain('Mar');
    expect(result).toContain('15');
    expect(result).toContain('2024');
  });

  test('formatDate should handle Date object', () => {
    const date = new Date('2024-03-15');
    const result = formatDate(date);
    expect(result).toContain('Mar');
  });
});

describe('Relative Time', () => {
  test('formatRelativeTime should show "Just now" for recent times', () => {
    const now = new Date();
    expect(formatRelativeTime(now)).toBe('Just now');
  });

  test('formatRelativeTime should show minutes ago', () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    expect(formatRelativeTime(fiveMinutesAgo)).toBe('5 minutes ago');
  });

  test('formatRelativeTime should show hours ago', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    expect(formatRelativeTime(twoHoursAgo)).toBe('2 hours ago');
  });

  test('formatRelativeTime should show days ago', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(threeDaysAgo)).toBe('3 days ago');
  });
});

describe('Initials', () => {
  test('getInitials should return two letters from name', () => {
    expect(getInitials('John Doe')).toBe('JD');
    expect(getInitials('Alice Smith')).toBe('AS');
  });

  test('getInitials should handle single name', () => {
    expect(getInitials('John')).toBe('JO');
  });

  test('getInitials should handle multiple names', () => {
    expect(getInitials('John Michael Doe')).toBe('JM');
  });

  test('getInitials should handle empty/undefined', () => {
    expect(getInitials('')).toBe('?');
    expect(getInitials(undefined)).toBe('?');
  });
});

describe('Text Truncation', () => {
  test('truncateText should truncate long text', () => {
    const longText = 'This is a very long text that needs to be truncated';
    expect(truncateText(longText, 20)).toBe('This is a very lo...');
  });

  test('truncateText should not truncate short text', () => {
    const shortText = 'Short';
    expect(truncateText(shortText, 20)).toBe('Short');
  });
});

describe('Phone Formatting', () => {
  test('formatPhoneNumber should format Bulgarian numbers', () => {
    expect(formatPhoneNumber('359888123456')).toBe('+359 888 123 456');
  });

  test('formatPhoneNumber should return unformatted for other numbers', () => {
    expect(formatPhoneNumber('12345')).toBe('12345');
  });
});

describe('Star Rating Calculation', () => {
  test('calculateStars should handle whole numbers', () => {
    expect(calculateStars(5)).toEqual({ filled: 5, half: false, empty: 0 });
    expect(calculateStars(3)).toEqual({ filled: 3, half: false, empty: 2 });
    expect(calculateStars(0)).toEqual({ filled: 0, half: false, empty: 5 });
  });

  test('calculateStars should handle half stars', () => {
    expect(calculateStars(4.5)).toEqual({ filled: 4, half: true, empty: 0 });
    expect(calculateStars(3.5)).toEqual({ filled: 3, half: true, empty: 1 });
    expect(calculateStars(2.7)).toEqual({ filled: 2, half: true, empty: 2 });
  });

  test('calculateStars should handle fractional without half', () => {
    expect(calculateStars(4.3)).toEqual({ filled: 4, half: false, empty: 1 });
  });
});
