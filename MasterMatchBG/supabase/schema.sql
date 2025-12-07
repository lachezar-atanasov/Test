-- ============================================
-- MasterMatch BG - Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT CHECK (role IN ('client', 'master')),
  name TEXT,
  phone TEXT,
  city TEXT DEFAULT 'Sofia',
  district TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policies for users table
CREATE POLICY "Users can view all profiles" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- MASTER PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS master_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT,
  categories TEXT[] DEFAULT '{}',
  districts TEXT[] DEFAULT '{}',
  base_price_min INTEGER,
  base_price_max INTEGER,
  portfolio_urls TEXT[] DEFAULT '{}',
  years_experience INTEGER,
  is_verified BOOLEAN DEFAULT FALSE,
  average_rating DECIMAL(2,1),
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE master_profiles ENABLE ROW LEVEL SECURITY;

-- Policies for master_profiles
CREATE POLICY "Master profiles are viewable by everyone" ON master_profiles
  FOR SELECT USING (true);

CREATE POLICY "Masters can update their own profile" ON master_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Masters can insert their own profile" ON master_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- JOB REQUESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS job_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('plumbing', 'electrical', 'painting', 'tiling', 'carpentry', 'appliance_repair', 'cleaning', 'other')),
  budget_min INTEGER,
  budget_max INTEGER,
  city TEXT DEFAULT 'Sofia',
  district TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'assigned', 'completed', 'cancelled')),
  image_urls TEXT[] DEFAULT '{}',
  assigned_master_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE job_requests ENABLE ROW LEVEL SECURITY;

-- Policies for job_requests
CREATE POLICY "Open jobs are viewable by everyone" ON job_requests
  FOR SELECT USING (
    status = 'open' OR 
    client_id = auth.uid() OR 
    assigned_master_id = auth.uid()
  );

CREATE POLICY "Clients can create jobs" ON job_requests
  FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Clients can update their own jobs" ON job_requests
  FOR UPDATE USING (auth.uid() = client_id);

CREATE POLICY "Clients can delete their open jobs" ON job_requests
  FOR DELETE USING (auth.uid() = client_id AND status = 'open');

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_job_requests_status ON job_requests(status);
CREATE INDEX IF NOT EXISTS idx_job_requests_category ON job_requests(category);
CREATE INDEX IF NOT EXISTS idx_job_requests_district ON job_requests(district);
CREATE INDEX IF NOT EXISTS idx_job_requests_client_id ON job_requests(client_id);

-- ============================================
-- OFFERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES job_requests(id) ON DELETE CASCADE,
  master_id UUID REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  proposed_price INTEGER,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id, master_id) -- One offer per master per job
);

-- Enable RLS
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

-- Policies for offers
CREATE POLICY "Job owners can view offers on their jobs" ON offers
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM job_requests WHERE id = offers.job_id AND client_id = auth.uid()) OR
    master_id = auth.uid()
  );

CREATE POLICY "Masters can create offers" ON offers
  FOR INSERT WITH CHECK (
    auth.uid() = master_id AND
    EXISTS (SELECT 1 FROM job_requests WHERE id = job_id AND status = 'open')
  );

CREATE POLICY "Masters can delete their pending offers" ON offers
  FOR DELETE USING (
    auth.uid() = master_id AND status = 'pending'
  );

CREATE POLICY "Job owners can update offer status" ON offers
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM job_requests WHERE id = offers.job_id AND client_id = auth.uid())
  );

-- Index
CREATE INDEX IF NOT EXISTS idx_offers_job_id ON offers(job_id);
CREATE INDEX IF NOT EXISTS idx_offers_master_id ON offers(master_id);

-- ============================================
-- CHAT MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES job_requests(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Policies for chat_messages
CREATE POLICY "Chat participants can view messages" ON chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM job_requests 
      WHERE id = chat_messages.job_id 
      AND (client_id = auth.uid() OR assigned_master_id = auth.uid())
    )
  );

CREATE POLICY "Chat participants can send messages" ON chat_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM job_requests 
      WHERE id = job_id 
      AND status = 'assigned'
      AND (client_id = auth.uid() OR assigned_master_id = auth.uid())
    )
  );

-- Index
CREATE INDEX IF NOT EXISTS idx_chat_messages_job_id ON chat_messages(job_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);

-- Enable realtime for chat
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;

-- ============================================
-- REVIEWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID UNIQUE REFERENCES job_requests(id) ON DELETE CASCADE,
  client_id UUID REFERENCES users(id) ON DELETE CASCADE,
  master_id UUID REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Policies for reviews
CREATE POLICY "Reviews are viewable by everyone" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Clients can create reviews for completed jobs" ON reviews
  FOR INSERT WITH CHECK (
    auth.uid() = client_id AND
    EXISTS (
      SELECT 1 FROM job_requests 
      WHERE id = job_id 
      AND status = 'completed'
      AND client_id = auth.uid()
    )
  );

-- Index
CREATE INDEX IF NOT EXISTS idx_reviews_master_id ON reviews(master_id);

-- ============================================
-- STORAGE BUCKETS
-- ============================================
-- Run these in the Storage section of Supabase Dashboard:
-- 1. Create bucket: job-images (public)
-- 2. Create bucket: portfolio-images (public)
-- 3. Create bucket: avatars (public)

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_master_profiles_updated_at
  BEFORE UPDATE ON master_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_job_requests_updated_at
  BEFORE UPDATE ON job_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to create user profile after signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, phone, city)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    NEW.raw_user_meta_data->>'phone',
    'Sofia'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create user profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================
-- Uncomment to add sample data

/*
-- Sample users (you'll need to create these via auth first)
-- INSERT INTO users (id, email, role, name, district) VALUES
--   ('uuid-1', 'client@test.com', 'client', 'Ivan Petrov', 'Mladost 1'),
--   ('uuid-2', 'master@test.com', 'master', 'Georgi Dimitrov', 'Center');

-- Sample master profile
-- INSERT INTO master_profiles (user_id, bio, categories, districts, years_experience) VALUES
--   ('uuid-2', 'Professional plumber', ARRAY['plumbing', 'electrical'], ARRAY['Center', 'Lozenets'], 5);

-- Sample job
-- INSERT INTO job_requests (client_id, title, description, category, district, budget_min, budget_max) VALUES
--   ('uuid-1', 'Fix kitchen sink', 'Water is leaking...', 'plumbing', 'Mladost 1', 50, 100);
*/
