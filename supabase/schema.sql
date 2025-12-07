-- MasterMatch BG Database Schema
-- Run this in your Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL CHECK (role IN ('client', 'master')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MASTER PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS master_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  services TEXT[] DEFAULT '{}',
  districts TEXT[] DEFAULT '{}',
  description TEXT,
  hourly_rate INTEGER,
  experience_years INTEGER,
  average_rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- JOB REQUESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS job_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  district TEXT NOT NULL,
  address TEXT,
  budget_min INTEGER,
  budget_max INTEGER,
  preferred_date DATE,
  images TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'assigned', 'in_progress', 'completed', 'cancelled')),
  assigned_master_id UUID REFERENCES master_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- OFFERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES job_requests(id) ON DELETE CASCADE,
  master_id UUID NOT NULL REFERENCES master_profiles(id) ON DELETE CASCADE,
  price DECIMAL(10,2) NOT NULL,
  estimated_duration TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id, master_id)
);

-- ============================================
-- CHAT MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES job_requests(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- REVIEWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID UNIQUE NOT NULL REFERENCES job_requests(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  master_id UUID NOT NULL REFERENCES master_profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_job_requests_client_id ON job_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_job_requests_status ON job_requests(status);
CREATE INDEX IF NOT EXISTS idx_job_requests_category ON job_requests(category);
CREATE INDEX IF NOT EXISTS idx_job_requests_district ON job_requests(district);
CREATE INDEX IF NOT EXISTS idx_job_requests_assigned_master ON job_requests(assigned_master_id);

CREATE INDEX IF NOT EXISTS idx_offers_job_id ON offers(job_id);
CREATE INDEX IF NOT EXISTS idx_offers_master_id ON offers(master_id);
CREATE INDEX IF NOT EXISTS idx_offers_status ON offers(status);

CREATE INDEX IF NOT EXISTS idx_chat_messages_job_id ON chat_messages(job_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);

CREATE INDEX IF NOT EXISTS idx_reviews_master_id ON reviews(master_id);
CREATE INDEX IF NOT EXISTS idx_reviews_client_id ON reviews(client_id);

CREATE INDEX IF NOT EXISTS idx_master_profiles_user_id ON master_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_master_profiles_services ON master_profiles USING GIN(services);
CREATE INDEX IF NOT EXISTS idx_master_profiles_districts ON master_profiles USING GIN(districts);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view all profiles" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Master profiles policies
CREATE POLICY "Master profiles are viewable by everyone" ON master_profiles
  FOR SELECT USING (true);

CREATE POLICY "Masters can update own profile" ON master_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Masters can insert own profile" ON master_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Job requests policies
CREATE POLICY "Jobs are viewable by everyone" ON job_requests
  FOR SELECT USING (true);

CREATE POLICY "Clients can create jobs" ON job_requests
  FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Clients can update own jobs" ON job_requests
  FOR UPDATE USING (auth.uid() = client_id);

-- Offers policies
CREATE POLICY "Job owners and offer makers can view offers" ON offers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM job_requests WHERE id = offers.job_id AND client_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM master_profiles WHERE id = offers.master_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Masters can create offers" ON offers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM master_profiles WHERE id = master_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Offer participants can update offers" ON offers
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM job_requests WHERE id = offers.job_id AND client_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM master_profiles WHERE id = offers.master_id AND user_id = auth.uid()
    )
  );

-- Chat messages policies
CREATE POLICY "Job participants can view messages" ON chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM job_requests j
      LEFT JOIN master_profiles mp ON mp.id = j.assigned_master_id
      WHERE j.id = chat_messages.job_id
      AND (j.client_id = auth.uid() OR mp.user_id = auth.uid())
    )
  );

CREATE POLICY "Job participants can send messages" ON chat_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM job_requests j
      LEFT JOIN master_profiles mp ON mp.id = j.assigned_master_id
      WHERE j.id = job_id
      AND (j.client_id = auth.uid() OR mp.user_id = auth.uid())
    )
    AND auth.uid() = sender_id
  );

-- Reviews policies
CREATE POLICY "Reviews are viewable by everyone" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Clients can create reviews for their jobs" ON reviews
  FOR INSERT WITH CHECK (
    auth.uid() = client_id
    AND EXISTS (
      SELECT 1 FROM job_requests
      WHERE id = job_id AND client_id = auth.uid() AND status = 'completed'
    )
  );

-- ============================================
-- STORAGE BUCKETS
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('job-images', 'job-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Anyone can view job images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'job-images');

CREATE POLICY "Authenticated users can upload job images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'job-images' AND auth.role() = 'authenticated');

CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own avatars"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_master_profiles_updated_at
  BEFORE UPDATE ON master_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_requests_updated_at
  BEFORE UPDATE ON job_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_offers_updated_at
  BEFORE UPDATE ON offers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime for chat messages
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
