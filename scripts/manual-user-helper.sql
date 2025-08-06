-- Helper function for creating users manually (for when people register)
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
  LOOP
    new_referral_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT || p_user_id::TEXT) FROM 1 FOR 8));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.users WHERE referral_code = new_referral_code);
  END LOOP;
  
  -- Find referrer if code provided
  IF p_referrer_code IS NOT NULL THEN
    SELECT id INTO referrer_user_id 
    FROM public.users 
    WHERE referral_code = p_referrer_code;
    
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

-- Example usage:
-- SELECT * FROM create_user_manually('uuid-here', 'user@example.com', 'REFERCODE');

RAISE NOTICE '✅ Manual user creation helper ready!';
