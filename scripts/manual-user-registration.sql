-- Function to manually register users when they sign up
-- Call this whenever someone registers (until we fix the trigger)

CREATE OR REPLACE FUNCTION manual_create_user(
  p_user_id UUID,
  p_email TEXT,
  p_referrer_code TEXT DEFAULT NULL
)
RETURNS TEXT AS $$
DECLARE
  new_referral_code TEXT;
  referrer_user_id UUID;
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
  
  RETURN new_referral_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Example usage:
-- SELECT manual_create_user('user-uuid-here', 'user@example.com', 'REFERRER_CODE');
