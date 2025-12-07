// ============================================
// MasterMatch BG - TypeScript Types
// ============================================

// User roles
export type UserRole = 'client' | 'master';

// Job categories
export type JobCategory = 
  | 'plumbing' 
  | 'electrical' 
  | 'painting' 
  | 'tiling' 
  | 'carpentry'
  | 'appliance_repair'
  | 'cleaning'
  | 'other';

// Job status
export type JobStatus = 'open' | 'assigned' | 'completed' | 'cancelled';

// Sofia districts
export type SofiaDistrict = 
  | 'Center'
  | 'Lozenets'
  | 'Mladost 1'
  | 'Mladost 2'
  | 'Mladost 3'
  | 'Mladost 4'
  | 'Lyulin 1'
  | 'Lyulin 2'
  | 'Lyulin 3'
  | 'Lyulin 4'
  | 'Lyulin 5'
  | 'Lyulin 6'
  | 'Lyulin 7'
  | 'Lyulin 8'
  | 'Lyulin 9'
  | 'Lyulin 10'
  | 'Nadezhda'
  | 'Oborishte'
  | 'Studentski Grad'
  | 'Vitosha'
  | 'Krasno Selo'
  | 'Ovcha Kupel'
  | 'Druzhba 1'
  | 'Druzhba 2'
  | 'Iztok'
  | 'Geo Milev'
  | 'Reduta'
  | 'Slatina'
  | 'Poduyane'
  | 'Hadji Dimitar'
  | 'Banishora'
  | 'Ilinden'
  | 'Krasna Polyana'
  | 'Svoboda'
  | 'Manastirski Livadi'
  | 'Borovo'
  | 'Boyana'
  | 'Dragalevtsi'
  | 'Simeonovo'
  | 'Other';

// ============================================
// Database Entities
// ============================================

export interface User {
  id: string;
  email: string;
  role: UserRole | null;
  name: string | null;
  phone: string | null;
  city: string;
  district: SofiaDistrict | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface MasterProfile {
  id: string;
  user_id: string;
  bio: string | null;
  categories: JobCategory[];
  districts: SofiaDistrict[];
  base_price_min: number | null;
  base_price_max: number | null;
  portfolio_urls: string[];
  years_experience: number | null;
  is_verified: boolean;
  average_rating: number | null;
  total_reviews: number;
  created_at: string;
  updated_at: string;
}

export interface JobRequest {
  id: string;
  client_id: string;
  title: string;
  description: string;
  category: JobCategory;
  budget_min: number | null;
  budget_max: number | null;
  city: string;
  district: SofiaDistrict;
  status: JobStatus;
  image_urls: string[];
  assigned_master_id: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  client?: User;
  assigned_master?: User;
  offers_count?: number;
}

export interface Offer {
  id: string;
  job_id: string;
  master_id: string;
  message: string;
  proposed_price: number | null;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  // Joined data
  master?: User;
  master_profile?: MasterProfile;
  job?: JobRequest;
}

export interface ChatMessage {
  id: string;
  job_id: string;
  sender_id: string;
  text: string;
  created_at: string;
  // Joined data
  sender?: User;
}

export interface Review {
  id: string;
  job_id: string;
  client_id: string;
  master_id: string;
  rating: number; // 1-5
  comment: string | null;
  created_at: string;
  // Joined data
  client?: User;
  job?: JobRequest;
}

// ============================================
// Form/Input Types
// ============================================

export interface CreateJobInput {
  title: string;
  description: string;
  category: JobCategory;
  district: SofiaDistrict;
  budget_min?: number;
  budget_max?: number;
  images?: string[]; // base64 or URIs
}

export interface CreateOfferInput {
  job_id: string;
  message: string;
  proposed_price?: number;
}

export interface UpdateMasterProfileInput {
  bio?: string;
  categories?: JobCategory[];
  districts?: SofiaDistrict[];
  base_price_min?: number;
  base_price_max?: number;
  years_experience?: number;
}

export interface CreateReviewInput {
  job_id: string;
  master_id: string;
  rating: number;
  comment?: string;
}

// ============================================
// Auth Types
// ============================================

export interface AuthState {
  user: User | null;
  session: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
  phone?: string;
}
