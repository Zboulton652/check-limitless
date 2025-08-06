-- Make sure the referral_code column is properly set up
ALTER TABLE public.users 
ALTER COLUMN referral_code DROP NOT NULL;

-- Then add it back with a default
ALTER TABLE public.users 
ALTER COLUMN referral_code SET DEFAULT generate_referral_code();

-- Now make it NOT NULL again
ALTER TABLE public.users 
ALTER COLUMN referral_code SET NOT NULL;

-- Recreate the function with better error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_referral_code TEXT;
BEGIN
  -- Generate a unique referral code
  new_referral_code := generate_referral_code();
  
  -- Insert the user record
  INSERT INTO public.users (id, email, referral_code)
  VALUES (NEW.id, NEW.email, new_referral_code);
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error (this will appear in Supabase logs)
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    -- Re-raise the error so registration fails visibly
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Test the function manually (optional)
-- SELECT generate_referral_code();
