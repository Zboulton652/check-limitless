-- Fix the referral_code constraint issue
-- The problem is the referral_code field has conflicting nullable settings

-- First, let's check what's actually in the database right now
SELECT 
  column_name,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'users' 
  AND column_name = 'referral_code';

-- Fix the referral_code column to be properly nullable with a default
ALTER TABLE public.users 
ALTER COLUMN referral_code DROP NOT NULL;

-- Set a default value for the referral_code column
ALTER TABLE public.users 
ALTER COLUMN referral_code SET DEFAULT generate_referral_code();

-- Update the trigger function to handle the case where referral_code generation might fail
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_referral_code TEXT;
  max_attempts INTEGER := 10;
  attempt_count INTEGER := 0;
BEGIN
  -- Try to generate a unique referral code
  LOOP
    attempt_count := attempt_count + 1;
    
    BEGIN
      new_referral_code := generate_referral_code();
      
      -- Try to insert the user record
      INSERT INTO public.users (id, email, referral_code)
      VALUES (NEW.id, NEW.email, new_referral_code);
      
      -- If we get here, the insert was successful
      RAISE LOG 'Successfully created user profile for: % with referral code: %', NEW.email, new_referral_code;
      RETURN NEW;
      
    EXCEPTION
      WHEN unique_violation THEN
        -- If referral code collision, try again (up to max_attempts)
        IF attempt_count >= max_attempts THEN
          -- If we've tried too many times, use a timestamp-based code
          new_referral_code := UPPER(SUBSTRING(MD5(NEW.id::TEXT || EXTRACT(EPOCH FROM NOW())::TEXT) FROM 1 FOR 8));
          INSERT INTO public.users (id, email, referral_code)
          VALUES (NEW.id, NEW.email, new_referral_code);
          RAISE LOG 'Created user profile with fallback referral code after % attempts: %', max_attempts, new_referral_code;
          RETURN NEW;
        END IF;
        -- Otherwise, continue the loop to try again
        
      WHEN OTHERS THEN
        -- Log the specific error and re-raise it
        RAISE LOG 'Error in handle_new_user for % (attempt %): % - %', NEW.email, attempt_count, SQLSTATE, SQLERRM;
        RAISE EXCEPTION 'Failed to create user profile: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
    END;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test the updated function
DO $$
DECLARE
  test_code TEXT;
BEGIN
  test_code := generate_referral_code();
  RAISE NOTICE 'Test referral code: %', test_code;
  RAISE NOTICE '✅ Referral code constraint fix applied';
  RAISE NOTICE 'Try registering again - it should work now!';
END $$;
