-- COMPLETE LIMITLESS X DATABASE REBUILD
-- Copy and paste this entire script into Supabase SQL Editor and run it
-- This will create everything from scratch

-- 1. NUCLEAR CLEANUP - Remove everything
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies
    FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
    END LOOP;
    
    -- Drop all triggers
    FOR r IN (SELECT trigger_name, event_object_table FROM information_schema.triggers WHERE trigger_schema = 'public') 
    LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || quote_ident(r.trigger_name) || ' ON public.' || quote_ident(r.event_object_table);
    END LOOP;
    
    -- Drop all functions
    FOR r IN (SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public' AND routine_type = 'FUNCTION') 
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS public.' || quote_ident(r.routine_name) || ' CASCADE';
    END LOOP;
END $$;

-- Drop tables in correct order
DROP TABLE IF EXISTS public.referrals CASCADE;
DROP TABLE IF EXISTS public.dividends CASCADE;
DROP TABLE IF EXISTS public.entries CASCADE;
DROP TABLE IF EXISTS public.competitions CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Drop custom types
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS payout_method CASCADE;
DROP TYPE IF EXISTS competition_status CASCADE;

-- 2. REBUILD EVERYTHING
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE payout_method AS ENUM ('bank_transfer', 'site_credit');
CREATE TYPE competition_status AS ENUM ('active', 'ended', 'draft');

-- 3. CREATE TABLES

-- Users table (no foreign key to auth.users to avoid issues)
CREATE TABLE public.users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  role user_role DEFAULT 'user',
  referrer_id UUID,
  referral_code TEXT UNIQUE NOT NULL,
  payout_method payout_method DEFAULT 'site_credit',
  bank_sort_code TEXT,
  bank_account_number TEXT,
  site_credit DECIMAL(10,2) DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  total_dividends DECIMAL(10,2) DEFAULT 0,
  total_referral_earnings DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Self-referencing foreign key for referrer
ALTER TABLE public.users 
ADD CONSTRAINT users_referrer_id_fkey 
FOREIGN KEY (referrer_id) REFERENCES public.users(id);

-- Competitions table
CREATE TABLE public.competitions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  prize_image_url TEXT,
  entry_price DECIMAL(10,2) NOT NULL,
  max_entries INTEGER,
  current_entries INTEGER DEFAULT 0,
  status competition_status DEFAULT 'draft',
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  winner_id UUID,
  terms_and_conditions TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Foreign key for winner
ALTER TABLE public.competitions 
ADD CONSTRAINT competitions_winner_id_fkey 
FOREIGN KEY (winner_id) REFERENCES public.users(id);

-- Entries table
CREATE TABLE public.entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  competition_id UUID NOT NULL,
  stripe_payment_intent_id TEXT,
  amount_paid DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
  FOREIGN KEY (competition_id) REFERENCES public.competitions(id) ON DELETE CASCADE
);

-- Dividends table
CREATE TABLE public.dividends (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Referrals table
CREATE TABLE public.referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL,
  referee_id UUID NOT NULL,
  earnings_percentage DECIMAL(5,2) DEFAULT 10.00,
  total_earned DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(referrer_id, referee_id),
  FOREIGN KEY (referrer_id) REFERENCES public.users(id) ON DELETE CASCADE,
  FOREIGN KEY (referee_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- 4. CREATE INDEXES
CREATE INDEX idx_users_referral_code ON public.users(referral_code);
CREATE INDEX idx_users_referrer_id ON public.users(referrer_id);
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_competitions_status ON public.competitions(status);
CREATE INDEX idx_competitions_featured ON public.competitions(is_featured);
CREATE INDEX idx_entries_user_id ON public.entries(user_id);
CREATE INDEX idx_entries_competition_id ON public.entries(competition_id);
CREATE INDEX idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX idx_referrals_referee_id ON public.referrals(referee_id);

-- 5. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dividends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- 6. CREATE RLS POLICIES

-- Users policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Competitions policies
CREATE POLICY "Anyone can view active competitions" ON public.competitions
  FOR SELECT USING (status = 'active' OR is_featured = TRUE);

CREATE POLICY "Admins can manage competitions" ON public.competitions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Entries policies
CREATE POLICY "Users can view own entries" ON public.entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create entries" ON public.entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all entries" ON public.entries
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Dividends policies
CREATE POLICY "Users can view own dividends" ON public.dividends
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage dividends" ON public.dividends
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Referrals policies
CREATE POLICY "Users can view own referrals" ON public.referrals
  FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referee_id);

CREATE POLICY "System can create referrals" ON public.referrals
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all referrals" ON public.referrals
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- 7. CREATE HELPER FUNCTIONS

-- Function to generate referral codes
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
  attempts INTEGER := 0;
BEGIN
  LOOP
    attempts := attempts + 1;
    new_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 8));
    
    SELECT EXISTS(SELECT 1 FROM public.users WHERE referral_code = new_code) INTO code_exists;
    
    IF NOT code_exists OR attempts > 50 THEN
      EXIT;
    END IF;
  END LOOP;
  
  -- If still not unique, append timestamp
  IF code_exists THEN
    new_code := new_code || EXTRACT(EPOCH FROM NOW())::INTEGER::TEXT;
  END IF;
  
  RETURN new_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create users manually (for registration)
CREATE OR REPLACE FUNCTION create_user_manually(
  p_user_id UUID,
  p_email TEXT,
  p_referrer_code TEXT DEFAULT NULL
)
RETURNS TABLE(
  user_id UUID,
  email TEXT,
  referral_code TEXT,
  referrer_found BOOLEAN
) AS $$
DECLARE
  new_referral_code TEXT;
  referrer_user_id UUID;
  referrer_found BOOLEAN := FALSE;
