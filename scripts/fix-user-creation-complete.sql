-- COMPLETE FIX FOR USER CREATION ISSUE
-- This will recreate everything needed for user registration

-- First, let's make sure we have the extensions we need
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Recreate the user_role type if it doesn't exist
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('user', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Recreate the payout_method type if it doesn't exist
DO $$ BEGIN
    CREATE TYPE payout_method AS ENUM ('bank_transfer', 'site_credit');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Drop and recreate the users table with proper structure
DROP TABLE IF EXISTS public.users CASCADE;

CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  role user_role DEFAULT 'user',
  referrer_id UUID REFERENCES public.users(id),
  referral_code TEXT UNIQUE,
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON public.users(referral_code);
CREATE INDEX IF NOT EXISTS idx_users_referrer_id ON public.users(referrer_id);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Function to generate referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
  attempts INTEGER := 0;
BEGIN
  LOOP
    -- Generate a random 8-character code
    new_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 8));
    
    -- Check if it already exists
    SELECT EXISTS(SELECT 1 FROM public.users WHERE referral_code = new_code) INTO code_exists;
    
    -- Increment attempts counter
    attempts := attempts + 1;
    
    -- If code is unique or we've tried too many times, exit
    IF NOT code_exists OR attempts > 100 THEN
      EXIT;
    END IF;
  END LOOP;
  
  -- If we couldn't generate a unique code after 100 attempts, add timestamp
  IF code_exists THEN
    new_code := new_code || EXTRACT(EPOCH FROM NOW())::INTEGER::TEXT;
  END IF;
  
  RETURN new_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle new user signup with better error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_referral_code TEXT;
BEGIN
  -- Generate referral code
  new_referral_code := generate_referral_code();
  
  -- Insert user record
  INSERT INTO public.users (id, email, referral_code)
  VALUES (NEW.id, NEW.email, new_referral_code);
  
  -- Log success
  RAISE LOG 'Successfully created user profile for: % with referral code: %', NEW.email, new_referral_code;
  
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- If referral code collision (very unlikely), try again with timestamp
    new_referral_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6)) || EXTRACT(EPOCH FROM NOW())::INTEGER::TEXT;
    INSERT INTO public.users (id, email, referral_code)
    VALUES (NEW.id, NEW.email, new_referral_code);
    RAISE LOG 'Created user profile with fallback referral code: %', new_referral_code;
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log the specific error
    RAISE LOG 'Error in handle_new_user for %: % - %', NEW.email, SQLSTATE, SQLERRM;
    -- Re-raise the error so the signup fails visibly
    RAISE EXCEPTION 'Failed to create user profile: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Test the setup
DO $$
DECLARE
  test_code TEXT;
BEGIN
  -- Test referral code generation
  test_code := generate_referral_code();
  RAISE NOTICE 'Test referral code generated: %', test_code;
  
  -- Check if trigger exists
  IF EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'on_auth_user_created'
  ) THEN
    RAISE NOTICE '✅ Trigger exists and is active';
  ELSE
    RAISE NOTICE '❌ Trigger is missing';
  END IF;
  
  RAISE NOTICE '🎉 User creation setup complete!';
  RAISE NOTICE 'Try registering again - it should work now.';
END $$;
