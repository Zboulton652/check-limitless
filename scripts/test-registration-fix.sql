-- Test the registration fix without requiring superuser privileges
-- Run this to verify everything is working

DO $$
BEGIN
  RAISE NOTICE '🔍 Testing registration components...';
  RAISE NOTICE '================================';
  
  -- Test 1: Referral code generation
  BEGIN
    PERFORM generate_referral_code();
    RAISE NOTICE '✅ Referral code generation: WORKING';
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE '❌ Referral code generation: FAILED - %', SQLERRM;
  END;
  
  -- Test 2: Users table access
  BEGIN
    PERFORM COUNT(*) FROM public.users;
    RAISE NOTICE '✅ Users table access: WORKING';
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE '❌ Users table access: FAILED - %', SQLERRM;
  END;
  
  -- Test 3: Check trigger exists
  IF EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'on_auth_user_created'
  ) THEN
    RAISE NOTICE '✅ User creation trigger: ACTIVE';
  ELSE
    RAISE NOTICE '❌ User creation trigger: MISSING';
  END IF;
  
  -- Test 4: Check functions exist
  IF EXISTS (
    SELECT 1 FROM information_schema.routines 
    WHERE routine_name = 'handle_new_user' AND routine_schema = 'public'
  ) THEN
    RAISE NOTICE '✅ User handler function: INSTALLED';
  ELSE
    RAISE NOTICE '❌ User handler function: MISSING';
  END IF;
  
  -- Test 5: Generate sample referral codes
  DECLARE
    code1 TEXT := generate_referral_code();
    code2 TEXT := generate_referral_code();
    code3 TEXT := generate_referral_code();
  BEGIN
    RAISE NOTICE '✅ Sample referral codes: %, %, %', code1, code2, code3;
  END;
  
  RAISE NOTICE '';
  RAISE NOTICE '🎯 REGISTRATION TEST COMPLETE';
  RAISE NOTICE '============================';
  RAISE NOTICE 'If all tests show ✅, try registering now!';
  RAISE NOTICE 'The 500 error should be resolved.';
END $$;
