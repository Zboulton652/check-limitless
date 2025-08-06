-- Simple test to manually verify user creation works
-- This simulates what happens during registration

DO $$
DECLARE
  test_user_id UUID := gen_random_uuid();
  test_email TEXT := 'test-' || EXTRACT(EPOCH FROM NOW())::INTEGER || '@example.com';
  new_code TEXT;
BEGIN
  RAISE NOTICE 'Testing user creation with:';
  RAISE NOTICE 'ID: %', test_user_id;
  RAISE NOTICE 'Email: %', test_email;
  
  -- Generate referral code
  new_code := generate_referral_code();
  RAISE NOTICE 'Generated referral code: %', new_code;
  
  -- Try to insert a test user (we'll clean it up after)
  BEGIN
    INSERT INTO public.users (id, email, referral_code)
    VALUES (test_user_id, test_email, new_code);
    
    RAISE NOTICE '✅ SUCCESS: Test user created successfully!';
    
    -- Clean up the test user
    DELETE FROM public.users WHERE id = test_user_id;
    RAISE NOTICE '🧹 Test user cleaned up';
    
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE '❌ FAILED: %', SQLERRM;
      RAISE NOTICE 'SQLSTATE: %', SQLSTATE;
  END;
  
  RAISE NOTICE '';
  RAISE NOTICE '🎯 If you see SUCCESS above, registration should work!';
END $$;
