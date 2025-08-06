-- Create your first user manually
-- Replace the details below with your actual information

DO $$
DECLARE
  user_email TEXT := 'your-email@example.com'; -- 👈 CHANGE THIS
  user_id UUID := gen_random_uuid();
  referral_code TEXT := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
BEGIN
  -- Insert your user
  INSERT INTO public.users (
    id, email, referral_code, role
  ) VALUES (
    user_id, user_email, referral_code, 'admin'
  );
  
  RAISE NOTICE '🎉 USER CREATED SUCCESSFULLY!';
  RAISE NOTICE '========================';
  RAISE NOTICE 'Email: %', user_email;
  RAISE NOTICE 'ID: %', user_id;
  RAISE NOTICE 'Referral Code: %', referral_code;
  RAISE NOTICE 'Role: admin';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  IMPORTANT: This user exists in the database but';
  RAISE NOTICE '   you still need to create the auth account in Supabase';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Next steps:';
  RAISE NOTICE '1. Go to Supabase Dashboard > Authentication > Users';
  RAISE NOTICE '2. Click "Add User"';
  RAISE NOTICE '3. Use email: %', user_email;
  RAISE NOTICE '4. Use ID: %', user_id;
  RAISE NOTICE '5. Set a password';
  RAISE NOTICE '6. Then you can log in!';
END $$;