BEGIN
  -- Generate unique referral code
  new_referral_code := generate_referral_code();
  
  -- Find referrer if code provided
  IF p_referrer_code IS NOT NULL THEN
    SELECT u.id INTO referrer_user_id 
    FROM public.users u
    WHERE u.referral_code = p_referrer_code;
    
    IF referrer_user_id IS NOT NULL THEN
      referrer_found := TRUE;
    END IF;
  END IF;
  
  -- Insert user
  INSERT INTO public.users (
    id, email, referral_code, referrer_id, role
  ) VALUES (
    p_user_id, p_email, new_referral_code, referrer_user_id, 'user'
  );
  
  -- Create referral relationship if referrer exists
  IF referrer_user_id IS NOT NULL THEN
    INSERT INTO public.referrals (referrer_id, referee_id)
    VALUES (referrer_user_id, p_user_id);
  END IF;
  
  -- Return results
  RETURN QUERY SELECT p_user_id, p_email, new_referral_code, referrer_found;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. INSERT DEMO DATA

-- Create admin user
INSERT INTO public.users (
  id, email, referral_code, role
) VALUES (
  gen_random_uuid(),
  'admin@limitlessx.com',
  'ADMIN001',
  'admin'
);

-- Insert demo competitions
INSERT INTO public.competitions (
  title, description, entry_price, max_entries, status, end_date, 
  prize_image_url, terms_and_conditions, is_featured
) VALUES 
(
  'Win a Luxury Rolex Watch',
  'Enter for your chance to win a brand new Rolex Submariner worth £8,000. This iconic timepiece features a black dial, ceramic bezel, and automatic movement. Perfect for the discerning watch enthusiast.',
  5.00, 1000, 'active', NOW() + INTERVAL '30 days',
  '/placeholder.svg?height=400&width=600&text=Luxury+Rolex+Watch',
  'Must be 18+ to enter. Winner will be selected randomly using a provably fair system. Prize cannot be exchanged for cash. UK residents only.',
  TRUE
),
(
  'iPhone 15 Pro Max Giveaway',
  'Win the latest iPhone 15 Pro Max 256GB in Titanium Blue. Includes original packaging, charger, and full 1-year Apple warranty. The most advanced iPhone ever created.',
  2.50, 2000, 'active', NOW() + INTERVAL '14 days',
  '/placeholder.svg?height=400&width=600&text=iPhone+15+Pro+Max',
  'UK residents only. Winner must provide valid ID for verification. Device will be shipped within 5 business days of winner confirmation.',
  FALSE
),
(
  '£1000 Cash Prize',
  'Pure cash prize - £1000 transferred directly to your bank account or PayPal. No strings attached, no conditions. Use it however you want!',
  10.00, 500, 'active', NOW() + INTERVAL '7 days',
  '/placeholder.svg?height=400&width=600&text=£1000+Cash+Prize',
  'Winner will receive payment within 5 business days of verification. Must provide valid bank details or PayPal email.',
  FALSE
),
(
  'Luxury Perfume Collection',
  'Win an exclusive collection of 5 luxury perfumes including Chanel No.5, Tom Ford Black Orchid, and Creed Aventus. Total value over £500.',
  3.00, 800, 'active', NOW() + INTERVAL '21 days',
  '/placeholder.svg?height=400&width=600&text=Luxury+Perfume+Collection',
  'Collection includes full-size bottles. Must be 18+ to enter. Shipping included to UK addresses.',
  FALSE
);

-- 9. VERIFICATION AND SUCCESS MESSAGE
DO $$
DECLARE
  table_count INTEGER;
  competition_count INTEGER;
  user_count INTEGER;
  admin_user_id UUID;
  admin_email TEXT;
BEGIN
  -- Count tables
  SELECT COUNT(*) INTO table_count 
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
    AND table_name IN ('users', 'competitions', 'entries', 'dividends', 'referrals');
  
  -- Count data
  SELECT COUNT(*) INTO competition_count FROM public.competitions;
  SELECT COUNT(*) INTO user_count FROM public.users;
  
  -- Get admin user details
  SELECT id, email INTO admin_user_id, admin_email 
  FROM public.users 
  WHERE role = 'admin' 
  LIMIT 1;
  
  -- Success message
  RAISE NOTICE '';
  RAISE NOTICE '🎉 LIMITLESS X DATABASE REBUILD COMPLETE! 🎉';
  RAISE NOTICE '=============================================';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Tables created: %', table_count;
  RAISE NOTICE '✅ Demo competitions: %', competition_count;
  RAISE NOTICE '✅ Users created: %', user_count;
  RAISE NOTICE '✅ RLS policies: Active';
  RAISE NOTICE '✅ Helper functions: Ready';
  RAISE NOTICE '';
  RAISE NOTICE '👤 ADMIN USER CREATED:';
  RAISE NOTICE '   Email: %', admin_email;
  RAISE NOTICE '   ID: %', admin_user_id;
  RAISE NOTICE '   Referral Code: ADMIN001';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 NEXT STEPS:';
  RAISE NOTICE '1. Go to Supabase Dashboard > Authentication > Users';
  RAISE NOTICE '2. Click "Add User"';
  RAISE NOTICE '3. Email: %', admin_email;
  RAISE NOTICE '4. User ID: %', admin_user_id;
  RAISE NOTICE '5. Set a password';
  RAISE NOTICE '6. Email Confirm: TRUE';
  RAISE NOTICE '7. Save and you can log in immediately!';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Your platform is ready to use!';
END $$;
