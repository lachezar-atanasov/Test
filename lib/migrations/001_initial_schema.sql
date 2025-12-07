-- MasterMatch BG - Initial Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  role TEXT CHECK (role IN ('client', 'master')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Master profiles (additional info for masters)
CREATE TABLE IF NOT EXISTS master_profiles (
  id UUID REFERENCES profiles(id) PRIMARY KEY,
  services TEXT[], -- Array of service types
  districts TEXT[], -- Array of districts served
  hourly_rate DECIMAL(10, 2),
  bio TEXT,
  rating DECIMAL(3, 2) DEFAULT 0.0,
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job requests table
CREATE TABLE IF NOT EXISTS job_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  district TEXT NOT NULL,
  budget_min DECIMAL(10, 2),
  budget_max DECIMAL(10, 2),
  status TEXT CHECK (status IN ('open', 'assigned', 'completed', 'cancelled')) DEFAULT 'open',
  assigned_master_id UUID REFERENCES profiles(id),
  images TEXT[], -- Array of image URLs from Supabase Storage
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Offers table
CREATE TABLE IF NOT EXISTS offers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  job_request_id UUID REFERENCES job_requests(id) ON DELETE CASCADE NOT NULL,
  master_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  message TEXT,
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(job_request_id, master_id) -- One offer per master per job
);

-- Messages table (for chat)
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  job_request_id UUID REFERENCES job_requests(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  job_request_id UUID REFERENCES job_requests(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  master_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(job_request_id) -- One review per job
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_job_requests_client_id ON job_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_job_requests_status ON job_requests(status);
CREATE INDEX IF NOT EXISTS idx_job_requests_district ON job_requests(district);
CREATE INDEX IF NOT EXISTS idx_offers_job_request_id ON offers(job_request_id);
CREATE INDEX IF NOT EXISTS idx_offers_master_id ON offers(master_id);
CREATE INDEX IF NOT EXISTS idx_messages_job_request_id ON messages(job_request_id);
CREATE INDEX IF NOT EXISTS idx_reviews_master_id ON reviews(master_id);

-- Row Level Security (RLS) Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read all, update own
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Master profiles: Users can read all, update own
CREATE POLICY "Users can view all master profiles" ON master_profiles FOR SELECT USING (true);
CREATE POLICY "Masters can update own profile" ON master_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Masters can insert own profile" ON master_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Job requests: Clients can create/read own, Masters can read open/assigned
CREATE POLICY "Clients can create job requests" ON job_requests FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Users can read relevant job requests" ON job_requests FOR SELECT USING (
  client_id = auth.uid() OR 
  status = 'open' OR 
  assigned_master_id = auth.uid()
);
CREATE POLICY "Clients can update own job requests" ON job_requests FOR UPDATE USING (client_id = auth.uid());

-- Offers: Masters can create for open jobs, both parties can read
CREATE POLICY "Masters can create offers" ON offers FOR INSERT WITH CHECK (
  auth.uid() = master_id AND
  EXISTS (SELECT 1 FROM job_requests WHERE id = job_request_id AND status = 'open')
);
CREATE POLICY "Users can read relevant offers" ON offers FOR SELECT USING (
  master_id = auth.uid() OR
  EXISTS (SELECT 1 FROM job_requests WHERE id = job_request_id AND client_id = auth.uid())
);
CREATE POLICY "Clients can update offers for their jobs" ON offers FOR UPDATE USING (
  EXISTS (SELECT 1 FROM job_requests WHERE id = job_request_id AND client_id = auth.uid())
);

-- Messages: Participants can read/write
CREATE POLICY "Users can read messages for their jobs" ON messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM job_requests 
    WHERE id = job_request_id AND (client_id = auth.uid() OR assigned_master_id = auth.uid())
  )
);
CREATE POLICY "Users can send messages for their jobs" ON messages FOR INSERT WITH CHECK (
  sender_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM job_requests 
    WHERE id = job_request_id AND (client_id = auth.uid() OR assigned_master_id = auth.uid())
  )
);

-- Reviews: Clients can create, all can read
CREATE POLICY "Users can read all reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Clients can create reviews for their jobs" ON reviews FOR INSERT WITH CHECK (
  client_id = auth.uid() AND
  EXISTS (SELECT 1 FROM job_requests WHERE id = job_request_id AND client_id = auth.uid() AND status = 'completed')
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_master_profiles_updated_at BEFORE UPDATE ON master_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_job_requests_updated_at BEFORE UPDATE ON job_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_offers_updated_at BEFORE UPDATE ON offers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
