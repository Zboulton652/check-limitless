-- Create your admin user (no foreign key constraints now)
-- Replace with your actual email

DO $$
DECLARE
  user_email TEXT := 'admin@limitlessx.com'; -- 👈 CHANGE THIS TO YOUR EMAIL
  user_id UUID := gen_random_uuid();
  referral_code TEXT;
BEGIN
  -- Generate unique referral code
  LOOP
    referral_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT || user_id::TEXT) FROM 1 FOR 8));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.users WHERE referral_code = referral_code);
  END LOOP;
  
  -- Insert admin user
  INSERT INTO public.users (
    id, email, referral_code, role
  ) VALUES (
    user_id, user_email, referral_code, 'admin'
  );
  
  RAISE NOTICE '🎉 ADMIN USER CREATED!';
  RAISE NOTICE '====================';
  RAISE NOTICE 'Email: %', user_email;
  RAISE NOTICE 'ID: %', user_id;
  RAISE NOTICE 'Referral Code: %', referral_code;
  RAISE NOTICE 'Role: admin';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 NEXT STEPS:';
  RAISE NOTICE '1. Go to Supabase Dashboard > Authentication > Users';
  RAISE NOTICE '2. Click "Add User"';
  RAISE NOTICE '3. Email: %', user_email;
  RAISE NOTICE '4. User ID: %', user_id;
  RAISE NOTICE '5. Set a password';
  RAISE NOTICE '6. Email Confirm: TRUE';
  RAISE NOTICE '7. Save and you can log in!';
END $$;
