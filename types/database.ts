// Database type definitions for Supabase

export type UserRole = 'client' | 'master';

export type JobStatus = 'open' | 'assigned' | 'completed' | 'cancelled';

export type OfferStatus = 'pending' | 'accepted' | 'rejected';

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface MasterProfile {
  id: string;
  services: string[];
  districts: string[];
  hourly_rate: number | null;
  bio: string | null;
  rating: number;
  total_reviews: number;
  created_at: string;
  updated_at: string;
}

export interface JobRequest {
  id: string;
  client_id: string;
  title: string;
  description: string;
  district: string;
  budget_min: number | null;
  budget_max: number | null;
  status: JobStatus;
  assigned_master_id: string | null;
  images: string[];
  created_at: string;
  updated_at: string;
}

export interface Offer {
  id: string;
  job_request_id: string;
  master_id: string;
  price: number;
  message: string | null;
  status: OfferStatus;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  job_request_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export interface Review {
  id: string;
  job_request_id: string;
  client_id: string;
  master_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}
