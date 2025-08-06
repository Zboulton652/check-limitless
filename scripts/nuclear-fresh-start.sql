-- NUCLEAR FRESH START - Remove everything and rebuild
-- This handles all the dependency issues properly

-- 1. First, disable RLS on all tables to avoid permission issues
ALTER TABLE IF EXISTS public.referrals DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.dividends DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.competitions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;

-- 2. Drop all policies first
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
    END LOOP;
END $$;

-- 3. Drop all triggers
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT trigger_name, event_object_table FROM information_schema.triggers WHERE trigger_schema = 'public') 
    LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || quote_ident(r.trigger_name) || ' ON public.' || quote_ident(r.event_object_table);
    END LOOP;
END $$;

-- 4. Drop all functions
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public' AND routine_type = 'FUNCTION') 
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS public.' || quote_ident(r.routine_name) || ' CASCADE';
    END LOOP;
END $$;

-- 5. Drop tables in correct order (respecting foreign keys)
DROP TABLE IF EXISTS public.referrals CASCADE;
DROP TABLE IF EXISTS public.dividends CASCADE;
DROP TABLE IF EXISTS public.entries CASCADE;
DROP TABLE IF EXISTS public.competitions CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- 6. Drop custom types
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS payout_method CASCADE;
DROP TYPE IF EXISTS competition_status CASCADE;

-- 7. Now rebuild everything from scratch
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create types
CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE payout_method AS ENUM ('bank_transfer', 'site_credit');
CREATE TYPE competition_status AS ENUM ('active', 'ended', 'draft');

-- 8. Create users table (NO foreign key to auth.users for now)
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

-- Add self-referencing foreign key after table creation
ALTER TABLE public.users 
ADD CONSTRAINT users_referrer_id_fkey 
FOREIGN KEY (referrer_id) REFERENCES public.users(id);

-- 9. Create competitions table
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

-- Add foreign key after table creation
ALTER TABLE public.competitions 
ADD CONSTRAINT competitions_winner_id_fkey 
FOREIGN KEY (winner_id) REFERENCES public.users(id);

-- 10. Create entries table
CREATE TABLE public.entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  competition_id UUID NOT NULL,
  stripe_payment_intent_id TEXT,
  amount_paid DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign keys after table creation
ALTER TABLE public.entries 
ADD CONSTRAINT entries_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.entries 
ADD CONSTRAINT entries_competition_id_fkey 
FOREIGN KEY (competition_id) REFERENCES public.competitions(id) ON DELETE CASCADE;

-- 11. Create dividends table
CREATE TABLE public.dividends (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key after table creation
ALTER TABLE public.dividends 
ADD CONSTRAINT dividends_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- 12. Create referrals table
CREATE TABLE public.referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL,
  referee_id UUID NOT NULL,
  earnings_percentage DECIMAL(5,2) DEFAULT 10.00,
  total_earned DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(referrer_id, referee_id)
);

-- Add foreign keys after table creation
ALTER TABLE public.referrals 
ADD CONSTRAINT referrals_referrer_id_fkey 
FOREIGN KEY (referrer_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.referrals 
ADD CONSTRAINT referrals_referee_id_fkey 
FOREIGN KEY (referee_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- 13. Create indexes
CREATE INDEX idx_users_referral_code ON public.users(referral_code);
CREATE INDEX idx_users_referrer_id ON public.users(referrer_id);
CREATE INDEX idx_competitions_status ON public.competitions(status);
CREATE INDEX idx_competitions_featured ON public.competitions(is_featured);
CREATE INDEX idx_entries_user_id ON public.entries(user_id);
CREATE INDEX idx_entries_competition_id ON public.entries(competition_id);
CREATE INDEX idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX idx_referrals_referee_id ON public.referrals(referee_id);

-- 14. Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dividends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- 15. Create RLS policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Anyone can view active competitions" ON public.competitions
  FOR SELECT USING (status = 'active' OR is_featured = TRUE);

CREATE POLICY "Users can view own entries" ON public.entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create entries" ON public.entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own dividends" ON public.dividends
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own referrals" ON public.referrals
  FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referee_id);

-- 16. Insert demo competitions
INSERT INTO public.competitions (
  title, description, entry_price, max_entries, status, end_date, 
  prize_image_url, terms_and_conditions, is_featured
) VALUES 
(
  'Win a Luxury Rolex Watch',
  'Enter for your chance to win a brand new Rolex Submariner worth £8,000. This iconic timepiece features a black dial, ceramic bezel, and automatic movement.',
  5.00, 1000, 'active', NOW() + INTERVAL '30 days',
  '/placeholder.svg?height=400&width=600&text=Luxury+Rolex+Watch',
  'Must be 18+ to enter. Winner selected randomly. UK residents only.',
  TRUE
),
(
  'iPhone 15 Pro Max Giveaway',
  'Win the latest iPhone 15 Pro Max 256GB in Titanium Blue. Includes original packaging and full warranty.',
  2.50, 2000, 'active', NOW() + INTERVAL '14 days',
  '/placeholder.svg?height=400&width=600&text=iPhone+15+Pro+Max',
  'UK residents only. Winner must provide valid ID.',
  FALSE
),
(
  '£1000 Cash Prize',
  'Pure cash prize - £1000 transferred directly to your account. No strings attached!',
  10.00, 500, 'active', NOW() + INTERVAL '7 days',
  '/placeholder.svg?height=400&width=600&text=£1000+Cash+Prize',
  'Winner receives payment within 5 business days.',
  FALSE
);

-- 17. Success message
DO $$
BEGIN
  RAISE NOTICE '🎉 NUCLEAR FRESH START COMPLETE!';
  RAISE NOTICE '===============================';
  RAISE NOTICE '✅ All old data wiped';
  RAISE NOTICE '✅ All tables recreated';
  RAISE NOTICE '✅ Demo competitions added';
  RAISE NOTICE '✅ RLS policies active';
  RAISE NOTICE '✅ No foreign key to auth.users';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Ready to create your first user!';
END $$;
