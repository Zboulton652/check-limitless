-- If registration still fails, we can create a user manually for testing
-- Replace the email below with your desired test email

DO $$
DECLARE
  test_email TEXT := 'your-test-email@example.com'; -- 👈 CHANGE THIS
  test_user_id UUID := gen_random_uuid();
  test_referral_code TEXT;
BEGIN
  -- Generate referral code
  test_referral_code := generate_referral_code();
  
  -- Create the user manually
  INSERT INTO public.users (
    id, 
    email, 
    referral_code,
    role,
    payout_method,
    site_credit,
    total_spent,
    total_dividends,
    total_referral_earnings
  ) VALUES (
    test_user_id,
    test_email,
    test_referral_code,
    'user'::user_role,
    'site_credit'::payout_method,
    0,
    0,
    0,
    0
  );
  
  RAISE NOTICE '✅ Manual user created successfully!';
  RAISE NOTICE 'Email: %', test_email;
  RAISE NOTICE 'ID: %', test_user_id;
  RAISE NOTICE 'Referral Code: %', test_referral_code;
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  Note: This user only exists in public.users';
  RAISE NOTICE '   They cannot log in until created in auth.users via Supabase Auth';
END $$;
