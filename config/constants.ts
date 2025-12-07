// App Constants
export const APP_NAME = 'MasterMatch BG';

// Supabase Configuration
// These should be replaced with actual values from your Supabase project
export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

// Storage Buckets
export const STORAGE_BUCKETS = {
  JOB_IMAGES: 'job-images',
  AVATARS: 'avatars',
};

// Pagination
export const DEFAULT_PAGE_SIZE = 20;

// Validation
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 6,
  MAX_TITLE_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 1000,
  MAX_IMAGES_PER_JOB: 5,
  MAX_IMAGE_SIZE_MB: 5,
};

// Job Status Labels
export const JOB_STATUS_LABELS: Record<string, string> = {
  open: 'Open',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

// Job Status Colors
export const JOB_STATUS_COLORS: Record<string, string> = {
  open: '#22c55e',
  assigned: '#3b82f6',
  in_progress: '#f59e0b',
  completed: '#6b7280',
  cancelled: '#ef4444',
};

// Offer Status Labels
export const OFFER_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
};
