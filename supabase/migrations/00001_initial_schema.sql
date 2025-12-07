-- BG Bills Database Schema
-- Initial migration for the Bulgarian Bills & Personal Finance Tracker

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE (extends auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    preferred_language TEXT DEFAULT 'bg' NOT NULL,
    payday INTEGER CHECK (payday >= 1 AND payday <= 31),
    default_reminder_days_before INTEGER DEFAULT 3 NOT NULL,
    currency TEXT DEFAULT 'BGN' NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- ============================================
-- BILL CATEGORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS bill_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT 'help-circle',
    color TEXT NOT NULL DEFAULT '#9E9E9E',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE bill_categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for categories
CREATE POLICY "Users can view default and own categories"
    ON bill_categories FOR SELECT
    USING (is_default = TRUE OR auth.uid() = user_id);

CREATE POLICY "Users can insert own categories"
    ON bill_categories FOR INSERT
    WITH CHECK (auth.uid() = user_id AND is_default = FALSE);

CREATE POLICY "Users can update own categories"
    ON bill_categories FOR UPDATE
    USING (auth.uid() = user_id AND is_default = FALSE);

CREATE POLICY "Users can delete own categories"
    ON bill_categories FOR DELETE
    USING (auth.uid() = user_id AND is_default = FALSE);

-- ============================================
-- BILL ACCOUNTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS bill_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES bill_categories(id),
    name TEXT NOT NULL,
    provider_name TEXT NOT NULL,
    account_number TEXT,
    billing_website TEXT,
    payment_method_hint TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE bill_accounts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own accounts"
    ON bill_accounts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own accounts"
    ON bill_accounts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own accounts"
    ON bill_accounts FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own accounts"
    ON bill_accounts FOR DELETE
    USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX idx_bill_accounts_user ON bill_accounts(user_id);

-- ============================================
-- RECURRING BILLS TABLE
-- ============================================
CREATE TYPE recurrence_type AS ENUM ('monthly', 'bi_monthly', 'quarterly', 'yearly', 'custom');

CREATE TABLE IF NOT EXISTS recurring_bills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    bill_account_id UUID NOT NULL REFERENCES bill_accounts(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES bill_categories(id),
    title TEXT NOT NULL,
    expected_amount NUMERIC(12, 2),
    currency TEXT DEFAULT 'BGN' NOT NULL,
    recurrence_type recurrence_type DEFAULT 'monthly' NOT NULL,
    due_day_of_month INTEGER CHECK (due_day_of_month >= 1 AND due_day_of_month <= 31),
    custom_cron TEXT,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    reminder_days_before INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE recurring_bills ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own recurring bills"
    ON recurring_bills FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recurring bills"
    ON recurring_bills FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recurring bills"
    ON recurring_bills FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recurring bills"
    ON recurring_bills FOR DELETE
    USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_recurring_bills_user ON recurring_bills(user_id);
CREATE INDEX idx_recurring_bills_account ON recurring_bills(bill_account_id);

-- ============================================
-- BILL PAYMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS bill_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recurring_bill_id UUID REFERENCES recurring_bills(id) ON DELETE SET NULL,
    bill_account_id UUID NOT NULL REFERENCES bill_accounts(id),
    category_id UUID NOT NULL REFERENCES bill_categories(id),
    title TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    currency TEXT DEFAULT 'BGN' NOT NULL,
    due_date DATE NOT NULL,
    is_paid BOOLEAN DEFAULT FALSE NOT NULL,
    paid_date DATE,
    is_overdue BOOLEAN DEFAULT FALSE NOT NULL,
    attachment_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE bill_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own payments"
    ON bill_payments FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payments"
    ON bill_payments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own payments"
    ON bill_payments FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own payments"
    ON bill_payments FOR DELETE
    USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_bill_payments_user ON bill_payments(user_id);
CREATE INDEX idx_bill_payments_due_date ON bill_payments(due_date);
CREATE INDEX idx_bill_payments_status ON bill_payments(is_paid, is_overdue);

-- ============================================
-- NOTIFICATION SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notification_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    enable_push BOOLEAN DEFAULT TRUE NOT NULL,
    days_before INTEGER[] DEFAULT '{3, 0}' NOT NULL,
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own notification settings"
    ON notification_settings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification settings"
    ON notification_settings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notification settings"
    ON notification_settings FOR UPDATE
    USING (auth.uid() = user_id);

-- ============================================
-- PUSH TOKENS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS push_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    device_type TEXT NOT NULL CHECK (device_type IN ('ios', 'android', 'web')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, token)
);

-- Enable RLS
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own push tokens"
    ON push_tokens FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own push tokens"
    ON push_tokens FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own push tokens"
    ON push_tokens FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own push tokens"
    ON push_tokens FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- SEED DEFAULT CATEGORIES (Bulgarian)
-- ============================================
INSERT INTO bill_categories (name, icon, color, is_default) VALUES
    ('Ток', 'lightning-bolt', '#FFC107', TRUE),
    ('Парно', 'fire', '#FF5722', TRUE),
    ('Вода', 'water-drop', '#2196F3', TRUE),
    ('Интернет', 'wifi', '#9C27B0', TRUE),
    ('Телефон', 'phone', '#4CAF50', TRUE),
    ('Наем', 'home-outline', '#795548', TRUE),
    ('Абонаменти', 'tag', '#E91E63', TRUE),
    ('Данъци', 'receipt', '#607607', TRUE),
    ('Застраховки', 'shield', '#00BCD4', TRUE),
    ('Други', 'help-circle', '#9E9E9E', TRUE)
ON CONFLICT DO NOTHING;

-- ============================================
-- TRIGGERS FOR updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

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

CREATE TRIGGER update_push_tokens_updated_at
    BEFORE UPDATE ON push_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCTION: Auto-create profile on signup
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, preferred_language, default_reminder_days_before, currency)
    VALUES (NEW.id, 'bg', 3, 'BGN');
    
    INSERT INTO notification_settings (user_id, enable_push, days_before)
    VALUES (NEW.id, TRUE, '{3, 0}');
    
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();
