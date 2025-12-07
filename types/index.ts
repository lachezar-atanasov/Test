// User & Auth Types
export type UserRole = 'client' | 'master';

export interface User {
  id: string;
  email: string;
  phone?: string;
  full_name: string;
  avatar_url?: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface MasterProfile {
  id: string;
  user_id: string;
  services: ServiceCategory[];
  districts: string[];
  description?: string;
  hourly_rate?: number;
  experience_years?: number;
  average_rating: number;
  total_reviews: number;
  is_available: boolean;
  created_at: string;
  updated_at: string;
  user?: User;
}

// Service Categories
export type ServiceCategory = 
  | 'plumbing'
  | 'electrical'
  | 'cleaning'
  | 'painting'
  | 'carpentry'
  | 'appliance_repair'
  | 'moving'
  | 'gardening'
  | 'hvac'
  | 'locksmith'
  | 'pest_control'
  | 'other';

export const SERVICE_CATEGORIES: { value: ServiceCategory; label: string }[] = [
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'painting', label: 'Painting' },
  { value: 'carpentry', label: 'Carpentry' },
  { value: 'appliance_repair', label: 'Appliance Repair' },
  { value: 'moving', label: 'Moving' },
  { value: 'gardening', label: 'Gardening' },
  { value: 'hvac', label: 'HVAC' },
  { value: 'locksmith', label: 'Locksmith' },
  { value: 'pest_control', label: 'Pest Control' },
  { value: 'other', label: 'Other' },
];

// Districts (Sofia and surrounding areas as example)
export const DISTRICTS: string[] = [
  'Lozenets',
  'Mladost',
  'Studentski Grad',
  'Vitosha',
  'Oborishte',
  'Sredets',
  'Triaditsa',
  'Krasno Selo',
  'Serdika',
  'Poduyane',
  'Slatina',
  'Izgrev',
  'Iztok',
  'Bankya',
  'Lyulin',
  'Nadezhda',
  'Ovcha Kupel',
  'Pancharevo',
  'Other',
];

// Job Request Types
export type JobStatus = 'open' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';

export interface JobRequest {
  id: string;
  client_id: string;
  title: string;
  description: string;
  category: ServiceCategory;
  district: string;
  address?: string;
  budget_min?: number;
  budget_max?: number;
  preferred_date?: string;
  images: string[];
  status: JobStatus;
  assigned_master_id?: string;
  created_at: string;
  updated_at: string;
  client?: User;
  assigned_master?: MasterProfile;
  offers_count?: number;
}

// Offer Types
export type OfferStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';

export interface Offer {
  id: string;
  job_id: string;
  master_id: string;
  price: number;
  estimated_duration?: string;
  message?: string;
  status: OfferStatus;
  created_at: string;
  updated_at: string;
  job?: JobRequest;
  master?: MasterProfile;
}

// Chat Types
export interface ChatMessage {
  id: string;
  job_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender?: User;
}

// Review Types
export interface Review {
  id: string;
  job_id: string;
  client_id: string;
  master_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  client?: User;
  master?: MasterProfile;
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  role: UserRole;
}

export interface JobRequestForm {
  title: string;
  description: string;
  category: ServiceCategory;
  district: string;
  address?: string;
  budget_min?: number;
  budget_max?: number;
  preferred_date?: string;
  images: string[];
}

export interface OfferForm {
  price: number;
  estimated_duration?: string;
  message?: string;
}

export interface MasterProfileForm {
  services: ServiceCategory[];
  districts: string[];
  description?: string;
  hourly_rate?: number;
  experience_years?: number;
}

export interface ReviewForm {
  rating: number;
  comment?: string;
}
