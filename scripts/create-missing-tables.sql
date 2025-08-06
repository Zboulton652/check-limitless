-- Create any missing tables that might be needed

-- Create competitions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.competitions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  prize_image_url TEXT,
  entry_price DECIMAL(10,2) NOT NULL,
  max_entries INTEGER,
  current_entries INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('active', 'ended', 'draft')),
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  winner_id UUID REFERENCES public.users(id),
  terms_and_conditions TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create entries table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  competition_id UUID REFERENCES public.competitions(id) ON DELETE CASCADE NOT NULL,
  stripe_payment_intent_id TEXT,
  amount_paid DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create referrals table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  referee_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  earnings_percentage DECIMAL(5,2) DEFAULT 10.00,
  total_earned DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(referrer_id, referee_id)
);

-- Enable RLS on all tables
ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies for competitions
DROP POLICY IF EXISTS "Anyone can view active competitions" ON public.competitions;
CREATE POLICY "Anyone can view active competitions" ON public.competitions
  FOR SELECT USING (status = 'active' OR is_featured = TRUE);

-- Basic RLS policies for entries
DROP POLICY IF EXISTS "Users can view own entries" ON public.entries;
CREATE POLICY "Users can view own entries" ON public.entries
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create entries" ON public.entries;
CREATE POLICY "Users can create entries" ON public.entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Basic RLS policies for referrals
DROP POLICY IF EXISTS "Users can view own referrals" ON public.referrals;
CREATE POLICY "Users can view own referrals" ON public.referrals
  FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referee_id);

DROP POLICY IF EXISTS "System can create referrals" ON public.referrals;
CREATE POLICY "System can create referrals" ON public.referrals
  FOR INSERT WITH CHECK (true);
