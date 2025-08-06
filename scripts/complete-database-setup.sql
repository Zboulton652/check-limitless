-- COMPLETE LIMITLESS X DATABASE SETUP
-- Run this single script to set up everything at once

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('user', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payout_method AS ENUM ('bank_transfer', 'site_credit');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE competition_status AS ENUM ('active', 'ended', 'draft');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  role user_role DEFAULT 'user',
  referrer_id UUID REFERENCES public.users(id),
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

-- Competitions table
CREATE TABLE IF NOT EXISTS public.competitions (
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
  winner_id UUID REFERENCES public.users(id),
  terms_and_conditions TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Entries table
CREATE TABLE IF NOT EXISTS public.entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  competition_id UUID REFERENCES public.competitions(id) ON DELETE CASCADE NOT NULL,
  stripe_payment_intent_id TEXT,
  amount_paid DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dividends table
CREATE TABLE IF NOT EXISTS public.dividends (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Referrals table
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  referee_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  earnings_percentage DECIMAL(5,2) DEFAULT 10.00,
  total_earned DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(referrer_id, referee_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON public.users(referral_code);
CREATE INDEX IF NOT EXISTS idx_users_referrer_id ON public.users(referrer_id);
CREATE INDEX IF NOT EXISTS idx_competitions_status ON public.competitions(status);
CREATE INDEX IF NOT EXISTS idx_competitions_featured ON public.competitions(is_featured);
CREATE INDEX IF NOT EXISTS idx_entries_user_id ON public.entries(user_id);
CREATE INDEX IF NOT EXISTS idx_entries_competition_id ON public.entries(competition_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referee_id ON public.referrals(referee_id);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dividends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Anyone can view active competitions" ON public.competitions;
DROP POLICY IF EXISTS "Admins can manage competitions" ON public.competitions;
DROP POLICY IF EXISTS "Users can view own entries" ON public.entries;
DROP POLICY IF EXISTS "Users can create entries" ON public.entries;
DROP POLICY IF EXISTS "Users can view own dividends" ON public.dividends;
DROP POLICY IF EXISTS "Admins can manage dividends" ON public.dividends;
DROP POLICY IF EXISTS "Users can view own referrals" ON public.referrals;
DROP POLICY IF EXISTS "System can create referrals" ON public.referrals;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Anyone can view active competitions" ON public.competitions
  FOR SELECT USING (
    status = 'active' OR 
    is_featured = TRUE OR 
    auth.uid() IN (
      SELECT id FROM public.users WHERE role = 'admin'
    )
  );

CREATE POLICY "Admins can manage competitions" ON public.competitions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can view own entries" ON public.entries
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() IN (
    SELECT id FROM public.users WHERE role = 'admin'
  ));

CREATE POLICY "Users can create entries" ON public.entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own dividends" ON public.dividends
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() IN (
    SELECT id FROM public.users WHERE role = 'admin'
  ));

CREATE POLICY "Admins can manage dividends" ON public.dividends
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can view own referrals" ON public.referrals
  FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referee_id OR auth.uid() IN (
    SELECT id FROM public.users WHERE role = 'admin'
  ));

CREATE POLICY "System can create referrals" ON public.referrals
  FOR INSERT WITH CHECK (true);

-- Function to generate referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    new_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
    
    SELECT EXISTS(SELECT 1 FROM public.users WHERE referral_code = new_code) INTO code_exists;
    
    IF NOT code_exists THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, referral_code)
  VALUES (
    NEW.id,
    NEW.email,
    generate_referral_code()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update competition entry count and user stats
CREATE OR REPLACE FUNCTION update_competition_entries()
RETURNS TRIGGER AS $$
BEGIN
  -- Update competition entry count
  UPDATE public.competitions
  SET current_entries = current_entries + 1,
      updated_at = NOW()
  WHERE id = NEW.competition_id;
  
  -- Update user total spent
  UPDATE public.users
  SET total_spent = total_spent + NEW.amount_paid,
      updated_at = NOW()
  WHERE id = NEW.user_id;
  
  -- Update referrer earnings if user has a referrer
  UPDATE public.referrals
  SET total_earned = total_earned + (NEW.amount_paid * earnings_percentage / 100)
  WHERE referee_id = NEW.user_id;
  
  -- Update referrer's total referral earnings
  UPDATE public.users
  SET total_referral_earnings = total_referral_earnings + (NEW.amount_paid * 0.10),
      updated_at = NOW()
  WHERE id IN (
    SELECT referrer_id FROM public.referrals WHERE referee_id = NEW.user_id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_entry_created ON public.entries;

-- Create trigger for new entry
CREATE TRIGGER on_entry_created
  AFTER INSERT ON public.entries
  FOR EACH ROW EXECUTE FUNCTION update_competition_entries();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create update triggers for tables with updated_at columns
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_competitions_updated_at ON public.competitions;
CREATE TRIGGER update_competitions_updated_at
  BEFORE UPDATE ON public.competitions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to ensure only one competition is featured at a time
CREATE OR REPLACE FUNCTION ensure_single_featured_competition()
RETURNS TRIGGER AS $$
BEGIN
  -- If setting a competition as featured, unfeature all others
  IF NEW.is_featured = TRUE THEN
    UPDATE public.competitions 
    SET is_featured = FALSE 
    WHERE id != NEW.id AND is_featured = TRUE;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for featured competition
DROP TRIGGER IF EXISTS on_competition_featured ON public.competitions;
CREATE TRIGGER on_competition_featured
  BEFORE UPDATE ON public.competitions
  FOR EACH ROW 
  WHEN (NEW.is_featured IS DISTINCT FROM OLD.is_featured)
  EXECUTE FUNCTION ensure_single_featured_competition();

-- Insert demo competitions
INSERT INTO public.competitions (
  title,
  description,
  entry_price,
  max_entries,
  status,
  end_date,
  prize_image_url,
  terms_and_conditions,
  is_featured
) 
SELECT * FROM (VALUES 
  (
    'Win a Luxury Rolex Watch',
    'Enter for your chance to win a brand new Rolex Submariner worth £8,000. This iconic timepiece features a black dial, ceramic bezel, and automatic movement. Perfect for the discerning watch enthusiast.',
    5.00,
    1000,
    'active'::competition_status,
    NOW() + INTERVAL '30 days',
    '/placeholder.svg?height=400&width=600&text=Luxury+Rolex+Watch',
    'Must be 18+ to enter. Winner will be selected randomly using a provably fair system. Prize cannot be exchanged for cash. UK residents only.',
    TRUE
  ),
  (
    'iPhone 15 Pro Max Giveaway',
    'Win the latest iPhone 15 Pro Max 256GB in Titanium Blue. Includes original packaging, charger, and full 1-year Apple warranty. The most advanced iPhone ever created.',
    2.50,
    2000,
    'active'::competition_status,
    NOW() + INTERVAL '14 days',
    '/placeholder.svg?height=400&width=600&text=iPhone+15+Pro+Max',
    'UK residents only. Winner must provide valid ID for verification. Device will be shipped within 5 business days of winner confirmation.',
    FALSE
  ),
  (
    '£1000 Cash Prize',
    'Pure cash prize - £1000 transferred directly to your bank account or PayPal. No strings attached, no conditions. Use it however you want!',
    10.00,
    500,
    'active'::competition_status,
    NOW() + INTERVAL '7 days',
    '/placeholder.svg?height=400&width=600&text=£1000+Cash+Prize',
    'Winner will receive payment within 5 business days of verification. Must provide valid bank details or PayPal email.',
    FALSE
  ),
  (
    'Luxury Perfume Collection',
    'Win an exclusive collection of 5 luxury perfumes including Chanel No.5, Tom Ford Black Orchid, and Creed Aventus. Total value over £500.',
    3.00,
    800,
    'active'::competition_status,
    NOW() + INTERVAL '21 days',
    '/placeholder.svg?height=400&width=600&text=Luxury+Perfume+Collection',
    'Collection includes full-size bottles. Must be 18+ to enter. Shipping included to UK addresses.',
    FALSE
  )
) AS new_competitions(title, description, entry_price, max_entries, status, end_date, prize_image_url, terms_and_conditions, is_featured)
WHERE NOT EXISTS (
  SELECT 1 FROM public.competitions WHERE title = new_competitions.title
);

-- Final verification and success message
DO $$
DECLARE
    table_count INTEGER;
    function_count INTEGER;
    competition_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('users', 'competitions', 'entries', 'dividends', 'referrals');
    
    SELECT COUNT(*) INTO function_count 
    FROM information_schema.routines 
    WHERE routine_schema = 'public' 
    AND routine_name IN ('generate_referral_code', 'handle_new_user', 'update_competition_entries');
    
    SELECT COUNT(*) INTO competition_count FROM public.competitions;
    
    RAISE NOTICE '🎉 LIMITLESS X DATABASE SETUP COMPLETE! 🎉';
    RAISE NOTICE 'Tables created: %', table_count;
    RAISE NOTICE 'Functions created: %', function_count;
    RAISE NOTICE 'Demo competitions: %', competition_count;
    RAISE NOTICE '';
    RAISE NOTICE '✅ Your database is ready!';
    RAISE NOTICE 'Try registering again - it should work now!';
END $$;
