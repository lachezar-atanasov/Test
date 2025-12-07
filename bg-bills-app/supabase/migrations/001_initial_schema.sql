-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for recurrence type
CREATE TYPE recurrence_type_enum AS ENUM ('monthly', 'bi_monthly', 'quarterly', 'yearly', 'custom');

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  preferred_language TEXT DEFAULT 'bg',
  payday INTEGER CHECK (payday >= 1 AND payday <= 31),
  default_reminder_days_before INTEGER DEFAULT 3,
  currency TEXT DEFAULT 'BGN'
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Bill categories table
CREATE TABLE bill_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE bill_categories ENABLE ROW LEVEL SECURITY;

-- RLS policies for bill_categories
CREATE POLICY "Users can view own and default categories"
  ON bill_categories FOR SELECT
  USING (user_id = auth.uid() OR is_default = true OR user_id IS NULL);

CREATE POLICY "Users can insert own categories"
  ON bill_categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories"
  ON bill_categories FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories"
  ON bill_categories FOR DELETE
  USING (auth.uid() = user_id);

-- Bill accounts table
CREATE TABLE bill_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES bill_categories(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  provider_name TEXT NOT NULL,
  account_number TEXT,
  billing_website TEXT,
  payment_method_hint TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE bill_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own bill accounts"
  ON bill_accounts FOR ALL
  USING (auth.uid() = user_id);

-- Recurring bills table
CREATE TABLE recurring_bills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  bill_account_id UUID NOT NULL REFERENCES bill_accounts(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES bill_categories(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  expected_amount NUMERIC(12, 2),
  currency TEXT DEFAULT 'BGN',
  recurrence_type recurrence_type_enum NOT NULL,
  due_day_of_month INTEGER CHECK (due_day_of_month >= 1 AND due_day_of_month <= 31),
  custom_cron TEXT,
  is_active BOOLEAN DEFAULT true,
  reminder_days_before INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE recurring_bills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own recurring bills"
  ON recurring_bills FOR ALL
  USING (auth.uid() = user_id);

-- Bill payments table
CREATE TABLE bill_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recurring_bill_id UUID REFERENCES recurring_bills(id) ON DELETE SET NULL,
  bill_account_id UUID NOT NULL REFERENCES bill_accounts(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES bill_categories(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  currency TEXT DEFAULT 'BGN',
  due_date DATE NOT NULL,
  is_paid BOOLEAN DEFAULT false,
  paid_date DATE,
  is_overdue BOOLEAN DEFAULT false,
  attachment_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE bill_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own bill payments"
  ON bill_payments FOR ALL
  USING (auth.uid() = user_id);

-- Notification settings table
CREATE TABLE notification_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  enable_push BOOLEAN DEFAULT true,
  days_before INTEGER[] DEFAULT ARRAY[3, 0],
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own notification settings"
  ON notification_settings FOR ALL
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_bill_accounts_updated_at
  BEFORE UPDATE ON bill_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recurring_bills_updated_at
  BEFORE UPDATE ON recurring_bills
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bill_payments_updated_at
  BEFORE UPDATE ON bill_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_settings_updated_at
  BEFORE UPDATE ON notification_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, preferred_language, default_reminder_days_before, currency)
  VALUES (
    NEW.id,
    'bg',
    3,
    'BGN'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
